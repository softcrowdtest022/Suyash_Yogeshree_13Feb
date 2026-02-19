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
  Switch,
  MenuItem
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const EditHoliday = ({ open, onClose, holiday, onUpdate }) => {
  const [formData, setFormData] = useState({
    Name: '',
    Date: '',
    Type: '',
    Description: '',
    Year: new Date().getFullYear(),
    IsRecurring: false,
    IsActive: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Populate form when holiday changes
  useEffect(() => {
    if (holiday) {
      setFormData({
        Name: holiday.Name || '',
        Date: holiday.Date ? holiday.Date.split('T')[0] : '',
        Type: holiday.Type || '',
        Description: holiday.Description || '',
        Year: holiday.Year || new Date().getFullYear(),
        IsRecurring: holiday.IsRecurring ?? false,
        IsActive: holiday.IsActive ?? true
      });
    }
  }, [holiday]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.Name.trim()) {
      setError('Holiday name is required');
      return;
    }

    if (!formData.Date) {
      setError('Holiday date is required');
      return;
    }

    if (!formData.Type) {
      setError('Holiday type is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      const response = await axios.put(
        `${BASE_URL}/api/holidays/${holiday._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
        setError(response.data.message || 'Failed to update holiday');
      }
    } catch (err) {
      console.error('Error updating holiday:', err);
      
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

  const handleClose = () => {
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
      <DialogTitle
        sx={{
          borderBottom: '1px solid #E0E0E0',
          backgroundColor: '#F8FAFC',
          fontSize: '20px',
          fontWeight: 600,
          pb: 2
        }}
      >
        Edit Holiday
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Holiday Name"
            name="Name"
            value={formData.Name}
            onChange={handleChange}
            required
            disabled={loading}
            error={!!error && error.includes('Holiday name')}
            helperText={error && error.includes('Holiday name') ? error : ''}
          />

          <TextField
            fullWidth
            label="Date"
            name="Date"
            type="date"
            value={formData.Date}
            onChange={handleChange}
            required
            InputLabelProps={{ shrink: true }}
            disabled={loading}
            error={!!error && error.includes('date')}
            helperText={error && error.includes('date') ? error : ''}
          />

          <TextField
            select
            fullWidth
            label="Type"
            name="Type"
            value={formData.Type}
            onChange={handleChange}
            required
            disabled={loading}
            error={!!error && error.includes('type')}
            helperText={error && error.includes('type') ? error : ''}
          >
            <MenuItem value="National">National</MenuItem>
            <MenuItem value="Festival">Festival</MenuItem>
            <MenuItem value="Company">Company</MenuItem>
            <MenuItem value="Optional">Optional</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Year"
            name="Year"
            type="number"
            value={formData.Year}
            onChange={handleChange}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Description"
            name="Description"
            value={formData.Description}
            onChange={handleChange}
            multiline
            rows={3}
            disabled={loading}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.IsRecurring}
                onChange={handleChange}
                name="IsRecurring"
                disabled={loading}
              />
            }
            label="Recurring Every Year"
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.IsActive}
                onChange={handleChange}
                name="IsActive"
                disabled={loading}
              />
            }
            label="Active"
          />

          {error && !error.includes('Holiday name') && !error.includes('date') && !error.includes('type') && (
            <Alert severity="error">{error}</Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          borderTop: '1px solid #E0E0E0',
          pt: 2,
          backgroundColor: '#F8FAFC'
        }}
      >
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
          {loading ? 'Updating...' : 'Update Holiday'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditHoliday;