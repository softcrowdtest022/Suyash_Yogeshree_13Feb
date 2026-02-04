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
  Avatar,
  Box
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const DeleteProcess = ({ open, onClose, process, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getProcessInitials = (processName) => {
    if (!processName) return 'P';
    
    const words = processName.split(' ');
    if (words.length >= 2) {
      return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
    }
    
    return processName.substring(0, 2).toUpperCase();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleDelete = async () => {
    if (!process?._id) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${BASE_URL}/api/processes/${process._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        onDelete(process._id);
        onClose();
      } else {
        setError(response.data.message || 'Failed to delete process');
      }
    } catch (err) {
      console.error('Error deleting process:', err);
      setError(err.response?.data?.message || 'Failed to delete process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          overflow: 'visible'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #E0E0E0', 
        pb: 2,
        backgroundColor: '#F8FAFC',
        pt: 3,
        px: 3
      }}>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#101010'
        }}>
          Confirm Delete
        </div>
      </DialogTitle>
      
      <DialogContent sx={{ 
        pt: 4,
        px: 3,
        pb: 2
      }}>
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ 
              width: 60, 
              height: 60, 
              bgcolor: '#4F46E5',
              fontSize: '1.25rem'
            }}>
              {getProcessInitials(process?.ProcessName)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {process?.ProcessName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Rate: {process && formatCurrency(process.Rate)} / {process?.RateType.toLowerCase().replace('per ', '')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Type: {process?.VendorOrInhouse}
              </Typography>
            </Box>
          </Stack>
          
          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>Rate Type:</strong> {process?.RateType}
            </Typography>
            <Typography variant="body2">
              <strong>Vendor/Inhouse:</strong> {process?.VendorOrInhouse}
            </Typography>
            <Typography variant="body2">
              <strong>Status:</strong> {process?.IsActive ? 'Active' : 'Inactive'}
            </Typography>
            {process?.Description && (
              <Typography variant="body2">
                <strong>Description:</strong> {process.Description}
              </Typography>
            )}
          </Stack>
        </Stack>
        
        <Typography variant="body1" sx={{ mb: 2, fontSize: '0.875rem' }}>
          Are you sure you want to delete this process?
        </Typography>
        <Typography variant="body2" color="error" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
          ⚠️ This action cannot be undone. This process record will be permanently deleted.
        </Typography>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 1,
              mt: 3,
              '& .MuiAlert-icon': {
                alignItems: 'center'
              }
            }}
          >
            {error}
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        pb: 3, 
        pt: 2,
        borderTop: '1px solid #E0E0E0',
        backgroundColor: '#F8FAFC'
      }}>
        <Button 
          onClick={onClose} 
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
          {loading ? 'Deleting...' : 'Delete Process'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteProcess;