import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  IconButton,
  Chip,
  Stepper,
  Step,
  StepLabel,
  styled,
  StepConnector,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Card,
  CardContent,
  Divider,
  Grid,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  RemoveCircle as RemoveCircleIcon,
  Archive as ArchiveIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  LocationOn as LocationIcon,
  DateRange as DateRangeIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

/* ------------------- Custom Stepper Styling ------------------- */
const ColorConnector = styled(StepConnector)(({ theme }) => ({
  '& .MuiStepConnector-line': {
    height: 4,
    border: 0,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
  },
  '&.Mui-active .MuiStepConnector-line': {
    background: 'linear-gradient(90deg, #164e63, #00B4D8)',
  },
  '&.Mui-completed .MuiStepConnector-line': {
    background: 'linear-gradient(90deg, #164e63, #00B4D8)',
  },
}));

const steps = ["Review Job", "Close Reason", "Confirmation"];

/* ------------------- Close Reason Card Component ------------------- */
const CloseReasonCard = ({ reason, selected, onSelect, description, icon }) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        cursor: 'pointer',
        border: selected ? '2px solid #f44336' : '1px solid #e0e0e0',
        bgcolor: selected ? '#ffebee' : 'white',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: '#f44336',
          boxShadow: '0 4px 12px rgba(244,67,54,0.1)'
        }
      }}
      onClick={() => onSelect(reason)}
    >
      <Stack spacing={2} alignItems="center">
        {icon}
        <Typography variant="subtitle2" fontWeight={600} textAlign="center">
          {reason}
        </Typography>
        {description && (
          <Typography variant="caption" color="textSecondary" textAlign="center">
            {description}
          </Typography>
        )}
        {selected && (
          <Chip
            size="small"
            icon={<CheckCircleIcon />}
            label="Selected"
            color="success"
            variant="outlined"
          />
        )}
      </Stack>
    </Paper>
  );
};

/* ------------------- Main Component ------------------- */
const CloseJobOpening = ({ open, onClose, jobId, onClose: onJobClose }) => {
  const navigate = useNavigate();
  
  // State
  const [activeStep, setActiveStep] = useState(0);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Close reason
  const [closeReason, setCloseReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [notifyCandidates, setNotifyCandidates] = useState(true);
  const [archiveJob, setArchiveJob] = useState(true);
  
  // Confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // Close reasons with descriptions
  const closeReasons = [
    {
      value: 'Position filled',
      label: 'Position Filled',
      description: 'Successfully hired a candidate for this position',
      icon: <ThumbUpIcon sx={{ fontSize: 32, color: '#4caf50' }} />
    },
    {
      value: 'Position cancelled',
      label: 'Position Cancelled',
      description: 'The position is no longer needed',
      icon: <CancelIcon sx={{ fontSize: 32, color: '#f44336' }} />
    },
    {
      value: 'Budget constraints',
      label: 'Budget Constraints',
      description: 'Budget approval was withdrawn or reduced',
      icon: <AttachMoneyIcon sx={{ fontSize: 32, color: '#ff9800' }} />
    },
    {
      value: 'Requirements changed',
      label: 'Requirements Changed',
      description: 'Job requirements have significantly changed',
      icon: <AssignmentIcon sx={{ fontSize: 32, color: '#2196f3' }} />
    },
    {
      value: 'Position on hold',
      label: 'Position On Hold',
      description: 'Temporarily paused, will reopen later',
      icon: <ScheduleIcon sx={{ fontSize: 32, color: '#9c27b0' }} />
    },
    {
      value: 'Internal hire',
      label: 'Internal Hire',
      description: 'Position filled by internal candidate',
      icon: <PeopleIcon sx={{ fontSize: 32, color: '#009688' }} />
    },
    {
      value: 'Other',
      label: 'Other',
      description: 'Specify a custom reason',
      icon: <DescriptionIcon sx={{ fontSize: 32, color: '#757575' }} />
    }
  ];

  // Fetch job details on mount
  useEffect(() => {
    if (open && jobId) {
      fetchJobDetails();
    }
  }, [open, jobId]);

  const fetchJobDetails = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setJob(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const handleReasonSelect = (reason) => {
    setCloseReason(reason);
    if (reason !== 'Other') {
      setCustomReason('');
    }
  };

  const validateStep = () => {
    setError('');
    
    switch(activeStep) {
      case 1:
        if (!closeReason) {
          setError('Please select a reason for closing');
          return false;
        }
        if (closeReason === 'Other' && !customReason.trim()) {
          setError('Please specify the reason');
          return false;
        }
        break;
      default:
        break;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (activeStep === steps.length - 2) {
        // Last step before confirmation, show confirmation dialog
        setConfirmDialogOpen(true);
      } else {
        setActiveStep(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleClose = async () => {
    setClosing(true);
    setError('');
    
    const finalReason = closeReason === 'Other' ? customReason : closeReason;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${BASE_URL}/api/jobs/${jobId}/close`, {
        reason: finalReason,
        additionalNotes: additionalNotes || undefined,
        notifyCandidates,
        archiveJob
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setSuccess('Job closed successfully!');
        setConfirmDialogOpen(false);
        setActiveStep(2); // Move to confirmation step
        
        // Call the onJobClose callback if provided
        if (onJobClose) {
          onJobClose(response.data.data || job);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close job');
      setConfirmDialogOpen(false);
    } finally {
      setClosing(false);
    }
  };

  const handleViewJob = () => {
    onClose();
    navigate(`/jobs/${jobId}`);
  };

  const handleGoToJobs = () => {
    onClose();
    navigate('/jobs');
  };

  const handleCloseDialog = () => {
    onClose();
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

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  if (!job && !loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Alert severity="error">Job not found</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Check if job is already closed
  if (job?.status === 'closed') {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <ArchiveIcon sx={{ fontSize: 60, color: '#9e9e9e', mb: 2 }} />
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Job Already Closed
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            This job opening has already been closed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button variant="contained" onClick={handleViewJob}>
            View Job Details
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, minHeight: 500 }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #164e63, #00B4D8)',
          color: '#fff',
          fontWeight: 600,
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <CloseIcon /> Close Job Opening
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            {/* Warning Alert for Published Jobs */}
            {job?.status === 'published' && (
              <Alert 
                severity="warning" 
                icon={<WarningIcon />}
                sx={{ mb: 2 }}
              >
                <Typography variant="body2">
                  <strong>Warning:</strong> This job is currently published and visible to candidates. 
                  Closing it will remove it from all job boards and notify candidates (if selected).
                </Typography>
              </Alert>
            )}

            {/* Modern Stepper */}
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              connector={<ColorConnector />}
              sx={{ mb: 3, mt: 1 }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>
                    <Typography fontWeight={500}>{label}</Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step Content */}
            <Box>
              
              {/* Step 1: Review Job */}
              {activeStep === 0 && (
                <Stack spacing={3}>
                  {/* Job Summary Card */}
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom fontWeight={600}>
                        Job Summary
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <List dense>
                            <ListItem>
                              <ListItemIcon><WorkIcon fontSize="small" /></ListItemIcon>
                              <ListItemText 
                                primary="Job ID" 
                                secondary={job?.jobId}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><BusinessIcon fontSize="small" /></ListItemIcon>
                              <ListItemText 
                                primary="Department" 
                                secondary={job?.department}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><LocationIcon fontSize="small" /></ListItemIcon>
                              <ListItemText 
                                primary="Location" 
                                secondary={job?.location}
                              />
                            </ListItem>
                          </List>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <List dense>
                            <ListItem>
                              <ListItemIcon><DateRangeIcon fontSize="small" /></ListItemIcon>
                              <ListItemText 
                                primary="Posted Date" 
                                secondary={new Date(job?.createdAt).toLocaleDateString()}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><ScheduleIcon fontSize="small" /></ListItemIcon>
                              <ListItemText 
                                primary="Status" 
                                secondary={
                                  <Chip 
                                    size="small" 
                                    label={job?.status} 
                                    color={getStatusColor(job?.status)}
                                  />
                                }
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>
                              <ListItemText 
                                primary="Applications" 
                                secondary={job?.applicationCount || 0}
                              />
                            </ListItem>
                          </List>
                        </Grid>
                      </Grid>

                      {/* Publishing Status */}
                      {job?.publishTo && job.publishTo.length > 0 && (
                        <>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                            Publishing Status
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {job.publishTo.map((platform, idx) => (
                              <Chip
                                key={idx}
                                size="small"
                                label={`${platform.platform}: ${platform.status}`}
                                color={platform.status === 'published' ? 'success' : 
                                      platform.status === 'pending' ? 'warning' : 'default'}
                                variant="outlined"
                              />
                            ))}
                          </Stack>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Impact Alert */}
                  <Alert severity="info" icon={<InfoIcon />}>
                    <Typography variant="body2">
                      <strong>What happens when you close this job?</strong>
                    </Typography>
                    <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                      <li>The job will be marked as closed and won't accept new applications</li>
                      <li>It will be removed from all job boards and career page</li>
                      <li>Existing applicants will be notified (if selected)</li>
                      <li>The job can be archived for future reference</li>
                    </ul>
                  </Alert>
                </Stack>
              )}

              {/* Step 2: Close Reason */}
              {activeStep === 1 && (
                <Stack spacing={3}>
                  {/* Close Reasons Grid */}
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Select Reason for Closing
                    </Typography>
                    <Grid container spacing={2}>
                      {closeReasons.map((reason) => (
                        <Grid item xs={12} sm={6} key={reason.value}>
                          <CloseReasonCard
                            reason={reason.value}
                            selected={closeReason === reason.value}
                            onSelect={handleReasonSelect}
                            description={reason.description}
                            icon={reason.icon}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  {/* Custom Reason (if Other selected) */}
                  {closeReason === 'Other' && (
                    <TextField
                      label="Specify Reason"
                      fullWidth
                      multiline
                      rows={2}
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Please provide details about why this job is being closed..."
                      required
                    />
                  )}

                  {/* Additional Notes */}
                  <TextField
                    label="Additional Notes (Optional)"
                    fullWidth
                    multiline
                    rows={3}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Any additional information about closing this position..."
                  />

                  {/* Options */}
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                      Additional Options
                    </Typography>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={notifyCandidates}
                            onChange={(e) => setNotifyCandidates(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Notify candidates who have applied"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={archiveJob}
                            onChange={(e) => setArchiveJob(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Archive job for future reference"
                      />
                    </Stack>
                  </Paper>
                </Stack>
              )}

              {/* Step 3: Confirmation */}
              {activeStep === 2 && (
                <Stack spacing={3}>
                  {/* Success Message */}
                  <Paper 
                    sx={{ 
                      p: 4, 
                      textAlign: 'center',
                      bgcolor: '#f1f8e9'
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
                    <Typography variant="h5" gutterBottom fontWeight={600}>
                      Job Closed Successfully!
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                      The job opening has been closed and is no longer accepting applications.
                    </Typography>

                    {/* Summary */}
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white', mb: 3 }}>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="textSecondary">Job ID</Typography>
                          <Typography variant="body2" fontWeight={500}>{job?.jobId}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="textSecondary">Title</Typography>
                          <Typography variant="body2" fontWeight={500}>{job?.title}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="textSecondary">Close Reason</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {closeReason === 'Other' ? customReason : closeReason}
                          </Typography>
                        </Stack>
                        {additionalNotes && (
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="textSecondary">Additional Notes</Typography>
                            <Typography variant="body2" fontWeight={500}>{additionalNotes}</Typography>
                          </Stack>
                        )}
                      </Stack>
                    </Paper>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={2} justifyContent="center">
                      <Button
                        variant="contained"
                        onClick={handleViewJob}
                        startIcon={<VisibilityIcon />}
                        sx={{
                          background: 'linear-gradient(135deg, #164e63, #00B4D8)',
                          '&:hover': { opacity: 0.9 }
                        }}
                      >
                        View Job Details
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleGoToJobs}
                      >
                        Go to Jobs
                      </Button>
                    </Stack>
                  </Paper>
                </Stack>
              )}
            </Box>

            {/* Error/Success Messages */}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          </Stack>
        </DialogContent>

        {/* Navigation Buttons */}
        {activeStep < 2 && (
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              startIcon={<CloseIcon />}
            >
              Cancel
            </Button>
            
            <Box sx={{ flex: 1 }} />
            
            {activeStep > 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={closing}
              startIcon={activeStep === 1 ? <WarningIcon /> : null}
              color={activeStep === 1 ? 'error' : 'primary'}
              sx={activeStep === 1 ? {
                bgcolor: '#f44336',
                '&:hover': { bgcolor: '#d32f2f' }
              } : {
                background: 'linear-gradient(135deg, #164e63, #00B4D8)',
                '&:hover': { opacity: 0.9 }
              }}
            >
              {activeStep === 0 && 'Continue'}
              {activeStep === 1 && 'Review & Close Job'}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{
          bgcolor: '#f44336',
          color: 'white',
          fontWeight: 600
        }}>
          Confirm Close Job
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            <Alert severity="warning" icon={<WarningIcon />}>
              <Typography variant="body2">
                <strong>Warning:</strong> This action cannot be undone.
              </Typography>
            </Alert>

            <Typography variant="body1">
              Are you sure you want to close this job opening?
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary">Job</Typography>
                  <Typography variant="body2" fontWeight={500}>{job?.jobId} - {job?.title}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary">Reason</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {closeReason === 'Other' ? customReason : closeReason}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary">Notify Candidates</Typography>
                  <Typography variant="body2" fontWeight={500}>{notifyCandidates ? 'Yes' : 'No'}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary">Archive Job</Typography>
                  <Typography variant="body2" fontWeight={500}>{archiveJob ? 'Yes' : 'No'}</Typography>
                </Stack>
              </Stack>
            </Paper>

            {job?.applicationCount > 0 && (
              <Alert severity="info">
                <Typography variant="body2">
                  This job has {job.applicationCount} active application(s). They will be notified if you select the option.
                </Typography>
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleClose}
            disabled={closing}
            startIcon={closing ? <CircularProgress size={20} /> : <CloseIcon />}
            color="error"
          >
            {closing ? 'Closing...' : 'Confirm Close'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CloseJobOpening;