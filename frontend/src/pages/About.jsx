import "../styles/About.css";
function About() {
  return (
    <div className="about-page">
      <h1>About DataSheetIQ</h1>

      <p>
        DataSheetIQ is an AI-powered Electronics Knowledge Base that helps
        users upload electronic datasheets and ask questions using AI.
      </p>

      <h2>Features</h2>

      <ul>
        <li>Upload PDF Datasheets</li>
        <li>Ask AI Questions</li>
        <li>AI Generated Answers</li>
        <li>Simple and User-Friendly Interface</li>
      </ul>

      <h2>Tech Stack</h2>

      <p>
        React • Vite • FastAPI • Python • AI
      </p>
    </div>
  );
}

export default About;
