import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Chip,
  Divider,
  Grid,
  Box,
  Paper,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  InputAdornment
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  LinkedIn as LinkedInIcon,
  Language as LanguageIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  CloudUpload as CloudUploadIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Badge as BadgeIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';
import { StarIcon } from 'lucide-react';

// Status options based on backend enum
const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: '#1976D2', bg: '#E3F2FD', icon: <PendingIcon /> },
  { value: 'contacted', label: 'Contacted', color: '#7B1FA2', bg: '#F3E5F5', icon: <PersonIcon /> },
  { value: 'shortlisted', label: 'Shortlisted', color: '#2E7D32', bg: '#E8F5E8', icon: <ThumbUpIcon /> },
  { value: 'interviewed', label: 'Interviewed', color: '#0288D1', bg: '#E1F5FE', icon: <PersonIcon /> },
  { value: 'selected', label: 'Selected', color: '#2E7D32', bg: '#E8F5E8', icon: <CheckCircleIcon /> },
  { value: 'rejected', label: 'Rejected', color: '#C62828', bg: '#FFEBEE', icon: <ThumbDownIcon /> },
  { value: 'onHold', label: 'On Hold', color: '#FF8F00', bg: '#FFF8E1', icon: <PendingIcon /> },
  { value: 'joined', label: 'Joined', color: '#1B5E20', bg: '#E8F5E8', icon: <CheckCircleIcon /> }
];

// Source options based on backend enum
const SOURCE_OPTIONS = [
  { value: 'naukri', label: 'Naukri', icon: <LanguageIcon />, color: '#FF5722' },
  { value: 'linkedin', label: 'LinkedIn', icon: <LinkedInIcon />, color: '#0077B5' },
  { value: 'indeed', label: 'Indeed', icon: <WorkIcon />, color: '#003A9B' },
  { value: 'walkin', label: 'Walk-in', icon: <PersonIcon />, color: '#4CAF50' },
  { value: 'reference', label: 'Reference', icon: <PeopleIcon />, color: '#9C27B0' },
  { value: 'careerPage', label: 'Career Page', icon: <BusinessIcon />, color: '#FF9800' },
  { value: 'upload', label: 'Upload', icon: <CloudUploadIcon />, color: '#00BCD4' },
  { value: 'other', label: 'Other', icon: <PersonIcon />, color: '#9E9E9E' }
];

