import { readFile, writeFile } from "node:fs/promises";
const request = JSON.parse(
  await readFile(new URL("./score-request.json", import.meta.url), "utf8"),
);
if (!process.env.OPENROUTER_API_KEY)
  throw new Error("OPENROUTER_API_KEY unavailable");
const response = await fetch("https://openrouter.ai/api/v1/systemone", {
  method: "POST",
  headers: {
    Authorization: "Bearer " + process.env.OPENROUTER_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(request),
});
if (!response.ok)
  throw new Error("System One request failed: HTTP " + response.status);
const result = await response.json();
if (
  !result.answers ||
  Object.keys(result.answers).length !== Object.keys(request.questions).length
)
  throw new Error("Missing answers");
await writeFile(
  new URL("./score-result.json", import.meta.url),
  JSON.stringify(result, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    model: result.model,
    questions: Object.keys(result.answers).length,
    usage: result.usage,
    answers: result.answers,
  }),
);
