// Run with the development server on localhost:3000: node test-back-to-top.mjs
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const profile = await mkdtemp(join(tmpdir(), "back-to-top-"));
const chrome = spawn(process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", "--no-first-run", "--remote-debugging-port=9224", `--user-data-dir=${profile}`, "about:blank",
], { stdio: "ignore" });
let socket;
try {
  let target;
  for (let i = 0; i < 100 && !target; i++) {
    try { target = await (await fetch("http://127.0.0.1:9224/json/new?http://localhost:3000/en", { method: "PUT" })).json(); }
    catch { await new Promise((resolve) => setTimeout(resolve, 100)); }
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
  const wait = () => new Promise((resolve) => setTimeout(resolve, 400));
  await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  for (let i = 0; i < 100; i++) {
    if (await evaluate("!!document.querySelector('button[data-visible]')")) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const button = "document.querySelector('button[data-visible]')";
  assert.equal(await evaluate(`${button}.getAttribute('aria-hidden')`), "true");
  for (const [progress, visible] of [[0.29, false], [0.31, true], [0.29, false], [0.31, true]]) {
    await evaluate(`window.scrollTo({top: (document.documentElement.scrollHeight - innerHeight) * ${progress}, behavior: 'instant'})`);
    await wait();
    assert.equal(await evaluate(`${button}.dataset.visible`), String(visible));
    assert.equal(await evaluate(`${button}.tabIndex`), visible ? 0 : -1);
  }
  assert.equal(await evaluate(`getComputedStyle(${button}).transitionDuration`), "0s");
  await evaluate(`${button}.click()`);
  await wait();
  assert.equal(await evaluate("window.scrollY"), 0);
  assert.equal(await evaluate(`${button}.dataset.visible`), "false");
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  assert.ok(await evaluate(`parseFloat(getComputedStyle(${button}).transitionDuration) > 0`));
  await send("Emulation.setDeviceMetricsOverride", { width: 1024, height: 812, deviceScaleFactor: 1, mobile: false });
  assert.equal(await evaluate(`getComputedStyle(${button}).display`), "none");
  console.log("Back-to-top threshold, accessibility, reduced motion, click and desktop visibility passed.");
} finally {
  socket?.close();
  chrome.kill();
  await new Promise((resolve) => chrome.once("exit", resolve));
  await rm(profile, { recursive: true, force: true });
}
