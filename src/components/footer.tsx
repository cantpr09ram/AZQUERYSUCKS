export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="mx-auto max-w-7xl px-4">
        <p className="py-3 text-center text-xs text-muted-foreground">
          Inspired by{" "}
          <a
            href="https://thu-course-frontend.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 decoration-muted-foreground/60 hover:text-foreground hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            東海選課資訊
          </a>{" "}
          . The source code is available on{" "}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 decoration-muted-foreground/60 hover:text-foreground hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
