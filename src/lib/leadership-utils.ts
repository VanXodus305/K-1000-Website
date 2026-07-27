import type { LeadershipData, LeadershipMember } from "@/data/leadership";

const leadershipAliases: Record<string, string> = {
  training: "trainingprogram",
  trainingprogram: "trainingprogram",
  trainingprogramme: "trainingprogram",
  research: "researchandpublications",
  researchandpublications: "researchandpublications",
  projects: "projectwing",
  projectwing: "projectwing",
  events: "eventmanagement",
  eventmanagement: "eventmanagement",
  eventorganization: "eventmanagement",
  internship: "academicinternshipandplacementguidance",
  internshipandplacement: "academicinternshipandplacementguidance",
  academicinternshipandplacement: "academicinternshipandplacementguidance",
  academicinternshipandplacementguidance:
    "academicinternshipandplacementguidance",
  higher: "higherstudies",
  higherstudies: "higherstudies",
  finance: "financeandentrepreneurship",
  financeandentrepreneurship: "financeandentrepreneurship",
  officeofstrategyandgrowth: "officeofstrategyandgrowth",
  officeoftechnologyandinnovation: "officeoftechnologyandinnovation",
  officeofcommunicationsandcontent: "officeofcontentandcommunication",
  officeofcontentandcommunication: "officeofcontentandcommunication",
  officeofcampusambassador: "officeofcampusambassador",
  officeofpublicandcorporaterelations: "officeofpublicandcorporaterelations",
  officeofcreativityanddesign: "officeofcreativityanddesign",
};

export const normalizeLeadershipKey = (value: string) => {
  const normalized = value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/programme/g, "program")
    .replace(/communications/g, "communication")
    .replace(/[^a-z0-9]+/g, "")
    .trim();

  return leadershipAliases[normalized] || normalized;
};

export const findLeadershipPair = (
  hierarchy: LeadershipData["hierarchy"],
  branchValue: string,
): {
  primaryLeader?: LeadershipMember;
  secondaryLeader?: LeadershipMember;
} => {
  const seniorCouncil =
    hierarchy.find((entry) => entry.level === 2)?.members ?? [];
  const juniorCouncil =
    hierarchy.find((entry) => entry.level === 3)?.members ?? [];
  const targetKey = normalizeLeadershipKey(branchValue);

  return {
    primaryLeader: seniorCouncil.find(
      (member) => normalizeLeadershipKey(member.branch) === targetKey,
    ),
    secondaryLeader: juniorCouncil.find(
      (member) => normalizeLeadershipKey(member.branch) === targetKey,
    ),
  };
};
