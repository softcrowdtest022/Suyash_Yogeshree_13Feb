import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Chip,
  Paper,
  Divider,
  Box,
} from "@mui/material";

const HEADER_GRADIENT = "linear-gradient(135deg, #0B3B4B, #127D9E)";

const ViewProduction = ({ open, onClose, production }) => {
  if (!production) return null;

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-";

  const formatDateTime = (date) =>
    date ? new Date(date).toLocaleString("en-IN") : "-";

  const getEmployeeName = () => {
    if (production.employeeName) return production.employeeName;
    if (production.EmployeeID) {
      if (production.EmployeeID.FullName)
        return production.EmployeeID.FullName;

      return `${production.EmployeeID.FirstName || ""} ${
        production.EmployeeID.LastName || ""
      }`.trim();
    }
    return "N/A";
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "paid":
        return "info";
      default:
        return "warning";
    }
  };

  const totalUnits = production.totalUnits || 0;
  const goodUnits = production.goodUnits || production.GoodUnits || 0;
  const rejectedUnits =
    production.rejectedUnits || production.RejectedUnits || 0;

  const earnings =
    production.TotalAmount ||
    production.DailyEarning ||
    production.earnings ||
    0;

  const quality =
    totalUnits > 0
      ? ((goodUnits / totalUnits) * 100).toFixed(1)
      : "0";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle
        sx={{
          background: HEADER_GRADIENT,
          color: "#fff",
          fontWeight: 700,
          fontSize: 20,
          py: 2,
          px: 3,
          letterSpacing: 0.5,
        }}
      >
        Production Details
      </DialogTitle>

      <DialogContent
        sx={{
          p: 3,
          bgcolor: "#F4F6F8",
        }}
      >
        {/* EMPLOYEE INFO */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 2,
            borderRadius: 3,
            border: "1px solid #E5E7EB",
            bgcolor: "#FFFFFF",
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{  color: "#0B3B4B" }}
          >
            Employee Information
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Typography variant="body1" fontWeight={600}>
                {getEmployeeName()}
              </Typography>
            </Grid>

            <Grid item xs={4} textAlign="right">
              <Typography variant="body2" color="text.secondary">
                {formatDate(production.Date || production.date)}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Product
              </Typography>
              <Typography fontWeight={600}>
                {production.ProductName || production.productName}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Operation
              </Typography>
              <Typography fontWeight={600}>
                {production.Operation || production.operation}
              </Typography>
            </Grid>

            <Grid item xs={12} textAlign="right">
              <Chip
                label={
                  production.Status ||
                  production.status ||
                  "Pending"
                }
                color={getStatusColor(
                  production.Status || production.status
                )}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* UNITS SUMMARY */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 2,
            borderRadius: 3,
            border: "1px solid #E5E7EB",
            bgcolor: "#FFFFFF",
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ mb: 1, color: "#0B3B4B" }}
          >
            Units Summary
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={3}>
              <Typography variant="caption" color="text.secondary">
                TOTAL
              </Typography>
              <Typography fontWeight={700} fontSize={18}>
                {totalUnits}
              </Typography>
            </Grid>

            <Grid item xs={3}>
              <Typography variant="caption" color="text.secondary">
                GOOD
              </Typography>
              <Typography
                fontWeight={700}
                fontSize={18}
                sx={{ color: "#059669" }}
              >
                {goodUnits}
              </Typography>
            </Grid>

            <Grid item xs={3}>
              <Typography variant="caption" color="text.secondary">
                REJECTED
              </Typography>
              <Typography
                fontWeight={700}
                fontSize={18}
                sx={{ color: "#DC2626" }}
              >
                {rejectedUnits}
              </Typography>
            </Grid>

            <Grid item xs={3}>
              <Typography variant="caption" color="text.secondary">
                QUALITY
              </Typography>
              <Typography fontWeight={700} fontSize={18}>
                {quality}%
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1.5 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Rate per Unit
                </Typography>
                <Typography fontWeight={700} fontSize={18}>
                  ₹{production.ratePerUnit || 0}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* EARNINGS */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            background: HEADER_GRADIENT,
            color: "#fff",
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ opacity: 0.9 }}
          >
            Total Earnings
          </Typography>

          <Typography fontWeight={800} fontSize={28} sx={{ mb: 2 }}>
            ₹{earnings.toFixed(2)}
          </Typography>

          <Divider
            sx={{ my: 2, borderColor: "rgba(255,255,255,0.3)" }}
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography
                variant="caption"
                sx={{ opacity: 0.7 }}
              >
                CREATED
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatDateTime(production.createdAt)}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography
                variant="caption"
                sx={{ opacity: 0.7 }}
              >
                UPDATED
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatDateTime(production.updatedAt)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 2,
          bgcolor: "#F4F6F8",
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          fullWidth
          sx={{
            background: HEADER_GRADIENT,
            py: 1.2,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: "none",
            fontSize: 15,
            "&:hover": {
              background:
                "linear-gradient(135deg, #127D9E 0%, #0B3B4B 100%)",
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewProduction;
