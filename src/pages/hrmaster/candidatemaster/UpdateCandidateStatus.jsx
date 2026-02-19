import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Alert,
  Typography,
  Paper,
  Box,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Update as UpdateIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  History as HistoryIcon,
  Event as EventIcon,
  Comment as CommentIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const UpdateCandidateStatus = ({ open, onClose, onUpdate, candidateId, candidateData }) => {
  const [formData, setFormData] = useState({
    status: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [candidate, setCandidate] = useState(candidateData || null);
  const [statusHistory, setStatusHistory] = useState([]);

  // Status options based on workflow
  const statusOptions = [
    { value: 'new', label: 'New', color: '#1976D2', bg: '#E3F2FD', icon: <PendingIcon /> },
    { value: 'screening', label: 'Screening', color: '#7B1FA2', bg: '#F3E5F5', icon: <PersonIcon /> },
    { value: 'shortlisted', label: 'Shortlisted', color: '#2E7D32', bg: '#E8F5E8', icon: <ThumbUpIcon /> },
    { value: 'interview_scheduled', label: 'Interview Scheduled', color: '#F57C00', bg: '#FFF3E0', icon: <ScheduleIcon /> },
    { value: 'interviewed', label: 'Interviewed', color: '#0288D1', bg: '#E1F5FE', icon: <PersonIcon /> },
    { value: 'selected', label: 'Selected', color: '#2E7D32', bg: '#E8F5E8', icon: <CheckCircleIcon /> },
    { value: 'offered', label: 'Offered', color: '#558B2F', bg: '#F1F8E9', icon: <WorkIcon /> },
    { value: 'accepted', label: 'Accepted', color: '#1B5E20', bg: '#E8F5E8', icon: <CheckCircleIcon /> },
    { value: 'rejected', label: 'Rejected', color: '#C62828', bg: '#FFEBEE', icon: <ThumbDownIcon /> },
    { value: 'on_hold', label: 'On Hold', color: '#FF8F00', bg: '#FFF8E1', icon: <PendingIcon /> },
    { value: 'withdrawn', label: 'Withdrawn', color: '#616161', bg: '#EEEEEE', icon: <CancelIcon /> }
  ];

  // Fetch candidate details if not provided
  useEffect(() => {
    if (open && !candidateData && candidateId) {
      fetchCandidateDetails();
    } else if (candidateData) {
      setCandidate(candidateData);
      // Extract status history from candidate data or latestApplication
      if (candidateData.latestApplication?.statusHistory) {
        setStatusHistory(candidateData.latestApplication.statusHistory);
      }
    }
  }, [open, candidateData, candidateId]);

  // Fetch candidate details
  const fetchCandidateDetails = async () => {
    setFetchLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/candidates/${candidateId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setCandidate(response.data.data);
        // Extract status history from latestApplication if available
        if (response.data.data.latestApplication?.statusHistory) {
          setStatusHistory(response.data.data.latestApplication.statusHistory);
        }
      } else {
        setError(response.data.message || 'Failed to fetch candidate details');
      }
    } catch (err) {
      console.error('Error fetching candidate details:', err);
      setError(err.response?.data?.message || 'Failed to fetch candidate details');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.status) {
      setError('Please select a status');
      return false;
    }
    if (formData.status === candidate?.status) {
      setError('New status must be different from current status');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${BASE_URL}/api/candidates/${candidateId}/status`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess('Status updated successfully!');
        setTimeout(() => {
          onUpdate(response.data.data);
          resetForm();
          onClose();
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.response?.data?.message || 'Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      status: '',
      notes: ''
    });
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Get status style
  const getStatusStyle = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option || { color: '#616161', bg: '#EEEEEE', label: status, icon: <EventIcon /> };
  };

  // Format date
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentStatusStyle = candidate ? getStatusStyle(candidate.status) : null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #E0E0E0', 
        pb: 2,
        backgroundColor: '#F8FAFC',
        position: 'sticky',
        top: 0,
        zIndex: 1
      }}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#101010',
            paddingTop: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <UpdateIcon sx={{ color: '#1976D2' }} />
            Update Candidate Status
          </div>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {fetchLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} sx={{ color: '#1976D2' }} />
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Candidate Info Card */}
            {candidate && (
              <Paper elevation={0} sx={{ p: 2, backgroundColor: '#F9F9F9', borderRadius: 2 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        bgcolor: '#E3F2FD',
                        color: '#1976D2',
                        fontSize: '20px'
                      }}
                    >
                      {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#101010' }}>
                        {candidate.fullName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {candidate.candidateId}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon sx={{ fontSize: 18, color: '#9E9E9E' }} />
                        <Box>
                          <Typography variant="caption" color="textSecondary">Email</Typography>
                          <Typography variant="body2">{candidate.email}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: 18, color: '#9E9E9E' }} />
                        <Box>
                          <Typography variant="caption" color="textSecondary">Phone</Typography>
                          <Typography variant="body2">{candidate.phone}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Current Status */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">Current Status:</Typography>
                    {currentStatusStyle && (
                      <Chip
                        label={candidate.status}
                        size="small"
                        sx={{
                          backgroundColor: currentStatusStyle.bg,
                          color: currentStatusStyle.color,
                          fontWeight: 500
                        }}
                      />
                    )}
                  </Box>

                  {/* Job Application Info */}
                  {candidate.latestApplication?.jobId && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WorkIcon sx={{ fontSize: 18, color: '#9E9E9E' }} />
                      <Typography variant="body2">
                        Applied for: <strong>{candidate.latestApplication.jobId.title}</strong>
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>
            )}

            {/* Update Status Form */}
            <Paper elevation={0} sx={{ p: 2, backgroundColor: '#F9F9F9', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#101010', mb: 2 }}>
                Update Status
              </Typography>
              
              <Stack spacing={3}>
                {/* Status Selection */}
                <FormControl fullWidth required size="small">
                  <InputLabel>New Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="New Status"
                    disabled={loading}
                    sx={{
                      borderRadius: 1,
                      backgroundColor: 'white'
                    }}
                    renderValue={(selected) => {
                      const option = statusOptions.find(opt => opt.value === selected);
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {option?.icon}
                          <Typography>{option?.label}</Typography>
                        </Box>
                      );
                    }}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem 
                        key={option.value} 
                        value={option.value}
                        disabled={option.value === candidate?.status}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {option.icon}
                          <Box>
                            <Typography variant="body2">{option.label}</Typography>
                            {option.value === candidate?.status && (
                              <Typography variant="caption" color="textSecondary">
                                (Current Status)
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Notes */}
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  disabled={loading}
                  size="small"
                  variant="outlined"
                  placeholder="Add notes about this status change..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      backgroundColor: 'white'
                    }
                  }}
                />

                {/* Info Alert */}
                <Alert 
                  severity="info" 
                  icon={<HistoryIcon />}
                  sx={{ 
                    borderRadius: 1,
                    backgroundColor: '#E3F2FD',
                    '& .MuiAlert-icon': {
                      color: '#1976D2'
                    }
                  }}
                >
                  <Typography variant="body2">
                    Status change will be recorded in the candidate's history with timestamp and your name.
                  </Typography>
                </Alert>
              </Stack>
            </Paper>

            {/* Status History - Simple List View Instead of Timeline */}
            {statusHistory.length > 0 && (
              <Paper elevation={0} sx={{ p: 2, backgroundColor: '#F9F9F9', borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#101010', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryIcon sx={{ color: '#1976D2' }} />
                  Status History
                </Typography>
                
                <Stack spacing={2}>
                  {statusHistory.slice().reverse().map((history, index) => {
                    const statusStyle = getStatusStyle(history.status);
                    return (
                      <Paper
                        key={history._id || index}
                        elevation={0}
                        sx={{
                          p: 2,
                          backgroundColor: 'white',
                          borderRadius: 1,
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {statusStyle.icon}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {statusStyle.label}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {formatDateTime(history.changedAt)}
                              </Typography>
                            </Box>
                            {history.notes && (
                              <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                                <CommentIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                {history.notes}
                              </Typography>
                            )}
                            <Typography variant="caption" color="textSecondary">
                              By: {history.changedByName || 'System'}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    );
                  })}
                </Stack>
              </Paper>
            )}

            {/* Success/Error Messages */}
            {success && (
              <Alert 
                severity="success" 
                icon={<CheckCircleIcon />}
                sx={{ 
                  borderRadius: 1,
                  '& .MuiAlert-icon': {
                    alignItems: 'center'
                  }
                }}
              >
                {success}
              </Alert>
            )}
            
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
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        pb: 3, 
        borderTop: '1px solid #E0E0E0', 
        pt: 2,
        backgroundColor: '#F8FAFC',
        position: 'sticky',
        bottom: 0,
        zIndex: 1
      }}>
        <Button 
          onClick={handleClose} 
          disabled={loading || fetchLoading}
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
          onClick={handleSubmit}
          disabled={loading || fetchLoading || !formData.status}
          startIcon={loading ? null : <UpdateIcon />}
          sx={{
            borderRadius: 1,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500,
            backgroundColor: '#1976D2',
            '&:hover': {
              backgroundColor: '#1565C0'
            },
            '&.Mui-disabled': {
              backgroundColor: '#BBDEFB'
            }
          }}
        >
          {loading ? 'Updating...' : 'Update Status'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateCandidateStatus;