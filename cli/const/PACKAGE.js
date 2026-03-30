import { readFileSync } from "fs";
import { join } from "path";
import ROOT from "./ROOT.js";

export default JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));
