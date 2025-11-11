/**
 * Challenge 2 Solution: Few-Shot Format Teacher
 * Run: npx tsx 03-prompts-messages-outputs/solution/format-teacher.ts
 */

import { ChatPromptTemplate, FewShotChatMessagePromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import "dotenv/config";

const model = new ChatOpenAI({
  model: process.env.AI_MODEL,
  configuration: { baseURL: process.env.AI_ENDPOINT },
  apiKey: process.env.AI_API_KEY,
});

// Teaching examples
const examples = [
  {
    input: "Premium wireless headphones with noise cancellation, $199",
    output: JSON.stringify(
      {
        name: "Premium Wireless Headphones",
        price: "$199.00",
        category: "Electronics",
        highlight: "Noise cancellation",
      },
      null,
      2
    ),
  },
  {
    input: "Organic cotton t-shirt in blue, comfortable fit, $29.99",
    output: JSON.stringify(
      {
        name: "Organic Cotton T-Shirt",
        price: "$29.99",
        category: "Clothing",
        highlight: "Organic cotton, comfortable fit",
      },
      null,
      2
    ),
  },
  {
    input: "Gaming laptop with RTX 4070, 32GB RAM, $1,499",
    output: JSON.stringify(
      {
        name: "Gaming Laptop",
        price: "$1,499.00",
        category: "Computers",
        highlight: "RTX 4070, 32GB RAM",
      },
      null,
      2
    ),
  },
];

// Create example template
const exampleTemplate = ChatPromptTemplate.fromMessages([
  ["human", "{input}"],
  ["ai", "{output}"],
]);

// Create few-shot template
const fewShotTemplate = new FewShotChatMessagePromptTemplate({
  examplePrompt: exampleTemplate,
  examples: examples,
  inputVariables: [],
});

// Final template
const finalTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Convert product descriptions into JSON format. Follow the examples exactly. Output ONLY valid JSON, no additional text.",
  ],
  fewShotTemplate as any, // Type assertion due to FewShotChatMessagePromptTemplate type compatibility issue
  ["human", "{input}"],
]);

async function convertProduct(description: string) {
  console.log(`\n📦 Input: ${description}`);
  console.log("─".repeat(80));

  const chain = finalTemplate.pipe(model);
  const result = await chain.invoke({ input: description });

  try {
    // Parse to validate JSON
    const parsed = JSON.parse(result.content.toString());
    console.log("✅ Valid JSON output:");
    console.log(JSON.stringify(parsed, null, 2));

    // Validate structure
    const requiredFields = ["name", "price", "category", "highlight"];
    const hasAllFields = requiredFields.every((field) => field in parsed);

    if (hasAllFields) {
      console.log("\n✅ All required fields present");
    } else {
      console.log("\n⚠️  Warning: Missing some required fields");
    }
  } catch (error) {
    console.log("❌ Invalid JSON output:");
    console.log(result.content);
  }
}

async function main() {
  console.log("🎓 Few-Shot Format Teacher\n");
  console.log("=".repeat(80));
  const testProducts = [
    "Stainless steel water bottle, keeps drinks cold for 24 hours, $24.99",
    "Leather messenger bag with laptop compartment, handcrafted, $149",
    "Smart watch with heart rate monitor and GPS, waterproof, $299.99",
    "Ergonomic office chair with lumbar support, adjustable height, $399",
  ];

  for (const product of testProducts) {
    await convertProduct(product);
  }

  console.log("\n" + "=".repeat(80));
  console.log("\n✅ Format successfully taught using few-shot examples!");
  console.log("💡 Few-shot learning is great for consistent structured output");
}

main().catch(console.error);
