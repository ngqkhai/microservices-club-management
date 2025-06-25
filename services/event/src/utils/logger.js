import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateRSVPQRCode = async (event_id, user_id, status) => {
  const qrText = `RSVP | Event: ${event_id} | User: ${user_id} | Status: ${status}`;
  const qrFileName = `rsvp-${event_id}-${user_id}.png`;
  const qrFolderPath = path.join(__dirname, '../../public/qr');
  const qrFilePath = path.join(qrFolderPath, qrFileName);

  if (!fs.existsSync(qrFolderPath)) {
    fs.mkdirSync(qrFolderPath, { recursive: true });
  }

  await QRCode.toFile(qrFilePath, qrText);

  return `http://localhost:3001/qr/${qrFileName}`;
};
