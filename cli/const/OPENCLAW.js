import { existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

export default (() => {
  const {
      env: { OPENCLAW_HOME, OPENCLAW_STATE_DIR, OPENCLAW_TEST_FAST, OPENCLAW_CONFIG_PATH },
    } = process,
    home_dir = OPENCLAW_HOME?.trim() || homedir(),
    state_override = OPENCLAW_STATE_DIR?.trim(),
    test_fast = OPENCLAW_TEST_FAST === "1",
    config_override = OPENCLAW_CONFIG_PATH?.trim(),
    new_dir = join(home_dir, ".openclaw"),
    STATE_DIR =
      state_override ||
      (test_fast || existsSync(new_dir)
        ? new_dir
        : [".clawdbot", ".moldbot"].map((dir) => join(home_dir, dir)).find(existsSync) || new_dir),
    CONFIG_PATH =
      config_override ||
      (test_fast || state_override
        ? join(STATE_DIR, "openclaw.json")
        : [
            join(STATE_DIR, "openclaw.json"),
            ...["clawdbot.json", "moldbot.json"].map((name) => join(STATE_DIR, name)),
          ].find(existsSync) || join(STATE_DIR, "openclaw.json")),
    IDENTITY_PATH = join(STATE_DIR, "identity", "device.json");

  return [STATE_DIR, CONFIG_PATH, IDENTITY_PATH];
})();
