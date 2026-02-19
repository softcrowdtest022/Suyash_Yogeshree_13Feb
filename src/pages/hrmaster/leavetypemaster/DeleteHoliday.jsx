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

const DeleteHoliday = ({ open, onClose, holiday, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!holiday?._id) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      const response = await axios.delete(
        `${BASE_URL}/api/holidays/${holiday._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        if (onDelete && typeof onDelete === 'function') {
          onDelete(holiday._id);
        }
        onClose(true); // Pass true to indicate success
      } else {
        setError(response.data.message || 'Failed to delete holiday');
      }
    } catch (err) {
      console.error('Error deleting holiday:', err);
      
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
          Confirm Delete Holiday
        </div>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <div style={{ marginTop: '16px' }}>
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} color="error.main">
              {holiday?.Name}
            </Typography>

            <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
              <Chip
                label={holiday?.Date
                  ? new Date(holiday.Date).toLocaleDateString()
                  : 'No date'}
                sx={{
                  fontWeight: 500,
                  backgroundColor: '#E3F2FD',
                  color: '#1565C0'
                }}
              />

              <Chip
                label={holiday?.Type || 'Not specified'}
                sx={{
                  fontWeight: 500,
                  backgroundColor: '#FFF3E0',
                  color: '#E65100'
                }}
              />

              <Chip
                label={holiday?.IsActive ? 'Active' : 'Inactive'}
                color={holiday?.IsActive ? 'success' : 'default'}
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

            {holiday?.IsRecurring && (
              <Chip
                label="Recurring Every Year"
                size="small"
                sx={{
                  fontWeight: 500,
                  backgroundColor: '#E8EAF6',
                  color: '#3F51B5',
                  width: 'fit-content'
                }}
              />
            )}

            {holiday?.Description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <strong>Description:</strong> {holiday.Description}
              </Typography>
            )}

            {holiday?.Year && (
              <Typography variant="body2" color="text.secondary">
                <strong>Year:</strong> {holiday.Year}
              </Typography>
            )}
          </Stack>

          <Typography
            variant="body1"
            sx={{ mb: 2, fontSize: '0.875rem' }}
          >
            Are you sure you want to delete this holiday?
          </Typography>

          <Typography
            variant="body2"
            color="error"
            sx={{ fontSize: '0.875rem', fontWeight: 500 }}
          >
            ⚠️ This action cannot be undone. All associated data will be permanently removed.
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mt: 3,
                borderRadius: 1
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
          {loading ? 'Deleting...' : 'Delete Holiday'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteHoliday;