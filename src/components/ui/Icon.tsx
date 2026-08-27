import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  ArrowUpRight,
  Beaker,
  Binary,
  Blocks,
  Braces,
  Cake,
  Calculator,
  CaseSensitive,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clock,
  ClipboardCopy,
  Code,
  Command,
  Copy,
  Cpu,
  Database,
  Dices,
  Download,
  Droplet,
  Eraser,
  ExternalLink,
  Eye,
  EyeOff,
  Feather,
  FileJson,
  Gauge,
  Globe,
  HandCoins,
  Hash,
  Heart,
  Home,
  Image,
  Info,
  KeyRound,
  Landmark,
  Layers,
  LayoutGrid,
  Link,
  Link2,
  Lock,
  Mail,
  Menu,
  Minus,
  Moon,
  Palette,
  Percent,
  Plus,
  RefreshCw,
  Regex,
  Repeat,
  Rocket,
  Ruler,
  Scale,
  Search,
  SearchX,
  Settings2,
  Shield,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Square,
  Star,
  Sun,
  Tags,
  Thermometer,
  Timer,
  Trash2,
  TrendingUp,
  Type,
  Users,
  WandSparkles,
  Wrench,
  X,
  Zap,
  CalendarClock,
  CopyMinus,
  Circle,
  Crop,
  Dice6,
  FileImage,
  Grid2x2,
  Maximize,
  Pipette,
  QrCode,
  Scissors,
} from "lucide-react";
import { cn } from "@/utils/cn";

type IconComponent = ComponentType<LucideProps>;

/** Lucide no longer ships brand icons, so this one is defined locally. */
const Github: IconComponent = (props: LucideProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    aria-hidden="true"
    {...(props as unknown as React.SVGProps<SVGSVGElement>)}
  >
    <path d="M12 .5C5.73.5.9 5.33.9 11.6c0 4.86 3.15 8.98 7.52 10.44.55.1.75-.24.75-.53 0-.26-.01-1.13-.02-2.05-3.06.66-3.7-1.3-3.7-1.3-.5-1.28-1.23-1.62-1.23-1.62-1-.69.08-.68.08-.68 1.11.08 1.69 1.14 1.69 1.14.98 1.68 2.57 1.2 3.2.92.1-.72.39-1.2.7-1.48-2.44-.28-5.01-1.22-5.01-5.44 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.92 0 0 .92-.29 3.02 1.13a10.5 10.5 0 0 1 5.5 0c2.1-1.42 3.02-1.13 3.02-1.13.6 1.52.22 2.64.11 2.92.7.77 1.13 1.75 1.13 2.95 0 4.23-2.58 5.16-5.03 5.43.4.34.75 1.01.75 2.04 0 1.48-.01 2.66-.01 3.03 0 .29.2.64.76.53 4.37-1.46 7.51-5.58 7.51-10.44C23.1 5.33 18.27.5 12 .5Z" />
  </svg>
);

/**
 * Central icon registry.
 * Icons are referenced by name from data files (e.g. `icon: "FileJson"`),
 * which keeps the catalog data serialisable and easy to extend.
 */
const registry: Record<string, IconComponent> = {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  ArrowUpRight,
  Beaker,
  Binary,
  Blocks,
  Braces,
  Cake,
  Calculator,
  CaseSensitive,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clock,
  ClipboardCopy,
  Code,
  Command,
  Copy,
  Cpu,
  Database,
  Dices,
  Download,
  Droplet,
  Eraser,
  ExternalLink,
  Eye,
  EyeOff,
  Feather,
  FileJson,
  Gauge,
  Github,
  Globe,
  Hash,
  Heart,
  Home,
  Image,
  Info,
  KeyRound,
  Layers,
  LayoutGrid,
  Link,
  Link2,
  Lock,
  Mail,
  Menu,
  Minus,
  Moon,
  Palette,
  Percent,
  Plus,
  RefreshCw,
  Regex,
  Repeat,
  Rocket,
  Ruler,
  Scale,
  Search,
  SearchX,
  Settings2,
  Shield,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Square,
  Star,
  Sun,
  Tags,
  Thermometer,
  Timer,
  Trash2,
  Type,
  WandSparkles,
  Wrench,
  X,
  Zap,
  CalendarClock,
  Circle,
  CopyMinus,
  Crop,
  Dice6,
  FileImage,
  Grid2x2,
  HandCoins,
  Landmark,
  Maximize,
  Pipette,
  QrCode,
  Scissors,
  TrendingUp,
  Users,
};

export function getIcon(name: string | undefined): IconComponent {
  if (!name) return Sparkles;
  return registry[name] ?? Sparkles;
}

/**
 * True when the name resolves to a real icon rather than the fallback.
 * Used by the audit to catch typos that would silently render a generic star.
 */
export function hasIcon(name: string | undefined): boolean {
  return Boolean(name && name in registry);
}

export interface IconProps extends LucideProps {
  name: string | undefined;
}

export function Icon({ name, className, ...props }: IconProps) {
  const Component = getIcon(name);
  return <Component className={cn("shrink-0", className)} {...props} />;
}

export { registry as iconRegistry };
