import React, { useState, useEffect } from 'react';
import {
  // Layout components
  Box,
  Paper,
  Grid,
  
  // Feedback components
  Alert,
  CircularProgress,
  
  // Data display
  Typography,
  Chip,
  Divider,
  Avatar,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  
  // Buttons and actions
  Button,
  IconButton,
  
  // Navigation
  Link,
  styled,
  
  // Surfaces
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  
  // Utils
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  useMediaQuery,
  useTheme,
  
} from '@mui/material';
import { 
  Close as CloseIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  VideoCall as VideoCallIcon,
  Description as DescriptionIcon,
  History as HistoryIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  Business as BusinessIcon,
  AccountCircle as AccountCircleIcon,
  Feedback as FeedbackIcon,
  Timeline as TimelineIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  NoteAdd as NoteAddIcon,
  FiberManualRecord as FiberManualRecordIcon
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

// Styled Rating component
const StyledRating = styled(Rating)({
  '& .MuiRating-iconFilled': {
    color: '#1976D2',
  },
  '& .MuiRating-iconHover': {
    color: '#1565C0',
  },
});

// Status color mapping
const STATUS_COLORS = {
  'scheduled': { color: '#1976D2', bgColor: '#E3F2FD', icon: <ScheduleIcon />, label: 'Scheduled' },
  'completed': { color: '#2E7D32', bgColor: '#E8F5E9', icon: <CheckCircleIcon />, label: 'Completed' },
  'cancelled': { color: '#C62828', bgColor: '#FFEBEE', icon: <CancelIcon />, label: 'Cancelled' },
  'rescheduled': { color: '#ED6C02', bgColor: '#FFF3E0', icon: <AccessTimeIcon />, label: 'Rescheduled' },
  'in_progress': { color: '#7B1FA2', bgColor: '#F3E5F5', icon: <TimelineIcon />, label: 'In Progress' },
  'no-show': { color: '#B45309', bgColor: '#FEF3C7', icon: <PersonIcon />, label: 'No Show' }
};

// Decision color mapping
const DECISION_COLORS = {
  'select': { color: '#2E7D32', bgColor: '#E8F5E9', icon: <ThumbUpIcon />, label: 'Select' },
  'reject': { color: '#C62828', bgColor: '#FFEBEE', icon: <ThumbDownIcon />, label: 'Reject' },
  'hold': { color: '#ED6C02', bgColor: '#FFF3E0', icon: <TimelineIcon />, label: 'Hold' }
};

const sections = [
  "Overview",
  "Candidate Details",
  "Job Details",
  "Feedback",
  "History"
];

const ViewInterviewDetails = ({ open, onClose, interviewId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [activeSection, setActiveSection] = useState(0);
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch interview details
  const fetchInterviewDetails = async (showRefreshing = false) => {
    if (!interviewId) return;
    
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/interviews/${interviewId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setInterview(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch interview details');
      }
    } catch (err) {
      console.error('Error fetching interview details:', err);
      if (err.response) {
        setError(err.response.data?.message || 'Failed to fetch interview details');
      } else {
        setError('Failed to fetch interview details. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data when dialog opens
  useEffect(() => {
    if (open && interviewId) {
      fetchInterviewDetails();
    }
  }, [open, interviewId]);

  const handleRefresh = () => {
    fetchInterviewDetails(true);
  };

  const handleClose = () => {
    setInterview(null);
    setActiveSection(0);
    setError('');
    onClose();
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Not set';
    return new Date(dateTimeString).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusChip = (status) => {
    const config = STATUS_COLORS[status] || { color: '#666', bgColor: '#F5F5F5', icon: <EventIcon />, label: status };

    return (
      <Chip
        label={config.label}
        size="small"
        icon={config.icon}
        sx={{
          backgroundColor: config.bgColor,
          color: config.color,
          fontWeight: 500,
          '& .MuiChip-icon': {
            color: config.color
          }
        }}
      />
    );
  };

  const getDecisionChip = (decision) => {
    const config = DECISION_COLORS[decision] || { color: '#666', bgColor: '#F5F5F5', icon: <FeedbackIcon />, label: decision };

    return (
      <Chip
        label={config.label?.toUpperCase()}
        size="small"
        icon={config.icon}
        sx={{
          backgroundColor: config.bgColor,
          color: config.color,
          fontWeight: 500,
          '& .MuiChip-icon': {
            color: config.color
          }
        }}
      />
    );
  };

  // Handle section navigation
  const handleNextSection = () => {
    setActiveSection(prev => Math.min(prev + 1, sections.length - 1));
  };

  const handlePrevSection = () => {
    setActiveSection(prev => Math.max(prev - 1, 0));
  };

  const renderSectionContent = (section) => {
    if (!interview) return null;

    switch(section) {
      case 0: // Overview
        return (
          <Stack spacing={2}>
            {/* Interview Header Card */}
            <Paper elevation={0} sx={{ p: 2, backgroundColor: '#F9F9F9', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon sx={{ color: '#1976D2' }} />
                  <Typography variant="h6" fontWeight={600} color="#101010">
                    Interview Details
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getStatusChip(interview.status)}
                  <Tooltip title="Refresh">
                    <IconButton size="small" onClick={handleRefresh} disabled={refreshing}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                    Interview ID
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ fontFamily: 'monospace' }}>
                    {interview.interviewId || interview._id}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                    Round
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {interview.round}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                    Type
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {interview.type === 'video' && <VideoCallIcon fontSize="small" sx={{ color: '#1976D2' }} />}
                    {interview.type === 'phone' && <PhoneIcon fontSize="small" sx={{ color: '#1976D2' }} />}
                    {interview.type === 'in-person' && <LocationIcon fontSize="small" sx={{ color: '#1976D2' }} />}
                    <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                      {interview.type?.replace('-', ' ')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                    Duration
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {interview.duration} minutes
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                    Scheduled Time
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatDateTime(interview.scheduledAt)}
                  </Typography>
                </Grid>

                {/* Meeting Link or Location */}
                {interview.type === 'video' && interview.meetingLink && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                      Meeting Link
                    </Typography>
                    <Link 
                      href={interview.meetingLink} 
                      target="_blank" 
                      rel="noopener"
                      sx={{ 
                        wordBreak: 'break-all',
                        fontSize: '0.875rem'
                      }}
                    >
                      {interview.meetingLink}
                    </Link>
                  </Grid>
                )}

                {interview.type === 'in-person' && interview.location && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                      Location
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {interview.location}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Interviewers Table */}
            <Paper elevation={0} sx={{ backgroundColor: '#F9F9F9', borderRadius: 2 }}>
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountCircleIcon sx={{ color: '#1976D2' }} />
                <Typography variant="subtitle2" sx={{ color: '#1976D2', fontWeight: 600 }}>
                  Interviewers
                </Typography>
              </Box>
              <Divider />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Email</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {interview.interviewers && interview.interviewers.length > 0 ? (
                      interview.interviewers.map((interviewer, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 28, height: 28, bgcolor: '#1976D2', fontSize: '12px' }}>
                                {interviewer.name?.charAt(0) || 'I'}
                              </Avatar>
                              <Typography variant="body2">{interviewer.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{interviewer.email}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} align="center" sx={{ py: 2 }}>
                          <Typography variant="body2" color="textSecondary">No interviewers assigned</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Metadata Table */}
            <Paper elevation={0} sx={{ backgroundColor: '#F5F5F5', borderRadius: 2 }}>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569', borderBottom: '1px solid #E0E0E0' }}>
                        Created
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #E0E0E0' }}>
                        {formatDateTime(interview.createdAt)} 
                        {interview.createdBy?.Username && ` by ${interview.createdBy.Username}`}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569' }}>
                        Last Updated
                      </TableCell>
                      <TableCell>
                        {formatDateTime(interview.updatedAt)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Stack>
        );

      case 1: // Candidate Details
        {
          const candidate = interview.applicationId?.candidateId || interview.candidateId;
          const application = interview.applicationId;

          if (!candidate) {
            return (
              <Alert severity="info" sx={{ borderRadius: 1 }}>
                No candidate information available
              </Alert>
            );
          }

          return (
            <Stack spacing={2}>
              {/* Candidate Header Card */}
              <Paper elevation={0} sx={{ p: 2, backgroundColor: '#F9F9F9', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Avatar 
                    sx={{ 
                      width: 56, 
                      height: 56, 
                      bgcolor: '#E3F2FD',
                      color: '#1976D2',
                      fontSize: '20px',
                      fontWeight: 600
                    }}
                  >
                    {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#101010' }}>
                      {candidate.fullName || `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || candidate.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                      {application?.status && (
                        <Chip
                          size="small"
                          label={application.status.replace('_', ' ').toUpperCase()}
                          sx={{
                            backgroundColor: 
                              application.status === 'shortlisted' ? '#E8F5E9' :
                              application.status === 'interview_scheduled' ? '#E3F2FD' :
                              application.status === 'rejected' ? '#FFEBEE' : '#F5F5F5',
                            color: 
                              application.status === 'shortlisted' ? '#2E7D32' :
                              application.status === 'interview_scheduled' ? '#1976D2' :
                              application.status === 'rejected' ? '#C62828' : '#666',
                            fontWeight: 500,
                            height: 24
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </Paper>

              {/* Candidate Information Table */}
              <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: '#F9F9F9', borderRadius: 2 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569', borderBottom: '1px solid #E0E0E0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon sx={{ fontSize: 18, color: '#1976D2' }} />
                          Email
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #E0E0E0' }}>{candidate.email}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569', borderBottom: '1px solid #E0E0E0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon sx={{ fontSize: 18, color: '#1976D2' }} />
                          Phone
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #E0E0E0' }}>{candidate.phone || 'N/A'}</TableCell>
                    </TableRow>
                    {candidate.dateOfBirth && (
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569', borderBottom: '1px solid #E0E0E0' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EventIcon sx={{ fontSize: 18, color: '#1976D2' }} />
                            Date of Birth
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #E0E0E0' }}>{formatDate(candidate.dateOfBirth)}</TableCell>
                      </TableRow>
                    )}
                    {candidate.gender && (
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon sx={{ fontSize: 18, color: '#1976D2' }} />
                            Gender
                          </Box>
                        </TableCell>
                        <TableCell>
                          {candidate.gender === 'M' ? 'Male' : candidate.gender === 'F' ? 'Female' : 'Other'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Address */}
              {candidate.address && (
                <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: '#F9F9F9', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: '#101010', backgroundColor: '#F0F0F0' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationIcon sx={{ fontSize: 18, color: '#1976D2' }} />
                            Address
                          </Box>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          {candidate.address.street && `${candidate.address.street}, `}
                          {candidate.address.city}, {candidate.address.state} - {candidate.address.pincode}
                          {candidate.address.country && `, ${candidate.address.country}`}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Education */}
              {candidate.education && candidate.education.length > 0 && (
                <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: '#F9F9F9', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell colSpan={4} sx={{ fontWeight: 600, color: '#101010', backgroundColor: '#F0F0F0' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SchoolIcon sx={{ fontSize: 18, color: '#1976D2' }} />
                            Education
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Degree</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Institution</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Year</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Specialization</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {candidate.education.map((edu, index) => (
                        <TableRow key={index}>
                          <TableCell>{edu.degree}</TableCell>
                          <TableCell>{edu.institution}</TableCell>
                          <TableCell>{edu.yearOfPassing}</TableCell>
                          <TableCell>{edu.specialization || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Experience */}
              {candidate.experience && candidate.experience.length > 0 && (
                <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: '#F9F9F9', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell colSpan={4} sx={{ fontWeight: 600, color: '#101010', backgroundColor: '#F0F0F0' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WorkIcon sx={{ fontSize: 18, color: '#1976D2' }} />
                            Work Experience
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Position</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Company</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Duration</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {candidate.experience.map((exp, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ fontWeight: 500 }}>{exp.position}</TableCell>
                          <TableCell>{exp.company}</TableCell>
                          <TableCell>
                            {exp.fromDate ? formatDate(exp.fromDate) : 'N/A'} - 
                            {exp.current ? 'Present' : (exp.toDate ? formatDate(exp.toDate) : 'N/A')}
                          </TableCell>
                          <TableCell>{exp.description || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Skills */}
              {candidate.skills && candidate.skills.length > 0 && (
                <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: '#F9F9F9', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: '#101010', backgroundColor: '#F0F0F0' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StarIcon sx={{ fontSize: 18, color: '#1976D2' }} />
                            Skills
                          </Box>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {candidate.skills.map((skill, index) => (
                              <Chip
                                key={index}
                                label={skill}
                                size="small"
                                sx={{
                                  backgroundColor: '#E3F2FD',
                                  color: '#1976D2',
                                  fontWeight: 500,
                                  fontSize: '12px',
                                  height: 24
                                }}
                              />
                            ))}
                          </Box>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Stack>
          );
        }

      case 2: // Job Details
        {
          const job = interview.applicationId?.jobId || interview.jobId;

          if (!job) {
            return (
              <Alert severity="info" sx={{ borderRadius: 1 }}>
                No job information available
              </Alert>
            );
          }

          return (
            <Stack spacing={2}>
              {/* Job Header */}
              <Paper elevation={0} sx={{ p: 2, backgroundColor: '#F9F9F9', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#101010' }}>
                  {job.title}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  Job ID: {job.jobId}
                </Typography>
              </Paper>

              {/* Job Details Table */}
              <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: '#F9F9F9', borderRadius: 2 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569', borderBottom: '1px solid #E0E0E0' }}>
                        Department
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #E0E0E0' }}>{job.department}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569', borderBottom: '1px solid #E0E0E0' }}>
                        Employment Type
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #E0E0E0' }}>{job.employmentType}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569', borderBottom: '1px solid #E0E0E0' }}>
                        Location
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #E0E0E0' }}>{job.location}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569', borderBottom: '1px solid #E0E0E0' }}>
                        Experience Required
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #E0E0E0' }}>
                        {job.experienceRequired?.min} - {job.experienceRequired?.max} years
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569' }}>
                        Salary Range
                      </TableCell>
                      <TableCell>
                        {job.salaryRange?.currency} {job.salaryRange?.min?.toLocaleString()} - {job.salaryRange?.max?.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: '#F9F9F9', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: '#101010', backgroundColor: '#F0F0F0' }}>
                          Requirements
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <List dense disablePadding>
                            {job.requirements.map((req, index) => (
                              <ListItem key={index} disableGutters sx={{ py: 0.2 }}>
                                <ListItemIcon sx={{ minWidth: 24 }}>
                                  <CheckCircleIcon fontSize="small" sx={{ color: '#1976D2' }} />
                                </ListItemIcon>
                                <ListItemText primary={req} />
                              </ListItem>
                            ))}
                          </List>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Required Skills */}
              {job.skills && job.skills.length > 0 && (
                <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: '#F9F9F9', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: '#101010', backgroundColor: '#F0F0F0' }}>
                          Required Skills
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {job.skills.map((skill, index) => (
                              <Chip
                                key={index}
                                label={skill}
                                size="small"
                                sx={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}
                              />
                            ))}
                          </Box>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Stack>
          );
        }

      case 3: // Feedback
        {
          const feedback = interview.feedback;

          if (!feedback) {
            return (
              <Alert severity="info" sx={{ borderRadius: 1 }}>
                No feedback has been submitted for this interview yet.
              </Alert>
            );
          }

          return (
            <Stack spacing={2}>
              {/* Ratings */}
              <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: '#F9F9F9', borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: '#101010', backgroundColor: '#F0F0F0' }}>
                        Ratings
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                          {Object.entries(feedback.ratings || {}).map(([key, value]) => (
                            <Box key={key} sx={{ minWidth: 140 }}>
                              <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'capitalize' }}>
                                {key}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <StyledRating value={value} readOnly size="small" precision={0.5} />
                                <Typography variant="body2" fontWeight={500}>
                                  ({value}/5)
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Comments */}
              <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: '#F9F9F9', borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: '#101010', backgroundColor: '#F0F0F0' }}>
                        Comments
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Paper sx={{ p: 1.5, backgroundColor: '#F8FAFC', borderRadius: 1 }}>
                          <Typography variant="body2">{feedback.comments}</Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Strengths & Weaknesses */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: '#F9F9F9', borderRadius: 2, height: '100%' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: '#101010', backgroundColor: '#E8F5E9' }}>
                            Strengths
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <Paper sx={{ p: 1.5, backgroundColor: '#E8F5E9', borderRadius: 1, border: '1px solid #C8E6C9' }}>
                              <Typography variant="body2" sx={{ color: '#2E7D32' }}>
                                {feedback.strengths}
                              </Typography>
                            </Paper>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: '#F9F9F9', borderRadius: 2, height: '100%' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, color: '#101010', backgroundColor: '#FFF3E0' }}>
                            Areas for Improvement
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <Paper sx={{ p: 1.5, backgroundColor: '#FFF3E0', borderRadius: 1, border: '1px solid #FFE0B2' }}>
                              <Typography variant="body2" sx={{ color: '#E65100' }}>
                                {feedback.weaknesses}
                              </Typography>
                            </Paper>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>

              {/* Decision & Submitted By */}
              <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: '#F9F9F9', borderRadius: 2 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569', borderBottom: '1px solid #E0E0E0' }}>
                        Final Decision
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #E0E0E0' }}>
                        {getDecisionChip(feedback.decision)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569', borderBottom: '1px solid #E0E0E0' }}>
                        Submitted By
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #E0E0E0' }}>
                        {feedback.submittedBy?.Username || feedback.submittedBy || 'Unknown'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569' }}>
                        Submitted At
                      </TableCell>
                      <TableCell>
                        {feedback.submittedAt && formatDateTime(feedback.submittedAt)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          );
        }

      case 4: // History
        {
          const history = interview.applicationId?.statusHistory;

          if (!history || history.length === 0) {
            return (
              <Alert severity="info" sx={{ borderRadius: 1 }}>
                No status history available
              </Alert>
            );
          }

          return (
            <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: '#F9F9F9', borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#101010', backgroundColor: '#F0F0F0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HistoryIcon sx={{ fontSize: 18, color: '#1976D2' }} />
                        Status History
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#101010', backgroundColor: '#F0F0F0' }}>
                      Details
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ width: 200, verticalAlign: 'top' }}>
                        <Chip
                          label={entry.status?.replace('_', ' ').toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: 
                              entry.status === 'shortlisted' ? '#E8F5E9' :
                              entry.status === 'interview_scheduled' ? '#E3F2FD' :
                              entry.status === 'interviewed' ? '#F3E5F5' :
                              entry.status === 'rejected' ? '#FFEBEE' : '#F5F5F5',
                            color: 
                              entry.status === 'shortlisted' ? '#2E7D32' :
                              entry.status === 'interview_scheduled' ? '#1976D2' :
                              entry.status === 'interviewed' ? '#7B1FA2' :
                              entry.status === 'rejected' ? '#C62828' : '#666',
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {entry.notes || `Status changed to ${entry.status}`}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          By {entry.changedByName || entry.changedBy?.Username || 'Unknown'} • {formatDateTime(entry.changedAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          );
        }

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 1.5,
          maxHeight: isMobile ? '100%' : '95vh',
          minHeight: isMobile ? '100%' : '500px'
        }
      }}
    >
      <DialogTitle sx={{
        borderBottom: '1px solid #E0E0E0',
        py: 1.5,
        px: isMobile ? 2 : 3,
        backgroundColor: '#F8FAFC',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon sx={{ color: '#1976D2' }} />
          <Typography variant={isMobile ? "subtitle1" : "subtitle1"} component="div" sx={{ fontWeight: 600, color: '#101010' }}>
            Interview Details
          </Typography>
          {interview && (
            <Chip
              label={interview.interviewId || interview._id.slice(-6).toUpperCase()}
              size="small"
              sx={{ 
                bgcolor: '#E3F2FD', 
                color: '#1976D2', 
                fontWeight: 500,
                height: 24,
                fontSize: '12px'
              }}
            />
          )}
        </Box>
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: isMobile ? 2 : 3, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <CircularProgress size={40} sx={{ color: '#1976D2' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 1 }}>{error}</Alert>
        ) : interview ? (
          <Stack spacing={3}>
            {/* Section Stepper - Hide on mobile, show compact version */}
            {!isMobile && (
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#F5F5F5', borderRadius: 2 }}>
                <Stepper
                  activeStep={activeSection}
                  alternativeLabel
                  connector={<ColorConnector />}
                >
                  {sections.map((label) => (
                    <Step key={label}>
                      <StepLabel>
                        <Typography variant="body2" fontWeight={500}>
                          {label}
                        </Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Paper>
            )}

            {/* Mobile Section Indicator */}
            {isMobile && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                <Chip
                  label={`${activeSection + 1}/${sections.length} • ${sections[activeSection]}`}
                  sx={{
                    bgcolor: '#E3F2FD',
                    color: '#1976D2',
                    fontWeight: 500
                  }}
                />
              </Box>
            )}

            {/* Section Content */}
            {renderSectionContent(activeSection)}
          </Stack>
        ) : (
          <Alert severity="info" sx={{ borderRadius: 1 }}>
            No interview data available
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{
        px: isMobile ? 2 : 3,
        py: 2,
        borderTop: '1px solid #E0E0E0',
        backgroundColor: '#F8FAFC',
        position: 'sticky',
        bottom: 0,
        zIndex: 1,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 1 : 0
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          width: '100%',
          flexDirection: isMobile ? 'column-reverse' : 'row',
          gap: isMobile ? 1 : 0
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setActiveSection(prev => Math.max(prev - 1, 0))}
              disabled={activeSection === 0}
              size={isMobile ? 'small' : 'medium'}
              sx={{ 
                borderRadius: 1.5, 
                textTransform: 'none',
                flex: isMobile ? 1 : 'none'
              }}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              onClick={() => setActiveSection(prev => Math.min(prev + 1, sections.length - 1))}
              disabled={activeSection === sections.length - 1}
              size={isMobile ? 'small' : 'medium'}
              sx={{ 
                borderRadius: 1.5, 
                textTransform: 'none',
                flex: isMobile ? 1 : 'none'
              }}
            >
              Next
            </Button>
          </Box>
          
          <Button 
            onClick={handleClose} 
            variant="contained"
            size={isMobile ? 'small' : 'medium'}
            sx={{
              borderRadius: 1.5,
              px: isMobile ? 2 : 4,
              textTransform: 'none',
              fontWeight: 500,
              background: 'linear-gradient(135deg, #164e63, #00B4D8)',
              '&:hover': { opacity: 0.9 },
              width: isMobile ? '100%' : 'auto'
            }}
          >
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ViewInterviewDetails;