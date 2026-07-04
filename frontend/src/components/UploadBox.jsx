import { useState } from "react";
import "../styles/UploadBox.css";
import { uploadPDF } from "../services/uploadService";

function UploadBox() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a PDF first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const result = await uploadPDF(formData);
      alert(result.message);
      console.log(result);
    } catch (error) {
      alert(error.message);
      console.error(error);
    }
  };

  return (
    <div className="upload-box">
      <h2>Upload PDF</h2>
      <p>Choose your electronics datasheet PDF.</p>

      <input
        type="file"
        accept=".pdf"
        onChange={(event) => {
          setSelectedFile(event.target.files[0]);
        }}
      />

      <br />
      <br />

      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

export default UploadBox;
