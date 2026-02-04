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
  FormControlLabel,
  Checkbox,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const EditTax = ({ open, onClose, tax, onUpdate }) => {
  const [formData, setFormData] = useState({
    HSNCode: '',
    GSTPercentage: '',
    GSTType: 'CGST/SGST', // Default value
    Description: '',
    IsActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tax) {
      setFormData({
        HSNCode: tax.HSNCode || '',
        GSTPercentage: tax.GSTPercentage?.toString() || '',
        GSTType: tax.GSTType || 'CGST/SGST', // Set GSTType from API
        Description: tax.Description || '',
        IsActive: tax.IsActive || true
      });
    }
  }, [tax]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.HSNCode.trim()) {
      setError('HSN Code is required');
      return;
    }

    if (!formData.GSTPercentage) {
      setError('GST Percentage is required');
      return;
    }

    const gstPercentage = parseFloat(formData.GSTPercentage);
    if (isNaN(gstPercentage) || gstPercentage < 0 || gstPercentage > 100) {
      setError('GST Percentage must be a number between 0 and 100');
      return;
    }

    if (!formData.GSTType.trim()) {
      setError('GST Type is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${BASE_URL}/api/taxes/${tax._id}`, {
        ...formData,
        GSTPercentage: gstPercentage
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        onUpdate(response.data.data);
        onClose();
      } else {
        setError(response.data.message || 'Failed to update tax');
      }
    } catch (err) {
      console.error('Error updating tax:', err);
      setError(err.response?.data?.message || 'Failed to update tax. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
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
          Edit Tax
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
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="HSN Code *"
                  name="HSNCode"
                  value={formData.HSNCode}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  size="medium"
                  variant="outlined"
                  error={!!error && error.includes('HSN Code')}
                  helperText={error && error.includes('HSN Code') ? error : ''}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="GST Percentage *"
                  name="GSTPercentage"
                  value={formData.GSTPercentage}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  size="medium"
                  variant="outlined"
                  type="number"
                  error={!!error && error.includes('GST Percentage')}
                  helperText={error && error.includes('GST Percentage') ? error : 'Enter percentage (e.g., 18)'}
                  InputProps={{
                    inputProps: {
                      step: "0.01",
                      min: "0",
                      max: "100"
                    },
                    endAdornment: '%'
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    }
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth size="medium" disabled={loading}>
                  <InputLabel id="gst-type-label">GST Type *</InputLabel>
                  <Select
                    labelId="gst-type-label"
                    id="gst-type-select"
                    name="GSTType"
                    value={formData.GSTType}
                    label="GST Type *"
                    onChange={handleSelectChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                      }
                    }}
                  >
                    <MenuItem value="CGST/SGST">CGST/SGST</MenuItem>
                    <MenuItem value="IGST">IGST</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                }
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  name="IsActive"
                  checked={formData.IsActive}
                  onChange={handleChange}
                  color="primary"
                  disabled={loading}
                />
              }
              label="Active Tax"
              sx={{ mt: 1 }}
            />
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
          onClick={onClose} 
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
          startIcon={loading ? null : <EditIcon />}
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
          {loading ? 'Updating...' : 'Update Tax'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTax;