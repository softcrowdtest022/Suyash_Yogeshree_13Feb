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
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Checkbox,
  Card,
  CardContent,
  Tooltip,
  LinearProgress,
  InputAdornment
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Verified as VerifiedIcon,
  Edit as EditIcon,
  Description as DescriptionIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Assignment as AssignmentIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  GppGood as GppGoodIcon,
  Fingerprint as FingerprintIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../../config/Config';

const AcceptOffer = ({ open, onClose, onSubmit, offerData = null, offerToken = null }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [offerDetails, setOfferDetails] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [tokenValid, setTokenValid] = useState(true);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [signatureType, setSignatureType] = useState('text');
  const [signature, setSignature] = useState('');
  const [typedSignature, setTypedSignature] = useState('');
  const [confirmName, setConfirmName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [nextStep, setNextStep] = useState(null);
  const [uploadUrl, setUploadUrl] = useState(null);

  const steps = [
    'Verify & Review',
    'Accept Terms',
    'Sign & Confirm'
  ];

  useEffect(() => {
    if (open && (offerToken || offerData)) {
      if (offerData) {
        setOfferDetails(offerData);
        extractCandidateInfo(offerData);
        setConfirmName(offerData.candidateName || '');
      }
      if (offerToken) {
        verifyToken(offerToken);
      }
    }
  }, [open, offerToken, offerData]);

  useEffect(() => {
    // Calculate time remaining for token expiry
    if (tokenExpiry) {
      const interval = setInterval(() => {
        const now = new Date();
        const expiry = new Date(tokenExpiry);
        const diff = expiry - now;

        if (diff <= 0) {
          setTokenValid(false);
          setTimeRemaining('Expired');
          clearInterval(interval);
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          
          if (days > 0) {
            setTimeRemaining(`${days}d ${hours}h remaining`);
          } else if (hours > 0) {
            setTimeRemaining(`${hours}h ${minutes}m remaining`);
          } else {
            setTimeRemaining(`${minutes}m remaining`);
          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [tokenExpiry]);

  const verifyToken = async (token) => {
    setVerifying(true);
    setError('');
    
    try {
      // In a real implementation, this would verify the token
      const response = await axios.get(`${BASE_URL}/api/offers/verify-token/${token}`);
      
      if (response.data.success) {
        setOfferDetails(response.data.data);
        extractCandidateInfo(response.data.data);
        setConfirmName(response.data.data.candidateName || '');
        setTokenExpiry(response.data.data.tokenExpiry);
        setTokenValid(true);
      }
    } catch (err) {
      console.error('Error verifying token:', err);
      setError(err.response?.data?.message || 'Invalid or expired token');
      setTokenValid(false);
    } finally {
      setVerifying(false);
    }
  };

  const extractCandidateInfo = (data) => {
    if (data.candidateName) {
      const nameParts = data.candidateName.split(' ');
      setCandidateDetails({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        fullName: data.candidateName,
        email: data.candidateEmail || 'Not available',
        phone: data.candidatePhone || 'Not available'
      });
    }
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (activeStep === 0) {
      if (!tokenValid) {
        setError('Token is invalid or expired. Please request a new link.');
        return;
      }
    } else if (activeStep === 1) {
      if (!termsAccepted || !privacyAccepted || !declarationAccepted) {
        setError('Please accept all terms and conditions to proceed');
        return;
      }
    }
    
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSignature('');
    setTypedSignature('');
    setTermsAccepted(false);
    setPrivacyAccepted(false);
    setDeclarationAccepted(false);
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleAcceptOffer = async () => {
    // Validate signature
    if (!signature && !typedSignature) {
      setError('Please provide your signature');
      return;
    }

    if (signatureType === 'text' && typedSignature.toLowerCase() !== confirmName.toLowerCase()) {
      setError('Typed name must match your full name');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token') || offerToken;
      const signatureValue = signatureType === 'text' ? typedSignature : signature;
      
      const response = await axios.post(
        `${BASE_URL}/offers/${offerDetails?.offerId}/accept`,
        {
          token: offerToken,
          signature: signatureValue,
          signatureType: signatureType
        },
        { 
          headers: token ? { Authorization: `Bearer ${token}` } : {} 
        }
      );

      if (response.data.success) {
        setSuccess(response.data.message || 'Offer accepted successfully!');
        setNextStep(response.data.data?.nextStep);
        setUploadUrl(response.data.data?.uploadUrl);
        
        if (onSubmit) {
          onSubmit(response.data.data);
        }
        
        // Move to next step if document upload is required
        if (response.data.data?.nextStep === 'document_upload') {
          setTimeout(() => {
            // Could open document upload dialog here
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Error accepting offer:', err);
      setError(err.response?.data?.message || 'Failed to accept offer');
    } finally {
      setSubmitting(false);
    }
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

  const handleSignatureTypeChange = (event) => {
    setSignatureType(event.target.value);
    setSignature('');
    setTypedSignature('');
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            {/* Token Validity Banner */}
            {tokenExpiry && (
              <Alert 
                severity={tokenValid ? "info" : "warning"}
                icon={tokenValid ? <LockIcon /> : <WarningIcon />}
                sx={{ 
                  bgcolor: tokenValid ? '#E3F2FD' : '#FFEBEE',
                  border: tokenValid ? '1px solid #90CAF9' : '1px solid #FFCDD2'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: tokenValid ? '#1976D2' : '#D32F2F' }}>
                      {tokenValid ? 'Secure Access Token Verified' : 'Token Expired'}
                    </Typography>
                    <Typography variant="body2">
                      {tokenValid 
                        ? `This is a secure link. ${timeRemaining || 'Loading...'}`
                        : 'This offer link has expired. Please contact HR for a new link.'}
                    </Typography>
                  </Box>
                  {tokenValid && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GppGoodIcon color="success" />
                      <LinearProgress 
                        variant="determinate" 
                        value={75} 
                        sx={{ width: 100, borderRadius: 1 }}
                      />
                    </Box>
                  )}
                </Box>
              </Alert>
            )}

            {/* Candidate Verification Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                Identity Verification
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={confirmName}
                    onChange={(e) => setConfirmName(e.target.value)}
                    placeholder="Enter your full name as per documents"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    Please enter your name exactly as it appears on your official documents
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 1, height: '100%' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Expected Name
                    </Typography>
                    <Typography variant="h6" color="#1976D2">
                      {candidateDetails?.fullName || 'Not available'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <VerifiedIcon fontSize="small" color="success" />
                      <Typography variant="caption" color="textSecondary">
                        As per our records
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Offer Summary Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                Offer Summary
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="textSecondary">
                    Position
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {offerDetails?.position || offerDetails?.offerDetails?.designation || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="textSecondary">
                    Department
                  </Typography>
                  <Typography variant="body1">
                    {offerDetails?.department || offerDetails?.offerDetails?.department || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="textSecondary">
                    Joining Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(offerDetails?.joiningDate || offerDetails?.offerDetails?.joiningDate)}
                  </Typography>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="textSecondary">
                    Total CTC
                  </Typography>
                  <Typography variant="body1" fontWeight={600} color="#1976D2">
                    {formatCurrency(offerDetails?.ctcDetails?.totalCtc)}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#F8FAFC', borderRadius: 1 }}>
                <SecurityIcon color="primary" />
                <Typography variant="body2" color="textSecondary">
                  By proceeding, you confirm that you are {candidateDetails?.fullName || 'the intended recipient'} and have the authority to accept this offer.
                </Typography>
              </Box>
            </Paper>

            {/* Document Checklist */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                Documents Required for Joining
              </Typography>

              <Grid container spacing={2}>
                {[
                  'Educational Certificates',
                  'Previous Employment Letters',
                  'Identity Proof (Aadhar/PAN)',
                  'Address Proof',
                  'Passport Size Photographs',
                  'Bank Account Details'
                ].map((doc, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DescriptionIcon fontSize="small" color="action" />
                      <Typography variant="body2">{doc}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            {/* Terms and Conditions Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                Terms and Conditions
              </Typography>

              <Box sx={{ maxHeight: 300, overflow: 'auto', mb: 3, p: 2, bgcolor: '#F8FAFC', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  1. Employment Terms
                </Typography>
                <Typography variant="body2" paragraph>
                  The employment is subject to a probation period of {offerDetails?.offerDetails?.probationPeriod || '6'} months. 
                  During this period, either party may terminate employment with {offerDetails?.offerDetails?.noticePeriod || '30'} days notice.
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  2. Compensation
                </Typography>
                <Typography variant="body2" paragraph>
                  The total CTC of {formatCurrency(offerDetails?.ctcDetails?.totalCtc)} per annum includes all components 
                  as detailed in the offer letter. Salary will be credited on the last working day of each month.
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  3. Confidentiality
                </Typography>
                <Typography variant="body2" paragraph>
                  You agree to maintain confidentiality of company information and trade secrets during and after employment.
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  4. Background Verification
                </Typography>
                <Typography variant="body2" paragraph>
                  This offer is contingent upon successful background verification. Any discrepancies found may lead to 
                  termination of employment.
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  5. Company Policies
                </Typography>
                <Typography variant="body2" paragraph>
                  You agree to abide by all company policies, codes of conduct, and rules as amended from time to time.
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  6. Intellectual Property
                </Typography>
                <Typography variant="body2" paragraph>
                  Any intellectual property created during employment shall be the sole property of the company.
                </Typography>
              </Box>

              {/* Acceptance Checkboxes */}
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I have read and agree to the <strong>Terms and Conditions</strong> of employment
                    </Typography>
                  }
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I consent to the <strong>Privacy Policy</strong> and allow the company to process my personal data
                    </Typography>
                  }
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={declarationAccepted}
                      onChange={(e) => setDeclarationAccepted(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I declare that all information provided is true and correct to the best of my knowledge
                    </Typography>
                  }
                />
              </Stack>
            </Paper>

            {/* Important Notice */}
            <Alert severity="warning" icon={<WarningIcon />}>
              <Typography variant="subtitle2" gutterBottom>
                Please read carefully before proceeding
              </Typography>
              <Typography variant="body2">
                Accepting this offer creates a legally binding contract between you and Suyash Enterprises. 
                Make sure you have read and understood all terms before proceeding.
              </Typography>
            </Alert>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            {/* Signature Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                Digital Signature
              </Typography>

              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <FormLabel component="legend">Signature Method</FormLabel>
                <RadioGroup
                  row
                  value={signatureType}
                  onChange={handleSignatureTypeChange}
                >
                  <FormControlLabel 
                    value="text" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EditIcon fontSize="small" />
                        <Typography>Type Name</Typography>
                      </Box>
                    } 
                  />
                  <FormControlLabel 
                    value="draw" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FingerprintIcon fontSize="small" />
                        <Typography>Draw Signature</Typography>
                      </Box>
                    } 
                  />
                </RadioGroup>
              </FormControl>

              {signatureType === 'text' ? (
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Type your full name"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    placeholder={candidateDetails?.fullName || 'Enter your name'}
                    error={typedSignature && typedSignature.toLowerCase() !== confirmName.toLowerCase()}
                    helperText={
                      typedSignature && typedSignature.toLowerCase() !== confirmName.toLowerCase()
                        ? 'Name must match your confirmed name above'
                        : 'This will serve as your electronic signature'
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EditIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ mb: 3 }}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      height: 150, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: '#F8FAFC',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: '#F0F0F0'
                      }
                    }}
                  >
                    <Typography color="textSecondary">
                      Click to draw your signature (Canvas implementation)
                    </Typography>
                  </Paper>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    Use mouse or touch to draw your signature above
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Signature Preview */}
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VerifiedIcon color="primary" fontSize="small" />
                  Signature Preview
                </Typography>
                
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'white', 
                  borderRadius: 1, 
                  border: '1px dashed #1976D2',
                  fontFamily: signatureType === 'text' ? 'cursive' : 'inherit',
                  fontSize: '1.2rem',
                  textAlign: 'center',
                  minHeight: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {signatureType === 'text' ? (
                    typedSignature || 'Your signature will appear here'
                  ) : (
                    signature || 'Draw your signature above'
                  )}
                </Box>
              </Box>

              {/* Confirmation Summary */}
              <Box sx={{ mt: 3, p: 2, bgcolor: '#E3F2FD', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Acceptance Summary
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      Offer ID
                    </Typography>
                    <Typography variant="body2">{offerDetails?.offerId}</Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      Date
                    </Typography>
                    <Typography variant="body2">{formatDate(new Date())}</Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">
                      Accepted By
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {candidateDetails?.fullName}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Paper>

            {/* Next Steps Preview */}
            {nextStep === 'document_upload' && (
              <Alert severity="info" icon={<CloudUploadIcon />}>
                <Typography variant="subtitle2" gutterBottom>
                  Next Step: Document Upload
                </Typography>
                <Typography variant="body2">
                  After acceptance, you'll be redirected to upload your documents.
                </Typography>
                {uploadUrl && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mt: 1 }}
                    href={uploadUrl}
                    target="_blank"
                  >
                    Upload Documents
                  </Button>
                )}
              </Alert>
            )}
          </Stack>
        );

      default:
        return 'Unknown step';
    }
  };

  if (verifying) {
    return (
      <Dialog open={open} maxWidth="md" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, flexDirection: 'column', gap: 2 }}>
            <CircularProgress />
            <Typography color="textSecondary">Verifying secure link...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, minHeight: '80vh' } }}
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
            Accept Offer Letter
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
        
        {success && (
          <Alert 
            severity="success" 
            icon={<CheckCircleIcon />}
            onClose={() => setSuccess('')}
            sx={{ mb: 3 }}
          >
            {success}
          </Alert>
        )}

        {/* Token Invalid Banner */}
        {!tokenValid && (
          <Alert 
            severity="warning" 
            icon={<WarningIcon />}
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={handleClose}>
                Contact HR
              </Button>
            }
          >
            This offer link has expired. Please contact HR to request a new link.
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
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 2
      }}>
        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                onClick={handleAcceptOffer}
                disabled={submitting || !tokenValid}
                startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                sx={{
                  backgroundColor: '#2E7D32',
                  '&:hover': { backgroundColor: '#1B5E20' },
                  minWidth: 200
                }}
              >
                {submitting ? 'Processing...' : 'Accept & Sign Offer'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!tokenValid}
                sx={{
                  backgroundColor: '#1976D2',
                  '&:hover': { backgroundColor: '#1565C0' }
                }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>

        {/* Legal Notice */}
        <Typography variant="caption" color="textSecondary" align="center">
          By clicking {activeStep === steps.length - 1 ? 'Accept & Sign Offer' : 'Next'}, 
          you agree to the terms and conditions and confirm that this constitutes a legally binding 
          electronic signature under the Information Technology Act, 2000.
        </Typography>
      </DialogActions>
    </Dialog>
  );
};

export default AcceptOffer;