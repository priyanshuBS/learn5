/**
 * Icon — every icon in the app, from the Lucide line-icon set (https://lucide.dev).
 *
 * Use simple names: <Icon name="flame" size={18} color={colors.streak} />.
 * To add an icon: import it from lucide-react-native and add it to ICONS.
 */
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Atom,
  Award,
  BadgeCheck,
  BookMarked,
  BookOpen,
  Brain,
  Calculator,
  CalendarDays,
  ChartNoAxesColumn,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock,
  CloudOff,
  Compass,
  Crown,
  FileText,
  Flag,
  Flame,
  FlaskConical,
  GalleryVerticalEnd,
  GraduationCap,
  Hourglass,
  House,
  Info,
  Layers,
  Leaf,
  Library,
  Lightbulb,
  Lock,
  LogOut,
  Mail,
  Medal,
  Monitor,
  Moon,
  Palette,
  Play,
  Puzzle,
  RefreshCw,
  RotateCcw,
  Search,
  Shuffle,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  Sunrise,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  User,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

import { useColorScheme } from '@/hooks/useScheme';
import { colors } from '@/theme';

const ICONS = {
  // Navigation
  home: House,
  trophy: Trophy,
  review: RotateCcw,
  flashcards: GalleryVerticalEnd,
  // Categories
  english: BookOpen,
  math: Calculator,
  reasoning: Puzzle,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Leaf,
  // Arrows
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  // Status
  check: Check,
  'check-circle': CircleCheck,
  'badge-check': BadgeCheck,
  x: X,
  'x-circle': CircleX,
  alert: CircleAlert,
  info: Info,
  lock: Lock,
  clock: Clock,
  timer: Timer,
  hourglass: Hourglass,
  circle: Circle,
  // Time of day (drop slots)
  sunrise: Sunrise,
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
  calendar: CalendarDays,
  // Gamification
  flame: Flame,
  star: Star,
  zap: Zap,
  crown: Crown,
  medal: Medal,
  award: Award,
  target: Target,
  flag: Flag,
  palette: Palette,
  'trending-up': TrendingUp,
  chart: ChartNoAxesColumn,
  // Learning
  sparkles: Sparkles,
  lightbulb: Lightbulb,
  brain: Brain,
  graduation: GraduationCap,
  bookmark: BookMarked,
  library: Library,
  layers: Layers,
  // Actions & misc
  play: Play,
  refresh: RefreshCw,
  shuffle: Shuffle,
  search: Search,
  compass: Compass,
  'cloud-off': CloudOff,
  'file-text': FileText,
  mail: Mail,
  'log-out': LogOut,
  user: User,
  smartphone: Smartphone,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 20,
  color,
  strokeWidth = 2,
  filled = false,
}: {
  name: IconName;
  size?: number;
  /** Defaults to the normal text colour (light/dark aware). */
  color?: string;
  strokeWidth?: number;
  /** Fill the shape with the same colour (e.g. a solid star or flame). */
  filled?: boolean;
}) {
  const scheme = useColorScheme();
  const Component = ICONS[name];
  const stroke = color ?? (scheme === 'dark' ? colors.textDark : colors.text);
  return (
    <Component
      size={size}
      color={stroke}
      strokeWidth={strokeWidth}
      fill={filled ? stroke : 'none'}
    />
  );
}
