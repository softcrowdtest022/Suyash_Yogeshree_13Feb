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

const DeleteCosting = ({ open, onClose, costing, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getPartInitials = (partNo) => {
    if (!partNo) return 'PN';
    return partNo.substring(0, 2).toUpperCase();
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
    if (!costing?._id) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${BASE_URL}/api/costings/${costing._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        onDelete(costing._id);
        onClose();
      } else {
        setError(response.data.message || 'Failed to delete costing');
      }
    } catch (err) {
      console.error('Error deleting costing:', err);
      setError(err.response?.data?.message || 'Failed to delete costing. Please try again.');
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
              {getPartInitials(costing?.PartNo)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {costing?.PartNo}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {costing?.ItemID?.PartName || 'Costing Entry'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Final Rate: {costing && formatCurrency(costing.FinalRate)}
              </Typography>
            </Box>
          </Stack>
          
          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>Raw Material Cost:</strong> {costing && formatCurrency(costing.RMCost)}
            </Typography>
            <Typography variant="body2">
              <strong>Process Cost:</strong> {costing && formatCurrency(costing.ProcessCost)}
            </Typography>
            <Typography variant="body2">
              <strong>Margin:</strong> {costing?.MarginPercentage}%
            </Typography>
            <Typography variant="body2">
              <strong>Status:</strong> {costing?.IsActive ? 'Active' : 'Inactive'}
            </Typography>
          </Stack>
        </Stack>
        
        <Typography variant="body1" sx={{ mb: 2, fontSize: '0.875rem' }}>
          Are you sure you want to delete this costing entry?
        </Typography>
        <Typography variant="body2" color="error" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
          ⚠️ This action cannot be undone. This costing record will be permanently deleted.
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
          {loading ? 'Deleting...' : 'Delete Costing'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteCosting;