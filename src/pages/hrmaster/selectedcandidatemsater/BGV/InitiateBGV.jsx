import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  MenuItem,
  Grid,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Avatar,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Fingerprint as FingerprintIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  Gavel as GavelIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../../config/Config';

// Color constants
const PRIMARY_BLUE = '#00B4D8';

// Check types with icons and descriptions
const CHECK_TYPES = [
  { 
    type: 'identity', 
    label: 'Identity Verification', 
    icon: <FingerprintIcon />, 
    color: '#1976D2',
    description: 'Verify candidate identity documents'
  },
  { 
    type: 'address', 
    label: 'Address Verification', 
    icon: <HomeIcon />, 
    color: '#2E7D32',
    description: 'Verify current and permanent address'
  },
  { 
    type: 'education', 
    label: 'Education Verification', 
    icon: <SchoolIcon />, 
    color: '#7B1FA2',
    description: 'Verify educational qualifications'
  },
  { 
    type: 'employment', 
    label: 'Employment Verification', 
    icon: <BusinessIcon />, 
    color: '#F57C00',
    description: 'Verify previous employment history'
  },
  { 
    type: 'criminal', 
    label: 'Criminal Record Check', 
    icon: <GavelIcon />, 
    color: '#C62828',
    description: 'Check for criminal records'
  }
];

const InitiateBGV = ({ open, onClose, onSubmit }) => {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  
  // Data states
  const [candidates, setCandidates] = useState([]);
  const [offers, setOffers] = useState([]);
  const [fetchingCandidates, setFetchingCandidates] = useState(false);
  const [fetchingOffers, setFetchingOffers] = useState(false);
  
  // Form state
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [selectedOffer, setSelectedOffer] = useState('');
  const [initiatedBGV, setInitiatedBGV] = useState(null);
  
  // Error/Success state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const steps = ['Select Candidate', 'Select Offer', 'Confirm & Initiate'];

  // Fetch data on open
  useEffect(() => {
    if (open) {
      fetchSelectedCandidates();
    }
  }, [open]);

  // Fetch candidates with status 'selected'
  const fetchSelectedCandidates = async () => {
    setFetchingCandidates(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/candidates?status=selected`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setCandidates(response.data.data || []);
      } else {
        setError('Failed to fetch candidates');
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError(err.response?.data?.message || 'Failed to fetch candidates');
    } finally {
      setFetchingCandidates(false);
    }
  };

  // Fetch offers for selected candidate
  const fetchOffersForCandidate = async (candidateId) => {
    if (!candidateId) return;
    
    setFetchingOffers(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      // Try different endpoints for offers
      let response;
      
      // First try: get offers by candidate ID
      try {
        response = await axios.get(`${BASE_URL}/api/offers?candidateId=${candidateId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        // Second try: get all offers and filter on client side
        console.log('Trying base offers endpoint...');
        response = await axios.get(`${BASE_URL}/api/offers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      if (response.data.success) {
        // Filter offers for the selected candidate
        const candidateOffers = response.data.data.filter(offer => 
          offer.candidateId?._id === candidateId || offer.candidateId === candidateId
        );
        setOffers(candidateOffers);
        
        if (candidateOffers.length === 0) {
          setError('No offers found for this candidate');
        }
      } else {
        setOffers([]);
      }
    } catch (err) {
      console.error('Error fetching offers:', err);
      setOffers([]);
      // Don't show error for offers, just set empty array
    } finally {
      setFetchingOffers(false);
    }
  };

  // Handle candidate change
  const handleCandidateChange = async (e) => {
    const candidateId = e.target.value;
    setSelectedCandidate(candidateId);
    setSelectedOffer(''); // Reset offer when candidate changes
    setError('');
    
    if (candidateId) {
      await fetchOffersForCandidate(candidateId);
    } else {
      setOffers([]);
    }
  };

  // Handle offer change
  const handleOfferChange = (e) => {
    setSelectedOffer(e.target.value);
    setError('');
  };

  // Handle next step
  const handleNext = () => {
    if (step === 0 && !selectedCandidate) {
      setError('Please select a candidate');
      return;
    }
    if (step === 1 && !selectedOffer) {
      setError('Please select an offer');
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
    setSelectedCandidate('');
    setSelectedOffer('');
    setOffers([]);
    setInitiatedBGV(null);
    setError('');
    setSuccess('');
  };

  // Handle close
  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Handle initiate BGV
  const handleInitiateBGV = async () => {
    setSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/api/bgv/initiate`,
        {
          candidateId: selectedCandidate,
          offerId: selectedOffer
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setInitiatedBGV(response.data.data);
        setSuccess(response.data.message || 'Background verification initiated successfully!');
        
        if (onSubmit) {
          onSubmit(response.data.data);
        }
        
        // Auto close after success
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Error initiating BGV:', err);
      setError(err.response?.data?.message || 'Failed to initiate background verification');
    } finally {
      setSubmitting(false);
    }
  };

  // Get candidate details
  const getCandidateDetails = () => {
    return candidates.find(c => c._id === selectedCandidate);
  };

  // Get offer details
  const getOfferDetails = () => {
    return offers.find(o => o._id === selectedOffer);
  };

  const candidateDetails = getCandidateDetails();
  const offerDetails = getOfferDetails();

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2">
                👤 Select Candidate
              </Typography>
              
              {fetchingCandidates ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <FormControl fullWidth size="small">
                  <InputLabel>Select Candidate</InputLabel>
                  <Select
                    value={selectedCandidate}
                    onChange={handleCandidateChange}
                    label="Select Candidate"
                  >
                    <MenuItem value="">Choose a candidate</MenuItem>
                    {candidates.map((cand) => (
                      <MenuItem key={cand._id} value={cand._id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: PRIMARY_BLUE, fontSize: '0.75rem' }}>
                            {cand.firstName?.[0]}{cand.lastName?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">
                              {cand.firstName} {cand.lastName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {cand.candidateId} - {cand.email}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {candidateDetails && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Candidate Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Full Name</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {candidateDetails.firstName} {candidateDetails.lastName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Candidate ID</Typography>
                      <Typography variant="body2">{candidateDetails.candidateId}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Email</Typography>
                      <Typography variant="body2">{candidateDetails.email}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Phone</Typography>
                      <Typography variant="body2">{candidateDetails.phone}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2">
                📄 Select Offer
              </Typography>

              {!selectedCandidate ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Please select a candidate first to view available offers
                </Alert>
              ) : fetchingOffers ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <FormControl fullWidth size="small">
                  <InputLabel>Select Offer</InputLabel>
                  <Select
                    value={selectedOffer}
                    onChange={handleOfferChange}
                    label="Select Offer"
                    disabled={offers.length === 0}
                  >
                    <MenuItem value="">Choose an offer</MenuItem>
                    {offers.length > 0 ? (
                      offers.map((offer) => (
                        <MenuItem key={offer._id} value={offer._id}>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {offer.offerId || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Status: {offer.status || 'N/A'} 
                              {offer.createdAt && ` | Created: ${new Date(offer.createdAt).toLocaleDateString()}`}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">
                        <Typography variant="body2" color="textSecondary">
                          No offers available for this candidate
                        </Typography>
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              )}

              {offerDetails && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Offer Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Offer ID</Typography>
                      <Typography variant="body2" fontWeight={500}>{offerDetails.offerId || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Status</Typography>
                      <Chip
                        label={offerDetails.status || 'N/A'}
                        size="small"
                        sx={{
                          bgcolor: offerDetails.status === 'draft' ? '#fef3c7' : 
                                  offerDetails.status === 'sent' ? '#e3f2fd' : '#d1fae5',
                          color: offerDetails.status === 'draft' ? '#92400e' : 
                                 offerDetails.status === 'sent' ? '#1976d2' : '#065f46',
                          height: 20,
                          fontSize: '11px'
                        }}
                      />
                    </Grid>
                    {offerDetails.createdAt && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="textSecondary">Created At</Typography>
                        <Typography variant="body2">
                          {new Date(offerDetails.createdAt).toLocaleString()}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </Paper>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2">
                ✅ Confirm & Initiate
              </Typography>

              {/* Summary Card */}
              <Paper sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Candidate</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {candidateDetails?.firstName} {candidateDetails?.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">Candidate ID</Typography>
                    <Typography variant="body2">{candidateDetails?.candidateId}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">Offer ID</Typography>
                    <Typography variant="body2">{offerDetails?.offerId || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* BGV Checks Info */}
              <Paper sx={{ p: 2, bgcolor: '#F0F7FF', borderRadius: 2, border: '1px solid #90CAF9', mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon fontSize="small" color="primary" />
                  Background Verification Checks
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  The following checks will be initiated for this candidate:
                </Typography>
                <Grid container spacing={2}>
                  {CHECK_TYPES.map((check) => (
                    <Grid item xs={12} sm={6} key={check.type}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: check.color }}>{check.icon}</Box>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {check.label}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {check.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {/* Initiated BGV Info */}
              {initiatedBGV && (
                <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight={500}>
                    BGV Initiated Successfully!
                  </Typography>
                  <Typography variant="caption" display="block">
                    BGV ID: {initiatedBGV.bgvId}
                  </Typography>
                </Alert>
              )}

              {/* Info Alert */}
              <Alert severity="info" icon={<InfoIcon />} sx={{ borderRadius: 2 }}>
                <Typography variant="body2">
                  This will initiate background verification for the selected candidate.
                  The process may take 3-5 business days to complete.
                </Typography>
              </Alert>
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
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: 1, 
        borderColor: '#E0E0E0', 
        bgcolor: '#F8FAFC',
        px: 3,
        py: 2
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Initiate Background Verification
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Start BGV process for selected candidate
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, px: 3 }}>
        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {success && !initiatedBGV && (
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
        justifyContent: 'space-between'
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
              onClick={handleInitiateBGV}
              disabled={submitting || !selectedOffer}
              startIcon={submitting ? <CircularProgress size={20} /> : <SecurityIcon />}
              sx={{
                background: 'linear-gradient(135deg, #164e63, #00B4D8)',
                minWidth: 200,
                '&:hover': {
                  background: 'linear-gradient(135deg, #0e3b4a, #0096b4)'
                }
              }}
            >
              {submitting ? 'Initiating...' : 'Initiate BGV'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={step === 1 && offers.length === 0}
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

export default InitiateBGV;