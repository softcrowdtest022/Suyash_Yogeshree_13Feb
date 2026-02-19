import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Stack,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar
} from "@mui/material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

const HEADER_GRADIENT =
  "linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)";

const ApplyLeave = ({ open, handleClose, onSuccess, employeeId, employeeDetails }) => {
  const token = localStorage.getItem("token");

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [form, setForm] = useState({
    leaveTypeId: "",
    fromDate: "",
    toDate: "",
    reason: "",
    contactNumber: "",
    addressDuringLeave: ""
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  /* ================= FETCH LEAVE TYPES ================= */
  useEffect(() => {
    if (open) {
      fetchLeaveTypes();
      // Pre-fill contact number and address from employee details if available
      if (employeeDetails) {
        setForm(prev => ({
          ...prev,
          contactNumber: employeeDetails.PhoneNumber || "",
          addressDuringLeave: employeeDetails.Address || ""
        }));
      }
    }
  }, [open, employeeDetails]);

  const fetchLeaveTypes = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/leavetypes`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const allLeaveTypes = response.data.data || [];
        // Only show active leave types
        const activeLeaveTypes = allLeaveTypes.filter(
          (type) => type.IsActive === true
        );
        setLeaveTypes(activeLeaveTypes);
      }
    } catch (err) {
      console.error("Failed to load leave types", err);
      setSnackbar({
        open: true,
        message: "Failed to load leave types",
        severity: "error"
      });
    }
  };

  /* ================= VALIDATION ================= */
  const validate = () => {
    let temp = {};
    
    if (!form.leaveTypeId) temp.leaveTypeId = "Required";
    if (!form.fromDate) temp.fromDate = "Required";
    if (!form.toDate) temp.toDate = "Required";
    if (form.fromDate && form.toDate && form.fromDate > form.toDate)
      temp.toDate = "To Date must be after From Date";
    if (!form.reason) temp.reason = "Required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      
      const requestData = {
        leaveTypeId: form.leaveTypeId,
        startDate: form.fromDate,
        endDate: form.toDate,
        reason: form.reason,
        employeeId: employeeId, // Use the employeeId prop
        contactNumber: form.contactNumber || employeeDetails?.PhoneNumber || "9876543210",
        addressDuringLeave: form.addressDuringLeave || employeeDetails?.Address || "Not specified"
      };

      console.log("Submitting Data:", requestData);

      const response = await axios.post(
        `${BASE_URL}/api/leaves`,
        requestData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log("Full response:", response.data);

      // Check if request was successful
      if (response.data && response.data.success) {
        console.log("✅ Leave application successful!");
        
        // Reset form
        setForm({
          leaveTypeId: "",
          fromDate: "",
          toDate: "",
          reason: "",
          contactNumber: employeeDetails?.PhoneNumber || "",
          addressDuringLeave: employeeDetails?.Address || ""
        });
        
        // Show success message
        setSnackbar({
          open: true,
          message: "Leave application submitted successfully!",
          severity: "success"
        });
        
        // Call onSuccess if it's a function with a slight delay to show success message
        if (onSuccess && typeof onSuccess === 'function') {
          // Pass true to indicate success
          setTimeout(() => {
            onSuccess(true);
          }, 1000);
        } else {
          // If onSuccess is not provided, just close after delay
          setTimeout(() => {
            handleClose();
          }, 1000);
        }
      } else {
        throw new Error(response.data?.message || "Failed to apply leave");
      }
      
    } catch (err) {
      console.error("❌ Error details:", err);
      
      let errorMessage = "Failed to apply leave";
      
      if (err.response) {
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error"
      });
      
      setLoading(false);
    }
  };

  /* ================= HANDLE CLOSE ================= */
  const handleDialogClose = () => {
    // Reset form when dialog closes
    setForm({
      leaveTypeId: "",
      fromDate: "",
      toDate: "",
      reason: "",
      contactNumber: employeeDetails?.PhoneNumber || "",
      addressDuringLeave: employeeDetails?.Address || ""
    });
    setErrors({});
    handleClose();
  };

  /* ================= HANDLE SNACKBAR CLOSE ================= */
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleDialogClose} 
        fullWidth 
        maxWidth="sm" 
        disableEnforceFocus
      >
        <DialogTitle
          sx={{
            background: HEADER_GRADIENT,
            color: "#fff",
            fontWeight: 600
          }}
        >
          Apply Leave {employeeDetails && `- ${employeeDetails.FirstName} ${employeeDetails.LastName}`}
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3} mt={1}>

            {/* LEAVE TYPE DROPDOWN */}
            <TextField
              select
              label="Leave Type"
              value={form.leaveTypeId}
              onChange={(e) =>
                setForm({ ...form, leaveTypeId: e.target.value })
              }
              error={!!errors.leaveTypeId}
              helperText={errors.leaveTypeId}
              fullWidth
              size="small"
              disabled={loading}
              SelectProps={{
                MenuProps: {
                  keepMounted: true,
                },
              }}
            >
              {leaveTypes.length > 0 ? (
                leaveTypes.map((type) => (
                  <MenuItem key={type._id} value={type._id}>
                    {type.Name} {type.MaxDaysPerYear ? `(Max: ${type.MaxDaysPerYear} days)` : ''}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No leave types available</MenuItem>
              )}
            </TextField>

            {/* DATE FIELDS */}
            <Stack direction="row" spacing={2}>
              <TextField
                type="date"
                label="From Date"
                InputLabelProps={{ shrink: true }}
                value={form.fromDate}
                onChange={(e) =>
                  setForm({ ...form, fromDate: e.target.value })
                }
                error={!!errors.fromDate}
                helperText={errors.fromDate}
                fullWidth
                disabled={loading}
                inputProps={{
                  min: new Date().toISOString().split('T')[0]
                }}
              />

              <TextField
                type="date"
                label="To Date"
                InputLabelProps={{ shrink: true }}
                value={form.toDate}
                onChange={(e) =>
                  setForm({ ...form, toDate: e.target.value })
                }
                error={!!errors.toDate}
                helperText={errors.toDate}
                fullWidth
                disabled={loading}
                inputProps={{
                  min: form.fromDate || new Date().toISOString().split('T')[0]
                }}
              />
            </Stack>

            {/* REASON */}
            <TextField
              label="Reason"
              multiline
              rows={4}
              value={form.reason}
              onChange={(e) =>
                setForm({ ...form, reason: e.target.value })
              }
              error={!!errors.reason}
              helperText={errors.reason}
              fullWidth
              disabled={loading}
            />

            {/* CONTACT NUMBER */}
            <TextField
              label="Contact Number"
              value={form.contactNumber}
              onChange={(e) =>
                setForm({ ...form, contactNumber: e.target.value })
              }
              fullWidth
              size="small"
              placeholder="Optional"
              disabled={loading}
            />

            {/* ADDRESS DURING LEAVE */}
            <TextField
              label="Address During Leave"
              value={form.addressDuringLeave}
              onChange={(e) =>
                setForm({ ...form, addressDuringLeave: e.target.value })
              }
              fullWidth
              size="small"
              placeholder="Optional"
              disabled={loading}
            />

            {/* BUTTONS */}
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button
                variant="outlined"
                onClick={handleDialogClose}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || leaveTypes.length === 0}
                sx={{
                  background: HEADER_GRADIENT,
                  fontWeight: 600,
                  '&:hover': {
                    background: HEADER_GRADIENT,
                    opacity: 0.9
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={20} sx={{ color: "#fff" }} />
                ) : (
                  "Submit"
                )}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* SNACKBAR FOR NOTIFICATIONS */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ApplyLeave;