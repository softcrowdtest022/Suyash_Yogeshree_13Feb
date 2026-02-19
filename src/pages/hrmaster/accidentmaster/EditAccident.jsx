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
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Box,
  FormControl,
  InputLabel,
  Select,
  Typography
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const EditAccident = ({ open, onClose, accident, onUpdate }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    rootCause: '',
    correctiveAction: '',
    preventiveAction: '',
    investigationStatus: '',
    investigationDate: '',
    investigationBy: '',
    costIncurred: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data fetching states
  const [users, setUsers] = useState([]);
  const [fetchingData, setFetchingData] = useState(false);

  // Enum options - Updated to match schema exactly
  const investigationStatusOptions = ['Open', 'Under Investigation', 'Closed', 'Resolved'];

  const steps = [
    'Root Cause Analysis',
    'Actions & Status',
    'Investigation Details'
  ];

  // Fetch users when dialog opens
  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  // Prefill Data
  useEffect(() => {
    if (accident) {
      setFormData({
        rootCause: accident.rootCause || '',
        correctiveAction: accident.correctiveAction || '',
        preventiveAction: accident.preventiveAction || '',
        investigationStatus: accident.investigationStatus || 'Open',
        investigationDate: accident.investigationDate
          ? new Date(accident.investigationDate).toISOString().substring(0, 10)
          : '',
        investigationBy: accident.investigationBy || '',
        costIncurred:
          accident.costIncurred !== undefined
            ? accident.costIncurred.toString()
            : ''
      });
    }
  }, [accident]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        const usersData = response.data.data.users || [];
        setUsers(usersData);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        if (!formData.rootCause?.trim())
          return 'Root cause is required';
        return null;
      
      case 1:
        if (!formData.investigationStatus?.trim())
          return 'Investigation status is required';
        return null;
      
      case 2:
        if (!formData.investigationDate)
          return 'Investigation date is required';
        if (!formData.investigationBy?.trim())
          return 'Investigation By is required';
        
        const costNum = parseFloat(formData.costIncurred || 0);
        if (isNaN(costNum) || costNum < 0)
          return 'Cost incurred must be 0 or positive number';
        return null;
      
      default:
        return null;
    }
  };

  const handleNext = () => {
    const stepError = validateStep();
    if (stepError) {
      setError(stepError);
      return;
    }
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    const stepError = validateStep();
    if (stepError) {
      setError(stepError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const costNum = parseFloat(formData.costIncurred || 0);

      const payload = {
        rootCause: formData.rootCause,
        correctiveAction: formData.correctiveAction || '',
        preventiveAction: formData.preventiveAction || '',
        investigationStatus: formData.investigationStatus,
        investigationDate: new Date(formData.investigationDate).toISOString(),
        investigationBy: formData.investigationBy,
        costIncurred: costNum
      };

      const response = await axios.put(
        `${BASE_URL}/api/safety/accidents/${accident._id}/investigate`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        onUpdate(response.data.data);
        handleClose();
      } else {
        setError(response.data.message || 'Failed to update investigation');
      }

    } catch (err) {
      console.error('Backend Error:', err.response?.data);
      setError(
        err.response?.data?.message ||
        'Failed to update investigation. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setError('');
    onClose();
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* First Row - Root Cause (full width) */}
            <TextField
              fullWidth
              label="Root Cause *"
              name="rootCause"
              value={formData.rootCause}
              onChange={handleChange}
              required
              multiline
              rows={4}
              disabled={loading}
              placeholder="Describe the root cause of the accident/incident"
            />
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* First Row - Corrective Action (full width) */}
            <TextField
              fullWidth
              label="Corrective Action"
              name="correctiveAction"
              value={formData.correctiveAction}
              onChange={handleChange}
              multiline
              rows={3}
              disabled={loading}
              placeholder="Actions taken to correct the immediate issue"
            />

            {/* Second Row - Preventive Action (full width) */}
            <TextField
              fullWidth
              label="Preventive Action"
              name="preventiveAction"
              value={formData.preventiveAction}
              onChange={handleChange}
              multiline
              rows={3}
              disabled={loading}
              placeholder="Actions to prevent future occurrences"
            />

            {/* Third Row - Investigation Status (full width) - Updated with correct enums */}
            <FormControl fullWidth>
              <InputLabel>Investigation Status *</InputLabel>
              <Select
                name="investigationStatus"
                value={formData.investigationStatus}
                onChange={handleChange}
                label="Investigation Status *"
                required
                disabled={loading}
              >
                {investigationStatusOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* First Row - Investigation Date and Investigation By */}
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Investigation Date *"
                name="investigationDate"
                type="date"
                value={formData.investigationDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                disabled={loading}
              />

              <FormControl fullWidth>
                <InputLabel>Investigation By *</InputLabel>
                <Select
                  name="investigationBy"
                  value={formData.investigationBy}
                  onChange={handleChange}
                  label="Investigation By *"
                  required
                  disabled={loading}
                >
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.Username} {user.EmployeeID ? `- ${user.EmployeeID.FirstName} ${user.EmployeeID.LastName}` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* Second Row - Cost Incurred (full width) */}
            <TextField
              fullWidth
              label="Cost Incurred"
              name="costIncurred"
              type="number"
              inputProps={{ min: 0, step: "0.01" }}
              value={formData.costIncurred}
              onChange={handleChange}
              disabled={loading}
              placeholder="0.00"
              helperText="Enter cost in numeric format"
            />
          </Stack>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{
        borderBottom: '1px solid #E0E0E0',
        backgroundColor: '#F8FAFC'
      }}>
        <div style={{
          fontSize: '20px',
          fontWeight: 600,
          paddingTop: '8px'
        }}>
          Update Investigation Details
        </div>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 1 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
            {error}
          </Alert>
        )}

        <Box>
          {getStepContent(activeStep)}
        </Box>
      </DialogContent>

      <DialogActions sx={{
        px: 3,
        py: 2,
        borderTop: '1px solid #E0E0E0',
        backgroundColor: '#F8FAFC'
      }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>

        <Box sx={{ flex: 1 }} />

        <Button
          disabled={activeStep === 0 || loading}
          onClick={handleBack}
        >
          Back
        </Button>

        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={!loading && <EditIcon />}
            sx={{
              backgroundColor: '#1976D2',
              '&:hover': { backgroundColor: '#1565C0' }
            }}
          >
            {loading ? 'Updating...' : 'Update Investigation'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EditAccident;