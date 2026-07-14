import { useState, useCallback } from "react";

export type Message = {
  role: "user" | "ai" | "system";
  text: string;
};

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Welcome to the WorldCup 2026 OmniHub! How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeGate, setActiveGate] = useState<string | null>(null);

  const sendMessage = useCallback(async (
    customMessage?: string,
    language: string = "English",
    accessibleRoute: boolean = false
  ) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim()) return;

    const userMessage = textToSend.trim();
    const newMessages: Message[] = [...messages, { role: "user", text: userMessage }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          language,
          accessibleRoute
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages([...newMessages, { role: "ai", text: data.reply }]);
        if (data.highlightGate !== undefined) {
          setActiveGate(data.highlightGate);
        }
      } else {
        setMessages([...newMessages, { role: "system", text: `Error: ${data.error || "Failed to process chat"}` }]);
      }
    } catch (error: any) {
      setMessages([...newMessages, { role: "system", text: `Network Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    activeGate,
    sendMessage,
  };
}
