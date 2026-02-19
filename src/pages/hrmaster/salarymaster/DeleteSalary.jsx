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

const DeleteSalary = ({ open, onClose, salary, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!salary?._id) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      const response = await axios.delete(
        `${BASE_URL}/api/salaries/${salary._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        onDelete(salary._id);
        onClose();
      } else {
        setError(response.data.message || 'Failed to delete salary');
      }
    } catch (err) {
      console.error('Error deleting salary:', err);
      setError(
        err.response?.data?.message ||
        'Failed to delete salary. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!salary) return null;

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
      {/* ===== HEADER ===== */}
      <DialogTitle
        sx={{
          borderBottom: '1px solid #E0E0E0',
          backgroundColor: '#FDEDED'
        }}
      >
        <div
          style={{
            fontSize: '20px',
            fontWeight: 600,
            paddingTop: '8px'
          }}
        >
          Confirm Delete Salary
        </div>
      </DialogTitle>

      {/* ===== CONTENT ===== */}
      <DialogContent sx={{ pt: 3 }}>
        <div style={{ marginTop: '16px' }}>
          <Stack spacing={2}>
            <Typography variant="body1">
              Are you sure you want to delete salary record for:
            </Typography>

            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Employee:</strong> {salary.employeeName}
              </Typography>

              <Typography variant="body2">
                <strong>Period:</strong> {salary.periodDisplay}
              </Typography>

              <Typography variant="body2">
                <strong>Net Pay:</strong> ₹ {salary.netPay?.toLocaleString('en-IN')}
              </Typography>

              <Chip
                label={salary.paymentStatus}
                size="small"
                color={salary.paymentStatus === 'PROCESSED' ? 'success' : 'warning'}
                sx={{ width: 'fit-content' }}
              />
            </Stack>

            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ mt: 1 }}
            >
              This action cannot be undone. The salary record will be permanently removed.
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{
                  borderRadius: 1,
                  '& .MuiAlert-icon': {
                    alignItems: 'center'
                  }
                }}
              >
                {error}
              </Alert>
            )}
          </Stack>
        </div>
      </DialogContent>

      {/* ===== ACTIONS ===== */}
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
          startIcon={!loading && <DeleteIcon />}
          sx={{
            borderRadius: 1,
            px: 3,
            textTransform: 'none',
            fontWeight: 500,
            backgroundColor: '#D32F2F',
            '&:hover': {
              backgroundColor: '#C62828'
            }
          }}
        >
          {loading ? 'Deleting...' : 'Delete Salary'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteSalary;