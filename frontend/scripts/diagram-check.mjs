import { readFile } from "node:fs/promises";

const architectureDocument = await readFile("ARCHITECTURE.md", "utf8");
const mermaidFenceCount =
  architectureDocument.match(/```mermaid/gu)?.length ?? 0;
const closingFenceCount = architectureDocument.match(/```/gu)?.length ?? 0;

if (!architectureDocument.startsWith("# 数得快原生微信小程序前端架构")) {
  throw new Error("Architecture document is missing its canonical title.");
}
if (mermaidFenceCount === 0 || closingFenceCount < mermaidFenceCount * 2) {
  throw new Error("Architecture document has an incomplete Mermaid diagram.");
}
