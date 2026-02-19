// import React, { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   Stack,
//   Alert,
//   MenuItem,
//   Grid,
//   CircularProgress,
//   Stepper,
//   Step,
//   StepLabel,
//   Box,
//   Typography,
//   styled,
//   StepConnector,
// } from "@mui/material";
// import { Add as AddIcon } from "@mui/icons-material";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import axios from "axios";
// import BASE_URL from "../../../config/Config";

// /* ------------------- Custom Stepper Styling ------------------- */

// const ColorConnector = styled(StepConnector)(({ theme }) => ({
//   "& .MuiStepConnector-line": {
//     height: 4,
//     border: 0,
//     backgroundColor: "#e0e0e0",
//     borderRadius: 10,
//   },
//   "&.Mui-active .MuiStepConnector-line": {
//     background: "linear-gradient(90deg, #164e63, #00B4D8)",
//   },
//   "&.Mui-completed .MuiStepConnector-line": {
//     background: "linear-gradient(90deg, #164e63, #00B4D8)",
//   },
// }));

// const steps = ["Employee & Period", "Earnings", "Deductions & Payment"];

// const AddSalary = ({ open, onClose, onAdd }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [employees, setEmployees] = useState([]);
//   const [employeeLoading, setEmployeeLoading] = useState(false);

//   const [formData, setFormData] = useState({
//     employee: "",
//     month: "",
//     year: "",
//     date: null, // Add this line
//     employmentType: "Monthly",
//     basic: "",
//     hra: "",
//     conveyance: "",
//     medical: "",
//     specialAllowance: "",
//     bonus: "",           // Add this
//     tds: "",             // Add this
//     loanRecovery: "",
//     pf: "",
//     esi: "",
//     professionalTax: "",
//     workingDays: 26,
//     paidDays: 26,
//     leaveDays: 0,
//     lopDays: 0,
//     paymentMode: "BANK_TRANSFER",
//     remarks: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (open) fetchEmployees();
//   }, [open]);

//   const fetchEmployees = async () => {
//     try {
//       setEmployeeLoading(true);
//       const token = localStorage.getItem("token");
//       const response = await axios.get(`${BASE_URL}/api/employees`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (response.data.success) {
//         setEmployees(response.data.data || []);
//       }
//     } finally {
//       setEmployeeLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleEmployeeChange = async (e) => {
//     const employeeId = e.target.value;
//     setFormData((prev) => ({ ...prev, employee: employeeId }));

//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.get(
//         `${BASE_URL}/api/employees/${employeeId}`,
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//       if (response.data.success) {
//         const emp = response.data.data;
//         setFormData((prev) => ({
//           ...prev,
//           basic: emp.TotalFixedSalary || "",
//         }));
//       }
//     } catch {}
//   };

//   const handleNext = () => setActiveStep((prev) => prev + 1);
//   const handleBack = () => setActiveStep((prev) => prev - 1);

//   const handleSubmit = async () => {
//     if (!formData.employee) return setError("Employee is required");
//     if (!formData.month || !formData.year)
//       return setError("Month and Year are required");
//     if (!formData.basic) return setError("Basic salary is required");

//     setLoading(true);
//     setError("");

//     const payload = {
//       employee: formData.employee,
//       payrollPeriod: {
//         month: Number(formData.month),
//         year: Number(formData.year),
//       },
//       employmentType: formData.employmentType,
//       earnings: {
//         basic: Number(formData.basic),
//         hra: Number(formData.hra || 0),
//         conveyance: Number(formData.conveyance || 0),
//         medical: Number(formData.medical || 0),
//         specialAllowance: Number(formData.specialAllowance || 0),
//         bonus: 0,
//         overtime: 0,
//         otherAllowances: 0,
//       },
//       deductions: {
//         pf: Number(formData.pf || 0),
//         esi: Number(formData.esi || 0),
//         professionalTax: Number(formData.professionalTax || 0),
//         tds: 0,
//         loanRecovery: 0,
//         otherDeductions: 0,
//       },
//       workingDays: Number(formData.workingDays),
//       paidDays: Number(formData.paidDays),
//       leaveDays: Number(formData.leaveDays),
//       lopDays: Number(formData.lopDays),
//       paymentMode: formData.paymentMode,
//       remarks: formData.remarks,
//     };

//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.post(`${BASE_URL}/api/salaries`, payload, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (response.data.success) {
//         onAdd(response.data.data);
//         onClose();
//         setActiveStep(0);
//       }
//     } catch {
//       setError("Failed to create salary.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
//       {/* 🔥 Attractive Header */}
//       <DialogTitle
//         sx={{
//           background: "linear-gradient(135deg, #164e63, #00B4D8)",
//           color: "#fff",
//           fontWeight: 600,
//           fontSize: "20px",
//         }}
//       >
//         Add Salary
//       </DialogTitle>

//       <DialogContent sx={{ pt: 4, px: 3 }}>
//   {/* Stepper */}
//   <Stepper
//     activeStep={activeStep}
//     alternativeLabel
//     connector={<ColorConnector />}
//     sx={{ mb: 4, mt: 2 }}
//   >
//     {steps.map((label) => (
//       <Step key={label}>
//         <StepLabel>
//           <Typography fontWeight={500} fontSize="0.9rem">
//             {label}
//           </Typography>
//         </StepLabel>
//       </Step>
//     ))}
//   </Stepper>
//          <Box sx={{ mt: 2 }}>
//         <Stack spacing={3}>
//           {/* STEP 1 */}
//           {activeStep === 0 && (
//             <>
//               <TextField
//                 select
//                 label="Employee"
//                 value={formData.employee}
//                 onChange={handleEmployeeChange}
//                 fullWidth
//               >
//                 {employeeLoading ? (
//                   <MenuItem disabled>
//                     <CircularProgress size={18} sx={{ mr: 1 }} />
//                     Loading...
//                   </MenuItem>
//                 ) : (
//                   employees.map((emp) => (
//                     <MenuItem key={emp._id} value={emp._id}>
//                       {emp.FirstName} {emp.LastName}
//                     </MenuItem>
//                   ))
//                 )}
//               </TextField>

//               <LocalizationProvider dateAdapter={AdapterDateFns}>
//                 <DatePicker
//                   label="Select Month & Year"
//                   views={["month", "year"]}
//                   value={formData.date}
//                   onChange={(newValue) => {
//                     if (newValue) {
//                       setFormData((prev) => ({
//                         ...prev,
//                         date: newValue,
//                         month: (newValue.getMonth() + 1).toString(),
//                         year: newValue.getFullYear().toString(),
//                       }));
//                     } else {
//                       setFormData((prev) => ({
//                         ...prev,
//                         date: null,
//                         month: "",
//                         year: "",
//                       }));
//                     }
//                   }}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       fullWidth
//                       helperText="Select month and year for salary"
//                     />
//                   )}
//                 />
//               </LocalizationProvider>
//             </>
//           )}
//           {/* STEP 2 */}
//           {activeStep === 1 && (
//   <Grid container spacing={2}>
//     <Grid item xs={12} sm={6} md={2.4}>
//       <TextField
//         label="Basic Salary"
//         name="basic"
//         fullWidth
//         size="small"
//         value={formData.basic}
//         onChange={handleChange}
//         InputProps={{ sx: { borderRadius: 1.5 } }}
//       />
//     </Grid>
//     <Grid item xs={12} sm={6} md={2.4}>
//       <TextField
//         label="HRA"
//         name="hra"
//         fullWidth
//         size="small"
//         value={formData.hra}
//         onChange={handleChange}
//         InputProps={{ sx: { borderRadius: 1.5 } }}
//       />
//     </Grid>
//     <Grid item xs={12} sm={6} md={2.4}>
//       <TextField
//         label="Conveyance"
//         name="conveyance"
//         fullWidth
//         size="small"
//         value={formData.conveyance}
//         onChange={handleChange}
//         InputProps={{ sx: { borderRadius: 1.5 } }}
//       />
//     </Grid>
//     <Grid item xs={12} sm={6} md={2.4}>
//       <TextField
//         label="Medical"
//         name="medical"
//         fullWidth
//         size="small"
//         value={formData.medical}
//         onChange={handleChange}
//         InputProps={{ sx: { borderRadius: 1.5 } }}
//       />
//     </Grid>
//     <Grid item xs={12} sm={6} md={2.4}>
//       <TextField
//         label="Special Allowance"
//         name="specialAllowance"
//         fullWidth
//         size="small"
//         value={formData.specialAllowance}
//         onChange={handleChange}
//         InputProps={{ sx: { borderRadius: 1.5 } }}
//       />
//     </Grid>
//   </Grid>
// )}

//           {/* STEP 3 */}
//           {activeStep === 2 && (
//   <Grid container spacing={1.5}>
//     <Grid item xs={12} sm={6} md={2.4}>
//       <TextField
//         label="PF"
//         name="pf"
//         fullWidth
//         size="small"
//         value={formData.pf}
//         onChange={handleChange}
//         InputProps={{ sx: { borderRadius: 1.5 } }}
//       />
//     </Grid>
//     <Grid item xs={12} sm={6} md={2.4}>
//       <TextField
//         label="ESI"
//         name="esi"
//         fullWidth
//         size="small"
//         value={formData.esi}
//         onChange={handleChange}
//         InputProps={{ sx: { borderRadius: 1.5 } }}
//       />
//     </Grid>
//     <Grid item xs={12} sm={6} md={2.4}>
//       <TextField
//         label="Professional Tax"
//         name="professionalTax"
//         fullWidth
//         size="small"
//         value={formData.professionalTax}
//         onChange={handleChange}
//         InputProps={{ sx: { borderRadius: 1.5 } }}
//       />
//     </Grid>
//     <Grid item xs={12} sm={6} md={2.4}>
//       <TextField
//         select
//         label="Payment Mode"
//         name="paymentMode"
//         fullWidth
//         size="small"
//         value={formData.paymentMode}
//         onChange={handleChange}
//         InputProps={{ sx: { borderRadius: 1.5 } }}
//       >
//         <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
//         <MenuItem value="CASH">Cash</MenuItem>
//         <MenuItem value="CHEQUE">Cheque</MenuItem>
//         <MenuItem value="ONLINE">Online</MenuItem>
//       </TextField>
//     </Grid>
//     <Grid item xs={12} sm={6} md={2.4}>
//       <TextField
//         label="Remarks"
//         name="remarks"
//         fullWidth
//         size="small"
//         value={formData.remarks}
//         onChange={handleChange}
//         InputProps={{ sx: { borderRadius: 1.5 } }}
//       />
//     </Grid>
//   </Grid>
// )}
//           {error && <Alert severity="error">{error}</Alert>}
//         </Stack>
//         </Box>
//       </DialogContent>

//       <DialogActions sx={{ px: 3, pb: 3 }}>
//         {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}

//         {activeStep < steps.length - 1 ? (
//           <Button
//             variant="contained"
//             onClick={handleNext}
//             sx={{
//               background: "linear-gradient(135deg, #164e63, #00B4D8)",
//               "&:hover": { opacity: 0.9 },
//             }}
//           >
//             Next
//           </Button>
//         ) : (
//           <Button
//             variant="contained"
//             onClick={handleSubmit}
//             disabled={loading}
//             startIcon={!loading && <AddIcon />}
//             sx={{
//               background: "linear-gradient(135deg, #164e63, #00B4D8)",
//               "&:hover": { opacity: 0.9 },
//             }}
//           >
//             {loading ? "Adding..." : "Add Salary"}
//           </Button>
//         )}
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default AddSalary;


import React, { useState, useEffect } from "react";
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
  Grid,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  styled,
  StepConnector,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import BASE_URL from "../../../config/Config";

/* ------------------- Custom Stepper Styling ------------------- */

