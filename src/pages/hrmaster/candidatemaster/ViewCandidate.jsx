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
  Stepper,
  Step,
  StepLabel,
  Box,
  Paper,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
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
  Description as ResumeIcon,
  Download as DownloadIcon,
  Star as StarIcon,
  BusinessCenter as JobIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  Comment as CommentIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  CloudUpload as CloudUploadIcon,
  LinkedIn as LinkedInIcon,
  Language as LanguageIcon,
  Business as BusinessIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

// Status color mapping
const STATUS_COLORS = {
  new: { bg: '#E3F2FD', color: '#1976D2', icon: <PendingIcon />, label: 'New' },
  contacted: { bg: '#F3E5F5', color: '#7B1FA2', icon: <PersonIcon />, label: 'Contacted' },
  shortlisted: { bg: '#E8F5E8', color: '#2E7D32', icon: <ThumbUpIcon />, label: 'Shortlisted' },
  interviewed: { bg: '#E1F5FE', color: '#0288D1', icon: <PersonIcon />, label: 'Interviewed' },
  selected: { bg: '#E8F5E8', color: '#2E7D32', icon: <CheckCircleIcon />, label: 'Selected' },
  rejected: { bg: '#FFEBEE', color: '#C62828', icon: <ThumbDownIcon />, label: 'Rejected' },
  onHold: { bg: '#FFF8E1', color: '#FF8F00', icon: <PendingIcon />, label: 'On Hold' },
  joined: { bg: '#E8F5E8', color: '#1B5E20', icon: <CheckCircleIcon />, label: 'Joined' }
};

// Source icon mapping
const SOURCE_ICONS = {
  'naukri': { icon: <LanguageIcon />, color: '#FF5722', label: 'Naukri' },
  'linkedin': { icon: <LinkedInIcon />, color: '#0077B5', label: 'LinkedIn' },
  'indeed': { icon: <WorkIcon />, color: '#003A9B', label: 'Indeed' },
  'walkin': { icon: <PersonIcon />, color: '#4CAF50', label: 'Walk-in' },
  'reference': { icon: <PeopleIcon />, color: '#9C27B0', label: 'Reference' },
  'careerPage': { icon: <BusinessIcon />, color: '#FF9800', label: 'Career Page' },
  'upload': { icon: <CloudUploadIcon />, color: '#00BCD4', label: 'Upload' },
  'other': { icon: <PersonIcon />, color: '#9E9E9E', label: 'Other' }
};

const ViewCandidate = ({ open, onClose, candidateId }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const steps = [
    'Personal Information',
    'Contact & Address',
    'Education & Skills',
    'Work Experience',
    'Applications & Notes'
  ];

  useEffect(() => {
    if (open && candidateId) {
      fetchCandidateDetails();
    }
  }, [open, candidateId]);

  const fetchCandidateDetails = async () => {
    setLoading(true);
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
        setCandidate(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch candidate details');
      }
    } catch (err) {
      console.error('Error fetching candidate details:', err);
      setError(err.response?.data?.message || 'Failed to fetch candidate details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusStyle = (status) => {
    return STATUS_COLORS[status] || { 
      bg: '#EEEEEE', 
      color: '#616161', 
      icon: <PersonIcon />, 
      label: status || 'Unknown' 
    };
  };

  const getSourceInfo = (source) => {
    return SOURCE_ICONS[source] || { 
      icon: <PersonIcon />, 
      color: '#9E9E9E', 
      label: source || 'Other' 
    };
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

  const handleClose = () => {
    setActiveStep(0);
    setCandidate(null);
    setError('');
    onClose();
  };

  const handleViewResume = () => {
    if (candidate?.resume?.fileUrl) {
      window.open(`${BASE_URL}${candidate.resume.fileUrl}`, '_blank');
    }
  };

  const handleDownloadResume = () => {
    if (candidate?.resume?.fileUrl) {
      const link = document.createElement('a');
      link.href = `${BASE_URL}${candidate.resume.fileUrl}`;
      link.download = candidate.resume.filename || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStepContent = (step) => {
    if (!candidate) return null;

    const statusStyle = getStatusStyle(candidate.status);
    const sourceInfo = getSourceInfo(candidate.source);

    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            {/* Profile Header Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    bgcolor: '#E3F2FD',
                    color: '#1976D2',
                    fontSize: '32px',
                    fontWeight: 600
                  }}
                >
                  {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                    <Typography variant="h5" fontWeight={600}>
                      {candidate.fullName || `${candidate.firstName} ${candidate.lastName}`}
                    </Typography>
                    <Chip
                      label={candidate.candidateId}
                      size="small"
                      sx={{ 
                        bgcolor: '#E3F2FD', 
                        color: '#1976D2', 
                        fontWeight: 500,
                        height: 24
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      size="small"
                      icon={statusStyle.icon}
                      label={statusStyle.label}
                      sx={{
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        fontWeight: 500,
                        '& .MuiChip-icon': { color: statusStyle.color }
                      }}
                    />
                    <Chip
                      size="small"
                      icon={sourceInfo.icon}
                      label={sourceInfo.label}
                      sx={{
                        backgroundColor: '#E3F2FD',
                        color: sourceInfo.color,
                        fontWeight: 500,
                        '& .MuiChip-icon': { color: sourceInfo.color }
                      }}
                    />
                  </Box>
                </Box>
                {candidate.resume && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ResumeIcon />}
                      onClick={handleViewResume}
                      sx={{ borderRadius: 1.5, textTransform: 'none' }}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadResume}
                      sx={{ borderRadius: 1.5, textTransform: 'none' }}
                    >
                      Download
                    </Button>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Personal Information Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon sx={{ color: '#1976D2' }} />
                Personal Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      Email Address
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon sx={{ fontSize: 18, color: '#1976D2' }} />
                      <Typography variant="body1">{candidate.email}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      Phone Number
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon sx={{ fontSize: 18, color: '#1976D2' }} />
                      <Typography variant="body1">{candidate.phone}</Typography>
                    </Box>
                  </Box>
                </Grid>

                {candidate.dateOfBirth && (
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        Date of Birth
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon sx={{ fontSize: 18, color: '#1976D2' }} />
                        <Typography variant="body1">{formatShortDate(candidate.dateOfBirth)}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {candidate.gender && (
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        Gender
                      </Typography>
                      <Typography variant="body1">
                        {candidate.gender === 'M' ? 'Male' : candidate.gender === 'F' ? 'Female' : 'Other'}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* System Information Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon sx={{ color: '#1976D2' }} />
                System Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      Created At
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(candidate.createdAt)}
                      {candidate.createdByName && ` by ${candidate.createdByName}`}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      Last Updated
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(candidate.updatedAt)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            {/* Contact Information Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ color: '#1976D2' }} />
                Contact Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      Email Address
                    </Typography>
                    <Typography variant="body1">{candidate.email}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      Phone Number
                    </Typography>
                    <Typography variant="body1">{candidate.phone}</Typography>
                  </Box>
                </Grid>

                {candidate.dateOfBirth && (
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        Date of Birth
                      </Typography>
                      <Typography variant="body1">{formatShortDate(candidate.dateOfBirth)}</Typography>
                    </Box>
                  </Grid>
                )}

                {candidate.gender && (
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        Gender
                      </Typography>
                      <Typography variant="body1">
                        {candidate.gender === 'M' ? 'Male' : candidate.gender === 'F' ? 'Female' : 'Other'}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Address Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon sx={{ color: '#1976D2' }} />
                Address Information
              </Typography>
              {candidate.address ? (
                <Grid container spacing={3}>
                  {candidate.address.street && (
                    <Grid item xs={12}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                          Street
                        </Typography>
                        <Typography variant="body1">{candidate.address.street}</Typography>
                      </Box>
                    </Grid>
                  )}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        City
                      </Typography>
                      <Typography variant="body1">{candidate.address?.city || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        State
                      </Typography>
                      <Typography variant="body1">{candidate.address?.state || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        Pincode
                      </Typography>
                      <Typography variant="body1">{candidate.address?.pincode || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        Country
                      </Typography>
                      <Typography variant="body1">{candidate.address?.country || 'India'}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Typography color="textSecondary">No address information available</Typography>
              )}
            </Paper>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            {/* Education Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon sx={{ color: '#1976D2' }} />
                Education
              </Typography>
              {candidate.education && candidate.education.length > 0 ? (
                <Stack spacing={2}>
                  {candidate.education.map((edu, index) => (
                    <Paper key={edu._id || index} sx={{ p: 2, bgcolor: '#F8FAFC' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="textSecondary">Degree</Typography>
                          <Typography variant="body2" fontWeight={500}>{edu.degree}</Typography>
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
                          <Typography variant="caption" color="textSecondary">Specialization</Typography>
                          <Typography variant="body2">{edu.specialization || '-'}</Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography color="textSecondary">No education details available</Typography>
              )}
            </Paper>

            {/* Skills Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon sx={{ color: '#1976D2' }} />
                Skills
              </Typography>
              {candidate.skills && candidate.skills.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {candidate.skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      sx={{
                        backgroundColor: '#E3F2FD',
                        color: '#1976D2',
                        fontWeight: 500
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography color="textSecondary">No skills listed</Typography>
              )}
            </Paper>
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={3}>
            {/* Experience Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <WorkIcon sx={{ color: '#1976D2' }} />
                Work Experience
              </Typography>
              {candidate.experience && candidate.experience.length > 0 ? (
                <Stack spacing={2}>
                  {candidate.experience.map((exp, index) => (
                    <Paper key={exp._id || index} sx={{ p: 2, bgcolor: '#F8FAFC' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="textSecondary">Position</Typography>
                          <Typography variant="body2" fontWeight={500}>{exp.position}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="textSecondary">Company</Typography>
                          <Typography variant="body2">{exp.company}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="textSecondary">Duration</Typography>
                          <Typography variant="body2">
                            {exp.fromDate ? formatShortDate(exp.fromDate) : 'N/A'} - 
                            {exp.current ? 'Present' : (exp.toDate ? formatShortDate(exp.toDate) : 'N/A')}
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
                </Stack>
              ) : (
                <Typography color="textSecondary">No experience details available</Typography>
              )}
            </Paper>
          </Stack>
        );

      case 4:
        return (
          <Stack spacing={3}>
            {/* Applications Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon sx={{ color: '#1976D2' }} />
                Job Applications
              </Typography>
              {candidate.applications && candidate.applications.length > 0 ? (
                <Stack spacing={2}>
                  {candidate.applications.map((app) => {
                    const appStatusStyle = getStatusStyle(app.status);
                    return (
                      <Paper key={app._id} sx={{ p: 2, bgcolor: '#F8FAFC' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <JobIcon sx={{ color: '#1976D2', fontSize: 20 }} />
                          <Typography variant="subtitle2" fontWeight={600}>
                            Application #{app.applicationId}
                          </Typography>
                          <Chip
                            label={app.status}
                            size="small"
                            sx={{
                              backgroundColor: appStatusStyle.bg,
                              color: appStatusStyle.color,
                              fontWeight: 500,
                              height: 20,
                              fontSize: '10px'
                            }}
                          />
                        </Box>
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="textSecondary">Job Title</Typography>
                            <Typography variant="body2">{app.jobId?.title}</Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="textSecondary">Job ID</Typography>
                            <Typography variant="body2">{app.jobId?.jobId}</Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="textSecondary">Applied Date</Typography>
                            <Typography variant="body2">{formatShortDate(app.appliedDate)}</Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="textSecondary">Source</Typography>
                            <Typography variant="body2">{app.source}</Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    );
                  })}
                </Stack>
              ) : (
                <Typography color="textSecondary">No applications found</Typography>
              )}
            </Paper>

            {/* Notes Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CommentIcon sx={{ color: '#1976D2' }} />
                Notes & Activity
              </Typography>
              {candidate.notes && candidate.notes.length > 0 ? (
                <Stack spacing={2}>
                  {candidate.notes.slice().reverse().map((note, index) => (
                    <Paper key={note._id || index} sx={{ p: 2, bgcolor: '#F8FAFC' }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#7B1FA2', fontSize: '14px' }}>
                          {note.createdByName?.[0] || 'S'}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {note.createdByName || 'System'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {formatDate(note.createdAt)}
                            </Typography>
                          </Box>
                          <Typography variant="body2">{note.text}</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography color="textSecondary">No notes available</Typography>
              )}
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
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{
        borderBottom: '1px solid #E0E0E0',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon sx={{ color: '#1976D2' }} />
          <Typography variant="h6" fontWeight={600}>
            Candidate Details
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

      <DialogContent sx={{ pt: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <CircularProgress size={40} sx={{ color: '#1976D2' }} />
          </Box>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ borderRadius: 1, mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={fetchCandidateDetails}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        ) : candidate ? (
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
          </>
        ) : null}
      </DialogContent>

      {candidate && !loading && !error && (
        <DialogActions sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid #E0E0E0',
          backgroundColor: '#F8FAFC'
        }}>
          <Button onClick={handleClose}>
            Close
          </Button>

          <Box sx={{ flex: 1 }} />

          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleReset}
              sx={{ mr: 1 }}
            >
              View from Start
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ViewCandidate;