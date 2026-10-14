// This service is the single place that talks to the AI provider. Every
// controller calls into here rather than hitting OpenAI/Gemini directly -
// that way, swapping providers or adding retry/caching logic later only
// touches this one file.

const EMERGENCY_KEYWORDS = [
  "chest pain",
  "can't breathe",
  "cannot breathe",
  "difficulty breathing",
  "severe bleeding",
  "unconscious",
  "stroke",
  "suicidal",
  "want to die",
  "overdose",
  "seizure",
  "anaphylaxis",
  "severe allergic reaction",
];

// Very simple keyword-based safety net that runs BEFORE any AI call.
// This is intentionally separate from the AI model's own judgement - a
// deterministic check like this can't be "talked out of" flagging an
// emergency the way a language model's response sometimes can be.
export const detectEmergency = (text) => {
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
};

const SYSTEM_PROMPT_CHAT = `You are a helpful medical information assistant inside a
healthcare app called MediAI Pro. You can explain symptoms, medications, and lab
results in plain language, and give general wellness guidance (diet, exercise,
sleep). You are NOT a doctor and must never provide a definitive diagnosis or
tell a user to stop/change a prescribed medication. Always:
- Keep answers concise and easy to understand.
- Recommend seeing a doctor for anything that sounds serious or persistent.
- If symptoms sound urgent or emergency-like, clearly advise immediate medical
  attention (ER / emergency services) rather than continuing the conversation casually.
End every response with a brief reminder that this is general information, not a diagnosis.`;

const SYSTEM_PROMPT_SYMPTOM_CHECKER = `You are a symptom triage assistant. Given a
description of symptoms, respond ONLY with a JSON object (no markdown, no
prose outside the JSON) in this exact shape:
{
  "possibleConditions": ["condition A", "condition B"],
  "urgency": "low" | "medium" | "high" | "emergency",
  "recommendation": "one or two sentences of what the user should do next"
}
Be conservative: if in doubt, raise the urgency level. Never state a definitive
diagnosis - phrase conditions as possibilities only.`;

// Calls OpenAI's chat completions endpoint. Falls back to a canned mock
// response if OPENAI_API_KEY isn't set, so the app is fully runnable/demoable
// without needing an API key or incurring any cost during development.
const callOpenAI = async (systemPrompt, messages) => {
  if (!process.env.OPENAI_API_KEY) {
    return null; // signals "use the mock" to the caller
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

// --- Mock responses (used automatically when no OPENAI_API_KEY is set) ---
const mockChatReply = (userMessage) => {
  return (
    `(Mock AI response - add OPENAI_API_KEY in server/.env for real answers)\n\n` +
    `I heard you mention: "${userMessage.slice(0, 120)}${userMessage.length > 120 ? "..." : ""}". ` +
    `In a real integration, I'd analyze this and give you plain-language guidance here. ` +
    `For now: if this is anything urgent, please contact a doctor directly.\n\n` +
    `Reminder: this is general information, not a medical diagnosis.`
  );
};

const mockSymptomResult = () => ({
  possibleConditions: ["Common cold", "Seasonal allergies", "Mild viral infection"],
  urgency: "low",
  recommendation:
    "(Mock result - add OPENAI_API_KEY for real analysis) Monitor your symptoms for 48 hours and stay hydrated. See a doctor if they worsen or persist beyond a week.",
});

// @param history - array of { role: 'user'|'assistant', content }
export const getChatReply = async (history) => {
  const latestUserMessage = history[history.length - 1]?.content || "";

  if (detectEmergency(latestUserMessage)) {
    return (
      "⚠️ What you're describing could be a medical emergency. Please call your " +
      "local emergency number or go to the nearest emergency room right now. " +
      "This chat isn't a substitute for emergency care."
    );
  }

  const aiReply = await callOpenAI(SYSTEM_PROMPT_CHAT, history);
  return aiReply ?? mockChatReply(latestUserMessage);
};

// @param symptomText - free-text description of symptoms the patient entered
export const getSymptomAnalysis = async (symptomText) => {
  if (detectEmergency(symptomText)) {
    return {
      possibleConditions: [],
      urgency: "emergency",
      recommendation:
        "This may be a medical emergency. Call your local emergency number or go to the nearest ER immediately.",
    };
  }

  const aiRaw = await callOpenAI(SYSTEM_PROMPT_SYMPTOM_CHECKER, [
    { role: "user", content: symptomText },
  ]);

  if (!aiRaw) return mockSymptomResult();

  try {
    return JSON.parse(aiRaw);
  } catch {
    // If the model didn't return clean JSON, fail safe rather than crash
    return {
      possibleConditions: [],
      urgency: "medium",
      recommendation:
        "We couldn't analyze this automatically - please consult a doctor to review your symptoms.",
    };
  }
};
