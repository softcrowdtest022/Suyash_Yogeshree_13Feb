import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  IconButton,
  Chip,
  Divider,
  Stepper,
  Step,
  StepLabel,
  styled,
  StepConnector,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  OutlinedInput,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  School as SchoolIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
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

const steps = ["Basic Information", "Job Details", "Review & Save"];

/* ------------------- Main Component ------------------- */
const EditJobOpening = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [activeStep, setActiveStep] = useState(0);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    description: '',
    companyIntro: '',
    requirements: [],
    responsibilities: [],
    location: '',
    department: '',
    employmentType: '',
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

  // Employment types
  const employmentTypes = [
    'Permanent',
    'Contract',
    'Temporary',
    'Internship',
    'Part-time',
    'Full-time'
  ];

  // Currencies
  const currencies = ['INR', 'USD', 'EUR', 'GBP'];

  // Fetch job details on mount
  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const jobData = response.data.data;
        setJob(jobData);
        
        // Initialize form with job data
        setFormData({
          description: jobData.description || '',
          companyIntro: jobData.companyIntro || '',
          requirements: jobData.requirements || [],
          responsibilities: jobData.responsibilities || [],
          location: jobData.location || '',
          department: jobData.department || '',
          employmentType: jobData.employmentType || '',
          experienceRequired: jobData.experienceRequired || { min: 0, max: 0 },
          salaryRange: jobData.salaryRange || { min: 0, max: 0, currency: 'INR' },
          skills: jobData.skills || [],
          education: jobData.education || []
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch job details');
    } finally {
      setLoading(false);
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
  };

  // Handle dynamic array additions
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

  // Stepper navigation
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  // Validation
  const validateStep = () => {
    setError('');
    
    switch(activeStep) {
      case 0:
        if (!formData.companyIntro.trim()) {
          setError('Company introduction is required');
          return false;
        }
        if (!formData.location.trim()) {
          setError('Location is required');
          return false;
        }
        if (!formData.department.trim()) {
          setError('Department is required');
          return false;
        }
        if (!formData.employmentType) {
          setError('Employment type is required');
          return false;
        }
        break;
        
      case 1:
        if (!formData.description.trim()) {
          setError('Job description is required');
          return false;
        }
        if (formData.requirements.length === 0) {
          setError('Please add at least one requirement');
          return false;
        }
        if (formData.responsibilities.length === 0) {
          setError('Please add at least one responsibility');
          return false;
        }
        if (formData.experienceRequired.min < 0 || formData.experienceRequired.max < formData.experienceRequired.min) {
          setError('Please enter valid experience range');
          return false;
        }
        if (formData.salaryRange.min < 0 || formData.salaryRange.max < formData.salaryRange.min) {
          setError('Please enter valid salary range');
          return false;
        }
        break;
        
      default:
        break;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    // Prepare payload - only send fields that can be updated
    const payload = {
      description: formData.description,
      companyIntro: formData.companyIntro,
      requirements: formData.requirements,
      responsibilities: formData.responsibilities,
      location: formData.location,
      department: formData.department,
      employmentType: formData.employmentType,
      experienceRequired: formData.experienceRequired,
      salaryRange: formData.salaryRange,
      skills: formData.skills,
      education: formData.education
    };
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${BASE_URL}/api/jobs/${jobId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setSuccess('Job updated successfully!');
        setJob(response.data.data);
        
        // Show success message and then navigate after delay
        setTimeout(() => {
          navigate(`/jobs/${jobId}`);
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges()) {
      setShowCancelDialog(true);
    } else {
      navigate(`/jobs/${jobId}`);
    }
  };

  const hasUnsavedChanges = () => {
    if (!job) return false;
    
    return (
      job.description !== formData.description ||
      job.companyIntro !== formData.companyIntro ||
      JSON.stringify(job.requirements) !== JSON.stringify(formData.requirements) ||
      JSON.stringify(job.responsibilities) !== JSON.stringify(formData.responsibilities) ||
      job.location !== formData.location ||
      job.department !== formData.department ||
      job.employmentType !== formData.employmentType ||
      JSON.stringify(job.experienceRequired) !== JSON.stringify(formData.experienceRequired) ||
      JSON.stringify(job.salaryRange) !== JSON.stringify(formData.salaryRange) ||
      JSON.stringify(job.skills) !== JSON.stringify(formData.skills) ||
      JSON.stringify(job.education) !== JSON.stringify(formData.education)
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!job && !loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Job not found</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/jobs')} sx={{ mt: 2 }}>
          Back to Jobs
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="/dashboard" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
            Dashboard
          </Link>
          <Link color="inherit" href="/jobs" onClick={(e) => { e.preventDefault(); navigate('/jobs'); }}>
            Job Openings
          </Link>
          <Link color="inherit" href={`/jobs/${jobId}`} onClick={(e) => { e.preventDefault(); navigate(`/jobs/${jobId}`); }}>
            {job?.jobId}
          </Link>
          <Typography color="textPrimary">Edit</Typography>
        </Breadcrumbs>
      </Box>

      {/* Main Content */}
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={handleCancel}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Edit Job Opening
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {job?.jobId} • {job?.title}
              </Typography>
            </Box>
            <Chip 
              size="small" 
              label={job?.status} 
              color={job?.status === 'published' ? 'success' : 'default'}
            />
          </Stack>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchJobDetails}
          >
            Refresh
          </Button>
        </Stack>

        {/* Modern Stepper */}
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          connector={<ColorConnector />}
          sx={{ mb: 5, mt: 3 }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>
                <Typography fontWeight={500}>{label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Form */}
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Stack spacing={4}>
            
            {/* Step 1: Basic Information */}
            {activeStep === 0 && (
              <>
                {/* Company Introduction */}
                <TextField
                  label="Company Introduction"
                  name="companyIntro"
                  multiline
                  rows={4}
                  fullWidth
                  value={formData.companyIntro}
                  onChange={handleChange}
                  placeholder="Brief introduction about your company..."
                  required
                  helperText="This will be displayed to candidates"
                />

                {/* Location and Department */}
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Location"
                      name="location"
                      fullWidth
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., Plant Unit A"
                      required
                      InputProps={{
                        startAdornment: <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Department"
                      name="department"
                      fullWidth
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g., Production"
                      required
                      InputProps={{
                        startAdornment: <BusinessIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Employment Type */}
                <FormControl fullWidth required>
                  <InputLabel>Employment Type</InputLabel>
                  <Select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                    label="Employment Type"
                  >
                    {employmentTypes.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {/* Step 2: Job Details */}
            {activeStep === 1 && (
              <>
                {/* Job Description */}
                <TextField
                  label="Job Description"
                  name="description"
                  multiline
                  rows={4}
                  fullWidth
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detailed description of the job role..."
                  required
                />

                {/* Requirements */}
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
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: 50 }}>
                    {formData.requirements.map((req, index) => (
                      <Chip
                        key={index}
                        label={req}
                        onDelete={() => handleRemoveRequirement(index)}
                        color="primary"
                        variant="outlined"
                        deleteIcon={<DeleteIcon />}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Responsibilities */}
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
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: 50 }}>
                    {formData.responsibilities.map((resp, index) => (
                      <Chip
                        key={index}
                        label={resp}
                        onDelete={() => handleRemoveResponsibility(index)}
                        color="secondary"
                        variant="outlined"
                        deleteIcon={<DeleteIcon />}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Experience Range */}
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Min Experience (years)"
                      name="experienceRequired.min"
                      type="number"
                      fullWidth
                      value={formData.experienceRequired.min}
                      onChange={handleChange}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Max Experience (years)"
                      name="experienceRequired.max"
                      type="number"
                      fullWidth
                      value={formData.experienceRequired.max}
                      onChange={handleChange}
                      inputProps={{ min: formData.experienceRequired.min }}
                    />
                  </Grid>
                </Grid>

                {/* Salary Range */}
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Min Salary"
                      name="salaryRange.min"
                      type="number"
                      fullWidth
                      value={formData.salaryRange.min}
                      onChange={handleChange}
                      inputProps={{ min: 0 }}
                      InputProps={{
                        startAdornment: <AttachMoneyIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Max Salary"
                      name="salaryRange.max"
                      type="number"
                      fullWidth
                      value={formData.salaryRange.max}
                      onChange={handleChange}
                      inputProps={{ min: formData.salaryRange.min }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Currency</InputLabel>
                      <Select
                        name="salaryRange.currency"
                        value={formData.salaryRange.currency}
                        onChange={handleChange}
                        label="Currency"
                      >
                        {currencies.map(curr => (
                          <MenuItem key={curr} value={curr}>{curr}</MenuItem>
                        ))}
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
                        deleteIcon={<DeleteIcon />}
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
                        deleteIcon={<DeleteIcon />}
                      />
                    ))}
                  </Box>
                </Box>
              </>
            )}

            {/* Step 3: Review & Save */}
            {activeStep === 2 && (
              <>
                <Alert severity="info" icon={<InfoIcon />}>
                  Please review all the information before saving. You can go back to make changes if needed.
                </Alert>

                {/* Summary Card */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      Summary
                    </Typography>
                    
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">Company</Typography>
                        <Typography>{formData.companyIntro.substring(0, 100)}...</Typography>
                      </Box>
                      
                      <Divider />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="textSecondary">Location</Typography>
                          <Typography>{formData.location}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="textSecondary">Department</Typography>
                          <Typography>{formData.department}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="textSecondary">Employment Type</Typography>
                          <Typography>{formData.employmentType}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="textSecondary">Experience</Typography>
                          <Typography>{formData.experienceRequired.min} - {formData.experienceRequired.max} years</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="textSecondary">Salary Range</Typography>
                          <Typography>{formData.salaryRange.currency} {formData.salaryRange.min.toLocaleString()} - {formData.salaryRange.max.toLocaleString()}</Typography>
                        </Grid>
                      </Grid>
                      
                      <Divider />
                      
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Requirements ({formData.requirements.length})
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {formData.requirements.map((req, idx) => (
                            <Chip key={idx} label={req} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Responsibilities ({formData.responsibilities.length})
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {formData.responsibilities.map((resp, idx) => (
                            <Chip key={idx} label={resp} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Skills ({formData.skills.length})
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {formData.skills.map((skill, idx) => (
                            <Chip key={idx} label={skill} size="small" />
                          ))}
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Error/Success Messages */}
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                startIcon={<CancelIcon />}
              >
                Cancel
              </Button>
              
              <Box>
                {activeStep > 0 && (
                  <Button onClick={handleBack} sx={{ mr: 1 }}>
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
                    disabled={saving}
                    startIcon={!saving && <SaveIcon />}
                    sx={{
                      background: 'linear-gradient(135deg, #164e63, #00B4D8)',
                      '&:hover': { opacity: 0.9 }
                    }}
                  >
                    {saving ? <CircularProgress size={24} /> : 'Save Changes'}
                  </Button>
                )}
              </Box>
            </Box>
          </Stack>
        </Box>
      </Paper>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)}>
        <DialogTitle>Discard Changes?</DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes. Are you sure you want to leave without saving?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)}>Continue Editing</Button>
          <Button 
            onClick={() => navigate(`/jobs/${jobId}`)} 
            color="error"
            variant="contained"
          >
            Discard Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditJobOpening;