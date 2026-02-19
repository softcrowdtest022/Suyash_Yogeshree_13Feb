// import React, { useState } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Stack,
//   Typography,
//   Divider,
//   Grid,
//   Chip,
//   Stepper,
//   Step,
//   StepLabel,
//   Box,
//   Paper
// } from '@mui/material';
// import { Edit as EditIcon } from '@mui/icons-material';

// const steps = [
//   'Employee & Payroll',
//   'Earnings',
//   'Deductions & Summary'
// ];

// const ViewSalary = ({ open, onClose, salary, onEdit }) => {
//   const [activeStep, setActiveStep] = useState(0);

//   if (!salary) return null;

//   const formatDate = (dateString) => {
//     if (!dateString) return '-';
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const formatCurrency = (amount) =>
//     `₹ ${Number(amount || 0).toLocaleString('en-IN')}`;

//   const nextStep = () => setActiveStep((prev) => prev + 1);
//   const backStep = () => setActiveStep((prev) => prev - 1);

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       maxWidth="lg"
//       fullWidth
//       PaperProps={{ sx: { borderRadius: 3 } }}
//     >
//       {/* HEADER */}
//       <DialogTitle
//         sx={{
//           background: 'linear-gradient(135deg,#164e63,#0ea5e9)',
//           color: '#fff',
//           fontSize: 20,
//           fontWeight: 600,
//           py: 2
//         }}
//       >
//         Salary Details – {salary.periodDisplay}
//       </DialogTitle>

//       {/* STEPPER */}
//       <Box sx={{ px: 4, pt: 3 }}>
//         <Stepper activeStep={activeStep} alternativeLabel>
//           {steps.map((label) => (
//             <Step key={label}>
//               <StepLabel>{label}</StepLabel>
//             </Step>
//           ))}
//         </Stepper>
//       </Box>

//       <DialogContent sx={{ px: 5, py: 4 }}>

//         {/* STEP 1 */}
//         {activeStep === 0 && (
//           <Paper sx={{ p: 4, borderRadius: 3, bgcolor: '#f8fafc' }}>
//             <Grid container spacing={4}>
//               <Grid item xs={6}>
//                 <Typography variant="subtitle2" color="text.secondary">
//                   Employee Name
//                 </Typography>
//                 <Typography fontWeight={600}>
//                   {salary.employee?.FullName}
//                 </Typography>
//               </Grid>

//               <Grid item xs={6}>
//                 <Typography variant="subtitle2" color="text.secondary">
//                   Employee ID
//                 </Typography>
//                 <Typography fontWeight={600}>
//                   {salary.employee?.EmployeeID}
//                 </Typography>
//               </Grid>

//               <Grid item xs={6}>
//                 <Typography variant="subtitle2" color="text.secondary">
//                   Department
//                 </Typography>
//                 <Typography>
//                   {salary.employee?.DepartmentID?.DepartmentName}
//                 </Typography>
//               </Grid>

//               <Grid item xs={6}>
//                 <Typography variant="subtitle2" color="text.secondary">
//                   Email
//                 </Typography>
//                 <Typography>
//                   {salary.employee?.Email}
//                 </Typography>
//               </Grid>

//               <Grid item xs={4}>
//                 <Typography variant="subtitle2" color="text.secondary">
//                   Month
//                 </Typography>
//                 <Typography>{salary.monthName}</Typography>
//               </Grid>

//               <Grid item xs={4}>
//                 <Typography variant="subtitle2" color="text.secondary">
//                   Year
//                 </Typography>
//                 <Typography>{salary.payrollPeriod?.year}</Typography>
//               </Grid>

//               <Grid item xs={4}>
//                 <Typography variant="subtitle2" color="text.secondary">
//                   Employment Type
//                 </Typography>
//                 <Typography>{salary.employmentType}</Typography>
//               </Grid>

//               <Grid item xs={6}>
//                 <Typography variant="subtitle2" color="text.secondary">
//                   Payment Mode
//                 </Typography>
//                 <Typography>{salary.paymentMode}</Typography>
//               </Grid>

