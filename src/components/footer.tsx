export function Footer() {
  return (
    <footer className="border-t border-border py-4">
      <div className="max-w-5xl mx-auto px-4 text-center text-xs text-muted-foreground">
        Made with{" "}
        <span className="text-danger" aria-label="love">
          ❤️
        </span>{" "}
        by{" "}
        <a
          href="https://dhirajarya.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-accent-hover transition-colors font-medium"
        >
          Dhiraj Arya
        </a>
      </div>
    </footer>
  );
}
