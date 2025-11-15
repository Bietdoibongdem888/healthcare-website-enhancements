// Utility script to regenerate the client JS sources from the historical TS/TSX files.
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const esbuild = require(require.resolve("esbuild", { paths: [path.join(repoRoot, "client")] }));
const overwrite = process.env.FORCE_CONVERT === "1";

function getGitFile(relativePath) {
  return execSync(`git show HEAD:${relativePath}`, {
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"],
  }).toString();
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function normalizeExtensions(code) {
  return code
    .replace(/\.tsx(?=["'`])/g, ".js")
    .replace(/\.ts(?=["'`])/g, ".js");
}

function convert() {
  const filesOutput = execSync(`git ls-tree -r HEAD --name-only -- client/src`, {
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"],
  }).toString();

  const files = filesOutput
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"));

  files.forEach((tsPath) => {
    const targetRel = tsPath.replace(/\.tsx?$/, ".js");
    const targetAbs = path.join(repoRoot, targetRel);

    if (!overwrite && fs.existsSync(targetAbs)) {
      console.log(`Skipping existing ${targetRel}`);
      return;
    }

    const source = getGitFile(tsPath);
    const loader = tsPath.endsWith(".tsx") ? "tsx" : "ts";
    const { code } = esbuild.transformSync(source, {
      loader,
      format: "esm",
      jsx: "preserve",
    });

    const normalized = normalizeExtensions(code);
    ensureDir(path.dirname(targetAbs));
    fs.writeFileSync(targetAbs, normalized, "utf8");
    console.log(`Converted ${tsPath} -> ${targetRel}`);
  });
}

convert();
