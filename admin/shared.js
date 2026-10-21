/**
 * FARTIR PASS ENGINE — NUVEM SUPABASE + CACHE LOCAL
 * Laboratório de Cortes · Contagem MG
 * 
 * Agora 100% sincronizado na nuvem:
 * - O convite criado no celular do Matheus aparece em qualquer celular do mundo!
 * - Validações e ativações atualizam em tempo real para todos.
 */

'use strict';

const FARTIR_CONFIG = {
  SUPABASE_URL: 'https://uwqzwgmcevbldwwehzhg.supabase.co/rest/v1',
  SUPABASE_KEY: 'sb_publishable_dlfXN0EjA7zDZgzkIvSfDA_zyw2bxZn',
  STORE_KEY: 'fartir_pass_tickets_v1',
  ADMIN_PIN: 'admin',            // Senha do painel e validação
  OWNER_PHONE: '5531993811525',   // WhatsApp da Fartir
  CONVITE_DURATION_MS: 30 * 24 * 60 * 60 * 1000 // 30 dias corridos
};

function getHeaders() {
  return {
    'apikey': FARTIR_CONFIG.SUPABASE_KEY,
    'Authorization': 'Bearer ' + FARTIR_CONFIG.SUPABASE_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
}

// Converte do banco (snake_case) para o site (camelCase)
function mapFromDb(row) {
  if (!row) return null;
  return {
    slug: row.slug,
    number: row.number,
    inviterName: row.inviter_name || '',
    inviterPhone: row.inviter_phone || '',
    createdAt: Number(row.created_at) || Date.now(),
    activatedAt: row.activated_at ? Number(row.activated_at) : null,
    friendName: row.friend_name || null,
    friendAttendedAt: row.friend_attended_at ? Number(row.friend_attended_at) : null,
    inviterAttendedAt: row.inviter_attended_at ? Number(row.inviter_attended_at) : null
  };
}

// Converte do site para o banco
function mapToDb(t) {
  return {
    slug: t.slug,
    number: t.number,
    inviter_name: t.inviterName,
    inviter_phone: t.inviterPhone || '',
    created_at: t.createdAt || Date.now(),
    activated_at: t.activatedAt || null,
    friend_name: t.friendName || null,
    friend_attended_at: t.friendAttendedAt || null,
    inviter_attended_at: t.inviterAttendedAt || null
  };
}

// Busca todos os convites da nuvem
async function getAllTicketsCloud() {
  try {
    const res = await fetch(`${FARTIR_CONFIG.SUPABASE_URL}/fartir_tickets?select=*&order=number.asc`, {
      headers: getHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      const mapped = data.map(mapFromDb);
      // Salva no cache local para navegação ultra-rápida
      localStorage.setItem(FARTIR_CONFIG.STORE_KEY, JSON.stringify({ tickets: mapped }));
      return mapped;
    }
  } catch (e) {
    console.warn('Usando cache local (offline):', e);
  }

  // Fallback cache local se faltar internet
  try {
    const raw = localStorage.getItem(FARTIR_CONFIG.STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.tickets)) return parsed.tickets;
    }
  } catch (err) {}

  return [];
}

// Busca 1 convite específico pelo slug na nuvem
async function getTicketBySlugCloud(slug) {
  try {
    const res = await fetch(`${FARTIR_CONFIG.SUPABASE_URL}/fartir_tickets?slug=eq.${encodeURIComponent(slug)}&select=*`, {
      headers: getHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) return mapFromDb(data[0]);
    }
  } catch (e) {
    console.warn('Erro ao consultar convite na nuvem:', e);
  }

  // Fallback se falhar
  const all = await getAllTicketsCloud();
  return all.find(t => t.slug === slug) || null;
}

function isTicketExpired(t) {
  if (!t || !t.activatedAt) return false;
  return Date.now() > (t.activatedAt + FARTIR_CONFIG.CONVITE_DURATION_MS);
}

function getTicketExpirationDate(t) {
  if (!t || !t.activatedAt) return null;
  return t.activatedAt + FARTIR_CONFIG.CONVITE_DURATION_MS;
}

