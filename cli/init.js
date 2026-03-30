import deploySkill from "./scripts/deploy-skill.js";
import signin from "@talkto-me/conn/signin.js";
import API from "@talkto-me/conn/const/API.js";

export default async () => {
  const ING = {
      deploySkill,
    },
    { TALKTO_ME_TOKEN } = process.env;

  if (TALKTO_ME_TOKEN) {
    ING.signin = signin.bind(null, TALKTO_ME_TOKEN, API);
  } else {
    console.warn("miss TALKTO_ME_TOKEN");
  }

  const entries = Object.entries(ING);

  (await Promise.allSettled(entries.map(async ([, f]) => f()))).forEach(
    ({ status, reason }, i) => "rejected" === status && console.error(entries[i][0], reason),
  );
};
