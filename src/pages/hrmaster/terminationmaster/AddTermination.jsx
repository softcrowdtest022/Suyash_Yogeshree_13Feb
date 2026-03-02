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
  CircularProgress,
  Grid,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import BASE_URL from "../../../config/Config";

const AddTermination = ({ open, onClose, onAdd }) => {
  const [employees, setEmployees] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: "",
    reason: "",
    lastWorkingDay: null,
    terminationType: "termination",
    initiatorType: "HR",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- Fetch Employees ---------------- */
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
    } catch (err) {
      console.error(err);
    } finally {
      setEmployeeLoading(false);
    }
  };

  /* ---------------- Handle Change ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- Submit ---------------- */
  const handleSubmit = async () => {
    if (!formData.employeeId) return setError("Employee is required");
    if (!formData.reason) return setError("Reason is required");
    if (!formData.lastWorkingDay)
      return setError("Last Working Day is required");

    setLoading(true);
    setError("");

    const payload = {
      employeeId: formData.employeeId,
      reason: formData.reason,
      lastWorkingDay: formData.lastWorkingDay.toISOString().split("T")[0],
      terminationType: formData.terminationType,
      initiatorType: formData.initiatorType,
    };

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${BASE_URL}/api/terminations/initiate`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        onAdd(response.data.data);
        onClose();
        setFormData({
          employeeId: "",
          reason: "",
          lastWorkingDay: null,
          terminationType: "termination",
          initiatorType: "HR",
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to initiate termination"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* Gradient Header */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #164e63, #00B4D8)",
          color: "#fff",
          fontWeight: 600,
          fontSize: "20px",
        }}
      >
        Initiate Termination
      </DialogTitle>

      <DialogContent sx={{ pt: 4, margin: 2 }}>
        <Stack spacing={3}>
          {/* Employee Dropdown */}
          <TextField
            select
            label="Employee"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
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

          {/* Termination Type */}
          <TextField
            select
            label="Termination Type"
            name="terminationType"
            value={formData.terminationType}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="termination">Termination</MenuItem>
            <MenuItem value="resignation">Resignation</MenuItem>
            <MenuItem value="retirement">Retirement</MenuItem>
          </TextField>

          {/* Initiator Type */}
          <TextField
            select
            label="Initiated By"
            name="initiatorType"
            value={formData.initiatorType}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="HR">HR</MenuItem>
            <MenuItem value="Employee">Employee</MenuItem>
          </TextField>

          {/* Last Working Day */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Last Working Day"
              value={formData.lastWorkingDay}
              onChange={(newValue) =>
                setFormData((prev) => ({
                  ...prev,
                  lastWorkingDay: newValue,
                }))
              }
              renderInput={(params) => (
                <TextField {...params} fullWidth />
              )}
            />
          </LocalizationProvider>

          {/* Reason */}
          <TextField
            label="Reason"
            name="reason"
            multiline
            rows={3}
            value={formData.reason}
            onChange={handleChange}
            fullWidth
          />

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Cancel</Button>

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
          {loading ? "Submitting..." : "Initiate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTermination;
