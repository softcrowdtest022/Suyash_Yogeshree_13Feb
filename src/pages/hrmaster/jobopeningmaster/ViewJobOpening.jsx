import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Stack,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Rating,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
  ContentCopy as DuplicateIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Build as BuildIcon,
  DateRange as DateRangeIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Assignment as AssignmentIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  HourglassEmpty as HourglassIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  LinkedIn as LinkedInIcon,
  Language as LanguageIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../../../config/Config';
import { formatDistanceToNow, format } from 'date-fns';

/* ------------------- Status Chip Component ------------------- */
const StatusChip = ({ status }) => {
  const statusConfig = {
    draft: { color: 'default', icon: <ScheduleIcon />, label: 'Draft', bgcolor: '#e0e0e0' },
    published: { color: 'success', icon: <CheckCircleIcon />, label: 'Published', bgcolor: '#4caf50' },
    closed: { color: 'error', icon: <ErrorIcon />, label: 'Closed', bgcolor: '#f44336' },
    pending: { color: 'warning', icon: <HourglassIcon />, label: 'Pending', bgcolor: '#ff9800' },
    in_progress: { color: 'info', icon: <HourglassIcon />, label: 'In Progress', bgcolor: '#2196f3' }
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Chip
      size="small"
      icon={config.icon}
      label={config.label}
      sx={{
        backgroundColor: config.bgcolor,
        color: '#fff',
        '& .MuiChip-icon': { color: '#fff' }
      }}
    />
  );
};

/* ------------------- Platform Status Chip ------------------- */
const PlatformStatusChip = ({ status }) => {
  const statusConfig = {
    pending: { color: 'warning', label: 'Pending', icon: <HourglassIcon /> },
    published: { color: 'success', label: 'Published', icon: <CheckCircleIcon /> },
    failed: { color: 'error', label: 'Failed', icon: <ErrorIcon /> },
    retrying: { color: 'info', label: 'Retrying', icon: <HourglassIcon /> }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Chip
      size="small"
      icon={config.icon}
      label={config.label}
      color={config.color}
      variant="outlined"
      sx={{ height: 24 }}
    />
  );
};

/* ------------------- Tab Panel Component ------------------- */
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`job-tabpanel-${index}`}
      aria-labelledby={`job-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

/* ------------------- Main Component ------------------- */
const ViewJobOpening = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishPlatforms, setPublishPlatforms] = useState([]);
  
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
        // Initialize publish platforms from existing data
        setPublishPlatforms(response.data.data.publishTo?.map(p => p.platform) || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    navigate(`/jobs/edit/${jobId}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job opening?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/jobs');
    } catch (err) {
      setError('Failed to delete job');
    }
  };

  const handleDuplicate = () => {
    navigate('/jobs/add', { state: { duplicateFrom: job } });
  };

  const handlePublish = async () => {
    if (publishPlatforms.length === 0) {
      setError('Please select at least one platform');
      return;
    }

    setPublishLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/api/jobs/${jobId}/publish`, {
        platforms: publishPlatforms
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPublishDialogOpen(false);
      fetchJobDetails(); // Refresh data
    } catch (err) {
      setError('Failed to publish job');
    } finally {
      setPublishLoading(false);
    }
  };

  const getPlatformIcon = (platform) => {
    switch(platform) {
      case 'linkedin':
        return <LinkedInIcon fontSize="small" />;
      case 'naukri':
        return <LanguageIcon fontSize="small" />;
      case 'careerPage':
        return <BusinessIcon fontSize="small" />;
      case 'indeed':
        return <WorkIcon fontSize="small" />;
      default:
        return <LanguageIcon fontSize="small" />;
    }
  };

  const getPlatformUrl = (platform) => {
    // This would be dynamic based on your actual URLs
    const urls = {
      linkedin: `https://linkedin.com/jobs/view/${job?.jobId}`,
      naukri: `https://naukri.com/job/${job?.jobId}`,
      careerPage: `/careers/${job?.jobId}`
    };
    return urls[platform] || '#';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleGoBack}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!job) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Job not found</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleGoBack} sx={{ mt: 2 }}>
          Go Back
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
          <Typography color="textPrimary">{job.jobId}</Typography>
        </Breadcrumbs>
      </Box>

      {/* Action Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={handleGoBack}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                {job.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {job.jobId} • Created {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
              </Typography>
            </Box>
            <Box sx={{ ml: 2 }}>
              <StatusChip status={job.status} />
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit">
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                Edit
              </Button>
            </Tooltip>
            
            {job.status === 'draft' && (
              <Tooltip title="Publish">
                <Button
                  variant="contained"
                  startIcon={<PublishIcon />}
                  onClick={() => setPublishDialogOpen(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #164e63, #00B4D8)',
                    '&:hover': { opacity: 0.9 }
                  }}
                >
                  Publish
                </Button>
              </Tooltip>
            )}
            
            <Tooltip title="Duplicate">
              <IconButton onClick={handleDuplicate}>
                <DuplicateIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Delete">
              <IconButton onClick={handleDelete} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Main Info */}
        <Grid item xs={12} md={8}>
          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Overview" />
              <Tab label="Requisition Details" />
              <Tab label="Applications" />
              <Tab label="Publishing Status" />
            </Tabs>

            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              <Stack spacing={3}>
                {/* Company Intro */}
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Company Introduction
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                    <Typography>{job.companyIntro}</Typography>
                  </Paper>
                </Box>

                {/* Job Description */}
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Job Description
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography>{job.description}</Typography>
                  </Paper>
                </Box>

                {/* Requirements */}
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Requirements
                  </Typography>
                  <List dense>
                    {job.requirements?.map((req, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleOutlineIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={req} />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                {/* Responsibilities */}
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Responsibilities
                  </Typography>
                  <List dense>
                    {job.responsibilities?.map((resp, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleOutlineIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={resp} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Stack>
            </TabPanel>

            {/* Requisition Details Tab */}
            <TabPanel value={tabValue} index={1}>
              <Stack spacing={3}>
                {/* Requisition Header */}
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {job.requisitionId?.positionTitle}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Requisition ID: {job.requisitionNumber}
                      </Typography>
                    </Box>
                    <StatusChip status={job.requisitionId?.status} />
                  </Stack>
                </Paper>

                {/* Requisition Details Grid */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Department</Typography>
                    <Typography variant="body1" fontWeight={500}>{job.requisitionId?.department}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Location</Typography>
                    <Typography variant="body1" fontWeight={500}>{job.requisitionId?.location}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Employment Type</Typography>
                    <Typography variant="body1" fontWeight={500}>{job.requisitionId?.employmentType}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Number of Positions</Typography>
                    <Typography variant="body1" fontWeight={500}>{job.requisitionId?.noOfPositions}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Hired Positions</Typography>
                    <Typography variant="body1" fontWeight={500}>{job.requisitionId?.hiredPositions || 0}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Target Hire Date</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {job.requisitionId?.targetHireDate ? format(new Date(job.requisitionId.targetHireDate), 'PPP') : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Grade</Typography>
                    <Typography variant="body1" fontWeight={500}>{job.requisitionId?.grade || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Priority</Typography>
                    <Chip 
                      size="small" 
                      label={job.requisitionId?.priority} 
                      color={job.requisitionId?.priority === 'High' ? 'error' : 'default'}
                    />
                  </Grid>
                </Grid>

                {/* Education */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Education Required
                  </Typography>
                  <Typography>{job.requisitionId?.education}</Typography>
                </Box>

                {/* Skills */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Required Skills
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {job.requisitionId?.skills?.map((skill, idx) => (
                      <Chip key={idx} label={skill} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </Box>

                {/* Justification */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Justification
                  </Typography>
                  <Typography variant="body2">{job.requisitionId?.justification}</Typography>
                </Box>

                {/* Approval Info */}
                {job.requisitionId?.approvalDate && (
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f1f8e9' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <CheckCircleIcon color="success" />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Approved by {job.requisitionId?.approvedByName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          on {format(new Date(job.requisitionId.approvalDate), 'PPP')}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </TabPanel>

            {/* Applications Tab */}
            <TabPanel value={tabValue} index={2}>
              {job.recentApplications?.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Applicant</TableCell>
                        <TableCell>Applied Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Match Score</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {job.recentApplications.map((app, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {app.name?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2">{app.name}</Typography>
                                <Typography variant="caption" color="textSecondary">{app.email}</Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>{formatDistanceToNow(new Date(app.appliedDate), { addSuffix: true })}</TableCell>
                          <TableCell>
                            <Chip 
                              size="small" 
                              label={app.status} 
                              color={app.status === 'shortlisted' ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={app.matchScore || 0} 
                                sx={{ width: 60, height: 6, borderRadius: 3 }}
                              />
                              <Typography variant="caption">{app.matchScore || 0}%</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton size="small">
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">No applications received yet</Alert>
              )}
            </TabPanel>

            {/* Publishing Status Tab */}
            <TabPanel value={tabValue} index={3}>
              <Stack spacing={2}>
                {job.publishTo?.map((platform, idx) => (
                  <Paper key={idx} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: '#f0f0f0' }}>
                          {getPlatformIcon(platform.platform)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" textTransform="capitalize">
                            {platform.platform}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Job ID: {job.jobId}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PlatformStatusChip status={platform.status} />
                        {platform.status === 'published' && (
                          <Tooltip title="View on platform">
                            <IconButton 
                              size="small" 
                              href={getPlatformUrl(platform.platform)} 
                              target="_blank"
                            >
                              <LaunchIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </Stack>
                    {platform.retryCount > 0 && (
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                        Retry attempts: {platform.retryCount}
                      </Typography>
                    )}
                    {platform.errorMessage && (
                      <Alert severity="error" sx={{ mt: 1 }} icon={<ErrorIcon />}>
                        {platform.errorMessage}
                      </Alert>
                    )}
                  </Paper>
                ))}
              </Stack>
            </TabPanel>
          </Paper>
        </Grid>

        {/* Right Column - Sidebar */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Quick Info Card */}
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Quick Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><LocationIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Location" secondary={job.location} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><BusinessIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Department" secondary={job.department} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><WorkIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Employment Type" secondary={job.employmentType} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><DateRangeIcon fontSize="small" /></ListItemIcon>
                    <ListItemText 
                      primary="Experience Required" 
                      secondary={`${job.experienceRequired?.min} - ${job.experienceRequired?.max} years`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><MoneyIcon fontSize="small" /></ListItemIcon>
                    <ListItemText 
                      primary="Salary Range" 
                      secondary={`₹${job.salaryRange?.min?.toLocaleString()} - ₹${job.salaryRange?.max?.toLocaleString()} ${job.salaryRange?.currency}`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>
                    <ListItemText 
                      primary="Total Applications" 
                      secondary={job.totalApplications || 0} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
                    <ListItemText 
                      primary="Total Views" 
                      secondary={job.views || 0} 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Skills Card */}
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Required Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {job.skills?.map((skill, idx) => (
                    <Chip key={idx} label={skill} icon={<BuildIcon />} variant="outlined" />
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Education Card */}
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Education
                </Typography>
                <List dense>
                  {job.education?.map((edu, idx) => (
                    <ListItem key={idx}>
                      <ListItemIcon><SchoolIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary={edu} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Created By Card */}
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Created By
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: '#164e63', width: 48, height: 48 }}>
                    {job.createdByName?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {job.createdByName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {job.createdBy?.Email}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {format(new Date(job.createdAt), 'PPP')}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onClose={() => setPublishDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #164e63, #00B4D8)',
          color: '#fff',
          fontWeight: 600
        }}>
          Publish Job Opening
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            <Alert severity="info">
              Select the platforms where you want to publish this job opening.
            </Alert>
            
            <FormControl fullWidth>
              <InputLabel>Platforms</InputLabel>
              <Select
                multiple
                value={publishPlatforms}
                onChange={(e) => setPublishPlatforms(e.target.value)}
                label="Platforms"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={value} 
                        size="small"
                        icon={getPlatformIcon(value)}
                      />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="careerPage">Career Page</MenuItem>
                <MenuItem value="linkedin">LinkedIn</MenuItem>
                <MenuItem value="naukri">Naukri.com</MenuItem>
                <MenuItem value="indeed">Indeed</MenuItem>
                <MenuItem value="monster">Monster</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handlePublish}
            disabled={publishLoading || publishPlatforms.length === 0}
            sx={{
              background: 'linear-gradient(135deg, #164e63, #00B4D8)',
              '&:hover': { opacity: 0.9 }
            }}
          >
            {publishLoading ? <CircularProgress size={24} /> : 'Publish'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewJobOpening;