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
  Grid,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const AddProcess = ({ open, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    ProcessName: '',
    RateType: 'Per Hour', // Default value
    Rate: '',
    VendorOrInhouse: 'Vendor', // Default value
    Description: '',
    IsActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Rate type options
  const rateTypeOptions = ['Per Nos', 'Per Kg', 'Per Hour', 'Fixed'];
  
  // Vendor/Inhouse options
  const vendorInhouseOptions = ['Vendor', 'Inhouse'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e) => {
    setFormData(prev => ({
      ...prev,
      IsActive: e.target.checked
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.ProcessName.trim()) {
      setError('Process Name is required');
      return;
    }

    if (!formData.RateType.trim()) {
      setError('Rate Type is required');
      return;
    }

    if (!formData.Rate || formData.Rate <= 0) {
      setError('Rate must be greater than 0');
      return;
    }

    if (!formData.VendorOrInhouse.trim()) {
      setError('Vendor/Inhouse selection is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/api/processes`, {
        ...formData,
        Rate: parseFloat(formData.Rate)
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        onAdd(response.data.data);
        resetForm();
        onClose();
      } else {
        setError(response.data.message || 'Failed to add process');
      }
    } catch (err) {
      console.error('Error adding process:', err);
      setError(err.response?.data?.message || 'Failed to add process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      ProcessName: '',
      RateType: 'Per Hour',
      Rate: '',
      VendorOrInhouse: 'Vendor',
      Description: '',
      IsActive: true
    });
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
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
          overflow: 'visible'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #E0E0E0', 
        pb: 2,
        backgroundColor: '#F8FAFC',
        pt: 3,
        px: 3
      }}>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#101010'
        }}>
          Add New Process
        </div>
      </DialogTitle>
      
      <DialogContent sx={{ 
        pt: 4,
        px: 3,
        pb: 2
      }}>
        {/* Show error at the top if exists */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 1,
              mb: 3,
              '& .MuiAlert-icon': {
                alignItems: 'center'
              }
            }}
          >
            {error}
          </Alert>
        )}

        {/* Add extra margin top container */}
        <Box sx={{ mt: 1 }}>
          <Stack spacing={3}>
            {/* Process Name */}
            <TextField
              fullWidth
              label="Process Name *"
              name="ProcessName"
              value={formData.ProcessName}
              onChange={handleChange}
              required
              disabled={loading}
              size="medium"
              variant="outlined"
              error={!!error && error.includes('Process Name')}
              helperText={error && error.includes('Process Name') ? error : 'Enter the name of the manufacturing process'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                }
              }}
            />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                {/* Rate Type Dropdown */}
                <FormControl fullWidth size="medium" disabled={loading}>
                  <InputLabel id="rate-type-label">Rate Type *</InputLabel>
                  <Select
                    labelId="rate-type-label"
                    id="rate-type-select"
                    name="RateType"
                    value={formData.RateType}
                    label="Rate Type *"
                    onChange={handleSelectChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                      }
                    }}
                  >
                    {rateTypeOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                {/* Rate */}
                <TextField
                  fullWidth
                  label={`Rate (${formData.RateType}) *`}
                  name="Rate"
                  type="number"
                  value={formData.Rate}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  size="medium"
                  variant="outlined"
                  error={!!error && error.includes('Rate')}
                  helperText={error && error.includes('Rate') ? error : `Enter rate per ${formData.RateType.toLowerCase().replace('per ', '')}`}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                    inputProps: {
                      step: "0.01",
                      min: "0"
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    }
                  }}
                />
              </Grid>
            </Grid>

            {/* Vendor/Inhouse Dropdown */}
            <FormControl fullWidth size="medium" disabled={loading}>
              <InputLabel id="vendor-inhouse-label">Vendor/Inhouse *</InputLabel>
              <Select
                labelId="vendor-inhouse-label"
                id="vendor-inhouse-select"
                name="VendorOrInhouse"
                value={formData.VendorOrInhouse}
                label="Vendor/Inhouse *"
                onChange={handleSelectChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  }
                }}
              >
                {vendorInhouseOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Description */}
            <TextField
              fullWidth
              label="Description"
              name="Description"
              value={formData.Description}
              onChange={handleChange}
              multiline
              rows={3}
              disabled={loading}
              size="medium"
              variant="outlined"
              placeholder="Describe the process, equipment used, special requirements, etc."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                }
              }}
            />

            {/* Status */}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.IsActive}
                  onChange={handleSwitchChange}
                  color="primary"
                />
              }
              label={formData.IsActive ? 'Active Process' : 'Inactive Process'}
              sx={{ mt: 1 }}
            />

            {/* Rate Preview */}
            {formData.Rate && (
              <Box sx={{ 
                p: 3, 
                bgcolor: '#E8F5E9', 
                borderRadius: 1,
                border: '1px solid #C8E6C9'
              }}>
                <Typography variant="subtitle2" fontWeight={600} color="#2E7D32" gutterBottom>
                  Rate Information
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Process:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight={500} align="right">
                      {formData.ProcessName || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Rate Type:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight={500} align="right">
                      {formData.RateType}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Rate:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" fontWeight={700} color="success.main" align="right">
                      {formatCurrency(formData.Rate)} / {formData.RateType.toLowerCase().replace('per ', '')}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Type:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight={500} align="right">
                      {formData.VendorOrInhouse === 'Vendor' ? 'External Vendor' : 'In-house'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Stack>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        pb: 3, 
        pt: 2,
        borderTop: '1px solid #E0E0E0',
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
            },
            minWidth: '140px'
          }}
        >
          {loading ? 'Adding...' : 'Add Process'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProcess;