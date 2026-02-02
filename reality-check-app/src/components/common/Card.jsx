import './Card.css'

const Card = ({
  children,
  className = '',
  glass = false,
  hover = false,
  padding = 'medium',
  ...props
}) => {
  const glassClass = glass ? 'card-glass' : 'card'
  const hoverClass = hover ? 'card-hover' : ''
  const paddingClass = `card-padding-${padding}`

  return (
    <div
      className={`${glassClass} ${hoverClass} ${paddingClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card