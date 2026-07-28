export interface Room {
  id: number;
  name: string;
  location: string;
  panel_count?: number;
  panels?: Panel[];
  created_at?: string;
  updated_at?: string;
}

export interface Panel {
  id: number;
  room_id: number;
  name: string;
  grid_position_x: number;
  grid_position_y: number;
  status: "empty" | "ongoing" | string;
  current_candidate_id?: number | null;
  candidate_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WaitingCandidate {
  id: number;
  full_name: string;
  phone?: string;
  kiit_email: string;
  gender?: string;
  date_of_birth?: string;
  academic_year?: string;
  course?: string;
  domain_choice: string;
  motivation?: string;
  experience?: string;
  skills?: string[];
  referral_source?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface CandidateStatusUpdatedPayload {
  id: number;
  status: string;
  full_name?: string;
  kiit_email?: string;
  domain_choice?: string;
  updated_at?: string;
}

export interface PanelUpdatedPayload {
  id: number;
  room_id: number;
  name: string;
  grid_position_x: number;
  grid_position_y: number;
  status: "empty" | "ongoing" | string;
  current_candidate_id?: number | null;
  candidate_name?: string;
  updated_at?: string;
}

export type SSEConnectionStatus = "Connected" | "Reconnecting" | "Error" | "Connecting" | "Disconnected" | "Polling";

export interface SSEStreamOptions {
  apiUrl?: string;
  authToken?: string;
  onCandidateStatusUpdated?: (payload: CandidateStatusUpdatedPayload) => void;
  onPanelUpdated?: (payload: PanelUpdatedPayload) => void;
}
