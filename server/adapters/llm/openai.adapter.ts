import type { LlmPort } from "../../ports/llm.port";

export class OpenAiLlmAdapter implements LlmPort {
  async generateText(prompt: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY manquant dans les variables d'environnement");
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Échec de l'appel OpenAI (${res.status}): ${body}`);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      throw new Error("Réponse OpenAI invalide (pas de contenu)");
    }
    return content;
  }
}
