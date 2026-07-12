export interface LlmPort {
  generateText(prompt: string): Promise<string>;
}
