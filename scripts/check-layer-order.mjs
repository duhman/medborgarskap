#!/usr/bin/env node
/**
 * check-layer-order.mjs  (Grundform cascade gate, proposed for all 14 consumer repos)
 *
 * Fails fast on the cascade regression class seen in Phase B:
 *   1. GRUNDFORM_LAYER_MISSING   a required cascade layer is not declared in the built CSS
 *   2. GRUNDFORM_LAYER_ORDER     layers are declared in the wrong order (for example grundform under Tailwind base)
 *   3. GRUNDFORM_UNLAYERED       a style rule outside every @layer, not in the ratchet baseline.
 *                                Unlayered rules beat every layered rule, utilities included.
 *   4. GRUNDFORM_BASELINE_EXPIRED a baseline exception is past its expiry date
 *      GRUNDFORM_BASELINE_INVALID a baseline entry lacks a reason (or still says TODO) or a valid expiry
 *   5. GRUNDFORM_VISUAL_DIFF     (optional) a before/after screenshot pair differs above the threshold
 *                                and is not listed as an intended change
 *
 * It reads the BUILT css (dist/ or .output/public), not the sources, because import order,
 * layer() on @import and minifier output decide the real cascade.
 *
 * Usage:
 *   node check-layer-order.mjs [options] <css file or directory>...
 *     --order base,grundform,utilities   required relative order of top-level layers (default)
 *     --baseline <file.json>             ratchet: unlayered rules allowed today (selector, reason, expires)
 *     --write-baseline <file.json>       write the current unlayered set as a baseline (reason TODO) and exit 0
 *     --before <dir> --after <dir>       visual gate: compare same-named PNGs with ImageMagick
 *     --max-diff-pct <n>                 visual threshold per shot, percent of pixels (default 0.05)
 *     --intended <file.json>             { "<shot name>": { "reason": "...", "maxPct": 2 } }
 *     --json                             machine readable report on stdout
 *
 * One entry point: wire it as `npm run check:cascade` and call it from `verify` and CI.
 * Exit 0 on pass, 1 on any failure. Every failure line starts with a stable code and names the fix.
 */
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { execFileSync } from "node:child_process";

const argv = process.argv.slice(2);
const opt = { order: "base,grundform,utilities", maxDiffPct: 0.05, files: [] };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  const next = () => argv[++i];
  if (a === "--order") opt.order = next();
  else if (a === "--baseline") opt.baseline = next();
  else if (a === "--write-baseline") opt.writeBaseline = next();
  else if (a === "--before") opt.before = next();
  else if (a === "--after") opt.after = next();
  else if (a === "--max-diff-pct") opt.maxDiffPct = Number(next());
  else if (a === "--intended") opt.intended = next();
  else if (a === "--json") opt.json = true;
  else opt.files.push(a);
}

function collectCss(p) {
  const st = statSync(p);
  if (st.isFile()) return p.endsWith(".css") ? [p] : [];
  return readdirSync(p).flatMap((f) => (f === "node_modules" ? [] : collectCss(join(p, f))));
}

