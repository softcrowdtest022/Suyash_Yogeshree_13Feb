import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  MenuItem,
  Grid,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Avatar,
  TextField,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Cancel as CancelIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Comment as CommentIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../../config/Config';

// Color constants
const PRIMARY_BLUE = '#00B4D8';
const PENDING_COLOR = '#ED6C02';
const IN_PROGRESS_COLOR = '#0288D1';
const COMPLETED_COLOR = '#2E7D32';
const HOLD_COLOR = '#F57C00';
const CANCELLED_COLOR = '#D32F2F';

// Status options with colors and icons
const STATUS_OPTIONS = [
  { 
    value: 'PENDING', 
    label: 'Pending', 
    icon: <ScheduleIcon />, 
    color: PENDING_COLOR,
    bgColor: '#fef3c7',
    textColor: '#92400e'
  },
  { 
    value: 'IN_PROGRESS', 
    label: 'In Progress', 
    icon: <EventIcon />, 
    color: IN_PROGRESS_COLOR,
    bgColor: '#e3f2fd',
    textColor: '#1976d2'
  },
  { 
    value: 'COMPLETED', 
    label: 'Completed', 
    icon: <CheckCircleIcon />, 
    color: COMPLETED_COLOR,
    bgColor: '#d1fae5',
    textColor: '#065f46'
  },
  { 
    value: 'HOLD', 
    label: 'On Hold', 
    icon: <PauseIcon />, 
    color: HOLD_COLOR,
    bgColor: '#fff3e0',
    textColor: '#f57c00'
  },
  { 
    value: 'CANCELLED', 
    label: 'Cancelled', 
    icon: <CancelIcon />, 
    color: CANCELLED_COLOR,
    bgColor: '#fee2e2',
    textColor: '#991b1b'
  }
];

// Get status style helper
const getStatusStyle = (status) => {
  const option = STATUS_OPTIONS.find(opt => opt.value === status);
  return option || STATUS_OPTIONS[0];
};

