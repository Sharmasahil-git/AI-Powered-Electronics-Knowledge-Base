import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="logo">DataSheetIQ</h2>

      <ul className="nav-links">
        <li>Home</li>
        <li>Upload</li>
        <li>Ask AI</li>
        <li>About</li>
      </ul>
    </nav>
  );
}

export default Navbar;