// Encontra a menor vaga livre na nuvem (convite1, convite2...)
async function getNextAvailableNumberCloud() {
  const tickets = await getAllTicketsCloud();
  const occupied = new Set();

  tickets.forEach(t => {
    const finished = !!(t.friendAttendedAt && t.inviterAttendedAt);
    const expired = isTicketExpired(t);
    if (!finished && !expired) {
      occupied.add(t.number);
    }
  });

  let n = 1;
  while (occupied.has(n)) {
    n++;
  }
  return n;
}

// Cria novo convite na nuvem Supabase
async function createTicketCloud(name, phone) {
  const slotNum = await getNextAvailableNumberCloud();
  const slug = `convite${slotNum}`;

  // Se já havia um antigo expirado nessa vaga, remove do banco
  await deleteTicketCloud(slug);

  const cleanPhone = (phone || '').replace(/\D/g, '');
  const newTicket = {
    slug,
    number: slotNum,
    inviterName: name.trim(),
    inviterPhone: cleanPhone ? (cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone) : '',
    createdAt: Date.now(),
    activatedAt: null,
    friendName: null,
    friendAttendedAt: null,
    inviterAttendedAt: null
  };

  const res = await fetch(`${FARTIR_CONFIG.SUPABASE_URL}/fartir_tickets`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(mapToDb(newTicket))
  });

  if (!res.ok) {
    throw new Error('Falha ao salvar convite na nuvem. Tente novamente.');
  }

  return newTicket;
}

// Ativa o convite na nuvem
async function activateTicketCloud(slug) {
  const res = await fetch(`${FARTIR_CONFIG.SUPABASE_URL}/fartir_tickets?slug=eq.${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ activated_at: Date.now() })
  });
  return res.ok;
}

// Barbeiro valida corte do amigo na nuvem
async function validateFriendCutCloud(slug, friendName, pin) {
  const cleanPin = String(pin || '').trim().toLowerCase();
  if (cleanPin !== FARTIR_CONFIG.ADMIN_PIN.toLowerCase()) throw new Error('Senha incorreta!');

  const t = await getTicketBySlugCloud(slug);
  if (!t) throw new Error('Convite não encontrado!');
  if (t.friendAttendedAt) throw new Error('A vaga deste amigo já foi utilizada!');

  const name = (friendName || 'Amigo').trim();
  const attendedAt = Date.now();

  const res = await fetch(`${FARTIR_CONFIG.SUPABASE_URL}/fartir_tickets?slug=eq.${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({
      friend_name: name,
      friend_attended_at: attendedAt
    })
  });

  if (!res.ok) throw new Error('Falha ao registrar corte na nuvem.');

  t.friendName = name;
  t.friendAttendedAt = attendedAt;
  return t;
}

// Barbeiro valida corte do titular na nuvem
async function validateInviterCutCloud(slug, pin) {
  const cleanPin = String(pin || '').trim().toLowerCase();
  if (cleanPin !== FARTIR_CONFIG.ADMIN_PIN.toLowerCase()) throw new Error('Senha incorreta!');

  const t = await getTicketBySlugCloud(slug);
  if (!t) throw new Error('Convite não encontrado!');
  if (!t.friendAttendedAt) throw new Error('O amigo ainda não cortou.');
  if (t.inviterAttendedAt) throw new Error('O titular já utilizou o benefício.');

  const attendedAt = Date.now();

  const res = await fetch(`${FARTIR_CONFIG.SUPABASE_URL}/fartir_tickets?slug=eq.${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({
      inviter_attended_at: attendedAt
    })
  });

  if (!res.ok) throw new Error('Falha ao registrar corte do titular.');

  t.inviterAttendedAt = attendedAt;
  return t;
}

// Exclui convite da nuvem
async function deleteTicketCloud(slug) {
  try {
    await fetch(`${FARTIR_CONFIG.SUPABASE_URL}/fartir_tickets?slug=eq.${encodeURIComponent(slug)}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  } catch (e) {}
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
