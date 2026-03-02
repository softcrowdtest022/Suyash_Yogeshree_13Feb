import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
  Paper
} from '@mui/material';
import {
  WarningAmber as WarningIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const DeleteLeave = ({ open, onClose, leaveData, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!leaveData?._id && !leaveData?.id) {
      setError('Leave ID is missing');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const leaveId = leaveData._id || leaveData.id;

      const response = await axios.delete(`${BASE_URL}/api/leaves/${leaveId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        if (onDelete && typeof onDelete === 'function') {
          onDelete(response.data.message);
        }
        onClose(true); // Pass true to indicate success
      } else {
        setError(response.data.message || 'Failed to delete leave request');
      }
    } catch (err) {
      console.error('Error deleting leave:', err);
      
      if (err.response) {
        // Server responded with error
        if (err.response.status === 404) {
          setError('Leave request not found. It may have been already deleted.');
        } else if (err.response.status === 403) {
          setError('You do not have permission to delete this leave request');
        } else {
          setError(err.response.data?.message || 
                  err.response.data?.error || 
                  `Server error: ${err.response.status}`);
        }
      } else if (err.request) {
        // Request made but no response
        setError('No response from server. Please check your connection.');
      } else {
        // Something else happened
        setError('Error setting up request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset error when closing
    setError('');
    onClose(false); // Pass false when cancelled
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get employee name
  const getEmployeeName = () => {
    if (leaveData?.EmployeeID) {
      const emp = leaveData.EmployeeID;
      return `${emp.FirstName || ''} ${emp.LastName || ''}`.trim() || emp.EmployeeID || 'N/A';
    }
    return leaveData?.employeeName || 'N/A';
  };

  // Get leave type name
  const getLeaveTypeName = () => {
    if (leaveData?.LeaveTypeID) {
      return leaveData.LeaveTypeID.Name || 'N/A';
    }
    return leaveData?.leaveTypeName || 'N/A';
  };

  // Calculate number of days
  const calculateDays = () => {
    if (leaveData?.NumberOfDays) return leaveData.NumberOfDays;
    
    if (leaveData?.StartDate && leaveData?.EndDate) {
      const start = new Date(leaveData.StartDate);
      const end = new Date(leaveData.EndDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 'N/A';
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved':
        return '#4caf50';
      case 'rejected':
        return '#f44336';
      case 'pending':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      {/* Warning Header */}
      <DialogTitle sx={{ 
        backgroundColor: '#fff3e0',
        borderBottom: '1px solid #ffe0b2',
        pb: 2
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningIcon sx={{ color: '#ed6c02', fontSize: 28 }} />
          <Typography variant="h6" component="div" sx={{ color: '#ed6c02', fontWeight: 600 }}>
            Delete Leave Request
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Box sx={{ mt: 2 }}>
          {/* Warning Message */}
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3, 
              borderRadius: 1,
              '& .MuiAlert-icon': {
                alignItems: 'center'
              }
            }}
          >
            <Typography variant="body1" fontWeight={500}>
              Are you sure you want to delete this leave request?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              This action cannot be undone. All data associated with this leave request will be permanently removed.
            </Typography>
          </Alert>

          {/* Leave Details Preview */}
          <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventIcon fontSize="small" />
              Leave Request Details
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Employee Info */}
              <Box display="flex" alignItems="center" gap={1}>
                <PersonIcon sx={{ color: '#666', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                  Employee:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {getEmployeeName()}
                </Typography>
              </Box>

              <Divider />

              {/* Leave Type */}
              <Box display="flex" alignItems="center" gap={1}>
                <DescriptionIcon sx={{ color: '#666', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                  Leave Type:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {getLeaveTypeName()}
                </Typography>
              </Box>

              <Divider />

              {/* Date Range */}
              <Box display="flex" alignItems="flex-start" gap={1}>
                <CalendarIcon sx={{ color: '#666', fontSize: 20, mt: 0.5 }} />
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                  Date Range:
                </Typography>
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {formatDate(leaveData?.StartDate)} - {formatDate(leaveData?.EndDate)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({calculateDays()} {calculateDays() === 1 ? 'day' : 'days'})
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* Reason */}
              {leaveData?.Reason && (
                <>
                  <Box display="flex" alignItems="flex-start" gap={1}>
                    <DescriptionIcon sx={{ color: '#666', fontSize: 20, mt: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                      Reason:
                    </Typography>
                    <Typography variant="body2">
                      {leaveData.Reason.length > 100 
                        ? `${leaveData.Reason.substring(0, 100)}...` 
                        : leaveData.Reason}
                    </Typography>
                  </Box>
                  <Divider />
                </>
              )}

              {/* Contact Number */}
              {leaveData?.ContactNumber && (
                <>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PhoneIcon sx={{ color: '#666', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                      Contact:
                    </Typography>
                    <Typography variant="body2">
                      {leaveData.ContactNumber}
                    </Typography>
                  </Box>
                  <Divider />
                </>
              )}

              {/* Address */}
              {leaveData?.AddressDuringLeave && (
                <Box display="flex" alignItems="flex-start" gap={1}>
                  <LocationIcon sx={{ color: '#666', fontSize: 20, mt: 0.5 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                    Address:
                  </Typography>
                  <Typography variant="body2">
                    {leaveData.AddressDuringLeave.length > 100 
                      ? `${leaveData.AddressDuringLeave.substring(0, 100)}...` 
                      : leaveData.AddressDuringLeave}
                  </Typography>
                </Box>
              )}

              {/* Status */}
              {leaveData?.Status && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Current Status:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      display: 'inline-block',
                      backgroundColor: `${getStatusColor(leaveData.Status)}20`,
                      color: getStatusColor(leaveData.Status),
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontWeight: 500,
                      fontSize: '0.75rem'
                    }}
                  >
                    {leaveData.Status}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Error Display */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                borderRadius: 1,
                '& .MuiAlert-icon': {
                  alignItems: 'center'
                }
              }}
            >
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        pb: 3, 
        pt: 2,
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #e0e0e0'
      }}>
        <Button 
          variant="outlined"
          onClick={handleClose}
          disabled={loading}
          startIcon={<CloseIcon />}
          sx={{
            borderRadius: 1,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500,
            borderColor: '#ccc',
            color: '#666',
            '&:hover': {
              borderColor: '#999',
              backgroundColor: '#f0f0f0'
            }
          }}
        >
          Cancel
        </Button>
        
        <Button
          variant="contained"
          onClick={handleDelete}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
          sx={{
            borderRadius: 1,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500,
            backgroundColor: '#d32f2f',
            '&:hover': {
              backgroundColor: '#b71c1c'
            },
            '&.Mui-disabled': {
              backgroundColor: '#ffcdd2'
            },
            minWidth: '120px'
          }}
        >
          {loading ? 'Deleting...' : 'Delete Leave'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteLeave;