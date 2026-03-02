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
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
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
  Send as SendIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  MailOutline as MailIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../../config/Config';

// Color constants
const PRIMARY_BLUE = '#00B4D8';
const SUCCESS_COLOR = '#2E7D32';
const INFO_COLOR = '#0288D1';
const WARNING_COLOR = '#ED6C02';

const SendAppointmentLetter = ({ open, onClose, onSubmit, documentData, documentId }) => {
  const [step, setStep] = useState(0);
  const [sending, setSending] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  
  // Data states
  const [documentDetails, setDocumentDetails] = useState(documentData || null);
  const [sentDetails, setSentDetails] = useState(null);
  const [emailAddress, setEmailAddress] = useState('');
  const [canEditEmail, setCanEditEmail] = useState(true);
  
  // Error/Success state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const steps = ['Review Letter', 'Confirm & Send', 'Sent Confirmation'];

  // Fetch document details on open if not provided
  useEffect(() => {
    if (open && !documentData && documentId) {
      fetchDocumentDetails();
    } else if (documentData) {
      setDocumentDetails(documentData);
      // Pre-fill email from candidate data if available
      if (documentData.candidateEmail) {
        setEmailAddress(documentData.candidateEmail);
      }
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
        // Pre-fill email from candidate data if available
        if (response.data.data.candidateEmail) {
          setEmailAddress(response.data.data.candidateEmail);
        }
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
    if (step === 1 && !emailAddress) {
      setError('Please enter an email address');
      return;
    }
    if (step === 1 && !isValidEmail(emailAddress)) {
      setError('Please enter a valid email address');
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
    setSentDetails(null);
    setError('');
    setSuccess('');
  };

  // Handle close
  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle send appointment letter
  const handleSendLetter = async () => {
    if (!emailAddress) {
      setError('Please enter an email address');
      return;
    }
    if (!isValidEmail(emailAddress)) {
      setError('Please enter a valid email address');
      return;
    }

    setSending(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/api/appointment-letter/send/${documentId}`,
        {}, // Empty body as per API spec
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSentDetails(response.data.data);
        setSuccess(response.data.message || 'Appointment letter sent successfully!');
        setCanEditEmail(false);
        
        if (onSubmit) {
          onSubmit(response.data.data);
        }
        
        // Move to confirmation step
        setStep(2);
      }
    } catch (err) {
      console.error('Error sending appointment letter:', err);
      setError(err.response?.data?.message || 'Failed to send appointment letter');
    } finally {
      setSending(false);
    }
  };

  // Handle download letter
  const handleDownloadLetter = () => {
    if (documentDetails?.fileUrl) {
      window.open(`${BASE_URL}${documentDetails.fileUrl}`, '_blank');
    }
  };

  // Handle view letter
  const handleViewLetter = () => {
    if (documentDetails?.fileUrl) {
      window.open(`${BASE_URL}${documentDetails.fileUrl}`, '_blank');
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
                          label={documentDetails.status || 'generated'}
                          size="small"
                          sx={{
                            bgcolor: documentDetails.status === 'sent' ? '#d1fae5' : '#fef3c7',
                            color: documentDetails.status === 'sent' ? '#065f46' : '#92400e',
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

                {/* Next Steps */}
                {documentDetails.nextSteps && documentDetails.nextSteps.length > 0 && (
                  <Paper sx={{ p: 3, bgcolor: '#F0F7FF', border: '1px solid #90CAF9' }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScheduleIcon fontSize="small" color="primary" />
                      Next Steps
                    </Typography>
                    <List dense>
                      {documentDetails.nextSteps.map((step, index) => (
                        <ListItem key={index}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={step} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No document details found. Please select an appointment letter to send.
              </Alert>
            )}
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2">
                ✉️ Send Appointment Letter
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
                    <Typography variant="caption" color="textSecondary">File Name</Typography>
                    <Typography variant="body2">{documentDetails?.fileName || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Email Input */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Recipient Email Address
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter candidate's email address"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  disabled={!canEditEmail || sending}
                  error={emailAddress && !isValidEmail(emailAddress)}
                  helperText={emailAddress && !isValidEmail(emailAddress) ? 'Invalid email format' : ''}
                  InputProps={{
                    startAdornment: (
                      <EmailIcon sx={{ mr: 1, color: '#64748B', fontSize: 20 }} />
                    ),
                  }}
                  sx={{ mt: 1 }}
                />
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  The appointment letter will be sent to this email address
                </Typography>
              </Box>

              {/* Info Alert */}
              <Alert severity="info" icon={<InfoIcon />} sx={{ borderRadius: 2 }}>
                <Typography variant="body2">
                  Please verify the email address before sending. This action cannot be undone.
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
                ✅ Sent Confirmation
              </Typography>

              {sentDetails ? (
                <Card sx={{ mb: 3, border: '1px solid', borderColor: 'success.main' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: SUCCESS_COLOR }}>
                        <CheckCircleIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" color="success.main">
                          Letter Sent Successfully!
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Appointment letter has been sent to the candidate
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="textSecondary">Document ID</Typography>
                        <Typography variant="body2">{sentDetails.documentId}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="textSecondary">Sent To</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MailIcon fontSize="small" color="primary" />
                          <Typography variant="body2">{sentDetails.sentTo}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="textSecondary">Sent At</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScheduleIcon fontSize="small" color="primary" />
                          <Typography variant="body2">{formatDate(sentDetails.sentAt)}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="textSecondary">Status</Typography>
                        <Chip
                          label={sentDetails.status || 'sent'}
                          size="small"
                          color="success"
                          sx={{ height: 20, fontSize: '11px' }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadLetter}
                      sx={{ borderRadius: 1.5, textTransform: 'none' }}
                    >
                      Download Copy
                    </Button>
                  </CardActions>
                </Card>
              ) : (
                <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    No sent information available. The letter may not have been sent yet.
                  </Typography>
                </Alert>
              )}

              {/* Success Message */}
              {success && !sentDetails && (
                <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>
                  {success}
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
              Send Appointment Letter
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Email appointment letter to candidate
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
        {success && !sentDetails && (
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
              onClick={handleSendLetter}
              disabled={sending || !emailAddress || !isValidEmail(emailAddress)}
              startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
              sx={{
                background: 'linear-gradient(135deg, #164e63, #00B4D8)',
                minWidth: 150,
                '&:hover': {
                  background: 'linear-gradient(135deg, #0e3b4a, #0096b4)'
                }
              }}
            >
              {sending ? 'Sending...' : 'Send Letter'}
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

export default SendAppointmentLetter;