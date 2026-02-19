import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Chip,
  Divider,
  Grid
} from "@mui/material";

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString();
};

const ViewRegularization = ({ open, onClose, record }) => {
  if (!record) return null;

  const statusColor =
    record.Status === "Approved"
      ? "success"
      : record.Status === "Rejected"
      ? "error"
      : "warning";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle
        sx={{
          borderBottom: "1px solid #E0E0E0",
          backgroundColor: "#F8FAFC",
          fontWeight: 600
        }}
      >
        Regularization Request Details
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>

          {/* STATUS */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={600}>
              Status
            </Typography>
            <Chip
              label={record.Status}
              color={statusColor}
              size="medium"
            />
          </Stack>

          <Divider />

          <Grid container spacing={3}>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Request Date
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatDate(record.Date)}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Request Type
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {record.RequestType}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Requested In
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatDate(record.RequestedIn)}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Requested Out
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatDate(record.RequestedOut)}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Reason
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {record.Reason || "-"}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Supporting Document
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {record.SupportingDocument || "-"}
              </Typography>
            </Grid>

          </Grid>

          <Divider />

          {/* APPROVAL SECTION */}
          <Typography variant="h6" fontWeight={600}>
            Approval Details
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Approved At
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatDate(record.ApprovedAt)}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Approver ID
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {record.ApproverID || "-"}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Approval Remarks
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {record.ApprovalRemarks || "-"}
              </Typography>
            </Grid>
          </Grid>

          <Divider />

          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Created At
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatDate(record.CreatedAt)}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatDate(record.UpdatedAt)}
              </Typography>
            </Grid>
          </Grid>

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
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewRegularization;