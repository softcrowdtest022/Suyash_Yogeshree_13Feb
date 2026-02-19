import React, { useEffect, useState } from "react";
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
  Autocomplete,
  CircularProgress
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

const AddRegularization = ({ open, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    employeeId: "",
    date: "",
    requestType: "missed-punch",
    requestedIn: "",
    requestedOut: "",
    reason: "",
    supportingDocument: ""
  });

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ==============================
     FETCH EMPLOYEES
  ============================== */
  useEffect(() => {
    if (open) fetchEmployees();
  }, [open]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${BASE_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setEmployees(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load employees");
    }
  };

  /* ==============================
     HANDLE INPUT CHANGE
  ============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  /* ==============================
     VALIDATION
  ============================== */
  const validate = () => {
    if (!formData.employeeId) return "Employee is required";
    if (!formData.date) return "Date is required";
    if (!formData.requestType) return "Request type is required";
    if (!formData.reason.trim()) return "Reason is required";
    return null;
  };

  /* ==============================
     SUBMIT
  ============================== */
  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const payload = {
        employeeId: formData.employeeId,
        date: formData.date,
        requestType: formData.requestType,
        requestedIn: formData.requestedIn
          ? new Date(formData.requestedIn).toISOString()
          : null,
        requestedOut: formData.requestedOut
          ? new Date(formData.requestedOut).toISOString()
          : null,
        reason: formData.reason,
        supportingDocument: formData.supportingDocument || ""
      };

      const response = await axios.post(
        `${BASE_URL}/api/regularization`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        onAdd(response.data.data);
        resetForm();
        onClose();
      } else {
        setError(response.data.message || "Failed to submit request");
      }
    } catch (err) {
      console.error(err.response?.data);
      setError(
        err.response?.data?.message ||
          "Failed to submit regularization request"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==============================
     RESET
  ============================== */
  const resetForm = () => {
    setFormData({
      employeeId: "",
      date: "",
      requestType: "missed-punch",
      requestedIn: "",
      requestedOut: "",
      reason: "",
      supportingDocument: ""
    });
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  /* ==============================
     UI
  ============================== */
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle
        sx={{
          borderBottom: "1px solid #E0E0E0",
          backgroundColor: "#F8FAFC"
        }}
      >
        <div style={{ fontSize: "20px", fontWeight: 600 }}>
          Create Regularization Request
        </div>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}

          {/* Employee */}
          <Autocomplete
            options={employees}
            getOptionLabel={(option) => option.FullName || ""}
            onChange={(e, value) =>
              setFormData((prev) => ({
                ...prev,
                employeeId: value?._id || ""
              }))
            }
            renderInput={(params) => (
              <TextField {...params} label="Employee *" />
            )}
          />

          {/* Date */}
          <TextField
            fullWidth
            type="date"
            label="Date *"
            name="date"
            value={formData.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />

          {/* Request Type */}
          <TextField
            select
            fullWidth
            label="Request Type *"
            name="requestType"
            value={formData.requestType}
            onChange={handleChange}
          >
            <MenuItem value="missed-punch">Missed Punch</MenuItem>
            <MenuItem value="late-entry">Late Entry</MenuItem>
            <MenuItem value="early-exit">Early Exit</MenuItem>
          </TextField>

          {/* Requested In */}
          <TextField
            fullWidth
            type="datetime-local"
            label="Requested In"
            name="requestedIn"
            value={formData.requestedIn}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />

          {/* Requested Out */}
          <TextField
            fullWidth
            type="datetime-local"
            label="Requested Out"
            name="requestedOut"
            value={formData.requestedOut}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />

          {/* Reason */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason *"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
          />

          {/* Supporting Document */}
          <TextField
            fullWidth
            label="Supporting Document URL"
            name="supportingDocument"
            value={formData.supportingDocument}
            onChange={handleChange}
          />
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          borderTop: "1px solid #E0E0E0",
          backgroundColor: "#F8FAFC"
        }}
      >
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={!loading && <AddIcon />}
          sx={{
            backgroundColor: "#1976D2",
            "&:hover": { backgroundColor: "#1565C0" }
          }}
        >
          {loading ? <CircularProgress size={20} /> : "Submit Request"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddRegularization;