import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Grid,
  Chip,
  Box,
  Typography,
  Paper,
  IconButton,
  Avatar,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Stack
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  MonetizationOn as MonetizationIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';
import { format } from 'date-fns';

const steps = ['Draft', 'Pending Approval', 'Approved', 'Filled'];

const ViewRequisition = ({ open, onClose, requisitionId, onEdit }) => {
  const [requisition, setRequisition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (open && requisitionId) {
      fetchRequisitionDetails();
    }
  }, [open, requisitionId]);

  const fetchRequisitionDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/requisitions/${requisitionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setRequisition(response.data.data);
        setActiveStep(getStepFromStatus(response.data.data.status));
      } else {
        setError(response.data.message || 'Failed to fetch requisition details');
      }
    } catch (err) {
      console.error('Error fetching requisition:', err);
      setError(err.response?.data?.message || 'Failed to fetch requisition details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepFromStatus = (status) => {
    const statusSteps = {
      'draft': 0,
      'pending_approval': 1,
      'approved': 2,
      'in_progress': 2,
      'filled': 3,
      'rejected': 1,
      'closed': 3
    };
    return statusSteps[status?.toLowerCase()] || 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMM yyyy, hh:mm a');
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: { bg: '#FFF3E0', color: '#E65100', icon: <PendingIcon sx={{ fontSize: 14 }} /> },
      pending_approval: { bg: '#FFF3E0', color: '#E65100', icon: <PendingIcon sx={{ fontSize: 14 }} /> },
      approved: { bg: '#E8F5E9', color: '#2E7D32', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
      rejected: { bg: '#FFEBEE', color: '#C62828', icon: <CloseIcon sx={{ fontSize: 14 }} /> },
      in_progress: { bg: '#E3F2FD', color: '#1976D2', icon: <TrendingUpIcon sx={{ fontSize: 14 }} /> },
      filled: { bg: '#E8F5E9', color: '#2E7D32', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
      closed: { bg: '#F5F5F5', color: '#616161', icon: <CloseIcon sx={{ fontSize: 14 }} /> }
    };
    return colors[status?.toLowerCase()] || { bg: '#F5F5F5', color: '#616161', icon: <PendingIcon sx={{ fontSize: 14 }} /> };
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#F44336',
      critical: '#9C27B0'
    };
    return colors[priority?.toLowerCase()] || '#757575';
  };

const StatCard = ({ icon, label, value, color }) => (
  <Card sx={{ 
    backgroundColor: '#F8FAFC',
    border: '1px solid #E0E0E0',
    borderRadius: 1,
    boxShadow: 'none'
  }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5 }}>
      <Avatar sx={{ bgcolor: color, width: 36, height: 36 }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="caption" sx={{ color: '#666', display: 'block' }} component="span">
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#101010' }} component="div">
          {value}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

  const InfoRow = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
      <Box sx={{ color: '#1976D2', minWidth: 20, display: 'flex', justifyContent: 'center' }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ color: '#101010', fontWeight: 500 }}>
          {value || 'N/A'}
        </Typography>
      </Box>
    </Box>
  );

  const Section = ({ title, children }) => (
    <Paper sx={{ p: 1.5, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
      <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );

  const nextStep = () => setActiveStep((prev) => prev + 1);
  const backStep = () => setActiveStep((prev) => prev - 1);

  if (!requisition && !loading) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      {/* HEADER with gradient background like ViewSalary */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg,#164e63,#0ea5e9)',
          color: '#fff',
          fontSize: 20,
          fontWeight: 600,
          py: 2
        }}
      >
        Requisition Details – {requisition?.requisitionId || ''}
      </DialogTitle>

      {/* STEPPER - exactly like ViewSalary */}
      {requisition && (
        <Box sx={{ px: 4, pt: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      )}

      <DialogContent sx={{ px: 4, py: 3, overflow: 'auto', flexGrow: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Loading requisition details...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 1 }}>{error}</Alert>
        ) : requisition && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* STEP 1 - Basic Information */}
            {activeStep === 0 && (
              <>
                {/* Status Cards */}
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <StatCard
                      icon={<AssignmentIcon sx={{ fontSize: 16 }} />}
                      label="Status"
                      value={
                        <Chip
                          label={requisition.status?.replace('_', ' ') || 'DRAFT'}
                          size="small"
                          icon={getStatusColor(requisition.status).icon}
                          sx={{
                            backgroundColor: getStatusColor(requisition.status).bg,
                            color: getStatusColor(requisition.status).color,
                            fontWeight: 600,
                            fontSize: '11px',
                            height: 22
                          }}
                        />
                      }
                      color="#1976D2"
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <StatCard
                      icon={<WorkIcon sx={{ fontSize: 16 }} />}
                      label="Positions"
                      value={`${requisition.hiredPositions || 0}/${requisition.noOfPositions}`}
                      color="#2E7D32"
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <StatCard
                      icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
                      label="Priority"
                      value={
                        <Chip
                          label={requisition.priority || 'MEDIUM'}
                          size="small"
                          sx={{
                            backgroundColor: `${getPriorityColor(requisition.priority)}20`,
                            color: getPriorityColor(requisition.priority),
                            fontWeight: 600,
                            fontSize: '11px',
                            height: 22
                          }}
                        />
                      }
                      color="#FF9800"
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <StatCard
                      icon={<CalendarIcon sx={{ fontSize: 16 }} />}
                      label="Target Date"
                      value={formatDate(requisition.targetHireDate)}
                      color="#F44336"
                    />
                  </Grid>
                </Grid>

                {/* Basic Information */}
                <Section title="Basic Information">
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 6 }}>
                      <InfoRow
                        icon={<BusinessIcon sx={{ fontSize: 16 }} />}
                        label="Department"
                        value={requisition.department}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <InfoRow
                        icon={<LocationIcon sx={{ fontSize: 16 }} />}
                        label="Location"
                        value={requisition.location}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <InfoRow
                        icon={<WorkIcon sx={{ fontSize: 16 }} />}
                        label="Position Title"
                        value={requisition.positionTitle}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <InfoRow
                        icon={<PersonIcon sx={{ fontSize: 16 }} />}
                        label="Employment Type"
                        value={requisition.employmentType}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <InfoRow
                        icon={<AssignmentIcon sx={{ fontSize: 16 }} />}
                        label="Reason for Hire"
                        value={requisition.reasonForHire}
                      />
                    </Grid>
                  </Grid>
                </Section>
              </>
            )}

            {/* STEP 2 - Qualifications & Budget */}
            {activeStep === 1 && (
              <Section title="Qualifications & Budget">
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6 }}>
                    <InfoRow
                      icon={<SchoolIcon sx={{ fontSize: 16 }} />}
                      label="Education"
                      value={requisition.education}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <InfoRow
                      icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
                      label="Experience"
                      value={`${requisition.experienceYears} years`}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <InfoRow
                      icon={<MonetizationIcon sx={{ fontSize: 16 }} />}
                      label="Budget Range"
                      value={`₹${requisition.budgetMin?.toLocaleString()} - ₹${requisition.budgetMax?.toLocaleString()}`}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <InfoRow
                      icon={<AssignmentIcon sx={{ fontSize: 16 }} />}
                      label="Grade"
                      value={requisition.grade}
                    />
                  </Grid>
                </Grid>
              </Section>
            )}

            {/* STEP 3 - Additional Details */}
            {activeStep === 2 && (
              <Stack spacing={3}>
                {/* Skills Section */}
                {requisition.skills && requisition.skills.length > 0 && (
                  <Section title="Required Skills">
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {requisition.skills.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          sx={{
                            backgroundColor: '#E3F2FD',
                            color: '#1976D2',
                            fontWeight: 500,
                            height: 22,
                            fontSize: '11px'
                          }}
                        />
                      ))}
                    </Box>
                  </Section>
                )}

                {/* Justification */}
                <Section title="Justification">
                  <Typography variant="body2" sx={{ color: '#333', fontSize: '0.8rem' }}>
                    {requisition.justification}
                  </Typography>
                </Section>

                {/* Attachments */}
                {requisition.attachments && requisition.attachments.length > 0 && (
                  <Section title="Attachments">
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {requisition.attachments.map((attachment, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <DescriptionIcon sx={{ color: '#666', fontSize: 14 }} />
                          <Typography variant="caption" sx={{ color: '#1976D2', textDecoration: 'underline', cursor: 'pointer' }}>
                            {attachment.filename || `Attachment ${index + 1}`}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Section>
                )}

                {/* Comments */}
                {requisition.comments && requisition.comments.length > 0 && (
                  <Section title="Comments">
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {requisition.comments.map((comment, index) => (
                        <Paper key={index} sx={{ p: 1, backgroundColor: '#F8FAFC', borderRadius: 1 }}>
                          <Typography variant="caption" sx={{ color: '#333', display: 'block', mb: 0.5 }}>
                            {comment.text}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666', fontSize: '10px' }}>
                            By {comment.userName || 'Unknown'} • {formatDateTime(comment.createdAt)}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  </Section>
                )}

                {/* Created By Info */}
                <Paper sx={{ p: 1.5, backgroundColor: '#F8FAFC', borderRadius: 1, border: '1px solid #E0E0E0' }}>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                        Created By
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#101010', fontSize: '0.8rem' }}>
                        {requisition.createdByName || requisition.createdBy?.Username || 'N/A'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666', fontSize: '10px' }}>
                        Role: {requisition.createdByRole || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                        Created At
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#101010', fontSize: '0.8rem' }}>
                        {formatDateTime(requisition.createdAt)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666', fontSize: '10px' }}>
                        Updated: {formatDateTime(requisition.updatedAt)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Stack>
            )}
          </Box>
        )}
      </DialogContent>

      {/* ACTIONS - exactly like ViewSalary */}
      <DialogActions sx={{ px: 4, pb: 3 }}>
        <Button onClick={onClose}>Close</Button>

        {activeStep > 0 && (
          <Button onClick={backStep}>Back</Button>
        )}

        {activeStep < 2 ? (
          <Button variant="contained" onClick={nextStep}>
            Next
          </Button>
        ) : (
          requisition && requisition.status === 'draft' && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => {
                onClose();
                if (onEdit) onEdit(requisition);
              }}
            >
              Edit Requisition
            </Button>
          )
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ViewRequisition;