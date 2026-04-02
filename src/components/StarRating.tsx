interface StarRatingProps {
  stars: number
  max?: number
  size?: string
}

export default function StarRating({ stars, max = 3, size = 'text-lg' }: StarRatingProps) {
  return (
    <span className={size}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < stars ? 'opacity-100' : 'opacity-20'}>
          ⭐
        </span>
      ))}
    </span>
  )
}
