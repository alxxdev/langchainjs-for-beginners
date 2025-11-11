/**
 * Embedding Relationships - Vector Math Demo
 *
 * This example demonstrates how embeddings capture semantic relationships
 * that can be manipulated through vector arithmetic.
 *
 * Run: npx tsx 06-documents-embeddings-semantic-search/code/09-embedding-relationships.ts
 *
 * 🤖 Try asking GitHub Copilot Chat (https://github.com/features/copilot):
 * - "How does vector arithmetic like 'King - Man + Woman = Queen' actually work?"
 * - "What real-world applications benefit from embedding relationships?"
 */

import { OpenAIEmbeddings } from "@langchain/openai";
import "dotenv/config";

// Helper function to calculate cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Helper function to subtract two vectors
function subtractVectors(vecA: number[], vecB: number[]): number[] {
  return vecA.map((a, i) => a - vecB[i]);
}

// Helper function to add two vectors
function addVectors(vecA: number[], vecB: number[]): number[] {
  return vecA.map((a, i) => a + vecB[i]);
}

async function main() {
  console.log("🔬 Embedding Relationships: Vector Math Demo\n");
  console.log("This demonstrates how embeddings capture semantic relationships");
  console.log("that can be manipulated mathematically.\n");
  console.log("=".repeat(70) + "\n");

  // Initialize embeddings model
  const embeddings = new OpenAIEmbeddings({
    model: process.env.AI_EMBEDDING_MODEL || "text-embedding-3-small",
    configuration: { baseURL: process.env.AI_ENDPOINT },
    apiKey: process.env.AI_API_KEY,
  });

  // ============================================================================
  // Example 1: Animal Life Stages
  // Demonstrating: Puppy - Dog + Cat ≈ Kitten
  // ============================================================================

  console.log("🐶 Example 1: Animal Life Stages");
  console.log("─".repeat(70));
  console.log("\nTesting: Embedding('Puppy') - Embedding('Dog') + Embedding('Cat')");
  console.log("Expected result: Should be similar to Embedding('Kitten')\n");

  // Generate embeddings for animals and their young
  const [puppyEmbed, dogEmbed, catEmbed, kittenEmbed] = await Promise.all([
    embeddings.embedQuery("Puppy"),
    embeddings.embedQuery("Dog"),
    embeddings.embedQuery("Cat"),
    embeddings.embedQuery("Kitten"),
  ]);

  // Perform vector arithmetic: Puppy - Dog + Cat
  const puppyMinusDog = subtractVectors(puppyEmbed, dogEmbed);
  const result1 = addVectors(puppyMinusDog, catEmbed);

  // Calculate similarity with Kitten
  const similarityToKitten = cosineSimilarity(result1, kittenEmbed);

  console.log(`✅ Similarity to 'Kitten': ${(similarityToKitten * 100).toFixed(2)}%`);
  console.log("\nWhat this means:");
  console.log("  • Puppy is to Dog as Kitten is to Cat");
  console.log("  • The vectors encode 'species' and 'life stage' as separate dimensions");
  console.log("  • Subtracting 'Dog' removes the adult dog, adding 'Cat' finds the young cat");

  // Show comparison with unrelated animal
  const birdEmbed = await embeddings.embedQuery("Bird");
  const similarityToBird = cosineSimilarity(result1, birdEmbed);

  console.log(`\n📊 Comparison: Similarity to 'Bird': ${(similarityToBird * 100).toFixed(2)}%`);
  console.log(`   (Lower than Kitten - Bird is a different species, not a young cat)\n`);

  console.log("=".repeat(70) + "\n");

  // ============================================================================
  // Example 2: Cultural Food Relationships
  // Demonstrating: pizza - Italy + Japan ≈ sushi
  // ============================================================================

  console.log("🍕 Example 2: Cultural Food Relationships");
  console.log("─".repeat(70));
  console.log("\nTesting: Embedding('pizza') - Embedding('Italy') + Embedding('Japan')");
  console.log("Expected result: Should be similar to Embedding('sushi')\n");

  // Generate embeddings for food and countries
  const [pizzaEmbed, italyEmbed, japanEmbed, sushiEmbed] = await Promise.all([
    embeddings.embedQuery("pizza"),
    embeddings.embedQuery("Italy"),
    embeddings.embedQuery("Japan"),
    embeddings.embedQuery("sushi"),
  ]);

  // Perform vector arithmetic: pizza - Italy + Japan
  const pizzaMinusItaly = subtractVectors(pizzaEmbed, italyEmbed);
  const result2 = addVectors(pizzaMinusItaly, japanEmbed);

  // Calculate similarity with sushi
  const similarityToSushi = cosineSimilarity(result2, sushiEmbed);

  console.log(`✅ Similarity to 'sushi': ${(similarityToSushi * 100).toFixed(2)}%`);
  console.log("\nWhat this means:");
  console.log("  • Pizza is to Italy as sushi is to Japan");
  console.log("  • The embeddings understand cultural food associations");
  console.log(
    "  • Subtracting 'Italy' removes the country, adding 'Japan' finds Japan's iconic food"
  );

  // Show comparison with unrelated food
  const burgerEmbed = await embeddings.embedQuery("hamburger");
  const similarityToBurger = cosineSimilarity(result2, burgerEmbed);

  console.log(
    `\n📊 Comparison: Similarity to 'hamburger': ${(similarityToBurger * 100).toFixed(2)}%`
  );
  console.log(`   (Lower than sushi, as expected - hamburger is more associated with USA)\n`);

  console.log("=".repeat(70) + "\n");

  // ============================================================================
  // Example 3: Synonym Clustering
  // Demonstrating: Similar words have similar embeddings
  // ============================================================================

  console.log("😊 Example 3: Synonym Clustering");
  console.log("─".repeat(70));
  console.log("\nTesting similarity between synonyms:\n");

  // Generate embeddings for synonyms
  const [happyEmbed, joyfulEmbed, cheerfulEmbed, sadEmbed] = await Promise.all([
    embeddings.embedQuery("happy"),
    embeddings.embedQuery("joyful"),
    embeddings.embedQuery("cheerful"),
    embeddings.embedQuery("sad"),
  ]);

  // Calculate similarities
  const happyJoyful = cosineSimilarity(happyEmbed, joyfulEmbed);
  const happyCheerful = cosineSimilarity(happyEmbed, cheerfulEmbed);
  const happySad = cosineSimilarity(happyEmbed, sadEmbed);

  console.log(
    `Similarity: 'happy' ↔ 'joyful'   = ${(happyJoyful * 100).toFixed(2)}% ✅ (synonyms)`
  );
  console.log(
    `Similarity: 'happy' ↔ 'cheerful' = ${(happyCheerful * 100).toFixed(2)}% ✅ (synonyms)`
  );
  console.log(`Similarity: 'happy' ↔ 'sad'      = ${(happySad * 100).toFixed(2)}% ❌ (opposites)`);

  console.log("\nWhat this means:");
  console.log("  • Words with similar meanings have similar embeddings");
  console.log("  • They cluster close together in vector space");
  console.log("  • Opposite meanings have lower similarity scores");

  console.log("\n" + "=".repeat(70) + "\n");

  // ============================================================================
  // Summary
  // ============================================================================

  console.log("🎓 Key Takeaways:");
  console.log("─".repeat(70));
  console.log("\n1. Embeddings capture semantic relationships:");
  console.log("   • Puppy:Dog :: Kitten:Cat (animal life stages)");
  console.log("   • pizza:Italy :: sushi:Japan (cultural foods)");
  console.log("");
  console.log("2. Vector arithmetic works on meanings:");
  console.log("   • Adding/subtracting embeddings preserves relationships");
  console.log("   • The math 'understands' concepts like species, life stage, country, food");
  console.log("");
  console.log("3. Synonyms cluster together:");
  console.log("   • Similar meanings = nearby in vector space");
  console.log("   • Different meanings = farther apart");
  console.log("");
  console.log("4. This enables powerful applications:");
  console.log("   • Semantic search (find similar meanings, not just keywords)");
  console.log("   • Analogy completion (A:B :: C:?)");
  console.log("   • Document clustering (group by topic)");
  console.log("   • Recommendation systems (find similar items)");
  console.log("\n✅ These relationships emerge from training on massive text corpora!");
}

main().catch(console.error);
