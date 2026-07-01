import QuestionBox from "../components/QuestionBox";
import AnswerCard from "../components/AnswerCard";
function Chat() {
  return (
<div>
  <h1>Ask AI</h1>
  <p>Ask questions about your uploaded datasheet.</p>

  <QuestionBox />

  <AnswerCard />
</div>
  );
}

export default Chat;