const ColorConnector = styled(StepConnector)(({ theme }) => ({
  "& .MuiStepConnector-line": {
    height: 4,
    border: 0,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
  },
  "&.Mui-active .MuiStepConnector-line": {
    background: "linear-gradient(90deg, #164e63, #00B4D8)",
  },
  "&.Mui-completed .MuiStepConnector-line": {
    background: "linear-gradient(90deg, #164e63, #00B4D8)",
  },
}));

const steps = ["Employee & Period", "Earnings", "Deductions & Payment"];

const AddSalary = ({ open, onClose, onAdd }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);

  const [formData, setFormData] = useState({
    employee: "",
    month: "",
    year: "",
    date: null,
    employmentType: "Monthly",
    basic: "",
    hra: "",
    conveyance: "",
    medical: "",
    specialAllowance: "",
    bonus: "",
    tds: "",
    loanRecovery: "",
    pf: "",
    esi: "",
    professionalTax: "",
    workingDays: 26,
    paidDays: 26,
    leaveDays: 0,
    lopDays: 0,
    paymentMode: "BANK_TRANSFER",
    remarks: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) fetchEmployees();
  }, [open]);

  const fetchEmployees = async () => {
    try {
      setEmployeeLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setEmployees(response.data.data || []);
      }
    } finally {
      setEmployeeLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmployeeChange = async (e) => {
    const employeeId = e.target.value;
    setFormData((prev) => ({ ...prev, employee: employeeId }));

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/employees/${employeeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        const emp = response.data.data;
        setFormData((prev) => ({
          ...prev,
          basic: emp.TotalFixedSalary || "",
        }));
      }
    } catch {}
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async () => {
    if (!formData.employee) return setError("Employee is required");
    if (!formData.month || !formData.year)
      return setError("Month and Year are required");
    if (!formData.basic) return setError("Basic salary is required");

    setLoading(true);
    setError("");

    const payload = {
      employee: formData.employee,
      payrollPeriod: {
        month: Number(formData.month),
        year: Number(formData.year),
      },
      employmentType: formData.employmentType,
      earnings: {
        basic: Number(formData.basic),
        hra: Number(formData.hra || 0),
        conveyance: Number(formData.conveyance || 0),
        medical: Number(formData.medical || 0),
        specialAllowance: Number(formData.specialAllowance || 0),
        bonus: Number(formData.bonus || 0),
        overtime: 0,
        otherAllowances: 0,
      },
      deductions: {
        pf: Number(formData.pf || 0),
        esi: Number(formData.esi || 0),
        professionalTax: Number(formData.professionalTax || 0),
        tds: Number(formData.tds || 0),
        loanRecovery: Number(formData.loanRecovery || 0),
        otherDeductions: 0,
      },
      workingDays: Number(formData.workingDays),
      paidDays: Number(formData.paidDays),
      leaveDays: Number(formData.leaveDays),
      lopDays: Number(formData.lopDays),
      paymentMode: formData.paymentMode,
      remarks: formData.remarks,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${BASE_URL}/api/salaries`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        onAdd(response.data.data);
        onClose();
        setActiveStep(0);
      }
    } catch {
      setError("Failed to create salary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* Attractive Header */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #164e63, #00B4D8)",
          color: "#fff",
          fontWeight: 600,
          fontSize: "20px",
        }}
      >
        Add Salary
      </DialogTitle>

      <DialogContent sx={{ pt: 4, px: 3 }}>
        {/* Stepper */}
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          connector={<ColorConnector />}
          sx={{ mb: 4, mt: 2 }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>
                <Typography fontWeight={500} fontSize="0.9rem">
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 2 }}>
          <Stack spacing={3}>
            {/* STEP 1 - Employee & Period */}
            {activeStep === 0 && (
              <>
                <TextField
                  select
                  label="Employee"
                  value={formData.employee}
                  onChange={handleEmployeeChange}
                  fullWidth
                >
                  {employeeLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={18} sx={{ mr: 1 }} />
                      Loading...
                    </MenuItem>
                  ) : (
                    employees.map((emp) => (
                      <MenuItem key={emp._id} value={emp._id}>
                        {emp.FirstName} {emp.LastName}
                      </MenuItem>
                    ))
                  )}
                </TextField>

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Select Month & Year"
                    views={["month", "year"]}
                    value={formData.date}
                    onChange={(newValue) => {
                      if (newValue) {
                        setFormData((prev) => ({
                          ...prev,
                          date: newValue,
                          month: (newValue.getMonth() + 1).toString(),
                          year: newValue.getFullYear().toString(),
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          date: null,
                          month: "",
                          year: "",
                        }));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        helperText="Select month and year for salary"
                      />
                    )}
                  />
                </LocalizationProvider>
              </>
            )}

            {/* STEP 2 - Earnings (2 Rows) */}
            {activeStep === 1 && (
              <Box sx={{ width: "90%" }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  color="#164e63"
                  sx={{ mb: 1 }}
                >
                  Earnings Components
                </Typography>
                <Grid container spacing={2}>
                  {/* Row 1 */}
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="Basic Salary"
                      name="basic"
                      fullWidth
                      size="medium"
                      value={formData.basic}
                      onChange={handleChange}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="HRA"
                      name="hra"
                      fullWidth
                      size="medium"
                      value={formData.hra}
                      onChange={handleChange}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="Conveyance"
                      name="conveyance"
                      fullWidth
                      size="medium"
                      value={formData.conveyance}
                      onChange={handleChange}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
                    />
                  </Grid>

                  {/* Row 2 */}
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="Medical Allowance"
                      name="medical"
                      fullWidth
                      size="medium"
                      value={formData.medical}
                      onChange={handleChange}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="Special Allowance"
                      name="specialAllowance"
                      fullWidth
                      size="medium"
                      value={formData.specialAllowance}
                      onChange={handleChange}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="Bonus (Optional)"
                      name="bonus"
                      fullWidth
                      size="medium"
                      value={formData.bonus}
                      onChange={handleChange}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* STEP 3 - Deductions & Payment (2 Rows) */}
            {activeStep === 2 && (
              <Box sx={{ width: "100%" }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  color="#164e63"
                  sx={{ mb: 2 }}
                >
                  Deductions & Payment Details
                </Typography>
                <Grid container spacing={2}>
                  {/* Row 1 - Deductions */}
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="PF"
                      name="pf"
                      fullWidth
                      size="medium"
                      value={formData.pf}
                      onChange={handleChange}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="ESI"
                      name="esi"
                      fullWidth
                      size="medium"
                      value={formData.esi}
                      onChange={handleChange}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="Professional Tax"
                      name="professionalTax"
                      fullWidth
                      size="medium"
                      value={formData.professionalTax}
                      onChange={handleChange}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
                    />
                  </Grid>

                  {/* Row 2 - Payment Details */}
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      select
                      label="Payment Mode"
                      name="paymentMode"
                      fullWidth
                      size="medium"
                      value={formData.paymentMode}
                      onChange={handleChange}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
                    >
                      <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                      <MenuItem value="CASH">Cash</MenuItem>
                      <MenuItem value="CHEQUE">Cheque</MenuItem>
                      <MenuItem value="ONLINE">Online</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="TDS"
                      name="tds"
                      fullWidth
                      size="medium"
                      value={formData.tds}
                      onChange={handleChange}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="Loan Recovery"
                      name="loanRecovery"
                      fullWidth
                      size="medium"
                      value={formData.loanRecovery}
                      onChange={handleChange}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
                    />
                  </Grid>

                  {/* Remarks field spanning full width at bottom */}
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="Remarks (Optional)"
                      name="remarks"
                      fullWidth
                      size="medium"
                      multiline
                      value={formData.remarks}
                      onChange={handleChange}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}

        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{
              background: "linear-gradient(135deg, #164e63, #00B4D8)",
              "&:hover": { opacity: 0.9 },
            }}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={!loading && <AddIcon />}
            sx={{
              background: "linear-gradient(135deg, #164e63, #00B4D8)",
              "&:hover": { opacity: 0.9 },
            }}
          >
            {loading ? "Adding..." : "Add Salary"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddSalary;