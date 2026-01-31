// install-components.mjs
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const REPO_RAW_BASE =
  "https://raw.githubusercontent.com/psdev0/test-registry/refs/heads/main/registry";

/**
 * Usage:
 * node install-components.mjs button button:icon card modal
 */
async function run() {
  const componentArgs = process.argv.slice(2);

  if (componentArgs.length === 0) {
    console.log("❌ Usage: node install-components.mjs <component[:variant]> ...");
    process.exit(1);
  }

  for (const arg of componentArgs) {
    const [componentName, variantName = "default"] = arg.split(":");
    const REGISTRY_URL = `${REPO_RAW_BASE}/${componentName}`;
    console.log(`\nFetching component: ${componentName} (variant: ${variantName})`);

    // Fetch component metadata
    let meta;
    try {
      const metaRes = await fetch(`${REGISTRY_URL}/index.json`);
      if (!metaRes.ok) throw new Error(`Component not found: ${componentName}`);
      meta = await metaRes.json();
    } catch (err) {
      console.error(`❌ Failed to fetch metadata for ${componentName}:`, err.message);
      continue;
    }

    // 1️⃣ Install dependencies
    if (meta.dependencies && meta.dependencies.length > 0) {
      console.log("Installing dependencies:", meta.dependencies.join(", "));
      try {
        execSync(`npm install ${meta.dependencies.join(" ")}`, { stdio: "inherit" });
      } catch (err) {
        console.error(`❌ Failed to install dependencies for ${componentName}:`, err.message);
      }
    }

    // 2️⃣ Determine files to download
    let files = [];
    if (variantName === "default" && meta.files) {
      files = meta.files;
    } else if (meta.variants && meta.variants[variantName]) {
      files = meta.variants[variantName].files;
    } else {
      console.error(`❌ Variant "${variantName}" not found for component "${componentName}"`);
      continue;
    }

    // 3️⃣ Download each file
    for (const file of files) {
      const sourceUrl = `${REGISTRY_URL}/${file.source}`;
      const destPath = path.resolve(process.cwd(), file.path);

      try {
        console.log(`Downloading ${file.source}`);
        const content = await fetch(sourceUrl).then(r => r.text());
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, content);
      } catch (err) {
        console.error(`❌ Failed to download ${file.source}:`, err.message);
      }
    }

    console.log(`✅ Component "${componentName}" (variant: ${variantName}) installed`);
  }
}

run();
