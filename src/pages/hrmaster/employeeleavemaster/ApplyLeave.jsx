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
  Snackbar,
  Alert
} from "@mui/material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

const HEADER_GRADIENT =
  "linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)";

const ApplyLeave = ({
  open,
  handleClose,
  onSuccess,
  employeeId,
  employeeDetails
}) => {
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
      const res = await axios.get(`${BASE_URL}/api/leavetypes`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        const active = (res.data.data || []).filter(t => t.IsActive);
        setLeaveTypes(active);
      }
    } catch {
      showSnackbar("Failed to load leave types", "error");
    }
  };

  /* ================= VALIDATION ================= */
  const validate = () => {
    let temp = {};

    if (!form.leaveTypeId) temp.leaveTypeId = "Required";
    if (!form.fromDate) temp.fromDate = "Required";
    if (!form.toDate) temp.toDate = "Required";
    if (form.fromDate && form.toDate && form.startDate > form.toDate) {
      temp.toDate = "To Date must be after From Date";
    }
    if (!form.reason) temp.reason = "Required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  /* ================= SNACKBAR ================= */
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const payload = {
        employeeId,
        leaveTypeId: form.leaveTypeId,
        startDate: form.fromDate,
        endDate: form.toDate,
        reason: form.reason.trim(),
        contactNumber:
          form.contactNumber || employeeDetails?.PhoneNumber || "",
        addressDuringLeave:
          form.addressDuringLeave || employeeDetails?.Address || ""
      };

      const res = await axios.post(
        `${BASE_URL}/api/leaves`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        showSnackbar("Leave application submitted successfully");

        setForm({
          leaveTypeId: "",
          fromDate: "",
          toDate: "",
          reason: "",
          contactNumber: employeeDetails?.PhoneNumber || "",
          addressDuringLeave: employeeDetails?.Address || ""
        });

        setTimeout(() => {
          if (onSuccess) onSuccess(true);
          handleClose();
        }, 800);
      } else {
        throw new Error(res.data?.message);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to apply leave. Please check data.";

      showSnackbar(message, "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLE CLOSE ================= */
  const handleDialogClose = () => {
    setErrors({});
    handleClose();
  };

  /* ================= DATE SELECTION ================= */
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            background: HEADER_GRADIENT,
            color: "#fff",
            fontWeight: 600
          }}
        >
          Apply Leave{" "}
          {employeeDetails &&
            `- ${employeeDetails.FirstName} ${employeeDetails.LastName}`}
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3} mt={1}>

            {/* LEAVE TYPE */}
            <TextField
              select
              label="Leave Type"
              value={form.leaveTypeId}
              onChange={e =>
                setForm({ ...form, leaveTypeId: e.target.value })
              }
              error={!!errors.leaveTypeId}
              helperText={errors.leaveTypeId}
              fullWidth
              size="small"
              disabled={loading}
            >
              {leaveTypes.length ? (
                leaveTypes.map(type => (
                  <MenuItem key={type._id} value={type._id}>
                    {type.Name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No leave types available</MenuItem>
              )}
            </TextField>

            {/* DATES */}
            <Stack direction="row" spacing={2}>
              <TextField
                type="date"
                label="From Date"
                InputLabelProps={{ shrink: true }}
                value={form.fromDate}
                onChange={e =>
                  setForm({ ...form, fromDate: e.target.value, toDate: "" })
                }
                error={!!errors.fromDate}
                helperText={errors.fromDate}
                fullWidth
                disabled={loading}
                inputProps={{
                  min: today   //prenets past date selection
                }}
              />

              <TextField
                type="date"
                label="To Date"
                InputLabelProps={{ shrink: true }}
                value={form.toDate}
                onChange={e =>
                  setForm({ ...form, toDate: e.target.value })
                }
                error={!!errors.toDate}
                helperText={errors.toDate}
                fullWidth
                disabled={loading}
                inputProps={{
                  min: form.fromDate || today   //  prevents past & before From Date
                }}
              />
            </Stack>

            {/* REASON */}
            <TextField
              label="Reason"
              multiline
              rows={2}
              value={form.reason}
              onChange={e =>
                setForm({ ...form, reason: e.target.value })
              }
              error={!!errors.reason}
              helperText={errors.reason}
              fullWidth
              disabled={loading}
            />

            {/* CONTACT */}
            <TextField
              label="Contact Number"
              value={form.contactNumber}
              onChange={e =>
                setForm({ ...form, contactNumber: e.target.value })
              }
              fullWidth
              size="small"
              disabled={loading}
            />

            {/* ADDRESS */}
            <TextField
              label="Address During Leave"
              value={form.addressDuringLeave}
              onChange={e =>
                setForm({
                  ...form,
                  addressDuringLeave: e.target.value
                })
              }
              fullWidth
              size="small"
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
                  "&:hover": { opacity: 0.9 }
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

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        onClose={handleSnackbarClose}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ApplyLeave;
