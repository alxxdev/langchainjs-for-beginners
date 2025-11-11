/**
 * Validate All Code Examples (Parallel)
 *
 * This script runs code examples with controlled parallelism (10 concurrent tests)
 * to speed up validation while avoiding rate limiting from AI providers.
 *
 * Run: npx tsx scripts/validate-examples-parallel.ts
 *    or: npm run test:parallel
 *
 * Benefits over sequential version:
 * - ~10x faster execution (runs 10 tests at once)
 * - Still avoids rate limiting (only 10 concurrent API calls)
 * - Same reliability and error handling
 * - As each test completes, the next one starts immediately
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

// Concurrency limit - run this many tests at once
const CONCURRENCY = 10;

/**
 * Run tests with controlled concurrency using a queue-based worker pool
 */
async function runTestsWithConcurrency(
  files: string[],
  concurrency: number,
  projectRoot: string
): Promise<TestResult[]> {
  const results: TestResult[] = new Array(files.length);
  let nextIndex = 0;

  // Worker function that processes items from the queue
  const worker = async (): Promise<void> => {
    while (true) {
      // Grab the next file index and increment atomically
      const currentIndex = nextIndex++;

      // Check if we've run out of files
      if (currentIndex >= files.length) break;

      const file = files[currentIndex];
      const relativePath = file.replace(projectRoot + "/", "");

      // Show when test STARTS
      console.log(`▶️  [${currentIndex + 1}/${files.length}] Starting: ${relativePath}`);

      // Run the test (this is where the parallel execution happens)
      const serverConfig = getServerConfig(file);
      const result = serverConfig
        ? await runServerExample(file, serverConfig)
        : await runExample(file);

      // Store result
      results[currentIndex] = result;

      // Show when test COMPLETES
      if (result.success) {
        console.log(`   ✅ [${currentIndex + 1}/${files.length}] Passed: ${relativePath} (${result.duration}ms)\n`);
      } else {
        console.log(`   ❌ [${currentIndex + 1}/${files.length}] Failed: ${relativePath}`);
        if (result.error) {
          console.log(`      Error: ${result.error.split("\n")[0]}`);
        }
        console.log();
      }
    }
  };

  // Start worker pool
  const workers: Promise<void>[] = [];
  for (let i = 0; i < Math.min(concurrency, files.length); i++) {
    workers.push(worker());
  }

  // Wait for all workers to complete
  await Promise.all(workers);

  return results;
}

async function main() {
  console.log("🧪 Validating All Code Examples (Parallel Mode)\n");
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

  console.log(`🚀 Running ${allFiles.length} examples with concurrency: ${CONCURRENCY}\n`);
  console.log(`💡 This means ${CONCURRENCY} tests run in parallel at all times\n`);
  console.log(`⚡ As each test completes, the next one starts immediately\n`);
  console.log("=" + "=".repeat(79) + "\n");

  const startTime = Date.now();

  // Run tests with controlled concurrency
  const results = await runTestsWithConcurrency(allFiles, CONCURRENCY, projectRoot);

  const totalDuration = Date.now() - startTime;

  // Display final results
  displayFinalResults(results, allFiles.length, projectRoot, totalDuration);

  // Exit with appropriate code
  const failed = results.filter((r) => !r.success).length;
  if (failed > 0) {
    console.log("❌ Validation failed. Please fix the errors above.\n");
    process.exit(1);
  } else {
    console.log("✅ All examples validated successfully!\n");
    console.log(`⚡ Parallel execution (${CONCURRENCY} tests at a time) completed in ${(totalDuration / 60000).toFixed(1)} minutes\n`);
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("❌ Validation script error:", error);
  process.exit(1);
});
