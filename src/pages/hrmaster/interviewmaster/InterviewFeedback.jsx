import React, { useState, useEffect } from 'react';
import {
  // Layout components
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  Grid,
  
  // Form components
  TextField,
  FormControl,
  FormLabel,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Radio,
  RadioGroup,
  FormControlLabel,
  
  // Feedback components
  Alert,
  CircularProgress,
  
  // Data display
  Typography,
  Chip,
  Divider,
  Avatar,
  Rating,
  
  // Buttons and actions
  Button,
  
  // Navigation
  styled,
  
  // Utils
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  
} from '@mui/material';
import { 
  Close as CloseIcon, 
  NavigateNext as NavigateNextIcon, 
  NavigateBefore as NavigateBeforeIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Comment as CommentIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
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

// Styled Rating component
const StyledRating = styled(Rating)({
  '& .MuiRating-iconFilled': {
    color: '#1976D2',
  },
  '& .MuiRating-iconHover': {
    color: '#1565C0',
  },
});

const InterviewFeedback = ({ open, onClose, onSubmit, interviewData }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    ratings: {
      technical: 0,
      communication: 0,
      problemSolving: 0,
      culturalFit: 0,
      overall: 0
    },
    comments: '',
    strengths: '',
    weaknesses: '',
    decision: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [hover, setHover] = useState(-1);

  // Steps definition
  const steps = ['Interview Summary', 'Ratings & Feedback', 'Review & Submit'];

  // Decision options
const decisions = [
  { value: 'select', label: 'Select', color: '#2E7D32', bgColor: '#E8F5E9', icon: <CheckCircleIcon /> },
  { value: 'reject', label: 'Reject', color: '#C62828', bgColor: '#FFEBEE', icon: <CancelIcon /> },
  { value: 'hold', label: 'Hold', color: '#ED6C02', bgColor: '#FFF3E0', icon: <TimelineIcon /> }
];

  // Rating categories
  const ratingCategories = [
    { key: 'technical', label: 'Technical Skills', description: 'Knowledge, expertise, and technical abilities' },
    { key: 'communication', label: 'Communication', description: 'Verbal and written communication skills' },
    { key: 'problemSolving', label: 'Problem Solving', description: 'Analytical thinking and solution orientation' },
    { key: 'culturalFit', label: 'Cultural Fit', description: 'Alignment with company values and culture' },
    { key: 'overall', label: 'Overall Rating', description: 'Overall impression and recommendation' }
  ];

  // Calculate average rating
  const calculateAverageRating = () => {
    const { technical, communication, problemSolving, culturalFit } = formData.ratings;
    const total = technical + communication + problemSolving + culturalFit;
    return Math.round((total / 4) * 10) / 10;
  };

  // Update overall rating when other ratings change
  useEffect(() => {
    const avg = calculateAverageRating();
    setFormData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        overall: avg
      }
    }));
  }, [formData.ratings.technical, formData.ratings.communication, formData.ratings.problemSolving, formData.ratings.culturalFit]);

  const handleRatingChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [category]: value
      }
    }));

    if (fieldErrors[`ratings.${category}`]) {
      setFieldErrors(prev => ({
        ...prev,
        [`ratings.${category}`]: ''
      }));
    }
  };

  const handleTextChange = (e) => {
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

  const handleDecisionChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      decision: value
    }));

    if (fieldErrors.decision) {
      setFieldErrors(prev => ({
        ...prev,
        decision: ''
      }));
    }
  };

  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      // Validate ratings
      ratingCategories.slice(0, 4).forEach(category => {
        if (formData.ratings[category.key] === 0) {
          errors[`ratings.${category.key}`] = `${category.label} rating is required`;
        }
      });

      if (!formData.comments.trim()) {
        errors.comments = 'Comments are required';
      } else if (formData.comments.trim().length < 20) {
        errors.comments = 'Comments must be at least 20 characters';
      }

      if (!formData.strengths.trim()) {
        errors.strengths = 'Strengths are required';
      }

      if (!formData.weaknesses.trim()) {
        errors.weaknesses = 'Weaknesses are required';
      }

      if (!formData.decision) {
        errors.decision = 'Please select a decision';
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
      setError('Please fill in all required fields');
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

    try {
      const token = localStorage.getItem('token');

      // Prepare data according to API expectations
      const submitData = {
        ratings: {
          technical: formData.ratings.technical,
          communication: formData.ratings.communication,
          problemSolving: formData.ratings.problemSolving,
          culturalFit: formData.ratings.culturalFit
        },
        comments: formData.comments,
        strengths: formData.strengths,
        weaknesses: formData.weaknesses,
        decision: formData.decision
      };

      console.log('Submitting feedback data:', submitData);

      const response = await axios.post(
        `${BASE_URL}/api/interviews/${interviewData._id}/feedback`, 
        submitData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        onSubmit(response.data.data);
        resetForm();
        onClose();
      } else {
        setError(response.data.message || 'Failed to submit feedback');
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        setError(err.response.data?.message || 'Failed to submit feedback. Please try again.');
      } else {
        setError('Failed to submit feedback. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      ratings: {
        technical: 0,
        communication: 0,
        problemSolving: 0,
        culturalFit: 0,
        overall: 0
      },
      comments: '',
      strengths: '',
      weaknesses: '',
      decision: ''
    });
    setError('');
    setFieldErrors({});
    setActiveStep(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Not set';
    return new Date(dateTimeString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const getDecisionDetails = (decision) => {
    return decisions.find(d => d.value === decision) || decisions[0];
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={2}>
            {/* Interview Summary */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Interview Summary
              </Typography>

              {interviewData ? (
                <Grid container spacing={2}>
                  {/* Interview ID */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                      Interview ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                      {interviewData.interviewId || interviewData._id}
                    </Typography>
                  </Grid>

                  {/* Candidate Info */}
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                      Candidate Information
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: '#1976D2', width: 48, height: 48 }}>
                        {interviewData.applicationId?.name?.charAt(0) || 
                         interviewData.candidateId?.firstName?.charAt(0) || 'C'}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {interviewData.applicationId?.name || 
                           (interviewData.candidateId?.firstName && interviewData.candidateId?.lastName 
                            ? `${interviewData.candidateId.firstName} ${interviewData.candidateId.lastName}`
                            : 'Candidate Name')}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {interviewData.applicationId?.email || interviewData.candidateId?.email}
                        </Typography>
                        {interviewData.applicationId?.jobId && (
                          <Typography variant="caption" color="textSecondary" display="block">
                            Position: {interviewData.applicationId.jobId?.title || interviewData.jobId?.title}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>

                  {/* Interview Details */}
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                      Interview Details
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Round</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {interviewData.round}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Type</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {interviewData.type}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Date</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatDateTime(interviewData.scheduledAt)}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Duration</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {interviewData.duration} minutes
                    </Typography>
                  </Grid>

                  {/* Interviewers */}
                  {interviewData.interviewers && interviewData.interviewers.length > 0 && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                        Interviewers
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {interviewData.interviewers.map((interviewer, index) => (
                          <Chip
                            key={index}
                            label={interviewer.name}
                            size="small"
                            icon={<PersonIcon />}
                            sx={{ backgroundColor: '#E3F2FD', color: '#1976D2' }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  )}

                  {/* Status */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>Status</Typography>
                    <Chip
                      label={interviewData.status}
                      size="small"
                      sx={{
                        backgroundColor: 
                          interviewData.status === 'completed' ? '#E8F5E9' :
                          interviewData.status === 'scheduled' ? '#E3F2FD' :
                          interviewData.status === 'cancelled' ? '#FFEBEE' : '#F5F5F5',
                        color:
                          interviewData.status === 'completed' ? '#2E7D32' :
                          interviewData.status === 'scheduled' ? '#1976D2' :
                          interviewData.status === 'cancelled' ? '#C62828' : '#666',
                      }}
                    />
                  </Grid>
                </Grid>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                    Loading interview details...
                  </Typography>
                </Box>
              )}
            </Paper>

            <Alert severity="info" sx={{ borderRadius: 1 }}>
              <Typography variant="body2">
                Please review the interview details before providing feedback.
              </Typography>
            </Alert>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={2}>
            {/* Ratings Section */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Ratings (1-5)
              </Typography>

              <Grid container spacing={2}>
                {ratingCategories.slice(0, 4).map((category) => (
                  <Grid size={{ xs: 12 }} key={category.key}>
                    <Box sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {category.label}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formData.ratings[category.key]}/5
                        </Typography>
                      </Box>
                      <StyledRating
                        name={category.key}
                        value={formData.ratings[category.key]}
                        onChange={(event, newValue) => {
                          handleRatingChange(category.key, newValue);
                        }}
                        onChangeActive={(event, newHover) => {
                          setHover(newHover);
                        }}
                        size="large"
                        precision={1}
                        icon={<StarIcon fontSize="inherit" />}
                        emptyIcon={<StarBorderIcon fontSize="inherit" />}
                      />
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                        {category.description}
                      </Typography>
                      {fieldErrors[`ratings.${category.key}`] && (
                        <FormHelperText error>{fieldErrors[`ratings.${category.key}`]}</FormHelperText>
                      )}
                    </Box>
                  </Grid>
                ))}

                {/* Average Rating Display */}
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={600}>
                      Average Rating
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ color: '#1976D2', fontWeight: 600 }}>
                        {formData.ratings.overall.toFixed(1)}
                      </Typography>
                      <StyledRating
                        value={formData.ratings.overall}
                        precision={0.5}
                        readOnly
                        size="small"
                        icon={<StarIcon fontSize="inherit" />}
                        emptyIcon={<StarBorderIcon fontSize="inherit" />}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Comments Section */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Feedback Comments
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Overall Comments"
                    name="comments"
                    value={formData.comments}
                    onChange={handleTextChange}
                    required
                    multiline
                    rows={3}
                    error={!!fieldErrors.comments}
                    helperText={fieldErrors.comments || 'Provide detailed feedback about the interview'}
                    placeholder="Excellent technical knowledge and communication skills..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Strengths"
                    name="strengths"
                    value={formData.strengths}
                    onChange={handleTextChange}
                    required
                    multiline
                    rows={2}
                    error={!!fieldErrors.strengths}
                    helperText={fieldErrors.strengths}
                    placeholder="What are the candidate's key strengths?"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Weaknesses / Areas for Improvement"
                    name="weaknesses"
                    value={formData.weaknesses}
                    onChange={handleTextChange}
                    required
                    multiline
                    rows={2}
                    error={!!fieldErrors.weaknesses}
                    helperText={fieldErrors.weaknesses}
                    placeholder="What areas need improvement?"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Decision Section */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Final Decision
              </Typography>

              <FormControl fullWidth error={!!fieldErrors.decision}>
                <RadioGroup
                  name="decision"
                  value={formData.decision}
                  onChange={handleDecisionChange}
                  row
                >
                  <Grid container spacing={1}>
                    {decisions.map((decision) => (
                      <Grid size={{ xs: 12, sm: 4 }} key={decision.value}>
                        <Paper
                          sx={{
                            p: 1,
                            border: '2px solid',
                            borderColor: formData.decision === decision.value ? decision.color : '#E0E0E0',
                            borderRadius: 1,
                            cursor: 'pointer',
                            backgroundColor: formData.decision === decision.value ? decision.bgColor : 'transparent',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: decision.color,
                              backgroundColor: decision.bgColor
                            }
                          }}
                          onClick={() => handleDecisionChange({ target: { value: decision.value } })}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ color: decision.color }}>
                              {decision.icon}
                            </Box>
                            <Typography 
                              variant="body2" 
                              fontWeight={formData.decision === decision.value ? 600 : 400}
                              sx={{ color: formData.decision === decision.value ? decision.color : 'inherit' }}
                            >
                              {decision.label}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </RadioGroup>
                {fieldErrors.decision && (
                  <FormHelperText error>{fieldErrors.decision}</FormHelperText>
                )}
              </FormControl>
            </Paper>
          </Stack>
        );

      case 2:
        const decisionDetails = getDecisionDetails(formData.decision);
        
        return (
          <Stack spacing={2}>
            {/* Review Feedback */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Review Feedback
              </Typography>
              
              <Grid container spacing={2}>
                {/* Ratings Summary */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                    Ratings
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {ratingCategories.map((category) => (
                      <Box key={category.key} sx={{ minWidth: 120 }}>
                        <Typography variant="caption" color="textSecondary">
                          {category.label}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StyledRating
                            value={formData.ratings[category.key]}
                            readOnly
                            size="small"
                            precision={0.5}
                          />
                          <Typography variant="body2" fontWeight={500}>
                            ({formData.ratings[category.key]}/5)
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                {/* Comments */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                    Overall Comments
                  </Typography>
                  <Paper sx={{ p: 1.5, backgroundColor: '#F8FAFC', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ color: '#333' }}>
                      {formData.comments}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Strengths */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                    Strengths
                  </Typography>
                  <Paper sx={{ p: 1.5, backgroundColor: '#E8F5E9', borderRadius: 1, border: '1px solid #C8E6C9' }}>
                    <Typography variant="body2" sx={{ color: '#2E7D32' }}>
                      {formData.strengths}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Weaknesses */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                    Areas for Improvement
                  </Typography>
                  <Paper sx={{ p: 1.5, backgroundColor: '#FFF3E0', borderRadius: 1, border: '1px solid #FFE0B2' }}>
                    <Typography variant="body2" sx={{ color: '#E65100' }}>
                      {formData.weaknesses}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Decision */}
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                    Final Decision
                  </Typography>
                  <Paper 
                    sx={{ 
                      p: 1.5, 
                      backgroundColor: decisionDetails.bgColor, 
                      borderRadius: 1,
                      border: '2px solid',
                      borderColor: decisionDetails.color,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Box sx={{ color: decisionDetails.color }}>
                      {decisionDetails.icon}
                    </Box>
                    <Typography variant="body2" fontWeight={600} sx={{ color: decisionDetails.color }}>
                      {decisionDetails.label}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
            
            <Alert severity="warning" sx={{ borderRadius: 1 }}>
              <Typography variant="body2" fontWeight={500}>
                Important Notes:
              </Typography>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                <li>
                  <Typography variant="caption">
                    Feedback cannot be modified after submission
                  </Typography>
                </li>
                <li>
                  <Typography variant="caption">
                    The interview status will be updated to "completed"
                  </Typography>
                </li>
                <li>
                  <Typography variant="caption">
                    {formData.decision === 'select' && 'The candidate will be moved to the selection stage'}
                    {formData.decision === 'reject' && 'The candidate will be marked as rejected'}
                    {formData.decision === 'hold' && 'The candidate will be kept on hold for further review'}
                  </Typography>
                </li>
              </ul>
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
          Submit Interview Feedback
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

        {error && (
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
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ThumbUpIcon />}
              sx={{
                backgroundColor: '#1976D2',
                '&:hover': { backgroundColor: '#1565C0' }
              }}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
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

export default InterviewFeedback;