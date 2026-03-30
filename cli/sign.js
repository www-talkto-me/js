import { createHash, createPrivateKey, createPublicKey, sign } from "crypto";

const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex"),
  b64url = (buf) =>
    Buffer.from(buf)
      .toString("base64")
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .replace(/=+$/, "");

const extractRaw = (pem) => {
  const spki = createPublicKey(pem).export({ type: "spki", format: "der" });
  return spki.length === ED25519_SPKI_PREFIX.length + 32
    ? spki.subarray(ED25519_SPKI_PREFIX.length)
    : spki;
};

const pubkeyB64url = (pem) => b64url(extractRaw(pem));

const deriveId = (pem) => createHash("sha256").update(extractRaw(pem)).digest("hex");

const signPayload = (pem, payload) =>
  b64url(sign(null, Buffer.from(payload, "utf-8"), createPrivateKey(pem)));

const buildDeviceBlock = ({ publicKeyPem, privateKeyPem }, { scopes, token, nonce }) => {
  const device_id = deriveId(publicKeyPem),
    signed_at = Date.now(),
    payload_str = [
      "v3",
      device_id,
      "cli",
      "cli",
      "operator",
      scopes.join(","),
      String(signed_at),
      token || "",
      nonce,
      process.platform,
      "",
    ].join("|");
  return {
    id: device_id,
    publicKey: pubkeyB64url(publicKeyPem),
    signature: signPayload(privateKeyPem, payload_str),
    signedAt: signed_at,
    nonce,
  };
};

export default buildDeviceBlock;
