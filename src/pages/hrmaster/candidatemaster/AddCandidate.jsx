import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Alert,
  Typography,
  Paper,
  Box,
  IconButton,
  TextField,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  styled,
  StepConnector,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

// Custom Stepper Connector
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

const steps = ["Personal Information", "Address", "Education & Skills", "Experience"];

const AddCandidate = ({ open, onClose, onAdd, jobId = '' }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'India',
      pincode: ''
    },
    skills: [],
    experience: [{
      company: '',
      position: '',
      fromDate: '',
      toDate: '',
      current: false,
      description: ''
    }],
    education: [{
      degree: '',
      institution: '',
      yearOfPassing: '',
      specialization: ''
    }],
    source: 'walkin',
    jobId: jobId
  });

  const [skillInput, setSkillInput] = useState('');

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  // Experience handlers
  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...formData.experience];
    updatedExperience[index][field] = value;
    
    if (field === 'current' && value === true) {
      updatedExperience[index].toDate = '';
    }
    
    setFormData(prev => ({
      ...prev,
      experience: updatedExperience
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: '',
          position: '',
          fromDate: '',
          toDate: '',
          current: false,
          description: ''
        }
      ]
    }));
  };

  const removeExperience = (index) => {
    if (formData.experience.length > 1) {
      setFormData(prev => ({
        ...prev,
        experience: prev.experience.filter((_, i) => i !== index)
      }));
    }
  };

  // Education handlers
  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index][field] = value;
    setFormData(prev => ({
      ...prev,
      education: updatedEducation
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          degree: '',
          institution: '',
          yearOfPassing: '',
          specialization: ''
        }
      ]
    }));
  };

  const removeEducation = (index) => {
    if (formData.education.length > 1) {
      setFormData(prev => ({
        ...prev,
        education: prev.education.filter((_, i) => i !== index)
      }));
    }
  };

  // Skills handlers
  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // Validation
  const validateStep = () => {
    switch(activeStep) {
      case 0: // Personal Information
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
          setError('Please fill all required fields');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Please enter a valid email');
          return false;
        }
        if (!/^\d{10}$/.test(formData.phone)) {
          setError('Please enter a valid 10-digit phone number');
          return false;
        }
        break;
      case 1: // Address
        if (!formData.address.street || !formData.address.city || 
            !formData.address.state || !formData.address.pincode) {
          setError('Please fill complete address');
          return false;
        }
        if (!/^\d{6}$/.test(formData.address.pincode)) {
          setError('Please enter a valid 6-digit pincode');
          return false;
        }
        break;
      case 2: // Education & Skills
        if (!formData.education[0].degree || !formData.education[0].institution || !formData.education[0].yearOfPassing) {
          setError('Please fill at least one education entry');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (validateStep()) {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/api/candidates`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccess('Candidate added successfully!');
        setTimeout(() => {
          onAdd(response.data.data);
          resetForm();
          onClose();
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to add candidate');
      }
    } catch (err) {
      console.error('Error adding candidate:', err);
      setError(err.response?.data?.message || 'Failed to add candidate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: 'India',
        pincode: ''
      },
      skills: [],
      experience: [{
        company: '',
        position: '',
        fromDate: '',
        toDate: '',
        current: false,
        description: ''
      }],
      education: [{
        degree: '',
        institution: '',
        yearOfPassing: '',
        specialization: ''
      }],
      source: 'walkin',
      jobId: jobId
    });
    setActiveStep(0);
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Render step content
  const renderStepContent = (step) => {
    switch(step) {
      case 0:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#101010' }}>
              <PersonIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#1976D2' }} />
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name *"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  size="small"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name *"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  size="small"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  size="small"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone *"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  size="small"
                  required
                  placeholder="10 digit number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    label="Gender"
                  >
                    <MenuItem value="">Select Gender</MenuItem>
                    <MenuItem value="M">Male</MenuItem>
                    <MenuItem value="F">Female</MenuItem>
                    <MenuItem value="O">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#101010' }}>
              <LocationIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#1976D2' }} />
              Address Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street *"
                  name="street"
                  value={formData.address.street}
                  onChange={handleAddressChange}
                  size="small"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City *"
                  name="city"
                  value={formData.address.city}
                  onChange={handleAddressChange}
                  size="small"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State *"
                  name="state"
                  value={formData.address.state}
                  onChange={handleAddressChange}
                  size="small"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={formData.address.country}
                  onChange={handleAddressChange}
                  size="small"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pincode *"
                  name="pincode"
                  value={formData.address.pincode}
                  onChange={handleAddressChange}
                  size="small"
                  required
                  placeholder="6 digit pincode"
                />
              </Grid>
            </Grid>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={4}>
            {/* Education Section */}
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#101010' }}>
                <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#1976D2' }} />
                Education
              </Typography>
              
              {formData.education.map((edu, index) => (
                <Paper key={index} elevation={0} sx={{ p: 2, bgcolor: '#F9F9F9', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Education #{index + 1}
                    </Typography>
                    {formData.education.length > 1 && (
                      <IconButton size="small" onClick={() => removeEducation(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Degree *"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                        size="small"
                        required={index === 0}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Institution *"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                        size="small"
                        required={index === 0}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Year of Passing *"
                        type="number"
                        value={edu.yearOfPassing}
                        onChange={(e) => handleEducationChange(index, 'yearOfPassing', e.target.value)}
                        size="small"
                        required={index === 0}
                        inputProps={{ min: 1900, max: new Date().getFullYear() }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Specialization"
                        value={edu.specialization}
                        onChange={(e) => handleEducationChange(index, 'specialization', e.target.value)}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                onClick={addEducation}
                variant="outlined"
                size="small"
                sx={{ alignSelf: 'flex-start', borderRadius: 1.5 }}
              >
                Add Another Education
              </Button>
            </Stack>

            {/* Skills Section */}
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#101010' }}>
                Skills
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Enter a skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleAddSkill}
                  disabled={!skillInput.trim()}
                  sx={{ borderRadius: 1.5, textTransform: 'none' }}
                >
                  Add
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => handleRemoveSkill(skill)}
                    sx={{
                      bgcolor: '#E3F2FD',
                      color: '#1976D2',
                      '& .MuiChip-deleteIcon': { color: '#1976D2' }
                    }}
                  />
                ))}
              </Box>
            </Stack>
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#101010' }}>
              <WorkIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#1976D2' }} />
              Work Experience
            </Typography>
            
            {formData.experience.map((exp, index) => (
              <Paper key={index} elevation={0} sx={{ p: 2, bgcolor: '#F9F9F9', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Experience #{index + 1}
                  </Typography>
                  {formData.experience.length > 1 && (
                    <IconButton size="small" onClick={() => removeExperience(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Position"
                      value={exp.position}
                      onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      label="From Date"
                      type="date"
                      value={exp.fromDate}
                      onChange={(e) => handleExperienceChange(index, 'fromDate', e.target.value)}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      label="To Date"
                      type="date"
                      value={exp.toDate}
                      onChange={(e) => handleExperienceChange(index, 'toDate', e.target.value)}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      disabled={exp.current}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={exp.current}
                          onChange={(e) => handleExperienceChange(index, 'current', e.target.checked)}
                        />
                      }
                      label="Current"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={exp.description}
                      onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                      multiline
                      rows={2}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}
            
            <Button
              startIcon={<AddIcon />}
              onClick={addExperience}
              variant="outlined"
              size="small"
              sx={{ alignSelf: 'flex-start', borderRadius: 1.5 }}
            >
              Add Another Experience
            </Button>

            {/* Source Selection */}
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Source</InputLabel>
                <Select
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  label="Source"
                >
                  <MenuItem value="walkin">Walk-in</MenuItem>
                  <MenuItem value="portal">Job Portal</MenuItem>
                  <MenuItem value="referral">Referral</MenuItem>
                  <MenuItem value="consultant">Consultant</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Box>
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
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #E0E0E0', 
        pb: 2,
        backgroundColor: '#F8FAFC',
        position: 'sticky',
        top: 0,
        zIndex: 2
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600} color="#101010">
            Add New Candidate
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={4}>
          {/* Stepper */}
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            connector={<ColorConnector />}
            sx={{ mb: 2 }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>
                  <Typography variant="body2" fontWeight={500}>
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Progress Bar */}
          <Box sx={{ width: '100%', mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Step {activeStep + 1} of {steps.length}
              </Typography>
              <Typography variant="caption" fontWeight={600} color="#1976D2">
                {Math.round(((activeStep + 1) / steps.length) * 100)}% Complete
              </Typography>
            </Box>
            <Box sx={{ width: '100%', bgcolor: '#E0E0E0', borderRadius: 2, height: 6 }}>
              <Box
                sx={{
                  width: `${((activeStep + 1) / steps.length) * 100}%`,
                  background: 'linear-gradient(90deg, #164e63, #00B4D8)',
                  borderRadius: 2,
                  height: 6,
                  transition: 'width 0.3s ease'
                }}
              />
            </Box>
          </Box>

          <Divider />

          {/* Step Content */}
          {renderStepContent(activeStep)}

          {/* Error/Success Messages */}
          {error && (
            <Alert severity="error" sx={{ borderRadius: 1 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ borderRadius: 1 }}>
              {success}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ 
        px: 3, 
        py: 2, 
        borderTop: '1px solid #E0E0E0', 
        backgroundColor: '#F8FAFC',
        position: 'sticky',
        bottom: 0,
        zIndex: 1,
        justifyContent: 'space-between'
      }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0 || loading}
          sx={{ borderRadius: 1.5, textTransform: 'none' }}
        >
          Back
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{ borderRadius: 1.5, textTransform: 'none' }}
          >
            Cancel
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                borderRadius: 1.5,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #164e63, #00B4D8)',
                '&:hover': { opacity: 0.9 }
              }}
            >
              {loading ? 'Adding...' : 'Add Candidate'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{
                borderRadius: 1.5,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #164e63, #00B4D8)',
                '&:hover': { opacity: 0.9 }
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

export default AddCandidate;