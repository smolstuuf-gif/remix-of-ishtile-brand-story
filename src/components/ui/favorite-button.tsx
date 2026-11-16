import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  active: boolean;
  label: string;
  onToggle: () => void;
  className?: string;
};

export function FavoriteButton({ active, label, onToggle, className }: FavoriteButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "favorite-button group/favorite absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-background/75 text-foreground shadow-sm backdrop-blur-sm transition-[background-color,transform,box-shadow] duration-200 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-90",
        className,
      )}
    >
      <Heart
        aria-hidden="true"
        className={cn(
          "favorite-heart h-[19px] w-[19px] transition-[fill,stroke,transform] duration-200",
          active ? "fill-current" : "fill-transparent",
          active && "is-active",
        )}
        strokeWidth={1.8}
      />
      <span className="sr-only">{active ? "Saved to favorites" : "Save to favorites"}</span>
    </button>
  );
}
