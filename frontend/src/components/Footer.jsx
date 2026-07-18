import { Link } from "react-router-dom";
import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-section">
          <h2>DataSheetAI</h2>
          <p>
            AI-powered platform for understanding electronic datasheets
            with accurate citation-based answers.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
  <li><Link to="/">Home</Link></li>
  <li><Link to="/upload">Upload</Link></li>
  <li><Link to="/chat">Ask AI</Link></li>
  <li><Link to="/about">About</Link></li>
</ul>
        </div>

        <div className="footer-section">
          <h3>Features</h3>
          <ul>
            <li>Upload Datasheets</li>
            <li>AI Question Answering</li>
            <li>Citation-Based Answers</li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>
          <p>Email: support@datasheetai.com</p>
          <a href="https://github.com" target="_blank" rel="noreferrer">
  GitHub
</a>

<a href="https://linkedin.com" target="_blank" rel="noreferrer">
  LinkedIn
</a>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 DataSheetAI. All Rights Reserved.
      </div>

    </footer>
  );
}

export default Footer;
