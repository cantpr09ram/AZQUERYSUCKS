import { DarkModeToggle } from "./dark-mode-toggle"

interface HeaderProps {
  activeTab: "schedule" | "info"
  setActiveTab: (tab: "schedule" | "info") => void
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-foreground mr-8 hidden sm:block">AZQUERYSUCKS</h1>
          <div className="flex items-center flex-1">
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "schedule"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              排課模擬
            </button>
            <button
              onClick={() => setActiveTab("info")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "info"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              選課資訊
            </button>
          </div>
          
        </div>
      </div>
    </header>
  )
}
