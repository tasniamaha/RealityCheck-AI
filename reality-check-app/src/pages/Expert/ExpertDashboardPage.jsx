import { useState } from 'react'
import Card from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
import Badge from '../../components/common/Badge.jsx'
import './Expert.css'

const ExpertDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('pending')

  const mockCases = [
    {
      id: 'CASE-001',
      type: 'Political Speech',
      priority: 'High',
      status: 'Pending',
      assignedDate: '2024-01-15',
      complexity: 'Medium',
      estimatedTime: '2-3 hours',
      reward: '$250'
    },
    {
      id: 'CASE-002',
      type: 'Celebrity Video',
      priority: 'Medium',
      status: 'In Progress',
      assignedDate: '2024-01-14',
      complexity: 'High',
      estimatedTime: '4-5 hours',
      reward: '$400'
    },
    {
      id: 'CASE-003',
      type: 'Corporate Training',
      priority: 'Low',
      status: 'Pending',
      assignedDate: '2024-01-13',
      complexity: 'Low',
      estimatedTime: '1-2 hours',
      reward: '$150'
    },
    {
      id: 'CASE-004',
      type: 'News Broadcast',
      priority: 'High',
      status: 'Completed',
      assignedDate: '2024-01-12',
      complexity: 'High',
      estimatedTime: '3-4 hours',
      reward: '$350'
    },
    {
      id: 'CASE-005',
      type: 'Social Media Clip',
      priority: 'Medium',
      status: 'Pending',
      assignedDate: '2024-01-11',
      complexity: 'Medium',
      estimatedTime: '2-3 hours',
      reward: '$200'
    }
  ]

  const stats = [
    { label: 'Total Cases', value: '24', icon: '📋' },
    { label: 'Completed', value: '18', icon: '✅' },
    { label: 'Pending', value: '3', icon: '⏳' },
    { label: 'In Progress', value: '3', icon: '🔍' },
    { label: 'Total Earnings', value: '$4,850', icon: '💰' },
    { label: 'Avg. Rating', value: '4.8/5', icon: '⭐' }
  ]

  const filteredCases = mockCases.filter(caseItem =>
    activeTab === 'all' ||
    caseItem.status.toLowerCase() === activeTab.toLowerCase().replace(' ', '')
  )

  return (
    <div className="expert-dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Expert Dashboard</h1>
          <p className="page-subtitle">Welcome back, Expert User</p>
        </div>
        <div className="header-actions">
          <Button variant="primary" icon="🔄">
            Refresh
          </Button>
          <Button variant="ghost" icon="⚙️">
            Settings
          </Button>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <Card key={index} className="stat-card" glass hover>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="tabs-section">
        <div className="tabs">
          {['Pending', 'In Progress', 'Completed', 'All'].map(tab => (
            <button
              key={tab}
              className={`tab ${activeTab === tab.toLowerCase().replace(' ', '') ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.toLowerCase().replace(' ', ''))}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <Card className="cases-card" glass>
        <div className="cases-header">
          <h2>Assigned Cases</h2>
          <span className="cases-count">{filteredCases.length} cases</span>
        </div>

        <div className="cases-table">
          <div className="table-header">
            <div className="table-cell">Case ID</div>
            <div className="table-cell">Type</div>
            <div className="table-cell">Priority</div>
            <div className="table-cell">Status</div>
            <div className="table-cell">Complexity</div>
            <div className="table-cell">Reward</div>
            <div className="table-cell">Actions</div>
          </div>

          <div className="table-body">
            {filteredCases.map((caseItem) => (
              <div key={caseItem.id} className="table-row">
                <div className="table-cell">
                  <div className="case-id">{caseItem.id}</div>
                  <div className="case-date">Assigned: {caseItem.assignedDate}</div>
                </div>

                <div className="table-cell">
                  {caseItem.type}
                </div>

                <div className="table-cell">
                  <Badge
                    type={
                      caseItem.priority === 'High' ? 'deepfake' :
                      caseItem.priority === 'Medium' ? 'uncertain' : 'primary'
                    }
                  >
                    {caseItem.priority}
                  </Badge>
                </div>

                <div className="table-cell">
                  <Badge
                    type={
                      caseItem.status === 'Completed' ? 'real' :
                      caseItem.status === 'In Progress' ? 'secondary' : 'default'
                    }
                  >
                    {caseItem.status}
                  </Badge>
                </div>

                <div className="table-cell">
                  <div className="complexity">
                    <div className="complexity-bar">
                      <div
                        className="complexity-fill"
                        style={{
                          width: caseItem.complexity === 'High' ? '100%' :
                                 caseItem.complexity === 'Medium' ? '66%' : '33%'
                        }}
                      ></div>
                    </div>
                    <span>{caseItem.complexity}</span>
                  </div>
                </div>

                <div className="table-cell">
                  <div className="reward">{caseItem.reward}</div>
                  <div className="time-estimate">{caseItem.estimatedTime}</div>
                </div>

                <div className="table-cell">
                  {caseItem.status === 'Pending' ? (
                    <Button variant="primary" size="small" icon="▶️">
                      Start
                    </Button>
                  ) : caseItem.status === 'In Progress' ? (
                    <Button variant="secondary" size="small" icon="📝">
                      Continue
                    </Button>
                  ) : (
                    <Button variant="ghost" size="small" icon="👁️">
                      Review
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredCases.length === 0 && (
          <div className="empty-cases">
            <div className="empty-icon">📭</div>
            <h3>No cases found</h3>
            <p>There are no {activeTab} cases assigned to you at the moment.</p>
          </div>
        )}
      </Card>

      <div className="dashboard-actions">
        <Card className="quick-actions-card" glass>
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <Button variant="soft" icon="📋" fullWidth>
              View Guidelines
            </Button>
            <Button variant="soft" icon="💬" fullWidth>
              Support Chat
            </Button>
            <Button variant="soft" icon="📊" fullWidth>
              Performance Report
            </Button>
            <Button variant="soft" icon="🎓" fullWidth>
              Training Materials
            </Button>
          </div>
        </Card>

        <Card className="info-card" glass>
          <h3>⚠️ Demonstration Only</h3>
          <p>
            This expert dashboard is for demonstration purposes only.
            No real cases are assigned and no actual verification work is performed.
          </p>
        </Card>
      </div>
    </div>
  )
}

export default ExpertDashboardPage