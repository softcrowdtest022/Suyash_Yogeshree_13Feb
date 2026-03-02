import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Rating,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Divider,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  Switch,
  FormControlLabel,
  Box
} from "@mui/material";
import { Close } from "@mui/icons-material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

const PRIMARY_GRADIENT =
  "linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)";

/* ================= ENUMS FROM BACKEND ================= */

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

const steps = ["Basic Info", "Details", "Attachments"];

const EditEmployeeBehavior = ({ open, onClose, behaviorId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [behavior, setBehavior] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [activeStep, setActiveStep] = useState(0);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const [form, setForm] = useState({
    category: "",
    rating: 0,
    description: "",
    actionTaken: "None",
    reviewDate: "",
    tags: "",
    isConfidential: false
  });

  /* ================= FETCH ================= */

  useEffect(() => {
    if (open && behaviorId) fetchBehavior();
  }, [open, behaviorId]);

  const fetchBehavior = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${BASE_URL}/api/employee-behavior/${behaviorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        const data = res.data.data;
        setBehavior(data);
        setAttachments(data.attachments || []);

        setForm({
          category: data.category,
          rating: data.rating,
          description: data.description,
          actionTaken: data.actionTaken,
          reviewDate: data.reviewDate?.split("T")[0] || "",
          tags: data.tags?.join(", ") || "",
          isConfidential: data.isConfidential
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= HELPERS ================= */

  const getType = rating => {
    if (rating >= 4) return "Positive";
    if (rating <= 2) return "Negative";
    return "Neutral";
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  /* ================= UPDATE ================= */

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.put(
        `${BASE_URL}/api/employee-behavior/${behaviorId}`,
        {
          category: form.category,
          rating: Number(form.rating),
          type: getType(form.rating),
          description: form.description,
          actionTaken: form.actionTaken,
          reviewDate: form.reviewDate,
          isConfidential: form.isConfidential,
          tags: form.tags
            ? form.tags.split(",").map(tag => tag.trim())
            : []
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      setSnackbar({
        open: true,
        message: "Behavior updated successfully",
        severity: "success"
      });

      if (onSuccess) onSuccess();
      onClose();

    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message || "Update failed",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ATTACHMENT ================= */

  const handleDeleteAttachment = async attachmentId => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${BASE_URL}/api/employee-behavior/${behaviorId}/attachments/${attachmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAttachments(prev =>
        prev.filter(att => att._id !== attachmentId)
      );

      setSnackbar({
        open: true,
        message: "Attachment deleted",
        severity: "success"
      });

    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to delete attachment",
        severity: "error"
      });
    }
  };

  /* ================= STEP CONTENT ================= */

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={3}>
            <TextField
              select
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              fullWidth
            >
              {CATEGORY_OPTIONS.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <Stack direction="row" spacing={2} alignItems="center">
              <Rating
                value={form.rating}
                onChange={(e, newValue) =>
                  setForm(prev => ({
                    ...prev,
                    rating: newValue
                  }))
                }
              />
              <Chip label={getType(form.rating)} />
            </Stack>

            <FormControlLabel
              control={
                <Switch
                  checked={form.isConfidential}
                  onChange={e =>
                    setForm(prev => ({
                      ...prev,
                      isConfidential: e.target.checked
                    }))
                  }
                />
              }
              label="Confidential"
            />
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <TextField
              label="Description"
              name="description"
              multiline
              rows={3}
              value={form.description}
              onChange={handleChange}
              fullWidth
            />

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

            <TextField
              type="date"
              name="reviewDate"
              value={form.reviewDate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Tags (comma separated)"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              fullWidth
            />
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={2}>
            <Typography fontWeight={600}>
              Attachments
            </Typography>

            {attachments.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No attachments available
              </Typography>
            )}

            {attachments.map(att => (
              <Box
                key={att._id}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2">
                  {att.originalName || att.filename}
                </Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={() =>
                    handleDeleteAttachment(att._id)
                  }
                >
                  Delete
                </Button>
              </Box>
            ))}
          </Stack>
        );

      default:
        return null;
    }
  };

  /* ================= UI ================= */

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            background: PRIMARY_GRADIENT,
            color: "#fff",
            fontWeight: 600
          }}
        >
          Edit Behavior
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", right: 10, top: 10, color: "#fff" }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ minHeight: 220 }}>
          {loading && !behavior ? (
            <Stack alignItems="center" py={5}>
              <CircularProgress />
            </Stack>
          ) : (
            <>
              <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
                {steps.map(label => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {renderStepContent()}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            disabled={activeStep === 0}
            onClick={() => setActiveStep(prev => prev - 1)}
          >
            Back
          </Button>

          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={() => setActiveStep(prev => prev + 1)}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={20} />
              ) : (
                "Save Changes"
              )}
            </Button>
          )}
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

export default EditEmployeeBehavior;