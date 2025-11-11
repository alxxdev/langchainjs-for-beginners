/**
 * Validate All Code Examples (Sequential)
 *
 * This script runs all code examples across all chapters sequentially
 * to ensure they execute without errors. Used in CI/CD pipeline.
 *
 * Run: npm run validate
 */

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  findChapters,
  collectAllCodeFiles,
  displayTestSummary,
  runExample,
  runServerExample,
  getServerConfig,
  displayFinalResults,
  type TestResult,
} from "./validation-common.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log("🧪 Validating All Code Examples\n");
  console.log("=" + "=".repeat(79) + "\n");

  // Get project root (parent directory of scripts folder)
  const projectRoot = join(__dirname, "..");

  // Find all chapter directories
  const chapters = await findChapters(projectRoot);
  console.log(`📂 Found ${chapters.length} chapters: ${chapters.join(", ")}\n`);

  // Collect all code files from all chapters
  const allFiles = await collectAllCodeFiles(projectRoot, chapters);

  // Display summary
  displayTestSummary(allFiles);

  console.log(`🏃 Running ${allFiles.length} examples...\n`);
  console.log("=" + "=".repeat(79) + "\n");

  const results: TestResult[] = [];
  let passed = 0;
  let failed = 0;

  // Run tests sequentially to avoid rate limiting
  for (let i = 0; i < allFiles.length; i++) {
    const file = allFiles[i];
    const relativePath = file.replace(projectRoot + "/", "");

    process.stdout.write(`[${i + 1}/${allFiles.length}] ${relativePath}... `);

    const serverConfig = getServerConfig(file);
    const result = serverConfig
      ? await runServerExample(file, serverConfig)
      : await runExample(file);
    results.push(result);

    if (result.success) {
      passed++;
      console.log(`✅ (${result.duration}ms)`);
    } else {
      failed++;
      console.log(`❌`);
      if (result.error) {
        console.log(`   Error: ${result.error.split("\n")[0]}`);
      }
    }
  }

  // Display final results
  displayFinalResults(results, allFiles.length, projectRoot);

  // Exit with appropriate code
  if (failed > 0) {
    console.log("❌ Validation failed. Please fix the errors above.\n");
    process.exit(1);
  } else {
    console.log("✅ All examples validated successfully!\n");
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("❌ Validation script error:", error);
  process.exit(1);
});
