import React from "react";
import { Dialog, DialogTitle, DialogContent, Typography, Stack } from "@mui/material";

export default function ViewLeave({ open, onClose, leave }) {
  if (!leave) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Leave Details</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Typography><b>Employee:</b> {leave.EmployeeName}</Typography>
          <Typography><b>Leave Type:</b> {leave.LeaveTypeName}</Typography>
          <Typography><b>From:</b> {new Date(leave.StartDate).toDateString()}</Typography>
          <Typography><b>To:</b> {new Date(leave.EndDate).toDateString()}</Typography>
          <Typography><b>Status:</b> {leave.Status}</Typography>
          <Typography><b>Reason:</b> {leave.Reason}</Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
