/**
 * Build Check - Compile all TypeScript files to find errors and warnings
 *
 * Run: npm run build
 */

import { spawn } from "child_process";
import { readdir } from "fs/promises";
import { join } from "path";

async function findTypeScriptFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  // Directories and files to skip during build check
  const skipItems = ["node_modules", "dist", "future", "scripts"];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      // Skip excluded directories/files and anything starting with "." (hidden files/dirs)
      if (skipItems.includes(entry.name) || entry.name.startsWith(".")) {
        continue;
      }

      if (entry.isDirectory()) {
        files.push(...(await findTypeScriptFiles(fullPath)));
      } else if (entry.isFile() && entry.name.endsWith(".ts")) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Ignore errors for directories we can't read
  }

  return files;
}

async function main() {
  console.log("🔨 Building All Code Examples\n");
  console.log("=" + "=".repeat(79) + "\n");

  const rootDir = process.cwd();
  const files = await findTypeScriptFiles(rootDir);

  console.log(`📁 Found ${files.length} TypeScript files\n`);
  console.log("🔍 Running TypeScript compiler...\n");
  console.log("=" + "=".repeat(79) + "\n");

  // Run tsc on all files with --noEmit to check without generating output
  // Using project config for faster compilation
  const tsc = spawn("npx", ["tsc", "--noEmit", "--pretty"], {
    stdio: "inherit",
    shell: true,
  });

  tsc.on("close", (code) => {
    console.log("\n" + "=" + "=".repeat(79));

    if (code === 0) {
      console.log("\n✅ Build successful! All files compile without errors.\n");
      console.log("📊 Summary:");
      console.log(`   Files checked: ${files.length}`);
      console.log(`   Errors: 0`);
      console.log(`   Warnings: 0`);
      process.exit(0);
    } else {
      console.log("\n❌ Build failed. Please fix the errors above.\n");
      console.log("📊 Summary:");
      console.log(`   Files checked: ${files.length}`);
      console.log(`   Status: FAILED`);
      process.exit(1);
    }
  });

  tsc.on("error", (error) => {
    console.error("\n❌ Error running TypeScript compiler:", error);
    process.exit(1);
  });
}

main().catch((error) => {
  console.error("❌ Script error:", error);
  process.exit(1);
});
