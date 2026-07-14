"use client"

import { useState } from "react"
import { Send, Map, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function FanModule() {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Welcome to the WorldCup 2026 OmniHub! How can I help you today? I can assist with stadium navigation, transportation, or match info." },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setMessages((prev) => [...prev, { role: "user", text: userMessage }])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || "Network response was not ok")
      }
      
      const data = await response.json()
      setMessages((prev) => [...prev, { role: "ai", text: data.reply }])
    } catch (error: any) {
      console.error("Error:", error)
      const errorMsg = error.message || "Sorry, I'm having trouble connecting right now."
      setMessages((prev) => [...prev, { role: "ai", text: `Error: ${errorMsg}` }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3 h-[600px]">
      <Card className="lg:col-span-2 flex flex-col h-full border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5 pb-4 border-b">
          <CardTitle className="text-2xl flex items-center gap-2 text-primary">
            <span role="img" aria-label="bot">🤖</span> OmniBot Assistant
          </CardTitle>
          <CardDescription>Multilingual fan support, navigation, and transport routing.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4 overflow-hidden bg-background">
          <ScrollArea className="flex-1 pr-4">
            <div className="flex flex-col gap-4 py-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground self-end rounded-tr-sm shadow-md"
                      : "bg-muted text-muted-foreground self-start rounded-tl-sm shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {isLoading && (
                <div className="bg-muted text-muted-foreground self-start rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] text-sm flex gap-1 items-center shadow-sm">
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-150"></span>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="flex items-center gap-2 pt-4 border-t mt-auto">
            <Input
              placeholder="E.g., How do I get to Gate A?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 rounded-full border-primary/30 focus-visible:ring-primary"
              aria-label="Type your message"
            />
            <Button size="icon" className="rounded-full shrink-0 shadow-md transition-transform hover:scale-105 active:scale-95" onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-col gap-6 h-full">
        <Card className="flex-1 border-secondary/20 shadow-md">
          <CardHeader className="bg-secondary/10 pb-4 border-b">
            <CardTitle className="flex items-center gap-2">
              <Map className="w-5 h-5 text-primary" /> Stadium Map
            </CardTitle>
            <CardDescription>Live routing to your seat.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex items-center justify-center h-[calc(100%-72px)] bg-muted/30">
            <div className="text-center p-6 text-muted-foreground">
              <Navigation className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Interactive map will appear here based on your chat queries.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
