import type { ObjectId } from "mongodb";

export type ParticipantRole = "leader" | "member";
export type ParticipantStatus = "ACTIVE" | "REMOVED";

export type IgnithonTeam = {
  id: number;
  name: string;
  members: ObjectId[];
  points: number;
  checked_in_at?: Date;
  checked_in_by?: string;
};

export type IgnithonParticipant = {
  name: string;
  email: string;
  roll_no: number;
  qr_separator: string;
  team_id: number;
  hostel: string | null;
  phone: string;
  branch: string;
  year: number;
  status: ParticipantStatus;
  removed_at?: Date;
  checked_in_at?: Date;
  checked_in_by?: string;
};

export type ParticipantInput = Omit<IgnithonParticipant, "team_id" | "status" | "removed_at">;
