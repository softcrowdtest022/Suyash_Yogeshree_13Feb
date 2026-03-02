import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Grid,
  Box,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Divider,
  alpha
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Security as SecurityIcon,
  Fingerprint as FingerprintIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  Gavel as GavelIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../../config/Config';

// Color constants
const PRIMARY_BLUE = '#00B4D8';
const SUCCESS_COLOR = '#2E7D32';
const ERROR_COLOR = '#D32F2F';

// Check types with icons and colors
const CHECK_TYPES = [
  {
    type: 'identity',
    label: 'Identity Verification',
    icon: <FingerprintIcon />,
    color: '#1976D2'
  },
  {
    type: 'address',
    label: 'Address Verification',
    icon: <HomeIcon />,
    color: '#2E7D32'
  },
  {
    type: 'education',
    label: 'Education Verification',
    icon: <SchoolIcon />,
    color: '#7B1FA2'
  },
  {
    type: 'employment',
    label: 'Employment Verification',
    icon: <BusinessIcon />,
    color: '#F57C00'
  },
  {
    type: 'criminal',
    label: 'Criminal Record Check',
    icon: <GavelIcon />,
    color: '#C62828'
  }
];

// Status color mapping
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'cleared':
    case 'approved':
    case 'completed':
      return { bg: '#d1fae5', color: '#065f46', label: 'Cleared' };
    case 'pending':
      return { bg: '#fef3c7', color: '#92400e', label: 'Pending' };
    case 'failed':
    case 'rejected':
      return { bg: '#fee2e2', color: '#991b1b', label: 'Failed' };
    case 'in_progress':
      return { bg: '#e3f2fd', color: '#1976d2', label: 'In Progress' };
    default:
      return { bg: '#f1f5f9', color: '#475569', label: status || 'Unknown' };
  }
};

