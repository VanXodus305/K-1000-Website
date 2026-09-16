import { hasValidRegistrationIdentity } from "./ignithon-auth";

export function validateParticipantFields(value: { name?: unknown; email?: unknown; roll_no?: unknown; phone?: unknown; branch?: unknown; year?: unknown; hostel?: unknown }) {
  if (typeof value.name !== "string" || value.name.trim().length < 2) return "Name must contain at least 2 characters.";
  if (typeof value.email !== "string" || typeof value.roll_no !== "string" || !hasValidRegistrationIdentity(value.email, value.roll_no)) return "Email address must be an approved KIIT address and match the roll number.";
  if (typeof value.phone !== "string" || !/^\d{10}$/.test(value.phone.trim())) return "Phone number must contain exactly 10 digits.";
  if (typeof value.branch !== "string" || value.branch.trim().length < 2) return "Branch must be selected.";
  if (!Number.isInteger(value.year) || Number(value.year) < 2 || Number(value.year) > 4) return "Academic year must be 2nd, 3rd, or 4th year.";
  if (value.hostel !== undefined && value.hostel !== null && typeof value.hostel !== "string") return "Hostel must be valid text.";
  return null;
}
