/**
 * Email Response Generator
 *
 * Run: npx tsx 03-prompts-messages-outputs/samples/email-generator.ts
 */

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import "dotenv/config";

const model = new ChatOpenAI({
  model: process.env.AI_MODEL,
  configuration: { baseURL: process.env.AI_ENDPOINT },
  apiKey: process.env.AI_API_KEY,
});

// Create reusable email template
const emailTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a customer service representative for {company_name}.
Write professional emails with a {tone} tone.
Always be helpful and provide clear next steps.`,
  ],
  [
    "human",
    `Generate an email response for this scenario:
Customer: {customer_name}
Issue Type: {issue_type}
Details: {details}

The email should be {tone} and address their concern appropriately.`,
  ],
]);

async function generateEmail(
  companyName: string,
  customerName: string,
  issueType: string,
  details: string,
  tone: string
) {
  console.log("📧 Generating email...\n");
  console.log(`Company: ${companyName}`);
  console.log(`Customer: ${customerName}`);
  console.log(`Issue: ${issueType}`);
  console.log(`Tone: ${tone}\n`);
  console.log("─".repeat(80));

  const chain = emailTemplate.pipe(model);

  const result = await chain.invoke({
    company_name: companyName,
    customer_name: customerName,
    issue_type: issueType,
    details: details,
    tone: tone,
  });

  console.log(result.content);
  console.log("─".repeat(80) + "\n");
}

async function main() {
  console.log("📧 Email Response Generator\n");
  console.log("=".repeat(80) + "\n");

  // Scenario 1: Refund request - apologetic
  await generateEmail(
    "TechGadgets Inc.",
    "Sarah Johnson",
    "Refund Request",
    "Product arrived damaged and customer wants a full refund",
    "apologetic and empathetic"
  );

  // Scenario 2: Technical support - friendly
  await generateEmail(
    "CloudHost Solutions",
    "Mike Chen",
    "Technical Support",
    "Customer can't connect to their database and needs help troubleshooting",
    "friendly and helpful"
  );

  // Scenario 3: Exchange request - formal
  await generateEmail(
    "Fashion Forward",
    "Dr. Emily Roberts",
    "Exchange Request",
    "Wrong size received, needs to exchange for a different size",
    "formal and professional"
  );

  console.log("=".repeat(80));
  console.log("\n✅ All emails generated successfully!");
  console.log("💡 Same template, different contexts and tones!");
}

main().catch(console.error);
