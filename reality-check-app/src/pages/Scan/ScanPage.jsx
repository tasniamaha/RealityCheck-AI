import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/common/Button';
import AnimatedCard from '../../components/common/AnimatedCard';
import PageTransition from '../../components/Layout/PageTransition';
import './Scan.css';

// Import from your mockData file
import { getRandomMockScan } from '../../data/mockData.js';

const ScanPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([
    'physics', 'facial', 'audio', 'shadows'
  ]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleAnalyze = () => {
    if (!file) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setCurrentStep(0);

    // Get a random mock scan with realistic data
    const mockScanData = getRandomMockScan();

    // Update with uploaded file info if available
    const scanData = {
      ...mockScanData,
      id: `scan_${Date.now()}`,
      filename: file.name,
      fileSize: file.size,
      type: file.type.includes('video') ? 'video' : file.type.includes('audio') ? 'audio' : 'image',
      createdAt: new Date().toISOString(),
      analysisDate: new Date().toLocaleString(),
      // Use uploaded file preview if available, otherwise use mock image
      previewUrl: file ? URL.createObjectURL(file) : mockScanData.previewUrl
    };

    // Store in sessionStorage
    sessionStorage.setItem('currentScan', JSON.stringify(scanData));
    sessionStorage.setItem('lastScanId', scanData.id);

    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        const newProgress = prev + 1;

        // Update current step based on progress
        if (newProgress >= 16.6 && currentStep < 1) setCurrentStep(1);
        if (newProgress >= 33.2 && currentStep < 2) setCurrentStep(2);
        if (newProgress >= 49.8 && currentStep < 3) setCurrentStep(3);
        if (newProgress >= 66.4 && currentStep < 4) setCurrentStep(4);
        if (newProgress >= 83 && currentStep < 5) setCurrentStep(5);

        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Navigate to results page with scan ID
            navigate(`/results/${scanData.id}`);
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 30);
  };

  const toggleOption = (option) => {
    setSelectedOptions(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  const analysisOptions = [
    { id: 'physics', label: 'Visual Physics', icon: '⚛️', description: 'Analyzes lighting and physics' },
    { id: 'facial', label: 'Facial Expression', icon: '😊', description: 'Micro-expression detection' },
    { id: 'audio', label: 'Audio-Lip Sync', icon: '👄', description: 'Speech synchronization' },
    { id: 'shadows', label: 'Shadow Pattern', icon: '🌓', description: 'Shadow consistency check' },
    { id: 'metadata', label: 'Metadata', icon: '📄', description: 'File metadata analysis' },
    { id: 'network', label: 'Neural Artifacts', icon: '🕸️', description: 'AI generation patterns' },
  ];

  const analysisSteps = [
    { text: 'Loading file...', icon: '📂' },
    { text: 'Extracting frames...', icon: '🎬' },
    { text: 'Analyzing physics...', icon: '⚛️' },
    { text: 'Detecting facial patterns...', icon: '😊' },
    { text: 'Checking audio sync...', icon: '👄' },
    { text: 'Finalizing results...', icon: '✨' }
  ];

  // Handler for "View Sample Results" button
  const handleViewSample = () => {
    const demoScan = getRandomMockScan();
    // Store in sessionStorage so ResultsPage can access it
    sessionStorage.setItem('currentScan', JSON.stringify(demoScan));
    sessionStorage.setItem('lastScanId', demoScan.id);
    // Navigate to results page
    navigate(`/results/${demoScan.id}`);
  };

  return (
    <PageTransition>
      <div className="scan-page-modern">
        {/* Dynamic Animated Background */}
        <div className="scan-bg">
          <div className="scan-bg-orb scan-orb-1"></div>
          <div className="scan-bg-orb scan-orb-2"></div>
          <div className="scan-bg-orb scan-orb-3"></div>
          <div className="scan-bg-orb scan-orb-4"></div>
          <div className="scan-bg-grid"></div>
          <div className="scan-bg-particles">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="particle"></div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="scan-container-modern"
        >
          {/* Header */}
          <div className="scan-header-modern">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="header-icon-modern"
            >
              🔍
            </motion.div>
            <h1 className="scan-title-modern">
              Media Verification
            </h1>
            <p className="scan-subtitle-modern">
              Upload any video or image file for comprehensive AI analysis
            </p>
          </div>

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="upload-card-modern"
          >
            <div className="card-glow"></div>
            <div className="upload-header-modern">
              <h2>📤 Upload Media</h2>
              <p className="upload-info-modern">
                MP4, MOV, AVI, JPG, PNG • Max 500MB
              </p>
            </div>

            <div
              className={`upload-zone-modern ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="file-input-hidden"
                onChange={handleFileChange}
                accept="video/*,audio/*,image/*"
              />

              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="upload-placeholder-modern"
                  >
                    <div className="upload-circle-modern">
                      <div className="circle-rings">
                        <div className="ring ring-1"></div>
                        <div className="ring ring-2"></div>
                        <div className="ring ring-3"></div>
                      </div>
                      <div className="upload-icon-center">
                        <span>📤</span>
                      </div>
                    </div>
                    <h3>Drag & Drop Media Here</h3>
                    <p>or click to browse files</p>
                    <div className="upload-features-tags">
                      <span className="feature-tag">⚡ Fast</span>
                      <span className="feature-tag">🔒 Secure</span>
                      <span className="feature-tag">🎯 Accurate</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="file-preview-modern"
                  >
                    <div className="file-success-icon">✓</div>
                    <div className="file-info-modern">
                      <div className="file-icon-large">🎹</div>
                      <div className="file-details-modern">
                        <h4>{file.name}</h4>
                        <p>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <div className="file-actions-modern">
                      <button
                        className="btn-change-file"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        Change File
                      </button>
                      <button
                        className="btn-remove-file"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Analysis Options */}
          {!isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="options-card-modern"
            >
              <h2>⚙️ Analysis Configuration</h2>
              <p className="options-description-modern">
                Select detection modules to run on your media
              </p>

              <div className="options-grid-modern">
                {analysisOptions.map((option, index) => (
                  <motion.div
                    key={option.id}
                    className={`option-card ${selectedOptions.includes(option.id) ? 'selected' : ''}`}
                    onClick={() => toggleOption(option.id)}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <div className="option-icon-large">{option.icon}</div>
                    <h4>{option.label}</h4>
                    <p>{option.description}</p>
                    <div className="option-toggle-modern">
                      <div className={`toggle-switch-modern ${selectedOptions.includes(option.id) ? 'on' : ''}`}>
                        <div className="toggle-slider"></div>
                      </div>
                      <span className="toggle-label">
                        {selectedOptions.includes(option.id) ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Analysis Progress */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="analysis-card-modern"
              >
                <div className="analysis-header">
                  <div className="analysis-icon-animated">
                    <div className="scan-rays"></div>
                    <span>🔍</span>
                  </div>
                  <h2>Analyzing Your Media</h2>
                  <p>Our AI is examining your file for synthetic patterns</p>
                </div>

                <div className="progress-section">
                  <div className="progress-circle-container">
                    <svg className="progress-ring" viewBox="0 0 200 200">
                      <circle className="progress-ring-bg" cx="100" cy="100" r="85" />
                      <circle
                        className="progress-ring-fill"
                        cx="100"
                        cy="100"
                        r="85"
                        style={{
                          strokeDashoffset: `calc(534 - (534 * ${analysisProgress}) / 100)`
                        }}
                      />
                    </svg>
                    <div className="progress-text-center">
                      <div className="progress-percent">{Math.round(analysisProgress)}%</div>
                      <div className="progress-label">Analyzing</div>
                    </div>
                  </div>

                  <div className="analysis-steps-list">
                    {analysisSteps.map((step, index) => (
                      <motion.div
                        key={index}
                        className={`step-item ${index <= currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="step-icon-wrapper">
                          {index < currentStep ? (
                            <span className="step-check">✓</span>
                          ) : (
                            <span className="step-icon">{step.icon}</span>
                          )}
                        </div>
                        <span className="step-text">{step.text}</span>
                        {index === currentStep && (
                          <motion.div
                            className="step-loader"
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          {!isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="action-section"
            >
              <Button
                variant="primary"
                size="large"
                onClick={handleAnalyze}
                disabled={!file}
                className="btn-analyze-modern"
              >
                <span className="btn-icon">🚀</span>
                <span>Start Advanced Analysis</span>
              </Button>

              <Button
                variant="outline"
                size="large"
                onClick={handleViewSample}
                className="btn-demo-modern"
              >
                <span className="btn-icon">🎮</span>
                <span>View Sample Results</span>
              </Button>
            </motion.div>
          )}

          {/* Quick Stats */}
          {!isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="stats-showcase"
            >
              <div className="stats-grid-modern">
                {[
                  { value: '98.7%', label: 'Detection Accuracy', icon: '🎯' },
                  { value: '2.3s', label: 'Avg. Analysis Time', icon: '⚡' },
                  { value: '50K+', label: 'Media Analyzed', icon: '📊' },
                  { value: '99.9%', label: 'User Satisfaction', icon: '⭐' }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="stat-card-modern"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <div className="stat-icon-modern">{stat.icon}</div>
                    <div className="stat-value-modern">{stat.value}</div>
                    <div className="stat-label-modern">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default ScanPage;