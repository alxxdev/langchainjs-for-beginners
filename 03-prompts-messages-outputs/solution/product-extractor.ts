/**
 * Product Data Extractor with Structured Outputs
 * Run: npx tsx 03-prompts-messages-outputs/solution/product-extractor.ts
 */

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import * as z from "zod";
import "dotenv/config";

async function main() {
  console.log("🏷️  Product Data Extractor with Structured Outputs\n");

  const model = new ChatOpenAI({
    model: process.env.AI_MODEL,
    configuration: { baseURL: process.env.AI_ENDPOINT },
    apiKey: process.env.AI_API_KEY,
  });

  // Define product schema with validation
  const ProductSchema = z.object({
    name: z.string().describe("Product name"),
    price: z.number().describe("Price in USD"),
    category: z
      .enum(["Electronics", "Clothing", "Food", "Books", "Home"])
      .describe("Product category"),
    inStock: z.boolean().describe("Whether the product is currently available"),
    rating: z.number().min(1).max(5).describe("Customer rating from 1-5 stars"),
    features: z.array(z.string()).describe("List of key product features or highlights"),
  });

  // Create structured model
  const structuredModel = model.withStructuredOutput(ProductSchema);

  // Create a prompt template
  const template = ChatPromptTemplate.fromMessages([
    [
      "system",
      `Extract product information from the description.
      If a field is not explicitly mentioned, make a reasonable inference.
      Ensure the category is one of: Electronics, Clothing, Food, Books, or Home.`,
    ],
    ["human", "{description}"],
  ]);

  // Combine template with structured output
  const chain = template.pipe(structuredModel);

  // Test data
  const products = [
    {
      name: "Tech Product",
      description: `MacBook Pro 16-inch with M3 chip, $2,499. Currently in stock.
        Users rate it 4.8/5. Features: Liquid Retina display, 18-hour battery, 1TB SSD`,
    },
    {
      name: "Clothing Item",
      description: `Cozy wool sweater, blue color, medium size. $89, available now!
        Customers love it - 4.5 stars. Hand-washable, made in Ireland`,
    },
    {
      name: "Book",
      description: `The Great Gatsby by F. Scott Fitzgerald. Classic novel, paperback edition for $12.99.
        In stock. Rated 4.9 stars. 180 pages, published 1925`,
    },
    {
      name: "Home Item",
      description: `Modern LED desk lamp with adjustable brightness. $45.99.
        Available for immediate shipping. 4.6 star rating. USB charging, touch controls, energy efficient`,
    },
    {
      name: "Food Product",
      description: `Organic dark chocolate bar, 85% cacao. $5.99 each.
        In stock! Rated 4.7 stars by health-conscious buyers. Fair trade, vegan, no added sugar`,
    },
  ];

  console.log("🧪 Extracting product data from descriptions:\n");
  console.log("=".repeat(80));

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`\n${i + 1}️⃣  ${product.name}:\n`);

    try {
      const result = await chain.invoke({ description: product.description });

      console.log("✅ Extracted Data:");
      console.log(JSON.stringify(result, null, 2));

      // Type-safe access to fields
      console.log("\n📊 Formatted Output:");
      console.log(`   📦 ${result.name}`);
      console.log(`   💰 $${result.price.toFixed(2)}`);
      console.log(`   🏷️  Category: ${result.category}`);
      console.log(`   📍 ${result.inStock ? "✅ In Stock" : "❌ Out of Stock"}`);
      console.log(`   ⭐ Rating: ${result.rating}/5`);
      console.log(`   🔧 Features:`);
      result.features.forEach((feature) => {
        console.log(`      • ${feature}`);
      });

      console.log("\n" + "=".repeat(80));
    } catch (error) {
      console.error(
        `❌ Error extracting data: ${error instanceof Error ? error.message : String(error)}`
      );
      console.log("=".repeat(80));
    }
  }

  console.log("\n💡 Benefits of Structured Outputs for E-commerce:");
  console.log("   - ✅ Automatic categorization of products");
  console.log("   - ✅ Price validation (must be a number)");
  console.log("   - ✅ Rating constraints (1-5 range)");
  console.log("   - ✅ Type-safe database inserts");
  console.log("   - ✅ Consistent API responses");
  console.log("   - ✅ Easy filtering and sorting");
  console.log("   - ✅ Validation catches errors early");

  console.log("\n🎯 Real-World Use Cases:");
  console.log("   - Extracting product data from marketplace listings");
  console.log("   - Parsing product information from emails");
  console.log("   - Converting unstructured inventory data");
  console.log("   - Building product catalogs from descriptions");
  console.log("   - Automated data entry for e-commerce platforms");
}

main().catch(console.error);
