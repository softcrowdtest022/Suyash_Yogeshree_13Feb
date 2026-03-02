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
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

const DeleteEmployeeBehavior = ({ open, onClose, behaviorId, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const handleDelete = async () => {
    if (!reason) {
      setSnackbar({
        open: true,
        message: "Deletion reason is required",
        severity: "error"
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.delete(
        `${BASE_URL}/api/employee-behavior/${behaviorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { deletionReason: reason }
        }
      );

      setSnackbar({
        open: true,
        message: "Behavior deleted successfully",
        severity: "success"
      });

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);

    } catch (err) {
      setSnackbar({
        open: true,
        message: "Delete failed",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Behavior</DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <Typography color="error">
              This action cannot be undone.
            </Typography>

            <TextField
              label="Deletion Reason"
              multiline
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              fullWidth
              required
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Delete"}
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

export default DeleteEmployeeBehavior;