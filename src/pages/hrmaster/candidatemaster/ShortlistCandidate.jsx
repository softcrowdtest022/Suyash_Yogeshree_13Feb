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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Description as DescriptionIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const ShortlistCandidate = ({ open, onClose, onShortlist, candidateId, candidateData }) => {
  const [formData, setFormData] = useState({
    jobId: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [candidate, setCandidate] = useState(candidateData || null);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  // Fetch candidate details if not provided
  useEffect(() => {
    if (open && !candidateData && candidateId) {
      fetchCandidateDetails();
    } else if (candidateData) {
      setCandidate(candidateData);
    }
  }, [open, candidateData, candidateId]);

  // Fetch available jobs for dropdown
  useEffect(() => {
    if (open) {
      fetchAvailableJobs();
    }
  }, [open]);

  // Fetch candidate details
  const fetchCandidateDetails = async () => {
    setFetchLoading(true);
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
      setError(err.response?.data?.message || 'Failed to fetch candidate details');
    } finally {
      setFetchLoading(false);
    }
  };

  // Fetch available jobs
  const fetchAvailableJobs = async () => {
    setJobsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/jobs?status=active&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setAvailableJobs(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      // Don't show error for jobs fetch, just set empty array
      setAvailableJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.jobId) {
      setError('Please select a job for shortlisting');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/api/candidates/${candidateId}/shortlist`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess('Candidate shortlisted successfully!');
        setTimeout(() => {
          onShortlist(response.data.data);
          resetForm();
          onClose();
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to shortlist candidate');
      }
    } catch (err) {
      console.error('Error shortlisting candidate:', err);
      setError(err.response?.data?.message || 'Failed to shortlist candidate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      jobId: '',
      notes: ''
    });
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'new': { bg: '#E3F2FD', color: '#1976D2' },
      'screening': { bg: '#F3E5F5', color: '#7B1FA2' },
      'shortlisted': { bg: '#E8F5E8', color: '#2E7D32' },
      'interview_scheduled': { bg: '#FFF3E0', color: '#F57C00' },
      'interviewed': { bg: '#E1F5FE', color: '#0288D1' },
      'selected': { bg: '#E8F5E8', color: '#2E7D32' },
      'offered': { bg: '#F1F8E9', color: '#558B2F' },
      'accepted': { bg: '#E8F5E8', color: '#1B5E20' },
      'rejected': { bg: '#FFEBEE', color: '#C62828' },
      'on_hold': { bg: '#FFF8E1', color: '#FF8F00' },
      'withdrawn': { bg: '#EEEEEE', color: '#616161' }
    };
    return colors[status?.toLowerCase()] || { bg: '#EEEEEE', color: '#616161' };
  };

  const statusColor = candidate ? getStatusColor(candidate.status) : null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #E0E0E0', 
        pb: 2,
        backgroundColor: '#F8FAFC',
        position: 'sticky',
        top: 0,
        zIndex: 1
      }}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#101010',
            paddingTop: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <StarIcon sx={{ color: '#FFB74D' }} />
            Shortlist Candidate
          </div>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {fetchLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} sx={{ color: '#1976D2' }} />
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Candidate Info Card */}
            {candidate && (
              <Paper elevation={0} sx={{ p: 2, backgroundColor: '#F9F9F9', borderRadius: 2 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        bgcolor: '#E3F2FD',
                        color: '#1976D2',
                        fontSize: '20px'
                      }}
                    >
                      {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#101010' }}>
                        {candidate.fullName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {candidate.candidateId}
                      </Typography>
                    </Box>
                    {statusColor && (
                      <Chip
                        label={candidate.status}
                        size="small"
                        sx={{
                          backgroundColor: statusColor.bg,
                          color: statusColor.color,
                          fontWeight: 500
                        }}
                      />
                    )}
                  </Box>

                  <Divider />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon sx={{ fontSize: 18, color: '#9E9E9E' }} />
                        <Box>
                          <Typography variant="caption" color="textSecondary">Email</Typography>
                          <Typography variant="body2">{candidate.email}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: 18, color: '#9E9E9E' }} />
                        <Box>
                          <Typography variant="caption" color="textSecondary">Phone</Typography>
                          <Typography variant="body2">{candidate.phone}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  {candidate.skills?.length > 0 && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="caption" color="textSecondary">Skills</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {candidate.skills.map((skill, idx) => (
                            <Chip
                              key={idx}
                              label={skill}
                              size="small"
                              sx={{
                                backgroundColor: '#E3F2FD',
                                color: '#1976D2',
                                fontSize: '12px'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </>
                  )}
                </Stack>
              </Paper>
            )}

            {/* Shortlist Form */}
            <Paper elevation={0} sx={{ p: 2, backgroundColor: '#F9F9F9', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#101010', mb: 2 }}>
                Shortlist Details
              </Typography>
              
              <Stack spacing={3}>
                {/* Job Selection */}
                <FormControl fullWidth required size="small">
                  <InputLabel>Select Job</InputLabel>
                  <Select
                    name="jobId"
                    value={formData.jobId}
                    onChange={handleChange}
                    label="Select Job"
                    disabled={jobsLoading || loading}
                    sx={{
                      borderRadius: 1,
                      backgroundColor: 'white'
                    }}
                  >
                    <MenuItem value="">
                      <em>Select a job</em>
                    </MenuItem>
                    {availableJobs.map((job) => (
                      <MenuItem key={job._id} value={job._id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WorkIcon sx={{ fontSize: 18, color: '#1976D2' }} />
                          <Box>
                            <Typography variant="body2">{job.title}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {job.department} • {job.location}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                    {availableJobs.length === 0 && !jobsLoading && (
                      <MenuItem disabled>
                        <Typography variant="body2" color="textSecondary">
                          No active jobs available
                        </Typography>
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>

                {/* Notes */}
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  disabled={loading}
                  size="small"
                  variant="outlined"
                  placeholder="Add notes about why you're shortlisting this candidate..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      backgroundColor: 'white'
                    }
                  }}
                />

                {/* Info Alert */}
                <Alert 
                  severity="info" 
                  icon={<StarBorderIcon />}
                  sx={{ 
                    borderRadius: 1,
                    backgroundColor: '#E3F2FD',
                    '& .MuiAlert-icon': {
                      color: '#1976D2'
                    }
                  }}
                >
                  <Typography variant="body2">
                    Shortlisting this candidate will:
                  </Typography>
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                    <li>
                      <Typography variant="caption">
                        Update candidate status to "Shortlisted"
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="caption">
                        Create an application for the selected job
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="caption">
                        Add you as the shortlisting authority
                      </Typography>
                    </li>
                  </ul>
                </Alert>
              </Stack>
            </Paper>

            {/* Success/Error Messages */}
            {success && (
              <Alert 
                severity="success" 
                icon={<CheckCircleIcon />}
                sx={{ 
                  borderRadius: 1,
                  '& .MuiAlert-icon': {
                    alignItems: 'center'
                  }
                }}
              >
                {success}
              </Alert>
            )}
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: 1,
                  '& .MuiAlert-icon': {
                    alignItems: 'center'
                  }
                }}
              >
                {error}
              </Alert>
            )}
          </Stack>
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        pb: 3, 
        borderTop: '1px solid #E0E0E0', 
        pt: 2,
        backgroundColor: '#F8FAFC',
        position: 'sticky',
        bottom: 0,
        zIndex: 1
      }}>
        <Button 
          onClick={handleClose} 
          disabled={loading || fetchLoading}
          sx={{
            borderRadius: 1,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || fetchLoading || !formData.jobId}
          startIcon={loading ? null : <StarIcon />}
          sx={{
            borderRadius: 1,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500,
            backgroundColor: '#FFB74D',
            '&:hover': {
              backgroundColor: '#FFA726'
            },
            '&.Mui-disabled': {
              backgroundColor: '#FFE0B2'
            }
          }}
        >
          {loading ? 'Shortlisting...' : 'Shortlist Candidate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShortlistCandidate;