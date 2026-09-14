import { randomBytes } from "node:crypto";

const QR_SEPARATOR_LENGTH = 5;
const QR_SEPARATOR_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type IgnithonParticipantQrIdentity = {
  rollNo: number;
  separator: string;
  teamId: number;
};

export function createIgnithonQrSeparator() {
  const bytes = randomBytes(QR_SEPARATOR_LENGTH);
  return Array.from(bytes, (byte) => QR_SEPARATOR_ALPHABET[byte % QR_SEPARATOR_ALPHABET.length]).join("");
}

export function getIgnithonParticipantQrValue({ rollNo, separator, teamId }: IgnithonParticipantQrIdentity) {
  return `${rollNo}${separator}${teamId}`;
}

export function readIgnithonParticipantQrValue(value: string): IgnithonParticipantQrIdentity | null {
  const match = value.trim().toUpperCase().match(new RegExp(`^(\\d+)([A-Z0-9]{${QR_SEPARATOR_LENGTH}})(\\d{4})$`));
  if (!match) return null;
  const rollNo = Number(match[1]);
  const teamId = Number(match[3]);
  if (!Number.isSafeInteger(rollNo) || rollNo <= 0 || teamId < 1000 || teamId > 9999) return null;
  return { rollNo, separator: match[2], teamId };
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
