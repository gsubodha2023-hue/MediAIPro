import AIChat from "../models/AIChat.js";
import { getChatReply, getSymptomAnalysis } from "../services/aiService.js";
import { AppError, asyncHandler } from "../middleware/errorHandler.js";

// @route   POST /api/ai/chat
// @access  Private/Patient
// Appends the user's message to their ongoing chat session, gets an AI reply,
// appends that too, and returns the full updated conversation.
export const chatWithAI = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) throw new AppError("Message cannot be empty", 400);

  let session = await AIChat.findOne({ user: req.user._id, type: "chat" });
  if (!session) {
    session = await AIChat.create({ user: req.user._id, type: "chat", messages: [] });
  }

  session.messages.push({ role: "user", content: message });

  // Only send the last 10 messages as context to keep prompts small and cheap
  const recentHistory = session.messages.slice(-10).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const reply = await getChatReply(recentHistory);
  session.messages.push({ role: "assistant", content: reply });

  await session.save();

  res.status(200).json({ success: true, messages: session.messages });
});

// @route   GET /api/ai/chat/history
// @access  Private/Patient
export const getChatHistory = asyncHandler(async (req, res) => {
  const session = await AIChat.findOne({ user: req.user._id, type: "chat" });
  res.status(200).json({ success: true, messages: session?.messages || [] });
});

// @route   POST /api/ai/symptom-checker
// @access  Private/Patient
export const checkSymptoms = asyncHandler(async (req, res) => {
  const { symptoms, duration, severity, additionalInfo } = req.body;
  if (!symptoms?.trim()) throw new AppError("Please describe your symptoms", 400);

  const symptomText = `Symptoms: ${symptoms}. Duration: ${duration || "not specified"}. Severity: ${severity || "not specified"}. Additional info: ${additionalInfo || "none"}.`;

  const result = await getSymptomAnalysis(symptomText);

  await AIChat.create({
    user: req.user._id,
    type: "symptom_checker",
    messages: [{ role: "user", content: symptomText }],
    structuredResult: result,
  });

  res.status(200).json({ success: true, result });
});

// @route   GET /api/ai/symptom-checker/history
// @access  Private/Patient
export const getSymptomHistory = asyncHandler(async (req, res) => {
  const sessions = await AIChat.find({
    user: req.user._id,
    type: "symptom_checker",
  }).sort({ createdAt: -1 });

  res.status(200).json({ success: true, sessions });
});
