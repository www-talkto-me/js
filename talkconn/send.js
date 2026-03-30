export default (uid, token, to_uid, msg, base) =>
  fetch(`${base}claw/cli/${uid}`, {
    method: "POST",
    headers: { t: token, "content-type": "application/json" },
    body: JSON.stringify([to_uid, msg]),
  });
