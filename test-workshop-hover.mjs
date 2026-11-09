// Run with the development server on localhost:3000: node test-workshop-hover.mjs
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const profile = await mkdtemp(join(tmpdir(), "workshop-test-"));
const chrome = spawn(process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", "--no-first-run", "--remote-debugging-port=9223", `--user-data-dir=${profile}`, "about:blank",
], { stdio: "ignore" });
let socket;
try {
  let target;
  for (let i = 0; i < 100; i++) {
    try {
      target = await (await fetch("http://127.0.0.1:9223/json/new?http://localhost:3000", { method: "PUT" })).json();
      break;
    } catch { await new Promise((resolve) => setTimeout(resolve, 100)); }
  }
  assert.ok(target, "Chrome did not start");
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let id = 0;
  const pending = new Map();
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (!message.id) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const next = ++id;
    pending.set(next, { resolve, reject });
    socket.send(JSON.stringify({ id: next, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  for (let i = 0; i < 150; i++) {
    if (await evaluate("document.querySelectorAll('#education details').length >= 3 && Object.keys(document.querySelector('#education details')).some(key => key.startsWith('__reactProps$'))")) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  await evaluate("document.querySelector('#education details').scrollIntoView({block:'center'})");
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const move = async (index) => {
    const point = await evaluate(`(() => { const r = document.querySelectorAll('#education details')[${index}].getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+40}; })()`);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", ...point });
  };
  await move(0);
  await new Promise((resolve) => setTimeout(resolve, 600));
  assert.equal(await evaluate("document.querySelector('#education details').open"), false, "Hover opened the card");
  await evaluate("document.querySelector('#education details summary').click()");
  await new Promise((resolve) => setTimeout(resolve, 600));
  assert.equal(await evaluate("document.querySelector('#education details').open"), true, "Click did not open the card");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('#education details summary span span')).opacity"), "0", "Workshop label did not fade out");
  await evaluate("document.querySelector('#education details summary').click()");
  await new Promise((resolve) => setTimeout(resolve, 400));
  assert.equal(await evaluate("document.querySelector('#education details').open"), false, "Second click did not close the card");
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 10, y: 10 });
  await evaluate("document.querySelectorAll('#education button[aria-label^=\"Ir al taller\"]')[4].click()");
  await new Promise((resolve) => setTimeout(resolve, 900));
  assert.equal(await evaluate("document.querySelectorAll('#education button[aria-label^=\"Ir al taller\"]')[4].getAttribute('aria-current')"), "true", "Last carousel dot was not selected");
  assert.ok(await evaluate("(() => { const c = document.querySelector('#education details').parentElement; return Math.abs(c.scrollLeft - 4 * c.clientWidth) < 2; })()"), "Last workshop did not scroll into view");
  await evaluate("document.querySelectorAll('#education button[aria-label^=\"Ir al taller\"]')[0].click()");
  await new Promise((resolve) => setTimeout(resolve, 900));
  assert.equal(await evaluate("document.querySelectorAll('#education button[aria-label^=\"Ir al taller\"]')[0].getAttribute('aria-current')"), "true");
  console.log("Carousel dots navigate to the last workshop and back.");
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 10, y: 10 });
  await evaluate("document.querySelector('#education details summary').focus()");
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
  await send("Input.dispatchKeyEvent", { type: "char", text: "\r", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
  assert.equal(await evaluate("document.querySelector('#education details').open"), true);
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await new Promise((resolve) => setTimeout(resolve, 400));
  assert.equal(await evaluate("document.querySelector('#education details').open"), false);
  console.log("Keyboard Enter opens and Escape closes the disclosure.");
  await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await evaluate("document.querySelectorAll('#education button[aria-label^=\"Ir al taller\"]')[2].click()");
  await new Promise((resolve) => setTimeout(resolve, 300));
  assert.ok(await evaluate("(() => { const c = document.querySelector('#education details').parentElement; return Math.abs(c.scrollLeft - 2 * c.clientWidth) < 2; })()"), "Mobile reduced-motion navigation failed");
  assert.equal(await evaluate("document.querySelectorAll('#education button[aria-label^=\"Ir al taller\"]')[2].getAttribute('aria-current')"), "true");
  console.log("Mobile carousel navigation respects reduced motion.");
} finally {
  socket?.close();
  chrome.kill();
  await new Promise((resolve) => chrome.once("exit", resolve));
  await rm(profile, { recursive: true, force: true });
}
