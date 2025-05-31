import { useState } from "react";

const API_URL = "https://api.openai.com/v1/chat/completions";
const API_KEY = import.meta.env.VITE_OPEN_AI_KEY ;

export function useChat() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);

  const sendMessage = async (text: string) => {
    const userMsg = { sender: "user", text };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: text }],
          temperature: 0.7
        })
      });

      const data = await res.json();
      const aiReply = data.choices?.[0]?.message?.content || "No response";
      setMessages(prev => [...prev, { sender: "ai", text: aiReply }]);
    } catch (err) {
      console.error("OpenAI error", err);
      setMessages(prev => [...prev, { sender: "ai", text: "Error contacting AI" }]);
    }
  };

  return { messages, sendMessage };
}
