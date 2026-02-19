import React, { useState, useEffect } from 'react';
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
  Chip,
  Avatar,
  Divider,
  Grid,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  styled,
  StepConnector,
  Badge,
  useMediaQuery,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  NoteAdd as NoteAddIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
  Star as StarIcon,
  Update as UpdateIcon,
  Download as DownloadIcon,
  Timeline as TimelineIcon,
  LinkedIn as LinkedInIcon,
  Language as LanguageIcon,
  Business as BusinessIcon,
  CloudUpload as CloudUploadIcon,
  People as PeopleIcon,
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

const sections = ["Overview", "Contact & Address", "Education & Skills", "Experience", "Notes"];

// Status color mapping with proper enum values
const STATUS_COLORS = {
  'new': { bg: '#E3F2FD', color: '#1976D2', icon: <PendingIcon />, label: 'New' },
  'contacted': { bg: '#F3E5F5', color: '#7B1FA2', icon: <PersonIcon />, label: 'Contacted' },
  'shortlisted': { bg: '#E8F5E8', color: '#2E7D32', icon: <StarIcon />, label: 'Shortlisted' },
  'interviewed': { bg: '#E1F5FE', color: '#0288D1', icon: <PersonIcon />, label: 'Interviewed' },
  'selected': { bg: '#E8F5E8', color: '#2E7D32', icon: <CheckCircleIcon />, label: 'Selected' },
  'rejected': { bg: '#FFEBEE', color: '#C62828', icon: <ErrorIcon />, label: 'Rejected' },
  'onHold': { bg: '#FFF8E1', color: '#FF8F00', icon: <PendingIcon />, label: 'On Hold' },
  'joined': { bg: '#E8F5E8', color: '#1B5E20', icon: <CheckCircleIcon />, label: 'Joined' }
};

// Source icon mapping with proper enum values
const SOURCE_ICONS = {
  'naukri': { icon: <LanguageIcon />, color: '#FF5722', label: 'Naukri' },
  'linkedin': { icon: <LinkedInIcon />, color: '#0077B5', label: 'LinkedIn' },
  'indeed': { icon: <WorkIcon />, color: '#003A9B', label: 'Indeed' },
  'walkin': { icon: <PeopleIcon />, color: '#4CAF50', label: 'Walk-in' },
  'reference': { icon: <PeopleIcon />, color: '#9C27B0', label: 'Reference' },
  'careerPage': { icon: <BusinessIcon />, color: '#FF9800', label: 'Career Page' },
  'upload': { icon: <CloudUploadIcon />, color: '#00BCD4', label: 'Upload' },
  'other': { icon: <PersonIcon />, color: '#9E9E9E', label: 'Other' }
};

const ViewCandidate = ({ open, onClose, candidateId, candidateData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [candidate, setCandidate] = useState(candidateData || null);
  const [loading, setLoading] = useState(!candidateData);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState(0);

  // Fetch candidate details if not provided
  useEffect(() => {
    if (open && !candidateData && candidateId) {
      fetchCandidateDetails();
    }
  }, [open, candidateData, candidateId]);

  // Fetch candidate details
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format date time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status style
  const getStatusStyle = (status) => {
    return STATUS_COLORS[status?.toLowerCase()] || { 
      bg: '#EEEEEE', 
      color: '#616161', 
      icon: <PersonIcon />, 
      label: status || 'Unknown' 
    };
  };

  // Get source info
  const getSourceInfo = (source) => {
    return SOURCE_ICONS[source?.toLowerCase()] || { 
      icon: <PersonIcon />, 
      color: '#9E9E9E', 
      label: source || 'Other' 
    };
  };

  // Handle view resume
  const handleViewResume = () => {
    if (candidate?.resume?.fileUrl) {
      window.open(`${BASE_URL}${candidate.resume.fileUrl}`, '_blank');
    }
  };

  // Handle download resume
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

  const statusStyle = candidate ? getStatusStyle(candidate.status) : null;
  const sourceInfo = candidate ? getSourceInfo(candidate.source) : null;

  // Handle section navigation
  const handleNextSection = () => {
    setActiveSection(prev => Math.min(prev + 1, sections.length - 1));
  };

  const handlePrevSection = () => {
    setActiveSection(prev => Math.max(prev - 1, 0));
  };

  // Render section content
  const renderSectionContent = (section) => {
    switch(section) {
      case 0: // Overview - Clean table format
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#101010' }}>
                      {candidate.fullName}
                    </Typography>
                    <Chip
                      label={candidate.candidateId}
                      size="small"
                      sx={{ 
                        bgcolor: '#E3F2FD', 
                        color: '#1976D2', 
                        fontWeight: 500,
                        height: 22,
                        fontSize: '11px'
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                    {statusStyle && (
                      <Chip
                        size="small"
                        icon={statusStyle.icon}
                        label={statusStyle.label}
                        sx={{
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                          fontWeight: 500,
                          height: 24,
                          '& .MuiChip-icon': { 
                            color: statusStyle.color,
                            fontSize: 16
                          }
                        }}
                      />
                    )}
                    {sourceInfo && (
                      <Chip
                        size="small"
                        icon={sourceInfo.icon}
                        label={sourceInfo.label}
                        sx={{
                          backgroundColor: '#E3F2FD',
                          color: sourceInfo.color,
                          fontWeight: 500,
                          height: 24,
                          '& .MuiChip-icon': { 
                            color: sourceInfo.color,
                            fontSize: 16
                          }
                        }}
                      />
                    )}
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

            {/* Quick Information Table */}
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
                    <TableCell sx={{ borderBottom: '1px solid #E0E0E0' }}>{candidate.phone}</TableCell>
                  </TableRow>
                  {candidate.dateOfBirth && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569', borderBottom: '1px solid #E0E0E0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon sx={{ fontSize: 18, color: '#1976D2' }} />
                          Date of Birth
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #E0E0E0' }}>{formatDate(candidate.dateOfBirth)}</TableCell>
                    </TableRow>
                  )}
                  {candidate.gender && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569', borderBottom: '1px solid #E0E0E0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon sx={{ fontSize: 18, color: '#1976D2' }} />
                          Gender
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #E0E0E0' }}>
                        {candidate.gender === 'M' ? 'Male' : candidate.gender === 'F' ? 'Female' : 'Other'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Metadata Table */}
            <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: '#F5F5F5', borderRadius: 2 }}>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569', borderBottom: '1px solid #E0E0E0' }}>
                      Created
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #E0E0E0' }}>
                      {formatDateTime(candidate.createdAt)} 
                      {candidate.createdByName && ` by ${candidate.createdByName}`}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569' }}>
                      Last Updated
                    </TableCell>
                    <TableCell>
                      {formatDateTime(candidate.updatedAt)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        );

      case 1: // Contact & Address - Table format
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: '#F9F9F9', borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={2} sx={{ fontWeight: 600, color: '#101010', backgroundColor: '#F0F0F0' }}>
                        Contact Information
                      </TableCell>
                    </TableRow>
                  </TableHead>
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
                      <TableCell sx={{ borderBottom: '1px solid #E0E0E0' }}>{candidate.phone}</TableCell>
                    </TableRow>
                    {candidate.dateOfBirth && (
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569', borderBottom: '1px solid #E0E0E0' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarIcon sx={{ fontSize: 18, color: '#1976D2' }} />
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
            </Grid>

            {candidate.address && (
              <Grid item xs={12} md={6}>
                <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: '#F9F9F9', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell colSpan={2} sx={{ fontWeight: 600, color: '#101010', backgroundColor: '#F0F0F0' }}>
                          Address
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {candidate.address.street && (
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569', borderBottom: '1px solid #E0E0E0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationIcon sx={{ fontSize: 18, color: '#1976D2' }} />
                              Street
                            </Box>
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #E0E0E0' }}>{candidate.address.street}</TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569', borderBottom: '1px solid #E0E0E0' }}>
                          City
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #E0E0E0' }}>{candidate.address.city}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569', borderBottom: '1px solid #E0E0E0' }}>
                          State
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #E0E0E0' }}>{candidate.address.state}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569', borderBottom: '1px solid #E0E0E0' }}>
                          Pincode
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #E0E0E0' }}>{candidate.address.pincode}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569' }}>
                          Country
                        </TableCell>
                        <TableCell>{candidate.address.country}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}
          </Grid>
        );

      case 2: // Education & Skills - Table format
        return (
          <Stack spacing={2}>
            {/* Education Table */}
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
                  {candidate.education && candidate.education.length > 0 ? (
                    candidate.education.map((edu, index) => (
                      <TableRow key={index}>
                        <TableCell>{edu.degree}</TableCell>
                        <TableCell>{edu.institution}</TableCell>
                        <TableCell>{edu.yearOfPassing}</TableCell>
                        <TableCell>{edu.specialization || '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 2 }}>
                        <Typography variant="body2" color="textSecondary">No education details available</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Skills Table */}
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
                      {candidate.skills && candidate.skills.length > 0 ? (
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
                      ) : (
                        <Typography variant="body2" color="textSecondary">No skills listed</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        );

      case 3: // Experience - Table format
        return (
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
                {candidate.experience && candidate.experience.length > 0 ? (
                  candidate.experience.map((exp, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ fontWeight: 500 }}>{exp.position}</TableCell>
                      <TableCell>{exp.company}</TableCell>
                      <TableCell>
                        {exp.fromDate ? formatDate(exp.fromDate) : 'N/A'} - 
                        {exp.current ? 'Present' : (exp.toDate ? formatDate(exp.toDate) : 'N/A')}
                      </TableCell>
                      <TableCell>{exp.description || '-'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 2 }}>
                      <Typography variant="body2" color="textSecondary">No experience details available</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 4: // Notes - Table format
        return (
          <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: '#F9F9F9', borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell colSpan={3} sx={{ fontWeight: 600, color: '#101010', backgroundColor: '#F0F0F0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimelineIcon sx={{ fontSize: 18, color: '#1976D2' }} />
                      Notes & Activity
                    </Box>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', width: '15%' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', width: '60%' }}>Note</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', width: '25%' }}>Added By / Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {candidate.notes && candidate.notes.length > 0 ? (
                  candidate.notes.map((note, index) => (
                    <TableRow key={note._id || index}>
                      <TableCell>
                        <Chip
                          label="Note"
                          size="small"
                          sx={{
                            backgroundColor: '#7B1FA2',
                            color: '#FFFFFF',
                            fontSize: '10px',
                            height: '20px'
                          }}
                        />
                      </TableCell>
                      <TableCell>{note.text}</TableCell>
                      <TableCell>
                        <Typography variant="caption" display="block">
                          {note.createdByName || 'System'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatDateTime(note.createdAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                      <NoteAddIcon sx={{ fontSize: 32, color: '#94A3B8', mb: 1 }} />
                      <Typography variant="body2" color="textSecondary">No notes available</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: { 
          borderRadius: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100%' : '90vh',
          minHeight: isMobile ? '100%' : '500px'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #E0E0E0', 
        pb: 2,
        backgroundColor: '#F8FAFC',
        position: 'sticky',
        top: 0,
        zIndex: 2,
        px: isMobile ? 2 : 3
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon sx={{ color: '#1976D2' }} />
            <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={600} color="#101010">
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
                  fontSize: '12px'
                }}
              />
            )}
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, pb: 1, px: isMobile ? 2 : 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <CircularProgress size={40} sx={{ color: '#1976D2' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 1 }}>
            {error}
          </Alert>
        ) : candidate && (
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
              onClick={handlePrevSection}
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
              onClick={handleNextSection}
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
            onClick={onClose} 
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

export default ViewCandidate;