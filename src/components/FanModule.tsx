"use client"

import React, { useState } from "react"
import { Send, Map, Settings2, Accessibility } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useChat } from "@/hooks/useChat"

const StadiumMap = React.memo(({ activeGate }: { activeGate: string | null }) => {
  return (
    <div 
      className="relative w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-b-xl overflow-hidden min-h-[300px]"
      role="region"
      aria-label="Interactive map of the stadium"
      aria-live="polite"
    >
      {/* Pitch */}
      <div aria-hidden="true" className="absolute w-24 h-40 md:w-32 md:h-48 bg-green-500/10 border-2 border-green-500/30 rounded-sm z-10 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500/30 rounded-full" />
        <div className="absolute w-full h-0 border-t-2 border-green-500/30" />
      </div>

      {/* North Stand - Gate A */}
      <div className={`absolute top-4 md:top-8 w-40 md:w-48 h-12 md:h-16 rounded-t-2xl border-2 flex items-center justify-center transition-all duration-500 ${activeGate === 'A' ? 'bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105 z-20' : 'bg-muted border-muted-foreground/20 text-muted-foreground'}`}>
        <span className="font-bold text-sm md:text-base">Gate A (North)</span>
      </div>

      {/* South Stand - Gate C */}
      <div className={`absolute bottom-4 md:bottom-8 w-40 md:w-48 h-12 md:h-16 rounded-b-2xl border-2 flex items-center justify-center transition-all duration-500 ${activeGate === 'C' ? 'bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105 z-20' : 'bg-muted border-muted-foreground/20 text-muted-foreground'}`}>
        <span className="font-bold text-sm md:text-base">Gate C (South)</span>
      </div>

      {/* East Stand - Gate B */}
      <div className={`absolute right-4 md:right-8 w-12 md:w-16 h-40 md:h-48 rounded-r-2xl border-2 flex items-center justify-center transition-all duration-500 ${activeGate === 'B' ? 'bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105 z-20' : 'bg-muted border-muted-foreground/20 text-muted-foreground'}`}>
        <span className="font-bold text-sm md:text-base -rotate-90 whitespace-nowrap">Gate B (East)</span>
      </div>

      {/* West Stand - Gate D */}
      <div className={`absolute left-4 md:left-8 w-12 md:w-16 h-40 md:h-48 rounded-l-2xl border-2 flex items-center justify-center transition-all duration-500 ${activeGate === 'D' ? 'bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105 z-20' : 'bg-muted border-muted-foreground/20 text-muted-foreground'}`}>
        <span className="font-bold text-sm md:text-base -rotate-90 whitespace-nowrap">Gate D (West)</span>
      </div>
    </div>
  )
})
StadiumMap.displayName = "StadiumMap"

export function FanModule() {
  const { messages, input, setInput, isLoading, activeGate, sendMessage } = useChat()
  const [language, setLanguage] = useState("English")
  const [accessibleRoute, setAccessibleRoute] = useState(false)

  const handleSend = () => {
    sendMessage(undefined, language, accessibleRoute)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3 h-[600px]">
      <Card className="lg:col-span-2 flex flex-col h-full border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5 pb-4 border-b">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🤖</span> OmniBot Assistant
          </CardTitle>
          <CardDescription>Ask me for directions, food wait times, or game stats!</CardDescription>
          
          {/* New Problem Statement Alignment Features */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Label htmlFor="language-selector" className="sr-only">Select Language</Label>
              <Settings2 className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Select value={language} onValueChange={(val) => val && setLanguage(val)}>
                <SelectTrigger id="language-selector" className="w-[120px] h-8 text-xs" aria-label="Select Language">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="Arabic">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="accessibility-mode" 
                checked={accessibleRoute}
                onCheckedChange={setAccessibleRoute}
                aria-label="Toggle Wheelchair Accessible Route"
              />
              <Label htmlFor="accessibility-mode" className="text-xs flex items-center gap-1 cursor-pointer">
                <Accessibility className="w-3 h-3" />
                Accessible Route
              </Label>
            </div>
          </div>
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
              id="chat-input"
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
        <Card className="flex-1 border-secondary/20 shadow-md overflow-hidden flex flex-col">
          <CardHeader className="bg-secondary/10 pb-4 border-b shrink-0">
            <CardTitle className="flex items-center gap-2">
              <Map className="w-5 h-5 text-primary" /> Stadium Map
            </CardTitle>
            <CardDescription>Live routing to your seat.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col bg-muted/30 relative">
            {activeGate ? (
               <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                 Routing to Gate {activeGate}...
               </div>
            ) : (
               <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-muted/90 text-muted-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                 Ask bot for directions
               </div>
            )}
            <StadiumMap activeGate={activeGate} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
