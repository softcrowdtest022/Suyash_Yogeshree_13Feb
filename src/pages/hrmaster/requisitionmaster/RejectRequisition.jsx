import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Alert,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Paper,
  CircularProgress,
  TextField,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormHelperText,
  InputAdornment,
  Tooltip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Collapse
} from '@mui/material';
import {
  Close as CloseIcon,
  Cancel as CancelIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
  Work as WorkIcon,
  MonetizationOn as MonetizationIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Description as DescriptionIcon,
  ThumbDown as ThumbDownIcon,
  Comment as CommentIcon,
  Flag as FlagIcon,
   ExpandLess as ExpandLessIcon,  
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const RejectRequisition = ({ open, onClose, onReject, requisitionId }) => {
  const [requisition, setRequisition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('other');
  const [reasonError, setReasonError] = useState('');
  const [rejectSuccess, setRejectSuccess] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  const rejectionReasons = [
    { value: 'budget', label: 'Budget Constraints', icon: <MonetizationIcon /> },
    { value: 'duplicate', label: 'Duplicate Requisition', icon: <AssignmentIcon /> },
    { value: 'information', label: 'Insufficient Information', icon: <InfoIcon /> },
    { value: 'headcount', label: 'Headcount Freeze', icon: <PersonIcon /> },
    { value: 'policy', label: 'Policy Non-compliance', icon: <FlagIcon /> },
    { value: 'skills', label: 'Skills Not Required', icon: <SchoolIcon /> },
    { value: 'timing', label: 'Bad Timing', icon: <CalendarIcon /> },
    { value: 'other', label: 'Other Reason', icon: <CommentIcon /> }
  ];

  useEffect(() => {
    if (open && requisitionId) {
      fetchRequisitionDetails();
    }
  }, [open, requisitionId]);

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setReason('');
      setSelectedReason('other');
      setReasonError('');
      setRejectSuccess(false);
      setShowDetails(true);
    }
  }, [open]);

  const fetchRequisitionDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/requisitions/${requisitionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setRequisition(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch requisition details');
      }
    } catch (err) {
      console.error('Error fetching requisition:', err);
      setError(err.response?.data?.message || 'Failed to fetch requisition details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    // Validate reason
    if (!reason.trim()) {
      setReasonError('Rejection reason is required');
      return;
    }

    if (reason.trim().length < 10) {
      setReasonError('Please provide a detailed reason (at least 10 characters)');
      return;
    }

    setRejecting(true);
    setError('');
    setReasonError('');

    try {
      const token = localStorage.getItem('token');
      const submitData = {
        reason: reason.trim()
      };

      const response = await axios.post(`${BASE_URL}/api/requisitions/${requisitionId}/reject`, submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccess(response.data.message || 'Requisition rejected successfully');
        setRejectSuccess(true);
        
        // Call the onReject callback with the response data
        onReject(response.data.data);
        
        // Close dialog after short delay to show success message
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to reject requisition');
      }
    } catch (err) {
      console.error('Error rejecting requisition:', err);
      setError(err.response?.data?.message || 'Failed to reject requisition. Please try again.');
    } finally {
      setRejecting(false);
    }
  };

  const handleReasonChange = (event) => {
    setSelectedReason(event.target.value);
    // Pre-fill reason based on selected option
    const selected = rejectionReasons.find(r => r.value === event.target.value);
    if (selected && selected.value !== 'other') {
      setReason(`Rejected due to ${selected.label.toLowerCase()}. Please provide additional details if needed.`);
    } else {
      setReason('');
    }
    if (reasonError) setReasonError('');
  };

  const handleReasonTextChange = (e) => {
    setReason(e.target.value);
    if (reasonError) setReasonError('');
  };

  const handleClose = () => {
    setRequisition(null);
    setError('');
    setSuccess('');
    setRejectSuccess(false);
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#F44336',
      critical: '#9C27B0'
    };
    return colors[priority?.toLowerCase()] || '#757575';
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: { bg: '#FFF3E0', color: '#E65100' },
      pending_approval: { bg: '#FFF3E0', color: '#E65100' },
      approved: { bg: '#E8F5E9', color: '#2E7D32' },
      rejected: { bg: '#FFEBEE', color: '#C62828' },
      filled: { bg: '#E3F2FD', color: '#1565C0' },
      closed: { bg: '#F5F5F5', color: '#616161' }
    };
    return colors[status?.toLowerCase()] || { bg: '#F5F5F5', color: '#616161' };
  };

  const renderRequisitionSummary = () => (
    <Paper sx={{ 
      p: 2, 
      backgroundColor: '#F8FAFC', 
      borderRadius: 2,
      border: '1px solid #E0E0E0'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#101010', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon sx={{ color: '#1976D2', fontSize: 20 }} />
          Requisition Details
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={requisition.requisitionId}
            size="small"
            sx={{
              backgroundColor: '#E3F2FD',
              color: '#1976D2',
              fontWeight: 500
            }}
          />
          <Chip
            label={requisition.status?.toUpperCase() || 'DRAFT'}
            size="small"
            sx={{
              backgroundColor: getStatusColor(requisition.status).bg,
              color: getStatusColor(requisition.status).color,
              fontWeight: 500
            }}
          />
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <List dense disablePadding>
            <ListItem disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <BusinessIcon sx={{ color: '#666', fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography variant="caption" sx={{ color: '#666' }}>Department</Typography>}
                secondary={<Typography variant="body2" sx={{ color: '#101010', fontWeight: 500 }}>{requisition.department || 'N/A'}</Typography>}
              />
            </ListItem>
            <ListItem disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <LocationIcon sx={{ color: '#666', fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography variant="caption" sx={{ color: '#666' }}>Location</Typography>}
                secondary={<Typography variant="body2" sx={{ color: '#101010', fontWeight: 500 }}>{requisition.location || 'N/A'}</Typography>}
              />
            </ListItem>
            <ListItem disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <WorkIcon sx={{ color: '#666', fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography variant="caption" sx={{ color: '#666' }}>Position</Typography>}
                secondary={<Typography variant="body2" sx={{ color: '#101010', fontWeight: 500 }}>{requisition.positionTitle || 'N/A'}</Typography>}
              />
            </ListItem>
          </List>
        </Grid>
        <Grid item xs={12} sm={6}>
          <List dense disablePadding>
            <ListItem disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <PersonIcon sx={{ color: '#666', fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography variant="caption" sx={{ color: '#666' }}>Requested By</Typography>}
                secondary={<Typography variant="body2" sx={{ color: '#101010', fontWeight: 500 }}>{requisition.createdByName || 'N/A'}</Typography>}
              />
            </ListItem>
            <ListItem disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CalendarIcon sx={{ color: '#666', fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography variant="caption" sx={{ color: '#666' }}>Created Date</Typography>}
                secondary={<Typography variant="body2" sx={{ color: '#101010', fontWeight: 500 }}>{formatDate(requisition.createdAt)}</Typography>}
              />
            </ListItem>
          </List>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          label={`${requisition.noOfPositions || 0} Positions`}
          size="small"
          sx={{ backgroundColor: '#E3F2FD', color: '#1976D2' }}
        />
        <Chip
          label={requisition.employmentType || 'N/A'}
          size="small"
          sx={{ backgroundColor: '#F3E5F5', color: '#7B1FA2' }}
        />
        <Chip
          label={requisition.priority || 'MEDIUM'}
          size="small"
          sx={{
            backgroundColor: `${getPriorityColor(requisition.priority)}20`,
            color: getPriorityColor(requisition.priority),
            fontWeight: 500
          }}
        />
        <Chip
          label={`₹${requisition.budgetMin?.toLocaleString()} - ₹${requisition.budgetMax?.toLocaleString()}`}
          size="small"
          sx={{ backgroundColor: '#E0F2F1', color: '#00695C' }}
        />
      </Box>
    </Paper>
  );

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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ThumbDownIcon sx={{ color: '#C62828' }} />
          <div style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#101010',
            paddingTop: '8px'
          }}>
            Reject Requisition
          </div>
          {requisition && (
            <Chip
              label={requisition.requisitionId}
              size="small"
              sx={{
                ml: 1,
                backgroundColor: '#E3F2FD',
                color: '#1976D2',
                fontWeight: 500,
                fontSize: '12px'
              }}
            />
          )}
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#666' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#1976D2' }} />
          </Box>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 1,
              mt: 2,
              '& .MuiAlert-icon': {
                alignItems: 'center'
              }
            }}
          >
            {error}
          </Alert>
        ) : success ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Box sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              backgroundColor: '#FFEBEE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}>
              <CancelIcon sx={{ fontSize: 48, color: '#C62828' }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#101010', mb: 1 }}>
              Requisition Rejected
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
              {success}
            </Typography>
            <Paper sx={{ 
              p: 2, 
              backgroundColor: '#F8FAFC', 
              borderRadius: 2,
              border: '1px solid #E0E0E0',
              textAlign: 'left'
            }}>
              <Typography variant="subtitle2" sx={{ color: '#101010', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CommentIcon sx={{ color: '#C62828', fontSize: 18 }} />
                Rejection Reason
              </Typography>
              <Typography variant="body2" sx={{ color: '#333', fontStyle: 'italic', backgroundColor: '#FFF', p: 1.5, borderRadius: 1, border: '1px solid #E0E0E0' }}>
                "{reason}"
              </Typography>
            </Paper>
            <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 2 }}>
              Redirecting...
            </Typography>
          </Box>
        ) : requisition ? (
          <Stack spacing={3}>
            {/* Warning message */}
            <Alert 
              severity="warning"
              icon={<WarningIcon />}
              sx={{ 
                borderRadius: 1,
                backgroundColor: '#FFF3E0',
                '& .MuiAlert-icon': {
                  color: '#E65100'
                }
              }}
            >
              <Typography variant="body2">
                <strong>Important:</strong> Rejecting this requisition will stop the approval process. 
                The requester will be notified with your reason. This action cannot be undone.
              </Typography>
            </Alert>

            {/* Requisition Summary with Toggle */}
            <Box>
              <Box 
                onClick={() => setShowDetails(!showDetails)}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  mb: 1
                }}
              >
                <Typography variant="subtitle2" sx={{ color: '#666' }}>
                  {showDetails ? 'Hide' : 'Show'} Requisition Details
                </Typography>
                <IconButton size="small">
                  {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={showDetails}>
                {renderRequisitionSummary()}
              </Collapse>
            </Box>

            {/* Rejection Form */}
            <Paper sx={{ 
              p: 3, 
              borderRadius: 2,
              border: '1px solid #E0E0E0',
              backgroundColor: '#FFF'
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#101010', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CancelIcon sx={{ color: '#C62828' }} />
                Rejection Reason
              </Typography>

              <Stack spacing={3}>
                {/* Predefined Reasons */}
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ color: '#666', mb: 1 }}>
                    Select a reason category
                  </FormLabel>
                  <RadioGroup
                    value={selectedReason}
                    onChange={handleReasonChange}
                    sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}
                  >
                    {rejectionReasons.map((reason) => (
                      <FormControlLabel
                        key={reason.value}
                        value={reason.value}
                        control={<Radio sx={{ color: '#C62828', '&.Mui-checked': { color: '#C62828' } }} />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ color: '#C62828', display: 'flex', alignItems: 'center' }}>
                              {reason.icon}
                            </Box>
                            <Typography variant="body2">{reason.label}</Typography>
                          </Box>
                        }
                        sx={{
                          border: '1px solid #E0E0E0',
                          borderRadius: 2,
                          p: 1,
                          m: 0,
                          minWidth: 180,
                          '&:hover': {
                            backgroundColor: '#F5F5F5'
                          }
                        }}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>

                <Divider sx={{ my: 1 }} />

                {/* Detailed Reason */}
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
                    Detailed Rejection Reason <span style={{ color: '#F44336' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Please provide a detailed explanation for rejecting this requisition..."
                    value={reason}
                    onChange={handleReasonTextChange}
                    error={!!reasonError}
                    helperText={reasonError || 'Minimum 10 characters required'}
                    disabled={rejecting}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CommentIcon sx={{ color: '#999', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                      }
                    }}
                  />
                </Box>

                {/* Character count */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography variant="caption" sx={{ color: reason.length >= 10 ? '#4CAF50' : '#F44336' }}>
                    {reason.length} / 10 characters minimum
                  </Typography>
                </Box>

                {/* Impact Preview */}
                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: '#FFEBEE', 
                  borderRadius: 2,
                  border: '1px solid #EF5350'
                }}>
                  <Typography variant="subtitle2" sx={{ color: '#C62828', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ErrorIcon sx={{ fontSize: 18 }} />
                    Impact of Rejection
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#B71C1C' }}>
                    • Requester will be notified immediately
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#B71C1C' }}>
                    • Requisition status will change to "Rejected"
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#B71C1C' }}>
                    • Requester can create a new requisition with corrections
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#B71C1C' }}>
                    • All pending approvals will be cancelled
                  </Typography>
                </Paper>
              </Stack>
            </Paper>
          </Stack>
        ) : null}
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        pb: 3, 
        borderTop: '1px solid #E0E0E0', 
        pt: 2,
        backgroundColor: '#F8FAFC',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <Box>
          {requisition && requisition.status === 'pending_approval' && (
            <Tooltip title="This action cannot be undone">
              <InfoIcon sx={{ color: '#C62828', fontSize: 20, cursor: 'help' }} />
            </Tooltip>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            onClick={handleClose}
            disabled={rejecting || rejectSuccess}
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
            onClick={handleReject}
            disabled={
              loading || 
              rejecting || 
              rejectSuccess || 
              !reason.trim() ||
              reason.trim().length < 10
            }
            startIcon={rejecting ? <CircularProgress size={20} color="inherit" /> : <CancelIcon />}
            sx={{
              borderRadius: 1,
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 500,
              backgroundColor: '#C62828',
              '&:hover': {
                backgroundColor: '#B71C1C'
              },
              '&.Mui-disabled': {
                backgroundColor: '#E0E0E0'
              }
            }}
          >
            {rejecting ? 'Rejecting...' : 'Reject Requisition'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default RejectRequisition;