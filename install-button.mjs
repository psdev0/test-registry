// install-button.mjs
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const REGISTRY_URL =
  "https://raw.githubusercontent.com/psdev0/test-registry/refs/heads/main/registry/button";

async function run() {
  console.log("Fetching registry metadata...");

  const metaRes = await fetch(`${REGISTRY_URL}/index.json`);
  const meta = await metaRes.json();

  // 1️⃣ Install npm dependencies first
  if (meta.dependencies && meta.dependencies.length > 0) {
    console.log("Installing dependencies:", meta.dependencies.join(", "));
    execSync(`npm install ${meta.dependencies.join(" ")}`, {
      stdio: "inherit",
    });
  }

  // 2️⃣ Copy files
  for (const file of meta.files) {
    const sourceUrl = `${REGISTRY_URL}/${file.source}`;
    const destPath = path.resolve(process.cwd(), file.path);

    console.log(`Downloading ${file.source}`);
    const content = await fetch(sourceUrl).then((r) => r.text());

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, content);
  }

  console.log("✅ Button installed with dependencies");
}

run();
