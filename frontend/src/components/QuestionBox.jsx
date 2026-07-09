import { useState } from "react";
import { askAI } from "../services/ChatService";
import "../styles/QuestionBox.css";

function QuestionBox({ setAnswer, setSources }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) {
      alert("Please enter a question.");
      return;
    }

    setLoading(true);

    try {
      const data = await askAI(question);

      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (error) {
      alert("Failed to get AI response.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="question-box">
      <input
        type="text"
        placeholder="Ask your question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <button onClick={handleAsk} disabled={loading}>
        {loading ? "Thinking..." : "Ask"}
      </button>
    </div>
  );
}

export default QuestionBox;
