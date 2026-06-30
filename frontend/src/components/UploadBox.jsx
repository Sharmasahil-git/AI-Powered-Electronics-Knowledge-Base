import "../styles/UploadBox.css";
function UploadBox() {
  return (
    <div className="upload-box">
      <h2>Upload PDF</h2>
      <p>Choose your electronics datasheet PDF.</p>

      <input type="file" accept=".pdf" />

      <br />
      <br />

      <button>Upload</button>
    </div>
  );
}

export default UploadBox;
