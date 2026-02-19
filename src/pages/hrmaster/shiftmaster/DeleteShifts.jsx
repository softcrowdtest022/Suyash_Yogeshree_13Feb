import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const DeleteShifts = ({ open, onClose, shift, onDelete }) => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {

    if (!shift?._id) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      const response = await axios.delete(
        `${BASE_URL}/api/shifts/${shift._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        onDelete(shift._id);
        onClose();
      } else {
        setError(response.data.message || 'Failed to delete shift');
      }

    } catch (err) {
      console.error('Delete shift error:', err);

      // 🔥 Important: Handle assigned shift case
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to delete shift. Please try again.');
      }

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
      <DialogTitle
        sx={{
          borderBottom: '1px solid #E0E0E0',
          pb: 2,
          backgroundColor: '#F8FAFC'
        }}
      >
        <div
          style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#101010',
            paddingTop: '8px'
          }}
        >
          Confirm Delete
        </div>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <div style={{ marginTop: '16px' }}>

          <Typography variant="body1" sx={{ mb: 2, fontSize: '0.875rem' }}>
            Are you sure you want to delete the shift
            <strong> "{shift?.ShiftName}"</strong>?
          </Typography>

          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
            This action cannot be undone. If this shift is assigned to employees,
            it cannot be deleted.
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

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          borderTop: '1px solid #E0E0E0',
          pt: 2,
          backgroundColor: '#F8FAFC'
        }}
      >
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
          {loading ? 'Deleting...' : 'Delete Shift'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteShifts;