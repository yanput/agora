
import { useState } from "react";
import {useChat} from "@hooks/useChat";

export default function Chat() {
  const { messages, sendMessage } = useChat();
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2 p-2">
        {messages.map((msg, i) => (
          <div key={i} className={`p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-200 self-end' : 'bg-gray-100 self-start'}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="p-2 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          className="flex-1 border p-2 rounded"
          placeholder="Type your message..."
        />
        <button onClick={handleSend} className="bg-blue-500 text-white p-2 rounded">Send</button>
      </div>
    </div>
  );
}
