import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const REPO_RAW_BASE =
  "https://raw.githubusercontent.com/psdev0/test-registry/refs/heads/main/registry";

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

    const metaRes = await fetch(`${REGISTRY_URL}/index.json`);
    if (!metaRes.ok) {
      console.error(`❌ Component not found: ${componentName}`);
      continue;
    }
    const meta = await metaRes.json();

    // 1️⃣ Install dependencies
    if (meta.dependencies && meta.dependencies.length > 0) {
      console.log("Installing dependencies:", meta.dependencies.join(", "));
      execSync(`npm install ${meta.dependencies.join(" ")}`, { stdio: "inherit" });
    }

    // 2️⃣ Determine files to download
    let files = meta.files || [];
    if (meta.variants && meta.variants[variantName]) {
      files = meta.variants[variantName].files;
    }

    // 3️⃣ Download files
    for (const file of files) {
      const sourceUrl = `${REGISTRY_URL}/${file.source}`;
      const destPath = path.resolve(process.cwd(), file.path);

      console.log(`Downloading ${file.source}`);
      const content = await fetch(sourceUrl).then(r => r.text());

      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, content);
    }

    console.log(`✅ Component "${componentName}" (variant: ${variantName}) installed`);
  }
}

run();
