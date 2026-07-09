import "../styles/AnswerCard.css";

function AnswerCard({ answer, sources }) {
  return (
    <div className="answer-card">
      <h3>🤖 AI Response</h3>

      {answer ? (
        <>
          <p>{answer}</p>

          {sources.length > 0 && (
            <>
              <h4>📚 References</h4>
              <ul>
                {sources.map((source, index) => (
                  <li key={index}>
                    {typeof source === "string"
                      ? source
                      : `${source.file || "Document"} ${
                          source.page ? `- Page ${source.page}` : ""
                        }`}
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : (
        <p>Your AI-generated answer will appear here.</p>
      )}
    </div>
  );
}

export default AnswerCard;
