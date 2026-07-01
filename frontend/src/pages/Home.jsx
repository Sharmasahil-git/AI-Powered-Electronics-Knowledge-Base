import { Link } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  return (
    <>
      <section className="hero">
        <h1>AI-Powered Electronics Knowledge Base</h1>

        <p>
          Upload electronic datasheets and ask AI questions with
          accurate citation-based answers.
        </p>

        <div className="hero-buttons">
          <Link to="/upload">
            <button>Upload Datasheet</button>
          </Link>

          <Link to="/chat">
            <button>Ask AI</button>
          </Link>
        </div>
      </section>

      <section className="features">
        <h2>Why Choose DataSheetIQ?</h2>

        <div className="feature-cards">
          <div className="card">
            <h3>📄 Upload Datasheets</h3>
            <p>Upload PDF datasheets for AI-based analysis.</p>
          </div>

          <div className="card">
            <h3>🤖 AI Question Answering</h3>
            <p>Ask questions and get intelligent answers instantly.</p>
          </div>

          <div className="card">
            <h3>📚 Citation-Based Answers</h3>
            <p>Every answer includes references from the uploaded datasheet.</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
