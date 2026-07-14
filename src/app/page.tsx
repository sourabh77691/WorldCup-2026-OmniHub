import { FanModule } from "@/components/FanModule"
import { OrganizerModule } from "@/components/OrganizerModule"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl overflow-hidden shadow-inner">
              ⚽
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              WorldCup 2026 OmniHub
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium px-3 py-1 bg-secondary text-secondary-foreground rounded-full">
              Live: Group Stages
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="fan" className="space-y-8">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-muted shadow-inner rounded-xl">
              <TabsTrigger value="fan" className="rounded-lg data-[state=active]:shadow-md py-2">
                Fan Experience
              </TabsTrigger>
              <TabsTrigger value="organizer" className="rounded-lg data-[state=active]:shadow-md py-2">
                Organizer Dashboard
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="fan" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FanModule />
          </TabsContent>
          <TabsContent value="organizer" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <OrganizerModule />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="border-t py-6 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; 2026 FIFA World Cup OmniHub. Built for fans and organizers.
        </div>
      </footer>
    </div>
  )
}
