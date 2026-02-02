import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
import './ExpertRegistration.css'

const ExpertApplyPage = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    city: '',

    // Step 2: Professional Info
    experience: '',
    specialization: '',
    education: '',
    certifications: '',

    // Step 3: Expertise
    background: '',
    skills: [],
    hourlyRate: '',
    availability: '',

    // Step 4: Portfolio & Final
    portfolio: '',
    resume: null,
    linkedin: '',
    github: '',
    agreeToTerms: false
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked :
          type === 'file' ? files[0] :
              value
    }))
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
          ? prev.skills.filter(s => s !== skill)
          : [...prev.skills, skill]
    }))
  }

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
      if (!formData.email.trim()) newErrors.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
      if (!formData.country.trim()) newErrors.country = 'Country is required'
    }

    if (step === 2) {
      if (!formData.experience) newErrors.experience = 'Experience level is required'
      if (!formData.specialization) newErrors.specialization = 'Specialization is required'
      if (!formData.education.trim()) newErrors.education = 'Education is required'
    }

    if (step === 3) {
      if (!formData.background.trim()) newErrors.background = 'Professional background is required'
      if (formData.background.length < 100) newErrors.background = 'Please provide at least 100 characters'
      if (formData.skills.length === 0) newErrors.skills = 'Please select at least one skill'
      if (!formData.hourlyRate) newErrors.hourlyRate = 'Hourly rate is required'
    }

    if (step === 4) {
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must accept the terms'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateStep(4)) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitSuccess(true)

      // Reset form after successful submission
      setTimeout(() => {
        navigate('/expert/dashboard')
      }, 3000)
    }, 2000)
  }

  const specializations = [
    'Digital Forensics',
    'Computer Vision',
    'Machine Learning',
    'Deep Learning',
    'Multimedia Analysis',
    'Cybersecurity',
    'Academic Research',
    'AI Ethics'
  ]

  const availableSkills = [
    'Image Analysis',
    'Video Analysis',
    'Audio Forensics',
    'Neural Networks',
    'Pattern Recognition',
    'Data Science',
    'Python/TensorFlow',
    'Computer Graphics',
    'Signal Processing',
    'Statistical Analysis'
  ]

  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia',
    'Germany', 'France', 'Netherlands', 'Singapore',
    'India', 'Japan', 'South Korea', 'Other'
  ]

  const steps = [
    { number: 1, title: 'Personal Info', icon: '👤' },
    { number: 2, title: 'Professional', icon: '💼' },
    { number: 3, title: 'Expertise', icon: '⭐' },
    { number: 4, title: 'Review', icon: '✓' }
  ]

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  // Success Screen
  if (submitSuccess) {
    return (
        <div className="registration-container">
          <motion.div
              className="success-screen"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
          >
            <div className="success-icon-large">✓</div>
            <h1 className="success-title">Application Submitted!</h1>
            <p className="success-message">
              Thank you for applying to join our expert network.
              We'll review your application and get back to you within 5-7 business days.
            </p>
            <div className="success-actions">
              <Button
                  variant="gradient"
                  size="large"
                  onClick={() => navigate('/expert/dashboard')}
              >
                Go to Dashboard
              </Button>
            </div>
          </motion.div>
        </div>
    )
  }

  return (
      <div className="registration-container">
        {/* Header */}
        <div className="registration-header">
          <div className="header-content">
            <button
                className="back-link"
                onClick={() => navigate('/expert')}
            >
              ← Back to Expert Portal
            </button>
            <h1 className="registration-title">Join as an Expert</h1>
            <p className="registration-subtitle">
              Share your expertise in deepfake detection and AI analysis
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="steps-container">
          <div className="steps-wrapper">
            {steps.map((step, index) => (
                <div
                    key={step.number}
                    className={`step-item ${currentStep >= step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
                >
                  <div className="step-indicator">
                    <div className="step-circle">
                      {currentStep > step.number ? '✓' : step.number}
                    </div>
                    <div className="step-label">
                      <span className="step-title">{step.title}</span>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                      <div className="step-connector"></div>
                  )}
                </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="registration-form-container">
          <Card className="registration-card">
            <AnimatePresence mode="wait">
              <motion.div
                  key={currentStep}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                      <div className="form-step">
                        <div className="step-header">
                          <h2 className="step-heading">Personal Information</h2>
                          <p className="step-description">
                            Let's start with some basic information about you
                          </p>
                        </div>

                        <div className="form-grid">
                          <div className="form-group">
                            <label className="form-label">
                              First Name <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={`form-input ${errors.firstName ? 'error' : ''}`}
                                placeholder="John"
                            />
                            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                          </div>

                          <div className="form-group">
                            <label className="form-label">
                              Last Name <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={`form-input ${errors.lastName ? 'error' : ''}`}
                                placeholder="Doe"
                            />
                            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Email Address <span className="required">*</span>
                          </label>
                          <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className={`form-input ${errors.email ? 'error' : ''}`}
                              placeholder="john.doe@example.com"
                          />
                          {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Phone Number
                          </label>
                          <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className="form-input"
                              placeholder="+1 (555) 000-0000"
                          />
                        </div>

                        <div className="form-grid">
                          <div className="form-group">
                            <label className="form-label">
                              Country <span className="required">*</span>
                            </label>
                            <select
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className={`form-input ${errors.country ? 'error' : ''}`}
                            >
                              <option value="">Select your country</option>
                              {countries.map(country => (
                                  <option key={country} value={country}>{country}</option>
                              ))}
                            </select>
                            {errors.country && <span className="error-message">{errors.country}</span>}
                          </div>

                          <div className="form-group">
                            <label className="form-label">
                              City
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="San Francisco"
                            />
                          </div>
                        </div>
                      </div>
                  )}

                  {/* Step 2: Professional Background */}
                  {currentStep === 2 && (
                      <div className="form-step">
                        <div className="step-header">
                          <h2 className="step-heading">Professional Background</h2>
                          <p className="step-description">
                            Tell us about your professional experience and qualifications
                          </p>
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Years of Experience <span className="required">*</span>
                          </label>
                          <select
                              name="experience"
                              value={formData.experience}
                              onChange={handleChange}
                              className={`form-input ${errors.experience ? 'error' : ''}`}
                          >
                            <option value="">Select your experience level</option>
                            <option value="1-2">1-2 years</option>
                            <option value="3-5">3-5 years</option>
                            <option value="5-10">5-10 years</option>
                            <option value="10+">10+ years</option>
                          </select>
                          {errors.experience && <span className="error-message">{errors.experience}</span>}
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Primary Specialization <span className="required">*</span>
                          </label>
                          <select
                              name="specialization"
                              value={formData.specialization}
                              onChange={handleChange}
                              className={`form-input ${errors.specialization ? 'error' : ''}`}
                          >
                            <option value="">Select your primary area</option>
                            {specializations.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                          </select>
                          {errors.specialization && <span className="error-message">{errors.specialization}</span>}
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Highest Education Level <span className="required">*</span>
                          </label>
                          <input
                              type="text"
                              name="education"
                              value={formData.education}
                              onChange={handleChange}
                              className={`form-input ${errors.education ? 'error' : ''}`}
                              placeholder="e.g., Ph.D. in Computer Science, MIT"
                          />
                          {errors.education && <span className="error-message">{errors.education}</span>}
                          <small className="form-hint">
                            Include your degree and institution
                          </small>
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Certifications
                          </label>
                          <textarea
                              name="certifications"
                              value={formData.certifications}
                              onChange={handleChange}
                              className="form-input"
                              rows="3"
                              placeholder="List any relevant certifications (e.g., AWS ML, Google AI, etc.)"
                          />
                        </div>
                      </div>
                  )}

                  {/* Step 3: Expertise & Skills */}
                  {currentStep === 3 && (
                      <div className="form-step">
                        <div className="step-header">
                          <h2 className="step-heading">Your Expertise</h2>
                          <p className="step-description">
                            Showcase your skills and set your professional rate
                          </p>
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Professional Background <span className="required">*</span>
                          </label>
                          <textarea
                              name="background"
                              value={formData.background}
                              onChange={handleChange}
                              className={`form-input ${errors.background ? 'error' : ''}`}
                              rows="5"
                              placeholder="Describe your professional journey, key achievements, and relevant experience in deepfake detection, AI, or digital forensics..."
                          />
                          {errors.background && <span className="error-message">{errors.background}</span>}
                          <small className="form-hint">
                            {formData.background.length}/100 characters minimum
                          </small>
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Technical Skills <span className="required">*</span>
                          </label>
                          <div className="skills-grid">
                            {availableSkills.map(skill => (
                                <button
                                    key={skill}
                                    type="button"
                                    onClick={() => handleSkillToggle(skill)}
                                    className={`skill-tag ${formData.skills.includes(skill) ? 'selected' : ''}`}
                                >
                                  {formData.skills.includes(skill) && <span className="check">✓</span>}
                                  {skill}
                                </button>
                            ))}
                          </div>
                          {errors.skills && <span className="error-message">{errors.skills}</span>}
                          <small className="form-hint">
                            Select all that apply ({formData.skills.length} selected)
                          </small>
                        </div>

                        <div className="form-grid">
                          <div className="form-group">
                            <label className="form-label">
                              Hourly Rate (USD) <span className="required">*</span>
                            </label>
                            <div className="input-with-prefix">
                              <span className="input-prefix">$</span>
                              <input
                                  type="number"
                                  name="hourlyRate"
                                  value={formData.hourlyRate}
                                  onChange={handleChange}
                                  className={`form-input ${errors.hourlyRate ? 'error' : ''}`}
                                  placeholder="150"
                                  min="0"
                              />
                            </div>
                            {errors.hourlyRate && <span className="error-message">{errors.hourlyRate}</span>}
                          </div>

                          <div className="form-group">
                            <label className="form-label">
                              Availability
                            </label>
                            <select
                                name="availability"
                                value={formData.availability}
                                onChange={handleChange}
                                className="form-input"
                            >
                              <option value="">Select availability</option>
                              <option value="full-time">Full-time (40+ hrs/week)</option>
                              <option value="part-time">Part-time (20-40 hrs/week)</option>
                              <option value="as-needed">As needed (less than 20 hrs/week)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                  )}

                  {/* Step 4: Portfolio & Review */}
                  {currentStep === 4 && (
                      <div className="form-step">
                        <div className="step-header">
                          <h2 className="step-heading">Portfolio & Final Details</h2>
                          <p className="step-description">
                            Add your professional profiles and review your application
                          </p>
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Portfolio Website
                          </label>
                          <input
                              type="url"
                              name="portfolio"
                              value={formData.portfolio}
                              onChange={handleChange}
                              className="form-input"
                              placeholder="https://yourportfolio.com"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            LinkedIn Profile
                          </label>
                          <input
                              type="url"
                              name="linkedin"
                              value={formData.linkedin}
                              onChange={handleChange}
                              className="form-input"
                              placeholder="https://linkedin.com/in/yourprofile"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            GitHub Profile
                          </label>
                          <input
                              type="url"
                              name="github"
                              value={formData.github}
                              onChange={handleChange}
                              className="form-input"
                              placeholder="https://github.com/yourusername"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            Resume / CV
                          </label>
                          <div className="file-upload">
                            <input
                                type="file"
                                name="resume"
                                onChange={handleChange}
                                accept=".pdf,.doc,.docx"
                                className="file-input"
                                id="resume-upload"
                            />
                            <label htmlFor="resume-upload" className="file-label">
                              <span className="file-icon">📎</span>
                              <span className="file-text">
                            {formData.resume ? formData.resume.name : 'Choose file or drag here'}
                          </span>
                            </label>
                          </div>
                          <small className="form-hint">
                            Accepted formats: PDF, DOC, DOCX (Max 10MB)
                          </small>
                        </div>

                        <div className="review-section">
                          <h3 className="review-title">Application Summary</h3>
                          <div className="review-grid">
                            <div className="review-item">
                              <span className="review-label">Name:</span>
                              <span className="review-value">{formData.firstName} {formData.lastName}</span>
                            </div>
                            <div className="review-item">
                              <span className="review-label">Email:</span>
                              <span className="review-value">{formData.email}</span>
                            </div>
                            <div className="review-item">
                              <span className="review-label">Location:</span>
                              <span className="review-value">{formData.city}, {formData.country}</span>
                            </div>
                            <div className="review-item">
                              <span className="review-label">Experience:</span>
                              <span className="review-value">{formData.experience} years</span>
                            </div>
                            <div className="review-item">
                              <span className="review-label">Specialization:</span>
                              <span className="review-value">{formData.specialization}</span>
                            </div>
                            <div className="review-item">
                              <span className="review-label">Hourly Rate:</span>
                              <span className="review-value">${formData.hourlyRate}/hr</span>
                            </div>
                            <div className="review-item">
                              <span className="review-label">Skills:</span>
                              <span className="review-value">{formData.skills.join(', ')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="form-group checkbox-group">
                          <label className="checkbox-container">
                            <input
                                type="checkbox"
                                name="agreeToTerms"
                                checked={formData.agreeToTerms}
                                onChange={handleChange}
                            />
                            <span className="checkbox-custom"></span>
                            <span className="checkbox-label">
                          I agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a>.
                          I understand this is a demonstration platform.
                        </span>
                          </label>
                          {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms}</span>}
                        </div>
                      </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="form-navigation">
                    <div className="nav-left">
                      {currentStep > 1 && (
                          <Button
                              type="button"
                              variant="outline"
                              onClick={prevStep}
                          >
                            ← Previous
                          </Button>
                      )}
                    </div>
                    <div className="nav-right">
                      {currentStep < 4 ? (
                          <Button
                              type="button"
                              variant="gradient"
                              onClick={nextStep}
                          >
                            Continue →
                          </Button>
                      ) : (
                          <Button
                              type="submit"
                              variant="gradient"
                              disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Submitting...' : 'Submit Application'}
                          </Button>
                      )}
                    </div>
                  </div>
                </form>
              </motion.div>
            </AnimatePresence>
          </Card>

          {/* Help Section */}
          <div className="registration-help">
            <p className="help-text">
              Need help? <a href="/support">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
  )
}

export default ExpertApplyPage