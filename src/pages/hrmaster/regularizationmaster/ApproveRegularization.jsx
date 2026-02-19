import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  MenuItem,
  Alert,
  Snackbar,
  Typography
} from "@mui/material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

const ApproveRegularization = ({ open, onClose, record, onUpdate }) => {
  const [status, setStatus] = useState("Approved");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const handleSubmit = async () => {
    if (!remarks.trim()) {
      return setError("Remarks are required");
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${BASE_URL}/api/regularization/${record._id}/status`,
        {
          status,
          remarks
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: `Request ${status} successfully`,
          severity: "success"
        });

        onUpdate(response.data.data);
        onClose();
      } else {
        setError(response.data.message);
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to update request"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!record) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
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
          Approve / Reject Regularization
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>

            <Typography variant="body2" color="text.secondary">
              Request Date:{" "}
              {new Date(record.Date).toLocaleDateString()}
            </Typography>

            <TextField
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              fullWidth
              disabled={loading}
            >
              <MenuItem value="Approved">Approve</MenuItem>
              <MenuItem value="Rejected">Reject</MenuItem>
            </TextField>

            <TextField
              label="Remarks"
              multiline
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              fullWidth
              required
              disabled={loading}
            />

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

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
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              backgroundColor:
                status === "Approved" ? "#2E7D32" : "#D32F2F",
              "&:hover": {
                backgroundColor:
                  status === "Approved" ? "#1B5E20" : "#B71C1C"
              }
            }}
          >
            {loading
              ? "Updating..."
              : status === "Approved"
              ? "Approve"
              : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
              open={snackbar.open}
              autoHideDuration={3000}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
              <Alert severity={snackbar.severity} variant="filled">
                {snackbar.message}
              </Alert>
            </Snackbar>
    </>
  );
};

export default ApproveRegularization;