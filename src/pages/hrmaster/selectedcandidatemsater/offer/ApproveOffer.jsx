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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,

  // Feedback components
  CircularProgress,

  // Buttons and actions
  Button,
  IconButton,

  // Surfaces
  styled,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  Description as DescriptionIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../../config/Config';

// 🔥 Modern Stepper Connector with Gradient (same as reference)
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

// Custom Step Icon with better styling (same as reference but with approval icons)
const StepIcon = ({ active, completed, icon }) => {
  const getIcon = () => {
    if (icon === 1) return <AssignmentIcon fontSize="small" />;
    if (icon === 2) return <AttachMoneyIcon fontSize="small" />;
    if (icon === 3) return <ThumbUpIcon fontSize="small" />;
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

const ApproveOffer = ({ open, onClose, onComplete, offerData = null }) => {
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
  const [comments, setComments] = useState('');
  const [signature, setSignature] = useState(null);
  const [signatureName, setSignatureName] = useState('');
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [stepErrors, setStepErrors] = useState({});

  // Steps definition
  const steps = ['Select Offer for Approval', 'Offer Summary', 'CTC Review', 'Approve Offer'];

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  };

  // Fetch offers when component opens
  useEffect(() => {
    if (open) {
      console.log('Dialog opened, fetching pending offers...');
      resetState();
      fetchPendingOffers();
    }
  }, [open]);

  // Handle offerData prop separately
  useEffect(() => {
    if (offerData && open) {
      console.log('offerData received in ApproveOffer:', offerData);
      
      // Check if offerData contains an offer ID directly
      if (offerData.offerId || offerData._id || offerData.id) {
        const offerId = offerData.offerId || offerData._id || offerData.id;
        console.log('Fetching offer details for ID:', offerId);
        fetchOfferDetails(offerId);
      } else if (offerData.candidateId) {
        // If we have candidate data but no offer ID, we need to fetch offers for this candidate
        console.log('Candidate data received, will need to select from offers');
      }
    }
  }, [offerData, open]);

  const resetState = () => {
    setActiveStep(0);
    setComments('');
    setSignature(null);
    setSignatureName('');
    setConfirmApprove(false);
    setSelectedOffer(null);
    setOfferDetails(null);
    setCandidateInfo(null);
    setError('');
    setSuccess('');
    setResponseData(null);
    setStepErrors({});
  };

  const fetchPendingOffers = async () => {
    setFetchingOffers(true);
    setError('');
    try {
      const token = getAuthToken();
      console.log('Fetching pending offers...');
      
      const response = await axios.get(`${BASE_URL}/api/offers?status=pending_approval`, {
        headers: { 
          Authorization: token ? `Bearer ${token}` : '' 
        }
      });
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        let offersArray = [];
        
        // Try different possible paths to find the offers array
        if (response.data.data?.offers && Array.isArray(response.data.data.offers)) {
          offersArray = response.data.data.offers;
          console.log('Found offers at data.data.offers');
        } 
        else if (response.data.data && Array.isArray(response.data.data)) {
          offersArray = response.data.data;
          console.log('Found offers at data.data (direct array)');
        }
        else if (response.data.offers && Array.isArray(response.data.offers)) {
          offersArray = response.data.offers;
          console.log('Found offers at data.offers');
        }
        
        setOffers(offersArray);
        console.log(`Set ${offersArray.length} offers to state`);

        // If we have offerData with a specific offer ID, try to select it
        if (offerData && (offerData.offerId || offerData._id || offerData.id)) {
          const targetOfferId = offerData.offerId || offerData._id || offerData.id;
          const matchingOffer = offersArray.find(o => 
            o._id === targetOfferId || o.id === targetOfferId || o.offerId === targetOfferId
          );
          
          if (matchingOffer) {
            console.log('Auto-selecting matching offer:', matchingOffer);
            handleOfferSelect(matchingOffer);
          }
        }
      } else {
        setOffers([]);
      }
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError('Failed to fetch pending offers');
      setOffers([]);
    } finally {
      setFetchingOffers(false);
    }
  };
const fetchOfferDetails = async (offerId) => {
  setLoading(true);
  setError('');
  try {
    const token = getAuthToken();
    
    // Try using axios with params to avoid URL path issues
    const apiUrl = `${BASE_URL}/api/offers`;
    console.log('Fetching offer details with params for ID:', offerId);
    
    const response = await axios.get(apiUrl, {
      params: {
        id: offerId
      },
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    });

    console.log('Offer details response:', response.data);

    if (response.data.success) {
      // If the API returns an array of offers, find the matching one
      let offerData = response.data.data;
      
      // Handle different response structures
      if (Array.isArray(offerData)) {
        offerData = offerData.find(o => o._id === offerId || o.id === offerId);
      } else if (offerData?.offers && Array.isArray(offerData.offers)) {
        offerData = offerData.offers.find(o => o._id === offerId || o.id === offerId);
      }
      
      if (offerData) {
        setOfferDetails({ success: true, data: offerData });
        setSelectedOffer(offerData);
        
        // Extract candidate info
        if (offerData.candidateId) {
          setCandidateInfo(offerData.candidateId);
        }
      } else {
        setError('Offer not found in response');
      }
    } else {
      setError('Failed to fetch offer details');
    }
  } catch (err) {
    console.error('Error fetching offer details:', err);
    
    if (err.response?.status === 404) {
      setError(`Offer not found with ID: ${offerId}`);
    } else {
      setError(err.response?.data?.message || 'Failed to fetch offer details');
    }
  } finally {
    setLoading(false);
  }
};

 const handleOfferSelect = (offer) => {
  console.log('Selected offer:', offer);
  console.log('Offer ID type:', typeof offer._id);
  console.log('Offer ID value:', offer._id);
  console.log('Offer ID length:', offer._id?.length);
  
  setSelectedOffer(offer);
  
  // Extract candidate info directly from the offer if available
  if (offer.candidateId) {
    if (typeof offer.candidateId === 'object') {
      setCandidateInfo(offer.candidateId);
    } else {
      // If candidateId is just an ID, we might need to fetch candidate details separately
      console.log('Candidate ID reference:', offer.candidateId);
    }
  }
  
  // Make sure we're passing the full ID without any modification
  const fullOfferId = offer._id || offer.id;
  if (fullOfferId) {
    console.log('Full offer ID to fetch:', fullOfferId);
    fetchOfferDetails(fullOfferId);
  } else {
    setError('Invalid offer ID');
  }
};

 const handleOfferChange = (e) => {
  const offerId = e.target.value;
  console.log('Selected offer ID from dropdown:', offerId);
  console.log('Selected offer ID length:', offerId?.length);
  
  const offer = offers.find(o => (o._id === offerId || o.id === offerId));
  if (offer) {
    console.log('Found matching offer:', offer);
    handleOfferSelect(offer);
  } else {
    console.log('No matching offer found for ID:', offerId);
    setError('Selected offer not found in the list');
  }
};

  // Handle signature upload
  const handleSignatureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSignatureName(file.name);

      const reader = new FileReader();
      reader.onloadend = () => {
        // Get base64 string without the data URL prefix
        const base64String = reader.result.split(',')[1];
        setSignature(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSignature = () => {
    setSignature(null);
    setSignatureName('');
  };

  // Validate current step
  const validateStep = (step) => {
    const errors = {};

    if (step === 0) {
      if (!selectedOffer) {
        errors.offer = 'Please select an offer to approve';
      }
    } else if (step === 3) {
      if (!comments.trim()) {
        errors.comments = 'Please add approval comments';
      }
      if (!signature) {
        errors.signature = 'Please upload your signature';
      }
      if (!confirmApprove) {
        errors.confirmApprove = 'Please confirm before approving';
      }
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
      setError('');
    } else {
      setError('Please complete all required fields to continue');
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleApproveOffer = async () => {
    if (!validateStep(3)) {
      setError('Please complete all required fields');
      return;
    }

    const offerId = selectedOffer?._id || selectedOffer?.id;
    if (!offerId) {
      setError('Offer ID is missing');
      return;
    }

    setLoading(true);
    setError('');
    setResponseData(null);

    try {
      const token = getAuthToken();

      // Construct the API URL
      const apiUrl = `${BASE_URL}/api/offers/${offerId}/approve`;

      // Prepare request body
      const requestBody = {
        comments: comments.trim(),
        signature: `data:image/png;base64,${signature}`
      };

      console.log('Approving offer at:', apiUrl);
      console.log('Request body:', { comments: requestBody.comments, signature: '[BASE64_IMAGE]' });

      const response = await axios.post(
        apiUrl,
        requestBody,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Approve offer response:', response.data);

      if (response.data.success) {
        setResponseData(response.data);
        setSuccess(response.data.message || 'Offer approved successfully!');

        // Prepare updated data for parent component
        const updatedData = {
          id: offerId,
          offerId: response.data.data?.offerId || offerId,
          status: response.data.data?.status || 'approved',
          approvalStatus: response.data.data?.approvalStatus || 'completed',
          comments: comments,
          approvedAt: new Date().toISOString()
        };

        // Wait a moment to show success message before closing
        setTimeout(() => {
          if (onComplete) {
            onComplete(updatedData);
          }
          handleClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Error approving offer:', err);

      if (err.response) {
        setError(err.response.data?.message || `Server error: ${err.response.status}`);
        console.error('Error response data:', err.response.data);
      } else if (err.request) {
        setError('No response from server. Please check your network connection.');
      } else {
        setError(err.message || 'Failed to approve offer');
      }
    } finally {
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
// Get data from offer details - updated for new response structure
const getOfferValue = (path, defaultValue = 'N/A') => {
  if (!offerDetails?.data) {
    // Try to get from selectedOffer directly
    if (selectedOffer) {
      const keys = path.split('.');
      let value = selectedOffer;
      for (const key of keys) {
        if (value === null || value === undefined) return defaultValue;
        value = value[key];
      }
      return value !== null && value !== undefined ? value : defaultValue;
    }
    return defaultValue;
  }

  // Handle the case where data is an array of offers
  if (Array.isArray(offerDetails.data)) {
    const matchingOffer = offerDetails.data.find(o => o._id === selectedOffer?._id);
    if (matchingOffer) {
      const keys = path.split('.');
      let value = matchingOffer;
      for (const key of keys) {
        if (value === null || value === undefined) return defaultValue;
        value = value[key];
      }
      return value !== null && value !== undefined ? value : defaultValue;
    }
    return defaultValue;
  }
  
  // Handle the case where data has offers array
  if (offerDetails.data?.offers && Array.isArray(offerDetails.data.offers)) {
    const matchingOffer = offerDetails.data.offers.find(o => o._id === selectedOffer?._id);
    if (matchingOffer) {
      const keys = path.split('.');
      let value = matchingOffer;
      for (const key of keys) {
        if (value === null || value === undefined) return defaultValue;
        value = value[key];
      }
      return value !== null && value !== undefined ? value : defaultValue;
    }
    return defaultValue;
  }
  
  // Direct data object
  const keys = path.split('.');
  let value = offerDetails.data;
  for (const key of keys) {
    if (value === null || value === undefined) return defaultValue;
    value = value[key];
  }
  return value !== null && value !== undefined ? value : defaultValue;
};

// Get candidate information - updated for new structure
const getCandidateName = () => {
  // Check candidateInfo state first
  if (candidateInfo) {
    if (candidateInfo.name) return candidateInfo.name;
    if (candidateInfo.firstName) {
      return `${candidateInfo.firstName} ${candidateInfo.lastName || ''}`.trim();
    }
  }

  // Check selectedOffer for candidate object
  if (selectedOffer?.candidate) {
    if (selectedOffer.candidate.name) return selectedOffer.candidate.name;
    if (selectedOffer.candidate.firstName) {
      return `${selectedOffer.candidate.firstName} ${selectedOffer.candidate.lastName || ''}`.trim();
    }
  }

  // Try to get from offerDetails
  if (offerDetails?.data) {
    let offerData = offerDetails.data;
    
    // Handle array case
    if (Array.isArray(offerData)) {
      const matchingOffer = offerData.find(o => o._id === selectedOffer?._id);
      if (matchingOffer?.candidate) {
        if (matchingOffer.candidate.name) return matchingOffer.candidate.name;
        if (matchingOffer.candidate.firstName) {
          return `${matchingOffer.candidate.firstName} ${matchingOffer.candidate.lastName || ''}`.trim();
        }
      }
    }
    
    // Handle offers array case
    if (offerData?.offers && Array.isArray(offerData.offers)) {
      const matchingOffer = offerData.offers.find(o => o._id === selectedOffer?._id);
      if (matchingOffer?.candidate) {
        if (matchingOffer.candidate.name) return matchingOffer.candidate.name;
        if (matchingOffer.candidate.firstName) {
          return `${matchingOffer.candidate.firstName} ${matchingOffer.candidate.lastName || ''}`.trim();
        }
      }
    }
  }

  return 'Candidate Name';
};

const getCandidateId = () => {
  // Check candidateInfo state first
  if (candidateInfo?.candidateId) return candidateInfo.candidateId;
  if (candidateInfo?.candidateID) return candidateInfo.candidateID;
  if (candidateInfo?._id) return candidateInfo._id;
  
  // Check selectedOffer for candidate object
  if (selectedOffer?.candidate) {
    return selectedOffer.candidate.candidateId || 
           selectedOffer.candidate.candidateID || 
           selectedOffer.candidate._id || 
           'CAN-XXX';
  }

  return 'CAN-XXX';
};

const getCandidateEmail = () => {
  if (candidateInfo?.email) return candidateInfo.email;
  if (selectedOffer?.candidate?.email) return selectedOffer.candidate.email;
  return '';
};

const getCandidatePhone = () => {
  if (candidateInfo?.phone) return candidateInfo.phone;
  if (candidateInfo?.mobile) return candidateInfo.mobile;
  if (selectedOffer?.candidate?.phone) return selectedOffer.candidate.phone;
  if (selectedOffer?.candidate?.mobile) return selectedOffer.candidate.mobile;
  return '';
};

const getPosition = () => {
  if (candidateInfo?.position) return candidateInfo.position;
  if (selectedOffer?.job?.title) return selectedOffer.job.title;
  if (selectedOffer?.offerDetails?.designation) return selectedOffer.offerDetails.designation;
  return 'Not Specified';
};

const getJoiningDate = () => {
  return selectedOffer?.joiningDate || null;
};

const getReportingTo = () => {
  return selectedOffer?.reportingTo || 'Not Specified';
};

const getProbationPeriod = () => {
  return selectedOffer?.probationPeriod || 6;
};

const getCtcDetails = () => {
  if (selectedOffer?.ctcDetails) return selectedOffer.ctcDetails;
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
          ✅ Approval Successful
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
              Approval Status
            </Typography>
            <Chip
              label={data.approvalStatus}
              color="success"
              size="small"
              sx={{ fontWeight: 500, mt: 0.5 }}
            />
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
                {offers.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: 1 }}>
                    No pending offers found for approval.
                  </Alert>
                ) : (
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Select Offer *</InputLabel>
                    <Select
                      value={selectedOffer?._id || selectedOffer?.id || ''}
                      onChange={handleOfferChange}
                      label="Select Offer *"
                      error={!!stepErrors.offer}
                    >
                      {offers.map((offer) => {
                        // Get candidate name from offer
                        let candidateName = 'Unknown Candidate';
                        if (offer.candidateId) {
                          if (typeof offer.candidateId === 'object') {
                            candidateName = offer.candidateId.name ||
                              `${offer.candidateId.firstName || ''} ${offer.candidateId.lastName || ''}`.trim() ||
                              'Unknown Candidate';
                          }
                        }
                        
                        return (
                          <MenuItem key={offer._id || offer.id} value={offer._id || offer.id}>
                            {candidateName} - {offer.offerId || offer._id} ({offer.status || 'pending_approval'})
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
                )}

                {selectedOffer && (
                  <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 1 }}>
                    <Grid container spacing={1}>
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
                        <Typography variant="body2">{getCandidatePhone() || 'N/A'}</Typography>
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
                          label={selectedOffer.status || 'Pending Approval'}
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

      case 1:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Offer Summary
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {getCandidateName()}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        ID: {getCandidateId()} | {getCandidateEmail()} | {getCandidatePhone() || 'No phone'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Offer ID
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedOffer?.offerId || selectedOffer?._id || 'N/A'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Current Status
                    </Typography>
                    <Chip
                      label={getOfferValue('status', 'Pending Approval')}
                      color={getStatusColor(getOfferValue('status'))}
                      size="small"
                      sx={{ fontWeight: 500, mt: 0.5 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Position
                    </Typography>
                    <Typography variant="body2">
                      {getPosition()}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Joining Date
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(getJoiningDate())}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Reporting To
                    </Typography>
                    <Typography variant="body2">
                      {getReportingTo()}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
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
        const ctcDetails = getCtcDetails();

        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Annual CTC Breakdown
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : ctcDetails ? (
                <>
                  <Grid container spacing={1}>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Basic + DA
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {formatCurrency(ctcDetails.basic * 12)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        HRA
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(ctcDetails.hra * 12)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Conveyance Allowance
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(ctcDetails.conveyanceAllowance * 12)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Medical Allowance
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(ctcDetails.medicalAllowance * 12)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Special Allowance
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(ctcDetails.specialAllowance * 12)}
                      </Typography>
                    </Grid>

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

                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" color="#1976D2">
                          Total CTC
                        </Typography>
                        <Typography variant="h6" color="#1976D2" fontWeight={700}>
                          {formatCurrency(ctcDetails.totalCtc)}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ mt: 1, p: 1, bgcolor: '#F8FAFC', borderRadius: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                          <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 16 }} />
                          Monthly Gross: {formatCurrency(ctcDetails.gross)} |
                          Annual Gross: {formatCurrency(ctcDetails.gross * 12)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
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
        const ctcDetailsFinal = getCtcDetails();

        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                ✅ Approve Offer
              </Typography>

              {/* Comments */}
              <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.85rem', mb: 1 }}>
                Approval Comments *
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Add your approval comments (e.g., Salary is within budget, All documents verified, etc.)"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                size="small"
                error={!!stepErrors.comments}
                helperText={stepErrors.comments}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    fontSize: '0.85rem'
                  }
                }}
              />

              {/* Signature Upload */}
              <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.85rem', mb: 1 }}>
                Digital Signature *
              </Typography>

              <Box sx={{ mb: 2 }}>
                {!signature ? (
                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: stepErrors.signature ? 'error.main' : '#E0E0E0',
                      borderRadius: 1,
                      p: 2,
                      textAlign: 'center',
                      bgcolor: '#F8FAFC',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: '#1976D2',
                        bgcolor: '#F0F7FF'
                      }
                    }}
                    component="label"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      style={{ display: 'none' }}
                    />
                    <EditIcon sx={{ color: '#1976D2', mb: 1, fontSize: 32 }} />
                    <Typography variant="body2" color="textSecondary">
                      Click to upload signature image
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Supported formats: PNG, JPG, JPEG
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{
                    p: 1.5,
                    bgcolor: '#F0F7FF',
                    borderRadius: 1,
                    border: '1px solid #1976D2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                      <Typography variant="body2">{signatureName}</Typography>
                    </Box>
                    <Button
                      size="small"
                      color="error"
                      onClick={clearSignature}
                      sx={{ textTransform: 'none' }}
                    >
                      Remove
                    </Button>
                  </Box>
                )}
                {stepErrors.signature && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {stepErrors.signature}
                  </Typography>
                )}
              </Box>

              {/* Warning Message */}
              <Box sx={{
                p: 1.5,
                bgcolor: '#FFF4E5',
                borderRadius: 1,
                border: '1px solid #FFB74D',
                mb: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <WarningIcon sx={{ color: '#F57C00', fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ color: '#F57C00', fontSize: '0.85rem' }}>
                    Approval Notice
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  By approving this offer, you are authorizing the release of this offer letter to the candidate.
                  This action will trigger the offer generation process and cannot be undone.
                </Typography>
              </Box>

              {/* Confirmation Checkbox */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <input
                  type="checkbox"
                  id="confirmApprove"
                  checked={confirmApprove}
                  onChange={(e) => setConfirmApprove(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                  I confirm that I have reviewed all details and approve this offer.
                </Typography>
              </Box>
              {stepErrors.confirmApprove && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {stepErrors.confirmApprove}
                </Typography>
              )}
            </Paper>

            {/* Preview Section */}
            {selectedOffer && (
              <Paper sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 1, border: '1px solid #E0E0E0' }}>
                <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                  Approval Preview
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Candidate
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {getCandidateName()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Offer ID
                    </Typography>
                    <Typography variant="body2">
                      {selectedOffer?.offerId || selectedOffer?._id}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Total CTC
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="#1976D2">
                      {ctcDetailsFinal ? formatCurrency(ctcDetailsFinal.totalCtc) : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Comments
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      {comments || 'No comments added'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}

            <Alert severity="info" sx={{ borderRadius: 1 }}>
              <Typography variant="body2">
                Please review all details before approving. Click "Approve Offer" to proceed.
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
        backgroundColor: '#F8FAFC',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#101010' }}>
          Approve Offer
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
            sx={{ mb: 1 }}
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
                  onClick={handleApproveOffer}
                  disabled={loading || !confirmApprove || !comments.trim() || !signature}
                  size="small"
                  startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ThumbUpIcon />}
                  sx={{
                    backgroundColor: '#4CAF50',
                    '&:hover': { backgroundColor: '#45a049' },
                    minWidth: 160,
                    '&.Mui-disabled': {
                      backgroundColor: '#A5D6A7'
                    }
                  }}
                >
                  {loading ? 'Approving...' : 'Approve Offer'}
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
  );
};

export default ApproveOffer;