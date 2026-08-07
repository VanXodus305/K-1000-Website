export type Registration = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  kiit_email: string;
  gender: string;
  roll_number: string;
  academic_year: string;
  course: string;
  branch: string;
  domain_choice: string;
  sub_domains: string;
  motivation: string;
  experience: string;
  skills: string[];
  referral_source: string;
  referred_by: string;
  status: string;
  created_at: string;
};

export type Criterion = {
  name: string;
  max_score: number;
  score: number;
};

export type InterviewSubmission = {
  registration_id: number;
  panelist_name: string;
  panelist_roll: string;
  panelist_branch: string;
  panelist_domain: string;
  remarks: string;
  criteria: Criterion[];
};