/** Minimal CSS scanner: tracks blocks, @layer statements and unlayered style rules. */
export function analyze(css, file = "<css>") {
  const layers = []; // full dotted names, first-declared order
  const seen = new Set();
  const unlayered = [];
  const stack = []; // { kind: 'layer'|'cond'|'rule'|'other', name, prelude, decls }
  let buf = "";
  let anon = 0;
  const layerPath = () => stack.filter((f) => f.kind === "layer").map((f) => f.name);
  const register = (name) => {
    const parts = name.split(".");
    for (let k = 1; k <= parts.length; k++) {
      const full = [...layerPath(), ...parts.slice(0, k)].join(".");
      if (!seen.has(full)) { seen.add(full); layers.push(full); }
    }
  };
  const inRule = () => stack.length && stack[stack.length - 1].kind === "rule";
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === "/" && css[i + 1] === "*") { const e = css.indexOf("*/", i + 2); i = e < 0 ? css.length : e + 1; continue; }
    if (c === "\\") { buf += c + (css[i + 1] ?? ""); i++; continue; } // escaped char in a selector, e.g. .content-\[\'x\'\]
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < css.length && css[j] !== c) { if (css[j] === "\\") j++; j++; }
      buf += css.slice(i, j + 1); i = j; continue;
    }
    if (c === "{") {
      const prelude = buf.trim(); buf = "";
      let frame;
      const m = /^@([\w-]+)\s*(.*)$/s.exec(prelude);
      if (m) {
        const at = m[1].toLowerCase();
        if (at === "layer") {
          const name = m[2].trim() || `__anon${anon++}`;
          register(name);
          frame = { kind: "layer", name };
        } else if (["media", "supports", "container", "scope", "starting-style", "document"].includes(at)) {
          frame = { kind: "cond", name: prelude };
        } else frame = { kind: "other", name: at }; // font-face, keyframes, property, page...
      } else frame = { kind: "rule", prelude, decls: [] };
      // nested layer names live under their parent layer path
      if (frame.kind === "layer" && frame.name.includes(".")) {
        // register() already added each segment; the frame contributes all segments to the path
        stack.push(...frame.name.split(".").map((n) => ({ kind: "layer", name: n })));
        stack[stack.length - 1].multi = frame.name.split(".").length;
        continue;
      }
      stack.push(frame);
      continue;
    }
    if (c === ";" || c === "}") {
      const text = buf.trim(); buf = "";
      if (text) {
        if (inRule()) stack[stack.length - 1].decls.push(text);
        else {
          const m = /^@layer\s+(.+)$/s.exec(text);
          if (m) m[1].split(",").map((s) => s.trim()).filter(Boolean).forEach(register);
          const imp = /^@import\b.*\blayer\(([^)]+)\)/s.exec(text);
          if (imp) register(imp[1].trim());
        }
      }
      if (c === "}") {
        const top = stack.pop();
        if (!top) continue;
        if (top.kind === "layer" && top.multi) for (let k = 1; k < top.multi; k++) stack.pop();
        if (top.kind === "rule") {
          const hasLayer = stack.some((f) => f.kind === "layer");
          const inOther = stack.some((f) => f.kind === "other");
          const real = top.decls.filter((d) => !/^--[\w-]+\s*:/.test(d));
          if (!hasLayer && !inOther && real.length) {
            const parents = stack.filter((f) => f.kind === "rule").map((f) => f.prelude);
            const conds = stack.filter((f) => f.kind === "cond").map((f) => f.name);
            const selector = [...parents, top.prelude].join(" ").replace(/\s+/g, " ");
            unlayered.push({ selector: (conds.length ? conds.join(" ") + " " : "") + selector, props: real.map((d) => d.split(":")[0].trim()), file: basename(file) });
          }
        }
      }
      continue;
    }
    buf += c;
  }
  const topLevel = [];
  for (const l of layers) { const t = l.split(".")[0]; if (!topLevel.includes(t)) topLevel.push(t); }
  return { layers, topLevel, unlayered };
}

function checkOrder(topLevel, order) {
  const errs = [];
  const want = order.split(",").map((s) => s.trim());
  for (const w of want) if (!topLevel.includes(w)) errs.push(`GRUNDFORM_LAYER_MISSING: layer "${w}" is not declared in the built CSS. Fix: declare \`@layer theme, base, grundform, components, utilities;\` before \`@import "tailwindcss"\` and put vendored Grundform in \`layer(grundform)\` (or @layer grundform.base / grundform.components).`);
  for (let k = 0; k + 1 < want.length; k++) {
    const a = topLevel.indexOf(want[k]), b = topLevel.indexOf(want[k + 1]);
    if (a >= 0 && b >= 0 && a > b) errs.push(`GRUNDFORM_LAYER_ORDER: "${want[k]}" must come before "${want[k + 1]}" but the built order is [${topLevel.join(", ")}]. Fix: the first @layer statement in the bundle decides order; put \`@layer theme, base, grundform, components, utilities;\` in the first imported file.`);
  }
  return errs;
}

