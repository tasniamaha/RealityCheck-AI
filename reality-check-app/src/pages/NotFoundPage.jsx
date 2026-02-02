import { Link } from 'react-router-dom'
import Card from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import './Auth.css'

const NotFoundPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <span className="logo-icon">🔍</span>
            <span className="logo-text">Reality Check</span>
          </Link>
          <h1>404 - Page Not Found</h1>
          <p className="auth-subtitle">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Card className="auth-card" glass>
          <div className="not-found-content">
            <div className="not-found-icon">🔍</div>
            <h2>Lost in the Digital Realm</h2>
            <p>
              Don't worry! Even our advanced algorithms can't predict every path.
              Let's get you back on track.
            </p>

            <div className="not-found-actions">
              <Link to="/">
                <Button variant="primary" icon="🏠">
                  Go Home
                </Button>
              </Link>
              <Link to="/scan">
                <Button variant="ghost" icon="🔍">
                  Start New Scan
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" icon="📊">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>

          <div className="not-found-links">
            <h3>Popular Pages</h3>
            <div className="link-grid">
              <Link to="/scan">Scan Media</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/flow">How It Works</Link>
              <Link to="/demo">Demo Mode</Link>
              <Link to="/expert">Expert Portal</Link>
              <Link to="/login">Sign In</Link>
            </div>
          </div>
        </Card>

        <div className="auth-info">
          <Card className="info-card" glass>
            <h3>Need Help?</h3>
            <p>
              If you believe this page should exist, please check the URL for typos
              or contact support if the issue persists.
            </p>
            <p className="demo-note">
              Remember: This is a demonstration application.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage