import { Link } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="logo">
        <h2>DataSheetAI</h2>
      </div>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/">Use Cases</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>

      <button className="login-btn">
        Login
      </button>

    </nav>
  );
}

export default Navbar;

