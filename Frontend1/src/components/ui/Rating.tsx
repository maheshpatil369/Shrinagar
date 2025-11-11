import { Star, StarHalf } from 'lucide-react';
import { cn } from '../../lib/utils'; // Use relative path

interface RatingProps {
  value: number;
  text?: string;
  className?: string;
}

/**
 * Displays a 5-star rating component.
 * @param value - The numerical rating value (e.g., 4.5).
 * @param text - Optional text to display next to the stars (e.g., "(12 reviews)").
 * @param className - Optional additional class names.
 */
const Rating = ({ value, text, className }: RatingProps) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      i <= value ? (
        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
      ) : i - 0.5 <= value ? (
        <StarHalf key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
      ) : (
        <Star key={i} className="h-4 w-4 fill-muted text-muted-foreground/50" />
      )
    );
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center">{stars}</div>
      {text && <span className="text-xs text-muted-foreground">{text}</span>}
    </div>
  );
};
export default Rating;