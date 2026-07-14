"use client"

import { useState, useEffect } from "react"
import { Users, AlertTriangle, ShieldCheck, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export function OrganizerModule() {
  const [predictions, setPredictions] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchPredictions = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/crowd-predictions")
      if (res.ok) {
        const data = await res.json()
        setPredictions(data)
        setLastUpdate(new Date())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPredictions()
    const interval = setInterval(fetchPredictions, 30000) // update every 30s
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Top Stats Cards */}
      <Card className="shadow-md border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Stadium Capacity</CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">82,450 / 85,000</div>
          <p className="text-xs text-muted-foreground">97% capacity reached</p>
          <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: "97%" }} />
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-md border-accent/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {predictions?.incidentCount || 2}
          </div>
          <p className="text-xs text-muted-foreground">Requires immediate attention</p>
        </CardContent>
      </Card>
      <Card className="shadow-md border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Security Status</CardTitle>
          <ShieldCheck className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">Nominal</div>
          <p className="text-xs text-muted-foreground">All checkpoints operational</p>
        </CardContent>
      </Card>

      {/* AI Predictions Panel */}
      <Card className="md:col-span-2 lg:col-span-3 shadow-lg border-primary/30">
        <CardHeader className="bg-primary/5 border-b pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="w-5 h-5 text-primary" /> GenAI Crowd Management Intelligence
            </CardTitle>
            <CardDescription>Predictive analytics for crowd flow and congestion prevention</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchPredictions}
            disabled={isLoading}
            className="shadow-sm"
          >
            {isLoading ? "Analyzing..." : "Refresh Intelligence"}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
            <div className="p-6">
              <h4 className="font-semibold mb-4 text-primary flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Current Congestion Hotspots
              </h4>
              <ScrollArea className="h-[200px] pr-4">
                {predictions?.hotspots ? (
                  <div className="space-y-4">
                    {predictions.hotspots.map((h: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow">
                        <div>
                          <p className="font-medium">{h.location}</p>
                          <p className="text-xs text-muted-foreground">Wait time: {h.estimatedWaitTime}</p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-semibold ${h.severity === 'High' ? 'bg-destructive/10 text-destructive' : 'bg-orange-500/10 text-orange-500'}`}>
                          {h.severity}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                    {isLoading ? "Loading predictions..." : "No data available"}
                  </div>
                )}
              </ScrollArea>
            </div>
            
            <div className="p-6 bg-muted/20">
              <h4 className="font-semibold mb-4 text-primary flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> AI Recommendations
              </h4>
              <ScrollArea className="h-[200px] pr-4">
                {predictions?.recommendations ? (
                  <div className="space-y-4">
                    {predictions.recommendations.map((r: string, i: number) => (
                      <div key={i} className="flex gap-3 p-3 rounded-lg bg-background border shadow-sm">
                        <div className="mt-0.5 shrink-0 w-2 h-2 rounded-full bg-primary"></div>
                        <p className="text-sm">{r}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                    {isLoading ? "Loading recommendations..." : "No data available"}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
          <div className="p-3 border-t bg-muted/50 text-xs text-muted-foreground text-center">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
