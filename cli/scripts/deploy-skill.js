import fs from "node:fs/promises";
import path from "node:path";
import NAME from "../const/NAME.js";
import ROOT from "../const/ROOT.js";
import OPENCLAW_SKILL from "../const/OPENCLAW_SKILL.js";

export default async () => {
  const skill_name = NAME.replaceAll(".", "_"),
    local_skill_dir = path.join(ROOT, "skills", NAME);

  await fs.mkdir(OPENCLAW_SKILL, { recursive: true });
  await fs.cp(local_skill_dir, OPENCLAW_SKILL, { recursive: true, force: true });

  const skill_md_path = path.join(OPENCLAW_SKILL, "SKILL.md"),
    content = await fs.readFile(skill_md_path, "utf8"),
    updated = content.replaceAll("$NAME", skill_name);
  await fs.writeFile(skill_md_path, updated);

  console.log(`mounted skill ${NAME} to OpenClaw`);
};
