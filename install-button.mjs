import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const REPO_RAW_BASE =
  "https://raw.githubusercontent.com/psdev0/test-registry/refs/heads/main/registry";

/**
 * Usage:
 * node install-components.mjs button card modal
 */
async function run() {
  const componentNames = process.argv.slice(2);

  if (componentNames.length === 0) {
    console.log(
      "❌ Usage: node install-components.mjs <component1> <component2> ...",
    );
    process.exit(1);
  }

  for (const componentName of componentNames) {
    const REGISTRY_URL = `${REPO_RAW_BASE}/${componentName}`;
    console.log(`\nFetching component: ${componentName}`);

    // 1️⃣ Fetch metadata
    const metaRes = await fetch(`${REGISTRY_URL}/index.json`);
    if (!metaRes.ok) {
      console.error(`❌ Component not found: ${componentName}`);
      continue;
    }
    const meta = await metaRes.json();

    // 2️⃣ Install dependencies
    if (meta.dependencies && meta.dependencies.length > 0) {
      console.log("Installing dependencies:", meta.dependencies.join(", "));
      execSync(`npm install ${meta.dependencies.join(" ")}`, {
        stdio: "inherit",
      });
    }

    // 3️⃣ Download files
    for (const file of meta.files) {
      const sourceUrl = `${REGISTRY_URL}/${file.source}`;
      const destPath = path.resolve(process.cwd(), file.path);

      console.log(`Downloading ${file.source}`);
      const content = await fetch(sourceUrl).then((r) => r.text());

      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, content);
    }

    console.log(`✅ Component "${componentName}" installed`);
  }
}

run();
