import { Box, Typography, Paper, IconButton, Snackbar, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState, createContext, useContext } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const hideToast = () => {
    setToast({ ...toast, open: false });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={hideToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={hideToast}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%' }}
          action={
            <IconButton size="small" onClick={hideToast}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

export const showSuccess = (message) => {
  const toast = window.__TOAST__;
  if (toast) toast.showToast(message, 'success');
};

export const showError = (message) => {
  const toast = window.__TOAST__;
  if (toast) toast.showToast(message, 'error');
};

export const showWarning = (message) => {
  const toast = window.__TOAST__;
  if (toast) toast.showToast(message, 'warning');
};

export const showInfo = (message) => {
  const toast = window.__TOAST__;
  if (toast) toast.showToast(message, 'info');
};