const ApproveBGV = ({ open, onClose, onSubmit, bgvData, bgvId }) => {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // Data states
  const [bgvDetails, setBGVDetails] = useState(bgvData || null);
  const [remarks, setRemarks] = useState('');
  const [decision, setDecision] = useState('approve'); // 'approve' or 'reject'
  const [approvedBGV, setApprovedBGV] = useState(null);

  // Error/Success state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const steps = ['Review BGV Details', 'Add Remarks', 'Confirm & Approve'];

  // Fetch BGV details on open if not provided
  useEffect(() => {
    if (open && !bgvData && bgvId) {
      fetchBGVDetails();
    } else if (bgvData) {
      console.log('BGV Data received:', bgvData); // Debug log
      setBGVDetails(bgvData);
    }
  }, [open, bgvData, bgvId]);

  // Fetch BGV details from API
  const fetchBGVDetails = async () => {
    setFetchingDetails(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/bgv/${bgvId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('BGV Details Response:', response.data); // Debug log

      if (response.data.success) {
        setBGVDetails(response.data.data);
      } else {
        setError('Failed to fetch BGV details');
      }
    } catch (err) {
      console.error('Error fetching BGV details:', err);
      setError(err.response?.data?.message || 'Failed to fetch BGV details');
    } finally {
      setFetchingDetails(false);
    }
  };

  // Helper function to get candidate name safely
  const getCandidateName = () => {
    if (!bgvDetails) return 'N/A';

    // Try different possible paths for candidate data
    const candidate = bgvDetails.candidateId || bgvDetails.candidate;

    if (!candidate) return 'N/A';

    if (candidate.fullName) return candidate.fullName;
    if (candidate.firstName || candidate.lastName) {
      return `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'N/A';
    }
    return 'N/A';
  };

  // Helper function to get candidate email
  const getCandidateEmail = () => {
    if (!bgvDetails) return 'N/A';
    const candidate = bgvDetails.candidateId || bgvDetails.candidate;
    return candidate?.email || 'N/A';
  };

  // Helper function to get candidate phone
  const getCandidatePhone = () => {
    if (!bgvDetails) return 'N/A';
    const candidate = bgvDetails.candidateId || bgvDetails.candidate;
    return candidate?.phone || 'N/A';
  };

  // Helper function to get candidate ID
  const getCandidateId = () => {
    if (!bgvDetails) return 'N/A';
    const candidate = bgvDetails.candidateId || bgvDetails.candidate;
    return candidate?.candidateId || candidate?.id || 'N/A';
  };

  // Helper function to get candidate initials
  const getCandidateInitials = () => {
    if (!bgvDetails) return '?';
    const candidate = bgvDetails.candidateId || bgvDetails.candidate;

    if (candidate?.firstName && candidate?.lastName) {
      return `${candidate.firstName[0]}${candidate.lastName[0]}`;
    }
    if (candidate?.fullName) {
      const names = candidate.fullName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`;
      }
      return names[0][0] || '?';
    }
    return '?';
  };

  // Handle next step
  const handleNext = () => {
    if (step === 1 && !remarks.trim()) {
      setError('Please add remarks for the decision');
      return;
    }
    setError('');
    setStep(prev => prev + 1);
  };

  // Handle back step
  const handleBack = () => {
    setStep(prev => prev - 1);
    setError('');
  };

  // Handle reset
  const handleReset = () => {
    setStep(0);
    setRemarks('');
    setDecision('approve');
    setApprovedBGV(null);
    setError('');
    setSuccess('');
  };

  // Handle close
  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Handle approve/reject
  const handleDecision = async () => {
    if (!remarks.trim()) {
      setError('Please add remarks for the decision');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${BASE_URL}/api/bgv/${bgvId}/decision`,
        {
          decision: decision,
          remarks: remarks.trim()
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Decision Response:', response.data); // Debug log

      if (response.data.success) {
        setApprovedBGV(response.data.data);
        setSuccess(response.data.message || `BGV ${decision}ed successfully!`);

        if (onSubmit) {
          onSubmit(response.data.data);
        }

        // Auto close after success
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Error processing BGV decision:', err);
      setError(err.response?.data?.message || `Failed to ${decision} BGV`);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate stats with null checks
  const totalChecks = bgvDetails?.checks?.length || 0;
  const clearedChecks = bgvDetails?.checks?.filter(c => c.status === 'cleared' || c.status === 'completed').length || 0;
  const pendingChecks = bgvDetails?.checks?.filter(c => c.status === 'pending').length || 0;
  const failedChecks = bgvDetails?.checks?.filter(c => c.status === 'failed' || c.status === 'rejected').length || 0;

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            {fetchingDetails ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={40} />
              </Box>
            ) : bgvDetails ? (
              <>
                {/* BGV Header and Candidate Info - Side by Side */}
                <Grid container spacing={4}>
                  {/* BGV Details Card */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ py: 0.5, px: 4 }}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2">
                        📋 BGV Details
                      </Typography>

                      <Grid container spacing={12}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="textSecondary">BGV ID</Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {bgvDetails?.bgvId || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="textSecondary">Status</Typography>
                          <Box>
                            <Chip
                              label={bgvDetails?.status || 'N/A'}
                              size="small"
                              sx={{
                                bgcolor: getStatusColor(bgvDetails?.status).bg,
                                color: getStatusColor(bgvDetails?.status).color,
                                fontWeight: 500,
                                mt: 0.5
                              }}
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* Candidate Information Card */}
                  <Grid item xs={12} md={6} px={4}>
                    <Paper sx={{ py: 1.25, px: 4}}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2">
                        👤 Candidate Information
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: PRIMARY_BLUE }}>
                          {getCandidateInitials()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1">
                            {getCandidateName()}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {getCandidateEmail()} • {getCandidatePhone()}
                          </Typography>
                        </Box>
                      </Box>

                      <Grid container spacing={2}>
                        {bgvDetails?.offerId && (
                          <Grid item xs={12}>
                            <Typography variant="caption" color="textSecondary">Offer ID</Typography>
                            <Typography variant="body2">
                              {typeof bgvDetails.offerId === 'object'
                                ? bgvDetails.offerId?.offerId || 'N/A'
                                : bgvDetails.offerId || 'N/A'}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Vendor Info Card */}
                {/* <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2">
                    🏢 Vendor Information
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Vendor</Typography>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {bgvDetails?.vendor || 'Authbridge'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Initiated On</Typography>
                      <Typography variant="body2">
                        {bgvDetails?.createdAt ? new Date(bgvDetails.createdAt).toLocaleString() : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper> */}

                {/* Checks Summary */}
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2">
                    🔍 Verification Checks
                  </Typography>

                  {/* Summary Stats */}
                  {/* <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 1.5, bgcolor: '#d1fae5', textAlign: 'center' }}>
                        <Typography variant="h6" color="#065f46">{clearedChecks}</Typography>
                        <Typography variant="caption" color="#065f46">Cleared</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 1.5, bgcolor: '#fef3c7', textAlign: 'center' }}>
                        <Typography variant="h6" color="#92400e">{pendingChecks}</Typography>
                        <Typography variant="caption" color="#92400e">Pending</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 1.5, bgcolor: '#fee2e2', textAlign: 'center' }}>
                        <Typography variant="h6" color="#991b1b">{failedChecks}</Typography>
                        <Typography variant="caption" color="#991b1b">Failed</Typography>
                      </Paper>
                    </Grid>
                  </Grid> */}

                  {/* Checks List */}
                  <Stack spacing={2}>
                    {CHECK_TYPES.map((checkType, index) => {
                      const check = bgvDetails?.checks?.find(c => c.type === checkType.type);
                      const status = check?.status || 'pending';
                      const statusStyle = getStatusColor(status);

                      return (
                        <Box key={checkType.type}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center'}}>
                              <Box sx={{ color: checkType.color }}>{checkType.icon}</Box>
                              <Typography variant="body2" fontWeight={500}>
                                {checkType.label}
                              </Typography>
                            </Box>
                            <Chip
                              label={statusStyle.label}
                              size="small"
                              sx={{
                                bgcolor: statusStyle.bg,
                                color: statusStyle.color,
                                height: 10,
                                fontSize: '11px',
                                fontWeight: 500
                              }}
                            />
                          </Box>
                          {check?.completedAt && (
                            <Typography variant="caption" color="textSecondary" sx={{ ml: 4 }}>
                              Completed: {new Date(check.completedAt).toLocaleString()}
                            </Typography>
                          )}
                          {index < CHECK_TYPES.length - 1 && <Divider sx={{ mt: 1 }} />}
                        </Box>
                      );
                    })}
                  </Stack>
                </Paper>

                {/* Timeline */}
                {/* <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2">
                    ⏱️ Timeline
                  </Typography>

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>Initiated</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {bgvDetails?.createdAt ? new Date(bgvDetails.createdAt).toLocaleString() : 'N/A'}
                      </Typography>
                    </Box>
                    {bgvDetails?.completedAt && (
                      <Box>
                        <Typography variant="body2" fontWeight={500}>Completed</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(bgvDetails.completedAt).toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Paper> */}
              </>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No BGV details found. Please select a BGV to review.
              </Alert>
            )}
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2">
                💬 Add Remarks
              </Typography>

              <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                Please provide detailed remarks for your decision. This will be recorded in the BGV history.
              </Alert>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Remarks"
                placeholder="Enter your remarks here..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                sx={{ mb: 3 }}
              />

              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Decision
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant={decision === 'approve' ? 'contained' : 'outlined'}
                    color="success"
                    startIcon={<ThumbUpIcon />}
                    onClick={() => setDecision('approve')}
                    sx={{
                      py: 1.5,
                      bgcolor: decision === 'approve' ? SUCCESS_COLOR : 'transparent',
                      '&:hover': {
                        bgcolor: decision === 'approve' ? '#1B5E20' : alpha(SUCCESS_COLOR, 0.04)
                      }
                    }}
                  >
                    Approve
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant={decision === 'reject' ? 'contained' : 'outlined'}
                    color="error"
                    startIcon={<ThumbDownIcon />}
                    onClick={() => setDecision('reject')}
                    sx={{
                      py: 1.5,
                      bgcolor: decision === 'reject' ? ERROR_COLOR : 'transparent',
                      '&:hover': {
                        bgcolor: decision === 'reject' ? '#B71C1C' : alpha(ERROR_COLOR, 0.04)
                      }
                    }}
                  >
                    Reject
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2" >
                Confirm Decision
              </Typography>

              {/* Summary Card */}
              <Paper sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Decision Summary
                </Typography>
                <Grid container spacing={8}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">BGV ID</Typography>
                    <Typography variant="body2" fontWeight={500}>{bgvDetails?.bgvId || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Candidate</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {getCandidateName()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Decision</Typography>
                    <Box>
                      <Chip
                        icon={decision === 'approve' ? <CheckCircleIcon /> : <CancelIcon />}
                        label={decision === 'approve' ? 'Approve' : 'Reject'}
                        color={decision === 'approve' ? 'success' : 'error'}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Remarks</Typography>
                    <Paper sx={{ p: 0.5, bgcolor: '#FFFFFF', mt: 0.5 }}>
                      <Typography variant="body2">{remarks || 'No remarks provided'}</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>

              {/* Checks Status */}
              {bgvDetails && (
                <Paper sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Current Verification Status
                  </Typography>
                  <Grid container spacing={2} >
                    {CHECK_TYPES.map((checkType) => {
                      const check = bgvDetails?.checks?.find(c => c.type === checkType.type);
                      const status = check?.status || 'pending';
                      const statusStyle = getStatusColor(status);

                      return (
                        <Grid item xs={12} sm={6} key={checkType.type}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ color: checkType.color, fontSize: '0.9rem' }}>{checkType.icon}</Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="caption" display="block">
                                {checkType.label}
                              </Typography>
                              <Chip
                                label={statusStyle.label}
                                size="small"
                                sx={{
                                  bgcolor: statusStyle.bg,
                                  color: statusStyle.color,
                                  height: 18,
                                  fontSize: '10px'
                                }}
                              />
                            </Box>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Paper>
              )}

              {/* Warning Alert */}
              <Alert
                severity={decision === 'approve' ? 'warning' : 'error'}
                icon={decision === 'approve' ? <WarningIcon /> : <CancelIcon />}
                sx={{ borderRadius: 2 , marginTop: -1}}
              >
                <Typography variant="body2">
                  {decision === 'approve'
                    ? 'Are you sure you want to approve this BGV? This action cannot be undone.'
                    : 'Are you sure you want to reject this BGV? This action cannot be undone.'}
                </Typography>
              </Alert>

              {/* Success Message */}
              {approvedBGV && (
                <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight={500}>
                    BGV {decision}ed Successfully!
                  </Typography>
                  <Typography variant="caption" display="block">
                    BGV ID: {approvedBGV.bgvId}
                  </Typography>
                </Alert>
              )}
            </Paper>
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
        sx: { borderRadius: 2, maxHeight: '90vh' }
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
        zIndex: 2
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {decision === 'approve' ? 'Approve BGV' : 'Reject BGV'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Review and make decision on background verification
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, px: 3, overflowY: 'auto' }}>
        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {success && !approvedBGV && (
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 3, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        {/* Stepper */}
        <Stepper activeStep={step} sx={{ mb: 4, mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ minHeight: 400 }}>
          {renderStepContent()}
        </Box>
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
          Cancel
        </Button>
        <Box>
          <Button
            disabled={step === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          {step === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleDecision}
              disabled={submitting || !remarks.trim() || !bgvDetails}
              startIcon={submitting ? <CircularProgress size={20} /> : (decision === 'approve' ? <ThumbUpIcon /> : <ThumbDownIcon />)}
              color={decision === 'approve' ? 'success' : 'error'}
              sx={{ minWidth: 200 }}
            >
              {submitting
                ? 'Processing...'
                : `${decision === 'approve' ? 'Approve' : 'Reject'} BGV`}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={step === 0 && !bgvDetails}
              sx={{
                background: 'linear-gradient(135deg, #164e63, #00B4D8)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0e3b4a, #0096b4)'
                }
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

export default ApproveBGV;