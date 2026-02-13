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
        onUpdate(response.data.data);
        onClose();
      } else {
        setError(response.data.message || 'Failed to update holiday');
      }
    } catch (err) {
      console.error('Error updating holiday:', err);
      setError(
        err.response?.data?.message ||
          'Failed to update holiday. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          borderBottom: '1px solid #E0E0E0',
          backgroundColor: '#F8FAFC',
          fontSize: '20px',
          fontWeight: 600
        }}
      >
        Edit Holiday
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3} mt={1}>
          <TextField
            fullWidth
            label="Holiday Name"
            name="Name"
            value={formData.Name}
            onChange={handleChange}
            required
            disabled={loading}
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
          >
            <MenuItem value="National">National</MenuItem>
            <MenuItem value="Optional">Optional</MenuItem>
            <MenuItem value="Company">Company</MenuItem>
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

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          borderTop: '1px solid #E0E0E0',
          backgroundColor: '#F8FAFC'
        }}
      >
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? null : <EditIcon />}
        >
          {loading ? 'Updating...' : 'Update Holiday'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditHoliday;
