import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Avatar,
  Stack,
  Box,
  Chip,
  Divider
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const DeleteRequisition = ({ open, onClose, requisition, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!requisition) return null;

  const getAvatarInitials = (title) => {
    if (!title) return 'REQ';
    const words = title.split(' ');
    if (words.length >= 2) {
      return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
    }
    return title.substring(0, 2).toUpperCase();
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
      case 'in_progress':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleDelete = async () => {
    if (!requisition?._id) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${BASE_URL}/api/requisitions/${requisition._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        onDelete(requisition._id);
        onClose();
      } else {
        setError(response.data.message || 'Failed to delete requisition');
      }
    } catch (err) {
      console.error('Error deleting requisition:', err);
      setError(err.response?.data?.message || 'Failed to delete requisition. Please try again.');
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
        <Stack direction="row" alignItems="center" spacing={1}>
          <WarningIcon color="error" />
          <Typography variant="h6" fontWeight={600} color="#101010">
            Delete Requisition
          </Typography>
        </Stack>
      </DialogTitle>
     
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {/* Requisition Info Card */}
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Avatar sx={{
              width: 60,
              height: 60,
              bgcolor: '#D32F2F',
              fontSize: '1.25rem'
            }}>
              {getAvatarInitials(requisition?.positionTitle || requisition?.jobTitle)}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {requisition?.positionTitle || requisition?.jobTitle}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Requisition ID: {requisition?.requisitionId || requisition?.requisitionNumber}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip
                  size="small"
                  label={requisition?.status || 'Draft'}
                  color={getStatusColor(requisition?.status)}
                />
                {requisition?.priority && (
                  <Chip
                    size="small"
                    label={requisition?.priority}
                    color={requisition?.priority === 'High' ? 'error' : 'default'}
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>
          </Stack>

          <Divider />

          {/* Requisition Details */}
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <BusinessIcon fontSize="small" color="action" />
              <Typography variant="body2" color="textSecondary" sx={{ minWidth: 100 }}>
                Department:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {requisition?.department || requisition?.DepartmentName || 'N/A'}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <LocationIcon fontSize="small" color="action" />
              <Typography variant="body2" color="textSecondary" sx={{ minWidth: 100 }}>
                Location:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {requisition?.location || 'N/A'}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <PeopleIcon fontSize="small" color="action" />
              <Typography variant="body2" color="textSecondary" sx={{ minWidth: 100 }}>
                Positions:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {requisition?.noOfPositions || requisition?.numberOfPositions || 0}
              </Typography>
            </Stack>

            {requisition?.hiredPositions > 0 && (
              <Stack direction="row" spacing={2} alignItems="center">
                <PeopleIcon fontSize="small" color="success" />
                <Typography variant="body2" color="textSecondary" sx={{ minWidth: 100 }}>
                  Hired:
                </Typography>
                <Typography variant="body2" fontWeight={500} color="success.main">
                  {requisition?.hiredPositions}
                </Typography>
              </Stack>
            )}

            <Stack direction="row" spacing={2} alignItems="center">
              <DateRangeIcon fontSize="small" color="action" />
              <Typography variant="body2" color="textSecondary" sx={{ minWidth: 100 }}>
                Created:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {requisition?.createdAt ? new Date(requisition.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
            </Stack>
          </Stack>

          <Divider />

          {/* Warning Messages */}
          <Box>
            <Typography variant="body1" sx={{ mb: 2, fontSize: '0.875rem' }}>
              Are you sure you want to delete this requisition?
            </Typography>
            
            <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={500}>
                ⚠️ This action cannot be undone. All requisition data will be permanently deleted.
              </Typography>
            </Alert>

            {/* Additional warnings based on requisition status */}
            {requisition?.status === 'approved' && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> This requisition is already approved. Deleting it may affect related job postings and hiring plans.
                </Typography>
              </Alert>
            )}

            {requisition?.hiredPositions > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> This requisition has {requisition.hiredPositions} hired position(s). Deleting it will remove these records.
                </Typography>
              </Alert>
            )}

            {requisition?.jobPostings?.length > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> This requisition is linked to {requisition.jobPostings.length} job posting(s). They will also be affected.
                </Typography>
              </Alert>
            )}
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mt: 2,
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
            },
            '&.Mui-disabled': {
              backgroundColor: '#ffcdd2'
            }
          }}
        >
          {loading ? 'Deleting...' : 'Delete Requisition'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteRequisition;