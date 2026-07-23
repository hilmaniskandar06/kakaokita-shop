import { Star } from 'lucide-react'

export default function RatingStars({ rating, reviews, size = 14 }) {
  return (
    <div className="flex items-center gap-1 text-xs text-cacao-600">
      <Star size={size} className="fill-gold-500 text-gold-500" />
      <span className="font-semibold text-cacao-800">{rating}</span>
      {reviews != null && <span>({reviews})</span>}
    </div>
  )
}
