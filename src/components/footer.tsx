export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <p className="text-sm text-muted-foreground">© AZQUERYSUCKS. All Rights Reversed.</p>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                使用說明
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                聯絡我們
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                意見回饋
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
