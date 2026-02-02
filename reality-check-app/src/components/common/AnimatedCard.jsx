import React from 'react';
import { motion } from 'framer-motion';
import './AnimatedCard.css';

const AnimatedCard = ({
  children,
  className = '',
  hoverEffect = 'triple',
  delay = 0,
  onClick,
  ...props
}) => {
  const getHoverClass = () => {
    switch (hoverEffect) {
      case 'triple':
        return 'card-hover-triple';
      case 'glass':
        return 'card-hover-glass';
      case 'float':
        return 'card-hover-float';
      default:
        return '';
    }
  };

  return (
    <motion.div
      className={`animated-card ${getHoverClass()} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3 }
      }}
      onClick={onClick}
      {...props}
    >
      <div className="card-content">
        {children}
      </div>
      <div className="card-glow" />
    </motion.div>
  );
};

export default AnimatedCard;