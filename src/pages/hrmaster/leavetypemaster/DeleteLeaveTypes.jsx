import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Stack,
  Chip
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const DeleteLeaveTypes = ({ open, onClose, leaveType, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!leaveType?._id) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${BASE_URL}/api/leavetypes/${leaveType._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        if (onDelete && typeof onDelete === 'function') {
          onDelete(leaveType._id);
        }
        onClose(true); // Pass true to indicate success
      } else {
        setError(response.data.message || 'Failed to delete leave type');
      }
    } catch (err) {
      console.error('Error deleting leave type:', err);
      
      if (err.response) {
        setError(err.response.data?.message || 
                err.response.data?.error || 
                `Server error: ${err.response.status}`);
      } else if (err.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('Error setting up request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose(false); // Pass false when cancelled
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #E0E0E0', 
        pb: 2,
        backgroundColor: '#F8FAFC'
      }}>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#101010',
          paddingTop: '8px'
        }}>
          Confirm Delete Leave Type
        </div>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {/* Add padding from top */}
        <div style={{ marginTop: '16px' }}>
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} color="error.main">
              {leaveType?.Name}
            </Typography>
            
            <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
              <Chip
                label={`${leaveType?.MaxDaysPerYear || 0} days/year`}
                sx={{ 
                  fontWeight: 500,
                  backgroundColor: '#E3F2FD',
                  color: '#1565C0'
                }}
              />
              
              <Chip
                label={leaveType?.IsActive ? 'Active' : 'Inactive'}
                color={leaveType?.IsActive ? 'success' : 'default'}
                sx={{ 
                  fontWeight: 500,
                  '&.MuiChip-colorSuccess': {
                    bgcolor: '#E8F5E9',
                    color: '#2E7D32'
                  },
                  '&.MuiChip-colorDefault': {
                    bgcolor: '#F5F5F5',
                    color: '#616161'
                  }
                }}
              />
            </Stack>
            
            {leaveType?.Description && (
              <Typography variant="body2" color="text.secondary">
                <strong>Description:</strong> {leaveType.Description}
              </Typography>
            )}
          </Stack>
          
          <Typography variant="body1" sx={{ mb: 2, fontSize: '0.875rem' }}>
            Are you sure you want to delete this leave type?
          </Typography>
          
          <Typography variant="body2" color="error" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
            ⚠️ This action cannot be undone. All leave records associated with this type will be affected.
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 3,
                borderRadius: 1,
                '& .MuiAlert-icon': {
                  alignItems: 'center'
                }
              }}
            >
              {error}
            </Alert>
          )}
        </div>
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        pb: 3, 
        borderTop: '1px solid #E0E0E0', 
        pt: 2,
        backgroundColor: '#F8FAFC'
      }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          sx={{
            borderRadius: 1,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          disabled={loading}
          startIcon={loading ? null : <DeleteIcon />}
          sx={{
            borderRadius: 1,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500,
            backgroundColor: '#D32F2F',
            '&:hover': {
              backgroundColor: '#C62828'
            }
          }}
        >
          {loading ? 'Deleting...' : 'Delete Leave Type'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteLeaveTypes;