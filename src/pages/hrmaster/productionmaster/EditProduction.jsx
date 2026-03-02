import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Box,
  Paper,
  MenuItem,
  Typography,
  Divider,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

const steps = ["Units Adjustment", "Bonuses & Status"];

const EditProduction = ({ open, onClose, production, onUpdate }) => {
  const [formData, setFormData] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (production) {
      setFormData({
        goodUnits: production.GoodUnits || 0,
        rejectedUnits: production.RejectedUnits || 0,
        reworkUnits: production.ReworkUnits || 0,
        qualityBonus: production.QualityBonus || 0,
        efficiencyBonus: production.EfficiencyBonus || 0,
        status: production.Status || "Pending",
        remarks: production.Remarks || "",
      });
    }
  }, [production]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ===== Live Calculations ===== */

  const netUnits = useMemo(() => {
    return Number(formData.goodUnits || 0);
  }, [formData.goodUnits]);

  const estimatedEarnings = useMemo(() => {
    const rate = Number(production?.RatePerUnit || 0);
    return (
      netUnits * rate +
      Number(formData.qualityBonus || 0) +
      Number(formData.efficiencyBonus || 0)
    );
  }, [
    netUnits,
    formData.qualityBonus,
    formData.efficiencyBonus,
    production,
  ]);

  /* ===== Submit ===== */

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const payload = {
        status: formData.status,
        GoodUnits: Number(formData.goodUnits),
        RejectedUnits: Number(formData.rejectedUnits),
        ReworkUnits: Number(formData.reworkUnits),
        QualityBonus: Number(formData.qualityBonus),
        EfficiencyBonus: Number(formData.efficiencyBonus),
        Remarks: formData.remarks,
      };

      const response = await axios.put(
        `${BASE_URL}/api/production/${production._id}/approve`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        onUpdate(response.data.data);
        onClose();
      } else {
        setError(response.data.message || "Update failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!production) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* HEADER */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg,#164e63,#0ea5e9)",
          color: "#fff",
          fontWeight: 600,
        }}
      >
        Edit Production – {production.employeeName}
      </DialogTitle>

      {/* STEPPER */}
      <Box sx={{ px: 4, pt: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((step) => (
            <Step key={step}>
              <StepLabel>{step}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent sx={{ px: 4, py: 3 }}>

        {/* STEP 1 — Units Adjustment */}
        {activeStep === 0 && (
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "#f8fafc" }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Good Units"
                  name="goodUnits"
                  value={formData.goodUnits}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Rejected Units"
                  name="rejectedUnits"
                  value={formData.rejectedUnits}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Rework Units"
                  name="reworkUnits"
                  value={formData.reworkUnits}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body2">
              Net Units: <strong>{netUnits}</strong>
            </Typography>
          </Paper>
        )}

        {/* STEP 2 — Bonuses & Status */}
        {activeStep === 1 && (
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "#f8fafc" }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quality Bonus"
                  name="qualityBonus"
                  value={formData.qualityBonus}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Efficiency Bonus"
                  name="efficiencyBonus"
                  value={formData.efficiencyBonus}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body2">
              Estimated Earnings:{" "}
              <strong style={{ color: "#16a34a" }}>
                ₹ {estimatedEarnings.toLocaleString("en-IN")}
              </strong>
            </Typography>
          </Paper>
        )}

        {error && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
      </DialogContent>

      {/* ACTIONS */}
      <DialogActions sx={{ px: 4, pb: 3 }}>
        <Button onClick={onClose}>Cancel</Button>

        {activeStep > 0 && (
          <Button onClick={() => setActiveStep((prev) => prev - 1)}>
            Back
          </Button>
        )}

        {activeStep < 1 ? (
          <Button
            variant="contained"
            onClick={() => setActiveStep((prev) => prev + 1)}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Production"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EditProduction;
