// ResetPasswordPage.jsx
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Login.css'
import './ForgotPassword.css'

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'password') {
      setPasswordRequirements({
        minLength: value.length >= 8,
        hasUpperCase: /[A-Z]/.test(value),
        hasLowerCase: /[a-z]/.test(value),
        hasNumber: /[0-9]/.test(value),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      })
    }

    if (error) setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!Object.values(passwordRequirements).every(Boolean)) {
      setError('Password does not meet all requirements')
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)

      setTimeout(() => {
        navigate('/login')
      }, 3000)
    }, 1500)
  }

  return (
    <div className="login-page-modern">
      <div className="login-bg">
        <div className="login-bg-orb login-orb-1"></div>
        <div className="login-bg-orb login-orb-2"></div>
        <div className="login-bg-orb login-orb-3"></div>
        <div className="login-bg-grid"></div>
        <div className="login-bg-particles">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
      </div>

      <div className="forgot-password-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="forgot-password-card"
        >
          <Link to="/" className="back-to-home">
            <span>←</span>
            <span>Back to Home</span>
          </Link>

          {!isSuccess ? (
            <>
              <div className="forgot-header">
                <div className="forgot-icon">🔐</div>
                <h1>Reset Your Password</h1>
                <p>Create a new password for your account</p>
                {email && (
                  <p style={{ marginTop: '8px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    Resetting password for: <strong>{email}</strong>
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="forgot-form">
                {error && (
                  <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <div className="form-group-modern">
                  <label className="form-label-modern">New Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-input-modern"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="form-group-modern">
                  <label className="form-label-modern">Confirm Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="form-input-modern"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="password-requirements">
                  <div className="requirements-title">Password must contain:</div>
                  <ul className="requirements-list">
                    <li className={passwordRequirements.minLength ? 'valid' : ''}>
                      <span className="check-icon">
                        {passwordRequirements.minLength ? '✓' : '○'}
                      </span>
                      At least 8 characters
                    </li>
                    <li className={passwordRequirements.hasUpperCase ? 'valid' : ''}>
                      <span className="check-icon">
                        {passwordRequirements.hasUpperCase ? '✓' : '○'}
                      </span>
                      One uppercase letter
                    </li>
                    <li className={passwordRequirements.hasLowerCase ? 'valid' : ''}>
                      <span className="check-icon">
                        {passwordRequirements.hasLowerCase ? '✓' : '○'}
                      </span>
                      One lowercase letter
                    </li>
                    <li className={passwordRequirements.hasNumber ? 'valid' : ''}>
                      <span className="check-icon">
                        {passwordRequirements.hasNumber ? '✓' : '○'}
                      </span>
                      One number
                    </li>
                    <li className={passwordRequirements.hasSpecialChar ? 'valid' : ''}>
                      <span className="check-icon">
                        {passwordRequirements.hasSpecialChar ? '✓' : '○'}
                      </span>
                      One special character
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  className={`btn-login-modern ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-small"></span>
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <span>→</span>
                    </>
                  )}
                </button>

                <div className="back-to-login">
                  <Link to="/login" className="back-link">
                    <span>←</span>
                    <span>Back to Login</span>
                  </Link>
                </div>
              </form>

              <div className="demo-note-modern">
                <span className="note-icon">💡</span>
                <span>This is a demo. Password will be simulated.</span>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="success-message"
            >
              <div className="success-icon">✅</div>
              <h2>Password Reset Successful!</h2>
              <p>Your password has been successfully reset.</p>
              <p className="success-note">
                Redirecting you to login page...
              </p>

              <div className="success-actions">
                <Link to="/login" className="btn-back-login">
                  Go to Login
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default ResetPasswordPage