//               <Grid item xs={6}>
//                 <Typography variant="subtitle2" color="text.secondary">
//                   Status
//                 </Typography>
//                 <Chip
//                   label={salary.paymentStatus}
//                   color={
//                     salary.paymentStatus === 'PROCESSED'
//                       ? 'success'
//                       : 'warning'
//                   }
//                   size="small"
//                 />
//               </Grid>
//             </Grid>
//           </Paper>
//         )}

//         {/* STEP 2 */}
//         {activeStep === 1 && (
//           <Paper sx={{ p: 4, borderRadius: 3, bgcolor: '#f8fafc' }}>
//             <Grid container spacing={3}>
//               {Object.entries(salary.earnings || {}).map(([key, value]) => (
//                 <Grid item xs={4} key={key}>
//                   <Typography
//                     variant="subtitle2"
//                     color="text.secondary"
//                     sx={{ textTransform: 'capitalize' }}
//                   >
//                     {key}
//                   </Typography>
//                   <Typography fontWeight={600}>
//                     {formatCurrency(value)}
//                   </Typography>
//                 </Grid>
//               ))}
//             </Grid>
//           </Paper>
//         )}

//         {/* STEP 3 */}
//         {activeStep === 2 && (
//           <Paper sx={{ p: 4, borderRadius: 3, bgcolor: '#f8fafc' }}>
//             <Typography variant="h6" gutterBottom>
//               Deductions
//             </Typography>

//             <Grid container spacing={3} sx={{ mb: 4 }}>
//               {Object.entries(salary.deductions || {}).map(([key, value]) => (
//                 <Grid item xs={4} key={key}>
//                   <Typography
//                     variant="subtitle2"
//                     color="text.secondary"
//                     sx={{ textTransform: 'capitalize' }}
//                   >
//                     {key}
//                   </Typography>
//                   <Typography fontWeight={600}>
//                     {formatCurrency(value)}
//                   </Typography>
//                 </Grid>
//               ))}
//             </Grid>

//             <Divider sx={{ my: 3 }} />

//             <Grid container spacing={3}>
//               <Grid item xs={4}>
//                 <Typography variant="subtitle2" color="text.secondary">
//                   Gross Salary
//                 </Typography>
//                 <Typography fontWeight={600}>
//                   {formatCurrency(salary.grossSalary)}
//                 </Typography>
//               </Grid>

//               <Grid item xs={4}>
//                 <Typography variant="subtitle2" color="text.secondary">
//                   Total Deductions
//                 </Typography>
//                 <Typography fontWeight={600}>
//                   {formatCurrency(salary.totalDeductions)}
//                 </Typography>
//               </Grid>

//               <Grid item xs={4}>
//                 <Typography variant="subtitle2" color="success.main">
//                   Net Pay
//                 </Typography>
//                 <Typography
//                   fontWeight={700}
//                   color="success.main"
//                   fontSize={18}
//                 >
//                   {formatCurrency(salary.netPay)}
//                 </Typography>
//               </Grid>
//             </Grid>

//             <Divider sx={{ my: 3 }} />

//             <Typography variant="subtitle2" color="text.secondary">
//               Remarks
//             </Typography>
//             <Typography sx={{ mb: 2 }}>
//               {salary.remarks || 'No remarks provided'}
//             </Typography>

//             <Typography variant="caption" color="text.secondary">
//               Created: {formatDate(salary.createdAt)}
//             </Typography>
//             <br />
//             <Typography variant="caption" color="text.secondary">
//               Updated: {formatDate(salary.updatedAt)}
//             </Typography>
//           </Paper>
//         )}
//       </DialogContent>

//       {/* ACTIONS */}
//       <DialogActions sx={{ px: 4, pb: 3 }}>
//         <Button onClick={onClose}>Close</Button>

//         {activeStep > 0 && (
//           <Button onClick={backStep}>Back</Button>
//         )}

