export const KIIT_EMAIL_DOMAINS = [
  "kiit.ac.in",
  "biotech.kiit.ac.in",
  "fashion.kiit.ac.in",
  "film.kiit.ac.in",
  "ksap.kiit.ac.in",
  "ksfh.kiit.ac.in",
  "ksmc.kiit.ac.in",
  "ksod.kiit.ac.in",
  "ksol.kiit.ac.in",
  "library.kiit.ac.in",
  "kins.ac.in",
  "kims.ac.in",
  "kids.ac.in",
  "kls.ac.in",
  "ksom.ac.in",
  "ksrm.ac.in",
  "kp.kiit.ac.in",
  "kspt.kiit.ac.in",
  "ksls.kiit.ac.in",
  "ksec.kiit.ac.in",
  "ksp.kiit.ac.in",
  "ksams.kiit.ac.in",
] as const;

export function isKiitEmailDomain(email: string) {
  const domain = email.trim().toLowerCase().split("@")[1];
  return Boolean(domain && KIIT_EMAIL_DOMAINS.includes(domain as (typeof KIIT_EMAIL_DOMAINS)[number]));
}
