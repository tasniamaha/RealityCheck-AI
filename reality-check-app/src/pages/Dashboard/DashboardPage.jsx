import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
import Badge from '../../components/common/Badge.jsx'
import { getAllScans, getStats } from '../../store/scanStore.jsx'
import './Dashboard.css'

const DashboardPage = () => {
  const [scans, setScans] = useState([])
  const [stats, setStats] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [activeTab, setActiveTab] = useState('upload')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    loadScans()
  }, [])

  const loadScans = () => {
    const allScans = getAllScans()
    const scanStats = getStats()
    setScans(allScans)
    setStats(scanStats)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setIsProcessing(true)
    setTimeout(() => setIsProcessing(false), 2000)
  }

  const handleFileInput = (e) => {
    setIsProcessing(true)
    setTimeout(() => setIsProcessing(false), 2000)
  }

  return (
    <div className="dashboard-page-redesign">
      {/* Animated Background */}
      <div className="dashboard-bg">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
        <div className="bg-grid"></div>
      </div>

      <div className="dashboard-header-redesign">
        <div className="header-content">
          <div className="header-icon">🛡️</div>
          <div>
            <h1 className="dashboard-title">Detection Dashboard</h1>
            <p className="dashboard-subtitle">AI-powered deepfake analysis at your fingertips</p>
          </div>
        </div>
        <div className="header-badges">
          <div className="secure-badge pulse-badge">
            <span className="badge-dot"></span>
            <span>Live System</span>
          </div>
          <div className="stats-quick">
            <span className="quick-stat">{stats?.total || 0} Scans</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Main Content Area */}
        <div className="main-content">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <span className="tab-icon">📤</span>
              <span>Upload & Scan</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
              onClick={() => setActiveTab('guide')}
            >
              <span className="tab-icon">📖</span>
              <span>How It Works</span>
            </button>
            <div className="tab-indicator"></div>
          </div>

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="tab-content animate-in">
              <div
                className={`upload-dropzone-modern ${dragActive ? 'drag-active' : ''} ${isProcessing ? 'processing' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="upload-visual">
                  <div className="upload-circle">
                    <div className="circle-inner">
                      {isProcessing ? (
                        <div className="processing-spinner">
                          <div className="spinner"></div>
                        </div>
                      ) : (
                        <>
                          <div className="upload-icon-modern">📤</div>
                          <div className="upload-pulse"></div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <h3 className="upload-title">
                  {isProcessing ? 'Processing...' : 'Drop Your Media Here'}
                </h3>
                <p className="upload-desc">
                  Supports MP4, AVI, MOV, JPG, PNG • Max 500MB
                </p>

                <div className="upload-actions">
                  <input
                    type="file"
                    onChange={handleFileInput}
                    accept="image/*,video/*"
                    style={{ display: 'none' }}
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="btn-upload-primary">
                    <span>Choose File</span>
                  </label>
                  <button className="btn-upload-secondary">
                    <span>📹</span>
                    <span>Record Video</span>
                  </button>
                </div>

                <div className="upload-features">
                  <div className="feature-tag">
                    <span>⚡</span>
                    <span>Instant Analysis</span>
                  </div>
                  <div className="feature-tag">
                    <span>🔒</span>
                    <span>256-bit Encrypted</span>
                  </div>
                  <div className="feature-tag">
                    <span>🎯</span>
                    <span>98.7% Accuracy</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Guide Tab */}
          {activeTab === 'guide' && (
            <div className="tab-content animate-in">
              <div className="guide-grid">
                <div className="guide-card">
                  <div className="guide-number">01</div>
                  <div className="guide-icon">📤</div>
                  <h4>Upload Media</h4>
                  <p>Drag and drop or select your video/image file</p>
                  <div className="guide-arrow">→</div>
                </div>

                <div className="guide-card">
                  <div className="guide-number">02</div>
                  <div className="guide-icon">🧠</div>
                  <h4>AI Analysis</h4>
                  <p>Neural networks scan for manipulation patterns</p>
                  <div className="guide-arrow">→</div>
                </div>

                <div className="guide-card">
                  <div className="guide-number">03</div>
                  <div className="guide-icon">📊</div>
                  <h4>Get Results</h4>
                  <p>Receive detailed authenticity report with confidence score</p>
                  <div className="guide-arrow">→</div>
                </div>

                <div className="guide-card">
                  <div className="guide-number">04</div>
                  <div className="guide-icon">👨‍⚖️</div>
                  <h4>Expert Review</h4>
                  <p>Uncertain cases verified by certified experts</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Sidebar */}
        <div className="dashboard-sidebar-modern">
          {/* Live Statistics */}
          <Card className="stats-card-modern" glass>
            <div className="card-header-modern">
              <h3>📊 Live Statistics</h3>
              <div className="pulse-indicator"></div>
            </div>

            <div className="stats-showcase">
              <div className="stat-circle-item">
                <svg className="stat-progress" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" />
                  <circle cx="50" cy="50" r="45" style={{strokeDashoffset: `calc(283 - (283 * ${(stats?.real || 0) / (stats?.total || 1) * 100}) / 100)`}} />
                </svg>
                <div className="stat-circle-content">
                  <div className="stat-big-number">{stats?.real || 0}</div>
                  <div className="stat-small-label">Authentic</div>
                </div>
              </div>

              <div className="stats-list">
                <div className="stat-item-modern">
                  <div className="stat-item-left">
                    <span className="stat-icon-circle green">✓</span>
                    <span className="stat-item-label">Total Scans</span>
                  </div>
                  <span className="stat-item-value">{stats?.total || 0}</span>
                </div>

                <div className="stat-item-modern">
                  <div className="stat-item-left">
                    <span className="stat-icon-circle red">⚠</span>
                    <span className="stat-item-label">Deepfakes</span>
                  </div>
                  <span className="stat-item-value danger">{stats?.deepfake || 0}</span>
                </div>

                <div className="stat-item-modern">
                  <div className="stat-item-left">
                    <span className="stat-icon-circle yellow">?</span>
                    <span className="stat-item-label">Under Review</span>
                  </div>
                  <span className="stat-item-value warning">{stats?.uncertain || 0}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="recent-card-modern" glass>
            <div className="card-header-modern">
              <h3>⚡ Recent Activity</h3>
              <Link to="/history" className="view-all-link">View All →</Link>
            </div>

            {scans.length > 0 ? (
              <div className="activity-timeline">
                {scans.slice(0, 3).map((scan, index) => (
                  <Link to={`/results/${scan.id}`} key={scan.id} className="activity-item">
                    <div className="activity-indicator">
                      <div className="activity-dot"></div>
                      {index < 2 && <div className="activity-line"></div>}
                    </div>
                    <div className="activity-content">
                      <div className="activity-header">
                        <span className="activity-file">{scan.filename}</span>
                        <span className={`activity-confidence conf-${
                          scan.confidence > 80 ? 'high' : scan.confidence > 50 ? 'mid' : 'low'
                        }`}>
                          {Math.round(scan.confidence)}%
                        </span>
                      </div>
                      <div className="activity-meta">
                        <span className="activity-time">
                          {new Date(scan.createdAt).toLocaleDateString()}
                        </span>
                        <Badge type={scan.label === 'Real' ? 'real' : scan.label === 'Deepfake' ? 'deepfake' : 'uncertain'}>
                          {scan.label}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-activity">
                <div className="empty-icon">📭</div>
                <p>No activity yet</p>
                <span>Start your first scan to see results here</span>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="actions-card" glass>
            <h3 className="card-title-small">⚡ Quick Actions</h3>
            <div className="quick-actions-grid">
              <button className="quick-action-btn">
                <span className="action-icon">📖</span>
                <span>Docs</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">💬</span>
                <span>Support</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">⚙️</span>
                <span>Settings</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">📊</span>
                <span>Reports</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage