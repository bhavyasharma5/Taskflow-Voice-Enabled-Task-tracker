const OpenAI = require('openai');
const chrono = require('chrono-node');

// Initialize OpenAI client (optional - will use fallback if not configured)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

/**
 * Parse voice transcript using AI (OpenAI GPT) or fallback to rule-based parsing
 * @param {string} transcript - The voice transcript to parse
 * @returns {Promise<Object>} - Parsed task fields
 */
async function parseVoiceTranscript(transcript) {
  if (openai) {
    try {
      return await parseWithAI(transcript);
    } catch (error) {
      console.error('AI parsing failed, falling back to rule-based:', error.message);
      return parseWithRules(transcript);
    }
  }
  return parseWithRules(transcript);
}

/**
 * Parse transcript using OpenAI GPT
 */
async function parseWithAI(transcript) {
  const today = new Date();
  const prompt = `You are a task parsing assistant. Extract task details from the following voice transcript and return a JSON object.

Current date and time: ${today.toISOString()}

Voice transcript: "${transcript}"

Extract the following fields:
1. title: The main task description (clean, actionable title without time/priority info)
2. description: Any additional details or context (can be empty)
3. priority: One of "low", "medium", "high", "urgent" (look for keywords like "urgent", "critical", "high priority", "important", "low priority", "not urgent", etc. Default to "medium" if not specified)
4. dueDate: Parse any date/time references into ISO format. Handle relative dates like "tomorrow", "next Monday", "in 3 days", "by Friday", "next week", etc. Return null if no date mentioned.
5. status: One of "todo", "in_progress", "done" (default to "todo" unless specified otherwise)

Return ONLY a valid JSON object with these exact fields, no explanation:
{
  "title": "...",
  "description": "...",
  "priority": "...",
  "dueDate": "..." or null,
  "status": "..."
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 500
  });

  const content = response.choices[0].message.content.trim();
  
  // Extract JSON from response (handle markdown code blocks)
  let jsonStr = content;
  if (content.includes('```')) {
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) jsonStr = match[1].trim();
  }

  return JSON.parse(jsonStr);
}

/**
 * Fallback: Parse transcript using rule-based approach with chrono-node
 */
function parseWithRules(transcript) {
  const lowerTranscript = transcript.toLowerCase();
  
  // Extract priority
  let priority = 'medium';
  if (/\b(urgent|critical|asap|immediately)\b/i.test(transcript)) {
    priority = 'urgent';
  } else if (/\b(high priority|important|high)\b/i.test(transcript)) {
    priority = 'high';
  } else if (/\b(low priority|not urgent|whenever|low)\b/i.test(transcript)) {
    priority = 'low';
  }

  // Extract status
  let status = 'todo';
  if (/\b(in progress|working on|started)\b/i.test(transcript)) {
    status = 'in_progress';
  } else if (/\b(done|completed|finished)\b/i.test(transcript)) {
    status = 'done';
  }

  // Extract due date using chrono-node
  let dueDate = null;
  const parsedDate = chrono.parseDate(transcript);
  if (parsedDate) {
    // If no time specified, default to end of day (6 PM)
    if (parsedDate.getHours() === 12 && parsedDate.getMinutes() === 0) {
      parsedDate.setHours(18, 0, 0, 0);
    }
    dueDate = parsedDate.toISOString();
  }

  // Extract title - remove date/priority phrases
  let title = transcript
    // Remove common prefixes
    .replace(/^(create a |add a |make a |remind me to |i need to |i want to |please |can you )/i, '')
    // Remove priority phrases
    .replace(/\b(urgent|critical|high priority|low priority|important|it's |its )\b/gi, '')
    // Remove date phrases (simplified)
    .replace(/\b(by |before |until |due |on |at |tomorrow|today|next week|next monday|next tuesday|next wednesday|next thursday|next friday|next saturday|next sunday|this week|in \d+ days?|in \d+ hours?)\b.*/gi, '')
    // Remove status phrases
    .replace(/\b(status is |mark as |set to )(todo|to do|in progress|done|completed)\b/gi, '')
    // Clean up
    .replace(/[,.]$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);

  return {
    title: title || 'Untitled Task',
    description: '',
    priority,
    dueDate,
    status
  };
}

module.exports = { parseVoiceTranscript };

