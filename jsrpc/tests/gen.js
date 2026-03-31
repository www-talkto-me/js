#!/usr/bin/env bun
import { join } from "node:path";
import gen from "../gen.js";

const ROOT = import.meta.dirname;

console.log(await gen(join(ROOT, "fn"), join(ROOT, "web")));
