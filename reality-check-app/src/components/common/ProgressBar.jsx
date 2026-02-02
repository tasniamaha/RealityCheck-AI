import './ProgressBar.css'

const ProgressBar = ({
  progress = 0,
  label = '',
  showPercentage = true,
  animated = false,
  className = ''
}) => {
  return (
    <div className={`progress-container ${className}`}>
      {label && (
        <div className="progress-label">
          <span>{label}</span>
          {showPercentage && (
            <span className="progress-percentage">{Math.round(progress)}%</span>
          )}
        </div>
      )}
      <div className="progress-track">
        <div
          className={`progress-bar ${animated ? 'animated' : ''}`}
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          {animated && <div className="progress-shimmer"></div>}
        </div>
      </div>
    </div>
  )
}

export default ProgressBar