function visualGate() {
  const errs = [], rows = [];
  const intended = opt.intended && existsSync(opt.intended) ? JSON.parse(readFileSync(opt.intended, "utf8")) : {};
  const pngs = readdirSync(opt.before).filter((f) => f.endsWith(".png"));
  const prefixed = pngs.some((f) => f.startsWith("before-"));
  for (const f of pngs.filter((f) => (prefixed ? f.startsWith("before-") : true)).sort()) {
    const name = f.replace(/^before-/, "");
    const afterName = prefixed ? `after-${name}` : f; // before-x.png pairs with after-x.png; unprefixed dirs pair by same name
    const b = join(opt.before, f), a = join(opt.after, afterName);
    if (!existsSync(a)) { errs.push(`GRUNDFORM_VISUAL_DIFF: no after shot for ${f}. Fix: shoot the same routes and viewports before and after.`); continue; }
    let ae;
    try { ae = execFileSync("compare", ["-metric", "AE", b, a, "null:"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
    catch (e) { ae = String(e.stderr || e.stdout); }
    const px = Number(String(ae).trim().split(/\s/)[0]);
    const [w, h] = execFileSync("identify", ["-format", "%w %h", b], { encoding: "utf8" }).split(" ").map(Number);
    const pct = (100 * px) / (w * h);
    const allow = intended[name]?.maxPct ?? opt.maxDiffPct;
    rows.push({ shot: name, pct: +pct.toFixed(3), allow, reason: intended[name]?.reason || "" });
    if (!(pct <= allow)) errs.push(`GRUNDFORM_VISUAL_DIFF: ${name} differs ${pct.toFixed(3)}% (limit ${allow}%). Fix: if intended, add {"${name}": {"reason": "...", "maxPct": ${Math.ceil(pct * 10) / 10}}} to the intended file with the changed region named; otherwise the cascade change leaked.`);
  }
  return { errs, rows };
}

const files = opt.files.flatMap(collectCss);
const report = { files: files.map((f) => basename(f)), errors: [] };
if (opt.files.length && !files.length) report.errors.push("GRUNDFORM_LAYER_MISSING: no built CSS found. Fix: run the production build first and pass dist/ or .output/public.");
if (files.length) {
  const res = files.map((f) => analyze(readFileSync(f, "utf8"), f));
  // the app stylesheet is the one that declares the most layers (vendor chunks may declare none)
  const main = res.reduce((x, y) => (y.topLevel.length > x.topLevel.length ? y : x));
  report.topLevelOrder = main.topLevel;
  report.layers = main.layers;
  report.errors.push(...checkOrder(main.topLevel, opt.order));
  const unl = res.flatMap((r) => r.unlayered);
  report.unlayeredCount = unl.length;
  if (opt.writeBaseline) {
    const uniq = [...new Set(unl.map((u) => u.selector))].map((selector) => ({ selector, reason: "TODO: why this must stay unlayered", expires: "2026-12-31" }));
    writeFileSync(opt.writeBaseline, JSON.stringify(uniq, null, 2) + "\n");
    console.log(`wrote ${uniq.length} baseline entries to ${opt.writeBaseline}`);
    process.exit(0);
  }
  const base = opt.baseline ? JSON.parse(readFileSync(opt.baseline, "utf8")) : [];
  const today = new Date().toISOString().slice(0, 10);
  // An exception only counts with a real reason and a valid expiry date; otherwise it is not an exception.
  const valid = new Map();
  for (const b of base) {
    const reason = typeof b.reason === "string" ? b.reason.trim() : "";
    const expires = typeof b.expires === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.expires) && !Number.isNaN(Date.parse(b.expires)) ? b.expires : null;
    if (!b.selector || !reason || /^TODO\b/i.test(reason) || !expires) {
      report.errors.push(`GRUNDFORM_BASELINE_INVALID: baseline entry "${b.selector ?? "?"}" needs a selector, a written reason (not TODO) and an expiry date (YYYY-MM-DD). Fix: fill them in or remove the entry.`);
      continue;
    }
    if (expires < today) {
      report.errors.push(`GRUNDFORM_BASELINE_EXPIRED: unlayered exception "${b.selector}" expired ${expires}. Fix: move the rule into a layer or renew with a reason.`);
      continue;
    }
    valid.set(b.selector, b);
  }
  const fresh = unl.filter((u) => !valid.has(u.selector));
  report.newUnlayered = fresh;
  for (const u of fresh) report.errors.push(`GRUNDFORM_UNLAYERED: "${u.selector}" { ${u.props.join(", ")} } in ${u.file} is outside every @layer, so it beats all utilities. Fix: wrap it in @layer grundform.components (or the site layer) or, if it must win, add it to the baseline with a reason and an expiry date.`);
}
if (opt.before && opt.after) {
  const v = visualGate();
  report.visual = v.rows;
  report.errors.push(...v.errs);
}
if (opt.json) console.log(JSON.stringify(report, null, 2));
else {
  if (report.topLevelOrder) console.log(`layer order: ${report.topLevelOrder.join(" < ")}  (unlayered rules: ${report.unlayeredCount}, new: ${report.newUnlayered.length})`);
  for (const r of report.visual || []) console.log(`visual ${r.shot}: ${r.pct}% (limit ${r.allow}%)${r.reason ? " intended: " + r.reason : ""}`);
  for (const e of report.errors) console.error(e);
  console.log(report.errors.length ? `cascade check FAILED (${report.errors.length})` : "cascade check ok");
}
process.exit(report.errors.length ? 1 : 0);
