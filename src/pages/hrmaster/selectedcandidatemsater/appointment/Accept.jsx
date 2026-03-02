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
  Divider,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../../config/Config';

// Color constants
const PRIMARY_BLUE = '#00B4D8';
const SUCCESS_COLOR = '#2E7D32';
const INFO_COLOR = '#0288D1';
const WARNING_COLOR = '#ED6C02';

const AcceptAppointmentLetter = ({ open, onClose, onSubmit, documentData, documentId }) => {
  const [step, setStep] = useState(0);
  const [accepting, setAccepting] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  
  // Data states
  const [documentDetails, setDocumentDetails] = useState(documentData || null);
  const [acceptedDetails, setAcceptedDetails] = useState(null);
  
  // Confirmation state
  const [confirmAccept, setConfirmAccept] = useState(false);
  
  // Error/Success state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const steps = ['Review Letter', 'Accept Letter', 'Confirmation'];

  // Fetch document details on open if not provided
  useEffect(() => {
    if (open && !documentData && documentId) {
      fetchDocumentDetails();
    } else if (documentData) {
      setDocumentDetails(documentData);
    }
  }, [open, documentData, documentId]);

  // Fetch document details from API
  const fetchDocumentDetails = async () => {
    setFetchingDetails(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/documents/${documentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setDocumentDetails(response.data.data);
      } else {
        setError('Failed to fetch document details');
      }
    } catch (err) {
      console.error('Error fetching document details:', err);
      setError(err.response?.data?.message || 'Failed to fetch document details');
    } finally {
      setFetchingDetails(false);
    }
  };

  // Handle next step
  const handleNext = () => {
    if (step === 1 && !confirmAccept) {
      setError('Please confirm acceptance');
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
    setConfirmAccept(false);
    setAcceptedDetails(null);
    setError('');
    setSuccess('');
  };

  // Handle close
  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Handle accept appointment letter
  const handleAcceptLetter = async () => {
    if (!confirmAccept) {
      setError('Please confirm acceptance');
      return;
    }

    setAccepting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/api/appointment-letter/accept/${documentId}`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setAcceptedDetails(response.data.data);
        setSuccess(response.data.message || 'Appointment letter accepted successfully!');
        
        if (onSubmit) {
          onSubmit(response.data.data);
        }
        
        // Move to confirmation step
        setStep(2);
      }
    } catch (err) {
      console.error('Error accepting appointment letter:', err);
      setError(err.response?.data?.message || 'Failed to accept appointment letter');
    } finally {
      setAccepting(false);
    }
  };

  // Handle download letter
  const handleDownloadLetter = () => {
    if (documentDetails?.fileUrl || acceptedDetails?.fileUrl) {
      const fileUrl = documentDetails?.fileUrl || acceptedDetails?.fileUrl;
      window.open(`${BASE_URL}${fileUrl}`, '_blank');
    }
  };

  // Handle view letter
  const handleViewLetter = () => {
    if (documentDetails?.fileUrl || acceptedDetails?.fileUrl) {
      const fileUrl = documentDetails?.fileUrl || acceptedDetails?.fileUrl;
      window.open(`${BASE_URL}${fileUrl}`, '_blank');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(2)} KB`;
    }
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  // Get document status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return { bg: '#d1fae5', color: '#065f46', label: 'Accepted' };
      case 'sent':
        return { bg: '#e3f2fd', color: '#1976d2', label: 'Sent' };
      case 'generated':
        return { bg: '#fef3c7', color: '#92400e', label: 'Generated' };
      case 'rejected':
        return { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' };
      default:
        return { bg: '#f1f5f9', color: '#475569', label: status || 'Unknown' };
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            {fetchingDetails ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={40} />
              </Box>
            ) : documentDetails ? (
              <>
                {/* Document Header Card */}
                <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2">
                    📄 Appointment Letter Details
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Document ID</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {documentDetails.documentId || documentDetails._id || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Status</Typography>
                      <Box>
                        <Chip
                          label={getStatusColor(documentDetails.status).label}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(documentDetails.status).bg,
                            color: getStatusColor(documentDetails.status).color,
                            fontWeight: 500,
                            mt: 0.5
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Candidate Info Card */}
                <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2">
                    👤 Candidate Information
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ width: 48, height: 48, bgcolor: PRIMARY_BLUE }}>
                      {documentDetails.candidateName?.charAt(0) || 'C'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {documentDetails.candidateName || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {documentDetails.candidateEmail || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    {documentDetails.candidateId && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">Candidate ID</Typography>
                        <Typography variant="body2">
                          {typeof documentDetails.candidateId === 'object' 
                            ? documentDetails.candidateId?.candidateId || documentDetails.candidateId?._id || 'N/A'
                            : documentDetails.candidateId}
                        </Typography>
                      </Grid>
                    )}
                    {documentDetails.offerId && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">Offer ID</Typography>
                        <Typography variant="body2">
                          {typeof documentDetails.offerId === 'object'
                            ? documentDetails.offerId?.offerId || documentDetails.offerId?._id || 'N/A'
                            : documentDetails.offerId}
                        </Typography>
                      </Grid>
                    )}
                    {documentDetails.offerDesignation && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">Designation</Typography>
                        <Typography variant="body2">{documentDetails.offerDesignation}</Typography>
                      </Grid>
                    )}
                    {documentDetails.joiningDate && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">Joining Date</Typography>
                        <Typography variant="body2">
                          {new Date(documentDetails.joiningDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Paper>

                {/* Document Details Card */}
                <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2">
                    📎 Document Information
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">File Name</Typography>
                      <Typography variant="body2">{documentDetails.fileName || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">File Size</Typography>
                      <Typography variant="body2">{formatFileSize(documentDetails.fileSize)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Generated At</Typography>
                      <Typography variant="body2">{formatDate(documentDetails.generatedAt || documentDetails.createdAt)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Document Type</Typography>
                      <Typography variant="body2">Appointment Letter</Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={handleViewLetter}
                      size="small"
                      sx={{ borderRadius: 1.5, textTransform: 'none' }}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadLetter}
                      size="small"
                      sx={{ borderRadius: 1.5, textTransform: 'none' }}
                    >
                      Download
                    </Button>
                  </Box>
                </Paper>
              </>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No document details found. Please select an appointment letter to accept.
              </Alert>
            )}
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2">
                ✅ Accept Appointment Letter
              </Typography>

              {/* Summary Card */}
              <Paper sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Document Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Document ID</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {documentDetails?.documentId || documentDetails?._id || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Candidate</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {documentDetails?.candidateName || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Designation</Typography>
                    <Typography variant="body2">{documentDetails?.offerDesignation || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Joining Date</Typography>
                    <Typography variant="body2">
                      {documentDetails?.joiningDate 
                        ? new Date(documentDetails.joiningDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Confirmation Checkbox */}
              <Paper 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  bgcolor: '#FFF3E0', 
                  border: '1px solid #FFB74D',
                  borderRadius: 2,
                  cursor: 'pointer'
                }}
                onClick={() => setConfirmAccept(!confirmAccept)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircleIcon 
                    sx={{ 
                      fontSize: 32, 
                      color: confirmAccept ? SUCCESS_COLOR : '#BDBDBD',
                      transition: 'color 0.2s'
                    }} 
                  />
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      I confirm that I have read and accept the terms of this appointment letter
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      By accepting, you agree to join on the specified date and abide by company policies
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Info Alert */}
              <Alert severity="warning" icon={<WarningIcon />} sx={{ borderRadius: 2 }}>
                <Typography variant="body2">
                  This action is legally binding and cannot be undone. Please ensure you have read the letter carefully.
                </Typography>
              </Alert>
            </Paper>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2">
                🎉 Acceptance Confirmed
              </Typography>

              {acceptedDetails ? (
                <Card sx={{ mb: 3, border: '1px solid', borderColor: 'success.main' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: SUCCESS_COLOR, width: 56, height: 56 }}>
                        <CheckCircleIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" color="success.main" fontWeight={600}>
                          Letter Accepted!
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {acceptedDetails.message || 'Appointment letter has been accepted successfully'}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="textSecondary">Document ID</Typography>
                        <Typography variant="body2" fontWeight={500}>{acceptedDetails.documentId}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">Candidate Name</Typography>
                        <Typography variant="body2">{acceptedDetails.candidateName}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">Candidate Email</Typography>
                        <Typography variant="body2">{acceptedDetails.candidateEmail}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">Status</Typography>
                        <Chip
                          label={acceptedDetails.status || 'accepted'}
                          size="small"
                          color="success"
                          sx={{ height: 20, fontSize: '11px', fontWeight: 500 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">Accepted At</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScheduleIcon fontSize="small" color="primary" />
                          <Typography variant="body2">{formatDate(acceptedDetails.acceptedAt)}</Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Next Step */}
                    {acceptedDetails.nextStep && (
                      <Box sx={{ mt: 3, p: 2, bgcolor: '#F0F7FF', borderRadius: 2, border: '1px solid #90CAF9' }}>
                        <Typography variant="subtitle2" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ArrowForwardIcon fontSize="small" color="primary" />
                          Next Step
                        </Typography>
                        <Typography variant="body2">
                          {acceptedDetails.nextStep}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadLetter}
                      sx={{ borderRadius: 1.5, textTransform: 'none' }}
                    >
                      Download Accepted Letter
                    </Button>
                  </CardActions>
                </Card>
              ) : (
                <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {success || 'Appointment letter accepted successfully!'}
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
              Accept Appointment Letter
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Review and accept the appointment letter
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
        {success && step !== 2 && (
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
              onClick={handleClose}
              color="success"
              startIcon={<CheckCircleIcon />}
              sx={{ minWidth: 150 }}
            >
              Done
            </Button>
          ) : step === 1 ? (
            <Button
              variant="contained"
              onClick={handleAcceptLetter}
              disabled={accepting || !confirmAccept}
              startIcon={accepting ? <CircularProgress size={20} /> : <ThumbUpIcon />}
              sx={{
                background: 'linear-gradient(135deg, #164e63, #00B4D8)',
                minWidth: 150,
                '&:hover': {
                  background: 'linear-gradient(135deg, #0e3b4a, #0096b4)'
                }
              }}
            >
              {accepting ? 'Accepting...' : 'Accept Letter'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!documentDetails}
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

export default AcceptAppointmentLetter;