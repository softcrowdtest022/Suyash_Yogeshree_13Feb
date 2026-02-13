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
  Checkbox,
  Grid,
  Box
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const AddVendor = ({ open, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    VendorCode: '',
    VendorName: '',
    BillingAddress: '',
    ShippingAddress: '',
    GSTIN: '',
    State: '',
    StateCode: '',
    ContactPerson: '',
    Phone: '',
    Email: '',
    PaymentTerms: '',
    IsActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.VendorCode.trim()) {
      setError('Vendor code is required');
      return;
    }

    if (!formData.VendorName.trim()) {
      setError('Vendor name is required');
      return;
    }

    if (!formData.VendorPerson.trim()) {
      setError('Contact person is required');
      return;
    }

    if (!formData.Phone.trim()) {
      setError('Phone number is required');
      return;
    }

    if (formData.Email && !/\S+@\S+\.\S+/.test(formData.Email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/api/customers`, formData, {
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
        setError(response.data.message || 'Failed to add vendor');
      }
    } catch (err) {
      console.error('Error adding vendor:', err);
      setError(err.response?.data?.message || 'Failed to add vendor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      VendorCode: '',
      VendorName: '',
      BillingAddress: '',
      ShippingAddress: '',
      GSTIN: '',
      State: '',
      StateCode: '',
      ContactPerson: '',
      Phone: '',
      Email: '',
      PaymentTerms: '',
      IsActive: true
    });
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          overflow: 'visible'
        }
      }}
    >
      {/* <DialogTitle sx={{ 
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
          Add New Vendor
        </div>
      </DialogTitle> */}
      
      <DialogContent sx={{ 
        pt: 4, // Increased padding top from 3 to 4
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
                  label="Vendor Code *"
                  name="VendorCode"
                  value={formData.VendorCode}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  size="medium"
                  variant="outlined"
                  error={!!error && error.includes('Vendor code')}
                  helperText={error && error.includes('Vendor code') ? error : ''}
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
                  label="Vendor Name *"
                  name="VendorName"
                  value={formData.VendorName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  size="medium"
                  variant="outlined"
                  error={!!error && error.includes('Vendor name')}
                  helperText={error && error.includes('Vendor name') ? error : ''}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    }
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Person *"
                  name="ContactPerson"
                  value={formData.ContactPerson}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  size="medium"
                  variant="outlined"
                  error={!!error && error.includes('Contact person')}
                  helperText={error && error.includes('Contact person') ? error : ''}
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
                  label="Phone *"
                  name="Phone"
                  value={formData.Phone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  size="medium"
                  variant="outlined"
                  error={!!error && error.includes('Phone number')}
                  helperText={error && error.includes('Phone number') ? error : ''}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    }
                  }}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              type="email"
              disabled={loading}
              size="medium"
              variant="outlined"
              error={!!error && error.includes('email')}
              helperText={error && error.includes('email') ? error : ''}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                }
              }}
            />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="GSTIN"
                  name="GSTIN"
                  value={formData.GSTIN}
                  onChange={handleChange}
                  disabled={loading}
                  size="medium"
                  variant="outlined"
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
                  label="State"
                  name="State"
                  value={formData.State}
                  onChange={handleChange}
                  disabled={loading}
                  size="medium"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    }
                  }}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="State Code"
              name="StateCode"
              value={formData.StateCode}
              onChange={handleChange}
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
              label="Billing Address"
              name="BillingAddress"
              value={formData.BillingAddress}
              onChange={handleChange}
              multiline
              rows={2}
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
              label="Shipping Address"
              name="ShippingAddress"
              value={formData.ShippingAddress}
              onChange={handleChange}
              multiline
              rows={2}
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
              label="Payment Terms"
              name="PaymentTerms"
              value={formData.PaymentTerms}
              onChange={handleChange}
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
              label="Active Vendor"
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
          {loading ? 'Adding...' : 'Add Vendor'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddVendor;