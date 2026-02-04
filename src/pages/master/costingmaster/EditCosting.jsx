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
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const EditCosting = ({ open, onClose, costing, onUpdate }) => {
  const [formData, setFormData] = useState({
    PartNo: '',
    RMRate: '',
    ProcessCost: '',
    FinishingCost: '',
    PackingCost: '',
    OverheadPercentage: '',
    MarginPercentage: '',
    IsActive: true
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingItems, setFetchingItems] = useState(false);
  const [error, setError] = useState('');

  // Fetch items for Part No dropdown
  useEffect(() => {
    const fetchItems = async () => {
      if (!open) return;
      
      setFetchingItems(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/api/items`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setItems(response.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching items:', err);
        setError('Failed to load items. Please try again.');
      } finally {
        setFetchingItems(false);
      }
    };

    fetchItems();
  }, [open]);

  useEffect(() => {
    if (costing) {
      setFormData({
        PartNo: costing.PartNo || '',
        RMRate: costing.RMRate || '',
        ProcessCost: costing.ProcessCost || '',
        FinishingCost: costing.FinishingCost || '',
        PackingCost: costing.PackingCost || '',
        OverheadPercentage: costing.OverheadPercentage || '',
        MarginPercentage: costing.MarginPercentage || '',
        IsActive: costing.IsActive !== undefined ? costing.IsActive : true
      });
    }
  }, [costing]);

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

  // Calculate costing based on inputs
  const calculateCosting = () => {
    const {
      RMRate,
      ProcessCost,
      FinishingCost,
      PackingCost,
      OverheadPercentage,
      MarginPercentage
    } = formData;

    const rmRate = parseFloat(RMRate) || 0;
    const processCost = parseFloat(ProcessCost) || 0;
    const finishingCost = parseFloat(FinishingCost) || 0;
    const packingCost = parseFloat(PackingCost) || 0;
    const overheadPercentage = parseFloat(OverheadPercentage) || 0;
    const marginPercentage = parseFloat(MarginPercentage) || 0;

    // Calculate sub cost (sum of all direct costs)
    const subCost = rmRate + processCost + finishingCost + packingCost;
    
    // Calculate overhead cost (percentage of sub cost)
    const overheadCost = (subCost * overheadPercentage) / 100;
    
    // Calculate total cost before margin
    const totalCostBeforeMargin = subCost + overheadCost;
    
    // Calculate margin cost (percentage of total cost before margin)
    const marginCost = (totalCostBeforeMargin * marginPercentage) / 100;
    
    // Calculate final rate
    const finalRate = totalCostBeforeMargin + marginCost;

    return {
      RMCost: rmRate,
      SubCost: subCost,
      OverheadCost: overheadCost,
      MarginCost: marginCost,
      FinalRate: finalRate
    };
  };

  const handleSubmit = async () => {
    if (!formData.PartNo.trim()) {
      setError('Part No is required');
      return;
    }
    if (!formData.RMRate || formData.RMRate < 0) {
      setError('RM Rate must be 0 or greater');
      return;
    }
    if (!formData.ProcessCost || formData.ProcessCost < 0) {
      setError('Process Cost must be 0 or greater');
      return;
    }
    if (!formData.FinishingCost || formData.FinishingCost < 0) {
      setError('Finishing Cost must be 0 or greater');
      return;
    }
    if (!formData.PackingCost || formData.PackingCost < 0) {
      setError('Packing Cost must be 0 or greater');
      return;
    }
    if (!formData.OverheadPercentage || formData.OverheadPercentage < 0) {
      setError('Overhead Percentage must be 0 or greater');
      return;
    }
    if (!formData.MarginPercentage || formData.MarginPercentage < 0) {
      setError('Margin Percentage must be 0 or greater');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${BASE_URL}/api/costings/${costing._id}`, {
        ...formData,
        RMRate: parseFloat(formData.RMRate),
        ProcessCost: parseFloat(formData.ProcessCost),
        FinishingCost: parseFloat(formData.FinishingCost),
        PackingCost: parseFloat(formData.PackingCost),
        OverheadPercentage: parseFloat(formData.OverheadPercentage),
        MarginPercentage: parseFloat(formData.MarginPercentage)
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
        setError(response.data.message || 'Failed to update costing');
      }
    } catch (err) {
      console.error('Error updating costing:', err);
      setError(err.response?.data?.message || 'Failed to update costing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculations = calculateCosting();
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
      onClose={onClose} 
      maxWidth="md" 
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
          Edit Costing
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
            {/* Part No Dropdown */}
            <FormControl fullWidth size="medium" disabled={fetchingItems || loading}>
              <InputLabel id="partno-select-label">Part No *</InputLabel>
              <Select
                labelId="partno-select-label"
                id="partno-select"
                name="PartNo"
                value={formData.PartNo}
                label="Part No *"
                onChange={handleSelectChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  }
                }}
              >
                <MenuItem value="">
                  <em>Select a Part No</em>
                </MenuItem>
                {items.map((item) => (
                  <MenuItem key={item._id} value={item.PartNo}>
                    <Box>
                      <Typography variant="body1">{item.PartNo}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {item.PartName}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Cost Components */}
            <Typography variant="subtitle1" fontWeight={600} color="#101010">
              Cost Components
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="RM Rate *"
                  name="RMRate"
                  type="number"
                  value={formData.RMRate}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  size="medium"
                  variant="outlined"
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                  }}
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
                  label="Process Cost *"
                  name="ProcessCost"
                  type="number"
                  value={formData.ProcessCost}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  size="medium"
                  variant="outlined"
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Finishing Cost *"
                  name="FinishingCost"
                  type="number"
                  value={formData.FinishingCost}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  size="medium"
                  variant="outlined"
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                  }}
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
                  label="Packing Cost *"
                  name="PackingCost"
                  type="number"
                  value={formData.PackingCost}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  size="medium"
                  variant="outlined"
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    }
                  }}
                />
              </Grid>
            </Grid>

            {/* Percentages */}
            <Typography variant="subtitle1" fontWeight={600} color="#101010" sx={{ mt: 2 }}>
              Percentages
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Overhead Percentage *"
                  name="OverheadPercentage"
                  type="number"
                  value={formData.OverheadPercentage}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  size="medium"
                  variant="outlined"
                  InputProps={{
                    endAdornment: <Typography>%</Typography>,
                  }}
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
                  label="Margin Percentage *"
                  name="MarginPercentage"
                  type="number"
                  value={formData.MarginPercentage}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  size="medium"
                  variant="outlined"
                  InputProps={{
                    endAdornment: <Typography>%</Typography>,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    }
                  }}
                />
              </Grid>
            </Grid>

            {/* Status */}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.IsActive}
                  onChange={handleSwitchChange}
                  color="primary"
                />
              }
              label={formData.IsActive ? 'Active Costing' : 'Inactive Costing'}
              sx={{ mt: 1 }}
            />

            {/* Calculation Preview */}
            {(formData.RMRate || formData.ProcessCost || formData.FinishingCost || formData.PackingCost) && (
              <Box sx={{ 
                p: 3, 
                bgcolor: '#E8F5E9', 
                borderRadius: 1,
                border: '1px solid #C8E6C9'
              }}>
                <Typography variant="subtitle2" fontWeight={600} color="#2E7D32" gutterBottom>
                  Cost Calculation Preview
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Current Final Rate:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight={500} align="right">
                      {formatCurrency(costing?.FinalRate || 0)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">New Sub Total:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight={500} align="right">
                      {formatCurrency(calculations.SubCost)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      New Overhead ({formData.OverheadPercentage || 0}%):
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight={500} align="right" color="warning.main">
                      + {formatCurrency(calculations.OverheadCost)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      New Margin ({formData.MarginPercentage || 0}%):
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight={500} align="right" color="warning.main">
                      + {formatCurrency(calculations.MarginCost)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ borderTop: '1px dashed #BDBDBD', pt: 1, mt: 1 }}>
                      <Grid container>
                        <Grid item xs={6}>
                          <Typography variant="body1" fontWeight={600} color="textPrimary">
                            New Final Rate:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" fontWeight={700} color="success.main" align="right">
                            {formatCurrency(calculations.FinalRate)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
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
          disabled={loading || fetchingItems}
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
          {loading ? 'Updating...' : 'Update Costing'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCosting;