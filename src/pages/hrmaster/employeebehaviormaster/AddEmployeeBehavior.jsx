import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Rating,
  Chip,
  Switch,
  FormControlLabel,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Box
} from "@mui/material";
import { Close, AttachFile } from "@mui/icons-material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

// ✅ ENUMS FROM BACKEND
const CATEGORY_OPTIONS = [
  "Discipline",
  "Teamwork",
  "Performance",
  "Attitude",
  "Attendance Behavior",
  "Safety Compliance",
  "Production Attitude",
  "Supervisor Feedback",
  "Punctuality",
  "Quality of Work",
  "Initiative",
  "Communication"
];

const ACTION_OPTIONS = [
  "None",
  "Verbal Warning",
  "Written Warning",
  "Counseling",
  "Appreciation",
  "Recognition",
  "Improvement Plan",
  "Suspension",
  "Termination",
  "Coaching",
  "Final Warning"
];

const AddEmployeeBehavior = ({ open, onClose, onSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    employeeId: "",
    category: "",
    rating: 0,
    description: "",
    actionTaken: "None",
    reviewDate: "",
    isConfidential: false,
    tags: ""
  });

  const [attachments, setAttachments] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // ================= FETCH EMPLOYEES =================
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
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ================= AUTO TYPE =================
  const getType = rating => {
    if (rating >= 4) return "Positive";
    if (rating <= 2) return "Negative";
    return "Neutral";
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = e => {
    setAttachments(prev => [...prev, ...Array.from(e.target.files)]);
  };

  const removeFile = index => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append("employeeId", form.employeeId);
      formData.append("category", form.category);
      formData.append("rating", Number(form.rating));
      formData.append("type", getType(form.rating));
      formData.append("description", form.description);
      formData.append("actionTaken", form.actionTaken);
      formData.append("reviewDate", form.reviewDate);
      formData.append("isConfidential", form.isConfidential);
      formData.append("tags", form.tags);

      attachments.forEach(file => {
        formData.append("attachments", file);
      });

      await axios.post(
        `${BASE_URL}/api/employee-behavior`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setSnackbar({
        open: true,
        message: "Behavior added successfully!",
        severity: "success"
      });

      onSuccess();
      handleClose();

    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          "Failed to submit behavior",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setForm({
      employeeId: "",
      category: "",
      rating: 0,
      description: "",
      actionTaken: "None",
      reviewDate: "",
      isConfidential: false,
      tags: ""
    });
    setAttachments([]);
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add Employee Behavior
          <IconButton
            onClick={handleClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} mt={1}>

            {/* Employee */}
            <TextField
              select
              label="Employee"
              name="employeeId"
              value={form.employeeId}
              onChange={handleChange}
              fullWidth
              required
            >
              {employees.map(emp => (
                <MenuItem key={emp._id} value={emp._id}>
                  {emp.EmployeeID} - {emp.FirstName} {emp.LastName}
                </MenuItem>
              ))}
            </TextField>

            {/* Category ENUM */}
            <TextField
              select
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              fullWidth
              required
            >
              {CATEGORY_OPTIONS.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            {/* Rating */}
            <Box>
              <Typography variant="body2">Rating</Typography>
              <Rating
                value={form.rating}
                onChange={(e, newValue) =>
                  setForm({ ...form, rating: newValue })
                }
              />
              {form.rating > 0 && (
                <Chip
                  label={getType(form.rating)}
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>

            {/* Description */}
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              required
            />

            {/* Action ENUM */}
            <TextField
              select
              label="Action Taken"
              name="actionTaken"
              value={form.actionTaken}
              onChange={handleChange}
              fullWidth
            >
              {ACTION_OPTIONS.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            {/* Review Date */}
            <TextField
              type="date"
              label="Review Date"
              name="reviewDate"
              value={form.reviewDate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            {/* Confidential */}
            <FormControlLabel
              control={
                <Switch
                  checked={form.isConfidential}
                  onChange={e =>
                    setForm({
                      ...form,
                      isConfidential: e.target.checked
                    })
                  }
                />
              }
              label="Confidential"
            />

            {/* Tags */}
            <TextField
              label="Tags (comma separated)"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              fullWidth
            />

            {/* Attachments */}
            <Button
              variant="outlined"
              component="label"
              startIcon={<AttachFile />}
            >
              Upload Attachments
              <input
                type="file"
                hidden
                multiple
                onChange={handleFileChange}
              />
            </Button>

            {attachments.map((file, index) => (
              <Stack
                key={index}
                direction="row"
                justifyContent="space-between"
              >
                <Typography variant="caption">
                  {file.name}
                </Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={() => removeFile(index)}
                >
                  Remove
                </Button>
              </Stack>
            ))}

          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
              open={snackbar.open}
              autoHideDuration={3000}
              onClose={() => setSnackbar({...snackbar, open: false})}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert 
                onClose={() => setSnackbar({...snackbar, open: false})} 
                severity={snackbar.severity}
                variant="filled"
                sx={{ 
                  width: '100%',
                  borderRadius: 1.5,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
    </>
  );
};

export default AddEmployeeBehavior;