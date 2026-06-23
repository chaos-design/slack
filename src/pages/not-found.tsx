import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "../components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-start justify-center gap-6">
      <span className="eyebrow">Page not found</span>
      <h1 className="font-display text-8xl font-black leading-none tracking-tight text-ink sm:text-9xl">
        404 —
        <br />
        <span className="italic font-medium text-vermillion">lost the thread.</span>
      </h1>
      <p className="max-w-md text-lg text-muted-foreground">
        The page you are looking for does not exist — it may have been moved or never published.
      </p>
      <Button
        asChild
        className="btn-ink rounded-sm bg-ink px-6 font-mono-tech text-sm font-semibold uppercase tracking-wide text-paper hover:bg-ink"
      >
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </Button>
    </div>
  );
}
