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
  
  // Buttons and actions
  Button,
  IconButton,
  
  // Surfaces
  styled,
  
  // Utils
  InputAdornment
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Calculate as CalculateIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon
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

const InitiateOffer = ({ open, onClose, onComplete, candidate = null }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [fetchingCandidates, setFetchingCandidates] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [calculatedCTC, setCalculatedCTC] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stepErrors, setStepErrors] = useState({});

  // Steps definition
  const steps = ['Select Candidate', 'CTC Components', 'Offer Details & Review'];

  const [formData, setFormData] = useState({
    candidateId: '',
    applicationId: '',
    joiningDate: '',
    ctcComponents: {
      basic: '',
      hraPercent: 50,
      conveyanceAllowance: 1600,
      medicalAllowance: 1250,
      specialAllowance: '',
      bonusPercent: 8.33,
      employerPfPercent: 12,
      employerEsiPercent: 3.25,
      gratuityPercent: 4.81
    },
    offerDetails: {
      reportingTo: '',
      probationPeriod: 6,
      noticePeriod: 30,
      benefits: []
    }
  });

  const [benefitInput, setBenefitInput] = useState('');

  const benefitOptions = [
    'Medical Insurance',
    'Annual Bonus',
    'Performance Bonus',
    'Transport Allowance',
    'Meal Coupons',
    'Gym Membership',
    'Education Allowance',
    'Leave Travel Allowance'
  ];

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  };

  useEffect(() => {
    if (open) {
      console.log('Dialog opened, fetching candidates...');
      fetchSelectedCandidates();
    }
  }, [open]);

  // Handle candidate prop and set it as selected
  useEffect(() => {
    if (candidate && open) {
      console.log('Candidate received in InitiateOffer:', candidate);
      
      // Get the candidate ID
      const candidateId = candidate.id || candidate._id;
      
      // Get application ID from the candidate object
      let applicationId = null;
      let application = null;
      
      // Check if the candidate has latestApplication from the API
      if (candidate.latestApplication) {
        applicationId = candidate.latestApplication._id;
        application = candidate.latestApplication;
      }
      // Check if the candidate has applicationId directly (from parent component)
      else if (candidate.applicationId) {
        applicationId = candidate.applicationId;
        application = { _id: candidate.applicationId, jobId: { title: candidate.position } };
      }
      
      console.log('Extracted IDs:', { candidateId, applicationId });
      
      if (!candidateId) {
        setError('Candidate ID is missing');
        return;
      }
      
      if (!applicationId) {
        setError('This candidate does not have an application. Only candidates with applications can receive offers.');
        return;
      }
      
      // Create a candidate object for display
      const displayCandidate = {
        _id: candidateId,
        id: candidateId,
        firstName: candidate.firstName || candidate.name?.split(' ')[0] || 'Unknown',
        lastName: candidate.lastName || candidate.name?.split(' ')[1] || '',
        email: candidate.email || '',
        phone: candidate.phone || '',
        position: candidate.position || application?.jobId?.title || 'Not Assigned'
      };
      
      setSelectedCandidate(displayCandidate);
      setSelectedApplication(application);
      
      // Update form data with the IDs
      setFormData(prev => {
        const newFormData = {
          ...prev,
          candidateId: candidateId,
          applicationId: applicationId
        };
        console.log('Updated formData:', newFormData);
        return newFormData;
      });
    }
  }, [candidate, open]);

  const fetchSelectedCandidates = async () => {
    setFetchingCandidates(true);
    try {
      const token = getAuthToken();
      console.log('Fetching candidates from:', `${BASE_URL}/api/candidates?status=selected`);
      
      const response = await axios.get(`${BASE_URL}/api/candidates?status=selected`, {
        headers: { 
          Authorization: token ? `Bearer ${token}` : '' 
        }
      });
      
      console.log('Candidates response:', response.data);
      
      if (response.data.success) {
        // Filter candidates that have latestApplication (only they can have offers)
        const candidatesWithApplication = response.data.data.filter(
          candidate => candidate.latestApplication !== null
        );
        
        console.log('Candidates with applications:', candidatesWithApplication);
        setCandidates(candidatesWithApplication);
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError('Failed to fetch candidates');
    } finally {
      setFetchingCandidates(false);
    }
  };

  const handleCandidateChange = (e) => {
    const candidateId = e.target.value;
    console.log('Selected candidate ID:', candidateId);
    
    const candidate = candidates.find(c => c._id === candidateId);
    console.log('Found candidate:', candidate);
    
    setSelectedCandidate(candidate);
    
    if (candidate?.latestApplication) {
      console.log('Setting application:', candidate.latestApplication);
      setSelectedApplication(candidate.latestApplication);
      
      setFormData(prev => {
        const newFormData = {
          ...prev,
          candidateId: candidate._id,
          applicationId: candidate.latestApplication._id
        };
        console.log('Updated formData from dropdown:', newFormData);
        return newFormData;
      });
    } else {
      setError('Selected candidate has no application. Please select a different candidate.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear calculated CTC when inputs change
    setCalculatedCTC(null);
    setError('');
    setSuccess('');
    
    // Clear step error for this field
    if (stepErrors[name]) {
      setStepErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCTCComponentChange = (e) => {
    const { name, value } = e.target;
    
    // Convert empty string to empty string, otherwise keep as number
    const processedValue = value === '' ? '' : Number(value);
    
    setFormData(prev => ({
      ...prev,
      ctcComponents: {
        ...prev.ctcComponents,
        [name]: processedValue
      }
    }));
    setCalculatedCTC(null);
    
    // Clear step error for this field
    if (stepErrors[name]) {
      setStepErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddBenefit = () => {
    if (benefitInput && !formData.offerDetails.benefits.includes(benefitInput)) {
      setFormData(prev => ({
        ...prev,
        offerDetails: {
          ...prev.offerDetails,
          benefits: [...prev.offerDetails.benefits, benefitInput]
        }
      }));
      setBenefitInput('');
    }
  };

  const handleRemoveBenefit = (benefit) => {
    setFormData(prev => ({
      ...prev,
      offerDetails: {
        ...prev.offerDetails,
        benefits: prev.offerDetails.benefits.filter(b => b !== benefit)
      }
    }));
  };

  // Validate current step
  const validateStep = (step) => {
    const errors = {};
    
    if (step === 0) {
      if (!formData.candidateId) {
        errors.candidateId = 'Please select a candidate';
      }
      if (!formData.applicationId) {
        errors.applicationId = 'Application ID is missing';
      }
    } else if (step === 1) {
      if (!formData.ctcComponents.basic || formData.ctcComponents.basic === '') {
        errors.basic = 'Basic salary is required';
      }
      if (!formData.joiningDate) {
        errors.joiningDate = 'Joining date is required';
      }
    } else if (step === 2) {
      if (!formData.offerDetails.reportingTo) {
        errors.reportingTo = 'Reporting To is required';
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
      setError('Please fill in all required fields in this section');
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const calculateCTC = async () => {
    console.log('Current formData before submission:', formData);
    
    // Validate step 2 before submission
    if (!validateStep(2)) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = getAuthToken();
      
      // Prepare the request body exactly as per API specification
      const requestBody = {
        candidateId: formData.candidateId,
        applicationId: formData.applicationId,
        joiningDate: formData.joiningDate,
        ctcComponents: {
          basic: Number(formData.ctcComponents.basic),
          hraPercent: Number(formData.ctcComponents.hraPercent),
          conveyanceAllowance: Number(formData.ctcComponents.conveyanceAllowance),
          medicalAllowance: Number(formData.ctcComponents.medicalAllowance),
          specialAllowance: formData.ctcComponents.specialAllowance === '' ? 0 : Number(formData.ctcComponents.specialAllowance),
          bonusPercent: Number(formData.ctcComponents.bonusPercent),
          employerPfPercent: Number(formData.ctcComponents.employerPfPercent),
          employerEsiPercent: Number(formData.ctcComponents.employerEsiPercent),
          gratuityPercent: Number(formData.ctcComponents.gratuityPercent)
        },
        offerDetails: {
          reportingTo: formData.offerDetails.reportingTo,
          probationPeriod: Number(formData.offerDetails.probationPeriod),
          noticePeriod: Number(formData.offerDetails.noticePeriod),
          benefits: formData.offerDetails.benefits
        }
      };

      console.log('Sending request to API:', requestBody);

      const response = await axios.post(
        `${BASE_URL}/api/offers/initiate`,
        requestBody,
        { 
          headers: { 
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log('API Response:', response.data);

      if (response.data.success) {
        setCalculatedCTC(response.data.data.ctcDetails);
        setSuccess(`Offer initiated successfully! Offer ID: ${response.data.data.offerId}`);
        
        // Prepare updated data for parent component
        const updatedData = {
          id: selectedCandidate?._id || selectedCandidate?.id,
          status: 'Initiated',
          offerId: response.data.data.offerId,
          offerDetails: response.data.data
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
      console.error('Error calculating CTC:', err);
      
      // Handle different error scenarios
      if (err.response) {
        setError(err.response.data?.message || `Server error: ${err.response.status}`);
        console.error('Error response data:', err.response.data);
      } else if (err.request) {
        setError('No response from server. Please check your network connection.');
      } else {
        setError(err.message || 'Failed to calculate CTC');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    await calculateCTC();
  };

  const handleClose = () => {
    setSelectedCandidate(null);
    setSelectedApplication(null);
    setCalculatedCTC(null);
    setError('');
    setSuccess('');
    setActiveStep(0);
    setStepErrors({});
    setFormData({
      candidateId: '',
      applicationId: '',
      joiningDate: '',
      ctcComponents: {
        basic: '',
        hraPercent: 50,
        conveyanceAllowance: 1600,
        medicalAllowance: 1250,
        specialAllowance: '',
        bonusPercent: 8.33,
        employerPfPercent: 12,
        employerEsiPercent: 3.25,
        gratuityPercent: 4.81
      },
      offerDetails: {
        reportingTo: '',
        probationPeriod: 6,
        noticePeriod: 30,
        benefits: []
      }
    });
    onClose();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Render step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Paper sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
            <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
              Select Candidate for Offer
            </Typography>
            
            {fetchingCandidates ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                {candidates.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: 1 }}>
                    No candidates with applications found. Only candidates with applications can receive offers.
                  </Alert>
                ) : (
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Select Candidate *</InputLabel>
                    <Select
                      value={selectedCandidate?._id || selectedCandidate?.id || ''}
                      onChange={handleCandidateChange}
                      label="Select Candidate *"
                      error={!!stepErrors.candidateId}
                    >
                      {candidates.map((cand) => (
                        <MenuItem key={cand._id} value={cand._id}>
                          {cand.firstName} {cand.lastName} - {cand.candidateId}
                          {cand.latestApplication && ` (${cand.latestApplication.applicationId} - ${cand.latestApplication.jobId?.title})`}
                        </MenuItem>
                      ))}
                    </Select>
                    {stepErrors.candidateId && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                        {stepErrors.candidateId}
                      </Typography>
                    )}
                  </FormControl>
                )}

                {selectedCandidate && (
                  <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 1 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Name
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {selectedCandidate.firstName} {selectedCandidate.lastName}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Email
                        </Typography>
                        <Typography variant="body2">{selectedCandidate.email}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Phone
                        </Typography>
                        <Typography variant="body2">{selectedCandidate.phone}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Position
                        </Typography>
                        <Typography variant="body2">
                          {selectedApplication?.jobId?.title || selectedCandidate.position || 'N/A'}
                        </Typography>
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
                CTC Components (Monthly)
              </Typography>
              
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Basic Salary"
                    name="basic"
                    type="number"
                    value={formData.ctcComponents.basic}
                    onChange={handleCTCComponentChange}
                    required
                    error={!!stepErrors.basic}
                    helperText={stepErrors.basic}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="HRA Percentage"
                    name="hraPercent"
                    type="number"
                    value={formData.ctcComponents.hraPercent}
                    onChange={handleCTCComponentChange}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Conveyance Allowance"
                    name="conveyanceAllowance"
                    type="number"
                    value={formData.ctcComponents.conveyanceAllowance}
                    onChange={handleCTCComponentChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Medical Allowance"
                    name="medicalAllowance"
                    type="number"
                    value={formData.ctcComponents.medicalAllowance}
                    onChange={handleCTCComponentChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Special Allowance"
                    name="specialAllowance"
                    type="number"
                    value={formData.ctcComponents.specialAllowance}
                    onChange={handleCTCComponentChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Bonus Percentage"
                    name="bonusPercent"
                    type="number"
                    value={formData.ctcComponents.bonusPercent}
                    onChange={handleCTCComponentChange}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Employer PF Percentage"
                    name="employerPfPercent"
                    type="number"
                    value={formData.ctcComponents.employerPfPercent}
                    onChange={handleCTCComponentChange}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Employer ESI Percentage"
                    name="employerEsiPercent"
                    type="number"
                    value={formData.ctcComponents.employerEsiPercent}
                    onChange={handleCTCComponentChange}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Joining Date"
                    name="joiningDate"
                    type="date"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    required
                    error={!!stepErrors.joiningDate}
                    helperText={stepErrors.joiningDate}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Offer Details
              </Typography>

              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6} sx={{width: "300px"}}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Reporting To"
                    name="offerDetails.reportingTo"
                    value={formData.offerDetails.reportingTo}
                    onChange={handleInputChange}
                    required
                    error={!!stepErrors.reportingTo}
                    helperText={stepErrors.reportingTo}
                    placeholder="e.g., Production Manager"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Probation (months)"
                    name="offerDetails.probationPeriod"
                    type="number"
                    value={formData.offerDetails.probationPeriod}
                    onChange={handleInputChange}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Notice Period (days)"
                    name="offerDetails.noticePeriod"
                    type="number"
                    value={formData.offerDetails.noticePeriod}
                    onChange={handleInputChange}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: '#666', mb: 0.5, display: 'block' }}>
                    Benefits
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, width: "810px" }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Add Benefit</InputLabel>
                      <Select
                        value={benefitInput}
                        onChange={(e) => setBenefitInput(e.target.value)}
                        label="Add Benefit"
                        sx={{ borderRadius: 1 }}
                      >
                        {benefitOptions.map((benefit) => (
                          <MenuItem key={benefit} value={benefit}>
                            {benefit}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      onClick={handleAddBenefit}
                      disabled={!benefitInput}
                      size="small"
                      sx={{ borderRadius: 1, minWidth: 60 }}
                    >
                      Add
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {formData.offerDetails.benefits.map((benefit) => (
                      <Chip
                        key={benefit}
                        label={benefit}
                        onDelete={() => handleRemoveBenefit(benefit)}
                        size="small"
                        sx={{
                          backgroundColor: '#E3F2FD',
                          color: '#1976D2',
                          '& .MuiChip-deleteIcon': {
                            color: '#1976D2',
                            '&:hover': { color: '#1565C0' }
                          }
                        }}
                      />
                    ))}
                    {formData.offerDetails.benefits.length === 0 && (
                      <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic' }}>
                        No benefits added yet
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Preview Section */}
            <Paper sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Offer Preview
              </Typography>

              <Grid container spacing={8}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Candidate
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedCandidate ? `${selectedCandidate.firstName} ${selectedCandidate.lastName}` : 'Not selected'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Position
                  </Typography>
                  <Typography variant="body2">
                    {selectedApplication?.jobId?.title || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Basic Salary
                  </Typography>
                  <Typography variant="body2">
                    {formData.ctcComponents.basic ? `₹${formData.ctcComponents.basic}` : 'Not set'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Joining Date
                  </Typography>
                  <Typography variant="body2">
                    {formData.joiningDate ? new Date(formData.joiningDate).toLocaleDateString() : 'Not set'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Reporting To
                  </Typography>
                  <Typography variant="body2">
                    {formData.offerDetails.reportingTo || 'Not set'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Probation Period
                  </Typography>
                  <Typography variant="body2">
                    {formData.offerDetails.probationPeriod} months
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Alert severity="info" sx={{ borderRadius: 1 }}>
              <Typography variant="body2">
                Review all details before initiating the offer. Click "Calculate & Initiate Offer" to proceed.
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
          Initiate Offer Letter
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* 🔥 Modern Stepper with Gradient Connector */}
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

      <DialogContent sx={{ p: 2, overflow: 'auto', backgroundColor: '#F5F7FA' }}>
        {renderStepContent(activeStep)}

        {/* Calculated CTC Card - Only show when calculated */}
        {calculatedCTC && activeStep === 2 && (
          <Paper sx={{ 
            p: 2, 
            mt: 2, 
            bgcolor: '#F0F7FF', 
            border: '1px solid #1976D2',
            borderRadius: 1
          }}>
            <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600 }}>
              ✅ Calculated CTC (Annual)
            </Typography>

            <Grid container spacing={1}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="textSecondary" display="block">
                  Basic + DA
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatCurrency(calculatedCTC.basic * 12)}
                </Typography>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="textSecondary" display="block">
                  HRA
                </Typography>
                <Typography variant="body2">
                  {formatCurrency(calculatedCTC.hra * 12)}
                </Typography>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="textSecondary" display="block">
                  Gross Salary
                </Typography>
                <Typography variant="body2">
                  {formatCurrency(calculatedCTC.gross * 12)}
                </Typography>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="textSecondary" display="block">
                  Employer PF
                </Typography>
                <Typography variant="body2">
                  {formatCurrency(calculatedCTC.employerPf)}
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
                    {formatCurrency(calculatedCTC.totalCtc)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 1 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2, borderRadius: 1 }} onClose={() => setSuccess('')}>
            {success}
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
              onClick={handleSubmit}
              disabled={loading}
              size="small"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CalculateIcon />}
              sx={{
                backgroundColor: '#1976D2',
                '&:hover': { backgroundColor: '#1565C0' },
                minWidth: 160
              }}
            >
              {loading ? 'Processing...' : 'Initiate Offer'}
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
      </DialogActions>
    </Dialog>
  );
};

export default InitiateOffer;