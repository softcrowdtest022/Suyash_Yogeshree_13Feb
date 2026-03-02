import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  TextField,
  Grid,
  Box,
  Paper,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Badge
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Sms as SmsIcon,
  Link as LinkIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Preview as PreviewIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  MailOutline as MailOutlineIcon,
  Schedule as ScheduleIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../../config/Config';

const SendOfferLetter = ({ open, onClose, onSubmit, offerData = null }) => {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [offerDetails, setOfferDetails] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sendMethod, setSendMethod] = useState('email');
  const [emailContent, setEmailContent] = useState({
    subject: '',
    message: '',
    cc: '',
    bcc: ''
  });
  const [scheduleLater, setScheduleLater] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [sendCopyToSelf, setSendCopyToSelf] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [deliveryReport, setDeliveryReport] = useState(null);

  const steps = [
    'Review Details',
    'Communication Preferences',
    'Send & Confirm'
  ];

  const communicationMethods = [
    { value: 'email', label: 'Email', icon: <EmailIcon />, description: 'Send offer letter via email' },
    { value: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppIcon />, description: 'Send via WhatsApp (if number registered)' },
    { value: 'sms', label: 'SMS', icon: <SmsIcon />, description: 'Send SMS notification with link' },
    { value: 'portal', label: 'Candidate Portal', icon: <LinkIcon />, description: 'Generate link for candidate portal' }
  ];

  useEffect(() => {
    if (open && offerData) {
      setOfferDetails(offerData);
      fetchCandidateDetails(offerData.candidateId);
      initializeEmailContent(offerData);
    }
  }, [open, offerData]);

  const fetchCandidateDetails = async (candidateId) => {
    setFetchingDetails(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/candidates/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCandidateDetails(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching candidate details:', err);
      setError('Failed to fetch candidate details');
    } finally {
      setFetchingDetails(false);
    }
  };

  const initializeEmailContent = (offer) => {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    setEmailContent({
      subject: `Offer Letter from Suyash Enterprises - ${offer?.offerId || ''}`,
      message: `Dear Candidate,

We are pleased to offer you the position at Suyash Enterprises. Please find attached your offer letter.

Offer Details:
- Offer ID: ${offer?.offerId || ''}
- Date: ${today}
- Position: Machine Operator
- Joining Date: ${offer?.joiningDate ? new Date(offer.joiningDate).toLocaleDateString() : ''}

Please review the offer and confirm your acceptance at the earliest.

Best regards,
HR Team
Suyash Enterprises`,
      cc: '',
      bcc: ''
    });
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSendMethod('email');
    setScheduleLater(false);
    setScheduledDate('');
    setScheduledTime('');
    setSendCopyToSelf(true);
    setTermsAccepted(false);
    setDeliveryReport(null);
    setCopied(false);
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSendOffer = async () => {
    if (!termsAccepted) {
      setError('Please accept the terms before sending');
      return;
    }

    setSending(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/api/offers/${offer._id}/send`,
        {
          method: sendMethod,
          emailContent: sendMethod === 'email' ? emailContent : undefined,
          scheduleLater,
          scheduledDateTime: scheduleLater ? `${scheduledDate}T${scheduledTime}` : undefined,
          sendCopyToSelf
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess(response.data.message || 'Offer notification sent successfully!');
        setDeliveryReport({
          success: true,
          warning: response.data.warning,
          message: response.data.message
        });
        
        if (onSubmit) {
          onSubmit(response.data);
        }
        
        // Auto advance to next step after success
        setTimeout(() => {
          setActiveStep(2);
        }, 1000);
      }
    } catch (err) {
      console.error('Error sending offer:', err);
      setError(err.response?.data?.message || 'Failed to send offer');
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/candidate/offer/${offerDetails?._id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePreviewOffer = () => {
    window.open(`/offers/${offer?._id}/preview`, '_blank');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            {/* Candidate Summary Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                📋 Offer Summary
              </Typography>
              
              {fetchingDetails ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {/* Candidate Info */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: '#1976D2', width: 64, height: 64 }}>
                        {candidateDetails?.firstName?.charAt(0)}{candidateDetails?.lastName?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {candidateDetails?.firstName} {candidateDetails?.lastName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {candidateDetails?.email} • {candidateDetails?.phone}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip 
                            label={candidateDetails?.candidateId} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            label="Selected" 
                            size="small" 
                            color="success"
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        Offer ID
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {offerDetails?.offerId || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        Status
                      </Typography>
                      <Chip
                        label={offerDetails?.status || 'Approved'}
                        color="success"
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        Position
                      </Typography>
                      <Typography variant="body1">
                        {candidateDetails?.latestApplication?.jobId?.title || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        Joining Date
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {offerDetails?.joiningDate ? formatDate(offerDetails.joiningDate) : 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        Total CTC
                      </Typography>
                      <Typography variant="h6" color="#1976D2" fontWeight={600}>
                        {formatCurrency(offerDetails?.ctcDetails?.totalCtc)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        Monthly Gross
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(offerDetails?.ctcDetails?.gross)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Paper>

            {/* Contact Information Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                📞 Candidate Contact
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email Address"
                    secondary={candidateDetails?.email || 'Not available'}
                  />
                  {candidateDetails?.email && (
                    <Chip label="Verified" size="small" color="success" />
                  )}
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <SmsIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Phone Number"
                    secondary={candidateDetails?.phone || 'Not available'}
                  />
                  {candidateDetails?.phone && (
                    <Chip label="Verified" size="small" color="success" />
                  )}
                </ListItem>
              </List>
            </Paper>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            {/* Communication Method Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                📱 Select Communication Method
              </Typography>

              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup
                  value={sendMethod}
                  onChange={(e) => setSendMethod(e.target.value)}
                >
                  <Grid container spacing={2}>
                    {communicationMethods.map((method) => (
                      <Grid item xs={12} md={6} key={method.value}>
                        <Paper
                          sx={{
                            p: 2,
                            border: sendMethod === method.value ? '2px solid #1976D2' : '1px solid #E0E0E0',
                            borderRadius: 2,
                            cursor: 'pointer',
                            bgcolor: sendMethod === method.value ? '#E3F2FD' : '#FFFFFF',
                            '&:hover': {
                              borderColor: '#1976D2',
                              bgcolor: '#F5F5F5'
                            }
                          }}
                          onClick={() => setSendMethod(method.value)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ 
                              p: 1, 
                              borderRadius: '50%', 
                              bgcolor: sendMethod === method.value ? '#1976D2' : '#F5F5F5',
                              color: sendMethod === method.value ? '#FFFFFF' : '#757575'
                            }}>
                              {method.icon}
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {method.label}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {method.description}
                              </Typography>
                            </Box>
                            <Radio 
                              value={method.value} 
                              checked={sendMethod === method.value}
                              sx={{ ml: 'auto' }}
                            />
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </RadioGroup>
              </FormControl>
            </Paper>

            {/* Email Configuration Card */}
            {sendMethod === 'email' && (
              <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                  ✉️ Email Configuration
                </Typography>

                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Subject"
                    value={emailContent.subject}
                    onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
                  />

                  <TextField
                    fullWidth
                    label="Message"
                    multiline
                    rows={6}
                    value={emailContent.message}
                    onChange={(e) => setEmailContent({ ...emailContent, message: e.target.value })}
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="CC"
                        value={emailContent.cc}
                        onChange={(e) => setEmailContent({ ...emailContent, cc: e.target.value })}
                        placeholder="cc@example.com"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="BCC"
                        value={emailContent.bcc}
                        onChange={(e) => setEmailContent({ ...emailContent, bcc: e.target.value })}
                        placeholder="bcc@example.com"
                      />
                    </Grid>
                  </Grid>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={sendCopyToSelf}
                        onChange={(e) => setSendCopyToSelf(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Send a copy to myself"
                  />
                </Stack>
              </Paper>
            )}

            {/* Schedule Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                ⏰ Schedule Delivery
              </Typography>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={scheduleLater}
                    onChange={(e) => setScheduleLater(e.target.checked)}
                    color="primary"
                  />
                }
                label="Schedule for later"
              />

              {scheduleLater && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Date"
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Time"
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              )}
            </Paper>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            {/* Confirmation Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                ✅ Final Confirmation
              </Typography>

              {/* Summary Box */}
              <Box sx={{ 
                p: 3, 
                bgcolor: '#F8FAFC', 
                borderRadius: 2,
                mb: 3,
                border: '1px solid #E0E0E0'
              }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      Candidate
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {candidateDetails?.firstName} {candidateDetails?.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      Method
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {communicationMethods.find(m => m.value === sendMethod)?.icon}
                      <Typography variant="body1">
                        {communicationMethods.find(m => m.value === sendMethod)?.label}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      Recipient
                    </Typography>
                    <Typography variant="body1">
                      {sendMethod === 'email' ? candidateDetails?.email : candidateDetails?.phone}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      Schedule
                    </Typography>
                    <Typography variant="body1">
                      {scheduleLater ? `${scheduledDate} ${scheduledTime}` : 'Immediate'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Delivery Report */}
              {deliveryReport && (
                <Box sx={{ 
                  p: 3, 
                  bgcolor: deliveryReport.warning ? '#FFF3E0' : '#E8F5E9', 
                  borderRadius: 2,
                  mb: 3,
                  border: deliveryReport.warning ? '1px solid #FFB74D' : '1px solid #81C784'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    {deliveryReport.warning ? (
                      <WarningIcon sx={{ color: '#F57C00' }} />
                    ) : (
                      <CheckCircleIcon sx={{ color: '#388E3C' }} />
                    )}
                    <Typography variant="subtitle1" fontWeight={600} sx={{ 
                      color: deliveryReport.warning ? '#F57C00' : '#388E3C' 
                    }}>
                      {deliveryReport.warning ? 'Warning' : 'Success'}
                    </Typography>
                  </Box>
                  <Typography variant="body2" paragraph>
                    {deliveryReport.message}
                  </Typography>
                  {deliveryReport.warning && (
                    <Typography variant="body2" color="textSecondary">
                      Note: {deliveryReport.warning}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Preview Actions */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<PreviewIcon />}
                  onClick={handlePreviewOffer}
                  fullWidth
                >
                  Preview Offer
                </Button>
                <Button
                  variant="outlined"
                  startIcon={copied ? <CheckCircleIcon /> : <CopyIcon />}
                  onClick={handleCopyLink}
                  fullWidth
                  color={copied ? 'success' : 'primary'}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
              </Box>

              {/* Terms and Conditions */}
              <Box sx={{ 
                p: 2, 
                bgcolor: '#E3F2FD', 
                borderRadius: 1,
                border: '1px solid #90CAF9',
                mb: 3
              }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon fontSize="small" color="info" />
                  Terms & Conditions
                </Typography>
                <Typography variant="body2" paragraph>
                  By sending this offer letter, you confirm that:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>
                    <Typography variant="body2" color="textSecondary">
                      The offer has been approved by the relevant authorities
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" color="textSecondary">
                      All details in the offer letter are accurate and verified
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" color="textSecondary">
                      The candidate's contact information is correct
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" color="textSecondary">
                      You have the authority to send this offer
                    </Typography>
                  </li>
                </ul>
              </Box>

              {/* Confirmation Checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    I confirm that I have verified all information and agree to the terms above
                  </Typography>
                }
              />
            </Paper>
          </Stack>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{
        borderBottom: '1px solid #E0E0E0',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Send Offer Letter
          </Typography>
          {offerDetails?.offerId && (
            <Typography variant="caption" color="textSecondary">
              Offer ID: {offerDetails.offerId}
            </Typography>
          )}
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Error/Success Messages */}
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError('')}
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}
        
        {success && !deliveryReport && (
          <Alert 
            severity="success" 
            icon={<CheckCircleIcon />}
            onClose={() => setSuccess('')}
            sx={{ mb: 3 }}
          >
            {success}
          </Alert>
        )}

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 1 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ minHeight: 450 }}>
          {getStepContent(activeStep)}
        </Box>
      </DialogContent>

      <DialogActions sx={{
        px: 3,
        py: 2,
        borderTop: '1px solid #E0E0E0',
        backgroundColor: '#F8FAFC',
        justifyContent: 'space-between'
      }}>
        <Button onClick={handleClose}>
          Cancel
        </Button>

        <Box>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSendOffer}
              disabled={sending || !termsAccepted || (scheduleLater && (!scheduledDate || !scheduledTime))}
              startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
              sx={{
                backgroundColor: '#1976D2',
                '&:hover': { backgroundColor: '#1565C0' },
                minWidth: 200
              }}
            >
              {sending ? 'Sending...' : (scheduleLater ? 'Schedule Send' : 'Send Offer')}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
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

export default SendOfferLetter;