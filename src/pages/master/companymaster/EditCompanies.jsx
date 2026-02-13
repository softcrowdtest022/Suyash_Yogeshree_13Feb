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
  Grid,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Box
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const steps = ['Company Information', 'Bank & Contact Details'];

const EditCompanies = ({ open, onClose, company, onUpdate }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    CompanyName: '',
    Address: '',
    GSTIN: '',
    PAN: '',
    State: '',
    StateCode: '',
    Phone: '',
    Email: '',
    BankName: '',
    AccountNo: '',
    IFSC: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (company) {
      setFormData({
        CompanyName: company.CompanyName || '',
        Address: company.Address || '',
        GSTIN: company.GSTIN || '',
        PAN: company.PAN || '',
        State: company.State || '',
        StateCode: company.StateCode || '',
        Phone: company.Phone || '',
        Email: company.Email || '',
        BankName: company.BankName || '',
        AccountNo: company.AccountNo || '',
        IFSC: company.IFSC || ''
      });
    }
  }, [company]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: 
        if (!formData.CompanyName.trim()) {
          setError('Company name is required');
          return false;
        }
        if (!formData.Address.trim()) {
          setError('Address is required');
          return false;
        }
        if (!formData.GSTIN.trim()) {
          setError('GSTIN is required');
          return false;
        }
        if (!formData.PAN.trim()) {
          setError('PAN is required');
          return false;
        }
        if (!formData.State.trim()) {
          setError('State is required');
          return false;
        }
        if (!formData.StateCode) {
          setError('State code is required');
          return false;
        }
        break;
      
      case 1:
        if (!formData.Email.trim()) {
          setError('Email is required');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
          setError('Please enter a valid email address');
          return false;
        }
        break;
      
      default:
        return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setError('');
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${BASE_URL}/api/company/${company._id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        onUpdate(response.data.data);
        onClose();
      } else {
        setError(response.data.message || 'Failed to update company');
      }
    } catch (err) {
      console.error('Error updating company:', err);
      setError(err.response?.data?.message || 'Failed to update company. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={2.5}>
        
            <TextField
              fullWidth
              label="Company Name *"
              name="CompanyName"
              value={formData.CompanyName}
              onChange={handleChange}
              required
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
              label="Address *"
              name="Address"
              value={formData.Address}
              onChange={handleChange}
              required
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
            
  
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="GSTIN *"
                  name="GSTIN"
                  value={formData.GSTIN}
                  onChange={handleChange}
                  required
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
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="PAN *"
                  name="PAN"
                  value={formData.PAN}
                  onChange={handleChange}
                  required
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
            
      
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  label="State *"
                  name="State"
                  value={formData.State}
                  onChange={handleChange}
                  required
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
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="State Code *"
                  name="StateCode"
                  value={formData.StateCode}
                  onChange={handleChange}
                  required
                  type="number"
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
          </Stack>
        );
      
      case 1:
        return (
          <Stack spacing={2.5}>
  
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Email *"
                  name="Email"
                  type="email"
                  value={formData.Email}
                  onChange={handleChange}
                  required
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
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="Phone"
                  value={formData.Phone}
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
            
            <Typography variant="subtitle1" fontWeight={600} color="#101010" sx={{ pt: 1 }}>
              Bank Details (Optional)
            </Typography>
            
      
            <TextField
              fullWidth
              label="Bank Name"
              name="BankName"
              value={formData.BankName}
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
            
  
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Account Number"
                  name="AccountNo"
                  value={formData.AccountNo}
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
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="IFSC Code"
                  name="IFSC"
                  value={formData.IFSC}
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
          </Stack>
        );
      
      default:
        return null;
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
          minHeight: '520px'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #E0E0E0', 
        pb: 2,
        backgroundColor: '#F8FAFC',
        paddingBottom: '16px'
      }}>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#101010',
          paddingTop: '8px'
        }}>
          Edit Company
        </div>
      </DialogTitle>
      

      {error && (
        <Box sx={{ px: 3, py: 2 }}>
          <Alert 
            severity="error"
            sx={{ 
              borderRadius: 1,
              '& .MuiAlert-icon': {
                alignItems: 'center'
              }
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        </Box>
      )}
      
      
      <Box sx={{ 
        px: 3, 
        py: 2,
        borderBottom: '1px solid #F0F0F0'
      }}>
        <Stepper 
          activeStep={activeStep} 
          sx={{
            '& .MuiStepLabel-root': {
              padding: '0 8px'
            }
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      
      <DialogContent sx={{ 
        pt: 3,
        px: 3,
        pb: 3,
      }}>

        <Box sx={{ 
          minHeight: '320px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ mb: 2 }}>
            {renderStepContent(activeStep)}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        pb: 3, 
        pt: 2,
        borderTop: '1px solid #E0E0E0',
        backgroundColor: '#F8FAFC'
      }}>
        <Stack direction="row" spacing={2} width="100%" justifyContent="space-between">
          <Box>
            <Button 
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
              sx={{
                borderRadius: 1,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 500,
                minWidth: '100px'
              }}
            >
              Back
            </Button>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button 
              onClick={onClose} 
              disabled={loading}
              sx={{
                borderRadius: 1,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 500,
                minWidth: '100px'
              }}
            >
              Cancel
            </Button>
            
            {activeStep === steps.length - 1 ? (
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
                  },
                  minWidth: '140px'
                }}
              >
                {loading ? 'Updating...' : 'Update Company'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
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
                  minWidth: '100px'
                }}
              >
                Next
              </Button>
            )}
          </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default EditCompanies;