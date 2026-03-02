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
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";
import { CheckCircle as ApproveIcon } from "@mui/icons-material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

const HEADER_GRADIENT =
  "linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)";

const ApproveTermination = ({
  open,
  onClose,
  termination,
  onApprove,
}) => {
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!termination) return null;

  const handleApprove = async () => {
    if (!comments.trim())
      return setError("Approval comments are required");

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${BASE_URL}/api/terminations/${termination.terminationId}/approve`,
        { comments },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        onApprove(response.data.data);
        onClose();
        setComments("");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to approve termination"
      );
    } finally {
      setLoading(false);
    }
  };

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
        }}
      >
        Approve Termination
      </DialogTitle>

      <DialogContent sx={{ p: 3, margin: 2 }}>
        <Stack spacing={3}>
          {/* Termination Info */}
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Termination ID
            </Typography>
            <Typography fontWeight={600}>
              {termination.terminationId}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Employee
            </Typography>
            <Typography fontWeight={600}>
              {termination.employeeId?.FirstName}{" "}
              {termination.employeeId?.LastName}
            </Typography>
          </Box>

          {/* Comments Field */}
          <TextField
            label="Approval Comments"
            multiline
            rows={4}
            fullWidth
            value={comments}
            onChange={(e) =>
              setComments(e.target.value)
            }
            placeholder="Enter approval remarks..."
          />

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleApprove}
          disabled={loading}
          startIcon={
            !loading ? (
              <ApproveIcon />
            ) : (
              <CircularProgress
                size={18}
                color="inherit"
              />
            )
          }
          sx={{
            background: HEADER_GRADIENT,
            "&:hover": { opacity: 0.9 },
          }}
        >
          {loading ? "Approving..." : "Approve"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApproveTermination;
