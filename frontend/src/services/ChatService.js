import BASE_URL from "./api";

export const askAI = async (question) => {
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question: question,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get AI response");
  }

  return await response.json();
};

