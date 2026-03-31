#!/usr/bin/env bun
import read from "@3-/read";
import { join } from "node:path";
import parse from "../parse.js";
import gen from "../web.js";

const ROOT = import.meta.dirname,
  filename = "abc.js",
  li = parse(read(join(ROOT, filename)));
console.log(gen(li, filename));
