import React, { useEffect, useState } from "react";
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
  Paper,
  Box,
  Grid,
  CircularProgress,
  Alert
} from "@mui/material";

import {
  Gavel as GavelIcon,
  Description as DescriptionIcon,
  Edit as EditIcon
} from "@mui/icons-material";

import axios from "axios";
import BASE_URL from "../../../config/Config";

const ViewTermsAndConditions = ({ open, onClose, term, onEdit }) => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [termData, setTermData] = useState(null);

  /* ================= FETCH TERM BY ID ================= */

  useEffect(() => {
    if (open && term?._id) {
      fetchTermById(term._id);
    }
  }, [open, term]);

  const fetchTermById = async (id) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${BASE_URL}/api/terms-conditions/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        setTermData(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch term details");
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load term details"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (!term) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >

      {/* ================= Header ================= */}
      <DialogTitle
        sx={{
          borderBottom: "1px solid #E0E0E0",
          backgroundColor: "#F8FAFC",
          px: 3,
          py: 2
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <GavelIcon color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Terms & Condition Details
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Sequence #{termData?.Sequence}
              </Typography>
            </Box>
          </Stack>

          <Chip
            label="Active"
            sx={{
              bgcolor: "#D1FAE5",
              color: "#065F46",
              border: "1px solid #34D399",
              fontWeight: 600
            }}
          />
        </Stack>
      </DialogTitle>

      {/* ================= Content ================= */}
      <DialogContent sx={{ p: 4 }}>

        {loading && (
          <Stack alignItems="center" py={4}>
            <CircularProgress />
          </Stack>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && termData && (
          <Stack spacing={4}>

          
            <Paper sx={{ p: 3, borderRadius: 2, bgcolor: "#F8FAFC" }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <DescriptionIcon color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Title
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {termData.Title}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>
                Description
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {termData.Description}
              </Typography>
            </Paper>

          
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                System Information
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(termData.createdAt)}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Updated At
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(termData.updatedAt)}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Term ID
                    </Typography>
                    <Typography variant="body2">
                      {termData._id}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

          </Stack>
        )}
      </DialogContent>

      {/* ================= Footer ================= */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid #E0E0E0",
          backgroundColor: "#F8FAFC"
        }}
      >
        <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 500 }}>
          Close
        </Button>

        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => {
            onClose();
            onEdit && onEdit(termData);
          }}
          sx={{
            textTransform: "none",
            fontWeight: 500,
            borderRadius: 2,
            background: "linear-gradient(90deg,#0f766e,#0ea5e9)"
          }}
        >
          Edit Term
        </Button>
      </DialogActions>

    </Dialog>
  );
};

export default ViewTermsAndConditions;