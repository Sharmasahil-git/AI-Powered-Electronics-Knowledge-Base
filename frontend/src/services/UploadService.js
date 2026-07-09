import BASE_URL from "./api";

export const uploadPDF = async (formData) => {
  console.log("Sending upload request to:", `${BASE_URL}/api/upload`);

  const response = await fetch(`${BASE_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });

  console.log("Response Status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Upload Error:", errorText);
    throw new Error(`Upload failed: ${response.status}`);
  }

  const data = await response.json();
  console.log("Upload Success:", data);

  return data;
};
