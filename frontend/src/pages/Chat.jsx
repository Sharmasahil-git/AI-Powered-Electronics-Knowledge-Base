import { useState } from "react";
import QuestionBox from "../components/QuestionBox";
import AnswerCard from "../components/AnswerCard";

function Chat() {
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);

  return (
    <div>
      <h1>Ask AI</h1>
      <p>Ask questions about your uploaded datasheet.</p>

      <QuestionBox
        setAnswer={setAnswer}
        setSources={setSources}
      />

      <AnswerCard
        answer={answer}
        sources={sources}
      />
    </div>
  );
}

export default Chat;
