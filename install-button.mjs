// install-button.mjs
import fs from "fs";
import path from "path";

const REGISTRY_URL =
  "https://raw.githubusercontent.com/psdev0/registry-test/main/registry/button";

async function run() {
  console.log("Fetching registry metadata...");

  const metaRes = await fetch(`${REGISTRY_URL}/index.json`);
  const meta = await metaRes.json();

  for (const file of meta.files) {
    const sourceUrl = `${REGISTRY_URL}/${file.source}`;
    const destPath = path.resolve(process.cwd(), file.path);

    console.log(`Downloading ${file.source}`);
    const content = await fetch(sourceUrl).then(r => r.text());

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, content);
  }

  console.log("✅ Button installed");
}

run();
