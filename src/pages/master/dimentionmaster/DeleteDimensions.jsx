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

const DeleteDimensions = ({ open, onClose, dimension, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getPartInitials = (partNo) => {
    if (!partNo) return 'PN';
    return partNo.substring(0, 2).toUpperCase();
  };

  const handleDelete = async () => {
    if (!dimension?._id) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${BASE_URL}/api/dimension-weights/${dimension._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        onDelete(dimension._id);
        onClose();
      } else {
        setError(response.data.message || 'Failed to delete dimension');
      }
    } catch (err) {
      console.error('Error deleting dimension:', err);
      setError(err.response?.data?.message || 'Failed to delete dimension. Please try again.');
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
          Confirm Delete
        </div>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ 
              width: 60, 
              height: 60, 
              bgcolor: '#4F46E5',
              fontSize: '1.25rem'
            }}>
              {getPartInitials(dimension?.PartNo)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {dimension?.PartNo}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {dimension?.Item?.PartName || 'Dimension Weight Entry'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Weight: {dimension?.WeightInKG} kg
              </Typography>
            </Box>
          </Stack>
          
          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>Dimensions:</strong> {dimension?.Thickness}mm × {dimension?.Width}mm × {dimension?.Length}mm
            </Typography>
            <Typography variant="body2">
              <strong>Density:</strong> {dimension?.Density} g/cm³
            </Typography>
            {dimension?.Item && (
              <Typography variant="body2">
                <strong>Item:</strong> {dimension.Item.PartName}
              </Typography>
            )}
          </Stack>
        </Stack>
        
        <Typography variant="body1" sx={{ mb: 2, fontSize: '0.875rem' }}>
          Are you sure you want to delete this dimension weight entry?
        </Typography>
        <Typography variant="body2" color="error" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
          ⚠️ This action cannot be undone. This dimension weight record will be permanently deleted.
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
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        pb: 3, 
        borderTop: '1px solid #E0E0E0', 
        pt: 2,
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
          {loading ? 'Deleting...' : 'Delete Dimension'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDimensions;