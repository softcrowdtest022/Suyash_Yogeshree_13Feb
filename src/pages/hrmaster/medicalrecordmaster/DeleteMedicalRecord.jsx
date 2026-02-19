import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import { Delete as DeleteIcon, Warning as WarningIcon } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const DeleteMedicalRecord = ({ open, onClose, record, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "-";
    }
  };

  const getEmployeeName = (employee) => {
    if (!employee) return "Unknown Employee";
    
    if (typeof employee === 'object') {
      const firstName = employee.FirstName || '';
      const lastName = employee.LastName || '';
      const employeeId = employee.EmployeeID || '';
      
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
      if (employeeId) {
        return `Employee ${employeeId}`;
      }
    }
    
    return "Unknown Employee";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Fit": return "success";
      case "Unfit": return "error";
      case "Temporarily Unfit": return "warning";
      case "Fit with Restrictions": return "info";
      default: return "default";
    }
  };

  const handleDelete = async () => {
    if (!record?._id) {
      setError('Record ID is missing');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${BASE_URL}/api/safety/medical-records/${record._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        onDelete(record._id);
        onClose();
      } else {
        setError(response.data.message || 'Failed to delete medical record');
      }
    } catch (err) {
      console.error('Error deleting medical record:', err);
      setError(err.response?.data?.message || 'Failed to delete medical record. Please try again.');
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
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #E0E0E0', 
        pb: 2,
        backgroundColor: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <WarningIcon color="error" />
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#101010' }}>
          Confirm Delete
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
            Are you sure you want to delete this medical record?
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This action cannot be undone. All data associated with this medical record will be permanently removed.
          </Typography>

          {record && (
            <Box sx={{ 
              bgcolor: '#F5F5F5', 
              p: 2, 
              borderRadius: 2,
              border: '1px solid #E0E0E0'
            }}>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Employee
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {getEmployeeName(record.employee)}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Checkup Date
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(record.checkupDate)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Checkup Type
                  </Typography>
                  <Typography variant="body2">
                    {record.checkupType || '-'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Fitness Status
                  </Typography>
                  <Chip
                    label={record.fitnessStatus || "Unknown"}
                    color={getStatusColor(record.fitnessStatus)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>

                {record.doctorName && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Doctor
                    </Typography>
                    <Typography variant="body2">
                      {record.doctorName}
                    </Typography>
                  </Box>
                )}

                {record.nextCheckupDate && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Next Checkup
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(record.nextCheckupDate)}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          )}
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 3,
                borderRadius: 1
              }}
            >
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        pb: 3, 
        borderTop: '1px solid #E0E0E0', 
        pt: 2,
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
          color="error"
          onClick={handleDelete}
          disabled={loading}
          startIcon={loading ? null : <DeleteIcon />}
          sx={{
            borderRadius: 1,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500,
            backgroundColor: '#D32F2F',
            '&:hover': {
              backgroundColor: '#C62828'
            }
          }}
        >
          {loading ? 'Deleting...' : 'Delete Record'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteMedicalRecord;