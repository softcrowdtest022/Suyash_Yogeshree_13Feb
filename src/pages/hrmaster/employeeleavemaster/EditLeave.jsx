import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress
} from '@mui/material';
import { CloseSharp, Edit as EditIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const EditLeave = ({ open, onClose, leaveData, onUpdate }) => {
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: null,
    endDate: null,
    reason: '',
    contactNumber: '',
    addressDuringLeave: ''
  });
  
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateError, setDateError] = useState('');

  // Fetch leave types when component mounts
  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  // Set form data when leaveData changes
  useEffect(() => {
    if (leaveData) {
      setFormData({
        leaveTypeId: leaveData.LeaveTypeID?._id || leaveData.leaveTypeId || '',
        startDate: leaveData.StartDate ? new Date(leaveData.StartDate) : null,
        endDate: leaveData.EndDate ? new Date(leaveData.EndDate) : null,
        reason: leaveData.Reason || leaveData.reason || '',
        contactNumber: leaveData.ContactNumber || leaveData.contactNumber || '',
        addressDuringLeave: leaveData.AddressDuringLeave || leaveData.addressDuringLeave || ''
      });
    }
  }, [leaveData]);

  const fetchLeaveTypes = async () => {
    setFetchLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/leavetypes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setLeaveTypes(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching leave types:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific errors
    if (error && (error.includes('contact') || error.includes('address'))) {
      setError('');
    }
  };

  const handleDateChange = (field, date) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
    
    // Clear date error when dates are modified
    setDateError('');
    
    // Validate date range
    if (field === 'startDate' && formData.endDate && date) {
      if (date > formData.endDate) {
        setDateError('Start date cannot be after end date');
      }
    } else if (field === 'endDate' && formData.startDate && date) {
      if (formData.startDate > date) {
        setDateError('End date cannot be before start date');
      }
    }
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.leaveTypeId) {
      setError('Please select a leave type');
      return;
    }

    if (!formData.startDate) {
      setError('Start date is required');
      return;
    }

    if (!formData.endDate) {
      setError('End date is required');
      return;
    }

    if (formData.startDate > formData.endDate) {
      setDateError('Start date cannot be after end date');
      setError('Please fix the date range');
      return;
    }

    if (!formData.reason.trim()) {
      setError('Reason is required');
      return;
    }

    // if (formData.reason.trim().length < 10) {
    //   setError('Reason must be at least 10 characters');
    //   return;
    // }

    if (!formData.contactNumber.trim()) {
      setError('Contact number is required');
      return;
    }

    if (!validatePhoneNumber(formData.contactNumber)) {
      setError('Please enter a valid 10-digit contact number');
      return;
    }

    if (!formData.addressDuringLeave.trim()) {
      setError('Address during leave is required');
      return;
    }

    if (formData.addressDuringLeave.trim().length < 10) {
      setError('Address must be at least 10 characters');
      return;
    }

    setLoading(true);
    setError('');
    setDateError('');

    try {
      const token = localStorage.getItem('token');
      
      // Format dates to YYYY-MM-DD
      const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Prepare data for API
      const submitData = {
        leaveTypeId: formData.leaveTypeId,
        startDate: formatDate(formData.startDate),
        endDate: formatDate(formData.endDate),
        reason: formData.reason.trim(),
        contactNumber: formData.contactNumber.trim(),
        addressDuringLeave: formData.addressDuringLeave.trim()
      };

      const response = await axios.put(
        `${BASE_URL}/api/leaves/${leaveData._id || leaveData.id}`,
        submitData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        if (onUpdate && typeof onUpdate === 'function') {
          onUpdate(response.data.data);
        }
        onClose(true); // Pass true to indicate success
      } else {
        setError(response.data.message || 'Failed to update leave request');
      }
    } catch (err) {
      console.error('Error updating leave:', err);
      
      if (err.response) {
        // Server responded with error
        setError(err.response.data?.message || 
                err.response.data?.error || 
                `Server error: ${err.response.status}`);
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
    // Reset form and errors when closing
    setError('');
    setDateError('');
    onClose(false); // Pass false when cancelled
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #E0E0E0', 
        pb: 2,
        backgroundColor: '#F8FAFC'
      }}>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#101010',
          paddingTop: '8px'
        }}>
          Edit Leave Request
        </div>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack spacing={3}>
            {/* Add padding from top for the first field */}
            <div style={{ marginTop: '16px' }}>
              <FormControl fullWidth required>
                <InputLabel id="leave-type-label">Leave Type</InputLabel>
                <Select
                  labelId="leave-type-label"
                  name="leaveTypeId"
                  value={formData.leaveTypeId}
                  onChange={handleChange}
                  label="Leave Type"
                  disabled={loading || fetchLoading}
                  sx={{
                    borderRadius: 1,
                  }}
                >
                  {fetchLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} /> Loading...
                    </MenuItem>
                  ) : (
                    leaveTypes.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.Name} (Max: {type.MaxDaysPerYear} days)
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </div>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date *"
                  value={formData.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  disabled={loading}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!dateError,
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                        }
                      }
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date *"
                  value={formData.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  disabled={loading}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!dateError,
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                        }
                      }
                    }
                  }}
                />
              </Grid>
            </Grid>
            
            {dateError && (
              <Alert severity="warning" sx={{ borderRadius: 1 }}>
                {dateError}
              </Alert>
            )}
            
            <TextField
              fullWidth
              label="Reason for Leave *"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              multiline
              rows={1}
              required
              error={!!error && (error.includes('Reason') || error.includes('reason'))}
              helperText={error && (error.includes('Reason') || error.includes('reason')) ? error : ''}
              disabled={loading}
              size="medium"
              variant="outlined"
              placeholder="Please provide detailed reason for leave"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                }
              }}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Number *"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                  error={!!error && error.includes('contact')}
                  helperText={error && error.includes('contact') ? error : 'Enter 10-digit mobile number'}
                  disabled={loading}
                  size="medium"
                  variant="outlined"
                  placeholder="9876543210"
                  inputProps={{
                    maxLength: 10,
                    pattern: '[0-9]*'
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                {/* Empty grid item for spacing if needed */}
              </Grid>
            </Grid>

            {/* Address field - Full width */}
            <TextField
              fullWidth
              label="Address During Leave *"
              name="addressDuringLeave"
              value={formData.addressDuringLeave}
              onChange={handleChange}
              multiline
              rows={1}
              required
              error={!!error && error.includes('Address')}
              helperText={error && error.includes('Address') ? error : 'Enter your complete address during leave'}
              disabled={loading}
              size="medium"
              variant="outlined"
              placeholder="House/Flat No., Street, Area, City, State - PIN Code"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                },
                mt: 1
              }}
            />
            
            {error && !error.includes('Reason') && !error.includes('contact') && !error.includes('Address') && !dateError && (
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
        </LocalizationProvider>
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        pb: 3, 
        borderTop: '1px solid #E0E0E0', 
        pt: 2,
        backgroundColor: '#F8FAFC'
      }}>
        <Button 
          variant="contained"
          onClick={handleClose}
          disabled={loading}
          startIcon={<CloseSharp />}
          sx={{
            borderRadius: 1,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500,
            backgroundColor: '#9e9e9e',
            '&:hover': {
              backgroundColor: '#757575'
            }
          }}
        >
          Cancel
        </Button>
        
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || fetchLoading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <EditIcon />}
          sx={{
            borderRadius: 1,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500,
            backgroundColor: '#1976D2',
            '&:hover': {
              backgroundColor: '#1565C0'
            },
            minWidth: '140px'
          }}
        >
          {loading ? 'Updating...' : 'Update Leave'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditLeave;