import './Badge.css'

const Badge = ({
  type = 'default',
  children,
  className = '',
  size = 'medium'
}) => {
  const typeClass = `badge-${type}`
  const sizeClass = `badge-${size}`

  return (
    <span className={`badge ${typeClass} ${sizeClass} ${className}`}>
      {children}
    </span>
  )
}

export default Badge