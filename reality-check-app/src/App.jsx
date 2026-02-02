import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AppLayout from './components/Layout/AppLayout.jsx'
import LandingPage from './pages/Landing/LandingPage.jsx'
import ScanPage from './pages/Scan/ScanPage.jsx'
import ResultsPage from './pages/Results/ResultsPage.jsx'
import DashboardPage from './pages/Dashboard/DashboardPage.jsx'
import FlowPage from './pages/Flow/FlowPage.jsx'
import ExpertPage from './pages/Expert/ExpertPage.jsx'
import ExpertApplyPage from './pages/Expert/ExpertApplyPage.jsx'
import ExpertDashboardPage from './pages/Expert/ExpertDashboardPage.jsx'
import DemoPage from './pages/Demo/DemoPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import './App.css'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<LandingPage />} />
                    <Route path="scan" element={<ScanPage />} />
                    <Route path="results/:id" element={<ResultsPage />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="flow" element={<FlowPage />} />
                    <Route path="expert" element={<ExpertPage />} />
                    <Route path="expert/apply" element={<ExpertApplyPage />} />
                    <Route path="expert-apply" element={<ExpertApplyPage />} />
                    <Route path="expert/dashboard" element={<ExpertDashboardPage />} />
                    <Route path="demo" element={<DemoPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="signup" element={<SignupPage />} />
                    <Route path="forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="reset-password" element={<ResetPasswordPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </Router>
    )
}

export default App