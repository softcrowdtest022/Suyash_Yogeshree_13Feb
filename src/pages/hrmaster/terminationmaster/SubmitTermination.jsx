import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Stack,
  Alert,
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress,
  Box,
} from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

const HEADER_GRADIENT =
  "linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)";

const SubmitTermination = ({
  open,
  onClose,
  termination,
  onSubmitFeedback,
}) => {
  const [formData, setFormData] = useState({
    reasonForLeaving: "",
    experienceWithCompany: "",
    wouldRecommend: false,
    feedbackDetails: "",
    suggestionsForImprovement: "",
    rehireEligible: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!termination) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitch = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.reasonForLeaving)
      return setError("Reason for leaving is required");
    if (!formData.experienceWithCompany)
      return setError("Experience selection is required");
    if (!formData.feedbackDetails)
      return setError("Feedback details are required");

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${BASE_URL}/api/terminations/${termination.terminationId}/feedback`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        onSubmitFeedback(response.data.data);
        onClose();
        setFormData({
          reasonForLeaving: "",
          experienceWithCompany: "",
          wouldRecommend: false,
          feedbackDetails: "",
          suggestionsForImprovement: "",
          rehireEligible: false,
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit feedback"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      {/* HEADER */}
      <DialogTitle
        sx={{
          background: HEADER_GRADIENT,
          color: "#fff",
          fontWeight: 700,
          fontSize: 20,
        }}
      >
        Submit Exit Feedback
      </DialogTitle>

      <DialogContent sx={{ p: 3, margin: 2 }}>
        <Stack spacing={3}>
          {/* Termination ID */}
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Termination ID
            </Typography>
            <Typography fontWeight={600}>
              {termination.terminationId}
            </Typography>
          </Box>

          {/* Reason */}
          <TextField
            label="Reason for Leaving"
            name="reasonForLeaving"
            fullWidth
            value={formData.reasonForLeaving}
            onChange={handleChange}
          />

          {/* Experience Dropdown */}
          <TextField
            select
            label="Experience With Company"
            name="experienceWithCompany"
            fullWidth
            value={formData.experienceWithCompany}
            onChange={handleChange}
          >
            <MenuItem value="excellent">
              Excellent
            </MenuItem>
            <MenuItem value="good">
              Good
            </MenuItem>
            <MenuItem value="average">
              Average
            </MenuItem>
            <MenuItem value="poor">
              Poor
            </MenuItem>
          </TextField>

          {/* Switches */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.wouldRecommend}
                onChange={handleSwitch}
                name="wouldRecommend"
                color="primary"
              />
            }
            label="Would Recommend Company"
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.rehireEligible}
                onChange={handleSwitch}
                name="rehireEligible"
                color="primary"
              />
            }
            label="Eligible for Rehire"
          />

          {/* Feedback Details */}
          <TextField
            label="Detailed Feedback"
            name="feedbackDetails"
            multiline
            rows={3}
            fullWidth
            value={formData.feedbackDetails}
            onChange={handleChange}
          />

          <TextField
            label="Suggestions for Improvement"
            name="suggestionsForImprovement"
            multiline
            rows={3}
            fullWidth
            value={formData.suggestionsForImprovement}
            onChange={handleChange}
          />

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={
            !loading ? (
              <SendIcon />
            ) : (
              <CircularProgress
                size={18}
                color="inherit"
              />
            )
          }
          sx={{
            background: HEADER_GRADIENT,
            "&:hover": { opacity: 0.9 },
          }}
        >
          {loading
            ? "Submitting..."
            : "Submit Feedback"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubmitTermination;
