// Run with: bun test-plan-interest.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { lang } from "./app/lang";

const source = readFileSync(new URL("./app/home-experience.tsx", import.meta.url), "utf8");
assert.match(source, /choosePlan\(event, "proBundle"\)/);
assert.match(source, /<option value="proBundle">\{text\.interests\.proBundle\}<\/option>/);
assert.match(source, /text\.interests\[String\(formData\.get\("interest"\)\) as PlanInterest\]/);
for (const language of ["es", "en"] as const) {
  const { interests, message } = lang[language];
  assert.match(interests.proBundle, language === "es" ? /3 meses/ : /3-month/);
  for (const interest of Object.values(interests)) {
    assert.ok(message("Test", "Goal", interest).includes(interest));
  }
  assert.notEqual(interests.proBundle, interests.pro);
}
