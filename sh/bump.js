#!/usr/bin/env bun
import { readFile, writeFile } from "fs/promises";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const bumpPackage = async (file_path) => {
  const file_content = await readFile(file_path, "utf8"),
    pkg_data = JSON.parse(file_content),
    version_parts = pkg_data.version.split(".");

  delete pkg_data.devDependencies;
  version_parts[version_parts.length - 1] = parseInt(version_parts[version_parts.length - 1]) + 1;
  pkg_data.version = version_parts.join(".");

  await writeFile(file_path, JSON.stringify(pkg_data, null, 2) + "\n");
  return pkg_data.version;
};

export default bumpPackage;

if (import.meta.main) {
  const { file } = yargs(hideBin(process.argv)).parseSync(),
    new_ver = await bumpPackage(file);
  console.log(new_ver);
}