const EditCandidate = ({ open, onClose, onUpdate, candidateId, candidateData }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [candidate, setCandidate] = useState(candidateData || null);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternativePhone: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'India',
      pincode: ''
    },
    education: [],
    experience: [],
    skills: [],
    source: 'other',
    sourceUrl: '',
    referredBy: '',
    tags: [],
    status: 'new',
    jobId: ''
  });

  // New item states for dynamic arrays
  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    yearOfPassing: '',
    percentage: '',
    specialization: ''
  });
  const [newExperience, setNewExperience] = useState({
    company: '',
    position: '',
    fromDate: '',
    toDate: '',
    current: false,
    description: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [newTag, setNewTag] = useState('');

  const steps = [
    'Personal Info',
    'Address',
    'Education',
    'Experience',
    'Skills & Source',
    'Status & Job'
  ];

  // Fetch candidate details if not provided
  useEffect(() => {
    if (open) {
      fetchJobs();
      if (candidateData) {
        setCandidate(candidateData);
        populateFormData(candidateData);
      } else if (candidateId) {
        fetchCandidateDetails();
      }
    }
  }, [open, candidateData, candidateId]);

  const fetchCandidateDetails = async () => {
    setFetchLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/candidates/${candidateId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const candidateData = response.data.data;
        setCandidate(candidateData);
        populateFormData(candidateData);
      } else {
        setError(response.data.message || 'Failed to fetch candidate details');
      }
    } catch (err) {
      console.error('Error fetching candidate details:', err);
      setError(err.response?.data?.message || 'Failed to fetch candidate details');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/jobs?status=published`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setAvailableJobs(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setJobsLoading(false);
    }
  };

  const populateFormData = (data) => {
    setFormData({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone || '',
      alternativePhone: data.alternativePhone || '',
      dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
      gender: data.gender || '',
      address: {
        street: data.address?.street || '',
        city: data.address?.city || '',
        state: data.address?.state || '',
        country: data.address?.country || 'India',
        pincode: data.address?.pincode || ''
      },
      education: data.education || [],
      experience: data.experience || [],
      skills: data.skills || [],
      source: data.source || 'other',
      sourceUrl: data.sourceUrl || '',
      referredBy: data.referredBy || '',
      tags: data.tags || [],
      status: data.status || 'new',
      jobId: data.jobId || data.latestApplication?.jobId?._id || ''
    });
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
  };

  // Education handlers
  const handleAddEducation = () => {
    if (newEducation.degree && newEducation.institution) {
      setFormData(prev => ({
        ...prev,
        education: [...prev.education, { ...newEducation, _id: Date.now().toString() }]
      }));
      setNewEducation({
        degree: '',
        institution: '',
        yearOfPassing: '',
        percentage: '',
        specialization: ''
      });
    }
  };

  const handleRemoveEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  // Experience handlers
  const handleAddExperience = () => {
    if (newExperience.company && newExperience.position) {
      setFormData(prev => ({
        ...prev,
        experience: [...prev.experience, { ...newExperience, _id: Date.now().toString() }]
      }));
      setNewExperience({
        company: '',
        position: '',
        fromDate: '',
        toDate: '',
        current: false,
        description: ''
      });
    }
  };

  const handleRemoveExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  // Skills handlers
  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  // Tags handlers
  const handleAddTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.firstName) return 'First name is required';
    if (!formData.lastName) return 'Last name is required';
    if (!formData.email) return 'Email is required';
    if (!formData.phone) return 'Phone is required';
    if (!formData.source) return 'Source is required';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const candidateIdToUpdate = candidate?._id || candidateId;

      const response = await axios.put(
        `${BASE_URL}/api/candidates/${candidateIdToUpdate}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess('Candidate updated successfully!');
        setTimeout(() => {
          onUpdate(response.data.data);
          handleClose();
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to update candidate');
      }
    } catch (err) {
      console.error('Error updating candidate:', err);
      setError(err.response?.data?.message || 'Failed to update candidate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !fetchLoading) {
      setActiveStep(0);
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Paper sx={{ p: 3, bgcolor: '#FFFFFF', borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ color: '#1976D2' }} />
              Personal Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="First Name *"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Last Name *"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Phone *"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Alternative Phone"
                  name="alternativePhone"
                  value={formData.alternativePhone}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    label="Gender"
                  >
                    <MenuItem value="M">Male</MenuItem>
                    <MenuItem value="F">Female</MenuItem>
                    <MenuItem value="O">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        );

      case 1:
        return (
          <Paper sx={{ p: 3, bgcolor: '#FFFFFF', borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon sx={{ color: '#1976D2' }} />
              Address Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Street"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="City"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="State"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Pincode"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </Paper>
        );

      case 2:
        return (
          <Stack spacing={2}>
            {/* Add New Education */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF', borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon sx={{ color: '#1976D2' }} />
                Add Education
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Degree *"
                    value={newEducation.degree}
                    onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Institution *"
                    value={newEducation.institution}
                    onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Year"
                    type="number"
                    value={newEducation.yearOfPassing}
                    onChange={(e) => setNewEducation({ ...newEducation, yearOfPassing: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Percentage"
                    type="number"
                    value={newEducation.percentage}
                    onChange={(e) => setNewEducation({ ...newEducation, percentage: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Specialization"
                    value={newEducation.specialization}
                    onChange={(e) => setNewEducation({ ...newEducation, specialization: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddEducation}
                    disabled={!newEducation.degree || !newEducation.institution}
                    sx={{ borderRadius: 1.5, textTransform: 'none' }}
                  >
                    Add Education
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Education List */}
            {formData.education.length > 0 && (
              <Paper sx={{ p: 3, bgcolor: '#FFFFFF', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Education History
                </Typography>
                {formData.education.map((edu, index) => (
                  <Paper key={edu._id || index} sx={{ p: 2, bgcolor: '#F8FAFC', mb: 2, position: 'relative' }}>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveEducation(index)}
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="textSecondary">Degree</Typography>
                        <Typography variant="body2">{edu.degree}</Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="textSecondary">Institution</Typography>
                        <Typography variant="body2">{edu.institution}</Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography variant="caption" color="textSecondary">Year</Typography>
                        <Typography variant="body2">{edu.yearOfPassing}</Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography variant="caption" color="textSecondary">Percentage</Typography>
                        <Typography variant="body2">{edu.percentage}%</Typography>
                      </Grid>
                      {edu.specialization && (
                        <Grid item xs={12}>
                          <Typography variant="caption" color="textSecondary">Specialization</Typography>
                          <Typography variant="body2">{edu.specialization}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                ))}
              </Paper>
            )}
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={2}>
            {/* Add New Experience */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF', borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <WorkIcon sx={{ color: '#1976D2' }} />
                Add Experience
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Company *"
                    value={newExperience.company}
                    onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Position *"
                    value={newExperience.position}
                    onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="From Date"
                    type="date"
                    value={newExperience.fromDate}
                    onChange={(e) => setNewExperience({ ...newExperience, fromDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="To Date"
                    type="date"
                    value={newExperience.toDate}
                    onChange={(e) => setNewExperience({ ...newExperience, toDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    disabled={newExperience.current}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Current</InputLabel>
                    <Select
                      value={newExperience.current}
                      onChange={(e) => setNewExperience({ ...newExperience, current: e.target.value })}
                      label="Current"
                    >
                      <MenuItem value={false}>No</MenuItem>
                      <MenuItem value={true}>Yes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Description"
                    multiline
                    rows={2}
                    value={newExperience.description}
                    onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddExperience}
                    disabled={!newExperience.company || !newExperience.position}
                    sx={{ borderRadius: 1.5, textTransform: 'none' }}
                  >
                    Add Experience
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Experience List */}
            {formData.experience.length > 0 && (
              <Paper sx={{ p: 3, bgcolor: '#FFFFFF', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Experience History
                </Typography>
                {formData.experience.map((exp, index) => (
                  <Paper key={exp._id || index} sx={{ p: 2, bgcolor: '#F8FAFC', mb: 2, position: 'relative' }}>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveExperience(index)}
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="textSecondary">Company</Typography>
                        <Typography variant="body2">{exp.company}</Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="textSecondary">Position</Typography>
                        <Typography variant="body2">{exp.position}</Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="textSecondary">Duration</Typography>
                        <Typography variant="body2">
                          {exp.fromDate ? new Date(exp.fromDate).toLocaleDateString() : 'N/A'} - 
                          {exp.current ? 'Present' : (exp.toDate ? new Date(exp.toDate).toLocaleDateString() : 'N/A')}
                        </Typography>
                      </Grid>
                      {exp.description && (
                        <Grid item xs={12}>
                          <Typography variant="caption" color="textSecondary">Description</Typography>
                          <Typography variant="body2">{exp.description}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                ))}
              </Paper>
            )}
          </Stack>
        );

      case 4:
        return (
          <Stack spacing={2}>
            {/* Skills Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF', borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon sx={{ color: '#1976D2' }} />
                Skills
              </Typography>

              {/* Add New Skill */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  sx={{ flex: 1 }}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddSkill}
                  disabled={!newSkill.trim()}
                  sx={{ borderRadius: 1.5, textTransform: 'none' }}
                >
                  Add
                </Button>
              </Box>

              {/* Skills List */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formData.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => handleRemoveSkill(index)}
                    sx={{
                      bgcolor: '#E3F2FD',
                      color: '#1976D2',
                      '& .MuiChip-deleteIcon': { color: '#1976D2' }
                    }}
                  />
                ))}
              </Box>
            </Paper>

            {/* Source Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF', borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LanguageIcon sx={{ color: '#1976D2' }} />
                Source Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Source *</InputLabel>
                    <Select
                      name="source"
                      value={formData.source}
                      onChange={handleInputChange}
                      label="Source *"
                    >
                      {SOURCE_OPTIONS.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {option.icon}
                            {option.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Source URL"
                    name="sourceUrl"
                    value={formData.sourceUrl}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Referred By"
                    name="referredBy"
                    value={formData.referredBy}
                    onChange={handleInputChange}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Tags Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF', borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BadgeIcon sx={{ color: '#1976D2' }} />
                Tags
              </Typography>

              {/* Add New Tag */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  sx={{ flex: 1 }}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                  sx={{ borderRadius: 1.5, textTransform: 'none' }}
                >
                  Add
                </Button>
              </Box>

              {/* Tags List */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(index)}
                    sx={{
                      bgcolor: '#E8F5E8',
                      color: '#2E7D32',
                      '& .MuiChip-deleteIcon': { color: '#2E7D32' }
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Stack>
        );

      case 5:
        return (
          <Stack spacing={2}>
            {/* Status Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF', borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BadgeIcon sx={{ color: '#1976D2' }} />
                Status & Job Assignment
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Status *</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      label="Status *"
                    >
                      {STATUS_OPTIONS.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {option.icon}
                            {option.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Assign to Job</InputLabel>
                    <Select
                      name="jobId"
                      value={formData.jobId}
                      onChange={handleInputChange}
                      label="Assign to Job"
                      disabled={jobsLoading}
                    >
                      <MenuItem value="">None</MenuItem>
                      {availableJobs.map(job => (
                        <MenuItem key={job._id} value={job._id}>
                          <Box>
                            <Typography variant="body2">{job.title}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {job.jobId} - {job.location}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* Preview Card */}
            <Paper sx={{ p: 3, bgcolor: '#F8FAFC', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Candidate Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Name</Typography>
                  <Typography variant="body2">{formData.firstName} {formData.lastName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Email</Typography>
                  <Typography variant="body2">{formData.email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Status</Typography>
                  <Chip
                    size="small"
                    label={STATUS_OPTIONS.find(s => s.value === formData.status)?.label || formData.status}
                    sx={{
                      bgcolor: STATUS_OPTIONS.find(s => s.value === formData.status)?.bg,
                      color: STATUS_OPTIONS.find(s => s.value === formData.status)?.color
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Source</Typography>
                  <Typography variant="body2">{SOURCE_OPTIONS.find(s => s.value === formData.source)?.label || formData.source}</Typography>
                </Grid>
              </Grid>
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
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, maxHeight: '90vh' } }}
    >
      <DialogTitle sx={{
        borderBottom: '1px solid #E0E0E0',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 2,
        px: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon sx={{ color: '#1976D2' }} />
          <Typography variant="h6" fontWeight={600}>
            Edit Candidate
          </Typography>
          {candidate && (
            <Chip
              label={candidate.candidateId}
              size="small"
              sx={{
                bgcolor: '#E3F2FD',
                color: '#1976D2',
                fontWeight: 500,
                height: 24,
                fontSize: '12px',
                ml: 1
              }}
            />
          )}
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {fetchLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <CircularProgress size={40} sx={{ color: '#1976D2' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        ) : (
          <>
            <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 1 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ minHeight: 500 }}>
              {getStepContent(activeStep)}
            </Box>

            {success && (
              <Alert severity="success" sx={{ mt: 3 }}>
                {success}
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{
        px: 3,
        py: 2,
        borderTop: '1px solid #E0E0E0',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={loading || fetchLoading}
          sx={{ borderRadius: 1.5, textTransform: 'none', px: 3 }}
        >
          Cancel
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
            sx={{ borderRadius: 1.5, textTransform: 'none' }}
          >
            Back
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || fetchLoading}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              sx={{
                borderRadius: 1.5,
                textTransform: 'none',
                px: 4,
                backgroundColor: '#1976D2',
                '&:hover': { backgroundColor: '#1565C0' }
              }}
            >
              {loading ? 'Saving...' : 'Update Candidate'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderRadius: 1.5,
                textTransform: 'none',
                px: 4,
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

export default EditCandidate;