import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  MenuItem,
  Grid,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  SupervisorAccount as SupervisorIcon,
  Event as EventIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../../config/Config';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Color constants
const PRIMARY_BLUE = '#00B4D8';
const SUCCESS_COLOR = '#2E7D32';

const CreateOnboarding = ({ open, onClose, onSubmit, candidateData }) => {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  
  // Data states
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [fetchingEmployees, setFetchingEmployees] = useState(false);
  const [fetchingDepartments, setFetchingDepartments] = useState(false);
  
  // Form state
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [joiningDate, setJoiningDate] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [reportingManager, setReportingManager] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [createdOnboarding, setCreatedOnboarding] = useState(null);
  
  // Error/Success state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const steps = ['Select Employee', 'Onboarding Details', 'Confirm & Create'];

  // Work location options
  const workLocations = [
    'Plant 1 - Mumbai',
    'Plant 2 - Pune',
    'Plant 3 - Nashik',
    'Corporate Office - Mumbai',
    'Regional Office - Bangalore',
    'Regional Office - Delhi',
    'Remote - Work from Home'
  ];

  // Fetch data on open
  useEffect(() => {
    if (open) {
      fetchEmployees();
      fetchDepartments();
    }
  }, [open]);

  // Set candidate data if provided
  useEffect(() => {
    if (candidateData) {
      // Pre-fill form with candidate data if needed
      console.log('Candidate data:', candidateData);
    }
  }, [candidateData]);

  // Fetch employees
  const fetchEmployees = async () => {
    setFetchingEmployees(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setEmployees(response.data.data || []);
      } else {
        setError('Failed to fetch employees');
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err.response?.data?.message || 'Failed to fetch employees');
    } finally {
      setFetchingEmployees(false);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    setFetchingDepartments(true);
    
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
      // Don't show error for departments, just set empty array
      setDepartments([]);
    } finally {
      setFetchingDepartments(false);
    }
  };

  // Handle next step
  const handleNext = () => {
    if (step === 0 && !selectedEmployee) {
      setError('Please select an employee');
      return;
    }
    if (step === 1) {
      if (!joiningDate) {
        setError('Please select a joining date');
        return;
      }
      if (!selectedDepartment) {
        setError('Please select a department');
        return;
      }
      if (!reportingManager) {
        setError('Please select a reporting manager');
        return;
      }
      if (!workLocation) {
        setError('Please select a work location');
        return;
      }
    }
    setError('');
    setStep(prev => prev + 1);
  };

  // Handle back step
  const handleBack = () => {
    setStep(prev => prev - 1);
    setError('');
  };

  // Handle reset
  const handleReset = () => {
    setStep(0);
    setSelectedEmployee('');
    setJoiningDate(null);
    setSelectedDepartment('');
    setReportingManager('');
    setWorkLocation('');
    setCreatedOnboarding(null);
    setError('');
    setSuccess('');
  };

  // Handle close
  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Handle create onboarding
  const handleCreateOnboarding = async () => {
    setSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Format joining date as YYYY-MM-DD
      const formattedDate = joiningDate.toISOString().split('T')[0];
      
      const response = await axios.post(
        `${BASE_URL}/api/onboarding/create`,
        {
          employeeId: selectedEmployee,
          joiningDate: formattedDate,
          department: selectedDepartment,
          reportingManager: reportingManager,
          workLocation: workLocation
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setCreatedOnboarding(response.data.data);
        setSuccess(response.data.message || 'Onboarding created successfully!');
        
        if (onSubmit) {
          onSubmit(response.data.data);
        }
        
        // Move to confirmation step
        setStep(2);
      }
    } catch (err) {
      console.error('Error creating onboarding:', err);
      setError(err.response?.data?.message || 'Failed to create onboarding');
    } finally {
      setSubmitting(false);
    }
  };

  // Get employee details
  const getEmployeeDetails = () => {
    return employees.find(emp => emp._id === selectedEmployee);
  };

  // Get department details
  const getDepartmentDetails = () => {
    return departments.find(dept => dept._id === selectedDepartment);
  };

  // Get manager details
  const getManagerDetails = () => {
    return employees.find(emp => emp._id === reportingManager);
  };

  const employeeDetails = getEmployeeDetails();
  const departmentDetails = getDepartmentDetails();
  const managerDetails = getManagerDetails();

  // Filter out the selected employee from reporting managers list
  const availableManagers = employees.filter(emp => emp._id !== selectedEmployee);

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2">
                Select Employee
              </Typography>
              
              {fetchingEmployees ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <FormControl fullWidth size="small">
                  <InputLabel>Select Employee</InputLabel>
                  <Select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    label="Select Employee"
                  >
                    <MenuItem value="">Choose an employee</MenuItem>
                    {employees.map((emp) => (
                      <MenuItem key={emp._id} value={emp._id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: PRIMARY_BLUE, fontSize: '0.75rem' }}>
                            {emp.FirstName?.[0]}{emp.LastName?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">
                              {emp.FirstName} {emp.LastName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {emp.EmployeeID} - {emp.Email}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {employeeDetails && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Employee Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Full Name</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {employeeDetails.FirstName} {employeeDetails.LastName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Employee ID</Typography>
                      <Typography variant="body2">{employeeDetails.EmployeeID}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Email</Typography>
                      <Typography variant="body2">{employeeDetails.Email}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Phone</Typography>
                      <Typography variant="body2">{employeeDetails.Phone}</Typography>
                    </Grid>
                    {employeeDetails.DepartmentID && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">Current Department</Typography>
                        <Typography variant="body2">
                          {typeof employeeDetails.DepartmentID === 'object' 
                            ? employeeDetails.DepartmentID.DepartmentName 
                            : 'N/A'}
                        </Typography>
                      </Grid>
                    )}
                    {employeeDetails.DesignationID && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">Designation</Typography>
                        <Typography variant="body2">
                          {typeof employeeDetails.DesignationID === 'object' 
                            ? employeeDetails.DesignationID.DesignationName 
                            : 'N/A'}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </Paper>

            <Alert severity="info" icon={<InfoIcon />} sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                Select an employee to create an onboarding record. This will initiate the onboarding process.
              </Typography>
            </Alert>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2">
                Onboarding Details
              </Typography>

              {!selectedEmployee ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Please select an employee first
                </Alert>
              ) : (
                <>
                  {/* Joining Date */}
                  <Box sx={{ mb: 3 }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="Joining Date"
                        value={joiningDate ? joiningDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => setJoiningDate(new Date(e.target.value))}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ 
                          min: new Date().toISOString().split('T')[0] // Can't select past dates
                        }}
                      />
                    </LocalizationProvider>
                  </Box>

                  {/* Department Selection */}
                  <Box sx={{ mb: 3 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Department</InputLabel>
                      <Select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        label="Department"
                        disabled={fetchingDepartments}
                      >
                        <MenuItem value="">Select department</MenuItem>
                        {departments.map((dept) => (
                          <MenuItem key={dept._id} value={dept._id}>
                            {dept.DepartmentName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Reporting Manager Selection */}
                  <Box sx={{ mb: 3 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Reporting Manager</InputLabel>
                      <Select
                        value={reportingManager}
                        onChange={(e) => setReportingManager(e.target.value)}
                        label="Reporting Manager"
                      >
                        <MenuItem value="">Select reporting manager</MenuItem>
                        {availableManagers.map((emp) => (
                          <MenuItem key={emp._id} value={emp._id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 20, height: 20, bgcolor: PRIMARY_BLUE, fontSize: '0.6rem' }}>
                                {emp.FirstName?.[0]}{emp.LastName?.[0]}
                              </Avatar>
                              <Box>
                                <Typography variant="body2">
                                  {emp.FirstName} {emp.LastName}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {emp.EmployeeID} - {emp.DesignationID?.DesignationName || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Work Location Selection */}
                  <Box sx={{ mb: 3 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Work Location</InputLabel>
                      <Select
                        value={workLocation}
                        onChange={(e) => setWorkLocation(e.target.value)}
                        label="Work Location"
                      >
                        <MenuItem value="">Select work location</MenuItem>
                        {workLocations.map((location) => (
                          <MenuItem key={location} value={location}>
                            {location}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </>
              )}

              {departmentDetails && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Department Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Department Name</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {departmentDetails.DepartmentName}
                      </Typography>
                    </Grid>
                    {departmentDetails.Description && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">Description</Typography>
                        <Typography variant="body2">{departmentDetails.Description}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              {managerDetails && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Manager Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Name</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {managerDetails.FirstName} {managerDetails.LastName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Employee ID</Typography>
                      <Typography variant="body2">{managerDetails.EmployeeID}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Email</Typography>
                      <Typography variant="body2">{managerDetails.Email}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Designation</Typography>
                      <Typography variant="body2">
                        {managerDetails.DesignationID?.DesignationName || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>

            <Alert severity="info" icon={<InfoIcon />} sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                Provide the onboarding details including joining date, department, reporting manager, and work location.
              </Typography>
            </Alert>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2">
                Confirm Onboarding
              </Typography>

              {/* Summary Card */}
              <Paper sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Onboarding Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Employee</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {employeeDetails?.FirstName} {employeeDetails?.LastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">Employee ID</Typography>
                    <Typography variant="body2">{employeeDetails?.EmployeeID}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">Joining Date</Typography>
                    <Typography variant="body2">
                      {joiningDate ? joiningDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">Department</Typography>
                    <Typography variant="body2">{departmentDetails?.DepartmentName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">Reporting Manager</Typography>
                    <Typography variant="body2">
                      {managerDetails?.FirstName} {managerDetails?.LastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Work Location</Typography>
                    <Typography variant="body2">{workLocation}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Created Onboarding Card */}
              {createdOnboarding ? (
                <Card sx={{ mb: 3, border: '1px solid', borderColor: 'success.main' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: SUCCESS_COLOR }}>
                        <CheckCircleIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" color="success.main">
                          Onboarding Created Successfully!
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          The onboarding process has been initiated
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="textSecondary">Employee</Typography>
                        <Typography variant="body2">
                          {createdOnboarding[0]?.FirstName} {createdOnboarding[0]?.LastName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">Employee ID</Typography>
                        <Typography variant="body2">{createdOnboarding[0]?.EmployeeID}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">Joining Date</Typography>
                        <Typography variant="body2">
                          {new Date(createdOnboarding[0]?.DateOfJoining).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="textSecondary">Status</Typography>
                        <Chip
                          label={createdOnboarding[0]?.EmploymentStatus || 'active'}
                          size="small"
                          color="success"
                          sx={{ height: 20, fontSize: '11px' }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ) : (
                <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3, borderRadius: 2 }}>
                  <Typography variant="body2">
                    Click the button below to create the onboarding record. This will initiate the onboarding process for the selected employee.
                  </Typography>
                </Alert>
              )}

              {/* Warning Alert */}
              {!createdOnboarding && (
                <Alert severity="warning" icon={<WarningIcon />} sx={{ borderRadius: 2 }}>
                  <Typography variant="body2">
                    Please review all details carefully before creating the onboarding record.
                  </Typography>
                </Alert>
              )}
            </Paper>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: 1, 
        borderColor: '#E0E0E0', 
        bgcolor: '#F8FAFC',
        px: 3,
        py: 2,
        position: 'sticky',
        top: 0,
        zIndex: 2
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Create Onboarding
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Initiate onboarding process for employee
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, px: 3, overflowY: 'auto' }}>
        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {success && !createdOnboarding && (
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 3, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        {/* Stepper */}
        <Stepper activeStep={step} sx={{ mb: 4, mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ minHeight: 400 }}>
          {renderStepContent()}
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        px: 3, 
        py: 2, 
        borderTop: 1, 
        borderColor: '#E0E0E0', 
        bgcolor: '#F8FAFC',
        justifyContent: 'space-between',
        position: 'sticky',
        bottom: 0,
        zIndex: 2
      }}>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Box>
          <Button
            disabled={step === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          {step === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleCreateOnboarding}
              disabled={submitting || createdOnboarding}
              startIcon={submitting ? <CircularProgress size={20} /> : <AssignmentIcon />}
              sx={{
                background: 'linear-gradient(135deg, #164e63, #00B4D8)',
                minWidth: 200,
                '&:hover': {
                  background: 'linear-gradient(135deg, #0e3b4a, #0096b4)'
                }
              }}
            >
              {submitting ? 'Creating...' : 'Create Onboarding'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={step === 0 && !selectedEmployee}
              sx={{
                background: 'linear-gradient(135deg, #164e63, #00B4D8)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0e3b4a, #0096b4)'
                }
              }}
            >
              Next
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default CreateOnboarding;