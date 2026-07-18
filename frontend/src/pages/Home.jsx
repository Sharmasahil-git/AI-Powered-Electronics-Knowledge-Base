import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/Home.css";

function Home() {
  return (
    <>
      <section className="hero">

        <div className="hero-content">
          <motion.h1
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
  AI-Powered Electronics Knowledge Base
</motion.h1>

<motion.p
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1, delay: 0.2 }}
>
  Upload electronic datasheets and ask AI questions with
  accurate citation-based answers.
</motion.p>

<motion.div
  className="hero-buttons"
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1, delay: 0.4 }}
>
  <Link to="/upload">
    <button>Upload Datasheet</button>
  </Link>

  <Link to="/chat">
    <button>Ask AI</button>
  </Link>
</motion.div>
</div>

        <div className="hero-image">
          <img
            src="https://placehold.co/500x400?text=AI+Illustration"
            alt="AI Illustration"
          />
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
            <p>
              Every answer includes references from the uploaded datasheet.
            </p>
          </div>

        </div>
      </section>
    </>
  );
}

export default Home;
