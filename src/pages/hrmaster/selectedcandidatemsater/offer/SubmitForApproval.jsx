import React, { useState, useEffect } from 'react';
import {
  // Layout components
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  Paper,
  Stack,
  Typography,
  Grid,
  Box,
  Divider,
  Alert,

  // Form components
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,

  // Feedback components
  CircularProgress,
  Snackbar,

  // Buttons and actions
  Button,
  IconButton,

  // Surfaces
  styled,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Padding
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../../config/Config';

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

// Custom Step Icon with better styling
const StepIcon = ({ active, completed, icon }) => {
  const getIcon = () => {
    if (icon === 1) return <PersonIcon fontSize="small" />;
    if (icon === 2) return <AttachMoneyIcon fontSize="small" />;
    if (icon === 3) return <DescriptionIcon fontSize="small" />;
    return icon;
  };

  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        backgroundColor: completed || active ? '#1976D2' : '#E0E0E0',
        color: completed || active ? 'white' : '#9E9E9E',
        transition: 'all 0.2s ease',
        boxShadow: active ? '0 0 0 3px rgba(25, 118, 210, 0.2)' : 'none',
        '& svg': {
          fontSize: 18
        }
      }}
    >
      {completed ? <CheckCircleIcon fontSize="small" /> : getIcon()}
    </Box>
  );
};

const SubmitForApproval = ({ open, onClose, onComplete, candidateData = null }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchingOffers, setFetchingOffers] = useState(false);
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offerDetails, setOfferDetails] = useState(null);
  const [candidateInfo, setCandidateInfo] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [stepErrors, setStepErrors] = useState({});
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Steps definition
  const steps = ['Select Offer', 'Offer Summary', 'CTC Breakdown', 'Terms & Confirmation'];

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  };

  // Show snackbar helper
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Close snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Reset all state when dialog closes
  const resetState = () => {
    setActiveStep(0);
    setRemarks('');
    setConfirmSubmit(false);
    setSelectedOffer(null);
    setOfferDetails(null);
    setCandidateInfo(null);
    setOffers([]);
    setError('');
    setSuccess('');
    setResponseData(null);
    setStepErrors({});
    setLoading(false);
    setFetchingOffers(false);
  };

  // Fetch offers when component opens
  useEffect(() => {
    if (open) {
      console.log('Dialog opened, fetching offers...');
      console.log('Candidate data received:', candidateData);

      // Reset state first
      resetState();

      // If we have candidate data, fetch offers for that candidate
      if (candidateData) {
        setCandidateInfo(candidateData);
        const candidateId = candidateData.id || candidateData._id || candidateData.candidateId;
        console.log('Fetching offers for candidate ID:', candidateId);
        fetchCandidateOffers(candidateId);
      } else {
        fetchAllOffers();
      }
    }
  }, [open, candidateData]);

  // Add cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      resetState();
    };
  }, []);

  const fetchAllOffers = async () => {
    setFetchingOffers(true);
    setError('');
    try {
      const token = getAuthToken();
      console.log('Fetching all offers from:', `${BASE_URL}/api/offers?status=initiated`);

      const response = await axios.get(`${BASE_URL}/api/offers?status=initiated`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });

      console.log('All offers response:', response.data);

      if (response.data.success) {
        // Handle the nested structure
        let offersArray = [];

        if (response.data.data?.offers && Array.isArray(response.data.data.offers)) {
          offersArray = response.data.data.offers;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          offersArray = response.data.data;
        } else if (Array.isArray(response.data)) {
          offersArray = response.data;
        }

        // Since we already filtered by status=initiated in the URL, 
        // we might not need to filter again, but let's keep it for safety
        const initiatedOffers = offersArray.filter(offer => {
          if (!offer) return false;
          const status = offer.status?.toLowerCase() || '';
          return status === 'initiated' || status === 'draft';
        });

        setOffers(initiatedOffers);
        if (initiatedOffers.length === 0) {
          showSnackbar('No initiated offers found', 'info');
        }
      } else {
        setOffers([]);
        showSnackbar('Failed to fetch offers', 'error');
      }
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError('Failed to fetch offers');
      setOffers([]);
      showSnackbar('Error fetching offers: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setFetchingOffers(false);
    }
  };

  // Check the specific offer
  const checkOfferStatus = async (offerId) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${BASE_URL}/api/offers/${offerId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      console.log('Offer status check:', response.data);
    } catch (err) {
      console.error('Error checking offer:', err);
    }
  };

  // Call this with your offer ID: "69a2ab088e2ba86f0f681771" or "OFF-2026-00041"

  // In your fetchCandidateOffers function, add more detailed logging
  const fetchCandidateOffers = async (candidateId) => {
    setFetchingOffers(true);
    setError('');
    try {
      const token = getAuthToken();
      console.log('Fetching offers for candidate:', `${BASE_URL}/api/offers/${candidateId}`);

      const response = await axios.get(`${BASE_URL}/api/offers/${candidateId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });

      console.log('Candidate offers response:', response.data);

      if (response.data.success) {
        // Handle the nested structure: data.offers is the array
        let offersArray = [];

        // Check different possible structures
        if (response.data.data?.offers && Array.isArray(response.data.data.offers)) {
          // Structure: { data: { offers: [...] } }
          offersArray = response.data.data.offers;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Structure: { data: [...] }
          offersArray = response.data.data;
        } else if (Array.isArray(response.data)) {
          // Structure: direct array
          offersArray = response.data;
        }

        console.log('Raw offers array:', offersArray);

        // Filter offers with status 'initiated' (case insensitive)
        const initiatedOffers = offersArray.filter(offer => {
          if (!offer) return false;
          const status = offer.status?.toLowerCase() || '';
          return status === 'initiated' || status === 'draft';
        });

        console.log('Filtered initiated offers:', initiatedOffers);
        setOffers(initiatedOffers);

        // If there's exactly one offer, select it automatically
        if (initiatedOffers.length === 1) {
          console.log('Auto-selecting the only offer:', initiatedOffers[0]);
          handleOfferSelect(initiatedOffers[0]);
          showSnackbar('Offer auto-selected', 'info');
        } else if (initiatedOffers.length === 0) {
          console.log('No initiated offers found');
          showSnackbar('No initiated offers found for this candidate', 'info');
        }
      } else {
        console.log('API returned success: false');
        setOffers([]);
        showSnackbar('Failed to fetch offers for this candidate', 'error');
      }
    } catch (err) {
      console.error('Error fetching candidate offers:', err);
      setError('Failed to fetch offers for this candidate');
      setOffers([]);
      showSnackbar('Error fetching offers: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setFetchingOffers(false);
    }
  };



  const fetchOfferDetails = async (offerId) => {
    setLoading(true);
    setError('');
    try {
      // Since we already have the offers list, find the selected offer in the existing data
      const selectedOfferData = offers.find(o => (o._id === offerId || o.id === offerId));

      if (selectedOfferData) {
        console.log('Using existing offer data:', selectedOfferData);

        // Create a response-like structure
        const mockResponse = {
          success: true,
          data: selectedOfferData
        };

        setOfferDetails(mockResponse);

        // Extract candidate info
        if (selectedOfferData.candidate) {
          setCandidateInfo(selectedOfferData.candidate);
        } else if (selectedOfferData.candidateId) {
          // Handle case where candidate is nested differently
          const candidateInfo = {
            name: selectedOfferData.candidateId?.name ||
              `${selectedOfferData.firstName || ''} ${selectedOfferData.lastName || ''}`.trim(),
            email: selectedOfferData.email,
            phone: selectedOfferData.phone,
            candidateId: selectedOfferData.candidateId?._id || selectedOfferData.candidateId,
            position: selectedOfferData.job?.title
          };
          setCandidateInfo(candidateInfo);
        }
        
        showSnackbar('Offer details loaded successfully', 'success');
      } else {
        setError('Offer details not found');
        showSnackbar('Offer details not found', 'error');
      }
    } catch (err) {
      console.error('Error processing offer details:', err);
      setError('Failed to load offer details');
      showSnackbar('Failed to load offer details', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update handleOfferSelect to use the existing data


  const handleOfferSelect = (offer) => {
    console.log('Selected offer:', offer);
    setSelectedOffer(offer);
    fetchOfferDetails(offer._id || offer.id);
  };

  const handleOfferChange = (e) => {
    const offerId = e.target.value;
    if (Array.isArray(offers)) {
      const offer = offers.find(o => (o._id === offerId || o.id === offerId));
      if (offer) {
        handleOfferSelect(offer);
        showSnackbar(`Offer selected: ${offer.offerId || offer._id}`, 'success');
      }
    }
  };

  // Validate current step
  const validateStep = (step) => {
    const errors = {};

    if (step === 0) {
      if (!selectedOffer) {
        errors.offer = 'Please select an offer';
        showSnackbar('Please select an offer to continue', 'warning');
      }
    } else if (step === 3) {
      if (!confirmSubmit) {
        errors.confirmSubmit = 'Please confirm before submitting';
        showSnackbar('Please confirm before submitting', 'warning');
      }
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
      setError('');
      showSnackbar(`Moving to step ${activeStep + 2}: ${steps[activeStep + 1]}`, 'info');
    } else {
      setError('Please select an offer to continue');
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
    showSnackbar(`Moving back to step ${activeStep}: ${steps[activeStep - 1]}`, 'info');
  };

  const handleRemarksChange = (e) => {
    setRemarks(e.target.value);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmitForApproval = async () => {
    if (!validateStep(3)) {
      setError('Please confirm before submitting');
      return;
    }

    const offerId = selectedOffer?._id || selectedOffer?.id || selectedOffer?.offerId;
    if (!offerId) {
      setError('Offer ID is missing');
      showSnackbar('Offer ID is missing', 'error');
      return;
    }

    setLoading(true);
    setError('');
    setResponseData(null);

    try {
      const token = getAuthToken();

      // Construct the API URL
      const apiUrl = `${BASE_URL}/api/offers/${offerId}/submit-approval`;

      console.log('Submitting for approval to:', apiUrl);
      console.log('Request body:', { remarks });

      const response = await axios.post(
        apiUrl,
        { remarks },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Submit approval response:', response.data);

      if (response.data.success) {
        setResponseData(response.data);
        setSuccess(response.data.message || 'Offer submitted for approval successfully!');
        showSnackbar(response.data.message || 'Offer submitted for approval successfully!', 'success');

        // Prepare updated data for parent component
        const updatedData = {
          id: candidateInfo?.id || candidateInfo?._id || selectedOffer?.candidateId,
          status: 'Submitted',
          offerId: response.data.data?.offerId || offerId,
          approvalFlowId: response.data.data?.approvalFlowId,
          submittedAt: new Date().toISOString(),
          remarks: remarks
        };

        // Wait a moment to show success message before closing
        setTimeout(() => {
          if (onComplete) {
            onComplete(updatedData);
          }
          // Reset all state before closing
          resetState();
          onClose();
        }, 2000);
      } else {
        showSnackbar('Submission failed: ' + (response.data.message || 'Unknown error'), 'error');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error submitting for approval:', err);

      let errorMessage = 'Failed to submit for approval';
      if (err.response) {
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
        console.error('Error response data:', err.response.data);
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your network connection.';
      } else {
        errorMessage = err.message || 'Failed to submit for approval';
      }
      
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not Set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft': return 'default';
      case 'initiated': return 'info';
      case 'pending':
      case 'pending_approval': return 'warning';
      case 'submitted': return 'info';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  // Get data from offer details
  const getOfferValue = (path, defaultValue = 'N/A') => {
    if (!offerDetails?.data) return defaultValue;

    const keys = path.split('.');
    let value = offerDetails.data;

    for (const key of keys) {
      if (value === null || value === undefined) return defaultValue;
      value = value[key];
    }

    return value !== null && value !== undefined ? value : defaultValue;
  };

  // Get candidate information
  // Get candidate information
  const getCandidateName = () => {
    // First check if we have candidateInfo set
    if (candidateInfo) {
      if (candidateInfo.name) return candidateInfo.name;
      if (candidateInfo.firstName) {
        return `${candidateInfo.firstName} ${candidateInfo.lastName || ''}`.trim();
      }
    }

    // If not, try to get from offerDetails
    if (offerDetails?.data) {
      const offer = offerDetails.data;

      // Check for candidate object
      if (offer.candidate) {
        return offer.candidate.name ||
          `${offer.candidate.firstName || ''} ${offer.candidate.lastName || ''}`.trim();
      }

      // Check for candidateId object with details
      if (offer.candidateId && typeof offer.candidateId === 'object') {
        return offer.candidateId.name ||
          `${offer.candidateId.firstName || ''} ${offer.candidateId.lastName || ''}`.trim();
      }

      // Check for direct fields
      if (offer.firstName) {
        return `${offer.firstName} ${offer.lastName || ''}`.trim();
      }

      if (offer.name) return offer.name;
    }

    return 'Candidate Name';
  };

  const getCandidateId = () => {
    if (candidateInfo?.candidateId) return candidateInfo.candidateId;
    if (candidateInfo?.id) return candidateInfo.id;

    if (offerDetails?.data) {
      const offer = offerDetails.data;

      if (offer.candidate?._id) return offer.candidate._id;
      if (offer.candidate?.candidateId) return offer.candidate.candidateId;
      if (offer.candidateId?._id) return offer.candidateId._id;
      if (offer.candidateId && typeof offer.candidateId === 'string') return offer.candidateId;
      if (offer._id) return offer._id;
    }

    return 'CAN-XXX';
  };

  const getCandidateEmail = () => {
    if (candidateInfo?.email) return candidateInfo.email;

    if (offerDetails?.data) {
      const offer = offerDetails.data;

      if (offer.candidate?.email) return offer.candidate.email;
      if (offer.candidateId?.email) return offer.candidateId.email;
      if (offer.email) return offer.email;
    }

    return '';
  };

  const getCandidatePhone = () => {
    if (candidateInfo?.phone) return candidateInfo.phone;
    if (candidateInfo?.mobile) return candidateInfo.mobile;

    if (offerDetails?.data) {
      const offer = offerDetails.data;

      if (offer.candidate?.phone) return offer.candidate.phone;
      if (offer.candidate?.mobile) return offer.candidate.mobile;
      if (offer.candidateId?.phone) return offer.candidateId.phone;
      if (offer.phone) return offer.phone;
      if (offer.mobile) return offer.mobile;
    }

    return '';
  };

  const getPosition = () => {
    if (candidateInfo?.position) return candidateInfo.position;

    if (offerDetails?.data) {
      const offer = offerDetails.data;

      if (offer.job?.title) return offer.job.title;
      if (offer.candidate?.latestApplication?.jobId?.title) {
        return offer.candidate.latestApplication.jobId.title;
      }
      if (offer.offerDetails?.designation) return offer.offerDetails.designation;
      if (offer.position) return offer.position;
    }

    return 'Not Specified';
  };

  const getJoiningDate = () => {
    if (offerDetails?.data?.joiningDate) return offerDetails.data.joiningDate;
    return null;
  };

  const getReportingTo = () => {
    if (offerDetails?.data?.reportingTo) return offerDetails.data.reportingTo;
    if (offerDetails?.data?.offerDetails?.reportingTo) return offerDetails.data.offerDetails.reportingTo;
    return 'Not Specified';
  };

  const getProbationPeriod = () => {
    if (offerDetails?.data?.probationPeriod) return offerDetails.data.probationPeriod;
    if (offerDetails?.data?.offerDetails?.probationPeriod) return offerDetails.data.offerDetails.probationPeriod;
    return 6;
  };

  const getCtcDetails = () => {
    if (offerDetails?.data?.ctcDetails) return offerDetails.data.ctcDetails;
    return null;
  };

  // Render success response data
  const renderResponseData = () => {
    if (!responseData) return null;

    const { data, message } = responseData;

    return (
      <Paper sx={{
        p: 2,
        mt: 2,
        bgcolor: '#F0F7FF',
        border: '1px solid #1976D2',
        borderRadius: 1
      }}>
        <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600 }}>
          ✅ Submission Successful
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="caption" color="textSecondary" display="block">
              Offer ID
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {data.offerId}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="caption" color="textSecondary" display="block">
              Status
            </Typography>
            <Chip
              label={data.status}
              color={getStatusColor(data.status)}
              size="small"
              sx={{ fontWeight: 500, mt: 0.5 }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="caption" color="textSecondary" display="block">
              Approval Flow ID
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-all', fontSize: '0.8rem' }}>
              {data.approvalFlowId}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  // Render step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Paper sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
            <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
              Select Offer for Approval
            </Typography>

            {fetchingOffers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                {/* Offer Selection Dropdown */}
                {Array.isArray(offers) && offers.length > 0 ? (
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Select Offer *</InputLabel>
                    <Select
                      value={selectedOffer?._id || selectedOffer?.id || ''}
                      onChange={handleOfferChange}
                      label="Select Offer *"
                      error={!!stepErrors.offer}
                    >
                      {offers.map((offer) => {
                        if (!offer) return null;

                        // Try to get candidate name from different possible locations
                        let candidateName = 'Unknown Candidate';
                        if (offer.candidateId) {
                          if (typeof offer.candidateId === 'object') {
                            candidateName = offer.candidateId.name ||
                              `${offer.candidateId.firstName || ''} ${offer.candidateId.lastName || ''}`.trim() ||
                              'Unknown Candidate';
                          } else {
                            candidateName = `Candidate ID: ${offer.candidateId}`;
                          }
                        }

                        return (
                          <MenuItem key={offer._id || offer.id} value={offer._id || offer.id}>
                             {offer.offerId || offer._id} ({offer.status || 'Unknown'})
                          </MenuItem>
                        );
                      })}
                    </Select>
                    {stepErrors.offer && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                        {stepErrors.offer}
                      </Typography>
                    )}
                  </FormControl>
                ) : (
                  !fetchingOffers && (
                    <Alert severity="info" sx={{ borderRadius: 1, mb: 2 }}>
                      No initiated offers found for this candidate.
                    </Alert>
                  )
                )}

                {/* Selected Offer Preview */}
                {selectedOffer && (
                  <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 1 }}>
                    <Grid container spacing={4}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Candidate Name
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {getCandidateName()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Candidate ID
                        </Typography>
                        <Typography variant="body2">
                          {getCandidateId()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Email
                        </Typography>
                        <Typography variant="body2">{getCandidateEmail()}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Phone
                        </Typography>
                        <Typography variant="body2">{getCandidatePhone()}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Position
                        </Typography>
                        <Typography variant="body2">{getPosition()}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Offer Status
                        </Typography>
                        <Chip
                          label={selectedOffer.status || 'Draft'}
                          color={getStatusColor(selectedOffer.status)}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </>
            )}
          </Paper>
        );

      //       case 1:
      // return (
      //   <Stack spacing={2}>
      //     <Paper sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
      //       <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
      //         📋 Offer Summary
      //       </Typography>

      //       {loading ? (
      //         <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
      //           <CircularProgress size={24} />
      //         </Box>
      //       ) : (
      //         <Grid container spacing={8} sx={{ pb: -4 }}> {/* Changed from spacing={2} to spacing={1} */}
      //           <Grid item xs={12}>
      //             <Box sx={{ mb: 1 }}> {/* Reduced from mb: 1.5 to mb: 1 */}
      //               <Typography variant="body2" fontWeight={600}>
      //                 {getCandidateName()}
      //               </Typography>
      //               <Typography variant="caption" color="textSecondary">
      //                 ID: {getCandidateId()} | {getCandidateEmail()} | {getCandidatePhone()}
      //               </Typography>
      //             </Box>
      //           </Grid>

      //           <Grid item xs={12} sm={6}>
      //             <Typography variant="caption" color="textSecondary" display="block">
      //               Offer ID
      //             </Typography>
      //             <Typography variant="body2" fontWeight={500}>
      //               {selectedOffer?.offerId || selectedOffer?._id || 'N/A'}
      //             </Typography>
      //           </Grid>

      //           <Grid item xs={12} sm={6}>
      //             <Typography variant="caption" color="textSecondary" display="block">
      //               Current Status
      //             </Typography>
      //             <Chip
      //               label={getOfferValue('status', 'Draft')}
      //               color={getStatusColor(getOfferValue('status'))}
      //               size="small"
      //               sx={{ fontWeight: 500, mt: 0.5 }}
      //             />
      //           </Grid>

      //           <Grid item xs={12} sm={6}>
      //             <Typography variant="caption" color="textSecondary" display="block">
      //               Position
      //             </Typography>
      //             <Typography variant="body2">
      //               {getPosition()}
      //             </Typography>
      //           </Grid>

      //           <Grid item xs={12} sm={6}>
      //             <Typography variant="caption" color="textSecondary" display="block">
      //               Joining Date
      //             </Typography>
      //             <Typography variant="body2">
      //               {formatDate(getJoiningDate())}
      //             </Typography>
      //           </Grid>

      //           <Grid item xs={12} sm={6}>
      //             <Typography variant="caption" color="textSecondary" display="block">
      //               Reporting To
      //             </Typography>
      //             <Typography variant="body2">
      //               {getReportingTo()}
      //             </Typography>
      //           </Grid>

      //           <Grid item xs={12} sm={6}>
      //             <Typography variant="caption" color="textSecondary" display="block">
      //               Probation Period
      //             </Typography>
      //             <Typography variant="body2">
      //               {getProbationPeriod()} months
      //             </Typography>
      //           </Grid>
      //         </Grid>
      //       )}
      //     </Paper>
      //   </Stack>
      // );
      case 1:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                📋 Offer Summary
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Grid container spacing={2}>

                  {/* Row 1: Candidate Name, Offer ID, Current Status */}
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Candidate Name
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {getCandidateName()}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Offer ID
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedOffer?.offerId || selectedOffer?._id || 'N/A'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Current Status
                    </Typography>
                    <Chip
                      label={getOfferValue('status', 'Draft')}
                      color={getStatusColor(getOfferValue('status'))}
                      size="small"
                      sx={{ fontWeight: 500, mt: 0.5 }}
                    />
                  </Grid>

                  {/* Row 2: Position, Joining Date, Reporting To, Probation Period */}
                  <Grid item xs={12} sm={3}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Position
                    </Typography>
                    <Typography variant="body2">
                      {getPosition()}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Joining Date
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(getJoiningDate())}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Reporting To
                    </Typography>
                    <Typography variant="body2">
                      {getReportingTo()}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Probation Period
                    </Typography>
                    <Typography variant="body2">
                      {getProbationPeriod()} months
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Paper>
          </Stack>
        );
      case 2:
        // Declare at the very beginning
        const ctcDetails = getCtcDetails();

        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                Annual CTC Breakdown
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 1}}>
                  <CircularProgress size={24} />
                </Box>
              ) : ctcDetails ? (
                <>
                  {/* Monthly Components Section */}
                  <Typography variant="caption" sx={{ color: '#1976D2', fontWeight: 600, mb: 1, display: 'block' }}>
                    Monthly Components
                  </Typography>
                  <Grid container spacing={4} sx={{ mb: 2 }}>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Basic + DA
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {formatCurrency(ctcDetails.basic)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        HRA
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(ctcDetails.hra)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Conveyance Allowance
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(ctcDetails.conveyanceAllowance)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Medical Allowance
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(ctcDetails.medicalAllowance)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Special Allowance
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(ctcDetails.specialAllowance)}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                        <Typography variant="body2" fontWeight={600} color="#1976D2">
                          Monthly Gross: {formatCurrency(ctcDetails.gross)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 1 }} />

                  {/* Annual Components Section */}
                  <Typography variant="caption" sx={{ color: '#1976D2', fontWeight: 600, display: 'block' }}>
                    Annual Components
                  </Typography>
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Bonus
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(ctcDetails.bonus)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Employer PF
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(ctcDetails.employerPf)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Employer ESI
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(ctcDetails.employerEsi || 0)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Gratuity
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(ctcDetails.gratuity)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Basic + DA (Annual)
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(ctcDetails.basic * 12)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        HRA (Annual)
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(ctcDetails.hra * 12)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Conveyance (Annual)
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(ctcDetails.conveyanceAllowance * 12)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Medical (Annual)
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(ctcDetails.medicalAllowance * 12)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Special (Annual)
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(ctcDetails.specialAllowance * 12)}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider />

                  {/* Total CTC Section */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="#1976D2">
                      Total CTC
                    </Typography>
                    <Typography variant="h6" color="#1976D2" fontWeight={700}>
                      {formatCurrency(ctcDetails.totalCtc)}
                    </Typography>
                  </Box>

                  {/* Summary Box */}
                  <Box sx={{ mt: 1, p: 1.5, bgcolor: '#F0F7FF', borderRadius: 1, border: '1px dashed #1976D2' }}>
                    <Grid container spacing={8}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Monthly Gross
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="#1976D2">
                          {formatCurrency(ctcDetails.gross)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Annual Gross
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="#1976D2">
                          {formatCurrency(ctcDetails.gross * 12)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Monthly CTC
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(ctcDetails.totalCtc / 12)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Annual CTC
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(ctcDetails.totalCtc)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </>
              ) : (
                <Alert severity="info" sx={{ borderRadius: 1 }}>
                  CTC details not available
                </Alert>
              )}
            </Paper>
          </Stack>
        );

    case 3:
  const ctcDetailsForPreview = getCtcDetails();
  return (
    <Stack spacing={2}>

        {/* Preview Section */}
      {selectedOffer && (
        <Paper sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 1, border: '1px solid #1976D2' }}>
          <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
             Submission Preview
          </Typography>

          <Grid container spacing={6}>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary" display="block" sx={{ fontSize: '0.7rem' }}>
                Candidate Name
              </Typography>
              <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.9rem' }}>
                {getCandidateName()}
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary" display="block" sx={{ fontSize: '0.7rem' }}>
                Offer ID
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                {selectedOffer?.offerId || selectedOffer?._id}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary" display="block" sx={{ fontSize: '0.7rem' }}>
                Total CTC
              </Typography>
              <Typography variant="body2" fontWeight={600} color="#1976D2" sx={{ fontSize: '0.95rem' }}>
                {ctcDetailsForPreview ? formatCurrency(ctcDetailsForPreview.totalCtc) : 'N/A'}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary" display="block" sx={{ fontSize: '0.7rem' }}>
                Joining Date
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                {formatDate(getJoiningDate())}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary" display="block" sx={{ fontSize: '0.7rem' }}>
                Position
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                {getPosition()}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary" display="block" sx={{ fontSize: '0.7rem' }}>
                Status
              </Typography>
              <Chip
                label={selectedOffer.status || 'Draft'}
                color={getStatusColor(selectedOffer.status)}
                size="small"
                sx={{ fontWeight: 500, height: 22, fontSize: '0.75rem' }}
              />
            </Grid>
          </Grid>
        </Paper>
      )}
     
 {/* Terms & Conditions Card */}
      <Paper sx={{ p: 2.5, bgcolor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
        

        {/* Remarks Section */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ color: '#1976D2', fontWeight: 600, fontSize: '0.9rem' }}>
          Additiona Remark
        </Typography>
        
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Enter any additional remarks or comments..."
            value={remarks}
            onChange={handleRemarksChange}
            size="small"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                fontSize: '0.85rem',
                backgroundColor: '#FAFAFA'
              }
            }}
          />
        </Box>

        {/* Warning Message */}
        <Box sx={{
          p: 1.5,
          bgcolor: '#FFF8E7',
          borderRadius: 1,
          border: '1px solid #FFB74D',
          mb: 2.5
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <WarningIcon sx={{ color: '#F57C00', fontSize: 18 }} />
            <Typography variant="subtitle2" sx={{ color: '#F57C00', fontSize: '0.85rem', fontWeight: 600 }}>
              Important Notice
            </Typography>
          </Box>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', ml: 3.5 }}>
            Once submitted, this offer will be sent to the approver and cannot be modified until reviewed.
            Please ensure all details are accurate before proceeding.
          </Typography>
        </Box>
<Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 2, fontWeight: 600, fontSize: '0.9rem' }}>
          Terms & Conditions
        </Typography>

        {/* Confirmation List */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" paragraph sx={{ fontSize: '0.85rem', color: '#424242', mb: 1.5 }}>
            By submitting this offer for approval, you confirm that:
          </Typography>

          <Box component="ul" sx={{ pl: 2, mb: 0 }}>
            {[
              'All the CTC components have been calculated correctly as per company policy',
              'The candidate has been properly interviewed and selected for the position',
              'The offer details have been verified with HR',
              'Any special approvals required for this CTC range have been obtained',
              'The joining date has been confirmed with the candidate and is feasible'
            ].map((item, index) => (
              <Typography 
                component="li" 
                variant="body2" 
                key={index} 
                sx={{ 
                  mb: 0.75, 
                  fontSize: '0.8rem',
                  color: '#555',
                  lineHeight: 1.4
                }}
              >
                {item}
              </Typography>
            ))}
          </Box>
        </Box>

        <Divider />
        {/* Confirmation Checkbox */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: 1.5,
          p: 1.5,
          bgcolor: confirmSubmit ? '#F0F7FF' : 'transparent',
          borderRadius: 1,
          transition: 'background-color 0.2s'
        }}>
          <input
            type="checkbox"
            id="confirmSubmit"
            checked={confirmSubmit}
            onChange={(e) => setConfirmSubmit(e.target.checked)}
            style={{ 
              width: 18, 
              height: 18, 
              cursor: 'pointer',
              marginTop: 2
            }}
          />
          <Box>
            <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#333' }}>
              I confirm that all the above information is accurate
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
              I understand that this action cannot be undone
            </Typography>
          </Box>
        </Box>
        {stepErrors.confirmSubmit && (
          <Typography variant="caption" color="error" sx={{ mt: 1, ml: 3.5, display: 'block' }}>
            {stepErrors.confirmSubmit}
          </Typography>
        )}
      </Paper>

    </Stack>
  );
      default:
        return null;
    }
  };

  return (
    <>
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
          py: 0.5,
          px: 2,
          backgroundColor: '#F8FAFC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography
            variant="body1"  // Changed from subtitle1 to body1
            fontWeight={600}
            sx={{ color: '#101010' }}
            component="span"  // Explicitly set as span instead of h6
          >
            Submit Offer for Approval
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        {/* 🔥 Modern Stepper with Gradient Connector */}
        {!responseData && (
          <Box sx={{ px: 2, pt: 1, backgroundColor: '#F8FAFC' }}>
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              connector={<ColorConnector />}
              // sx={{ mb: 1 }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel StepIconComponent={StepIcon}>
                    <Typography fontWeight={500} fontSize="0.8rem">{label}</Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}

        <DialogContent sx={{ p: 2, overflow: 'auto', backgroundColor: '#F5F7FA' }}>
          {!responseData ? (
            renderStepContent(activeStep)
          ) : (
            <Box sx={{ py: 1 }}>
              <Alert
                severity="success"
                icon={<CheckCircleIcon />}
                sx={{ mb: 2, borderRadius: 1 }}
              >
                {success}
              </Alert>
              {renderResponseData()}
            </Box>
          )}

          {/* Error Messages */}
          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 1 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{
          px: 2,
          py: 1.5,
          borderTop: '1px solid #E0E0E0',
          backgroundColor: '#F8FAFC',
          justifyContent: 'space-between'
        }}>
          {!responseData ? (
            <>
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
                    onClick={handleSubmitForApproval}
                    disabled={loading || !confirmSubmit}
                    size="small"
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                    sx={{
                      backgroundColor: '#1976D2',
                      '&:hover': { backgroundColor: '#1565C0' },
                      minWidth: 160
                    }}
                  >
                    {loading ? 'Submitting...' : 'Submit for Approval'}
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
            </>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <Button
                variant="contained"
                onClick={handleClose}
                size="small"
                sx={{
                  backgroundColor: '#1976D2',
                  '&:hover': { backgroundColor: '#1565C0' }
                }}
              >
                Close
              </Button>
            </Box>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            borderRadius: 1,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SubmitForApproval;