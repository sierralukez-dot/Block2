import OpenAI from 'openai';

export const maxDuration = 60;

const baseURL = process.env.OPENAI_BASE_URL || process.env.OLLAMA_BASE_URL;
const apiKey = process.env.OPENAI_API_KEY || process.env.VCS_API_SECRET;
const model = process.env.CHAT_MODEL || 'qwen3:4b';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const question = formData.get('question')?.toString()?.trim();

    if (!question) {
      return Response.json({ error: 'Please provide a question.' }, { status: 400 });
    }

    const hasFile = file instanceof File;
    const documentText = hasFile ? await file.text() : '';

    if (!baseURL || !apiKey) {
      throw new Error('The AI environment variables are missing in Vercel.');
    }

    new URL(baseURL);

    const client = new OpenAI({ baseURL, apiKey });
    const systemPrompt = hasFile
      ? 'You are a strict document-grounded assistant. Answer only using the provided document. If the answer is not in the document, say exactly: "The document does not provide enough information to answer this question." Do not use outside knowledge and do not speculate.'
      : 'Answer the user question as accurately as possible. If the user has not provided a document, respond using the question itself and general knowledge. Be clear when the answer depends on context or assumptions.';

    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: hasFile
            ? `Document:\n${documentText}\n\nQuestion: ${question}`
            : question,
        },
      ],
      think: false,
      reasoning_effort: 'none',
      max_tokens: 512,
    });

    const answer = (completion.choices[0].message.content || '').split('</think>').pop().trim();

    return Response.json({
      question,
      answer: answer || 'The document does not provide enough information to answer this question.',
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'The AI request failed.' },
      { status: 502 },
    );
  }
}
