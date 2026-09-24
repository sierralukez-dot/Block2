import OpenAI from 'openai';

// Vercel Hobby tier defaults to a 10s function timeout — too short for a
// classroom-loaded local model, which can occasionally run past that under
// concurrent student traffic. Hobby allows up to 60s with this export.
export const maxDuration = 60;

const baseURL = process.env.OPENAI_BASE_URL || process.env.OLLAMA_BASE_URL;
const apiKey = process.env.OPENAI_API_KEY || process.env.VCS_API_SECRET;

export async function POST(req) {
  const { topic, question } = await req.json();
  if (!topic?.trim() || !question?.trim()) {
    return Response.json({ error: 'Please enter both a topic and a question.' }, { status: 400 });
  }

  try {
    if (!baseURL || !apiKey) {
      throw new Error('The AI environment variables are missing in Vercel.');
    }
    new URL(baseURL);

    const client = new OpenAI({ baseURL, apiKey });
    const completion = await client.chat.completions.create({
      model: process.env.OLLAMA_MODEL,
      messages: [
        {
          role: 'user',
          content: `Topic: ${topic.trim()}\nQuestion: ${question.trim()}\nAnswer in exactly 3 short bullet points.`,
        },
      ],
      max_tokens: 200,
    });
    return Response.json(completion.choices[0].message);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'The AI request failed.' },
      { status: 502 },
    );
  }
}
