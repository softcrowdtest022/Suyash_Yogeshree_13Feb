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
  Autocomplete,
  
  // Feedback components
  Alert,
  CircularProgress,
  
  // Data display
  Typography,
  Chip,
  Divider,
  
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
  Add as AddIcon, 
  Close as CloseIcon, 
  NavigateNext as NavigateNextIcon, 
  NavigateBefore as NavigateBeforeIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  VideoCall as VideoCallIcon,
  LocationOn as LocationIcon
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

const ScheduleInterview = ({ open, onClose, onAdd }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    applicationId: null,
    round: '',
    interviewers: [],
    scheduledAt: '',
    duration: 60,
    type: 'video',
    meetingLink: '',
    location: '',
    notes: ''
  });

  // Dropdown states
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsSearch, setApplicationsSearch] = useState('');
  const [applicationsOpen, setApplicationsOpen] = useState(false);
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [applicationsTotalPages, setApplicationsTotalPages] = useState(1);
  const [applicationsInputValue, setApplicationsInputValue] = useState('');

  const [interviewers, setInterviewers] = useState([]);
  const [interviewersLoading, setInterviewersLoading] = useState(false);
  const [interviewersSearch, setInterviewersSearch] = useState('');
  const [interviewersOpen, setInterviewersOpen] = useState(false);
  const [interviewersPage, setInterviewersPage] = useState(1);
  const [interviewersTotalPages, setInterviewersTotalPages] = useState(1);
  const [interviewersInputValue, setInterviewersInputValue] = useState('');

  const [selectedInterviewers, setSelectedInterviewers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Steps definition
  const steps = ['Select Application', 'Interview Details', 'Review & Schedule'];

  // Interview rounds
  const interviewRounds = [
    'teliphonic',
    'Technical',
    'HR',
    'Managerial',
    'Final',
  ];

  // Interview types
  const interviewTypes = [
    { value: 'video', label: 'Video Call', icon: <VideoCallIcon /> },
    { value: 'phone', label: 'Phone Call', icon: <ScheduleIcon /> },
    { value: 'in-person', label: 'In Person', icon: <LocationIcon /> }
  ];

  // Fetch applications from API
  const fetchApplications = async (search = '', page = 1) => {
    setApplicationsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/candidates`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          page: page,
          limit: 10,
          search: search
        }
      });

      if (response.data.success) {
        if (page === 1) {
          setApplications(response.data.data || []);
        } else {
          setApplications(prev => [...prev, ...(response.data.data || [])]);
        }
        setApplicationsTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setApplicationsLoading(false);
    }
  };

  // Fetch interviewers from API
  const fetchInterviewers = async (search = '', page = 1) => {
    setInterviewersLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          page: page,
          limit: 10,
          search: search
        }
      });

      if (response.data.success) {
        if (page === 1) {
          setInterviewers(response.data.data || []);
        } else {
          setInterviewers(prev => [...prev, ...(response.data.data || [])]);
        }
        setInterviewersTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching interviewers:', err);
    } finally {
      setInterviewersLoading(false);
    }
  };

  // Load applications when dropdown opens
  useEffect(() => {
    if (applicationsOpen) {
      fetchApplications(applicationsSearch, 1);
    }
  }, [applicationsOpen]);

  // Search applications with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (applicationsOpen) {
        setApplicationsPage(1);
        fetchApplications(applicationsSearch, 1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [applicationsSearch, applicationsOpen]);

  // Load interviewers when dropdown opens
  useEffect(() => {
    if (interviewersOpen) {
      fetchInterviewers(interviewersSearch, 1);
    }
  }, [interviewersOpen]);

  // Search interviewers with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (interviewersOpen) {
        setInterviewersPage(1);
        fetchInterviewers(interviewersSearch, 1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [interviewersSearch, interviewersOpen]);

  // Handle scroll load more for applications
  const handleApplicationsScroll = (event) => {
    const listboxNode = event.currentTarget;
    if (listboxNode.scrollTop + listboxNode.clientHeight >= listboxNode.scrollHeight - 50) {
      if (applicationsPage < applicationsTotalPages && !applicationsLoading) {
        const nextPage = applicationsPage + 1;
        setApplicationsPage(nextPage);
        fetchApplications(applicationsSearch, nextPage);
      }
    }
  };

  // Handle scroll load more for interviewers
  const handleInterviewersScroll = (event) => {
    const listboxNode = event.currentTarget;
    if (listboxNode.scrollTop + listboxNode.clientHeight >= listboxNode.scrollHeight - 50) {
      if (interviewersPage < interviewersTotalPages && !interviewersLoading) {
        const nextPage = interviewersPage + 1;
        setInterviewersPage(nextPage);
        fetchInterviewers(interviewersSearch, nextPage);
      }
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

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    if (value === '' || /^\d+$/.test(value)) {
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
    }
  };

  const handleAddInterviewer = (event, newValue) => {
    if (newValue) {
      // Check if interviewer already added
      const exists = selectedInterviewers.some(
        interviewer => interviewer._id === newValue._id
      );
      
      if (!exists) {
        const newInterviewer = {
          interviewerId: newValue._id,
          name: newValue.name || newValue.username || 'Interviewer',
          email: newValue.email
        };
        
        setSelectedInterviewers([...selectedInterviewers, newInterviewer]);
        setFormData(prev => ({
          ...prev,
          interviewers: [...prev.interviewers, newInterviewer]
        }));
      }
      
      // Clear the autocomplete input
      setInterviewersInputValue('');
    }
  };

  const handleRemoveInterviewer = (interviewerToRemove) => {
    setSelectedInterviewers(prev => 
      prev.filter(interviewer => interviewer.interviewerId !== interviewerToRemove.interviewerId)
    );
    setFormData(prev => ({
      ...prev,
      interviewers: prev.interviewers.filter(
        interviewer => interviewer.interviewerId !== interviewerToRemove.interviewerId
      )
    }));
  };

  const validateStep = (step) => {
    const errors = {};

    if (step === 0) {
      if (!formData.applicationId) {
        errors.applicationId = 'Please select an application';
      }
    } else if (step === 1) {
      if (!formData.round) {
        errors.round = 'Interview round is required';
      }
      if (selectedInterviewers.length === 0) {
        errors.interviewers = 'At least one interviewer is required';
      }
      if (!formData.scheduledAt) {
        errors.scheduledAt = 'Scheduled date and time is required';
      } else {
        const selectedDate = new Date(formData.scheduledAt);
        const now = new Date();
        if (selectedDate < now) {
          errors.scheduledAt = 'Scheduled time must be in the future';
        }
      }
      if (!formData.duration) {
        errors.duration = 'Duration is required';
      } else if (formData.duration < 15) {
        errors.duration = 'Duration must be at least 15 minutes';
      }
      if (!formData.type) {
        errors.type = 'Interview type is required';
      }
      if (formData.type === 'video' && !formData.meetingLink) {
        errors.meetingLink = 'Meeting link is required for video interviews';
      }
      if (formData.type === 'in-person' && !formData.location) {
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
      setError('Please fill in all required fields in this section');
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
        applicationId: formData.applicationId?._id || formData.applicationId?.id,
        round: formData.round,
        interviewers: selectedInterviewers.map(interviewer => ({
          interviewerId: interviewer.interviewerId,
          name: interviewer.name,
          email: interviewer.email
        })),
        scheduledAt: formData.scheduledAt,
        duration: parseInt(formData.duration),
        type: formData.type,
        meetingLink: formData.meetingLink || '',
        location: formData.location || '',
        notes: formData.notes || ''
      };

      console.log('Submitting interview data:', submitData);

      const response = await axios.post(`${BASE_URL}/api/interviews`, submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        onAdd(response.data.data);
        resetForm();
        onClose();
      } else {
        setError(response.data.message || 'Failed to schedule interview');
      }
    } catch (err) {
      console.error('Error scheduling interview:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        setError(err.response.data?.message || 'Failed to schedule interview. Please try again.');
      } else {
        setError('Failed to schedule interview. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      applicationId: null,
      round: '',
      interviewers: [],
      scheduledAt: '',
      duration: 60,
      type: 'video',
      meetingLink: '',
      location: '',
      notes: ''
    });
    setSelectedInterviewers([]);
    setError('');
    setFieldErrors({});
    setActiveStep(0);
    setApplicationsSearch('');
    setApplicationsInputValue('');
    setInterviewersSearch('');
    setInterviewersInputValue('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Not set';
    return new Date(dateTimeString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={2}>
            {/* Select Application */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Select Application
              </Typography>

              <Autocomplete
                size="small"
                id="application-autocomplete"
                open={applicationsOpen}
                onOpen={() => setApplicationsOpen(true)}
                onClose={() => setApplicationsOpen(false)}
                options={applications}
                loading={applicationsLoading}
                value={formData.applicationId}
                onChange={(event, newValue) => {
                  setFormData(prev => ({ ...prev, applicationId: newValue }));
                  if (fieldErrors.applicationId) setFieldErrors(prev => ({ ...prev, applicationId: '' }));
                }}
                inputValue={applicationsInputValue}
                onInputChange={(event, newInputValue) => {
                  setApplicationsInputValue(newInputValue);
                  setApplicationsSearch(newInputValue);
                }}
                getOptionLabel={(option) => {
                  if (!option) return '';
                  const name = option.name || `${option.firstName || ''} ${option.lastName || ''}`.trim() || 'Unknown';
                  const jobTitle = option.jobTitle || option.position || 'Position';
                  return `${name} - ${jobTitle}`;
                }}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Application"
                    required
                    error={!!fieldErrors.applicationId}
                    helperText={fieldErrors.applicationId}
                    size="small"
                    placeholder="Search by candidate name or position"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1
                      }
                    }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {applicationsLoading ? <CircularProgress size={16} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  const name = option.name || `${option.firstName || ''} ${option.lastName || ''}`.trim() || 'Unknown';
                  const email = option.email || '';
                  const jobTitle = option.jobTitle || option.position || 'Position';
                  return (
                    <MenuItem {...props} key={option._id} sx={{ py: 0.5 }}>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {jobTitle} • {email}
                        </Typography>
                      </Box>
                    </MenuItem>
                  );
                }}
                ListboxProps={{ 
                  onScroll: handleApplicationsScroll, 
                  style: { maxHeight: 200 } 
                }}
              />

              {formData.applicationId && (
                <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#F8FAFC', borderRadius: 1 }}>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Selected Application
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formData.applicationId.name || `${formData.applicationId.firstName || ''} ${formData.applicationId.lastName || ''}`.trim()}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {formData.applicationId.email} • {formData.applicationId.jobTitle || formData.applicationId.position}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={2}>
            {/* Interview Details */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Interview Details
              </Typography>

              <Grid container spacing={1.5}>
                {/* Interview Round */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}>
                    <InputLabel>Interview Round *</InputLabel>
                    <Select
                      name="round"
                      value={formData.round}
                      onChange={handleChange}
                      label="Interview Round *"
                      required
                      error={!!fieldErrors.round}
                    >
                      {interviewRounds.map(round => (
                        <MenuItem key={round} value={round}>{round}</MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.round && (
                      <FormHelperText error>{fieldErrors.round}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Interview Type */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}>
                    <InputLabel>Interview Type *</InputLabel>
                    <Select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      label="Interview Type *"
                      required
                      error={!!fieldErrors.type}
                    >
                      {interviewTypes.map(type => (
                        <MenuItem key={type.value} value={type.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {type.icon}
                            <Typography variant="body2">{type.label}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.type && (
                      <FormHelperText error>{fieldErrors.type}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Date & Time */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Scheduled Date & Time"
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

                {/* Meeting Link (for video) */}
                {formData.type === 'video' && (
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Meeting Link"
                      name="meetingLink"
                      value={formData.meetingLink}
                      onChange={handleChange}
                      required
                      error={!!fieldErrors.meetingLink}
                      helperText={fieldErrors.meetingLink || 'e.g., Google Meet, Zoom, Teams link'}
                      placeholder="https://meet.google.com/abc-defg-hij"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                  </Grid>
                )}

                {/* Location (for in-person) */}
                {formData.type === 'in-person' && (
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      error={!!fieldErrors.location}
                      helperText={fieldErrors.location || 'Room number, building, address'}
                      placeholder="e.g., Conference Room A, Building 2"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Interviewers */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Add Interviewers
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Autocomplete
                  size="small"
                  id="interviewer-autocomplete"
                  open={interviewersOpen}
                  onOpen={() => setInterviewersOpen(true)}
                  onClose={() => setInterviewersOpen(false)}
                  options={interviewers}
                  loading={interviewersLoading}
                  value={null}
                  onChange={handleAddInterviewer}
                  inputValue={interviewersInputValue}
                  onInputChange={(event, newInputValue) => {
                    setInterviewersInputValue(newInputValue);
                    setInterviewersSearch(newInputValue);
                  }}
                  getOptionLabel={(option) => option?.name || option?.username || option?.email || ''}
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search Interviewers"
                      placeholder="Type to search and add interviewers"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1
                        }
                      }}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {interviewersLoading ? <CircularProgress size={16} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <MenuItem {...props} key={option._id} sx={{ py: 0.5 }}>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {option.name || option.username || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {option.email} • {option.department || 'No department'}
                        </Typography>
                      </Box>
                    </MenuItem>
                  )}
                  ListboxProps={{ 
                    onScroll: handleInterviewersScroll, 
                    style: { maxHeight: 200 } 
                  }}
                />
              </Box>

              {/* Selected Interviewers */}
              <Box>
                <Typography variant="caption" sx={{ color: '#666', mb: 1, display: 'block' }}>
                  Selected Interviewers ({selectedInterviewers.length})
                </Typography>
                {selectedInterviewers.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedInterviewers.map((interviewer) => (
                      <Chip
                        key={interviewer.interviewerId}
                        label={interviewer.name}
                        onDelete={() => handleRemoveInterviewer(interviewer)}
                        size="small"
                        icon={<PersonIcon />}
                        sx={{
                          backgroundColor: '#E3F2FD',
                          color: '#1976D2',
                          '& .MuiChip-deleteIcon': {
                            color: '#1976D2',
                            '&:hover': { color: '#1565C0' }
                          }
                        }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic' }}>
                    No interviewers added yet
                  </Typography>
                )}
                {fieldErrors.interviewers && (
                  <FormHelperText error sx={{ mt: 1 }}>{fieldErrors.interviewers}</FormHelperText>
                )}
              </Box>
            </Paper>

            {/* Additional Notes */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                Additional Notes (Optional)
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={2}
                placeholder="Any special instructions or notes for the interview..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              />
            </Paper>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Review Interview Schedule
              </Typography>
              
              <Grid container spacing={2}>
                {/* Application Info */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                    Candidate Information
                  </Typography>
                  <Paper sx={{ p: 1.5, backgroundColor: '#F8FAFC', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {formData.applicationId?.name || 
                       `${formData.applicationId?.firstName || ''} ${formData.applicationId?.lastName || ''}`.trim() || 
                       'Not selected'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formData.applicationId?.email} • {formData.applicationId?.jobTitle || formData.applicationId?.position}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Interview Round</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{formData.round || 'Not set'}</Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Interview Type</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {interviewTypes.find(t => t.value === formData.type)?.icon}
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {interviewTypes.find(t => t.value === formData.type)?.label || formData.type}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Date & Time</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatDateTime(formData.scheduledAt)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Duration</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{formData.duration} minutes</Typography>
                </Grid>

                {/* Meeting Link or Location */}
                {formData.type === 'video' && formData.meetingLink && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Meeting Link</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-all' }}>
                      {formData.meetingLink}
                    </Typography>
                  </Grid>
                )}

                {formData.type === 'in-person' && formData.location && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Location</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{formData.location}</Typography>
                  </Grid>
                )}

                {/* Interviewers */}
                {selectedInterviewers.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                      Interviewers ({selectedInterviewers.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selectedInterviewers.map(interviewer => (
                        <Chip
                          key={interviewer.interviewerId}
                          label={interviewer.name}
                          size="small"
                          icon={<PersonIcon />}
                          sx={{ backgroundColor: '#E3F2FD', color: '#1976D2' }}
                        />
                      ))}
                    </Box>
                  </Grid>
                )}

                {/* Notes */}
                {formData.notes && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>Additional Notes</Typography>
                    <Paper sx={{ p: 1.5, backgroundColor: '#F8FAFC', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ color: '#333' }}>
                        {formData.notes}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Paper>
            
            <Alert severity="info" sx={{ borderRadius: 1 }}>
              <Typography variant="body2">
                Please review all information before scheduling. An email notification will be sent to all interviewers and the candidate.
              </Typography>
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
          Schedule New Interview
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
              disabled={loading}
              size="small"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ScheduleIcon />}
              sx={{
                backgroundColor: '#1976D2',
                '&:hover': { backgroundColor: '#1565C0' }
              }}
            >
              {loading ? 'Scheduling...' : 'Schedule Interview'}
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

export default ScheduleInterview;