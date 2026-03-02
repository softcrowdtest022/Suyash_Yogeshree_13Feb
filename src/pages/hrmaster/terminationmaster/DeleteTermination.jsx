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
  Box,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

const DeleteTermination = ({
  open,
  onClose,
  termination,
  onDelete,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!termination?.terminationId) return;

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `${BASE_URL}/api/terminations/${termination.terminationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        onDelete(termination.terminationId);
        onClose();
      } else {
        setError(
          response.data.message ||
            "Failed to delete termination"
        );
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to delete termination. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!termination) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      {/* ===== HEADER ===== */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #7f1d1d, #dc2626)",
          color: "#fff",
          fontWeight: 600,
          fontSize: "20px",
        }}
      >
        Confirm Delete Termination
      </DialogTitle>

      {/* ===== CONTENT ===== */}
      <DialogContent sx={{ pt: 4 }}>
        <Stack spacing={2}>
          <Typography>
            Are you sure you want to delete this
            termination record?
          </Typography>

          <Box>
            <Typography variant="body2">
              <strong>Termination ID:</strong>{" "}
              {termination.terminationId}
            </Typography>

            <Typography variant="body2">
              <strong>Employee:</strong>{" "}
              {termination.employeeId?.FirstName}{" "}
              {termination.employeeId?.LastName}
            </Typography>

            <Typography variant="body2">
              <strong>Type:</strong>{" "}
              {termination.terminationType}
            </Typography>

            <Typography variant="body2">
              <strong>Last Working Day:</strong>{" "}
              {new Date(
                termination.lastWorkingDay
              ).toLocaleDateString("en-IN")}
            </Typography>

            <Chip
              label={termination.status}
              size="small"
              color={
                termination.status === "approved"
                  ? "success"
                  : termination.status === "rejected"
                  ? "error"
                  : "warning"
              }
              sx={{ mt: 1 }}
            />
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            ⚠ This action cannot be undone.
            The termination record will be
            permanently removed.
          </Typography>

          {error && (
            <Alert severity="error">{error}</Alert>
          )}
        </Stack>
      </DialogContent>

      {/* ===== ACTIONS ===== */}
      <DialogActions
        sx={{
          px: 3,
          pb: 3,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          disabled={loading}
          startIcon={!loading && <DeleteIcon />}
          sx={{
            background: "#dc2626",
            "&:hover": {
              background: "#b91c1c",
            },
          }}
        >
          {loading
            ? "Deleting..."
            : "Delete Termination"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteTermination;