import "../styles/About.css";

function About() {
  return (
    <div className="about-page">
      <h1>About DataSheetIQ</h1>

      <p className="about-description">
        DataSheetIQ is an AI-powered Electronics Knowledge Base designed to
        help users upload electronic datasheets and ask intelligent questions
        with accurate citation-based answers.
      </p>

      <h2>Key Features</h2>

      <div className="feature-grid">
        <div className="feature-card">
          <h3>📄 Upload Datasheets</h3>
          <p>Upload PDF datasheets for AI-powered analysis.</p>
        </div>

        <div className="feature-card">
          <h3>🤖 Ask AI</h3>
          <p>Ask technical questions and receive intelligent answers.</p>
        </div>

        <div className="feature-card">
          <h3>📚 Citation-Based Answers</h3>
          <p>Every answer includes references from the uploaded datasheet.</p>
        </div>
      </div>

      <h2>Tech Stack</h2>

      <div className="tech-stack">
        <span>React</span>
        <span>Vite</span>
        <span>FastAPI</span>
        <span>Python</span>
        <span>AI</span>
      </div>
    </div>
  );
}

export default About;
