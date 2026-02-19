import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Chip,
  Divider,
  Grid,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Favorite as HeartIcon,
  MedicalServices as MedicalIcon,
  Edit as EditIcon
} from '@mui/icons-material';

const ViewMedicalRecord = ({ open, onClose, record, onEdit }) => {
  const [activeStep, setActiveStep] = useState(0);

  if (!record) return null;

  const steps = [
    'Employee & Checkup Info',
    'Health Metrics & Restrictions',
    'Recommendations & System Info'
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const getFitnessColor = (status) => {
    const colors = {
      'Fit': { bg: '#D1FAE5', text: '#065F46' },
      'Fit with Restrictions': { bg: '#FEF3C7', text: '#92400E' },
      'Unfit': { bg: '#FEE2E2', text: '#991B1B' },
      'Temporarily Unfit': { bg: '#FEF3C7', text: '#92400E' }
    };
    return colors[status] || { bg: '#E5E7EB', text: '#374151' };
  };

  const fitnessColors = getFitnessColor(record.fitnessStatus);

  // Helper function to get employee name
  const getEmployeeName = (employee) => {
    if (!employee) return 'N/A';
    
    if (typeof employee === 'object') {
      // Try different possible field names
      const firstName = employee.FirstName || employee.firstName || '';
      const lastName = employee.LastName || employee.lastName || '';
      
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
      
      // If no name fields, try to use EmployeeID
      if (employee.EmployeeID || employee.employeeId) {
        return `Employee ${employee.EmployeeID || employee.employeeId}`;
      }
    }
    
    return 'N/A';
  };

  // Helper function to get employee ID
  const getEmployeeId = (employee) => {
    if (!employee) return 'N/A';
    
    if (typeof employee === 'object') {
      return employee.EmployeeID || employee.employeeId || employee._id || 'N/A';
    }
    
    return 'N/A';
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleClose = () => {
    setActiveStep(0);
    onClose();
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            {/* Employee Info */}
            <Paper sx={{ p: 3, bgcolor: '#F8FAFC' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <PersonIcon color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Employee
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {getEmployeeName(record.employee)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {getEmployeeId(record.employee)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Checkup Info */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Checkup Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Checkup Date</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatDate(record.checkupDate)}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Checkup Type</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {record.checkupType || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Doctor Name</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {record.doctorName || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Clinic Name</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {record.clinicName || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Fitness Status */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Fitness Status
              </Typography>
              <Chip
                label={record.fitnessStatus || 'N/A'}
                sx={{
                  bgcolor: fitnessColors.bg,
                  color: fitnessColors.text,
                  fontWeight: 600
                }}
              />
            </Paper>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            {/* Health Metrics */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Health Metrics
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <HeartIcon color="error" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Blood Pressure</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {record.bloodPressure || 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <MedicalIcon color="primary" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Heart Rate</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {record.heartRate ? `${record.heartRate} bpm` : 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {/* Restrictions */}
            {record.restrictions?.length > 0 ? (
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Restrictions
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                  {record.restrictions.map((item, index) => (
                    <Chip 
                      key={index} 
                      label={item} 
                      size="small"
                      sx={{
                        backgroundColor: '#FEF3C7',
                        color: '#92400E',
                        fontWeight: 500
                      }}
                    />
                  ))}
                </Stack>
              </Paper>
            ) : (
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Restrictions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No restrictions
                </Typography>
              </Paper>
            )}

            {/* Next Checkup */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Next Checkup
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatDate(record.nextCheckupDate)}
              </Typography>
            </Paper>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            {/* Recommendations */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Recommendations
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {record.recommendations || 'No recommendations provided'}
              </Typography>
            </Paper>

            {/* Remarks */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Remarks
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {record.remarks || 'No remarks provided'}
              </Typography>
            </Paper>

            {/* System Info */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                System Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Created At</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatDate(record.CreatedAt)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Updated At</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatDate(record.UpdatedAt)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
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
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #E0E0E0', 
        backgroundColor: '#F8FAFC',
        py: 2
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Medical Record Details
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Record ID: {record._id?.substring(0, 8)}...
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ mt: 2, px: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 1 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 400 }}>
          {getStepContent(activeStep)}
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        borderTop: '1px solid #E0E0E0', 
        backgroundColor: '#F8FAFC', 
        p: 2,
        justifyContent: 'space-between'
      }}>
        <Button onClick={handleClose} sx={{ color: '#666' }}>
          Close
        </Button>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button onClick={handleReset} variant="outlined">
              View from Start
            </Button>
          ) : (
            <Button onClick={handleNext} variant="contained">
              Next
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ViewMedicalRecord;