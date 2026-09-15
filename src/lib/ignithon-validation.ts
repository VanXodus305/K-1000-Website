import { hasValidRegistrationIdentity } from "./ignithon-auth";

export function validateParticipantFields(value: { name?: unknown; email?: unknown; roll_no?: unknown; phone?: unknown; branch?: unknown; year?: unknown; hostel?: unknown }) {
  if (typeof value.name !== "string" || value.name.trim().length < 2 || value.name.trim().length > 80) return "Name must be between 2 and 80 characters.";
  if (typeof value.email !== "string" || value.email.length > 254 || typeof value.roll_no !== "string" || !hasValidRegistrationIdentity(value.email, value.roll_no)) return "Enter a valid KIIT email address and matching roll number.";
  if (typeof value.phone !== "string" || !/^\+?[0-9\s()-]{10,16}$/.test(value.phone.trim())) return "Enter a valid phone number.";
  if (typeof value.branch !== "string" || value.branch.trim().length < 2 || value.branch.trim().length > 120) return "Select a valid branch.";
  if (!Number.isInteger(value.year) || Number(value.year) < 1 || Number(value.year) > 5) return "Select a valid academic year.";
  if (value.hostel !== undefined && value.hostel !== null && (typeof value.hostel !== "string" || value.hostel.trim().length > 80)) return "Hostel must be 80 characters or fewer.";
  return null;
}
