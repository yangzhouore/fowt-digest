/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const { compileFunction } = require("node:vm");
const ts = require("typescript");

function loadStaticAdapter(fileName) {
  const cache = new Map();
  function load(file) {
    if (file.endsWith(".json")) return require(file);
    if (cache.has(file)) return cache.get(file);
    const compiled = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    });
    const compiledExports = {};
    const resolve = (name) => {
      const target = path.resolve(path.dirname(file), name);
      return load(path.extname(target) ? target : target + ".ts");
    };
    compileFunction(compiled.outputText, ["require", "exports"], { filename: file })(resolve, compiledExports);
    cache.set(file, compiledExports);
    return compiledExports;
  }
  return load(path.resolve(__dirname, "../data", fileName));
}

// Load the same static adapter and resolver used by the Company pages.
function loadCompanyIntelligence() {
  return loadStaticAdapter("company-intelligence-adapter.ts");
}

if (require.main === module) {
  try {
    loadCompanyIntelligence();
    console.log("Company Intelligence event and source validation passed.");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { loadCompanyIntelligence, loadStaticAdapter };
