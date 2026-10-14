import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const aiChatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["chat", "symptom_checker"],
      required: true,
    },
    messages: [messageSchema],
    // For symptom_checker sessions, store the structured result separately
    // so the frontend can render it as a card rather than parsing free text
    structuredResult: {
      possibleConditions: [String],
      urgency: { type: String, enum: ["low", "medium", "high", "emergency"] },
      recommendation: String,
    },
  },
  { timestamps: true }
);

const AIChat = mongoose.model("AIChat", aiChatSchema);
export default AIChat;
