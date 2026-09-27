const fs = require('fs');
const path = require('path');

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentVal = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal.trim());
      currentVal = '';
      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentVal += char;
    }
  }
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    rows.push(currentRow);
  }
  return rows;
}

function normalizePhone(raw) {
  if (!raw) return '';
  let cleaned = raw.replace(/\D/g, '');
  if (cleaned.startsWith('62')) {
    cleaned = '0' + cleaned.slice(2);
  } else if (cleaned.startsWith('8')) {
    cleaned = '0' + cleaned;
  }
  return cleaned;
}

const csvPath = path.join(__dirname, '..', 'Data Pendaftaran E-SAPARI - Form responses 1.csv');
const content = fs.readFileSync(csvPath, 'utf8');
const rows = parseCSV(content);

const participants = [];
const phoneSet = new Set();

for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r || r.length < 5) continue;
  const timestamp = r[0] || '';
  const name = (r[1] || '').trim();
  const institution = (r[2] || '').trim();
  const major = (r[3] || '').trim();
  const rawPhone = (r[4] || '').trim();
  const normPhone = normalizePhone(rawPhone);
  const proofUrl = (r[5] || '').trim();

  if (normPhone && normPhone.length >= 9) {
    participants.push({
      id: i,
      timestamp,
      name,
      institution,
      major,
      rawPhone,
      normPhone,
      proofUrl
    });
    phoneSet.add(normPhone);
  }
}

const libDir = path.join(__dirname, '..', 'lib');
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

const fileContent = `// Auto-generated from "Data Pendaftaran E-SAPARI - Form responses 1.csv"
export interface Participant {
  id: number;
  timestamp: string;
  name: string;
  institution: string;
  major: string;
  rawPhone: string;
  normPhone: string;
  proofUrl?: string;
}

export const INITIAL_PARTICIPANTS: Participant[] = ${JSON.stringify(participants, null, 2)};

export function normalizePhoneNumber(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.replace(/\\D/g, '');
  if (cleaned.startsWith('62')) {
    cleaned = '0' + cleaned.slice(2);
  } else if (cleaned.startsWith('8')) {
    cleaned = '0' + cleaned;
  }
  return cleaned;
}

export function findParticipantByPhone(rawPhone: string): Participant | undefined {
  const normalized = normalizePhoneNumber(rawPhone);
  if (!normalized) return undefined;
  return INITIAL_PARTICIPANTS.find(p => p.normPhone === normalized);
}
`;

fs.writeFileSync(path.join(libDir, 'initial-participants.ts'), fileContent, 'utf8');
console.log(`Generated lib/initial-participants.ts with ${participants.length} participants.`);
