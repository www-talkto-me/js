import REGISTRIES from "./registry.js";
import reqJson from "@3-/req/reqJson.js";

export default async (pkg, registries = REGISTRIES) => {
  const total = registries.length,
    start = Math.floor(Math.random() * total);

  for (let i = 0; i < total; i++) {
    const idx = (start + i) % total,
      registry = registries[idx],
      base = registry.endsWith("/") ? registry.slice(0, -1) : registry,
      url = `${base}/${pkg.replace("/", "%2F")}/latest`;

    // 避免单个 registry 故障阻断整个流程
    try {
      const { version } = await reqJson(url);
      if (version) return [version, registry];
    } catch {}
  }
  return [];
};
