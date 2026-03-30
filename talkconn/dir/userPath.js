import { join } from "path";
import USER from "./USER.js";

export default (id) => join(USER, `${id}.yml`);
