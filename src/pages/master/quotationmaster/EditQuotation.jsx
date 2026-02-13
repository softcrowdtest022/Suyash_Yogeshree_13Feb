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
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  Chip,
  Paper
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const EditQuotation = ({ open, onClose, quotation, onUpdate }) => {
  const [formData, setFormData] = useState({
    Status: '',
    ValidTill: '',
    InternalRemarks: '',
    VendorRemarks: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (quotation) {
      // Format the date to YYYY-MM-DD for the date input
      const validTillDate = quotation.ValidTill ? 
        new Date(quotation.ValidTill).toISOString().split('T')[0] : 
        '';
      
      setFormData({
        Status: quotation.Status || 'Draft',
        ValidTill: validTillDate,
        InternalRemarks: quotation.InternalRemarks || '',
        VendorRemarks: quotation.VendorRemarks || ''
      });
    }
  }, [quotation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.ValidTill) {
      setError('Valid Till date is required');
      return;
    }

    if (!formData.Status) {
      setError('Status is required');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      ...formData
      // Date is already in YYYY-MM-DD format from the input
    };

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${BASE_URL}/api/quotations/${quotation._id}`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        onUpdate(response.data.data);
        onClose();
      } else {
        setError(response.data.message || 'Failed to update quotation');
      }
    } catch (err) {
      console.error('Error updating quotation:', err);
      setError(err.response?.data?.message || 'Failed to update quotation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
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
        pt: 3,
        px: 3
      }}>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#101010'
        }}>
          Edit Quotation
        </div>
        <Typography variant="body2" color="textSecondary">
          Quotation No: {quotation?.QuotationNo}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ 
        pt: 4,
        px: 3,
        pb: 2,
        overflow: 'auto'
      }}>
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

        <Stack spacing={4}>
          {/* Quotation Summary */}
          <Paper sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary">
                  Vendor
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {quotation?.VendorName}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {quotation?.VendorGSTIN}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary">
                  Company
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {quotation?.CompanyName}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {quotation?.CompanyGSTIN}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary">
                  Total Amount
                </Typography>
                <Typography variant="body1" fontWeight={600} color="success.main">
                  {formatCurrency(quotation?.GrandTotal || 0)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary">
                  Quotation Date
                </Typography>
                <Typography variant="body1">
                  {formatDate(quotation?.QuotationDate)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">
                  Items Summary
                </Typography>
                <Typography variant="body2">
                  {quotation?.Items?.length || 0} item(s) • Subtotal: {formatCurrency(quotation?.SubTotal || 0)} • 
                  GST ({quotation?.GSTPercentage || 0}%): {formatCurrency(quotation?.GSTAmount || 0)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Edit Form */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Update Quotation Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status *</InputLabel>
                  <Select
                    labelId="status-label"
                    name="Status"
                    value={formData.Status}
                    onChange={handleChange}
                    disabled={loading}
                    label="Status *"
                  >
                    <MenuItem value="Draft">Draft</MenuItem>
                    <MenuItem value="Sent">Sent</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Valid Till *"
                  name="ValidTill"
                  type="date"
                  value={formData.ValidTill}
                  onChange={handleChange}
                  disabled={loading}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: getTodayDate()
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Internal Remarks"
                  name="InternalRemarks"
                  value={formData.InternalRemarks}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Vendor Remarks"
                  name="VendorRemarks"
                  value={formData.VendorRemarks}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  disabled={loading}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Items List (Read Only) */}
          {quotation?.Items && quotation.Items.length > 0 && (
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Items ({quotation.Items.length})
              </Typography>
              <Paper sx={{ maxHeight: 200, overflow: 'auto' }}>
                <Grid container spacing={1} sx={{ p: 2 }}>
                  {quotation.Items.map((item, index) => (
                    <Grid item xs={12} key={index}>
                      <Paper sx={{ p: 1, bgcolor: '#f8fafc' }} variant="outlined">
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {item.PartNo} - {item.PartName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Qty: {item.Quantity} {item.Unit} • Rate: {formatCurrency(item.FinalRate)} • 
                              Amount: {formatCurrency(item.Amount)}
                            </Typography>
                          </Box>
                          <Chip
                            label={item.HSNCode}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Box>
          )}
        </Stack>
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
          {loading ? 'Updating...' : 'Update Quotation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditQuotation;