import { homedir } from "os";
import { join } from "path";
import NAME from "../const/NAME.js";

export default join(homedir(), ".config", NAME);
