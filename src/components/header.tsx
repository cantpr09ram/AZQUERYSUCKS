export function Header() {
  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-foreground">AZQUERYSUCKS</h1>
            </div>
            <div className="hidden md:block">
              <p className="text-sm text-muted-foreground"></p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground"></span>
          </div>
        </div>
      </div>
    </header>
  )
}
