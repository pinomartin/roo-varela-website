// Run with: bun test-whatsapp-contact.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { lang } from "./app/lang";

const source = readFileSync(new URL("./app/home-experience.tsx", import.meta.url), "utf8");
const handler = source.match(/  function submitContact\([\s\S]*?\n  }/)?.[0];
assert.ok(handler);
const javascript = ts.transpile(`${handler}\nreturn submitContact;`);
const clearHandler = source.match(/  function clearContactStatus\([\s\S]*?\n  }/)?.[0];
const chooseHandler = source.match(/  function choosePlan\([\s\S]*?\n  }/)?.[0];
assert.ok(clearHandler);
assert.ok(chooseHandler);
assert.match(source, /<form\s+className=\{`\$\{styles\.contactForm\}[^`]*`\}\s+onSubmit=\{submitContact\}\s+onChange=\{clearContactStatus\}/);
assert.match(chooseHandler, /clearContactStatus\(\)/);

for (const language of ["es", "en"] as const) {
  for (const result of [null, {}]) {
    let opened: unknown[] = [];
    let fallback = "";
    let status = "";
    let prevented = false;
    const fields = new Map([["name", " Ana "], ["goal", " Bailar "], ["interest", "proBundle"]]);
    const submit = new Function("window", "FormData", "text", "WHATSAPP_NUMBER", "setWhatsAppUrl", "setFormStatus", javascript)(
      { open: (...args: unknown[]) => { opened = args; return result; } },
      class { get(key: string) { return fields.get(key); } },
      lang[language], "123", (url: string) => { fallback = url; }, (value: string) => { status = value; },
    );
    submit({ preventDefault: () => { prevented = true; }, currentTarget: {} });
    const url = `https://wa.me/123?text=${encodeURIComponent(lang[language].message("Ana", "Bailar", lang[language].interests.proBundle))}`;
    assert.ok(prevented);
    assert.deepEqual(opened, [url, "_blank", "noopener,noreferrer"]);
    assert.equal(fallback, url);
    assert.equal(status, lang[language].formStatus);
    assert.notEqual(status, lang[language].formFallbackStatus);

    const clear = new Function("setWhatsAppUrl", "setFormStatus", ts.transpile(`${clearHandler}\nreturn clearContactStatus;`))(
      (value: string) => { fallback = value; }, (value: string) => { status = value; },
    );
    for (const [field, value] of [["interest", "pro"], ["name", "Bea"], ["goal", "Saltar"]]) {
      fields.set(field, value);
      clear();
      assert.equal(fallback, "");
      assert.equal(status, "");
      submit({ preventDefault() {}, currentTarget: {} });
      const updated = `https://wa.me/123?text=${encodeURIComponent(lang[language].message(fields.get("name")!.trim(), fields.get("goal")!.trim(), lang[language].interests[fields.get("interest") as "pro" | "proBundle"]))}`;
      assert.equal(fallback, updated);
      assert.equal(opened[0], updated);
    }
  }
}
