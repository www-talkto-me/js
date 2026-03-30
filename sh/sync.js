#!/usr/bin/env bun
import { readFile, writeFile } from "fs/promises";

const syncPackage = async (project_name, new_ver) => {
  const file_path = `${import.meta.dirname}/../${project_name}/package.json`,
    file_content = await readFile(file_path, "utf8"),
    pkg_data = JSON.parse(file_content);

  pkg_data.version = new_ver;

  await writeFile(file_path, JSON.stringify(pkg_data, null, 2) + "\n");
};

export default syncPackage;

if (import.meta.main) {
  let project = "",
    version = "";
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === "--project") project = process.argv[i + 1];
    if (process.argv[i] === "--version") version = process.argv[i + 1];
  }
  if (project && version) {
    await syncPackage(project, version);
  }
}
