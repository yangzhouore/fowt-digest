import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, resolve } from "node:path";
import { compileFunction } from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import type { getLatestBriefingPreview } from "../../../app/briefing-weeks";
import type { EditorialImage } from "../../../app/editorial-images";
import type { HomepageWeeklyBriefing } from "../../../app/homepage-weekly-briefing";

// Render the production components against local fixture records. Only the
// language provider is substituted so the two server-rendered locales can be inspected.
export function renderHomepageFixture(
  preview: ReturnType<typeof getLatestBriefingPreview>,
  language: "en" | "zh" = "en",
  images: Record<string, Record<string, EditorialImage>> = {},
) {
  const cache = new Map<string, Record<string, unknown>>();
  function load(file: string): Record<string, unknown> {
    if (file.endsWith("language-context.tsx")) return { useLanguage: () => ({ language }) };
    const cached = cache.get(file);
    if (cached) return cached;
    const exports = {};
    cache.set(file, exports);
    const requireModule = createRequire(file);
    const compiled = ts.transpileModule(readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    compileFunction(compiled, ["require", "exports"], { filename: file })((name: string) => {
      if (!name.startsWith(".")) return requireModule(name);
      const path = resolve(dirname(file), name);
      const target = extname(path) ? path : [path + ".ts", path + ".tsx"].find(existsSync);
      if (!target) throw new Error(`Unresolved fixture module ${name} in ${file}`);
      return load(target);
    }, exports);
    return exports;
  }
  const app = resolve(__dirname, "../../../app");
  Object.assign(load(resolve(app, "editorial-images.ts")).editorialImages as object, images);
  const component = load(resolve(app, "homepage-weekly-briefing.tsx")).HomepageWeeklyBriefing as typeof HomepageWeeklyBriefing;
  return renderToStaticMarkup(createElement("main", null, createElement(component, { preview })));
}
