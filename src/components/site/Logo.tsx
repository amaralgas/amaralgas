import { Link } from "@tanstack/react-router";
import { Flame } from "lucide-react";

// Text wordmark placeholder — swap for the official logo file when provided.
export function Logo({ light = true }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="Amaral Gás — início">
      <span className="grid size-10 place-items-center rounded-xl bg-gradient-flame shadow-flame">
        <Flame className="size-6 text-flame-foreground" strokeWidth={2.5} />
      </span>
      <span className="leading-none">
        <span className={`block font-display text-xl font-extrabold tracking-wide ${light ? "text-navy-foreground" : "text-navy"}`}>
          AMARAL <span className="text-flame">GÁS</span>
        </span>
        <span className={`block text-[10px] font-semibold uppercase tracking-[0.2em] ${light ? "text-navy-foreground/60" : "text-muted-foreground"}`}>
          Agilidade e confiança
        </span>
      </span>
    </Link>
  );
}
