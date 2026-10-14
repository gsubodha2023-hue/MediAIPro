import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import PatientNav from "../../components/PatientNav.jsx";
import {
  sendChatMessage,
  getChatHistory,
  checkSymptoms,
} from "../../services/aiService.js";
import aiBanner from "../../assets/ai-assistant-banner.webp";

const urgencyStyles = {
  low: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  emergency: "bg-red-100 text-red-700",
};

function ChatTab() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    getChatHistory().then(({ data }) => setMessages(data.messages));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setSending(true);

    try {
      const { data } = await sendChatMessage(userMessage);
      setMessages(data.messages);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to get a response");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[60vh]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-gray-400 text-sm text-center mt-10">
            Ask about symptoms, medications, or lab results — e.g. "What foods
            help reduce cholesterol?"
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-400 rounded-2xl px-4 py-2 text-sm">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="border-t border-gray-100 p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={sending}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </div>
  );
}

function SymptomCheckerTab() {
  const [form, setForm] = useState({
    symptoms: "",
    duration: "",
    severity: "mild",
    additionalInfo: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.symptoms.trim()) {
      toast.error("Please describe your symptoms");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await checkSymptoms(form);
      setResult(data.result);
    } catch (err) {
      toast.error(err.response?.data?.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Describe your symptoms
          </label>
          <textarea
            name="symptoms"
            value={form.symptoms}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g. Runny nose, sneezing, mild sore throat"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <input
              name="duration"
              value={form.duration}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="e.g. 2 days"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              name="severity"
              value={form.severity}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Anything else? (optional)
          </label>
          <input
            name="additionalInfo"
            value={form.additionalInfo}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g. existing conditions, recent travel"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-60"
        >
          {loading ? "Analyzing..." : "Check symptoms"}
        </button>
      </form>

      {result && (
        <div className="mt-6 border-t border-gray-100 pt-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-gray-700">Urgency:</span>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${urgencyStyles[result.urgency]}`}
            >
              {result.urgency}
            </span>
          </div>
          {result.possibleConditions?.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-1">Possible conditions:</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {result.possibleConditions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-sm text-gray-600">{result.recommendation}</p>
          <p className="text-xs text-gray-400 mt-4 italic">
            This is general information, not a medical diagnosis. Always consult
            a doctor for anything serious or persistent.
          </p>
        </div>
      )}
    </div>
  );
}

export default function AIAssistant() {
  const [tab, setTab] = useState("chat");

  return (
    <div className="min-h-screen bg-[#f4f9fa]">
      <PatientNav />
      <div className="max-w-2xl mx-auto p-8">
        <div className="relative mb-7 h-40 overflow-hidden rounded-3xl shadow-clinical">
          <img
            src={aiBanner}
            alt="Doctor using digital tools during a patient consultation"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center bg-gradient-to-r from-[#082b3a]/95 via-[#082b3a]/70 to-transparent px-7">
            <h1 className="text-xl font-semibold text-white">AI Health Assistant</h1>
          </div>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          For general guidance only — not a substitute for professional medical advice.
        </p>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab("chat")}
            className={`text-sm px-4 py-2 rounded-lg font-medium ${
              tab === "chat" ? "bg-primary-600 text-white" : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            Chat Assistant
          </button>
          <button
            onClick={() => setTab("symptoms")}
            className={`text-sm px-4 py-2 rounded-lg font-medium ${
              tab === "symptoms" ? "bg-primary-600 text-white" : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            Symptom Checker
          </button>
        </div>

        {tab === "chat" ? <ChatTab /> : <SymptomCheckerTab />}
      </div>
    </div>
  );
}
