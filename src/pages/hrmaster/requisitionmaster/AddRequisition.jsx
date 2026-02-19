import React, { useState, useEffect } from 'react';
import {
  // Layout components
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  Grid,
  Card,
  CardContent,
  
  // Form components
  TextField,
  FormControl,
  FormLabel,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  Switch,
  Autocomplete,
  
  // Feedback components
  Alert,
  AlertTitle,
  Snackbar,
  CircularProgress,
  
  // Data display
  Typography,
  Chip,
  Divider,
  Avatar,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  
  // Buttons and actions
  Button,
  IconButton,
  ButtonGroup,
  Fab,
  
  // Navigation
  Breadcrumbs,
  Link,
  
  // Surfaces
  AppBar,
  Toolbar,
  Drawer,
  styled,
  
  // Utils
  Stack,
  Grow,
  Fade,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,  // 👈 Keep only ONE set of Dialog imports
  
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, NavigateNext as NavigateNextIcon, NavigateBefore as NavigateBeforeIcon } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

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

const AddRequisition = ({ open, onClose, onAdd }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    department: null,
    location: '',
    positionTitle: '',
    noOfPositions: '',
    employmentType: '',
    reasonForHire: '',
    education: '',
    experienceYears: '',
    skills: [],
    budgetMin: '',
    budgetMax: '',
    grade: '',
    justification: '',
    priority: 'Medium',
    targetHireDate: ''
  });

  // Department dropdown state
  const [departments, setDepartments] = useState([]);
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [departmentPage, setDepartmentPage] = useState(1);
  const [departmentTotalPages, setDepartmentTotalPages] = useState(1);
  const [departmentInputValue, setDepartmentInputValue] = useState('');

  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);

  // Steps definition
  const steps = ['Basic Info', 'Qualifications & Budget', 'Review & Submit']; // Added 3rd step

  // Priorities
  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  // Fetch departments from API
  const fetchDepartments = async (search = '', page = 1) => {
    setDepartmentLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/departments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          page: page,
          limit: 10,
          search: search
        }
      });

      if (response.data.success) {
        if (page === 1) {
          setDepartments(response.data.data || []);
        } else {
          setDepartments(prev => [...prev, ...(response.data.data || [])]);
        }
        setDepartmentTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    } finally {
      setDepartmentLoading(false);
    }
  };

  // Load departments when dropdown opens
  useEffect(() => {
    if (departmentOpen) {
      fetchDepartments(departmentSearch, 1);
    }
  }, [departmentOpen]);

  // Search departments with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (departmentOpen) {
        setDepartmentPage(1);
        fetchDepartments(departmentSearch, 1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [departmentSearch, departmentOpen]);

  // Handle department scroll load more
  const handleDepartmentScroll = (event) => {
    const listboxNode = event.currentTarget;
    if (listboxNode.scrollTop + listboxNode.clientHeight >= listboxNode.scrollHeight - 50) {
      if (departmentPage < departmentTotalPages && !departmentLoading) {
        const nextPage = departmentPage + 1;
        setDepartmentPage(nextPage);
        fetchDepartments(departmentSearch, nextPage);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    if (value === '' || /^\d+$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      if (fieldErrors[name]) {
        setFieldErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };

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

  const validateStep = (step) => {
    const errors = {};

    if (step === 0) {
      if (!formData.department) {
        errors.department = 'Department is required';
      }
      if (!formData.location.trim()) {
        errors.location = 'Location is required';
      }
      if (!formData.positionTitle.trim()) {
        errors.positionTitle = 'Position title is required';
      }
      if (!formData.noOfPositions) {
        errors.noOfPositions = 'Number of positions is required';
      } else if (parseInt(formData.noOfPositions) < 1) {
        errors.noOfPositions = 'Must be at least 1 position';
      }
      if (!formData.employmentType.trim()) {
        errors.employmentType = 'Employment type is required';
      }
      if (!formData.reasonForHire.trim()) {
        errors.reasonForHire = 'Reason for hire is required';
      }
      if (!formData.grade.trim()) {
        errors.grade = 'Grade is required';
      }
    } else if (step === 1) {
      if (!formData.education.trim()) {
        errors.education = 'Education requirement is required';
      }
      if (!formData.experienceYears) {
        errors.experienceYears = 'Experience years is required';
      } else if (parseInt(formData.experienceYears) < 0) {
        errors.experienceYears = 'Experience years cannot be negative';
      }
      if (!formData.budgetMin) {
        errors.budgetMin = 'Minimum budget is required';
      }
      if (!formData.budgetMax) {
        errors.budgetMax = 'Maximum budget is required';
      } else if (formData.budgetMin && formData.budgetMax &&
        parseInt(formData.budgetMax) <= parseInt(formData.budgetMin)) {
        errors.budgetMax = 'Maximum budget must be greater than minimum budget';
      }
      if (!formData.justification.trim()) {
        errors.justification = 'Justification is required';
      }
      if (!formData.targetHireDate) {
        errors.targetHireDate = 'Target hire date is required';
      }
    }

    setFieldErrors(errors);
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

  const handleSubmit = async () => {
    if (!validateStep(1)) {
      setError('Please fill in all required fields correctly');
      return;
    }

    setLoading(true);
    setError('');
    setValidationErrors([]);

    try {
      const token = localStorage.getItem('token');

      // Prepare data according to API expectations
      const submitData = {
        department: formData.department?.DepartmentName || formData.department,
        location: formData.location,
        positionTitle: formData.positionTitle,
        noOfPositions: parseInt(formData.noOfPositions),
        employmentType: formData.employmentType,
        reasonForHire: formData.reasonForHire,
        education: formData.education,
        experienceYears: parseInt(formData.experienceYears),
        skills: formData.skills,
        budgetMin: parseInt(formData.budgetMin),
        budgetMax: parseInt(formData.budgetMax),
        grade: formData.grade,
        justification: formData.justification,
        priority: formData.priority,
        targetHireDate: formData.targetHireDate
      };

      console.log('Submitting data:', submitData);

      const response = await axios.post(`${BASE_URL}/api/requisitions`, submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        onAdd(response.data.data);
        resetForm();
        onClose();
      } else {
        setError(response.data.message || 'Failed to create requisition');
      }
    } catch (err) {
      console.error('Error creating requisition:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);

        // Handle validation errors from backend
        if (err.response.data.errors) {
          setValidationErrors(err.response.data.errors);

          // Map backend errors to field errors
          const backendErrors = {};
          err.response.data.errors.forEach(error => {
            if (error.field) {
              backendErrors[error.field] = error.message;
            }
          });
          setFieldErrors(backendErrors);
        }

        setError(err.response.data?.message || 'Failed to create requisition. Please try again.');
      } else {
        setError('Failed to create requisition. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      department: null,
      location: '',
      positionTitle: '',
      noOfPositions: '',
      employmentType: '',
      reasonForHire: '',
      education: '',
      experienceYears: '',
      skills: [],
      budgetMin: '',
      budgetMax: '',
      grade: '',
      justification: '',
      priority: 'Medium',
      targetHireDate: ''
    });
    setSkillInput('');
    setError('');
    setFieldErrors({});
    setValidationErrors([]);
    setActiveStep(0);
    setDepartmentSearch('');
    setDepartmentInputValue('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={2}>
            {/* Basic Information - Compact Grid */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Basic Information
              </Typography>

              <Grid container spacing={1.5}>
                {/* First Row: Department (Full Width) */}
                <Grid size={{ xs: 12 }}>
                  <Autocomplete
                    size="small"
                    id="department-autocomplete"
                    open={departmentOpen}
                    onOpen={() => setDepartmentOpen(true)}
                    onClose={() => setDepartmentOpen(false)}
                    options={departments}
                    loading={departmentLoading}
                    value={formData.department}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({ ...prev, department: newValue }));
                      if (fieldErrors.department) setFieldErrors(prev => ({ ...prev, department: '' }));
                    }}
                    inputValue={departmentInputValue}
                    onInputChange={(event, newInputValue) => {
                      setDepartmentInputValue(newInputValue);
                      setDepartmentSearch(newInputValue);
                    }}
                    getOptionLabel={(option) => option?.DepartmentName || ''}
                    fullWidth
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Department"
                        required
                        error={!!fieldErrors.department}
                        helperText={fieldErrors.department}
                        size="small"
                        placeholder="Select department"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1
                          }
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {departmentLoading ? <CircularProgress size={16} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <MenuItem {...props} key={option._id} sx={{ py: 0.5 }}>
                        <Typography variant="body2">{option.DepartmentName}</Typography>
                      </MenuItem>
                    )}
                    ListboxProps={{ onScroll: handleDepartmentScroll, style: { maxHeight: 200 } }}
                  />
                </Grid>

                {/* Second Row: Location, Position Title, No. of Positions */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    error={!!fieldErrors.location}
                    helperText={fieldErrors.location}
                    placeholder="e.g., Plant Unit A"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Position Title"
                    name="positionTitle"
                    value={formData.positionTitle}
                    onChange={handleChange}
                    required
                    error={!!fieldErrors.positionTitle}
                    helperText={fieldErrors.positionTitle}
                    placeholder="e.g., Machine Operator"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="No. of Positions"
                    name="noOfPositions"
                    value={formData.noOfPositions}
                    onChange={handleNumberChange}
                    required
                    type="number"
                    inputProps={{ min: 1 }}
                    error={!!fieldErrors.noOfPositions}
                    helperText={fieldErrors.noOfPositions}
                    placeholder="e.g., 3"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Employment Details - Compact Grid */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Employment Details
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}>
                    <InputLabel>Employment Type *</InputLabel>
                    <Select
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleChange}
                      label="Employment Type *"
                      required
                      error={!!fieldErrors.employmentType}
                    >
                      <MenuItem value="Permanent">Permanent</MenuItem>
                      <MenuItem value="Contract">Contract</MenuItem>
                      <MenuItem value="Temporary">Temporary</MenuItem>
                      <MenuItem value="Internship">Internship</MenuItem>
                    </Select>
                    {fieldErrors.employmentType && (
                      <FormHelperText error>{fieldErrors.employmentType}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}>
                    <InputLabel>Reason for Hire *</InputLabel>
                    <Select
                      name="reasonForHire"
                      value={formData.reasonForHire}
                      onChange={handleChange}
                      label="Reason for Hire *"
                      required
                      error={!!fieldErrors.reasonForHire}
                    >
                      <MenuItem value="New Unit">New Unit</MenuItem>
                      <MenuItem value="Replacement">Replacement</MenuItem>
                      <MenuItem value="New Position">New Position</MenuItem>
                      <MenuItem value="Project Based">Project Based</MenuItem>
                      <MenuItem value="Others">Others</MenuItem>
                    </Select>
                    {fieldErrors.reasonForHire && (
                      <FormHelperText error>{fieldErrors.reasonForHire}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    required
                    error={!!fieldErrors.grade}
                    helperText={fieldErrors.grade}
                    placeholder="e.g., Level 2"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}>
                    <InputLabel>Priority *</InputLabel>
                    <Select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      label="Priority *"
                      required
                    >
                      {priorities.map(priority => (
                        <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* Budget & Additional */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Budget & Additional Info
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Budget Min (₹)"
                    name="budgetMin"
                    value={formData.budgetMin}
                    onChange={handleNumberChange}
                    required
                    type="number"
                    error={!!fieldErrors.budgetMin}
                    helperText={fieldErrors.budgetMin}
                    placeholder="e.g., 18000"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Budget Max (₹)"
                    name="budgetMax"
                    value={formData.budgetMax}
                    onChange={handleNumberChange}
                    required
                    type="number"
                    error={!!fieldErrors.budgetMax}
                    helperText={fieldErrors.budgetMax}
                    placeholder="e.g., 28000"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Target Hire Date"
                    name="targetHireDate"
                    type="date"
                    value={formData.targetHireDate}
                    onChange={handleChange}
                    required
                    error={!!fieldErrors.targetHireDate}
                    helperText={fieldErrors.targetHireDate}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Justification - Compact */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                Justification
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="justification"
                value={formData.justification}
                onChange={handleChange}
                required
                multiline
                rows={2}
                error={!!fieldErrors.justification}
                helperText={fieldErrors.justification}
                placeholder="Brief justification..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              />
            </Paper>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={2}>
            {/* Qualifications Section */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Qualifications
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Education"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    required
                    error={!!fieldErrors.education}
                    helperText={fieldErrors.education}
                    placeholder="e.g., Bachelor's Degree"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Experience (Years)"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleNumberChange}
                    required
                    type="number"
                    inputProps={{ min: 0 }}
                    error={!!fieldErrors.experienceYears}
                    helperText={fieldErrors.experienceYears}
                    placeholder="e.g., 3"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666', mb: 0.5, display: 'block' }}>
                      Skills
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        size="small"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Add a skill and press Enter"
                        sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                      />
                      <Button
                        variant="outlined"
                        onClick={handleAddSkill}
                        disabled={!skillInput.trim()}
                        size="small"
                        sx={{ borderRadius: 1 }}
                      >
                        Add
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {formData.skills.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          onDelete={() => handleRemoveSkill(skill)}
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
                      {formData.skills.length === 0 && (
                        <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic' }}>
                          No skills added yet
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={2}>
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Review Your Requisition
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Department</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formData.department?.DepartmentName || formData.department || 'Not set'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Location</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{formData.location || 'Not set'}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Position Title</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{formData.positionTitle || 'Not set'}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>No. of Positions</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{formData.noOfPositions || '0'}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Employment Type</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{formData.employmentType || 'Not set'}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Grade</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{formData.grade || 'Not set'}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Priority</Typography>
                  <Chip 
                    label={formData.priority} 
                    size="small"
                    sx={{ 
                      backgroundColor: 
                        formData.priority === 'High' ? '#FFEBEE' : 
                        formData.priority === 'Medium' ? '#FFF3E0' : 
                        formData.priority === 'Low' ? '#E8F5E9' : '#F3E5F5',
                      color: 
                        formData.priority === 'High' ? '#C62828' : 
                        formData.priority === 'Medium' ? '#E65100' : 
                        formData.priority === 'Low' ? '#2E7D32' : '#6A1B9A',
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Target Hire Date</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formData.targetHireDate ? new Date(formData.targetHireDate).toLocaleDateString() : 'Not set'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Education</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{formData.education || 'Not set'}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Experience</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{formData.experienceYears || '0'} years</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Budget Range</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    ₹{formData.budgetMin || '0'} - ₹{formData.budgetMax || '0'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Reason for Hire</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{formData.reasonForHire || 'Not set'}</Typography>
                </Grid>
                {formData.skills.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>Skills</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {formData.skills.map(skill => (
                        <Chip key={skill} label={skill} size="small" sx={{ backgroundColor: '#E3F2FD', color: '#1976D2' }} />
                      ))}
                    </Box>
                  </Grid>
                )}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>Justification</Typography>
                  <Paper sx={{ p: 1.5, backgroundColor: '#F8FAFC', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ color: '#333' }}>
                      {formData.justification || 'No justification provided'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
            
            <Alert severity="info" sx={{ borderRadius: 1 }}>
              <Typography variant="body2">
                Please review all information before submitting. You can go back to make changes if needed.
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
        backgroundColor: '#F8FAFC'
      }}>
        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600, color: '#101010', mb: 1 }}>
          Create New Requisition
        </Typography>

        {/* 🔥 Modern Stepper with Gradient Connector */}
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          connector={<ColorConnector />}
          sx={{ mb: 1, mt: 1 }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>
                <Typography fontWeight={500} fontSize="0.85rem">{label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContent sx={{ p: 2, overflow: 'auto' }}>
        {renderStepContent(activeStep)}

        {/* Display validation errors from backend */}
        {validationErrors.length > 0 && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 1 }}>
            <Typography variant="body2" fontWeight={600}>Please fix the following errors:</Typography>
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
              {validationErrors.map((err, index) => (
                <li key={index}>
                  <Typography variant="caption">{err.message}</Typography>
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {error && !validationErrors.length && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 1 }}>{error}</Alert>
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
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
              sx={{
                backgroundColor: '#1976D2',
                '&:hover': { backgroundColor: '#1565C0' }
              }}
            >
              {loading ? 'Creating...' : 'Create'}
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

export default AddRequisition;