//         {activeStep < 2 ? (
//           <Button variant="contained" onClick={nextStep}>
//             Next
//           </Button>
//         ) : (
//           <Button
//             variant="contained"
//             startIcon={<EditIcon />}
//             onClick={() => {
//               onClose();
//               onEdit(salary);
//             }}
//           >
//             Edit Salary
//           </Button>
//         )}
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default ViewSalary;

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Divider,
  Grid,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';

const steps = [
  'Employee & Payroll',
  'Earnings',
  'Deductions & Summary'
];

const ViewSalary = ({ open, onClose, salary, onEdit }) => {
  const [activeStep, setActiveStep] = useState(0);

  if (!salary) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) =>
    `₹ ${Number(amount || 0).toLocaleString('en-IN')}`;

  const nextStep = () => setActiveStep((prev) => prev + 1);
  const backStep = () => setActiveStep((prev) => prev - 1);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      {/* HEADER */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg,#164e63,#0ea5e9)',
          color: '#fff',
          fontSize: 20,
          fontWeight: 600,
          py: 2
        }}
      >
        Salary Details – {salary.periodDisplay}
      </DialogTitle>

      {/* STEPPER */}
      <Box sx={{ px: 4, pt: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent sx={{ px: 4, py: 3 }}>

        {/* STEP 1 */}
        {activeStep === 0 && (
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 600, bgcolor: '#f5f5f5', width: '200px' }}>Employee Name</TableCell>
                  <TableCell>{salary.employee?.FullName}</TableCell>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 600, bgcolor: '#f5f5f5', width: '200px' }}>Employee ID</TableCell>
                  <TableCell>{salary.employee?.EmployeeID}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Department</TableCell>
                  <TableCell>{salary.employee?.DepartmentID?.DepartmentName}</TableCell>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Email</TableCell>
                  <TableCell>{salary.employee?.Email}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Month</TableCell>
                  <TableCell>{salary.monthName}</TableCell>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Year</TableCell>
                  <TableCell>{salary.payrollPeriod?.year}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Employment Type</TableCell>
                  <TableCell>{salary.employmentType}</TableCell>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Payment Mode</TableCell>
                  <TableCell>{salary.paymentMode}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Status</TableCell>
                  <TableCell colSpan={3}>
                    <Chip
                      label={salary.paymentStatus}
                      color={
                        salary.paymentStatus === 'PROCESSED'
                          ? 'success'
                          : 'warning'
                      }
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* STEP 2 */}
        {activeStep === 1 && (
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Earning Component</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Amount (₹)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(salary.earnings || {}).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell component="th" scope="row" sx={{ textTransform: 'capitalize' }}>
                      {key}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCurrency(value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* STEP 3 */}
        {activeStep === 2 && (
          <Stack spacing={3}>
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Deduction Component</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Amount (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(salary.deductions || {}).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell component="th" scope="row" sx={{ textTransform: 'capitalize' }}>
                        {key}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(value)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600, bgcolor: '#f5f5f5', width: '200px' }}>Gross Salary</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(salary.grossSalary)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Total Deductions</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(salary.totalDeductions)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 700, bgcolor: '#e8f5e8', color: 'success.main' }}>Net Pay</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main', fontSize: 16 }}>{formatCurrency(salary.netPay)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600, bgcolor: '#f5f5f5', width: '200px' }}>Remarks</TableCell>
                    <TableCell>{salary.remarks || 'No remarks provided'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Created</TableCell>
                    <TableCell>{formatDate(salary.createdAt)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Updated</TableCell>
                    <TableCell>{formatDate(salary.updatedAt)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        )}
      </DialogContent>

      {/* ACTIONS */}
      <DialogActions sx={{ px: 4, pb: 3 }}>
        <Button onClick={onClose}>Close</Button>

        {activeStep > 0 && (
          <Button onClick={backStep}>Back</Button>
        )}

        {activeStep < 2 ? (
          <Button variant="contained" onClick={nextStep}>
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => {
              onClose();
              onEdit(salary);
            }}
          >
            Edit Salary
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ViewSalary;