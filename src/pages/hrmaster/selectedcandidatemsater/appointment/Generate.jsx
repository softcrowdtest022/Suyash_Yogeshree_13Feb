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
  StepLabel,
  TextField,
  Divider,
  alpha,
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
  School as SchoolIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Send as SendIcon,
  AttachMoney as MoneyIcon,
  BusinessCenter as BusinessIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../../config/Config';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Color constants
const PRIMARY_BLUE = '#00B4D8';
const SUCCESS_COLOR = '#2E7D32';
const INFO_COLOR = '#0288D1';

const GenerateAppointmentLetter = ({ open, onClose, onSubmit }) => {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  
  // Data states
  const [candidates, setCandidates] = useState([]);
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [fetchingCandidates, setFetchingCandidates] = useState(false);
  const [fetchingOffers, setFetchingOffers] = useState(false);
  
  // Form state
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [selectedOffer, setSelectedOffer] = useState('');
  const [joiningDate, setJoiningDate] = useState(null);
  const [generatedLetter, setGeneratedLetter] = useState(null);
  
  // Error/Success state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const steps = ['Select Candidate', 'Select Offer & Date', 'Generate & Download'];

  // Fetch candidates on open
  useEffect(() => {
    if (open) {
      fetchCandidates();
    }
  }, [open]);

  // Fetch offers when candidate is selected
  useEffect(() => {
    if (selectedCandidate) {
      fetchOffersForCandidate(selectedCandidate);
    } else {
      setFilteredOffers([]);
      setSelectedOffer('');
    }
  }, [selectedCandidate]);

  // Fetch candidates
  const fetchCandidates = async () => {
    setFetchingCandidates(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      // Fetch candidates who are selected or have offers
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
    setFetchingOffers(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Try different endpoints to get offers for the candidate
      let response;
      
      // First try: get offers by candidate ID
      try {
        response = await axios.get(`${BASE_URL}/api/offers?candidateId=${candidateId}&status=accepted`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        // Second try: get all offers and filter on client side
        console.log('Trying base offers endpoint...');
        response = await axios.get(`${BASE_URL}/api/offers?status=accepted`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      if (response.data.success) {
        // Filter offers for the selected candidate
        const candidateOffers = response.data.data.filter(offer => 
          (offer.candidateId?._id === candidateId || offer.candidateId === candidateId) &&
          offer.status?.toLowerCase() === 'accepted'
        );
        
        setFilteredOffers(candidateOffers);
        setOffers(response.data.data || []);
        
        // Reset selected offer when candidate changes
        setSelectedOffer('');
        
        if (candidateOffers.length === 0) {
          setError('No accepted offers found for this candidate');
        }
      } else {
        setFilteredOffers([]);
      }
    } catch (err) {
      console.error('Error fetching offers:', err);
      setFilteredOffers([]);
      setError('Failed to fetch offers for this candidate');
    } finally {
      setFetchingOffers(false);
    }
  };

  // Handle candidate change
  const handleCandidateChange = (e) => {
    setSelectedCandidate(e.target.value);
    setSelectedOffer(''); // Reset offer when candidate changes
    setError('');
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
    if (step === 1 && !joiningDate) {
      setError('Please select a joining date');
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
    setJoiningDate(null);
    setGeneratedLetter(null);
    setError('');
    setSuccess('');
  };

  // Handle close
  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Handle generate appointment letter
  const handleGenerateLetter = async () => {
    setSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Format joining date as YYYY-MM-DD
      const formattedDate = joiningDate.toISOString().split('T')[0];
      
      const response = await axios.post(
        `${BASE_URL}/api/appointment-letter/generate`,
        {
          candidateId: selectedCandidate,
          offerId: selectedOffer,
          joiningDate: formattedDate
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setGeneratedLetter(response.data.data);
        setSuccess(response.data.message || 'Appointment letter generated successfully!');
        
        if (onSubmit) {
          onSubmit(response.data.data);
        }
      }
    } catch (err) {
      console.error('Error generating appointment letter:', err);
      setError(err.response?.data?.message || 'Failed to generate appointment letter');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle download letter
  const handleDownloadLetter = () => {
    if (generatedLetter?.fileUrl) {
      window.open(`${BASE_URL}${generatedLetter.fileUrl}`, '_blank');
    }
  };

  // Handle view letter
  const handleViewLetter = () => {
    if (generatedLetter?.fileUrl) {
      window.open(`${BASE_URL}${generatedLetter.fileUrl}`, '_blank');
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
                Select Candidate
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

            <Alert severity="info" icon={<InfoIcon />} sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                Select a candidate who has accepted the offer to generate an appointment letter.
              </Typography>
            </Alert>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2">
                Select Offer & Joining Date
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
                <>
                  <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                    <InputLabel>Select Offer</InputLabel>
                    <Select
                      value={selectedOffer}
                      onChange={handleOfferChange}
                      label="Select Offer"
                      disabled={filteredOffers.length === 0}
                    >
                      <MenuItem value="">Choose an offer</MenuItem>
                      {filteredOffers.length > 0 ? (
                        filteredOffers.map((offer) => (
                          <MenuItem key={offer._id} value={offer._id}>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {offer.offerId || 'N/A'} - {offer.designation || offer.position || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Status: {offer.status} | 
                                {offer.salaryRange && ` Salary: ${offer.salaryRange.currency || 'INR'} ${offer.salaryRange.min || 0} - ${offer.salaryRange.max || 0}`}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled value="">
                          <Typography variant="body2" color="textSecondary">
                            No accepted offers available for this candidate
                          </Typography>
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>

                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      label="Joining Date"
                      value={joiningDate ? joiningDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setJoiningDate(new Date(e.target.value))}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ 
                        min: new Date().toISOString().split('T')[0] // Can't select past dates
                      }}
                      sx={{ mb: 2 }}
                    />
                  </LocalizationProvider>
                </>
              )}

              {offerDetails && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Offer Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Offer ID</Typography>
                      <Typography variant="body2" fontWeight={500}>{offerDetails.offerId || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Designation</Typography>
                      <Typography variant="body2">{offerDetails.designation || offerDetails.position || 'N/A'}</Typography>
                    </Grid>
                    {offerDetails.salaryRange && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="textSecondary">Salary Range</Typography>
                          <Typography variant="body2">
                            {offerDetails.salaryRange.currency || 'INR'} {offerDetails.salaryRange.min || 0} - {offerDetails.salaryRange.max || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="textSecondary">Status</Typography>
                          <Chip
                            label={offerDetails.status}
                            size="small"
                            sx={{
                              bgcolor: offerDetails.status === 'accepted' ? '#d1fae5' : '#fef3c7',
                              color: offerDetails.status === 'accepted' ? '#065f46' : '#92400e',
                              height: 20,
                              fontSize: '11px'
                            }}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Box>
              )}
            </Paper>

            <Alert severity="info" icon={<InfoIcon />} sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                Select the accepted offer and provide the expected joining date for the candidate.
              </Typography>
            </Alert>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2">
                ✅ Generate Appointment Letter
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
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">Designation</Typography>
                    <Typography variant="body2">{offerDetails?.designation || offerDetails?.position || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">Joining Date</Typography>
                    <Typography variant="body2">
                      {joiningDate ? joiningDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Generated Letter Card */}
              {generatedLetter ? (
                <Card sx={{ mb: 3, border: '1px solid', borderColor: 'success.main' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: SUCCESS_COLOR }}>
                        <CheckCircleIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" color="success.main">
                          Letter Generated Successfully!
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {generatedLetter.fileName}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">Document ID</Typography>
                        <Typography variant="body2">{generatedLetter.documentId}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">File Size</Typography>
                        <Typography variant="body2">
                          {generatedLetter.fileSize ? `${(generatedLetter.fileSize / 1024).toFixed(2)} KB` : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">Generated At</Typography>
                        <Typography variant="body2">
                          {new Date(generatedLetter.generatedAt).toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">Status</Typography>
                        <Chip
                          label={generatedLetter.status}
                          size="small"
                          color="success"
                          sx={{ height: 20, fontSize: '11px' }}
                        />
                      </Grid>
                    </Grid>

                    {generatedLetter.nextSteps && generatedLetter.nextSteps.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Next Steps:
                        </Typography>
                        <List dense>
                          {generatedLetter.nextSteps.map((step, index) => (
                            <ListItem key={index}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <CheckCircleIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={step} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadLetter}
                      sx={{
                        background: 'linear-gradient(135deg, #164e63, #00B4D8)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #0e3b4a, #0096b4)'
                        }
                      }}
                    >
                      Download Appointment Letter
                    </Button>
                  </CardActions>
                </Card>
              ) : (
                <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3, borderRadius: 2 }}>
                  <Typography variant="body2">
                    Click the button below to generate the appointment letter. The letter will be generated based on the offer details and joining date.
                  </Typography>
                </Alert>
              )}

              {/* Success Message */}
              {success && !generatedLetter && (
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
              Generate Appointment Letter
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Create appointment letter for selected candidate
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
        {success && !generatedLetter && (
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
              onClick={handleGenerateLetter}
              disabled={submitting || generatedLetter}
              startIcon={submitting ? <CircularProgress size={20} /> : <DescriptionIcon />}
              sx={{
                background: 'linear-gradient(135deg, #164e63, #00B4D8)',
                minWidth: 200,
                '&:hover': {
                  background: 'linear-gradient(135deg, #0e3b4a, #0096b4)'
                }
              }}
            >
              {submitting ? 'Generating...' : 'Generate Letter'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={step === 1 && filteredOffers.length === 0}
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

export default GenerateAppointmentLetter;