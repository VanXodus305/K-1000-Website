export type ParticipantRole = "leader" | "member";
export type ParticipantStatus = "ACTIVE" | "REMOVED";

export type TeamMemberRef = {
  email: string;
  role: ParticipantRole;
};

export type IgnithonTeam = {
  id: number;
  name: string;
  members: TeamMemberRef[];
  points: number;
  checked_in_at?: Date;
  checked_in_by?: string;
};

export type IgnithonParticipant = {
  name: string;
  email: string;
  is_kiit_student: boolean;
  roll_no: number;
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
