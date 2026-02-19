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
  
} from '@mui/material';
import { 
  Close as CloseIcon, 
  NavigateNext as NavigateNextIcon, 
  NavigateBefore as NavigateBeforeIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  VideoCall as VideoCallIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

// 🔥 Modern Stepper Connector with Gradient
const ColorConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#eaeaf0',
    borderRadius: 1,
  },
}));

const RescheduleInterview = ({ open, onClose, onReschedule, interviewData }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    scheduledAt: '',
    reason: '',
    duration: 60,
    meetingLink: '',
    location: '',
    notes: ''
  });

  const [originalInterview, setOriginalInterview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showChanges, setShowChanges] = useState(false);

  // Steps definition
  const steps = ['Review Original', 'New Schedule', 'Confirm Changes'];

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

  // Load interview data when opened
  useEffect(() => {
    if (open && interviewData) {
      setOriginalInterview(interviewData);
      setFormData(prev => ({
        ...prev,
        scheduledAt: interviewData.scheduledAt ? new Date(interviewData.scheduledAt).toISOString().slice(0, 16) : '',
        duration: interviewData.duration || 60,
        meetingLink: interviewData.meetingLink || '',
        location: interviewData.location || '',
        notes: ''
      }));
    }
  }, [open, interviewData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Check for changes
    checkForChanges(name, value);

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    if (value === '' || /^\d+$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      checkForChanges(name, value);

      if (fieldErrors[name]) {
        setFieldErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };

  const checkForChanges = (fieldName, value) => {
    if (!originalInterview) return;

    let hasChanges = false;
    
    // Check scheduledAt
    const originalDate = originalInterview.scheduledAt ? 
      new Date(originalInterview.scheduledAt).toISOString().slice(0, 16) : '';
    const newDate = fieldName === 'scheduledAt' ? value : formData.scheduledAt;
    if (originalDate !== newDate) hasChanges = true;

    // Check duration
    const originalDuration = originalInterview.duration || 60;
    const newDuration = fieldName === 'duration' ? parseInt(value) : formData.duration;
    if (originalDuration !== newDuration) hasChanges = true;

    // Check meetingLink (for video)
    if (originalInterview.type === 'video') {
      const originalLink = originalInterview.meetingLink || '';
      const newLink = fieldName === 'meetingLink' ? value : formData.meetingLink;
      if (originalLink !== newLink) hasChanges = true;
    }

    // Check location (for in-person)
    if (originalInterview.type === 'in-person') {
      const originalLocation = originalInterview.location || '';
      const newLocation = fieldName === 'location' ? value : formData.location;
      if (originalLocation !== newLocation) hasChanges = true;
    }

    setShowChanges(hasChanges);
  };

  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      if (!formData.scheduledAt) {
        errors.scheduledAt = 'New scheduled date and time is required';
      } else {
        const selectedDate = new Date(formData.scheduledAt);
        const now = new Date();
        if (selectedDate < now) {
          errors.scheduledAt = 'Scheduled time must be in the future';
        }

        // Check if it's different from original
        if (originalInterview) {
          const originalDate = new Date(originalInterview.scheduledAt).toISOString().slice(0, 16);
          if (originalDate === formData.scheduledAt) {
            errors.scheduledAt = 'New schedule time must be different from original';
          }
        }
      }

      if (!formData.reason) {
        errors.reason = 'Please provide a reason for rescheduling';
      } else if (formData.reason.trim().length < 10) {
        errors.reason = 'Reason must be at least 10 characters';
      }

      if (!formData.duration) {
        errors.duration = 'Duration is required';
      } else if (formData.duration < 15) {
        errors.duration = 'Duration must be at least 15 minutes';
      }

      if (originalInterview?.type === 'video' && !formData.meetingLink) {
        errors.meetingLink = 'Meeting link is required for video interviews';
      }

      if (originalInterview?.type === 'in-person' && !formData.location) {
        errors.location = 'Location is required for in-person interviews';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
      setError('');
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) {
      setError('Please fill in all required fields correctly');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      // Prepare data according to API expectations
      const submitData = {
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        reason: formData.reason,
        ...(formData.duration !== originalInterview?.duration && { duration: parseInt(formData.duration) }),
        ...(formData.meetingLink !== originalInterview?.meetingLink && { meetingLink: formData.meetingLink }),
        ...(formData.location !== originalInterview?.location && { location: formData.location }),
        ...(formData.notes && { notes: formData.notes })
      };

      console.log('Submitting reschedule data:', submitData);

      const response = await axios.put(
        `${BASE_URL}/api/interviews/${interviewData._id}/reschedule`, 
        submitData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        onReschedule(response.data.data);
        resetForm();
        onClose();
      } else {
        setError(response.data.message || 'Failed to reschedule interview');
      }
    } catch (err) {
      console.error('Error rescheduling interview:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        setError(err.response.data?.message || 'Failed to reschedule interview. Please try again.');
      } else {
        setError('Failed to reschedule interview. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      scheduledAt: '',
      reason: '',
      duration: 60,
      meetingLink: '',
      location: '',
      notes: ''
    });
    setError('');
    setFieldErrors({});
    setActiveStep(0);
    setShowChanges(false);
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

  const formatDateForInput = (dateTimeString) => {
    if (!dateTimeString) return '';
    return new Date(dateTimeString).toISOString().slice(0, 16);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={2}>
            {/* Original Interview Details */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <EventIcon sx={{ color: '#1976D2', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ color: '#1976D2', fontWeight: 600, fontSize: '0.9rem' }}>
                  Original Interview Schedule
                </Typography>
              </Box>

              {originalInterview ? (
                <Grid container spacing={2}>
                  {/* Interview ID */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                      Interview ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                      {originalInterview.interviewId || originalInterview._id}
                    </Typography>
                  </Grid>

                  {/* Candidate Info */}
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                      Candidate Information
                    </Typography>
                    <Paper sx={{ p: 1.5, backgroundColor: '#F8FAFC', borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {originalInterview.applicationId?.name || 
                         originalInterview.candidateId?.name || 
                         'Candidate'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {originalInterview.applicationId?.email || originalInterview.candidateId?.email}
                      </Typography>
                      {originalInterview.applicationId?.jobId && (
                        <Typography variant="caption" color="textSecondary" display="block">
                          Position: {originalInterview.applicationId.jobId?.title || originalInterview.jobId?.title}
                        </Typography>
                      )}
                    </Paper>
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
                      {originalInterview.round}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Type</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {getInterviewTypeIcon(originalInterview.type)}
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {getInterviewTypeLabel(originalInterview.type)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Original Schedule</Typography>
                    <Paper sx={{ p: 1.5, backgroundColor: '#FFF3E0', borderRadius: 1, border: '1px solid #FFE0B2' }}>
                      <Typography variant="body2" fontWeight={500}>
                        {formatDateTime(originalInterview.scheduledAt)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Duration: {originalInterview.duration} minutes
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Meeting Details */}
                  {originalInterview.type === 'video' && originalInterview.meetingLink && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Meeting Link</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-all' }}>
                        {originalInterview.meetingLink}
                      </Typography>
                    </Grid>
                  )}

                  {originalInterview.type === 'in-person' && originalInterview.location && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Location</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {originalInterview.location}
                      </Typography>
                    </Grid>
                  )}

                  {/* Interviewers */}
                  {originalInterview.interviewers && originalInterview.interviewers.length > 0 && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                        Interviewers
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {originalInterview.interviewers.map((interviewer, index) => (
                          <Chip
                            key={index}
                            label={interviewer.name}
                            size="small"
                            icon={<PersonIcon />}
                            sx={{ backgroundColor: '#E3F2FD', color: '#1976D2' }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  )}

                  {/* Status */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Current Status</Typography>
                    <Chip
                      label={originalInterview.status}
                      size="small"
                      sx={{
                        backgroundColor: 
                          originalInterview.status === 'scheduled' ? '#E8F5E9' :
                          originalInterview.status === 'completed' ? '#E3F2FD' :
                          originalInterview.status === 'cancelled' ? '#FFEBEE' : '#F5F5F5',
                        color:
                          originalInterview.status === 'scheduled' ? '#2E7D32' :
                          originalInterview.status === 'completed' ? '#1976D2' :
                          originalInterview.status === 'cancelled' ? '#C62828' : '#666',
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

            <Alert severity="info" sx={{ borderRadius: 1 }}>
              <Typography variant="body2">
                Please review the original interview details before proceeding with rescheduling.
              </Typography>
            </Alert>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={2}>
            {/* New Schedule Details */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <UpdateIcon sx={{ color: '#1976D2', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ color: '#1976D2', fontWeight: 600, fontSize: '0.9rem' }}>
                  New Schedule Details
                </Typography>
              </Box>

              <Grid container spacing={1.5}>
                {/* New Date & Time */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="New Date & Time"
                    name="scheduledAt"
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={handleChange}
                    required
                    error={!!fieldErrors.scheduledAt}
                    helperText={fieldErrors.scheduledAt}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>

                {/* Reason for Rescheduling */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Reason for Rescheduling"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    multiline
                    rows={3}
                    error={!!fieldErrors.reason}
                    helperText={fieldErrors.reason || 'Please provide a clear reason for rescheduling'}
                    placeholder="e.g., Interviewer availability changed, Technical issues, Candidate requested, etc."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>

                {/* Duration */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Duration (minutes)"
                    name="duration"
                    value={formData.duration}
                    onChange={handleNumberChange}
                    required
                    type="number"
                    inputProps={{ min: 15, step: 15 }}
                    error={!!fieldErrors.duration}
                    helperText={fieldErrors.duration || 'Minimum 15 minutes'}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>

                {/* Meeting Link or Location (if applicable) */}
                {originalInterview?.type === 'video' && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Meeting Link"
                      name="meetingLink"
                      value={formData.meetingLink}
                      onChange={handleChange}
                      required
                      error={!!fieldErrors.meetingLink}
                      helperText={fieldErrors.meetingLink || 'Update meeting link if changed'}
                      placeholder="https://meet.google.com/abc-defg-hij"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                  </Grid>
                )}

                {originalInterview?.type === 'in-person' && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      error={!!fieldErrors.location}
                      helperText={fieldErrors.location || 'Update location if changed'}
                      placeholder="e.g., Conference Room A, Building 2"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                  </Grid>
                )}

                {/* Additional Notes */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Additional Notes (Optional)"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    placeholder="Any additional information about the reschedule..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Show changes summary */}
            {showChanges && originalInterview && (
              <Alert severity="warning" sx={{ borderRadius: 1 }}>
                <Typography variant="body2" fontWeight={500} gutterBottom>
                  Changes to be made:
                </Typography>
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                  {formatDateForInput(originalInterview.scheduledAt) !== formData.scheduledAt && (
                    <li>
                      <Typography variant="caption">
                        Schedule: <strong>{formatDateTime(originalInterview.scheduledAt)}</strong> →{' '}
                        <strong>{formatDateTime(formData.scheduledAt)}</strong>
                      </Typography>
                    </li>
                  )}
                  {originalInterview.duration !== formData.duration && (
                    <li>
                      <Typography variant="caption">
                        Duration: <strong>{originalInterview.duration} min</strong> →{' '}
                        <strong>{formData.duration} min</strong>
                      </Typography>
                    </li>
                  )}
                  {originalInterview.type === 'video' && 
                   originalInterview.meetingLink !== formData.meetingLink && formData.meetingLink && (
                    <li>
                      <Typography variant="caption">Meeting link will be updated</Typography>
                    </li>
                  )}
                  {originalInterview.type === 'in-person' && 
                   originalInterview.location !== formData.location && formData.location && (
                    <li>
                      <Typography variant="caption">Location will be updated</Typography>
                    </li>
                  )}
                </ul>
              </Alert>
            )}
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={2}>
            {/* Comparison View */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Confirm Reschedule Changes
              </Typography>
              
              <Grid container spacing={2}>
                {/* Original Schedule */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 1.5, backgroundColor: '#FFF3E0', borderRadius: 1, border: '1px solid #FFE0B2' }}>
                    <Typography variant="caption" sx={{ color: '#E65100', display: 'block', mb: 1, fontWeight: 600 }}>
                      Original Schedule
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatDateTime(originalInterview?.scheduledAt)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Duration: {originalInterview?.duration} minutes
                    </Typography>
                    {originalInterview?.type === 'video' && originalInterview?.meetingLink && (
                      <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                        Link: {originalInterview.meetingLink}
                      </Typography>
                    )}
                    {originalInterview?.type === 'in-person' && originalInterview?.location && (
                      <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                        Location: {originalInterview.location}
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                {/* New Schedule */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 1.5, backgroundColor: '#E8F5E9', borderRadius: 1, border: '1px solid #C8E6C9' }}>
                    <Typography variant="caption" sx={{ color: '#2E7D32', display: 'block', mb: 1, fontWeight: 600 }}>
                      New Schedule
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatDateTime(formData.scheduledAt)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Duration: {formData.duration} minutes
                    </Typography>
                    {originalInterview?.type === 'video' && formData.meetingLink && (
                      <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                        Link: {formData.meetingLink}
                      </Typography>
                    )}
                    {originalInterview?.type === 'in-person' && formData.location && (
                      <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                        Location: {formData.location}
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                {/* Reason */}
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                    Reason for Rescheduling
                  </Typography>
                  <Paper sx={{ p: 1.5, backgroundColor: '#F8FAFC', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ color: '#333' }}>
                      {formData.reason}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Additional Notes */}
                {formData.notes && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                      Additional Notes
                    </Typography>
                    <Paper sx={{ p: 1.5, backgroundColor: '#F8FAFC', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ color: '#333' }}>
                        {formData.notes}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Paper>
            
            <Alert severity="warning" sx={{ borderRadius: 1 }}>
              <Typography variant="body2" fontWeight={500}>
                Important Notes:
              </Typography>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                <li>
                  <Typography variant="caption">
                    An email notification will be sent to all interviewers and the candidate
                  </Typography>
                </li>
                <li>
                  <Typography variant="caption">
                    The interview status will be updated to "rescheduled"
                  </Typography>
                </li>
                <li>
                  <Typography variant="caption">
                    This action cannot be undone automatically
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
        backgroundColor: '#F8FAFC'
      }}>
        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600, color: '#101010', mb: 1 }}>
          Reschedule Interview
        </Typography>

        {/* 🔥 Modern Stepper with Gradient Connector */}
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
              disabled={loading || !showChanges}
              size="small"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <UpdateIcon />}
              sx={{
                backgroundColor: '#1976D2',
                '&:hover': { backgroundColor: '#1565C0' },
                '&.Mui-disabled': {
                  backgroundColor: '#E0E0E0'
                }
              }}
            >
              {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              size="small"
              endIcon={<NavigateNextIcon />}
              sx={{
                backgroundColor: '#1976D2',
                '&:hover': { backgroundColor: '#1565C0' }
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

export default RescheduleInterview;