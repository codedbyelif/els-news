import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}

/** İsmin baş harflerinden renkli bir placeholder üretir. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const PALETTE = [
  "oklch(0.6 0.18 27)",
  "oklch(0.6 0.15 250)",
  "oklch(0.58 0.16 150)",
  "oklch(0.62 0.17 70)",
  "oklch(0.55 0.18 310)",
  "oklch(0.6 0.16 200)",
];

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function Avatar({ name, src, size = 40, className }: AvatarProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className={cn("rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none",
        className
      )}
      style={{
        width: size,
        height: size,
        background: colorFor(name),
        fontSize: size * 0.4,
      }}
    >
      {initials(name)}
    </span>
  );
}
