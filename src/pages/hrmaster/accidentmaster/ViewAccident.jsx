// import React from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Stack,
//   Typography,
//   Chip,
//   Divider,
//   Grid
// } from '@mui/material';
// import { Edit as EditIcon } from '@mui/icons-material';

// const ViewAccident = ({ open, onClose, accident, onEdit }) => {
//   if (!accident) return null;

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getSeverityColor = (severity) => {
//     switch (severity) {
//       case 'Minor': return 'success';
//       case 'Moderate': return 'info';
//       case 'Severe': return 'warning';
//       case 'Fatal': return 'error';
//       default: return 'default';
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'Open': return 'error';
//       case 'In Progress': return 'warning';
//       case 'Closed': return 'success';
//       default: return 'default';
//     }
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       maxWidth="md"
//       fullWidth
//       PaperProps={{ sx: { borderRadius: 2 } }}
//     >
//       <DialogTitle sx={{
//         borderBottom: '1px solid #E0E0E0',
//         backgroundColor: '#F8FAFC'
//       }}>
//         <div style={{
//           fontSize: '20px',
//           fontWeight: 600,
//           paddingTop: '8px'
//         }}>
//           Accident / Incident Details
//         </div>
//       </DialogTitle>

//       <DialogContent sx={{ pt: 3 }}>
//         <Stack spacing={3}>

//           {/* Basic Info */}
//           <div style={{ marginTop: '16px' }}>
//             <Grid container spacing={3}>

//               <Grid item xs={12} md={6}>
//                 <Typography variant="caption" color="textSecondary">
//                   Employee
//                 </Typography>
//                 <Typography fontWeight={500}>
//                   {accident.employee?.FullName || 'N/A'}
//                 </Typography>
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <Typography variant="caption" color="textSecondary">
//                   Date & Time
//                 </Typography>
//                 <Typography>
//                   {formatDate(accident.date)}
//                 </Typography>
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <Typography variant="caption" color="textSecondary">
//                   Location
//                 </Typography>
//                 <Typography>
//                   {accident.location}
//                 </Typography>
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <Typography variant="caption" color="textSecondary">
//                   Department
//                 </Typography>
//                 <Typography>
//                   {accident.department}
//                 </Typography>
//               </Grid>

//             </Grid>
//           </div>

//           <Divider />

//           {/* Machine Info */}
//           <Grid container spacing={3}>
//             <Grid item xs={12} md={6}>
//               <Typography variant="caption" color="textSecondary">
//                 Machine ID
//               </Typography>
//               <Typography>{accident.machineId || 'N/A'}</Typography>
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <Typography variant="caption" color="textSecondary">
//                 Machine Name
//               </Typography>
//               <Typography>{accident.machineName || 'N/A'}</Typography>
//             </Grid>
//           </Grid>

//           <Divider />

//           {/* Injury Info */}
//           <Grid container spacing={3}>

//             <Grid item xs={12} md={6}>
//               <Typography variant="caption" color="textSecondary">
//                 Injury Type
//               </Typography>
//               <Typography>{accident.injuryType}</Typography>
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <Typography variant="caption" color="textSecondary">
//                 Body Part Affected
//               </Typography>
//               <Typography>{accident.bodyPartAffected}</Typography>
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <Typography variant="caption" color="textSecondary">
//                 Severity
//               </Typography>
//               <Chip
//                 label={accident.severity}
//                 color={getSeverityColor(accident.severity)}
//                 size="small"
//                 sx={{ fontWeight: 500 }}
//               />
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <Typography variant="caption" color="textSecondary">
//                 Investigation Status
//               </Typography>
//               <Chip
//                 label={accident.investigationStatus}
//                 color={getStatusColor(accident.investigationStatus)}
//                 size="small"
//                 sx={{ fontWeight: 500 }}
//               />
//             </Grid>

//           </Grid>

//           <Divider />

//           {/* Description */}
//           <Stack spacing={2}>
//             <div>
//               <Typography variant="caption" color="textSecondary">
//                 Description
//               </Typography>
//               <Typography sx={{
//                 backgroundColor: '#F8FAFC',
//                 p: 2,
//                 borderRadius: 1,
//                 mt: 1
//               }}>
//                 {accident.description || 'No description provided'}
//               </Typography>
//             </div>

//             <div>
//               <Typography variant="caption" color="textSecondary">
//                 Immediate Action
//               </Typography>
//               <Typography sx={{
//                 backgroundColor: '#F8FAFC',
//                 p: 2,
//                 borderRadius: 1,
//                 mt: 1
//               }}>
//                 {accident.immediateAction || 'N/A'}
//               </Typography>
//             </div>

//             <div>
//               <Typography variant="caption" color="textSecondary">
//                 Root Cause
//               </Typography>
//               <Typography sx={{
//                 backgroundColor: '#F8FAFC',
//                 p: 2,
//                 borderRadius: 1,
//                 mt: 1
//               }}>
//                 {accident.rootCause || 'N/A'}
//               </Typography>
//             </div>
//           </Stack>

//           <Divider />

//           {/* Additional Info */}
//           <Grid container spacing={3}>

//             <Grid item xs={12} md={6}>
//               <Typography variant="caption" color="textSecondary">
//                 Lost Days
//               </Typography>
//               <Typography>{accident.lostDays}</Typography>
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <Typography variant="caption" color="textSecondary">
//                 Created At
//               </Typography>
//               <Typography>
//                 {formatDate(accident.CreatedAt)}
//               </Typography>
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <Typography variant="caption" color="textSecondary">
//                 Last Updated
//               </Typography>
//               <Typography>
//                 {formatDate(accident.UpdatedAt)}
//               </Typography>
//             </Grid>

//           </Grid>

//         </Stack>
//       </DialogContent>

//       <DialogActions sx={{
//         px: 3,
//         pb: 3,
//         borderTop: '1px solid #E0E0E0',
//         backgroundColor: '#F8FAFC'
//       }}>
//         <Button onClick={onClose}>
//           Close
//         </Button>

//         <Button
//           variant="contained"
//           onClick={() => {
//             onClose();
//             onEdit();
//           }}
//           startIcon={<EditIcon />}
//           sx={{
//             backgroundColor: '#1976D2',
//             '&:hover': { backgroundColor: '#1565C0' }
//           }}
//         >
//           Update Investigation
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default ViewAccident;


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
  Stepper,
  Step,
  StepLabel,
  Box,
  Paper
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';

const ViewAccident = ({ open, onClose, accident, onEdit }) => {
  const [activeStep, setActiveStep] = useState(0);

  if (!accident) return null;

  const steps = [
    'Basic Information',
    'Injury & Investigation',
    'Description & Follow-up'
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Minor': return 'success';
      case 'Moderate': return 'info';
      case 'Severe': return 'warning';
      case 'Fatal': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'error';
      case 'In Progress': return 'warning';
      case 'Closed': return 'success';
      default: return 'default';
    }
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
            {/* Basic Info Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                📋 Basic Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      Employee
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {accident.employee?.FullName || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      Date & Time
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(accident.date)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      Location
                    </Typography>
                    <Typography variant="body1">
                      {accident.location}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      Department
                    </Typography>
                    <Typography variant="body1">
                      {accident.department}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Machine Info Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                ⚙️ Machine Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      Machine ID
                    </Typography>
                    <Typography variant="body1">{accident.machineId || 'N/A'}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      Machine Name
                    </Typography>
                    <Typography variant="body1">{accident.machineName || 'N/A'}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            {/* Injury Info Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                🤕 Injury Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      Injury Type
                    </Typography>
                    <Typography variant="body1">{accident.injuryType}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      Body Part Affected
                    </Typography>
                    <Typography variant="body1">{accident.bodyPartAffected}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      Severity
                    </Typography>
                    <Chip
                      label={accident.severity}
                      color={getSeverityColor(accident.severity)}
                      size="small"
                      sx={{ fontWeight: 500, mt: 0.5 }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      Investigation Status
                    </Typography>
                    <Chip
                      label={accident.investigationStatus}
                      color={getStatusColor(accident.investigationStatus)}
                      size="small"
                      sx={{ fontWeight: 500, mt: 0.5 }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      Lost Days
                    </Typography>
                    <Typography variant="body1">{accident.lostDays}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            {/* Description Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                📝 Description
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Incident Description
                </Typography>
                <Typography sx={{
                  backgroundColor: '#F8FAFC',
                  p: 2,
                  borderRadius: 1,
                  minHeight: '80px'
                }}>
                  {accident.description || 'No description provided'}
                </Typography>
              </Box>
            </Paper>

            {/* Actions Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                ⚡ Actions Taken
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Immediate Action
                </Typography>
                <Typography sx={{
                  backgroundColor: '#F8FAFC',
                  p: 2,
                  borderRadius: 1,
                  minHeight: '60px',
                  mb: 2
                }}>
                  {accident.immediateAction || 'N/A'}
                </Typography>

                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Root Cause
                </Typography>
                <Typography sx={{
                  backgroundColor: '#F8FAFC',
                  p: 2,
                  borderRadius: 1,
                  minHeight: '60px'
                }}>
                  {accident.rootCause || 'N/A'}
                </Typography>
              </Box>
            </Paper>

            {/* System Info Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                🕒 System Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      Created At
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(accident.CreatedAt)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      Last Updated
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(accident.UpdatedAt)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      Reported By
                    </Typography>
                    <Typography variant="body2">
                      {accident.reportedBy || 'N/A'}
                    </Typography>
                  </Box>
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
          Accident / Incident Details
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

        <Box sx={{ minHeight: 450 }}>
          {getStepContent(activeStep)}
        </Box>
      </DialogContent>

      <DialogActions sx={{
        px: 3,
        py: 2,
        borderTop: '1px solid #E0E0E0',
        backgroundColor: '#F8FAFC'
      }}>
        <Button onClick={handleClose}>
          Close
        </Button>

        <Box sx={{ flex: 1 }} />

        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>

        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleReset}
            sx={{ mr: 1 }}
          >
            View from Start
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
          >
            Next
          </Button>
        )}

        {/* <Button
          variant="contained"
          onClick={() => {
            handleClose();
            onEdit();
          }}
          startIcon={<EditIcon />}
          sx={{
            backgroundColor: '#1976D2',
            '&:hover': { backgroundColor: '#1565C0' },
            ml: 2
          }}
        >
          Update Investigation
        </Button> */}
      </DialogActions>
    </Dialog>
  );
};

export default ViewAccident;