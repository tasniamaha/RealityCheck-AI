import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Login.css'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate sending reset email
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 1500)
  }

  return (
    <div className="login-page-modern">
      {/* Dynamic Background */}
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

          {!isSubmitted ? (
            <>
              <div className="forgot-header">
                <div className="forgot-icon">🔐</div>
                <h1>Forgot Password?</h1>
                <p>No worries! Enter your email and we'll send you reset instructions.</p>
              </div>

              <form onSubmit={handleSubmit} className="forgot-form">
                <div className="form-group-modern">
                  <label className="form-label-modern">Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📧</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input-modern"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`btn-login-modern ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-small"></span>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
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
                <span>This is a demo. No actual email will be sent.</span>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="success-message"
            >
              <div className="success-icon">✅</div>
              <h2>Check Your Email</h2>
              <p>
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
              <p className="success-note">
                Didn't receive the email? Check your spam folder or try again.
              </p>

              <div className="success-actions">
                <button
                  className="btn-resend"
                  onClick={() => {
                    setIsSubmitted(false)
                    setEmail('')
                  }}
                >
                  Try Another Email
                </button>
                <Link to="/login" className="btn-back-login">
                  Back to Login
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage