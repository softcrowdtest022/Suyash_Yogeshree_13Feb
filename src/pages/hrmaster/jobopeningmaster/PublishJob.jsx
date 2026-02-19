import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  IconButton,
  Chip,
  Stepper,
  Step,
  StepLabel,
  styled,
  StepConnector,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  FormHelperText,
  Card,
  CardContent,
  Divider,
  Grid,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Publish as PublishIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Launch as LaunchIcon,
  LinkedIn as LinkedInIcon,
  Language as LanguageIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  Verified as VerifiedIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Close as CloseIcon
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

const steps = ["Select Platforms", "Publishing", "Results"];

/* ------------------- Platform Card Component ------------------- */
const PlatformCard = ({ platform, selected, onToggle, disabled }) => {
  const getPlatformIcon = (platform) => {
    switch(platform) {
      case 'linkedin':
        return <LinkedInIcon sx={{ fontSize: 40, color: '#0077b5' }} />;
      case 'naukri':
        return <LanguageIcon sx={{ fontSize: 40, color: '#ff5722' }} />;
      case 'careerPage':
        return <BusinessIcon sx={{ fontSize: 40, color: '#164e63' }} />;
      case 'indeed':
        return <WorkIcon sx={{ fontSize: 40, color: '#003a9b' }} />;
      case 'monster':
        return <WorkIcon sx={{ fontSize: 40, color: '#6e2b8b' }} />;
      default:
        return <LanguageIcon sx={{ fontSize: 40 }} />;
    }
  };

  const getPlatformName = (platform) => {
    const names = {
      linkedin: 'LinkedIn',
      naukri: 'Naukri.com',
      careerPage: 'Career Page',
      indeed: 'Indeed',
      monster: 'Monster'
    };
    return names[platform] || platform;
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        border: selected ? '2px solid #00B4D8' : '1px solid #e0e0e0',
        bgcolor: selected ? '#e6f7ff' : 'white',
        transition: 'all 0.2s',
        '&:hover': disabled ? {} : {
          borderColor: '#00B4D8',
          boxShadow: '0 4px 12px rgba(0,180,216,0.1)'
        }
      }}
      onClick={() => !disabled && onToggle(platform)}
    >
      <Stack spacing={2} alignItems="center">
        {getPlatformIcon(platform)}
        <Typography variant="subtitle2" fontWeight={600}>
          {getPlatformName(platform)}
        </Typography>
        {selected && (
          <Chip
            size="small"
            icon={<CheckCircleIcon />}
            label="Selected"
            color="success"
            variant="outlined"
          />
        )}
      </Stack>
    </Paper>
  );
};

/* ------------------- Publishing Status Component ------------------- */
const PublishingStatus = ({ platform, status, result, error }) => {
  const getPlatformIcon = (platform) => {
    switch(platform) {
      case 'linkedin':
        return <LinkedInIcon fontSize="small" />;
      case 'naukri':
        return <LanguageIcon fontSize="small" />;
      case 'careerPage':
        return <BusinessIcon fontSize="small" />;
      default:
        return <LanguageIcon fontSize="small" />;
    }
  };

  const getStatusIcon = () => {
    switch(status) {
      case 'pending':
        return <ScheduleIcon color="warning" />;
      case 'publishing':
        return <CircularProgress size={20} />;
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ bgcolor: '#f0f0f0', width: 32, height: 32 }}>
              {getPlatformIcon(platform)}
            </Avatar>
            <Typography variant="subtitle2" textTransform="capitalize">
              {platform}
            </Typography>
          </Stack>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getStatusIcon()}
            <Typography variant="caption" color="textSecondary">
              {status === 'pending' && 'Waiting to start...'}
              {status === 'publishing' && 'Publishing...'}
              {status === 'success' && 'Published successfully'}
              {status === 'failed' && 'Publishing failed'}
            </Typography>
          </Box>
        </Stack>

        {status === 'publishing' && (
          <LinearProgress sx={{ height: 4, borderRadius: 2 }} />
        )}

        {status === 'success' && result && (
          <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1 }}>
            <Stack spacing={1}>
              <Typography variant="caption" color="textSecondary">
                Job URL:
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Link 
                  href={result.jobUrl} 
                  target="_blank" 
                  rel="noopener"
                  sx={{ 
                    flex: 1,
                    fontSize: '0.75rem',
                    wordBreak: 'break-all'
                  }}
                >
                  {result.jobUrl}
                </Link>
                <Tooltip title="Open in new tab">
                  <IconButton size="small" href={result.jobUrl} target="_blank">
                    <LaunchIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Copy link">
                  <IconButton 
                    size="small" 
                    onClick={() => navigator.clipboard.writeText(result.jobUrl)}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
              {result.data?.id && (
                <Typography variant="caption" color="textSecondary">
                  Platform ID: {result.data.id}
                </Typography>
              )}
            </Stack>
          </Box>
        )}

        {status === 'failed' && error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
};

/* ------------------- Main Component ------------------- */
const PublishJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [activeStep, setActiveStep] = useState(0);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Platform selection
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [publishResults, setPublishResults] = useState(null);
  
  // Publishing status tracking
  const [publishingStatus, setPublishingStatus] = useState({});
  
  // Share dialog
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  // Available platforms
  const availablePlatforms = [
    { value: 'careerPage', label: 'Career Page', icon: <BusinessIcon /> },
    { value: 'linkedin', label: 'LinkedIn', icon: <LinkedInIcon /> },
    { value: 'naukri', label: 'Naukri.com', icon: <LanguageIcon /> },
    { value: 'indeed', label: 'Indeed', icon: <WorkIcon /> },
    { value: 'monster', label: 'Monster', icon: <WorkIcon /> }
  ];

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
        setJob(response.data.data);
        
        // Pre-select platforms that are already pending
        const existingPlatforms = response.data.data.publishTo
          ?.filter(p => p.status === 'pending')
          .map(p => p.platform) || [];
        setSelectedPlatforms(existingPlatforms);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformToggle = (platform) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platform)) {
        return prev.filter(p => p !== platform);
      } else {
        return [...prev, platform];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedPlatforms.length === availablePlatforms.length) {
      setSelectedPlatforms([]);
    } else {
      setSelectedPlatforms(availablePlatforms.map(p => p.value));
    }
  };

  const validateSelection = () => {
    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform to publish');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (validateSelection()) {
        setActiveStep(1);
        handlePublish();
      }
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handlePublish = async () => {
    setPublishing(true);
    setError('');
    
    // Initialize status for each platform
    const initialStatus = {};
    selectedPlatforms.forEach(platform => {
      initialStatus[platform] = { status: 'pending' };
    });
    setPublishingStatus(initialStatus);
    
    try {
      const token = localStorage.getItem('token');
      
      // Update status to publishing for all platforms
      selectedPlatforms.forEach(platform => {
        setPublishingStatus(prev => ({
          ...prev,
          [platform]: { status: 'publishing' }
        }));
      });
      
      const response = await axios.post(`${BASE_URL}/api/jobs/${jobId}/publish`, {
        platforms: selectedPlatforms
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setPublishResults(response.data.data);
        
        // Update status with results
        const updatedStatus = {};
        response.data.data.publishResults.forEach(result => {
          updatedStatus[result.platform] = {
            status: result.success ? 'success' : 'failed',
            result: result,
            error: result.error
          };
        });
        setPublishingStatus(updatedStatus);
        
        setSuccess('Job published successfully!');
        setActiveStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish job');
      
      // Mark all as failed
      const failedStatus = {};
      selectedPlatforms.forEach(platform => {
        failedStatus[platform] = { 
          status: 'failed',
          error: err.response?.data?.message || 'Publishing failed'
        };
      });
      setPublishingStatus(failedStatus);
    } finally {
      setPublishing(false);
    }
  };

  const handleViewJob = () => {
    navigate(`/jobs/${jobId}`);
  };

  const handleViewPublished = () => {
    if (publishResults?.publishResults) {
      const careerPageResult = publishResults.publishResults.find(r => r.platform === 'careerPage');
      if (careerPageResult?.jobUrl) {
        window.open(careerPageResult.jobUrl, '_blank');
      }
    }
  };

  const handleCopyAllLinks = () => {
    if (publishResults?.publishResults) {
      const urls = publishResults.publishResults
        .filter(r => r.success)
        .map(r => `${r.platform}: ${r.jobUrl}`)
        .join('\n');
      navigator.clipboard.writeText(urls);
    }
  };

  const getSuccessCount = () => {
    return publishResults?.publishResults?.filter(r => r.success).length || 0;
  };

  const getFailureCount = () => {
    return publishResults?.publishResults?.filter(r => !r.success).length || 0;
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
          <Typography color="textPrimary">Publish</Typography>
        </Breadcrumbs>
      </Box>

      {/* Main Content */}
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={() => navigate(`/jobs/${jobId}`)}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Publish Job Opening
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

        {/* Step Content */}
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          
          {/* Step 1: Select Platforms */}
          {activeStep === 0 && (
            <Stack spacing={4}>
              {/* Job Summary */}
              <Card variant="outlined" sx={{ bgcolor: '#f8f9fa' }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Job Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Title</Typography>
                      <Typography variant="body2" fontWeight={500}>{job?.title}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Location</Typography>
                      <Typography variant="body2" fontWeight={500}>{job?.location}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Department</Typography>
                      <Typography variant="body2" fontWeight={500}>{job?.department}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Employment Type</Typography>
                      <Typography variant="body2" fontWeight={500}>{job?.employmentType}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Platform Selection */}
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Select Platforms
                  </Typography>
                  <Button onClick={handleSelectAll} size="small">
                    {selectedPlatforms.length === availablePlatforms.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </Stack>

                <Grid container spacing={2}>
                  {availablePlatforms.map((platform) => (
                    <Grid item xs={12} sm={6} md={4} key={platform.value}>
                      <PlatformCard
                        platform={platform.value}
                        selected={selectedPlatforms.includes(platform.value)}
                        onToggle={handlePlatformToggle}
                        disabled={job?.status === 'published'}
                      />
                    </Grid>
                  ))}
                </Grid>

                <FormHelperText sx={{ mt: 2 }}>
                  Selected {selectedPlatforms.length} of {availablePlatforms.length} platforms
                </FormHelperText>
              </Box>

              {/* Info Alert */}
              <Alert severity="info" icon={<InfoIcon />}>
                <Typography variant="body2">
                  <strong>Note:</strong> Publishing will make this job visible on the selected platforms.
                  {job?.status === 'published' && ' This job is already published. Publishing again will update the existing listings.'}
                </Typography>
              </Alert>
            </Stack>
          )}

          {/* Step 2: Publishing */}
          {activeStep === 1 && (
            <Stack spacing={3}>
              <Alert severity="info" icon={<InfoIcon />}>
                Publishing job to selected platforms. Please do not close this window.
              </Alert>

              {/* Publishing Status */}
              <Stack spacing={2}>
                {selectedPlatforms.map((platform) => (
                  <PublishingStatus
                    key={platform}
                    platform={platform}
                    status={publishingStatus[platform]?.status || 'pending'}
                    result={publishingStatus[platform]?.result}
                    error={publishingStatus[platform]?.error}
                  />
                ))}
              </Stack>

              {/* Overall Progress */}
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Overall Progress</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {Object.values(publishingStatus).filter(s => s.status === 'success' || s.status === 'failed').length} / {selectedPlatforms.length}
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={(Object.values(publishingStatus).filter(s => s.status === 'success' || s.status === 'failed').length / selectedPlatforms.length) * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Stack>
              </Paper>
            </Stack>
          )}

          {/* Step 3: Results */}
          {activeStep === 2 && publishResults && (
            <Stack spacing={3}>
              {/* Success Summary */}
              <Paper 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #164e63, #00B4D8)',
                  color: 'white'
                }}
              >
                <VerifiedIcon sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight={600}>
                  Published Successfully!
                </Typography>
                <Typography variant="body1">
                  Job has been published to {getSuccessCount()} out of {selectedPlatforms.length} platforms
                </Typography>
              </Paper>

              {/* Results Summary Cards */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: '#4caf50' }}>
                          <CheckCircleIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h4" fontWeight={600}>
                            {getSuccessCount()}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Successful
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: '#f44336' }}>
                          <ErrorIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h4" fontWeight={600}>
                            {getFailureCount()}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Failed
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Detailed Results */}
              <Typography variant="h6" fontWeight={600}>
                Detailed Results
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Platform</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Job URL</TableCell>
                      <TableCell>Platform ID</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {publishResults.publishResults.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {result.platform === 'linkedin' && <LinkedInIcon fontSize="small" />}
                            {result.platform === 'naukri' && <LanguageIcon fontSize="small" />}
                            {result.platform === 'careerPage' && <BusinessIcon fontSize="small" />}
                            <Typography textTransform="capitalize">{result.platform}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {result.success ? (
                            <Chip size="small" icon={<CheckCircleIcon />} label="Success" color="success" />
                          ) : (
                            <Chip size="small" icon={<ErrorIcon />} label="Failed" color="error" />
                          )}
                        </TableCell>
                        <TableCell>
                          {result.success ? (
                            <Link href={result.jobUrl} target="_blank" rel="noopener">
                              View Job
                            </Link>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          {result.data?.id || 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  startIcon={<VisibilityIcon />}
                  onClick={handleViewJob}
                >
                  View Job Details
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  onClick={() => setShareDialogOpen(true)}
                >
                  Share Links
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleCopyAllLinks}
                >
                  Copy All Links
                </Button>
              </Stack>
            </Stack>
          )}

          {/* Error/Success Messages */}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/jobs/${jobId}`)}
              startIcon={<CloseIcon />}
            >
              Cancel
            </Button>
            
            <Box>
              {activeStep > 0 && activeStep < 2 && (
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
              )}
              
              {activeStep < 2 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={publishing || (activeStep === 0 && selectedPlatforms.length === 0)}
                  startIcon={activeStep === 1 ? <CircularProgress size={20} /> : <PublishIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #164e63, #00B4D8)',
                    '&:hover': { opacity: 0.9 }
                  }}
                >
                  {activeStep === 0 && 'Publish'}
                  {activeStep === 1 && 'Publishing...'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleViewJob}
                  sx={{
                    background: 'linear-gradient(135deg, #164e63, #00B4D8)',
                    '&:hover': { opacity: 0.9 }
                  }}
                >
                  Done
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Share Links Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Share Job Links</Typography>
            <IconButton onClick={() => setShareDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {publishResults?.publishResults?.filter(r => r.success).map((result, index) => (
              <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" textTransform="capitalize">
                      {result.platform}
                    </Typography>
                    <Chip size="small" label="Published" color="success" />
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="textSecondary" sx={{ flex: 1, wordBreak: 'break-all' }}>
                      {result.jobUrl}
                    </Typography>
                    <Tooltip title="Copy link">
                      <IconButton 
                        size="small"
                        onClick={() => navigator.clipboard.writeText(result.jobUrl)}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Open in new tab">
                      <IconButton size="small" href={result.jobUrl} target="_blank">
                        <LaunchIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={handleCopyAllLinks}
            sx={{
              background: 'linear-gradient(135deg, #164e63, #00B4D8)',
              '&:hover': { opacity: 0.9 }
            }}
          >
            Copy All Links
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PublishJob;