/**
 * FARTIR PASS ENGINE — NUVEM FIREBASE FIRESTORE + CACHE LOCAL
 * Laboratório de Cortes · Contagem MG
 */

'use strict';

const FARTIR_CONFIG = {
  FIREBASE_PROJECT_ID: 'fartir-pass',
  FIREBASE_API_KEY: 'AIzaSyCLh5NNwueGBjBz0gEo4AUjl9--xSJekug',
  FIRESTORE_COLLECTION: 'fartir_tickets',
  STORE_KEY: 'fartir_pass_tickets_v1',
  ADMIN_PIN: 'admin',            // Senha do painel e validação
  OWNER_PHONE: '5531993811525',   // WhatsApp da Fartir
  CONVITE_DURATION_MS: 30 * 24 * 60 * 60 * 1000 // 30 dias corridos
};

function getCollectionUrl() {
  return `https://firestore.googleapis.com/v1/projects/${FARTIR_CONFIG.FIREBASE_PROJECT_ID}/databases/(default)/documents/${FARTIR_CONFIG.FIRESTORE_COLLECTION}`;
}

function getDocUrl(slug) {
  return `${getCollectionUrl()}/${encodeURIComponent(slug)}`;
}

function withApiKey(url, extraParams) {
  const sep = url.includes('?') ? '&' : '?';
  const params = extraParams ? `${extraParams}&` : '';
  return `${url}${sep}${params}key=${encodeURIComponent(FARTIR_CONFIG.FIREBASE_API_KEY)}`;
}

function readFsField(field) {
  if (!field || typeof field !== 'object') return null;
  if ('nullValue' in field) return null;
  if ('stringValue' in field) return field.stringValue;
  if ('integerValue' in field) return Number(field.integerValue);
  if ('doubleValue' in field) return Number(field.doubleValue);
  if ('booleanValue' in field) return Boolean(field.booleanValue);
  return null;
}

function toFsString(val) {
  return val ? { stringValue: String(val) } : { nullValue: null };
}

function toFsInt(val) {
  return (val !== null && val !== undefined && !Number.isNaN(Number(val)))
    ? { integerValue: String(Math.trunc(Number(val))) }
    : { nullValue: null };
}

// Converte do documento Firestore para o formato do site (camelCase)
function mapFromDb(doc) {
  if (!doc || !doc.fields) return null;
  const f = doc.fields;
  const slugFromName = doc.name ? doc.name.split('/').pop() : '';
  const createdAt = Number(readFsField(f.created_at)) || Date.now();
  const activatedAt = Number(readFsField(f.activated_at)) || createdAt; // O prazo começa na emissão!
  const friendAttended = readFsField(f.friend_attended_at);
  const inviterAttended = readFsField(f.inviter_attended_at);

  return {
    slug: readFsField(f.slug) || slugFromName,
    number: Number(readFsField(f.number)) || 0,
    inviterName: readFsField(f.inviter_name) || '',
    inviterPhone: readFsField(f.inviter_phone) || '',
    createdAt: createdAt,
    activatedAt: activatedAt,
    friendName: readFsField(f.friend_name) || null,
    friendAttendedAt: friendAttended ? Number(friendAttended) : null,
    inviterAttendedAt: inviterAttended ? Number(inviterAttended) : null
  };
}

// Converte do site para o documento Firestore
function mapToDb(t) {
  const startTime = t.activatedAt || t.createdAt || Date.now();
  return {
    fields: {
      slug: { stringValue: String(t.slug) },
      number: { integerValue: String(Math.trunc(Number(t.number) || 0)) },
      inviter_name: { stringValue: String(t.inviterName || '') },
      inviter_phone: { stringValue: String(t.inviterPhone || '') },
      created_at: toFsInt(t.createdAt || startTime),
      activated_at: toFsInt(startTime),
      friend_name: toFsString(t.friendName),
      friend_attended_at: toFsInt(t.friendAttendedAt),
      inviter_attended_at: toFsInt(t.inviterAttendedAt)
    }
  };
}

function getTicketStartTime(t) {
  if (!t) return Date.now();
  return Number(t.activatedAt) || Number(t.createdAt) || Date.now();
}

function isTicketExpired(t) {
  if (!t) return false;
  return Date.now() > (getTicketStartTime(t) + FARTIR_CONFIG.CONVITE_DURATION_MS);
}

function getTicketExpirationDate(t) {
  if (!t) return null;
  return getTicketStartTime(t) + FARTIR_CONFIG.CONVITE_DURATION_MS;
}

// Busca todos os convites da nuvem
async function getAllTicketsCloud() {
  try {
    const docs = [];
    let pageToken = '';

    do {
      const pageParam = pageToken
        ? `pageSize=200&pageToken=${encodeURIComponent(pageToken)}`
        : 'pageSize=200';
      const res = await fetch(withApiKey(getCollectionUrl(), pageParam));
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (Array.isArray(data.documents)) {
        docs.push(...data.documents);
      }
      pageToken = data.nextPageToken || '';
    } while (pageToken);

    const mapped = docs.map(mapFromDb).filter(Boolean).sort((a, b) => a.number - b.number);
    localStorage.setItem(FARTIR_CONFIG.STORE_KEY, JSON.stringify({ tickets: mapped }));
    return mapped;
  } catch (e) {
    console.warn('Usando cache local (offline):', e);
  }

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
    const res = await fetch(withApiKey(getDocUrl(slug)));
    if (res.ok) {
      const doc = await res.json();
      return mapFromDb(doc);
    }
    if (res.status === 404) {
      return null;
    }
  } catch (e) {
    console.warn('Erro ao consultar convite na nuvem:', e);
  }

  const all = await getAllTicketsCloud();
  return all.find(t => t.slug === slug) || null;
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

// Cria novo convite na nuvem Firestore (inicia os 30 dias na hora da criação)
async function createTicketCloud(name, phone) {
  const slotNum = await getNextAvailableNumberCloud();
  const slug = `convite${slotNum}`;

  const cleanPhone = (phone || '').replace(/\D/g, '');
  const now = Date.now();
  const newTicket = {
    slug,
    number: slotNum,
    inviterName: name.trim(),
    inviterPhone: cleanPhone ? (cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone) : '',
    createdAt: now,
    activatedAt: now,
    friendName: null,
    friendAttendedAt: null,
    inviterAttendedAt: null
  };

  const res = await fetch(withApiKey(getDocUrl(slug)), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapToDb(newTicket))
  });

  if (!res.ok) {
    throw new Error('Falha ao salvar convite na nuvem. Tente novamente.');
  }

  return newTicket;
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
  const mask = 'updateMask.fieldPaths=friend_name&updateMask.fieldPaths=friend_attended_at';

  const res = await fetch(withApiKey(getDocUrl(slug), mask), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        friend_name: { stringValue: name },
        friend_attended_at: toFsInt(attendedAt)
      }
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
  const mask = 'updateMask.fieldPaths=inviter_attended_at';

  const res = await fetch(withApiKey(getDocUrl(slug), mask), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        inviter_attended_at: toFsInt(attendedAt)
      }
    })
  });

  if (!res.ok) throw new Error('Falha ao registrar corte do titular.');

  t.inviterAttendedAt = attendedAt;
  return t;
}

// Exclui convite da nuvem
async function deleteTicketCloud(slug) {
  try {
    await fetch(withApiKey(getDocUrl(slug)), {
      method: 'DELETE'
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
