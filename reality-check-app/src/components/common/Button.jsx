import React from 'react';
import { motion } from 'framer-motion';
import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  fullWidth = false,
  isLoading = false,
  icon = null,
  ...props
}) => {
  const getVariantClass = () => {
    if (variant.includes('triple')) return 'triple-gradient';
    return variant;
  };

  const buttonClasses = `
    btn
    btn-${getVariantClass()}
    btn-${size}
    ${fullWidth ? 'btn-full' : ''}
    ${isLoading ? 'btn-loading' : ''}
    ${className}
  `.trim();

  const buttonContent = (
    <>
      {icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-content">{children}</span>
      {variant.includes('arrow') && (
        <span className="btn-arrow">→</span>
      )}
    </>
  );

  return (
    <motion.button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      {...props}
    >
      {buttonContent}
      {isLoading && <div className="btn-spinner" />}
    </motion.button>
  );
};

export default Button;