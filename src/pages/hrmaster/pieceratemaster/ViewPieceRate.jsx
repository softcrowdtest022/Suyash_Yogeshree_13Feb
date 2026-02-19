import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Chip,
  Typography,
  Divider,
  Paper,
  Box,
} from "@mui/material";

const ViewPieceRate = ({ open, onClose, pieceRate }) => {
  if (!pieceRate) return null;

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN");
  };

  const getDepartmentName = () => {
    if (!pieceRate.departmentId) return "Not Assigned";

    if (typeof pieceRate.departmentId === "object") {
      return pieceRate.departmentId.DepartmentName || "Not Assigned";
    }

    return pieceRate.departmentId;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg,#164e63,#0ea5e9)",
          color: "#fff",
          fontWeight: 600,
          fontSize: 20,
        }}
      >
        View Piece Rate
      </DialogTitle>

      <DialogContent sx={{ p: 1 }}>
        <Paper sx={{ p: 2, borderRadius: 3, margin: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Piece Rate Details
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Product Type"
                fullWidth
                value={pieceRate.productType || "-"}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Operation"
                fullWidth
                value={pieceRate.operation || "-"}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Rate Per Unit"
                fullWidth
                value={`₹ ${pieceRate.ratePerUnit}`}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Unit of Measure"
                fullWidth
                value={pieceRate.uom}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Skill Level"
                fullWidth
                value={pieceRate.skillLevel}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Department"
                fullWidth
                value={getDepartmentName()}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Effective From"
                fullWidth
                value={formatDate(pieceRate.effectiveFrom)}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Effective To"
                fullWidth
                value={formatDate(pieceRate.effectiveTo)}
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 3 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewPieceRate;