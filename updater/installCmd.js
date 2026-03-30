import { realpathSync, existsSync } from "fs";

const has = (path, tests) => tests.some((t) => path.includes(t));

export default (pkg, registry) => {
  const [exe, cli] = process.argv,
    flag = registry ? ` --registry=${registry}` : "";

  if (!cli || !existsSync(cli)) return;

  const real = realpathSync(cli).replace(/\\/g, "/");

  if (has(real, ["/_npx", "/_pnpx", "/dlx/"])) return;

  const cmd = exe.includes("bun") ? "bun i -g" : "npm i -g",
    RULES = [
      [["/.pnpm/global", "/.local/share/pnpm"], "pnpm add -g"],
      [["/.yarn/global"], "yarn global add"],
      [["/.bun/install/global"], "bun add -g"],
      [["/lib/node_modules/", "/npm/node_modules/"], cmd],
    ],
    [, match] = RULES.find(([paths]) => has(real, paths)) || [];

  if (match) return `${match} ${pkg}${flag}`;
};
