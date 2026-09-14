import { randomBytes } from "node:crypto";

const QR_SEPARATOR_LENGTH = 5;
const QR_SEPARATOR_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type IgnithonParticipantQrIdentity = {
  participantId: string;
  teamId: number;
};

export function createIgnithonQrSeparator() {
  const bytes = randomBytes(QR_SEPARATOR_LENGTH);
  return Array.from(bytes, (byte) => QR_SEPARATOR_ALPHABET[byte % QR_SEPARATOR_ALPHABET.length]).join("");
}

export function getIgnithonParticipantQrValue({ participantId, teamId }: IgnithonParticipantQrIdentity) {
  return `${participantId}|${teamId}`;
}

export function readIgnithonParticipantQrValue(value: string): IgnithonParticipantQrIdentity | null {
  const parts = value.trim().split("|");
  if (parts.length !== 2) return null;

  const participantId = parts[0].trim().toLowerCase();
  const teamId = Number(parts[1].trim());
  const isObjectId = /^[a-f0-9]{24}$/.test(participantId);
  if (!isObjectId || !Number.isSafeInteger(teamId) || teamId < 1000 || teamId > 9999) return null;
  return { participantId, teamId };
}

export function addIgnithonQrLogo(svg: string, logoDataUri: string) {
  const viewBox = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const canvasSize = viewBox ? Math.min(Number(viewBox[1]), Number(viewBox[2])) : 512;
  const boxSize = canvasSize * 0.21;
  const boxOffset = (canvasSize - boxSize) / 2;
  const logoInset = boxSize * 0.1;
  const logo = `<g><rect x="${boxOffset}" y="${boxOffset}" width="${boxSize}" height="${boxSize}" rx="${boxSize * 0.15}" fill="#020202" stroke="#00f7ff" stroke-width="${Math.max(canvasSize * 0.006, 0.3)}"/><image href="${logoDataUri}" x="${boxOffset + logoInset}" y="${boxOffset + logoInset}" width="${boxSize - logoInset * 2}" height="${boxSize - logoInset * 2}" preserveAspectRatio="xMidYMid meet"/></g>`;
  return svg.replace("</svg>", `${logo}</svg>`);
}