const UpdateOnboardingStatus = ({ open, onClose, onSubmit, onboardingData, employeeId, currentStatus }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  
  // Data states
  const [onboardingDetails, setOnboardingDetails] = useState(onboardingData || null);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || '');
  const [notes, setNotes] = useState('');
  const [updateResult, setUpdateResult] = useState(null);
  
  // Error/Success state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch onboarding details on open if not provided
  useEffect(() => {
    if (open && !onboardingData && employeeId) {
      fetchOnboardingDetails();
    } else if (onboardingData) {
      setOnboardingDetails(onboardingData);
      setSelectedStatus(onboardingData.status || currentStatus || '');
    }
  }, [open, onboardingData, employeeId, currentStatus]);

  // Fetch onboarding details from API
  const fetchOnboardingDetails = async () => {
    setFetchingDetails(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/onboarding/${employeeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setOnboardingDetails(response.data.data);
        setSelectedStatus(response.data.data.status || '');
      } else {
        setError('Failed to fetch onboarding details');
      }
    } catch (err) {
      console.error('Error fetching onboarding details:', err);
      setError(err.response?.data?.message || 'Failed to fetch onboarding details');
    } finally {
      setFetchingDetails(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    setSelectedStatus(currentStatus || onboardingDetails?.status || '');
    setNotes('');
    setUpdateResult(null);
    setError('');
    setSuccess('');
  };

  // Handle close
  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Handle update status
  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      setError('Please select a status');
      return;
    }

    if (selectedStatus === onboardingDetails?.status) {
      setError('New status must be different from current status');
      return;
    }

    if (!notes.trim()) {
      setError('Please add notes to justify the status change');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const employeeIdentifier = employeeId || onboardingDetails?.employee?.id;
      
      if (!employeeIdentifier) {
        setError('Employee ID not found');
        setSubmitting(false);
        return;
      }

      const response = await axios.put(
        `${BASE_URL}/api/onboarding/update-status/${employeeIdentifier}`,
        {
          status: selectedStatus,
          notes: notes.trim()
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setUpdateResult(response.data.data);
        setSuccess(response.data.message || 'Onboarding status updated successfully!');
        
        if (onSubmit) {
          onSubmit(response.data.data);
        }
      }
    } catch (err) {
      console.error('Error updating onboarding status:', err);
      setError(err.response?.data?.message || 'Failed to update onboarding status');
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentStatusStyle = onboardingDetails ? getStatusStyle(onboardingDetails.status) : null;
  const selectedStatusStyle = getStatusStyle(selectedStatus);

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
        borderBottom: 1, 
        borderColor: '#E0E0E0', 
        bgcolor: '#F8FAFC',
        px: 3,
        py: 2,
        position: 'sticky',
        top: 0,
        zIndex: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UpdateIcon sx={{ color: PRIMARY_BLUE }} />
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Update Onboarding Status
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Change status and add comments
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, px: 3 }}>
        {fetchingDetails ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} sx={{ color: PRIMARY_BLUE }} />
          </Box>
        ) : error && !updateResult ? (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        ) : onboardingDetails || updateResult ? (
          <Stack spacing={3}>
            {/* Current Status Card */}
            {(onboardingDetails || updateResult) && (
              <Paper sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Current Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Chip
                    icon={updateResult ? getStatusStyle(updateResult.oldStatus).icon : currentStatusStyle?.icon}
                    label={updateResult ? updateResult.oldStatus : currentStatusStyle?.label}
                    sx={{
                      bgcolor: updateResult ? getStatusStyle(updateResult.oldStatus).bgColor : currentStatusStyle?.bgColor,
                      color: updateResult ? getStatusStyle(updateResult.oldStatus).textColor : currentStatusStyle?.textColor,
                      fontWeight: 500,
                      px: 1
                    }}
                  />
                  {updateResult && (
                    <>
                      <Typography variant="body2">→</Typography>
                      <Chip
                        icon={getStatusStyle(updateResult.newStatus).icon}
                        label={updateResult.newStatus}
                        sx={{
                          bgcolor: getStatusStyle(updateResult.newStatus).bgColor,
                          color: getStatusStyle(updateResult.newStatus).textColor,
                          fontWeight: 500,
                          px: 1
                        }}
                      />
                    </>
                  )}
                </Box>
              </Paper>
            )}

            {/* Employee Info Card */}
            {(onboardingDetails || updateResult) && (
              <Paper sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Employee Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: PRIMARY_BLUE }}>
                    {updateResult?.employeeName?.charAt(0) || onboardingDetails?.employee?.name?.charAt(0) || 'E'}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {updateResult?.employeeName || onboardingDetails?.employee?.name || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Employee ID: {updateResult?.employeeId || onboardingDetails?.employee?.id || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Status Update Form */}
            {!updateResult ? (
              <>
                {/* Status Selection */}
                <FormControl fullWidth size="small">
                  <InputLabel>Select New Status</InputLabel>
                  <Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    label="Select New Status"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusStyle(selected).icon}
                        <Typography>{getStatusStyle(selected).label}</Typography>
                      </Box>
                    )}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem 
                        key={option.value} 
                        value={option.value}
                        disabled={option.value === onboardingDetails?.status}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ color: option.color }}>{option.icon}</Box>
                          <Box>
                            <Typography variant="body2">{option.label}</Typography>
                            {option.value === onboardingDetails?.status && (
                              <Typography variant="caption" color="textSecondary">
                                (Current status)
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Notes Field */}
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Notes / Comments"
                  placeholder="Please provide justification for this status change..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <CommentIcon sx={{ mr: 1, color: '#64748B', fontSize: 20, alignSelf: 'flex-start', mt: 1 }} />
                    ),
                  }}
                />

                {/* Info Alert */}
                <Alert severity="info" icon={<InfoIcon />} sx={{ borderRadius: 2 }}>
                  <Typography variant="body2">
                    Changing the status will update the onboarding progress. Please add appropriate notes to document the reason for this change.
                  </Typography>
                </Alert>
              </>
            ) : (
              /* Update Result Card */
              <Card sx={{ border: '1px solid', borderColor: 'success.main' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: COMPLETED_COLOR }}>
                      <CheckCircleIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" color="success.main">
                        Status Updated Successfully!
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {updateResult.message || 'Onboarding status has been updated'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary">Employee</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {updateResult.employeeName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Employee ID</Typography>
                      <Typography variant="body2">{updateResult.employeeId}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Onboarding ID</Typography>
                      <Typography variant="body2">{updateResult.onboardingId}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary">Status Change</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip
                          icon={getStatusStyle(updateResult.oldStatus).icon}
                          label={updateResult.oldStatus}
                          size="small"
                          sx={{
                            bgcolor: getStatusStyle(updateResult.oldStatus).bgColor,
                            color: getStatusStyle(updateResult.oldStatus).textColor,
                            height: 24
                          }}
                        />
                        <Typography variant="body2">→</Typography>
                        <Chip
                          icon={getStatusStyle(updateResult.newStatus).icon}
                          label={updateResult.newStatus}
                          size="small"
                          sx={{
                            bgcolor: getStatusStyle(updateResult.newStatus).bgColor,
                            color: getStatusStyle(updateResult.newStatus).textColor,
                            height: 24
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary">Notes</Typography>
                      <Paper sx={{ p: 1.5, bgcolor: '#F8FAFC', mt: 0.5 }}>
                        <Typography variant="body2">{updateResult.notes}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary">Updated At</Typography>
                      <Typography variant="body2">{formatDateTime(updateResult.updatedAt)}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Success Message */}
            {success && !updateResult && (
              <Alert severity="success" icon={<CheckCircleIcon />} onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}
          </Stack>
        ) : (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No onboarding details found
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        px: 3, 
        py: 2, 
        borderTop: 1, 
        borderColor: '#E0E0E0', 
        bgcolor: '#F8FAFC',
        justifyContent: 'space-between',
        position: 'sticky',
        bottom: 0,
        zIndex: 2
      }}>
        <Button onClick={handleClose}>
          {updateResult ? 'Close' : 'Cancel'}
        </Button>
        {!updateResult && (
          <Button
            variant="contained"
            onClick={handleUpdateStatus}
            disabled={submitting || !selectedStatus || selectedStatus === onboardingDetails?.status || !notes.trim()}
            startIcon={submitting ? <CircularProgress size={20} /> : <UpdateIcon />}
            sx={{
              background: 'linear-gradient(135deg, #164e63, #00B4D8)',
              minWidth: 150,
              '&:hover': {
                background: 'linear-gradient(135deg, #0e3b4a, #0096b4)'
              }
            }}
          >
            {submitting ? 'Updating...' : 'Update Status'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UpdateOnboardingStatus;