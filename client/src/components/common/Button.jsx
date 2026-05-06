import { forwardRef } from 'react';
import { Button as MuiButton } from '@mui/material';
import { motion } from 'framer-motion';

const Button = forwardRef(
  ({ children, loading, variant = 'contained', color = 'primary', startIcon, endIcon, disabled, sx, motion: enableMotion, ...props }, ref) => {
    const motionProps = enableMotion && !disabled
      ? {
          whileHover: { scale: 1.02 },
          whileTap: { scale: 0.98 },
          transition: { duration: 0.15 },
        }
      : {};

    return (
      <MuiButton
        ref={ref}
        variant={variant}
        color={color}
        startIcon={startIcon}
        endIcon={endIcon}
        disabled={disabled || loading}
        sx={sx}
        {...props}
      >
        {loading ? 'Loading...' : children}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;