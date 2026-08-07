import json
import random
import string

domains = {
  "internship": ["General Member", "Management"],
  "higher": ["General Member", "Management"],
  "events": ["General Member", "Marketing", "Photography and videograph"],
  "projects": ["Mentors", "Management", "General Member", "AI/ML", "Data Analyst", "IoT", "Linux", "Java", "Blockchain", "Web Development", "Data Analytics"],
  "training": ["General Member", "App Development", "Web Development", "Game Development", "Design & UI/UX", "CyberSecurity", "DSA&CP", "Java", "AI/ML", "Data Analytics"],
  "research": ["Medical Imaging", "Deep learning/ Machine learning", "Astronomy/Space technology", "Defence technology", "Game theory", "Finance and Economics", "Quantum", "Bio-Tech"],
  "finance": ["General Member", "Management"],
}

offices = ["osg", "oti", "ocd", "opcr", "oca", "occ"]

def generate_password():
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(8))

output = "# Panelist Credentials\n\n"
output += "## Domains\n"
for domain, subdomains in domains.items():
    output += f"\n### {domain.capitalize()}\n"
    for sub in subdomains:
        output += f"- **{sub}**: `{generate_password()}`\n"

output += "\n## Offices\n"
for office in offices:
    output += f"- **{office.upper()}**: `{generate_password()}`\n"

with open("panelist-credentials.md", "w") as f:
    f.write(output)

print("Generated panelist-credentials.md")
