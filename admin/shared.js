/**
 * FARTIR PASS ENGINE — SHARED LOGIC
 * Laboratório de Cortes · Contagem MG
 * 
 * Regra dos Slots Rotativos (Menor Número Disponível):
 * - Vagas ativas: convite1, convite2, convite3...
 * - Quando um convite expira (30 dias) ou conclui ambos os cortes,
 *   a vaga é liberada automaticamente para o próximo cliente!
 */

'use strict';

const FARTIR_CONFIG = {
  STORE_KEY: 'fartir_pass_tickets_v1',
  ADMIN_PIN: '2468',             // Senha do Matheus
  OWNER_PHONE: '5531993811525',   // WhatsApp da Fartir
  CONVITE_DURATION_MS: 30 * 24 * 60 * 60 * 1000 // 30 dias corridos
};

// Base inicial zerada para produção (os convites começam do zero pelo Admin)
const INITIAL_TICKETS = [];

function getFartirDB() {
  try {
    const raw = localStorage.getItem(FARTIR_CONFIG.STORE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.tickets)) {
        return data;
      }
    }
  } catch (e) {
    console.error('Erro ao ler base local:', e);
  }

  const fresh = {
    tickets: INITIAL_TICKETS,
    timeOffset: 0
  };
  saveFartirDB(fresh);
  return fresh;
}

function saveFartirDB(data) {
  try {
    localStorage.setItem(FARTIR_CONFIG.STORE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Erro ao salvar base local:', e);
  }
}

function fartirNow() {
  const db = getFartirDB();
  return Date.now() + (db.timeOffset || 0);
}

function getTicketBySlug(slug) {
  const db = getFartirDB();
  return db.tickets.find(t => t.slug === slug) || null;
}

function isTicketExpired(t) {
  if (!t || !t.activatedAt) return false;
  return fartirNow() > (t.activatedAt + FARTIR_CONFIG.CONVITE_DURATION_MS);
}

function getTicketExpirationDate(t) {
  if (!t || !t.activatedAt) return null;
  return t.activatedAt + FARTIR_CONFIG.CONVITE_DURATION_MS;
}

/**
 * ALGORITMO INTELIGENTE: MENOR NÚMERO DISPONÍVEL
 * Varre as vagas (1, 2, 3...) e acha a menor vaga que não está em uso ativo.
 * Uma vaga está liberada se:
 * - O convite anterior expirou (30 dias)
 * - OU ambos os cortes já foram concluídos
 * - OU o convite foi cancelado/excluído
 */
function getNextAvailableNumber() {
  const db = getFartirDB();
  const occupiedNumbers = new Set();

  db.tickets.forEach(t => {
    const finished = !!(t.friendAttendedAt && t.inviterAttendedAt);
    const expired = isTicketExpired(t);

    // Se ainda está em andamento (não acabou os 30 dias e nem ambos cortaram), a vaga está ocupada
    if (!finished && !expired) {
      occupiedNumbers.add(t.number);
    }
  });

  let n = 1;
  while (occupiedNumbers.has(n)) {
    n++;
  }
  return n;
}

/**
 * CRIAÇÃO 100% AUTOMÁTICA
 * O Matheus só passa o nome e o WhatsApp. O número vem automático!
 */
function createTicket(name, phone) {
  const db = getFartirDB();
  const slotNum = getNextAvailableNumber();
  const slug = `convite${slotNum}`;

  // Se já havia um convite antigo finalizado/expirado ocupando esse slug, ele é substituído pelo novo titular
  db.tickets = db.tickets.filter(t => t.slug !== slug);

  const cleanPhone = (phone || '').replace(/\D/g, '');
  const newTicket = {
    slug,
    number: slotNum,
    inviterName: name.trim(),
    inviterPhone: cleanPhone ? (cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone) : '',
    createdAt: fartirNow(),
    activatedAt: null,
    friendName: null,
    friendAttendedAt: null,
    inviterAttendedAt: null
  };

  db.tickets.push(newTicket);
  // Mantém ordenado pelo número da vaga
  db.tickets.sort((a, b) => a.number - b.number);
  saveFartirDB(db);
  return newTicket;
}

function deleteTicket(slug) {
  const db = getFartirDB();
  db.tickets = db.tickets.filter(t => t.slug !== slug);
  saveFartirDB(db);
}

function activateTicket(slug) {
  const db = getFartirDB();
  const t = db.tickets.find(x => x.slug === slug);
  if (!t) return false;
  if (!t.activatedAt) {
    t.activatedAt = fartirNow();
    saveFartirDB(db);
  }
  return true;
}

function validateFriendCut(slug, friendName, pin) {
  if (pin !== FARTIR_CONFIG.ADMIN_PIN) throw new Error('Senha incorreta!');
  const db = getFartirDB();
  const t = db.tickets.find(x => x.slug === slug);
  if (!t) throw new Error('Convite não encontrado!');
  if (t.friendAttendedAt) throw new Error('A vaga deste amigo já foi utilizada!');

  t.friendName = (friendName || 'Amigo').trim();
  t.friendAttendedAt = fartirNow();
  saveFartirDB(db);
  return t;
}

function validateInviterCut(slug, pin) {
  if (pin !== FARTIR_CONFIG.ADMIN_PIN) throw new Error('Senha incorreta!');
  const db = getFartirDB();
  const t = db.tickets.find(x => x.slug === slug);
  if (!t) throw new Error('Convite não encontrado!');
  if (!t.friendAttendedAt) throw new Error('O amigo ainda não cortou. Benefício ainda bloqueado.');
  if (t.inviterAttendedAt) throw new Error('O titular já utilizou o benefício.');

  t.inviterAttendedAt = fartirNow();
  saveFartirDB(db);
  return t;
}

function formatFartirDate(timestamp) {
  if (!timestamp) return '--/--/----';
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp));
}
