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
  Box
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

const DeletePieceRate = ({ open, onClose, pieceRate, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!pieceRate?._id) return;

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `${BASE_URL}/api/piece-rate-master/${pieceRate._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        onDelete(pieceRate._id);
        onClose();
      } else {
        setError(response.data.message || "Failed to delete piece rate");
      }
    } catch (err) {
      console.error("Error deleting piece rate:", err);
      setError(
        err.response?.data?.message ||
          "Failed to delete piece rate. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!pieceRate) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      {/* ===== HEADER ===== */}
      <DialogTitle
        sx={{
          borderBottom: "1px solid #E0E0E0",
          backgroundColor: "#FDEDED"
        }}
      >
        <Typography
          sx={{
            fontSize: "20px",
            fontWeight: 600,
            pt: 1
          }}
        >
          Confirm Delete Piece Rate
        </Typography>
      </DialogTitle>

      {/* ===== CONTENT ===== */}
      <DialogContent sx={{ pt: 3 }}>
        <Box mt={2}>
          <Stack spacing={2}>
            <Typography variant="body1">
              Are you sure you want to delete this piece rate record?
            </Typography>

            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Product:</strong> {pieceRate.productType}
              </Typography>

              <Typography variant="body2">
                <strong>Operation:</strong> {pieceRate.operation}
              </Typography>

              <Typography variant="body2">
                <strong>Rate:</strong> ₹ {pieceRate.ratePerUnit}
              </Typography>

              <Typography variant="body2">
                <strong>Skill Level:</strong> {pieceRate.skillLevel}
              </Typography>

              <Chip
                label={pieceRate.isActive ? "Active" : "Inactive"}
                size="small"
                color={pieceRate.isActive ? "success" : "default"}
                sx={{ width: "fit-content" }}
              />
            </Stack>

            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ mt: 1 }}
            >
              This action cannot be undone. The piece rate record will be permanently removed.
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{
                  borderRadius: 1,
                  "& .MuiAlert-icon": {
                    alignItems: "center"
                  }
                }}
              >
                {error}
              </Alert>
            )}
          </Stack>
        </Box>
      </DialogContent>

      {/* ===== ACTIONS ===== */}
      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          borderTop: "1px solid #E0E0E0",
          pt: 2,
          backgroundColor: "#F8FAFC"
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            borderRadius: 1,
            px: 3,
            textTransform: "none",
            fontWeight: 500
          }}
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
            borderRadius: 1,
            px: 3,
            textTransform: "none",
            fontWeight: 500,
            backgroundColor: "#D32F2F",
            "&:hover": {
              backgroundColor: "#C62828"
            }
          }}
        >
          {loading ? "Deleting..." : "Delete Piece Rate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeletePieceRate;