import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Grid,
  Box,
  Paper,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
  Card,
  CardContent,
  Tooltip,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';

// Import Timeline components from @mui/lab
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  VerifiedUser as VerifiedUserIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  Fingerprint as FingerprintIcon,
  Gavel as GavelIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  CloudUpload as CloudUploadIcon,
  Refresh as RefreshIcon,
  AccessTime as AccessTimeIcon,
  Error as ErrorIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  RemoveRedEye as ViewIcon,
  Download as DownloadIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import axios from 'axios';

const BGVStatus = ({ open, onClose, bgvId = null, bgvData = null }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bgvDetails, setBgvDetails] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [expandedCheck, setExpandedCheck] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const steps = [
    'Overview',
    'Verification Checks',
    'Documents & Reports'
  ];

  useEffect(() => {
    if (open && bgvId) {
      fetchBGVDetails(bgvId);
    } else if (open && bgvData) {
      setBgvDetails(bgvData);
    }
  }, [open, bgvId, bgvData]);

  const fetchBGVDetails = async (id) => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/bgv/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setBgvDetails(response.data.data);
      } else {
        setError('Failed to fetch BGV details');
      }
    } catch (err) {
      console.error('Error fetching BGV details:', err);
      setError(err.response?.data?.message || 'Failed to fetch BGV details');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!bgvDetails?._id) return;
    
    setRefreshing(true);
    await fetchBGVDetails(bgvDetails._id);
    setRefreshing(false);
    setSuccess('Status updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setExpandedCheck(null);
  };

  const handleClose = () => {
    handleReset();
    setBgvDetails(null);
    setError('');
    setSuccess('');
    onClose();
  };

  const toggleCheckExpand = (checkId) => {
    setExpandedCheck(expandedCheck === checkId ? null : checkId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { bg: '#f1f5f9', color: '#475569', icon: <AccessTimeIcon />, label: 'Pending' };
      case 'in_progress':
      case 'in progress':
        return { bg: '#fef3c7', color: '#92400e', icon: <RefreshIcon />, label: 'In Progress' };
      case 'completed':
      case 'verified':
        return { bg: '#d1fae5', color: '#065f46', icon: <CheckCircleIcon />, label: 'Completed' };
      case 'failed':
      case 'discrepancy':
        return { bg: '#fee2e2', color: '#991b1b', icon: <ErrorIcon />, label: 'Failed' };
      case 'under_review':
        return { bg: '#dbeafe', color: '#1e40af', icon: <InfoIcon />, label: 'Under Review' };
      default:
        return { bg: '#f1f5f9', color: '#475569', icon: <InfoIcon />, label: status || 'Unknown' };
    }
  };

  const getOverallProgress = () => {
    if (!bgvDetails?.checks) return 0;
    const completed = bgvDetails.checks.filter(c => 
      c.status?.toLowerCase() === 'completed' || c.status?.toLowerCase() === 'verified'
    ).length;
    return Math.round((completed / bgvDetails.checks.length) * 100);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            {/* Status Banner */}
            <Paper sx={{ 
              p: 3, 
              bgcolor: bgvDetails?.status === 'completed' ? '#E8F5E9' : 
                       bgvDetails?.status === 'in_progress' ? '#FFF3E0' : 
                       bgvDetails?.status === 'failed' ? '#FFEBEE' : '#F8FAFC',
              border: `1px solid ${
                bgvDetails?.status === 'completed' ? '#81C784' : 
                bgvDetails?.status === 'in_progress' ? '#FFB74D' : 
                bgvDetails?.status === 'failed' ? '#E57373' : '#E0E0E0'
              }`
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {bgvDetails?.status === 'completed' && <CheckCircleIcon sx={{ color: '#388E3C', fontSize: 40 }} />}
                {bgvDetails?.status === 'in_progress' && <RefreshIcon sx={{ color: '#F57C00', fontSize: 40 }} />}
                {bgvDetails?.status === 'failed' && <ErrorIcon sx={{ color: '#D32F2F', fontSize: 40 }} />}
                {!['completed', 'in_progress', 'failed'].includes(bgvDetails?.status) && 
                  <AccessTimeIcon sx={{ color: '#757575', fontSize: 40 }} />}
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ 
                    color: bgvDetails?.status === 'completed' ? '#388E3C' :
                           bgvDetails?.status === 'in_progress' ? '#F57C00' :
                           bgvDetails?.status === 'failed' ? '#D32F2F' : '#757575'
                  }}>
                    BGV {getStatusColor(bgvDetails?.status).label}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    BGV ID: {bgvDetails?.bgvId || bgvDetails?._id}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="textSecondary">
                    Overall Progress
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={getOverallProgress()} 
                      sx={{ width: 100, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" fontWeight={600}>
                      {getOverallProgress()}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Candidate Info Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                👤 Candidate Information
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#1976D2', width: 56, height: 56 }}>
                      {bgvDetails?.candidateId?.firstName?.charAt(0)}{bgvDetails?.candidateId?.lastName?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {bgvDetails?.candidateId?.fullName || 
                         `${bgvDetails?.candidateId?.firstName || ''} ${bgvDetails?.candidateId?.lastName || ''}`}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {bgvDetails?.candidateId?.email} • {bgvDetails?.candidateId?.phone}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkIcon fontSize="small" color="primary" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Position
                      </Typography>
                      <Typography variant="body2">
                        {bgvDetails?.offerId?.position || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon fontSize="small" color="primary" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Offer ID
                      </Typography>
                      <Typography variant="body2">
                        {bgvDetails?.offerId?.offerId || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon fontSize="small" color="primary" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Vendor
                      </Typography>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {bgvDetails?.vendor || 'AuthBridge'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon fontSize="small" color="primary" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Initiated On
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(bgvDetails?.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Timeline Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                ⏱️ Verification Timeline
              </Typography>

              <Timeline position="alternate">
                <TimelineItem>
                  <TimelineOppositeContent color="textSecondary" variant="caption">
                    {formatDate(bgvDetails?.createdAt)}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color="primary">
                      <SecurityIcon fontSize="small" />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="subtitle2">BGV Initiated</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Verification process started
                    </Typography>
                  </TimelineContent>
                </TimelineItem>

                <TimelineItem>
                  <TimelineOppositeContent color="textSecondary" variant="caption">
                    {bgvDetails?.checks?.some(c => c.startedAt) ? formatDate(bgvDetails.checks.find(c => c.startedAt)?.startedAt) : 'Pending'}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color={bgvDetails?.checks?.some(c => c.status === 'in_progress') ? 'warning' : 'grey'}>
                      <RefreshIcon fontSize="small" />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="subtitle2">Verification in Progress</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {bgvDetails?.checks?.filter(c => c.status === 'in_progress').length} checks ongoing
                    </Typography>
                  </TimelineContent>
                </TimelineItem>

                <TimelineItem>
                  <TimelineOppositeContent color="textSecondary" variant="caption">
                    {bgvDetails?.status === 'completed' ? formatDate(bgvDetails?.updatedAt) : 'Expected: 5-7 days'}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color={bgvDetails?.status === 'completed' ? 'success' : 'grey'}>
                      {bgvDetails?.status === 'completed' ? 
                        <CheckCircleIcon fontSize="small" /> : 
                        <AccessTimeIcon fontSize="small" />
                      }
                    </TimelineDot>
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="subtitle2">Verification Completed</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {bgvDetails?.status === 'completed' ? 'All checks verified' : 'Awaiting completion'}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              </Timeline>
            </Paper>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            {/* Verification Checks Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                🔍 Verification Checks ({bgvDetails?.checks?.length || 0})
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableBody>
                    {bgvDetails?.checks?.map((check) => {
                      const statusStyle = getStatusColor(check.status);
                      const isExpanded = expandedCheck === check._id;

                      return (
                        <React.Fragment key={check._id}>
                          <TableRow 
                            hover 
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': { bgcolor: '#F5F9FF' }
                            }}
                            onClick={() => toggleCheckExpand(check._id)}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {check.type === 'identity' && <FingerprintIcon color="primary" />}
                                {check.type === 'address' && <HomeIcon color="primary" />}
                                {check.type === 'education' && <SchoolIcon color="primary" />}
                                {check.type === 'employment' && <WorkIcon color="primary" />}
                                {check.type === 'criminal' && <GavelIcon color="primary" />}
                                {check.type === 'reference' && <PersonIcon color="primary" />}
                                {check.type === 'drug' && <WarningIcon color="primary" />}
                                {check.type === 'credit' && <BusinessIcon color="primary" />}
                                
                                <Box>
                                  <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                                    {check.type} Verification
                                  </Typography>
                                  {check.verifiedBy && (
                                    <Typography variant="caption" color="textSecondary">
                                      Verified by: {check.verifiedBy}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            
                            <TableCell align="center">
                              <Chip
                                size="small"
                                icon={statusStyle.icon}
                                label={statusStyle.label}
                                sx={{ 
                                  bgcolor: statusStyle.bg,
                                  color: statusStyle.color,
                                  fontWeight: 500,
                                  minWidth: 100
                                }}
                              />
                            </TableCell>
                            
                            <TableCell align="right">
                              <Typography variant="caption" color="textSecondary">
                                {check.completedAt ? formatDate(check.completedAt) : 
                                 check.startedAt ? 'In Progress' : 'Not Started'}
                              </Typography>
                            </TableCell>
                          </TableRow>

                          {isExpanded && (
                            <TableRow>
                              <TableCell colSpan={3} sx={{ bgcolor: '#F8FAFC', py: 2 }}>
                                <Box sx={{ p: 2 }}>
                                  <Grid container spacing={2}>
                                    {/* Check Details */}
                                    {check.verifiedDetails && (
                                      <Grid item xs={12}>
                                        <Typography variant="subtitle2" gutterBottom>
                                          Verification Details
                                        </Typography>
                                        <Typography variant="body2">
                                          {check.verifiedDetails}
                                        </Typography>
                                      </Grid>
                                    )}

                                    {/* Remarks */}
                                    {check.remarks && (
                                      <Grid item xs={12}>
                                        <Typography variant="subtitle2" gutterBottom>
                                          Remarks
                                        </Typography>
                                        <Alert severity="info" icon={<InfoIcon />}>
                                          {check.remarks}
                                        </Alert>
                                      </Grid>
                                    )}

                                    {/* Discrepancies */}
                                    {check.discrepancies && check.discrepancies.length > 0 && (
                                      <Grid item xs={12}>
                                        <Typography variant="subtitle2" gutterBottom sx={{ color: '#D32F2F' }}>
                                          Discrepancies Found
                                        </Typography>
                                        <List>
                                          {check.discrepancies.map((disc, idx) => (
                                            <ListItem key={idx}>
                                              <ListItemIcon>
                                                <ErrorIcon color="error" fontSize="small" />
                                              </ListItemIcon>
                                              <ListItemText 
                                                primary={disc}
                                                secondary="Please provide clarification"
                                              />
                                            </ListItem>
                                          ))}
                                        </List>
                                      </Grid>
                                    )}

                                    {/* Documents */}
                                    {check.documents && check.documents.length > 0 && (
                                      <Grid item xs={12}>
                                        <Typography variant="subtitle2" gutterBottom>
                                          Supporting Documents
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                          {check.documents.map((doc, idx) => (
                                            <Chip
                                              key={idx}
                                              icon={<DescriptionIcon />}
                                              label={doc.name || `Document ${idx + 1}`}
                                              variant="outlined"
                                              onClick={() => window.open(doc.url, '_blank')}
                                            />
                                          ))}
                                        </Box>
                                      </Grid>
                                    )}

                                    {/* Timeline */}
                                    <Grid item xs={12}>
                                      <Typography variant="subtitle2" gutterBottom>
                                        Check Timeline
                                      </Typography>
                                      <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                        {check.startedAt && (
                                          <Box>
                                            <Typography variant="caption" color="textSecondary">
                                              Started
                                            </Typography>
                                            <Typography variant="body2">
                                              {formatDate(check.startedAt)}
                                            </Typography>
                                          </Box>
                                        )}
                                        {check.completedAt && (
                                          <Box>
                                            <Typography variant="caption" color="textSecondary">
                                              Completed
                                            </Typography>
                                            <Typography variant="body2">
                                              {formatDate(check.completedAt)}
                                            </Typography>
                                          </Box>
                                        )}
                                        {check.verifiedAt && (
                                          <Box>
                                            <Typography variant="caption" color="textSecondary">
                                              Verified
                                            </Typography>
                                            <Typography variant="body2">
                                              {formatDate(check.verifiedAt)}
                                            </Typography>
                                          </Box>
                                        )}
                                      </Box>
                                    </Grid>
                                  </Grid>
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Summary Stats */}
            <Paper sx={{ p: 3, bgcolor: '#F8FAFC' }}>
              <Grid container spacing={3}>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="#1976D2" fontWeight={600}>
                      {bgvDetails?.checks?.filter(c => c.status === 'completed').length || 0}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Completed
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="#F57C00" fontWeight={600}>
                      {bgvDetails?.checks?.filter(c => c.status === 'in_progress').length || 0}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      In Progress
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="#D32F2F" fontWeight={600}>
                      {bgvDetails?.checks?.filter(c => c.status === 'failed').length || 0}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Failed
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="#757575" fontWeight={600}>
                      {bgvDetails?.checks?.filter(c => c.status === 'pending').length || 0}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Pending
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            {/* Documents Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                📄 Uploaded Documents
              </Typography>

              {bgvDetails?.documents && bgvDetails.documents.length > 0 ? (
                <Grid container spacing={2}>
                  {bgvDetails.documents.map((doc, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <DescriptionIcon color="primary" sx={{ fontSize: 40 }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2">
                                {doc.documentType || `Document ${index + 1}`}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Uploaded: {formatDate(doc.uploadedAt)}
                              </Typography>
                              {doc.verified && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                  <CheckCircleIcon fontSize="small" color="success" />
                                  <Typography variant="caption" color="success">
                                    Verified
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                            <Tooltip title="View Document">
                              <IconButton onClick={() => window.open(doc.url, '_blank')}>
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download">
                              <IconButton onClick={() => window.open(doc.url, '_blank')}>
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <DescriptionIcon sx={{ fontSize: 48, color: '#BDBDBD', mb: 2 }} />
                  <Typography color="textSecondary">
                    No documents uploaded yet
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Reports Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                📊 Verification Reports
              </Typography>

              {bgvDetails?.reports && bgvDetails.reports.length > 0 ? (
                <Grid container spacing={2}>
                  {bgvDetails.reports.map((report, index) => (
                    <Grid item xs={12} key={index}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          '&:hover': { bgcolor: '#F8FAFC' }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <DescriptionIcon color="primary" />
                          <Box>
                            <Typography variant="subtitle2">
                              {report.title || `Verification Report ${index + 1}`}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Generated: {formatDate(report.generatedAt)} • Size: {report.size || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <Tooltip title="View Report">
                            <IconButton onClick={() => window.open(report.url, '_blank')}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download">
                            <IconButton onClick={() => window.open(report.url, '_blank')}>
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Print">
                            <IconButton onClick={() => window.print()}>
                              <PrintIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <DescriptionIcon sx={{ fontSize: 48, color: '#BDBDBD', mb: 2 }} />
                  <Typography color="textSecondary">
                    No reports available yet
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Reports will be generated once verification is complete
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Action Required Card */}
            {bgvDetails?.checks?.some(c => c.status === 'failed' || c.discrepancies) && (
              <Paper sx={{ p: 3, bgcolor: '#FFEBEE', border: '1px solid #E57373' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ErrorIcon sx={{ color: '#D32F2F', fontSize: 32 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ color: '#D32F2F' }}>
                      Action Required
                    </Typography>
                    <Typography variant="body2">
                      Some verifications have discrepancies. Please provide clarification or upload additional documents.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => window.open(`${BASE_URL}/api/bgv/${bgvDetails._id}/documents`, '_blank')}
                  >
                    Upload Documents
                  </Button>
                </Box>
              </Paper>
            )}
          </Stack>
        );

      default:
        return 'Unknown step';
    }
  };

  if (loading) {
    return (
      <Dialog open={open} maxWidth="md" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, flexDirection: 'column', gap: 2 }}>
            <CircularProgress />
            <Typography color="textSecondary">Loading BGV details...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, minHeight: '80vh' } }}
    >
      <DialogTitle sx={{
        borderBottom: '1px solid #E0E0E0',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Background Verification Status
          </Typography>
          {bgvDetails?.bgvId && (
            <Typography variant="caption" color="textSecondary">
              BGV ID: {bgvDetails.bgvId} • Vendor: {bgvDetails.vendor}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Download Report">
            <IconButton>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print">
            <IconButton>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Error/Success Messages */}
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError('')}
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert 
            severity="success" 
            icon={<CheckCircleIcon />}
            onClose={() => setSuccess('')}
            sx={{ mb: 3 }}
          >
            {success}
          </Alert>
        )}

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 1 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ minHeight: 450 }}>
          {getStepContent(activeStep)}
        </Box>
      </DialogContent>

      <DialogActions sx={{
        px: 3,
        py: 2,
        borderTop: '1px solid #E0E0E0',
        backgroundColor: '#F8FAFC',
        justifyContent: 'space-between'
      }}>
        <Button onClick={handleClose}>
          Close
        </Button>

        <Box>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleReset}
              sx={{
                backgroundColor: '#1976D2',
                '&:hover': { backgroundColor: '#1565C0' }
              }}
            >
              View from Start
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
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

export default BGVStatus;