#!/usr/bin/env bun

import read from "@3-/read";
import { join } from "node:path";
import parse from "../parse.js";

const ROOT = import.meta.dirname;

console.log(JSON.stringify(parse(read(join(ROOT, "abc.js"))), null, 2));
