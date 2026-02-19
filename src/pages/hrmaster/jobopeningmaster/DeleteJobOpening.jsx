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
  Work as WorkIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  DateRange as DateRangeIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const DeleteJobOpening = ({ open, onClose, job, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!job) return null;

  const getAvatarInitials = (title) => {
    if (!title) return 'JB';
    const words = title.split(' ');
    if (words.length >= 2) {
      return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
    }
    return title.substring(0, 2).toUpperCase();
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'published':
        return 'success';
      case 'draft':
        return 'default';
      case 'closed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleDelete = async () => {
    if (!job?._id) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${BASE_URL}/api/jobs/${job._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        onDelete(job._id);
        onClose();
      } else {
        setError(response.data.message || 'Failed to delete job opening');
      }
    } catch (err) {
      console.error('Error deleting job opening:', err);
      setError(err.response?.data?.message || 'Failed to delete job opening. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get platform counts
  const getPublishedPlatformsCount = () => {
    return job.publishTo?.filter(p => p.status === 'published').length || 0;
  };

  const getTotalApplications = () => {
    return job.applicationCount || job.totalApplications || 0;
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
            Delete Job Opening
          </Typography>
        </Stack>
      </DialogTitle>
     
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {/* Job Info Card */}
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Avatar sx={{
              width: 60,
              height: 60,
              bgcolor: '#D32F2F',
              fontSize: '1.25rem'
            }}>
              {getAvatarInitials(job.title)}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {job.title || 'Untitled Position'}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Job ID: {job.jobId || 'N/A'}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip
                  size="small"
                  label={job.status?.toUpperCase() || 'DRAFT'}
                  color={getStatusColor(job.status)}
                />
                {job.requisitionNumber && (
                  <Chip
                    size="small"
                    label={`Req: ${job.requisitionNumber}`}
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>
          </Stack>

          <Divider />

          {/* Job Details */}
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <BusinessIcon fontSize="small" color="action" />
              <Typography variant="body2" color="textSecondary" sx={{ minWidth: 100 }}>
                Department:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {job.department || 'N/A'}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <LocationIcon fontSize="small" color="action" />
              <Typography variant="body2" color="textSecondary" sx={{ minWidth: 100 }}>
                Location:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {job.location || 'N/A'}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <AssignmentIcon fontSize="small" color="action" />
              <Typography variant="body2" color="textSecondary" sx={{ minWidth: 100 }}>
                Employment Type:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {job.employmentType || 'N/A'}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <PeopleIcon fontSize="small" color="action" />
              <Typography variant="body2" color="textSecondary" sx={{ minWidth: 100 }}>
                Applications:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {getTotalApplications()}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <DateRangeIcon fontSize="small" color="action" />
              <Typography variant="body2" color="textSecondary" sx={{ minWidth: 100 }}>
                Created:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
            </Stack>

            {job.createdByName && (
              <Stack direction="row" spacing={2} alignItems="center">
                <PeopleIcon fontSize="small" color="action" />
                <Typography variant="body2" color="textSecondary" sx={{ minWidth: 100 }}>
                  Created By:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {job.createdByName}
                </Typography>
              </Stack>
            )}
          </Stack>

          {/* Publishing Info */}
          {job.publishTo && job.publishTo.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Publishing Status
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {job.publishTo.map((platform, idx) => (
                    <Chip
                      key={idx}
                      size="small"
                      label={`${platform.platform}: ${platform.status}`}
                      color={platform.status === 'published' ? 'success' : 
                             platform.status === 'pending' ? 'warning' : 
                             platform.status === 'failed' ? 'error' : 'default'}
                      variant="outlined"
                      sx={{ mb: 0.5 }}
                    />
                  ))}
                </Stack>
              </Box>
            </>
          )}

          <Divider />

          {/* Warning Messages */}
          <Box>
            <Typography variant="body1" sx={{ mb: 2, fontSize: '0.875rem' }}>
              Are you sure you want to delete this job opening?
            </Typography>
            
            <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={500}>
                ⚠️ This action cannot be undone. All job data will be permanently deleted.
              </Typography>
            </Alert>

            {/* Additional warnings based on job status and data */}
            {job.status === 'published' && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> This job is currently published and visible to candidates. 
                  Deleting it will remove it from all job boards immediately.
                </Typography>
              </Alert>
            )}

            {getPublishedPlatformsCount() > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> This job is published on {getPublishedPlatformsCount()} platform(s). 
                  It will be removed from all platforms upon deletion.
                </Typography>
              </Alert>
            )}

            {getTotalApplications() > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Warning:</strong> This job has {getTotalApplications()} application(s). 
                  Deleting it will also delete all associated applications.
                </Typography>
              </Alert>
            )}

            {job.requisitionId && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> This job is linked to requisition {job.requisitionNumber}. 
                  The requisition will not be affected.
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
          {loading ? 'Deleting...' : 'Delete Job Opening'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteJobOpening;