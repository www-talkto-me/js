import { join } from "node:path";
import NAME from "./NAME.js";
import OPENCLAW from "./OPENCLAW.js";

export default join(OPENCLAW[0], "skills", NAME.replaceAll(".", "_"));
