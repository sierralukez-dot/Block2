import OpenAI from 'openai';

// Vercel Hobby tier defaults to a 10s function timeout — too short for a
// classroom-loaded local model, which can occasionally run past that under
// concurrent student traffic. Hobby allows up to 60s with this export.
export const maxDuration = 60;

const client = new OpenAI({
  baseURL: process.env.OLLAMA_BASE_URL,
  apiKey: process.env.VCS_API_SECRET,
});

export async function POST(req) {
  const { topic } = await req.json();
  if (!topic?.trim()) {
    return Response.json({ error: 'Please enter a topic.' }, { status: 400 });
  }

  const completion = await client.chat.completions.create({
    model: process.env.OLLAMA_MODEL,
    messages: [
      {
        role: 'user',
        content: `Explain ${topic.trim()} in exactly 3 bullet points.`,
      },
    ],
  });
  return Response.json(completion.choices[0].message);
}
