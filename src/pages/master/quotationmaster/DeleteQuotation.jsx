import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
  Chip,
  Stack
} from '@mui/material';
import { Delete as DeleteIcon, Warning as WarningIcon } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const DeleteQuotation = ({ open, onClose, quotation, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!quotation?._id) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${BASE_URL}/api/quotations/${quotation._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        onDelete(quotation._id);
        onClose();
      } else {
        setError(response.data.message || 'Failed to delete quotation');
      }
    } catch (err) {
      console.error('Error deleting quotation:', err);
      setError(err.response?.data?.message || 'Failed to delete quotation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
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
        backgroundColor: '#F8FAFC',
        pt: 3,
        px: 3
      }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <WarningIcon color="error" />
          <div style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#101010'
          }}>
            Confirm Delete
          </div>
        </Stack>
      </DialogTitle>
      
      <DialogContent sx={{ 
        pt: 4,
        px: 3,
        pb: 2
      }}>
        <div>
          <Alert 
            severity="warning" 
            icon={<WarningIcon />}
            sx={{ 
              borderRadius: 1,
              mb: 3,
              bgcolor: '#FFFBEB',
              border: '1px solid #FBBF24'
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              This action cannot be undone
            </Typography>
          </Alert>

          <Typography variant="body1" sx={{ mb: 2, fontSize: '0.875rem' }}>
            Are you sure you want to delete the quotation <strong>"{quotation?.QuotationNo}"</strong>?
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: '#F8FAFC', 
            borderRadius: 1,
            border: '1px solid #E0E0E0',
            mb: 2
          }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="textSecondary">Vendor:</Typography>
                <Typography variant="body2" fontWeight={500}>{quotation?.VendorName}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="textSecondary">Amount:</Typography>
                <Typography variant="body2" fontWeight={600} color="error.main">
                  {formatCurrency(quotation?.GrandTotal || 0)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="textSecondary">Status:</Typography>
                <Chip
                  label={quotation?.Status}
                  size="small"
                  sx={{
                    bgcolor: '#FEE2E2',
                    color: '#991B1B',
                    border: '1px solid #FCA5A5',
                    fontWeight: 500
                  }}
                />
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="textSecondary">Items:</Typography>
                <Typography variant="body2">{quotation?.Items?.length || 0} items</Typography>
              </Stack>
            </Stack>
          </Box>

          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
            This will permanently delete the quotation and all associated data including vendor details, 
            items list, and terms & conditions. Any linked purchase orders or documents may be affected.
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
          {loading ? 'Deleting...' : 'Delete Quotation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteQuotation;