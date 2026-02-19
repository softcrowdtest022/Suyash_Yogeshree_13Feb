import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  MenuItem,
  Grid,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  styled,
  StepConnector,
  Chip,
  OutlinedInput,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Checkbox,
  ListItemText,
  Divider,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  AttachMoney as AttachMoneyIcon,
  School as SchoolIcon,
  Build as BuildIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

/* ------------------- Custom Stepper Styling ------------------- */

const ColorConnector = styled(StepConnector)(({ theme }) => ({
  '& .MuiStepConnector-line': {
    height: 4,
    border: 0,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
  },
  '&.Mui-active .MuiStepConnector-line': {
    background: 'linear-gradient(90deg, #164e63, #00B4D8)',
  },
  '&.Mui-completed .MuiStepConnector-line': {
    background: 'linear-gradient(90deg, #164e63, #00B4D8)',
  },
}));

const steps = ["Basic Information", "Job Details", "Publish Settings"];

// Available platforms for publishing
const publishPlatforms = [
  { value: 'careerPage', label: 'Career Page' },
  { value: 'naukri', label: 'Naukri.com' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'monster', label: 'Monster' }
];

const AddJobOpening = ({ open, onClose, onAdd }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [requisitions, setRequisitions] = useState([]);
  const [requisitionLoading, setRequisitionLoading] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  
  const [formData, setFormData] = useState({
    requisitionId: '',
    description: '',
    companyIntro: '',
    requirements: [],
    responsibilities: [],
    publishTo: [],
    location: '',
    department: '',
    employmentType: 'Permanent',
    experienceRequired: {
      min: 0,
      max: 0
    },
    salaryRange: {
      min: 0,
      max: 0,
      currency: 'INR'
    },
    skills: [],
    education: []
  });

  // Temporary input fields for dynamic arrays
  const [requirementInput, setRequirementInput] = useState('');
  const [responsibilityInput, setResponsibilityInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [educationInput, setEducationInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (open) fetchRequisitions();
  }, [open]);

  // Add this useEffect for debugging
useEffect(() => {
  console.log('Form data updated:', {
    requisitionId: formData.requisitionId,
    publishTo: formData.publishTo,
    requirements: formData.requirements.length,
    responsibilities: formData.responsibilities.length
  });
}, [formData]);

  const fetchRequisitions = async () => {
    try {
      setRequisitionLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/requisitions?status=approved`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setRequisitions(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching requisitions:', error);
    } finally {
      setRequisitionLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects
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
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRequisitionChange = (e) => {
    const requisitionId = e.target.value;
    setFormData(prev => ({ ...prev, requisitionId }));
    
    // Auto-fill job details from selected requisition
    const selected = requisitions.find(req => req._id === requisitionId);
    if (selected) {
      setSelectedRequisition(selected);
      
      // Auto-populate fields from requisition
      setFormData(prev => ({
        ...prev,
        requisitionId: selected._id,
        location: selected.location || '',
        department: selected.department || '',
        employmentType: selected.employmentType || 'Permanent',
        experienceRequired: {
          min: selected.experienceYears || 0,
          max: (selected.experienceYears || 0) + 2
        },
        salaryRange: {
          min: selected.budgetMin || 0,
          max: selected.budgetMax || 0,
          currency: 'INR'
        },
        skills: selected.skills || [],
        education: selected.education ? [selected.education] : []
      }));
    }
  };

  // Handle requirements
  const handleAddRequirement = () => {
    if (requirementInput.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, requirementInput.trim()]
      }));
      setRequirementInput('');
    }
  };

  const handleRemoveRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  // Handle responsibilities
  const handleAddResponsibility = () => {
    if (responsibilityInput.trim()) {
      setFormData(prev => ({
        ...prev,
        responsibilities: [...prev.responsibilities, responsibilityInput.trim()]
      }));
      setResponsibilityInput('');
    }
  };

  const handleRemoveResponsibility = (index) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index)
    }));
  };

  // Handle skills
  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  // Handle education
  const handleAddEducation = () => {
    if (educationInput.trim()) {
      setFormData(prev => ({
        ...prev,
        education: [...prev.education, educationInput.trim()]
      }));
      setEducationInput('');
    }
  };

  const handleRemoveEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  // Handle publish platforms
const handlePublishChange = (event) => {
  const { value } = event.target;
  // In MUI Select with multiple, value is always an array
  setFormData(prev => ({
    ...prev,
    publishTo: value
  }));
  console.log('Selected platforms:', value);
};

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const validateStep = () => {
    const errors = {};
    let isValid = true;

    switch(activeStep) {
      case 0:
        if (!formData.requisitionId) {
          errors.requisitionId = 'Please select a requisition';
          isValid = false;
        }
        if (!formData.companyIntro?.trim()) {
          errors.companyIntro = 'Company introduction is required';
          isValid = false;
        }
        if (!formData.location?.trim()) {
          errors.location = 'Location is required';
          isValid = false;
        }
        if (!formData.department?.trim()) {
          errors.department = 'Department is required';
          isValid = false;
        }
        if (!formData.employmentType) {
          errors.employmentType = 'Employment type is required';
          isValid = false;
        }
        break;

      case 1:
        if (!formData.description?.trim()) {
          errors.description = 'Job description is required';
          isValid = false;
        }
        if (formData.requirements.length === 0) {
          errors.requirements = 'Please add at least one requirement';
          isValid = false;
        }
        if (formData.responsibilities.length === 0) {
          errors.responsibilities = 'Please add at least one responsibility';
          isValid = false;
        }
        if (formData.experienceRequired.min < 0) {
          errors['experienceRequired.min'] = 'Minimum experience cannot be negative';
          isValid = false;
        }
        if (formData.experienceRequired.max < formData.experienceRequired.min) {
          errors['experienceRequired.max'] = 'Maximum experience must be greater than minimum';
          isValid = false;
        }
        if (formData.salaryRange.min < 0) {
          errors['salaryRange.min'] = 'Minimum salary cannot be negative';
          isValid = false;
        }
        if (formData.salaryRange.max < formData.salaryRange.min) {
          errors['salaryRange.max'] = 'Maximum salary must be greater than minimum';
          isValid = false;
        }
        break;

      case 2:
        if (formData.publishTo.length === 0) {
          errors.publishTo = 'Please select at least one platform to publish';
          isValid = false;
        }
        break;

      default:
        break;
    }

    setFieldErrors(errors);
    if (!isValid) {
      setError('Please fill in all required fields correctly');
    } else {
      setError('');
    }
    return isValid;
  };

  const handleSubmit = async () => {
  if (!validateStep()) return;

  setLoading(true);
  setError('');
  setFieldErrors({});

  // Make sure requisitionId is a string
  if (!formData.requisitionId) {
    setError('Please select a requisition');
    setLoading(false);
    return;
  }

  // Prepare the payload matching the API expected structure
  // Based on your successful API response, the publishTo field should be an array of strings
  const payload = {
    requisitionId: formData.requisitionId,
    description: formData.description || '',
    companyIntro: formData.companyIntro || '',
    requirements: formData.requirements.length > 0 ? formData.requirements : ['Minimum experience required'],
    responsibilities: formData.responsibilities.length > 0 ? formData.responsibilities : ['Perform assigned duties'],
    publishTo: formData.publishTo, // This should be an array of strings like ["careerPage", "naukri", "linkedin"]
    location: formData.location || 'Not specified',
    department: formData.department || 'Not specified',
    employmentType: formData.employmentType || 'Permanent',
    experienceRequired: {
      min: Number(formData.experienceRequired.min) || 0,
      max: Number(formData.experienceRequired.max) || 0
    },
    salaryRange: {
      min: Number(formData.salaryRange.min) || 0,
      max: Number(formData.salaryRange.max) || 0,
      currency: formData.salaryRange.currency || 'INR'
    },
    skills: formData.skills.length > 0 ? formData.skills : [],
    education: formData.education.length > 0 ? formData.education : []
  };

  // Log the payload to see what we're sending
  console.log('Sending payload:', JSON.stringify(payload, null, 2));
  console.log('publishTo value:', payload.publishTo);
  console.log('publishTo type:', typeof payload.publishTo, Array.isArray(payload.publishTo));

  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${BASE_URL}/api/jobs`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      onAdd(response.data.data);
      onClose();
      // Reset form
      setActiveStep(0);
      setFormData({
        requisitionId: '',
        description: '',
        companyIntro: '',
        requirements: [],
        responsibilities: [],
        publishTo: [],
        location: '',
        department: '',
        employmentType: 'Permanent',
        experienceRequired: { min: 0, max: 0 },
        salaryRange: { min: 0, max: 0, currency: 'INR' },
        skills: [],
        education: []
      });
      setSelectedRequisition(null);
      setError('');
    }
  } catch (err) {
    console.error('Error creating job:', err);
    
    // Log the detailed error response
    if (err.response) {
      console.error('Error status:', err.response.status);
      console.error('Error data:', err.response.data);
      console.error('Error headers:', err.response.headers);
      
      // Handle specific error messages from server
      if (err.response.status === 400) {
        const serverError = err.response.data;
        
        // Check for duplicate job ID error
        if (serverError.message?.includes('Duplicate') || 
            serverError.message?.includes('duplicate') ||
            serverError.message?.includes('already exists')) {
          setError('Duplicate job ID. Please try again.');
        } 
        // Handle validation errors from server
        else if (serverError.errors) {
          const serverFieldErrors = {};
          Object.keys(serverError.errors).forEach(key => {
            serverFieldErrors[key] = serverError.errors[key].message;
          });
          setFieldErrors(serverFieldErrors);
          setError('Please check the form for errors');
        }
        else if (serverError.message) {
          setError(serverError.message);
        } else {
          // If no specific error message, show a generic one
          setError('Failed to create job opening. Please check all fields and try again.');
        }
      }
    } else if (err.request) {
      // The request was made but no response was received
      console.error('No response received:', err.request);
      setError('No response from server. Please check your network connection.');
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', err.message);
      setError('Failed to create job opening. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, minHeight: 500 }
      }}
    >
      {/* Attractive Header */}
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #164e63, #00B4D8)',
        color: '#fff',
        fontWeight: 600,
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <WorkIcon /> Add Job Opening
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Modern Stepper */}
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          connector={<ColorConnector />}
          sx={{ mb: 3, mt: 1 }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>
                <Typography fontWeight={500}>{label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Stack spacing={3}>
          {/* STEP 1: Basic Information */}
          {activeStep === 0 && (
            <>
              <FormControl fullWidth error={!!fieldErrors.requisitionId}>
                <InputLabel>Select Requisition *</InputLabel>
                <Select
                  value={formData.requisitionId}
                  onChange={handleRequisitionChange}
                  label="Select Requisition *"
                >
                  {requisitionLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={18} sx={{ mr: 1 }} />
                      Loading...
                    </MenuItem>
                  ) : requisitions.length > 0 ? (
                    requisitions.map(req => (
                      <MenuItem key={req._id} value={req._id}>
                        {req.requisitionId} - {req.positionTitle || req.jobTitle} ({req.department})
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No requisitions found</MenuItem>
                  )}
                </Select>
                {fieldErrors.requisitionId && (
                  <FormHelperText>{fieldErrors.requisitionId}</FormHelperText>
                )}
              </FormControl>

              <TextField
                label="Company Introduction *"
                name="companyIntro"
                multiline
                rows={3}
                fullWidth
                value={formData.companyIntro}
                onChange={handleChange}
                placeholder="Brief introduction about your company..."
                error={!!fieldErrors.companyIntro}
                helperText={fieldErrors.companyIntro}
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Location *"
                    name="location"
                    fullWidth
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Plant Unit A"
                    error={!!fieldErrors.location}
                    helperText={fieldErrors.location}
                    slotProps={{
                      input: {
                        startAdornment: <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Department *"
                    name="department"
                    fullWidth
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g., Production"
                    error={!!fieldErrors.department}
                    helperText={fieldErrors.department}
                    slotProps={{
                      input: {
                        startAdornment: <BusinessIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      }
                    }}
                  />
                </Grid>
              </Grid>

              <FormControl fullWidth error={!!fieldErrors.employmentType}>
                <InputLabel>Employment Type *</InputLabel>
                <Select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  label="Employment Type *"
                >
                  <MenuItem value="Permanent">Permanent</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                  <MenuItem value="Temporary">Temporary</MenuItem>
                  <MenuItem value="Internship">Internship</MenuItem>
                  <MenuItem value="Part-time">Part-time</MenuItem>
                  <MenuItem value="Full-time">Full-time</MenuItem>
                </Select>
                {fieldErrors.employmentType && (
                  <FormHelperText>{fieldErrors.employmentType}</FormHelperText>
                )}
              </FormControl>
            </>
          )}

          {/* STEP 2: Job Details */}
          {activeStep === 1 && (
            <>
              <TextField
                label="Job Description *"
                name="description"
                multiline
                rows={4}
                fullWidth
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed description of the job role..."
                error={!!fieldErrors.description}
                helperText={fieldErrors.description}
              />

              {/* Requirements Section */}
              <Box>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Requirements <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Stack direction="row" spacing={1} mb={1}>
                  <TextField
                    fullWidth
                    size="small"
                    value={requirementInput}
                    onChange={(e) => setRequirementInput(e.target.value)}
                    placeholder="Add a requirement (e.g., Minimum 2 years experience)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRequirement();
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddRequirement}
                    disabled={!requirementInput.trim()}
                    sx={{
                      background: 'linear-gradient(135deg, #164e63, #00B4D8)',
                      '&:hover': { opacity: 0.9 }
                    }}
                  >
                    Add
                  </Button>
                </Stack>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: 50, mb: 1 }}>
                  {formData.requirements.map((req, index) => (
                    <Chip
                      key={index}
                      label={req}
                      onDelete={() => handleRemoveRequirement(index)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
                {fieldErrors.requirements && (
                  <FormHelperText error>{fieldErrors.requirements}</FormHelperText>
                )}
              </Box>

              {/* Responsibilities Section */}
              <Box>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Responsibilities <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Stack direction="row" spacing={1} mb={1}>
                  <TextField
                    fullWidth
                    size="small"
                    value={responsibilityInput}
                    onChange={(e) => setResponsibilityInput(e.target.value)}
                    placeholder="Add a responsibility (e.g., Operate production machinery)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddResponsibility();
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddResponsibility}
                    disabled={!responsibilityInput.trim()}
                    sx={{
                      background: 'linear-gradient(135deg, #164e63, #00B4D8)',
                      '&:hover': { opacity: 0.9 }
                    }}
                  >
                    Add
                  </Button>
                </Stack>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: 50, mb: 1 }}>
                  {formData.responsibilities.map((resp, index) => (
                    <Chip
                      key={index}
                      label={resp}
                      onDelete={() => handleRemoveResponsibility(index)}
                      color="secondary"
                      variant="outlined"
                    />
                  ))}
                </Box>
                {fieldErrors.responsibilities && (
                  <FormHelperText error>{fieldErrors.responsibilities}</FormHelperText>
                )}
              </Box>

              {/* Experience Range */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Min Experience (years)"
                    name="experienceRequired.min"
                    type="number"
                    fullWidth
                    value={formData.experienceRequired.min}
                    onChange={handleChange}
                    inputProps={{ min: 0 }}
                    error={!!fieldErrors['experienceRequired.min']}
                    helperText={fieldErrors['experienceRequired.min']}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Max Experience (years)"
                    name="experienceRequired.max"
                    type="number"
                    fullWidth
                    value={formData.experienceRequired.max}
                    onChange={handleChange}
                    inputProps={{ min: formData.experienceRequired.min }}
                    error={!!fieldErrors['experienceRequired.max']}
                    helperText={fieldErrors['experienceRequired.max']}
                  />
                </Grid>
              </Grid>

              {/* Salary Range */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Min Salary"
                    name="salaryRange.min"
                    type="number"
                    fullWidth
                    value={formData.salaryRange.min}
                    onChange={handleChange}
                    inputProps={{ min: 0 }}
                    error={!!fieldErrors['salaryRange.min']}
                    helperText={fieldErrors['salaryRange.min']}
                    slotProps={{
                      input: {
                        startAdornment: <AttachMoneyIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Max Salary"
                    name="salaryRange.max"
                    type="number"
                    fullWidth
                    value={formData.salaryRange.max}
                    onChange={handleChange}
                    inputProps={{ min: formData.salaryRange.min }}
                    error={!!fieldErrors['salaryRange.max']}
                    helperText={fieldErrors['salaryRange.max']}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      name="salaryRange.currency"
                      value={formData.salaryRange.currency}
                      onChange={handleChange}
                      label="Currency"
                    >
                      <MenuItem value="INR">INR</MenuItem>
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="EUR">EUR</MenuItem>
                      <MenuItem value="GBP">GBP</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Skills */}
              <Box>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Required Skills
                </Typography>
                <Stack direction="row" spacing={1} mb={1}>
                  <TextField
                    fullWidth
                    size="small"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill (e.g., Lathe operation)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddSkill}
                    disabled={!skillInput.trim()}
                    sx={{
                      background: 'linear-gradient(135deg, #164e63, #00B4D8)',
                      '&:hover': { opacity: 0.9 }
                    }}
                  >
                    Add
                  </Button>
                </Stack>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      onDelete={() => handleRemoveSkill(index)}
                      icon={<BuildIcon />}
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>

              {/* Education */}
              <Box>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Education Requirements
                </Typography>
                <Stack direction="row" spacing={1} mb={1}>
                  <TextField
                    fullWidth
                    size="small"
                    value={educationInput}
                    onChange={(e) => setEducationInput(e.target.value)}
                    placeholder="Add education (e.g., ITI/Diploma in Mechanical)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEducation();
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddEducation}
                    disabled={!educationInput.trim()}
                    sx={{
                      background: 'linear-gradient(135deg, #164e63, #00B4D8)',
                      '&:hover': { opacity: 0.9 }
                    }}
                  >
                    Add
                  </Button>
                </Stack>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.education.map((edu, index) => (
                    <Chip
                      key={index}
                      label={edu}
                      onDelete={() => handleRemoveEducation(index)}
                      icon={<SchoolIcon />}
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            </>
          )}

          {/* STEP 3: Publish Settings */}
          {activeStep === 2 && (
            <>
              <FormControl fullWidth error={!!fieldErrors.publishTo}>
                <InputLabel>Publish To *</InputLabel>
                <Select
                  multiple
                  value={formData.publishTo}
                  onChange={handlePublishChange}
                  input={<OutlinedInput label="Publish To *" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip 
                          key={value} 
                          label={publishPlatforms.find(p => p.value === value)?.label || value} 
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {publishPlatforms.map((platform) => (
                    <MenuItem key={platform.value} value={platform.value}>
                      <Checkbox checked={formData.publishTo.indexOf(platform.value) > -1} />
                      <ListItemText primary={platform.label} />
                    </MenuItem>
                  ))}
                </Select>
                {fieldErrors.publishTo && (
                  <FormHelperText>{fieldErrors.publishTo}</FormHelperText>
                )}
                <FormHelperText>Select where to publish this job opening</FormHelperText>
              </FormControl>

              <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoIcon color="info" fontSize="small" />
                    <Typography variant="body2" fontWeight={500}>
                      Note:
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ pl: 4 }}>
                    The job will be created in draft status first. You can review and publish it later from the job listings page.
                  </Typography>
                </Stack>
              </Paper>
            </>
          )}

          {/* Error Display */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                border: '1px solid #ffcdd2',
                backgroundColor: '#ffebee'
              }}
            >
              {error}
            </Alert>
          )}

          {/* Field Errors Summary */}
          {Object.keys(fieldErrors).length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight={500}>
                Please fix the following errors:
              </Typography>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                {Object.values(fieldErrors).map((msg, idx) => (
                  <li key={idx}>
                    <Typography variant="caption">{msg}</Typography>
                  </li>
                ))}
              </ul>
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="outlined"
          onClick={onClose}
        >
          Cancel
        </Button>
        
        <Box sx={{ flex: 1 }} />
        
        {activeStep > 0 && (
          <Button onClick={handleBack}>
            Back
          </Button>
        )}

        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{
              background: 'linear-gradient(135deg, #164e63, #00B4D8)',
              '&:hover': { opacity: 0.9 }
            }}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
            sx={{
              background: 'linear-gradient(135deg, #164e63, #00B4D8)',
              '&:hover': { opacity: 0.9 },
              '&.Mui-disabled': {
                background: '#e0e0e0'
              }
            }}
          >
            {loading ? 'Creating...' : 'Create Job Opening'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddJobOpening;