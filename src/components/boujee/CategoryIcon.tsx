import { Scissors, Brush, Hand, Palette, Eye, Sparkles, Leaf, ScanFace, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  barber: Scissors,
  hair: Brush,
  nails: Hand,
  makeup: Palette,
  lash: Eye,
  skin: Sparkles,
  massage: Leaf,
  brows: ScanFace,
};

export function CategoryIcon({ category, className, strokeWidth }: { category: string; className?: string; strokeWidth?: number }) {
  const Icon = ICONS[category] ?? Sparkles;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}
