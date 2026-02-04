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
  MenuItem
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const EditDimensions = ({ open, onClose, dimension, onUpdate }) => {
  const [formData, setFormData] = useState({
    PartNo: '',
    Thickness: '',
    Width: '',
    Length: '',
    Density: ''
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
    if (dimension) {
      setFormData({
        PartNo: dimension.PartNo || '',
        Thickness: dimension.Thickness || '',
        Width: dimension.Width || '',
        Length: dimension.Length || '',
        Density: dimension.Density || ''
      });
    }
  }, [dimension]);

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
    
    // If an item is selected, auto-fill density from the item's material
    const selectedItem = items.find(item => item.PartNo === value);
    if (selectedItem && selectedItem.MaterialID && !formData.Density) {
      setFormData(prev => ({
        ...prev,
        Density: selectedItem.MaterialID.Density || ''
      }));
    }
  };

  const calculateWeight = () => {
    const { Thickness, Width, Length, Density } = formData;
    if (Thickness && Width && Length && Density) {
      const thicknessMm = parseFloat(Thickness) / 1000;
      const widthMm = parseFloat(Width) / 1000;
      const lengthMm = parseFloat(Length) / 1000;
      const density = parseFloat(Density);
      
      const volume = thicknessMm * widthMm * lengthMm;
      const weight = volume * density * 1000;
      return weight.toFixed(6);
    }
    return 0;
  };

  const handleSubmit = async () => {
    if (!formData.PartNo.trim()) {
      setError('Part No is required');
      return;
    }
    if (!formData.Thickness || formData.Thickness <= 0) {
      setError('Thickness must be greater than 0');
      return;
    }
    if (!formData.Width || formData.Width <= 0) {
      setError('Width must be greater than 0');
      return;
    }
    if (!formData.Length || formData.Length <= 0) {
      setError('Length must be greater than 0');
      return;
    }
    if (!formData.Density || formData.Density <= 0) {
      setError('Density must be greater than 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${BASE_URL}/api/dimension-weights/${dimension._id}`, {
        ...formData,
        Thickness: parseFloat(formData.Thickness),
        Width: parseFloat(formData.Width),
        Length: parseFloat(formData.Length),
        Density: parseFloat(formData.Density)
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
        setError(response.data.message || 'Failed to update dimension');
      }
    } catch (err) {
      console.error('Error updating dimension:', err);
      setError(err.response?.data?.message || 'Failed to update dimension. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const weight = calculateWeight();

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
          Edit Dimension Weight
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

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Thickness (mm) *"
                  name="Thickness"
                  type="number"
                  value={formData.Thickness}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  size="medium"
                  variant="outlined"
                  InputProps={{
                    endAdornment: <Typography>mm</Typography>,
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
                  label="Width (mm) *"
                  name="Width"
                  type="number"
                  value={formData.Width}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  size="medium"
                  variant="outlined"
                  InputProps={{
                    endAdornment: <Typography>mm</Typography>,
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
                  label="Length (mm) *"
                  name="Length"
                  type="number"
                  value={formData.Length}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  size="medium"
                  variant="outlined"
                  InputProps={{
                    endAdornment: <Typography>mm</Typography>,
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
                  label="Density (g/cm³) *"
                  name="Density"
                  type="number"
                  value={formData.Density}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  size="medium"
                  variant="outlined"
                  InputProps={{
                    endAdornment: <Typography>g/cm³</Typography>,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    }
                  }}
                />
              </Grid>
            </Grid>

            {weight > 0 && (
              <Box sx={{ 
                p: 3, 
                bgcolor: '#E8F5E9', 
                borderRadius: 1,
                border: '1px solid #C8E6C9'
              }}>
                <Typography variant="subtitle2" fontWeight={600} color="#2E7D32" gutterBottom>
                  Weight Calculation Preview
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Current Weight:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight={500} align="right">
                      {dimension?.WeightInKG || 0} kg
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">New Calculated Weight:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" fontWeight={700} color="success.main" align="right">
                      {weight} kg
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
          {loading ? 'Updating...' : 'Update Dimension'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDimensions;