import type { ObjectId } from "mongodb";

export type ParticipantRole = "leader" | "member";
export type ParticipantStatus = "ACTIVE" | "REMOVED";

export type IgnithonTeam = {
  id: number;
  name: string;
  members: ObjectId[];
  points: number;
  room?: string | null;
  updatedAt?: Date;
  createdAt?: Date;
};

export type IgnithonParticipant = {
  name: string;
  email: string;
  roll_no: string;
  team_id: ObjectId;
  hostel: string | null;
  phone: string;
  branch: string;
  year: number;
  status: ParticipantStatus;
  attendance: boolean;
  updatedAt?: Date;
  removed_at?: Date;
};

export type ParticipantInput = Omit<IgnithonParticipant, "team_id" | "status" | "removed_at">;

export type EvaluationAlertScope = "team" | "participant";
export type EvaluationAlertStatus = "ACTIVE" | "DISMISSED";

export type IgnithonEvaluationAlert = {
  team_id: ObjectId;
  participant_id: ObjectId | null;
  scope: EvaluationAlertScope;
  status: EvaluationAlertStatus;
  createdAt: Date;
  updatedAt: Date;
  dismissedAt?: Date | null;
  dismissedBy?: ObjectId | null;
};
