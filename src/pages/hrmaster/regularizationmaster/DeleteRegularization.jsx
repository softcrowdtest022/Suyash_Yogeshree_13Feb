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
  Chip
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

const DeleteRegularization = ({ open, onClose, record, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!record?._id) return;

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `${BASE_URL}/api/regularization/${record._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        onDelete(record._id);
        onClose();
      } else {
        setError(response.data.message || "Failed to delete request");
      }

    } catch (err) {
      console.error("Delete Error:", err.response?.data);
      setError(
        err.response?.data?.message ||
        "Failed to delete request"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!record) return null;

  return (
    <Dialog open={open} onClose={loading ? null : onClose} maxWidth="sm" fullWidth>

      <DialogTitle
        sx={{
          borderBottom: "1px solid #E0E0E0",
          backgroundColor: "#FDEDED",
          fontWeight: 600
        }}
      >
        Confirm Delete Regularization
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={2}>

          <Typography variant="body1">
            Are you sure you want to delete this regularization request?
          </Typography>

          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>Employee:</strong>{" "}
              {record.EmployeeID?.FirstName
                ? `${record.EmployeeID.FirstName} ${record.EmployeeID.LastName}`
                : "—"}
            </Typography>

            <Typography variant="body2">
              <strong>Date:</strong>{" "}
              {new Date(record.Date).toLocaleDateString()}
            </Typography>

            <Typography variant="body2">
              <strong>Request Type:</strong> {record.RequestType}
            </Typography>

            <Chip
              label={record.Status}
              size="small"
              color={
                record.Status === "Approved"
                  ? "success"
                  : record.Status === "Rejected"
                  ? "error"
                  : "warning"
              }
              sx={{ width: "fit-content" }}
            />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            This action cannot be undone.
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

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
          color="error"
          onClick={handleDelete}
          disabled={loading}
          startIcon={!loading && <DeleteIcon />}
        >
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteRegularization;
