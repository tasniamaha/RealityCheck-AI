export class MockAnalyzer {
  constructor() {
    this.isAnalyzing = false
    this.progress = 0
    this.interval = null
  }

  startAnalysis(onProgress, onComplete, fileInfo) {
    if (this.isAnalyzing) return

    this.isAnalyzing = true
    this.progress = 5

    // Initial phase: File validation
    setTimeout(() => {
      this.progress = 15
      onProgress(this.progress, 'Validating file format...')
    }, 500)

    // Analysis phases
    const phases = [
      { time: 1000, progress: 30, message: 'Extracting media features...' },
      { time: 2000, progress: 45, message: 'Analyzing facial landmarks...' },
      { time: 3000, progress: 60, message: 'Checking temporal coherence...' },
      { time: 4000, progress: 75, message: 'Running deep neural analysis...' },
      { time: 5000, progress: 90, message: 'Finalizing results...' }
    ]

    phases.forEach(phase => {
      setTimeout(() => {
        this.progress = phase.progress
        onProgress(this.progress, phase.message)
      }, phase.time)
    })

    // Complete analysis
    setTimeout(() => {
      this.progress = 100
      onProgress(this.progress, 'Analysis complete!')

      setTimeout(() => {
        this.isAnalyzing = false
        onComplete()
      }, 500)
    }, 6500)
  }

  cancelAnalysis() {
    if (this.interval) {
      clearInterval(this.interval)
    }
    this.isAnalyzing = false
    this.progress = 0
  }

  getRandomAnalysisTime() {
    return 6000 + Math.random() * 4000 // 6-10 seconds
  }
}