import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Stack,
  Chip,
  Divider,
  CircularProgress
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Warning as WarningIcon
} from "@mui/icons-material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

const DeleteTermsAndCondition = ({ open, onClose, term, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!term?._id) return;

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `${BASE_URL}/api/terms-conditions/${term._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        onDelete(term._id);
        onClose();
      } else {
        setError(response.data.message || "Failed to delete term");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to delete term. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={!loading ? onClose : undefined} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <WarningIcon color="error" />
          <Typography fontWeight={600}>
            Confirm Delete
          </Typography>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          This action cannot be undone.
        </Alert>

        <Typography>
          Are you sure you want to delete term:
        </Typography>

        <Typography fontWeight={600} sx={{ mt: 1 }}>
          "{term?.Title}"
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Chip label={`#${term?.Sequence}`} />
          <Chip label={term?.Status} color="success" />
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>

        <Button
          variant="contained"
          color="error"
          startIcon={
            loading ? <CircularProgress size={18} color="inherit" /> : <DeleteIcon />
          }
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete Term"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteTermsAndCondition;