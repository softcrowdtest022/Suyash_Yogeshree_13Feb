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
  Alert,
  CircularProgress,
  IconButton,
  Avatar,
  Divider,
  Card,
  CardContent,
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
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  SupervisorAccount as SupervisorIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../../config/Config';

// Color constants
const PRIMARY_BLUE = '#00B4D8';
const PENDING_COLOR = '#ED6C02';
const COMPLETED_COLOR = '#2E7D32';
const IN_PROGRESS_COLOR = '#0288D1';

// Status color mapping
const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return { bg: '#fef3c7', color: '#92400e', label: 'Pending', icon: <ScheduleIcon /> };
    case 'IN_PROGRESS':
    case 'IN PROGRESS':
      return { bg: '#e3f2fd', color: '#1976d2', label: 'In Progress', icon: <EventIcon /> };
    case 'COMPLETED':
      return { bg: '#d1fae5', color: '#065f46', label: 'Completed', icon: <CheckCircleIcon /> };
    case 'ON_HOLD':
    case 'ON HOLD':
      return { bg: '#fff3e0', color: '#f57c00', label: 'On Hold', icon: <WarningIcon /> };
    default:
      return { bg: '#f1f5f9', color: '#475569', label: status || 'Unknown', icon: <InfoIcon /> };
  }
};

const ViewOnboarding = ({ open, onClose, onboardingData, employeeId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [onboardingDetails, setOnboardingDetails] = useState(onboardingData || null);

  // Fetch onboarding details on open if not provided
  useEffect(() => {
    if (open && !onboardingData && employeeId) {
      fetchOnboardingDetails();
    } else if (onboardingData) {
      setOnboardingDetails(onboardingData);
    }
  }, [open, onboardingData, employeeId]);

  // Fetch onboarding details from API
  const fetchOnboardingDetails = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/onboarding/${employeeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setOnboardingDetails(response.data.data);
      } else {
        setError('Failed to fetch onboarding details');
      }
    } catch (err) {
      console.error('Error fetching onboarding details:', err);
      setError(err.response?.data?.message || 'Failed to fetch onboarding details');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format date time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusStyle = onboardingDetails ? getStatusColor(onboardingDetails.status) : null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: 1, 
        borderColor: '#E0E0E0', 
        bgcolor: '#F8FAFC',
        px: 3,
        py: 2,
        position: 'sticky',
        top: 0,
        zIndex: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon sx={{ color: PRIMARY_BLUE }} />
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Onboarding Details
            </Typography>
            <Typography variant="caption" color="textSecondary">
              View employee onboarding information
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, px: 3, overflowY: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress size={40} sx={{ color: PRIMARY_BLUE }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        ) : onboardingDetails ? (
          <Stack spacing={3}>
            {/* Header Card with Status */}
            <Paper sx={{ p: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Onboarding #{onboardingDetails.onboardingId || 'N/A'}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <Chip
                      icon={statusStyle?.icon}
                      label={statusStyle?.label}
                      sx={{
                        bgcolor: statusStyle?.bg,
                        color: statusStyle?.color,
                        fontWeight: 500,
                        px: 1
                      }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      Created: {formatDateTime(onboardingDetails.createdAt)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Last Updated: {formatDateTime(onboardingDetails.updatedAt)}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Created By
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {onboardingDetails.createdBy || 'System'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Employee Information Card */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" />
                Employee Information
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: PRIMARY_BLUE }}>
                  {onboardingDetails.employee?.name?.charAt(0) || 'E'}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {onboardingDetails.employee?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {onboardingDetails.employee?.email || 'N/A'} • {onboardingDetails.employee?.phone || 'N/A'}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="textSecondary">Employee ID</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <BadgeIcon sx={{ fontSize: 16, color: PRIMARY_BLUE }} />
                    <Typography variant="body2" fontWeight={500}>
                      {onboardingDetails.employee?.id || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="textSecondary">Designation</Typography>
                  <Typography variant="body2">{onboardingDetails.employee?.designation || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="textSecondary">Date of Joining</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <EventIcon sx={{ fontSize: 16, color: PRIMARY_BLUE }} />
                    <Typography variant="body2">
                      {formatDate(onboardingDetails.employee?.dateOfJoining)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="textSecondary">Onboarding Date</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarIcon sx={{ fontSize: 16, color: PRIMARY_BLUE }} />
                    <Typography variant="body2">
                      {formatDate(onboardingDetails.joiningDate)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Onboarding Details Card */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon fontSize="small" />
                Onboarding Details
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon sx={{ fontSize: 18, color: PRIMARY_BLUE }} />
                        Department
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {onboardingDetails.department || 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon sx={{ fontSize: 18, color: PRIMARY_BLUE }} />
                        Work Location
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {onboardingDetails.workLocation || 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>

            {/* Reporting Manager Card */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SupervisorIcon fontSize="small" />
                Reporting Manager
              </Typography>

              {onboardingDetails.reportingManager ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 48, height: 48, bgcolor: PRIMARY_BLUE }}>
                    {onboardingDetails.reportingManager.name?.charAt(0) || 'M'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">
                      {onboardingDetails.reportingManager.name}
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <BadgeIcon sx={{ fontSize: 14, color: PRIMARY_BLUE }} />
                          <Typography variant="body2" color="textSecondary">
                            ID: {onboardingDetails.reportingManager.id}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 14, color: PRIMARY_BLUE }} />
                          <Typography variant="body2" color="textSecondary">
                            {onboardingDetails.reportingManager.email}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <WorkIcon sx={{ fontSize: 14, color: PRIMARY_BLUE }} />
                          <Typography variant="body2" color="textSecondary">
                            Designation: {onboardingDetails.reportingManager.designation || 'N/A'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">No reporting manager assigned</Typography>
              )}
            </Paper>

            {/* Timeline Card */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon fontSize="small" />
                Timeline
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569', bgcolor: '#F8FAFC' }}>
                        Created At
                      </TableCell>
                      <TableCell>{formatDateTime(onboardingDetails.createdAt)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569', bgcolor: '#F8FAFC' }}>
                        Last Updated
                      </TableCell>
                      <TableCell>{formatDateTime(onboardingDetails.updatedAt)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 600, color: '#475569', bgcolor: '#F8FAFC' }}>
                        Expected Joining Date
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon sx={{ fontSize: 16, color: PRIMARY_BLUE }} />
                          {formatDate(onboardingDetails.joiningDate)}
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Additional Information Card */}
            <Paper sx={{ p: 3, bgcolor: '#F0F7FF', border: '1px solid #90CAF9' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon fontSize="small" color="primary" />
                Additional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Onboarding ID</Typography>
                  <Typography variant="body2">{onboardingDetails.onboardingId}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Employee ID</Typography>
                  <Typography variant="body2">{onboardingDetails.employee?.id}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        ) : (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No onboarding details found
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        px: 3, 
        py: 2, 
        borderTop: 1, 
        borderColor: '#E0E0E0', 
        bgcolor: '#F8FAFC',
        justifyContent: 'flex-end',
        position: 'sticky',
        bottom: 0,
        zIndex: 2
      }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          sx={{
            borderRadius: 1.5,
            px: 4,
            textTransform: 'none',
            fontWeight: 500,
            background: 'linear-gradient(135deg, #164e63, #00B4D8)',
            '&:hover': { opacity: 0.9 }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewOnboarding;