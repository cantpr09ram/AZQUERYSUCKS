export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm">Inspired by</p>
              <a href="https://thu-course-frontend.vercel.app/" className="text-sm hover:text-foreground transition-colors">東海選課資訊</a>
            </div>
            <div className="flex items-center space-x-6">
              <a href="https://raw.githubusercontent.com/cantpr09ram/CourseCatalogs2Json/refs/heads/main/courses.json" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Raw Data
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Soure Code
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
