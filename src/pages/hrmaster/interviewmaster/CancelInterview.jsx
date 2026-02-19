import React, { useState, useEffect } from 'react';
import {
  // Layout components
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  Grid,
  
  // Form components
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  
  // Feedback components
  Alert,
  CircularProgress,
  
  // Data display
  Typography,
  Chip,
  Divider,
  Avatar,
  
  // Buttons and actions
  Button,
  
  // Navigation
  styled,
  
  // Utils
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AlertTitle,
  
} from '@mui/material';
import { 
  Close as CloseIcon, 
  NavigateNext as NavigateNextIcon, 
  NavigateBefore as NavigateBeforeIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  EventBusy as EventBusyIcon,
  Person as PersonIcon,
  VideoCall as VideoCallIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

// 🔥 Modern Stepper Connector with Gradient
const ColorConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient(135deg, #d32f2f 0%, #f44336 50%, #b71c1c 100%)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient(135deg, #d32f2f 0%, #f44336 50%, #b71c1c 100%)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#eaeaf0',
    borderRadius: 1,
  },
}));

const CancelInterview = ({ open, onClose, onCancel, interviewData }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    reason: '',
    additionalNotes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [confirmText, setConfirmText] = useState('');

  // Predefined cancellation reasons
  const cancellationReasons = [
    { value: 'position_filled', label: 'Position Filled by Another Candidate' },
    { value: 'candidate_unavailable', label: 'Candidate Unavailable' },
    { value: 'interviewer_unavailable', label: 'Interviewer Unavailable' },
    { value: 'position_on_hold', label: 'Position Put on Hold' },
    { value: 'position_cancelled', label: 'Position Cancelled' },
    { value: 'budget_issues', label: 'Budget Constraints' },
    { value: 'internal_restructuring', label: 'Internal Restructuring' },
    { value: 'candidate_withdrew', label: 'Candidate Withdrew Application' },
    { value: 'no_show', label: 'Candidate No-Show' },
    { value: 'technical_issues', label: 'Technical Issues' },
    { value: 'other', label: 'Other Reason' }
  ];

  // Steps definition
  const steps = ['Review Interview', 'Cancellation Reason', 'Confirm Cancellation'];

  // Interview types icons
  const getInterviewTypeIcon = (type) => {
    switch(type) {
      case 'video': return <VideoCallIcon fontSize="small" />;
      case 'phone': return <ScheduleIcon fontSize="small" />;
      case 'in-person': return <LocationIcon fontSize="small" />;
      default: return <ScheduleIcon fontSize="small" />;
    }
  };

  const getInterviewTypeLabel = (type) => {
    switch(type) {
      case 'video': return 'Video Call';
      case 'phone': return 'Phone Call';
      case 'in-person': return 'In Person';
      default: return type;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      if (!formData.reason) {
        errors.reason = 'Please select a cancellation reason';
      }

      if (formData.reason === 'other' && !formData.additionalNotes?.trim()) {
        errors.additionalNotes = 'Please provide details for "Other" reason';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateConfirmation = () => {
    const errors = {};
    
    if (confirmText !== 'CANCEL') {
      errors.confirm = 'Please type CANCEL to confirm';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      setActiveStep(1);
      setError('');
    } else if (activeStep === 1) {
      if (validateStep(1)) {
        setActiveStep(2);
        setError('');
      } else {
        setError('Please select a cancellation reason');
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
    setFieldErrors({});
  };

  const handleSubmit = async () => {
    if (!validateConfirmation()) {
      setError('Please type CANCEL to confirm');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      // Prepare data according to API expectations
      const submitData = {
        reason: formData.reason === 'other' 
          ? `Other: ${formData.additionalNotes}` 
          : cancellationReasons.find(r => r.value === formData.reason)?.label || formData.reason,
        ...(formData.additionalNotes && formData.reason !== 'other' && { notes: formData.additionalNotes })
      };

      console.log('Submitting cancellation data:', submitData);

      const response = await axios.post(
        `${BASE_URL}/api/interviews/${interviewData._id}/cancel`, 
        submitData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        onCancel(response.data.data || interviewData);
        resetForm();
        onClose();
      } else {
        setError(response.data.message || 'Failed to cancel interview');
      }
    } catch (err) {
      console.error('Error cancelling interview:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        setError(err.response.data?.message || 'Failed to cancel interview. Please try again.');
      } else {
        setError('Failed to cancel interview. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      reason: '',
      additionalNotes: ''
    });
    setConfirmText('');
    setError('');
    setFieldErrors({});
    setActiveStep(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Not set';
    return new Date(dateTimeString).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    });
  };

  const getTimeRemaining = (scheduledAt) => {
    if (!scheduledAt) return null;
    
    const now = new Date();
    const interviewTime = new Date(scheduledAt);
    const diffMs = interviewTime - now;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffMs < 0) {
      return { passed: true, text: 'Interview has already passed' };
    } else if (diffHrs < 24) {
      return { 
        urgent: true, 
        text: `Scheduled in ${diffHrs}h ${diffMins}m - Less than 24 hours notice` 
      };
    } else {
      return { 
        normal: true, 
        text: `Scheduled in ${diffHrs} hours` 
      };
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        const timeRemaining = getTimeRemaining(interviewData?.scheduledAt);
        
        return (
          <Stack spacing={2}>
            {/* Warning Alert for Cancellation */}
            <Alert 
              severity="warning" 
              icon={<WarningIcon />}
              sx={{ borderRadius: 1, border: '1px solid #FFE0B2' }}
            >
              <AlertTitle sx={{ fontWeight: 600 }}>Important</AlertTitle>
              <Typography variant="body2">
                You are about to cancel this interview. This action cannot be undone.
                All participants will be notified via email.
              </Typography>
            </Alert>

            {/* Interview Details */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <EventBusyIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ color: '#d32f2f', fontWeight: 600, fontSize: '0.9rem' }}>
                  Interview to be Cancelled
                </Typography>
              </Box>

              {interviewData ? (
                <Grid container spacing={2}>
                  {/* Time Remaining Warning */}
                  {timeRemaining && (
                    <Grid size={{ xs: 12 }}>
                      <Paper 
                        sx={{ 
                          p: 1.5, 
                          backgroundColor: timeRemaining.urgent ? '#FFEBEE' : '#F5F5F5',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: timeRemaining.urgent ? '#FFCDD2' : '#E0E0E0'
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: timeRemaining.urgent ? '#C62828' : '#666',
                            fontWeight: timeRemaining.urgent ? 600 : 400
                          }}
                        >
                          {timeRemaining.text}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}

                  {/* Interview ID */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                      Interview ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                      {interviewData.interviewId || interviewData._id}
                    </Typography>
                  </Grid>

                  {/* Candidate Info */}
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                      Candidate Information
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: '#d32f2f', width: 48, height: 48 }}>
                        {interviewData.applicationId?.name?.charAt(0) || 
                         interviewData.candidateId?.firstName?.charAt(0) || 'C'}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {interviewData.applicationId?.name || 
                           (interviewData.candidateId?.firstName && interviewData.candidateId?.lastName 
                            ? `${interviewData.candidateId.firstName} ${interviewData.candidateId.lastName}`
                            : 'Candidate Name')}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {interviewData.applicationId?.email || interviewData.candidateId?.email}
                        </Typography>
                        {interviewData.applicationId?.jobId && (
                          <Typography variant="caption" color="textSecondary" display="block">
                            Position: {interviewData.applicationId.jobId?.title || interviewData.jobId?.title}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>

                  {/* Interview Details */}
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                      Interview Details
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Round</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {interviewData.round}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Type</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {getInterviewTypeIcon(interviewData.type)}
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {getInterviewTypeLabel(interviewData.type)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Scheduled Time</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatDateTime(interviewData.scheduledAt)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Duration: {interviewData.duration} minutes
                    </Typography>
                  </Grid>

                  {/* Interviewers */}
                  {interviewData.interviewers && interviewData.interviewers.length > 0 && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                        Interviewers
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {interviewData.interviewers.map((interviewer, index) => (
                          <Chip
                            key={index}
                            label={interviewer.name}
                            size="small"
                            icon={<PersonIcon />}
                            sx={{ backgroundColor: '#FFEBEE', color: '#d32f2f' }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  )}

                  {/* Status */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Current Status</Typography>
                    <Chip
                      label={interviewData.status}
                      size="small"
                      sx={{
                        backgroundColor: 
                          interviewData.status === 'scheduled' ? '#E3F2FD' : '#F5F5F5',
                        color:
                          interviewData.status === 'scheduled' ? '#1976D2' : '#666',
                      }}
                    />
                  </Grid>
                </Grid>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                    Loading interview details...
                  </Typography>
                </Box>
              )}
            </Paper>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={2}>
            {/* Cancellation Reason */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <CancelIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ color: '#d32f2f', fontWeight: 600, fontSize: '0.9rem' }}>
                  Cancellation Reason
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth size="small" error={!!fieldErrors.reason}>
                    <InputLabel>Select Reason *</InputLabel>
                    <Select
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      label="Select Reason *"
                      required
                    >
                      {cancellationReasons.map((reason) => (
                        <MenuItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.reason && (
                      <FormHelperText>{fieldErrors.reason}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label={formData.reason === 'other' ? 'Please specify *' : 'Additional Notes (Optional)'}
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    required={formData.reason === 'other'}
                    error={!!fieldErrors.additionalNotes}
                    helperText={fieldErrors.additionalNotes || 'Provide any additional context for the cancellation'}
                    placeholder={formData.reason === 'other' 
                      ? 'Please explain the reason for cancellation...' 
                      : 'Any additional information...'}
                    disabled={!formData.reason}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Alert severity="info" sx={{ borderRadius: 1 }}>
              <Typography variant="body2">
                All interviewers and the candidate will be notified of the cancellation along with the reason provided.
              </Typography>
            </Alert>
          </Stack>
        );

      case 2:
        const selectedReason = cancellationReasons.find(r => r.value === formData.reason);
        
        return (
          <Stack spacing={2}>
            {/* Confirmation */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <WarningIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ color: '#d32f2f', fontWeight: 600, fontSize: '0.9rem' }}>
                  Confirm Cancellation
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {/* Cancellation Summary */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                    Cancellation Summary
                  </Typography>
                  
                  <Paper sx={{ p: 1.5, backgroundColor: '#FFEBEE', borderRadius: 1, border: '1px solid #FFCDD2' }}>
                    <Typography variant="body2" fontWeight={500} sx={{ color: '#C62828', mb: 1 }}>
                      {selectedReason?.label || formData.reason}
                    </Typography>
                    {formData.additionalNotes && (
                      <Typography variant="body2" sx={{ color: '#333' }}>
                        {formData.additionalNotes}
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                {/* Impact Summary */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                    Impact Summary
                  </Typography>
                  
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 6 }}>
                      <Paper sx={{ p: 1.5, backgroundColor: '#F5F5F5', borderRadius: 1 }}>
                        <Typography variant="caption" color="textSecondary">Interviewers</Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {interviewData?.interviewers?.length || 0} will be notified
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid size={{ xs: 6 }}>
                      <Paper sx={{ p: 1.5, backgroundColor: '#F5F5F5', borderRadius: 1 }}>
                        <Typography variant="caption" color="textSecondary">Candidate</Typography>
                        <Typography variant="body2" fontWeight={500}>
                          Will be notified via email
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid size={{ xs: 12 }}>
                      <Paper sx={{ p: 1.5, backgroundColor: '#F5F5F5', borderRadius: 1 }}>
                        <Typography variant="caption" color="textSecondary">Application Status</Typography>
                        <Typography variant="body2" fontWeight={500}>
                          Will be updated based on cancellation reason
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Confirmation Input */}
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" fontWeight={500} sx={{ mb: 1, color: '#d32f2f' }}>
                    Type <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>CANCEL</span> to confirm
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type CANCEL here"
                    error={!!fieldErrors.confirm}
                    helperText={fieldErrors.confirm}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
              </Grid>
            </Paper>
            
            <Alert severity="error" sx={{ borderRadius: 1 }}>
              <Typography variant="body2" fontWeight={500}>
                This action cannot be undone!
              </Typography>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                <li>
                  <Typography variant="caption">
                    The interview will be marked as cancelled
                  </Typography>
                </li>
                <li>
                  <Typography variant="caption">
                    All participants will receive cancellation notifications
                  </Typography>
                </li>
                <li>
                  <Typography variant="caption">
                    The interview slot will be freed up for rescheduling
                  </Typography>
                </li>
              </ul>
            </Alert>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1.5,
          maxHeight: '95vh'
        }
      }}
    >
      <DialogTitle sx={{
        borderBottom: '1px solid #E0E0E0',
        py: 1.5,
        px: 2,
        backgroundColor: '#FFEBEE'
      }}>
        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600, color: '#C62828', mb: 1 }}>
          Cancel Interview
        </Typography>

        {/* 🔥 Modern Stepper with Gradient Connector (Red Theme) */}
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          connector={<ColorConnector />}
          sx={{ mb: 1, mt: 1 }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>
                <Typography fontWeight={500} fontSize="0.85rem">{label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContent sx={{ p: 2, overflow: 'auto' }}>
        {renderStepContent(activeStep)}

        {error && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 1 }}>{error}</Alert>
        )}
      </DialogContent>

      <DialogActions sx={{
        px: 2,
        py: 1.5,
        borderTop: '1px solid #E0E0E0',
        backgroundColor: '#F8FAFC',
        justifyContent: 'space-between'
      }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0 || loading}
          size="small"
          startIcon={<NavigateBeforeIcon />}
          sx={{ color: '#666' }}
        >
          Back
        </Button>
        <Box>
          <Button
            onClick={handleClose}
            disabled={loading}
            size="small"
            sx={{ mr: 1, color: '#666' }}
          >
            Cancel
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || confirmText !== 'CANCEL'}
              size="small"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
              sx={{
                backgroundColor: '#d32f2f',
                '&:hover': { backgroundColor: '#b71c1c' },
                '&.Mui-disabled': {
                  backgroundColor: '#FFCDD2',
                  color: '#666'
                }
              }}
            >
              {loading ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              size="small"
              endIcon={<NavigateNextIcon />}
              sx={{
                backgroundColor: '#d32f2f',
                '&:hover': { backgroundColor: '#b71c1c' }
              }}
            >
              Next
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default CancelInterview;