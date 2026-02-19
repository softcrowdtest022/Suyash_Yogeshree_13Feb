import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const SubmitRequisition = ({ 
  open, 
  onClose, 
  requisitionId, 
  requisitionData,
  onSubmitSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      // ✅ Using PUT method as per your backend
      const response = await axios.put(
        `${BASE_URL}/api/requisitions/${requisitionId}/submit`,
        {}, // Empty body for submit
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess('Requisition submitted successfully!');
        setTimeout(() => {
          onClose();
          if (onSubmitSuccess) onSubmitSuccess(response.data.data);
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to submit requisition');
      }
    } catch (err) {
      console.error('Error submitting requisition:', err);
      setError(err.response?.data?.message || 'Failed to submit requisition. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SendIcon sx={{ color: '#1976D2' }} />
          <Typography variant="h6">Submit Requisition</Typography>
          {requisitionData?.requisitionId && (
            <Chip 
              label={requisitionData.requisitionId} 
              size="small"
              sx={{ ml: 1, backgroundColor: '#E3F2FD', color: '#1976D2' }}
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
            <Typography variant="body2">
              Are you sure you want to submit this requisition for approval?
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
              Once submitted, it cannot be edited until reviewed by approvers.
            </Typography>
          </Alert>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          startIcon={<CloseIcon />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          sx={{
            backgroundColor: '#1976D2',
            '&:hover': { backgroundColor: '#1565C0' }
          }}
        >
          {loading ? 'Submitting...' : 'Submit Requisition'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubmitRequisition;