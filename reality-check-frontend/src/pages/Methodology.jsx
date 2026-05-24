import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Methodology() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8"
        >
          <ArrowLeft size={20} /> Back to Home
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-12 neon-border"
        >
          <h1 className="text-5xl font-bold mb-10 text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Project Methodology
          </h1>

          <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed">
            <h2 className="text-3xl font-semibold mt-10 mb-6">Methodology</h2>
            
            <p className="mb-8">
              The development of Reality Check followed a structured methodology that combined artificial intelligence, full-stack web development, and ethical AI design principles to create an interpretable media authenticity verification platform. The methodology was divided into several phases: requirement analysis, system design, dataset preparation, model development, backend and frontend integration, explainability implementation, and evaluation.
            </p>

            <h3 className="text-2xl font-semibold mt-12 mb-4">1. Requirement Analysis and Problem Identification</h3>
            <p>
              The initial phase focused on identifying the growing challenges posed by deepfake technologies... Existing detection systems were analyzed to understand their limitations, particularly their dependence on black-box predictions and lack of transparency.
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Develop a web-based platform capable of analyzing image and video authenticity.</li>
              <li>Provide interpretable verification results rather than binary classifications.</li>
              <li>Ensure ethical and responsible AI usage through transparency and uncertainty communication.</li>
              <li>Design a scalable and lightweight architecture suitable for real-world deployment.</li>
            </ul>

            <h3 className="text-2xl font-semibold mt-12 mb-4">2. System Architecture Design</h3>
            <p>
              The platform was designed using a modular full-stack architecture consisting of three primary layers: Frontend (React), Backend (Django), and AI Detection Layer.
            </p>

            <h3 className="text-2xl font-semibold mt-12 mb-4">3. Dataset Collection and Preprocessing</h3>
            <p>Publicly available benchmark datasets were collected and preprocessed with augmentation techniques.</p>

            <h3 className="text-2xl font-semibold mt-12 mb-4">4. Deep Learning Model Development</h3>
            <p>CNNs were employed with transfer learning to detect facial blending inconsistencies, compression artifacts, and GAN patterns.</p>

            <h3 className="text-2xl font-semibold mt-12 mb-4">5. Explainability and Ethical AI Integration</h3>
            <p>Core focus on confidence visualization, model cards, bias disclosure, and clear communication of system limitations.</p>

            <h3 className="text-2xl font-semibold mt-12 mb-4">6–10. Backend Integration, Frontend UX, Testing, Deployment, and Research Extension</h3>
            <p className="mb-8">
              The system underwent rigorous testing and was designed for scalability. Following recognition at the Innovation World Cup – National Round 2026, future research directions include robustness improvement, bias evaluation, and multimodal detection.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}