// import React, { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   Stack,
//   Grid,
//   Alert,
//   MenuItem,
//   Stepper,
//   Step,
//   StepLabel,
//   Box,
//   Paper,
// } from "@mui/material";
// import { Save as SaveIcon } from "@mui/icons-material";
// import axios from "axios";
// import BASE_URL from "../../../config/Config";

// const steps = ["Earnings", "Deductions", "Payment Info"];

// const EditSalary = ({ open, onClose, salary, onUpdate }) => {
//   const [formData, setFormData] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [activeStep, setActiveStep] = useState(0);

//   useEffect(() => {
//     if (salary) {
//       setFormData({
//         basic: salary.earnings?.basic || "",
//         hra: salary.earnings?.hra || "",
//         conveyance: salary.earnings?.conveyance || "",
//         medical: salary.earnings?.medical || "",
//         specialAllowance: salary.earnings?.specialAllowance || "",
//         bonus: salary.earnings?.bonus || "",
//         overtime: salary.earnings?.overtime || "",
//         otherAllowances: salary.earnings?.otherAllowances || "",
//         pf: salary.deductions?.pf || "",
//         esi: salary.deductions?.esi || "",
//         professionalTax: salary.deductions?.professionalTax || "",
//         tds: salary.deductions?.tds || "",
//         loanRecovery: salary.deductions?.loanRecovery || "",
//         otherDeductions: salary.deductions?.otherDeductions || "",
//         workingDays: salary.workingDays || 26,
//         paidDays: salary.paidDays || 26,
//         leaveDays: salary.leaveDays || 0,
//         lopDays: salary.lopDays || 0,
//         overtimeHours: salary.overtimeHours || 0,
//         overtimeRate: salary.overtimeRate || 0,
//         performanceBonus: salary.performanceBonus || 0,
//         incentives: salary.incentives || 0,
//         advanceDeductions: salary.advanceDeductions || 0,
//         paymentMode: salary.paymentMode || "BANK_TRANSFER",
//         paymentStatus: salary.paymentStatus || "PENDING",
//         transactionId: salary.transactionId || "",
//         remarks: salary.remarks || "",
//       });
//     }
//   }, [salary]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleNext = () => setActiveStep((prev) => prev + 1);
//   const handleBack = () => setActiveStep((prev) => prev - 1);

//   const handleSubmit = async () => {
//     setLoading(true);
//     setError("");

//     const payload = {
//       earnings: {
//         basic: Number(formData.basic),
//         hra: Number(formData.hra),
//         conveyance: Number(formData.conveyance),
//         medical: Number(formData.medical),
//         specialAllowance: Number(formData.specialAllowance),
//         bonus: Number(formData.bonus),
//         overtime: Number(formData.overtime),
//         otherAllowances: Number(formData.otherAllowances),
//       },
//       deductions: {
//         pf: Number(formData.pf),
//         esi: Number(formData.esi),
//         professionalTax: Number(formData.professionalTax),
//         tds: Number(formData.tds),
//         loanRecovery: Number(formData.loanRecovery),
//         otherDeductions: Number(formData.otherDeductions),
//       },
//       workingDays: Number(formData.workingDays),
//       paidDays: Number(formData.paidDays),
//       leaveDays: Number(formData.leaveDays),
//       lopDays: Number(formData.lopDays),
//       overtimeHours: Number(formData.overtimeHours),
//       overtimeRate: Number(formData.overtimeRate),
//       performanceBonus: Number(formData.performanceBonus),
//       incentives: Number(formData.incentives),
//       advanceDeductions: Number(formData.advanceDeductions),
//       paymentMode: formData.paymentMode,
//       paymentStatus: formData.paymentStatus,
//       transactionId: formData.transactionId,
//       remarks: formData.remarks,
//     };

//     try {
//       const token = localStorage.getItem("token");

//       const response = await axios.put(
//         `${BASE_URL}/api/salaries/${salary._id}`,
//         payload,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         },
//       );

//       if (response.data.success) {
//         onUpdate(response.data.data);
//         onClose();
//       } else {
//         setError(response.data.message || "Failed to update salary");
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || "Update failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!salary) return null;

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       maxWidth="lg"
//       fullWidth
//       PaperProps={{ sx: { borderRadius: 3 } }}
//     >
//       {/* Header */}
//       <DialogTitle
//         sx={{
//           background: "linear-gradient(135deg, #164e63, #0ea5e9)",
//           color: "#fff",
//           fontWeight: 600,
//           fontSize: 20,
//         }}
//       >
//         Edit Salary – {salary.periodDisplay}
//       </DialogTitle>

//       {/* Stepper */}
//       <Box sx={{ px: 4, pt: 3 }}>
//         <Stepper activeStep={activeStep} alternativeLabel>
//           {steps.map((step) => (
//             <Step key={step}>
//               <StepLabel>{step}</StepLabel>
//             </Step>
//           ))}
//         </Stepper>
//       </Box>

//       <DialogContent sx={{ px: 5, py: 4 }}>
//         {/* STEP 1 — Earnings */}
//         {activeStep === 0 && (
//           <Paper sx={{ p: 4, borderRadius: 3, bgcolor: "#f8fafc" }}>
//             <Grid container spacing={3}>
//               {[
//                 "basic",
//                 "hra",
//                 "conveyance",
//                 "medical",
//                 "specialAllowance",
//                 "bonus",
//                 "overtime",
//                 "otherAllowances",
//               ].map((field) => (
//                 <Grid item xs={6} key={field}>
//                   <TextField
//                     fullWidth
//                     label={field}
//                     name={field}
//                     value={formData[field] || ""}
//                     onChange={handleChange}
//                   />
//                 </Grid>
//               ))}
//             </Grid>
//           </Paper>
//         )}

//         {/* STEP 2 — Deductions */}
//         {activeStep === 1 && (
//           <Paper sx={{ p: 4, borderRadius: 3, bgcolor: "#f8fafc" }}>
//             <Grid container spacing={3}>
//               {[
//                 "pf",
//                 "esi",
//                 "professionalTax",
//                 "tds",
//                 "loanRecovery",
//                 "otherDeductions",
//               ].map((field) => (
//                 <Grid item xs={6} key={field}>
//                   <TextField
//                     fullWidth
//                     label={field}
//                     name={field}
//                     value={formData[field] || ""}
//                     onChange={handleChange}
//                   />
//                 </Grid>
//               ))}
//             </Grid>
//           </Paper>
//         )}

//         {/* STEP 3 — Payment Info */}
//         {activeStep === 2 && (
//           <Paper sx={{ p: 4, borderRadius: 3, bgcolor: "#f8fafc" }}>
//             <Grid container spacing={3}>
//               <Grid item xs={6}>
//                 <TextField
//                   select
//                   fullWidth
//                   label="Payment Mode"
//                   name="paymentMode"
//                   value={formData.paymentMode}
//                   onChange={handleChange}
//                 >
//                   <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
//                   <MenuItem value="CASH">Cash</MenuItem>
//                   <MenuItem value="CHEQUE">Cheque</MenuItem>
//                   <MenuItem value="ONLINE">Online</MenuItem>
//                 </TextField>
//               </Grid>

//               <Grid item xs={6}>
//                 <TextField
//                   select
//                   fullWidth
//                   label="Payment Status"
//                   name="paymentStatus"
//                   value={formData.paymentStatus}
//                   onChange={handleChange}
//                 >
//                   <MenuItem value="PENDING">Pending</MenuItem>
//                   <MenuItem value="PROCESSED">Processed</MenuItem>
//                   <MenuItem value="PAID">Paid</MenuItem>
//                   <MenuItem value="CANCELLED">Cancelled</MenuItem>
//                 </TextField>
//               </Grid>

//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Transaction ID"
//                   name="transactionId"
//                   value={formData.transactionId}
//                   onChange={handleChange}
//                 />
//               </Grid>

//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   multiline
//                   rows={3}
//                   label="Remarks"
//                   name="remarks"
//                   value={formData.remarks}
//                   onChange={handleChange}
//                 />
//               </Grid>
//             </Grid>
//           </Paper>
//         )}

//         {error && (
//           <Box sx={{ mt: 3 }}>
//             <Alert severity="error">{error}</Alert>
//           </Box>
//         )}
//       </DialogContent>

//       {/* Actions */}
//       <DialogActions sx={{ px: 4, pb: 3 }}>
//         <Button onClick={onClose}>Cancel</Button>

//         {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}

//         {activeStep < 2 ? (
//           <Button variant="contained" onClick={handleNext}>
//             Next
//           </Button>
//         ) : (
//           <Button
//             variant="contained"
//             startIcon={<SaveIcon />}
//             onClick={handleSubmit}
//             disabled={loading}
//           >
//             {loading ? "Updating..." : "Update Salary"}
//           </Button>
//         )}
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default EditSalary;


import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Grid,
  Alert,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Box,
  Paper,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

const steps = ["Earnings", "Deductions", "Payment Info"];

const EditSalary = ({ open, onClose, salary, onUpdate }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (salary) {
      setFormData({
        basic: salary.earnings?.basic || "",
        hra: salary.earnings?.hra || "",
        conveyance: salary.earnings?.conveyance || "",
        medical: salary.earnings?.medical || "",
        specialAllowance: salary.earnings?.specialAllowance || "",
        bonus: salary.earnings?.bonus || "",
        overtime: salary.earnings?.overtime || "",
        otherAllowances: salary.earnings?.otherAllowances || "",
        pf: salary.deductions?.pf || "",
        esi: salary.deductions?.esi || "",
        professionalTax: salary.deductions?.professionalTax || "",
        tds: salary.deductions?.tds || "",
        loanRecovery: salary.deductions?.loanRecovery || "",
        otherDeductions: salary.deductions?.otherDeductions || "",
        workingDays: salary.workingDays || 26,
        paidDays: salary.paidDays || 26,
        leaveDays: salary.leaveDays || 0,
        lopDays: salary.lopDays || 0,
        overtimeHours: salary.overtimeHours || 0,
        overtimeRate: salary.overtimeRate || 0,
        performanceBonus: salary.performanceBonus || 0,
        incentives: salary.incentives || 0,
        advanceDeductions: salary.advanceDeductions || 0,
        paymentMode: salary.paymentMode || "BANK_TRANSFER",
        paymentStatus: salary.paymentStatus || "PENDING",
        transactionId: salary.transactionId || "",
        remarks: salary.remarks || "",
      });
    }
  }, [salary]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    const payload = {
      earnings: {
        basic: Number(formData.basic),
        hra: Number(formData.hra),
        conveyance: Number(formData.conveyance),
        medical: Number(formData.medical),
        specialAllowance: Number(formData.specialAllowance),
        bonus: Number(formData.bonus),
        overtime: Number(formData.overtime),
        otherAllowances: Number(formData.otherAllowances),
      },
      deductions: {
        pf: Number(formData.pf),
        esi: Number(formData.esi),
        professionalTax: Number(formData.professionalTax),
        tds: Number(formData.tds),
        loanRecovery: Number(formData.loanRecovery),
        otherDeductions: Number(formData.otherDeductions),
      },
      workingDays: Number(formData.workingDays),
      paidDays: Number(formData.paidDays),
      leaveDays: Number(formData.leaveDays),
      lopDays: Number(formData.lopDays),
      overtimeHours: Number(formData.overtimeHours),
      overtimeRate: Number(formData.overtimeRate),
      performanceBonus: Number(formData.performanceBonus),
      incentives: Number(formData.incentives),
      advanceDeductions: Number(formData.advanceDeductions),
      paymentMode: formData.paymentMode,
      paymentStatus: formData.paymentStatus,
      transactionId: formData.transactionId,
      remarks: formData.remarks,
    };

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${BASE_URL}/api/salaries/${salary._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        onUpdate(response.data.data);
        onClose();
      } else {
        setError(response.data.message || "Failed to update salary");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!salary) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #164e63, #0ea5e9)",
          color: "#fff",
          fontWeight: 600,
          fontSize: 20,
        }}
      >
        Edit Salary – {salary.periodDisplay}
      </DialogTitle>

      {/* Stepper */}
      <Box sx={{ px: 4, pt: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((step) => (
            <Step key={step}>
              <StepLabel>{step}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent sx={{ px: 6, py: 2 }}>
        {/* STEP 1 — Earnings */}
        {activeStep === 0 && (
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "#f8fafc" }}>
            <Grid container spacing={2}>
              {[
                "basic",
                "hra",
                "conveyance",
                "medical",
                "specialAllowance",
                "bonus",
                "overtime",
                "otherAllowances",
              ].map((field) => (
                <Grid item xs={6} md={3} key={field}>
                  <TextField
                    fullWidth
                    label={field}
                    name={field}
                    value={formData[field] || ""}
                    onChange={handleChange}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* STEP 2 — Deductions */}
        {activeStep === 1 && (
  <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "#f8fafc" }}>
    <Grid container spacing={2}>
      {/* First Row - 3 fields */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {[
            "pf",
            "esi",
            "professionalTax",
          ].map((field) => (
            <Grid item xs={4} key={field}>
              <TextField
                fullWidth
                label={field}
                name={field}
                value={formData[field] || ""}
                onChange={handleChange}
              />
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Second Row - 3 fields */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {[
            "tds",
            "loanRecovery",
            "otherDeductions",
          ].map((field) => (
            <Grid item xs={4} key={field}>
              <TextField
                fullWidth
                label={field}
                name={field}
                value={formData[field] || ""}
                onChange={handleChange}
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  </Paper>
)}
        {/* STEP 3 — Payment Info */}
        {activeStep === 2 && (
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "#f8fafc" }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Payment Mode"
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                >
                  <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                  <MenuItem value="CASH">Cash</MenuItem>
                  <MenuItem value="CHEQUE">Cheque</MenuItem>
                  <MenuItem value="ONLINE">Online</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Payment Status"
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                >
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="PROCESSED">Processed</MenuItem>
                  <MenuItem value="PAID">Paid</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Transaction ID"
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  multiline
                
                  
                  label="Remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Paper>
        )}

        {error && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 4, pb: 3 }}>
        <Button onClick={onClose}>Cancel</Button>

        {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}

        {activeStep < 2 ? (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Salary"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EditSalary;