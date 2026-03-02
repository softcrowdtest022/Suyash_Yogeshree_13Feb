import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const AddLeaveTypes = ({ open, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    Name: '',
    MaxDaysPerYear: '',
    Description: '',
    IsActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'IsActive' ? checked : 
               name === 'MaxDaysPerYear' ? parseInt(value) || '' : 
               value
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.Name.trim()) {
      setError('Leave type name is required');
      return;
    }

    if (formData.Name.trim().length < 2) {
      setError('Leave type name must be at least 2 characters');
      return;
    }

    if (!formData.MaxDaysPerYear || formData.MaxDaysPerYear < 1) {
      setError('Maximum days per year must be at least 1');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Prepare data - ensure MaxDaysPerYear is a number
      const submitData = {
        ...formData,
        MaxDaysPerYear: parseInt(formData.MaxDaysPerYear)
      };

      const response = await axios.post(`${BASE_URL}/api/leavetypes`, submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response:', response.data);

      // Check if response is successful
      if (response.data.success) {
        // Only call onAdd if it exists and is a function
        if (onAdd && typeof onAdd === 'function') {
          onAdd(response.data.data);
        }
        
        resetForm();
        onClose(true); // Pass true to indicate success
      } else {
        setError(response.data.message || 'Failed to add leave type');
      }
    } catch (err) {
      console.error('Error adding leave type:', err);
      
      // Handle specific error cases
      if (err.response) {
        setError(err.response.data?.message || 
                err.response.data?.error || 
                `Server error: ${err.response.status}`);
      } else if (err.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('Error setting up request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      Name: '',
      MaxDaysPerYear: '',
      Description: '',
      // IsActive: true
    });
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose(false); // Pass false when cancelled
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
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
          Add New Leave Type
        </div>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {/* Add padding from top for the first field */}
          <div style={{ marginTop: '16px' }}>
            <TextField
              fullWidth
              label="Leave Type Name"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              required
              error={!!error && (error.includes('Leave type name') || error.includes('name must be'))}
              helperText={error && (error.includes('Leave type name') || error.includes('name must be')) ? error : ''}
              disabled={loading}
              size="medium"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                }
              }}
            />
          </div>
          
          <TextField
            fullWidth
            label="Maximum Days Per Year"
            name="MaxDaysPerYear"
            value={formData.MaxDaysPerYear}
            onChange={handleChange}
            required
            type="number"
            inputProps={{ 
              min: 1,
              max: 365,
              step: 1
            }}
            error={!!error && error.includes('Maximum days')}
            helperText={error && error.includes('Maximum days') ? error : 'Enter maximum number of days allowed per year'}
            disabled={loading}
            size="medium"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              }
            }}
          />
          
          <TextField
            fullWidth
            label="Description"
            name="Description"
            value={formData.Description}
            onChange={handleChange}
            multiline
            rows={4}
            disabled={loading}
            size="medium"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              }
            }}
          />
          
          {/* <FormControlLabel
            control={
              <Switch
                checked={formData.IsActive}
                onChange={handleChange}
                name="IsActive"
                color="primary"
                disabled={loading}
              />
            }
            label="Active"
            sx={{ mt: 1 }}
          /> */}
          
          {error && !error.includes('Leave type name') && !error.includes('name must be') && !error.includes('Maximum days') && (
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
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        pb: 3, 
        borderTop: '1px solid #E0E0E0', 
        pt: 2,
        backgroundColor: '#F8FAFC'
      }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
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
          disabled={loading}
          startIcon={loading ? null : <AddIcon />}
          sx={{
            borderRadius: 1,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500,
            backgroundColor: '#1976D2',
            '&:hover': {
              backgroundColor: '#1565C0'
            }
          }}
        >
          {loading ? 'Adding...' : 'Add Leave Type'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddLeaveTypes;