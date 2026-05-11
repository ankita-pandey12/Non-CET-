const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

exports.askAgent = async (req, res) => {
  try {
    const { message, collegeName, website, collegeData } = req.body;

    if (!message || !collegeName) {
      return res.status(400).json({ success: false, message: 'Message and college name are required' });
    }

    let contextSection = '';
    if (collegeData) {
      contextSection = `\n\n--- DATABASE CONTEXT ---\n${collegeData}\n--- END CONTEXT ---`;
    }

    const systemPrompt = `You are an expert AI assistant specializing in Indian colleges and universities. You are currently answering questions specifically about ${collegeName}.

INSTRUCTIONS:
1. Always check the DATABASE CONTEXT section first. If the answer is there, use it as the primary source.
2. If the DATABASE CONTEXT does not contain the specific information (e.g., courses array is empty or says "No specific course data available"), USE YOUR GENERAL KNOWLEDGE about ${collegeName} to answer accurately. Do NOT say "the database doesn't have this information" — just answer from general knowledge.
3. If you don't know the answer even from general knowledge, say so briefly and suggest visiting the official website.
4. Be concise, factual, and helpful. Do not mention "database" or "context" in your responses.
5. Only answer about ${collegeName} unless asked for a comparison.
${contextSection}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = chatCompletion.choices[0]?.message?.content || 'I could not generate a response. Please try again later.';

    res.json({ success: true, reply });
  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ success: false, message: 'Failed to process request', error: error.message });
  }
};
