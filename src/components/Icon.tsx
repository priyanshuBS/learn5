/**
 * Icon — every icon in the app, from the Lucide line-icon set (https://lucide.dev).
 *
 * Use simple names: <Icon name="flame" size={18} color={colors.streak} />.
 * To add an icon: import it from 'lucide-react-native/icons/<kebab-name>' and add it to ICONS.
 *
 * Why one import per icon: the package's main entry loads all ~2,000 icon files,
 * which slows Metro down and can crash it on Windows ("EMFILE: too many open files").
 * Importing each icon's own file loads only the ~60 we use.
 */
import ArrowLeft from 'lucide-react-native/icons/arrow-left';
import ArrowRight from 'lucide-react-native/icons/arrow-right';
import ArrowUpRight from 'lucide-react-native/icons/arrow-up-right';
import Atom from 'lucide-react-native/icons/atom';
import Award from 'lucide-react-native/icons/award';
import BadgeCheck from 'lucide-react-native/icons/badge-check';
import BookMarked from 'lucide-react-native/icons/book-marked';
import BookOpen from 'lucide-react-native/icons/book-open';
import Brain from 'lucide-react-native/icons/brain';
import Calculator from 'lucide-react-native/icons/calculator';
import CalendarDays from 'lucide-react-native/icons/calendar-days';
import ChartNoAxesColumn from 'lucide-react-native/icons/chart-no-axes-column';
import Check from 'lucide-react-native/icons/check';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import Circle from 'lucide-react-native/icons/circle';
import CircleAlert from 'lucide-react-native/icons/circle-alert';
import CircleCheck from 'lucide-react-native/icons/circle-check';
import CircleX from 'lucide-react-native/icons/circle-x';
import Clock from 'lucide-react-native/icons/clock';
import CloudOff from 'lucide-react-native/icons/cloud-off';
import Compass from 'lucide-react-native/icons/compass';
import Crown from 'lucide-react-native/icons/crown';
import FileText from 'lucide-react-native/icons/file-text';
import Flag from 'lucide-react-native/icons/flag';
import Flame from 'lucide-react-native/icons/flame';
import FlaskConical from 'lucide-react-native/icons/flask-conical';
import GalleryVerticalEnd from 'lucide-react-native/icons/gallery-vertical-end';
import GraduationCap from 'lucide-react-native/icons/graduation-cap';
import Hourglass from 'lucide-react-native/icons/hourglass';
import House from 'lucide-react-native/icons/house';
import Info from 'lucide-react-native/icons/info';
import Layers from 'lucide-react-native/icons/layers';
import Leaf from 'lucide-react-native/icons/leaf';
import Library from 'lucide-react-native/icons/library';
import Lightbulb from 'lucide-react-native/icons/lightbulb';
import Lock from 'lucide-react-native/icons/lock';
import LogOut from 'lucide-react-native/icons/log-out';
import Mail from 'lucide-react-native/icons/mail';
import Medal from 'lucide-react-native/icons/medal';
import Monitor from 'lucide-react-native/icons/monitor';
import Moon from 'lucide-react-native/icons/moon';
import Palette from 'lucide-react-native/icons/palette';
import Play from 'lucide-react-native/icons/play';
import Puzzle from 'lucide-react-native/icons/puzzle';
import RefreshCw from 'lucide-react-native/icons/refresh-cw';
import RotateCcw from 'lucide-react-native/icons/rotate-ccw';
import Search from 'lucide-react-native/icons/search';
import Shuffle from 'lucide-react-native/icons/shuffle';
import Smartphone from 'lucide-react-native/icons/smartphone';
import Sparkles from 'lucide-react-native/icons/sparkles';
import Star from 'lucide-react-native/icons/star';
import Sun from 'lucide-react-native/icons/sun';
import Sunrise from 'lucide-react-native/icons/sunrise';
import Target from 'lucide-react-native/icons/target';
import Timer from 'lucide-react-native/icons/timer';
import TrendingUp from 'lucide-react-native/icons/trending-up';
import Trophy from 'lucide-react-native/icons/trophy';
import User from 'lucide-react-native/icons/user';
import X from 'lucide-react-native/icons/x';
import Zap from 'lucide-react-native/icons/zap';
import Trash2 from 'lucide-react-native/icons/trash-2';
import ShieldCheck from 'lucide-react-native/icons/shield-check';
import Bell from 'lucide-react-native/icons/bell';
import BellOff from 'lucide-react-native/icons/bell-off';
import Scale from 'lucide-react-native/icons/scale';
import type { LucideIcon } from 'lucide-react-native';

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
  trash: Trash2,
  shield: ShieldCheck,
  bell: Bell,
  'bell-off': BellOff,
  scale: Scale,
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
