import "../styles/QuestionBox.css";
function QuestionBox() {
  return (
    <div className="question-box">
      <input type="text" placeholder="Ask your question..." />
      <button>Ask</button>
    </div>
  );
}

export default QuestionBox;
