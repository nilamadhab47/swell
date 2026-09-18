import Anthropic from '@anthropic-ai/sdk';

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export async function generateInsight(
  systemPrompt: string,
  cravingSummaries: string[]
): Promise<string> {
  if (!client) {
    return 'You crave most in the evenings. Try a short walk when the urge hits.';
  }

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Recent craving notes:\n${cravingSummaries.join('\n')}\n\nSummarize patterns in 2 sentences.`,
      },
    ],
  });

  const block = message.content[0];
  return block.type === 'text' ? block.text : '';
}
