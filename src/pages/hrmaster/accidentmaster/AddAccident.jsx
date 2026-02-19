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
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const AddAccident = ({ open, onClose, onAdd }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    employee: '',
    date: '',
    location: '',
    department: '',
    machineId: '',
    machineName: '',
    injuryType: 'Cut', // Default first enum
    bodyPartAffected: '',
    severity: 'Minor', // Default first enum
    description: '',
    immediateAction: '',
    rootCause: '',
    reportedBy: '',
    lostDays: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data fetching states
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [fetchingData, setFetchingData] = useState(false);

  // Enum options
  const injuryTypeOptions = [
    'Cut', 'Burn', 'Fracture', 'Sprain', 'Electric Shock', 
    'Eye Injury', 'Hearing Loss', 'Respiratory', 'Chemical Exposure', 'Other'
  ];

  const severityOptions = ['Minor', 'Moderate', 'Major', 'Fatal'];

  const steps = [
    'Basic Information',
    'Incident Details',
    'Actions & Follow-up'
  ];

  // Fetch employees, departments, and users when dialog opens
  useEffect(() => {
    if (open) {
      fetchEmployees();
      fetchDepartments();
      fetchUsers();
    }
  }, [open]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setEmployees(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/departments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setDepartments(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

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

  const handleSubmit = async () => {
    // Validation
    if (!formData.employee) return setError('Employee is required');
    if (!formData.date) return setError('Date is required');
    if (!formData.location.trim()) return setError('Location is required');
    if (!formData.department) return setError('Department is required');
    if (!formData.injuryType) return setError('Injury type is required');
    if (!formData.severity) return setError('Severity is required');

    const lostDaysNum = parseInt(formData.lostDays || 0, 10);
    if (isNaN(lostDaysNum) || lostDaysNum < 0) {
      return setError('Lost days must be 0 or positive number');
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const lostDaysNum = parseInt(formData.lostDays || 0, 10);

      const response = await axios.post(
        `${BASE_URL}/api/safety/accidents`,
        {
          ...formData,
          lostDays: lostDaysNum
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        onAdd(response.data.data);
        resetForm();
        onClose();
      } else {
        setError(response.data.message || 'Failed to add accident');
      }
    } catch (err) {
      console.error('Error adding accident:', err);
      setError(
        err.response?.data?.message ||
        'Failed to add accident. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employee: '',
      date: '',
      location: '',
      department: '',
      machineId: '',
      machineName: '',
      injuryType: 'Cut',
      bodyPartAffected: '',
      severity: 'Minor',
      description: '',
      immediateAction: '',
      rootCause: '',
      reportedBy: '',
      lostDays: ''
    });
    setError('');
    setActiveStep(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNext = () => {
    // Basic validation for step 1
    if (activeStep === 0) {
      if (!formData.employee) return setError('Employee is required');
      if (!formData.date) return setError('Date is required');
      if (!formData.location.trim()) return setError('Location is required');
      if (!formData.department) return setError('Department is required');
    }
    
    // Validation for step 2
    if (activeStep === 1) {
      if (!formData.injuryType) return setError('Injury type is required');
      if (!formData.severity) return setError('Severity is required');
      
      const lostDaysNum = parseInt(formData.lostDays || 0, 10);
      if (isNaN(lostDaysNum) || lostDaysNum < 0) {
        return setError('Lost days must be 0 or positive number');
      }
    }

    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prev) => prev - 1);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* First Row - Employee and Date/Time */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Employee *</InputLabel>
                <Select
                  name="employee"
                  value={formData.employee}
                  onChange={handleChange}
                  label="Employee *"
                  required
                  disabled={loading}
                >
                  {employees.map((emp) => (
                    <MenuItem key={emp._id} value={emp._id}>
                      {emp.FirstName} {emp.LastName} ({emp.EmployeeID})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Date & Time *"
                name="date"
                type="datetime-local"
                value={formData.date}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                disabled={loading}
              />
            </Stack>

            {/* Second Row - Location and Department */}
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Location *"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                disabled={loading}
              />

              <FormControl fullWidth>
                <InputLabel>Department *</InputLabel>
                <Select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  label="Department *"
                  required
                  disabled={loading}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept._id} value={dept._id}>
                      {dept.DepartmentName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* First Row - Machine ID and Machine Name */}
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Machine ID"
                name="machineId"
                value={formData.machineId}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Machine Name"
                name="machineName"
                value={formData.machineName}
                onChange={handleChange}
                disabled={loading}
              />
            </Stack>

            {/* Second Row - Injury Type and Severity */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Injury Type *</InputLabel>
                <Select
                  name="injuryType"
                  value={formData.injuryType}
                  onChange={handleChange}
                  label="Injury Type *"
                  required
                  disabled={loading}
                >
                  {injuryTypeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Severity *</InputLabel>
                <Select
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  label="Severity *"
                  required
                  disabled={loading}
                >
                  {severityOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* Third Row - Description (full width) */}
            <TextField
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />

            {/* Fourth Row - Body Part Affected and Lost Days */}
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Body Part Affected"
                name="bodyPartAffected"
                value={formData.bodyPartAffected}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Lost Days"
                name="lostDays"
                type="number"
                inputProps={{ min: 0 }}
                value={formData.lostDays}
                onChange={handleChange}
                disabled={loading}
              />
            </Stack>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* First Row - Immediate Action (full width) */}
            <TextField
              fullWidth
              label="Immediate Action Taken"
              name="immediateAction"
              multiline
              rows={3}
              value={formData.immediateAction}
              onChange={handleChange}
              disabled={loading}
            />

            {/* Second Row - Root Cause (full width) */}
            <TextField
              fullWidth
              label="Root Cause"
              name="rootCause"
              multiline
              rows={3}
              value={formData.rootCause}
              onChange={handleChange}
              disabled={loading}
            />

            {/* Third Row - Reported By (full width) */}
            <FormControl fullWidth>
              <InputLabel>Reported By (User)</InputLabel>
              <Select
                name="reportedBy"
                value={formData.reportedBy}
                onChange={handleChange}
                label="Reported By (User)"
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
          Report New Accident / Incident
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
            startIcon={!loading && <AddIcon />}
            sx={{
              backgroundColor: '#1976D2',
              '&:hover': { backgroundColor: '#1565C0' }
            }}
          >
            {loading ? 'Submitting...' : 'Report Accident'}
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

export default AddAccident;