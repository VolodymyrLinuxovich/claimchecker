import pdfParse from "pdf-parse";

export async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf") {
    const parsed = await pdfParse(buffer);
    return parsed.text;
  }

  return buffer.toString("utf-8");
}
