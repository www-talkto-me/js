const extractTargets = (sessions) =>
  Array.from(
    new Map(
      sessions
        .filter(({ deliveryContext: c }) => c?.channel && c?.to)
        .map(({ deliveryContext: { channel, to } }) => [`${channel}:${to}`, { channel, to }]),
    ).values(),
  );

export default async (sendRpc, message, session_key, id_key) => {
  const { ok, payload: { sessions = [] } = {} } = await sendRpc("sessions.list"),
    targets = ok ? extractTargets(sessions) : [];

  for (const { channel, to } of targets) {
    await sendRpc("send", {
      channel,
      to,
      message,
      sessionKey: session_key,
      idempotencyKey: String(id_key),
    });
  }
};
