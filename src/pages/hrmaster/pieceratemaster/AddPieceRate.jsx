import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

const AddPieceRate = ({ open, onClose, onAdd }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState([]);
  const [deptLoading, setDeptLoading] = useState(false);

  const initialState = {
    productType: "",
    operation: "",
    ratePerUnit: "",
    uom: "piece",
    skillLevel: "Unskilled",
    departmentId: "",
    effectiveFrom: "",
    effectiveTo: "",
    isActive: true,
  };

  const [formData, setFormData] = useState(initialState);

  /* ================= FETCH DEPARTMENTS ================= */

  useEffect(() => {
    if (open) {
      fetchDepartments();
    }
  }, [open]);

  const fetchDepartments = async () => {
    try {
      setDeptLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(`${BASE_URL}/api/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const deptList = res.data.data || [];

        setDepartments(deptList);

        // ✅ Only set default AFTER departments exist
        if (deptList.length > 0) {
          setFormData((prev) => ({
            ...prev,
            departmentId: "",
          }));

          // Delay ensures options render first
          setTimeout(() => {
            setFormData((prev) => ({
              ...prev,
              departmentId: String(deptList[0]._id),
            }));
          }, 0);
        }
      }
    } catch (err) {
      console.log("Department fetch error:", err);
    } finally {
      setDeptLoading(false);
    }
  };

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "departmentId" ? String(value) : value,
    }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!formData.productType) return setError("Product Type is required");
    if (!formData.operation) return setError("Operation is required");
    if (!formData.ratePerUnit) return setError("Rate Per Unit is required");
    if (!formData.effectiveFrom)
      return setError("Effective From date is required");

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const payload = {
        productType: formData.productType.trim(),
        operation: formData.operation.trim(),
        ratePerUnit: Number(formData.ratePerUnit),
        uom: formData.uom,
        skillLevel: formData.skillLevel,
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo || null,
        isActive: true,
        departmentId: formData.departmentId || null,
      };

      const res = await axios.post(
        `${BASE_URL}/api/piece-rate-master`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (res.data.success) {
        onAdd(res.data.data);
        setFormData(initialState);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create piece rate");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #164e63, #00B4D8)",
          color: "#fff",
          fontWeight: 600,
        }}
      >
        Add Piece Rate
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box
          sx={{
            border: "1px solid #e0e0e0",
            borderRadius: 3,
            p: 4,
            margin: 1,
            backgroundColor: "#fafafa",
          }}
        >
          <Typography variant="h6" mb={2} fontWeight={600}>
            Piece Rate Details
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Product Type"
                name="productType"
                fullWidth
                value={formData.productType}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Operation"
                name="operation"
                fullWidth
                value={formData.operation}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                type="number"
                label="Rate Per Unit"
                name="ratePerUnit"
                fullWidth
                value={formData.ratePerUnit}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Unit of Measure"
                name="uom"
                fullWidth
                value={formData.uom}
                onChange={handleChange}
              >
                <MenuItem value="piece">Piece</MenuItem>
                <MenuItem value="dozen">Dozen</MenuItem>
                <MenuItem value="kg">Kg</MenuItem>
                <MenuItem value="meter">Meter</MenuItem>
                <MenuItem value="hour">Hour</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Skill Level"
                name="skillLevel"
                fullWidth
                value={formData.skillLevel}
                onChange={handleChange}
              >
                <MenuItem value="Unskilled">Unskilled</MenuItem>
                <MenuItem value="Semi-Skilled">Semi-Skilled</MenuItem>
                <MenuItem value="Skilled">Skilled</MenuItem>
                <MenuItem value="Highly Skilled">Highly Skilled</MenuItem>
              </TextField>
            </Grid>

            {/* ✅ Department */}
            <Grid item xs={12}>
              <TextField
                select
                label="Department"
                name="departmentId"
                fullWidth
                value={formData.departmentId || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    departmentId: String(e.target.value),
                  }))
                }
                SelectProps={{
                  MenuProps: { disablePortal: true },
                }}
              >
                {deptLoading && (
                  <MenuItem disabled>
                    <CircularProgress size={18} />
                  </MenuItem>
                )}

                {!deptLoading &&
                  departments.map((dept) => (
                    <MenuItem key={dept._id} value={String(dept._id)}>
                      {dept.DepartmentName}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                type="date"
                label="Effective From"
                name="effectiveFrom"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.effectiveFrom}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                type="date"
                label="Effective To"
                name="effectiveTo"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.effectiveTo}
                onChange={handleChange}
              />
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 3 }}>
        <Button onClick={onClose}>Cancel</Button>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            background: "linear-gradient(135deg, #164e63, #00B4D8)",
            px: 4,
          }}
        >
          {loading ? "Saving..." : "Create Piece Rate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPieceRate;