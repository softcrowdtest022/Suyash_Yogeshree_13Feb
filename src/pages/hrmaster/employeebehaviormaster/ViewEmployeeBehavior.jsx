import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Chip,
  Rating,
  Stack,
  CircularProgress,
  Box,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Avatar
} from "@mui/material";
import { Close, Lock } from "@mui/icons-material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

const PRIMARY_GRADIENT =
  "linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)";

const steps = ["Basic Info", "Behavior Details", "Attachments & Meta"];

const ViewEmployeeBehavior = ({ open, onClose, behaviorId }) => {
  const [behavior, setBehavior] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (open && behaviorId) fetchBehavior();
  }, [open, behaviorId]);

  const fetchBehavior = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${BASE_URL}/api/employee-behavior/${behaviorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setBehavior(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = date =>
    date ? new Date(date).toLocaleDateString("en-GB") : "-";

  const getStatusColor = status => {
    switch (status) {
      case "Resolved":
        return "#16a34a";
      case "Escalated":
        return "#dc2626";
      case "Closed":
        return "#475569";
      default:
        return "#f59e0b";
    }
  };

  const getInitials = (f, l) =>
    `${f?.[0] || ""}${l?.[0] || ""}`.toUpperCase();

  const renderStepContent = () => {
    if (!behavior) return null;

    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "#00B4D8", width: 56, height: 56 }}>
                {getInitials(
                  behavior.employeeId.FirstName,
                  behavior.employeeId.LastName
                )}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {behavior.employeeId.FirstName}{" "}
                  {behavior.employeeId.LastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {behavior.employeeId.EmployeeID}
                </Typography>
              </Box>
            </Stack>

            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Category
                </Typography>
                <Typography fontWeight={500}>
                  {behavior.category}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Review Date
                </Typography>
                <Typography fontWeight={500}>
                  {formatDate(behavior.reviewDate)}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Rating
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Rating value={behavior.rating} readOnly />
                  <Chip label={behavior.type} size="small" />
                </Stack>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={behavior.status}
                  sx={{
                    backgroundColor: getStatusColor(behavior.status),
                    color: "#fff"
                  }}
                />
              </Grid>
            </Grid>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Description
              </Typography>
              <Typography mt={1}>{behavior.description}</Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Action Taken
              </Typography>
              <Typography mt={1}>{behavior.actionTaken}</Typography>
            </Box>

            {behavior.tags?.length > 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Tags
                </Typography>
                <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                  {behavior.tags.map((tag, i) => (
                    <Chip key={i} label={tag} size="small" />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            {behavior.isConfidential && (
              <Chip
                icon={<Lock />}
                label="Confidential"
                color="error"
              />
            )}

            {behavior.attachments?.length > 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Attachments
                </Typography>
                <Stack spacing={1} mt={1}>
                  {behavior.attachments.map((file, i) => (
                    <Button
                      key={i}
                      variant="outlined"
                      href={`${BASE_URL}/${file.filePath}`}
                      target="_blank"
                      sx={{ justifyContent: "flex-start" }}
                    >
                      {file.originalName || file.filename}
                    </Button>
                  ))}
                </Stack>
              </Box>
            )}

            <Box>
              <Typography variant="caption" color="text.secondary">
                Submitted By: {behavior.submittedBy.Username}
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                Created At: {formatDate(behavior.createdAt)}
              </Typography>
            </Box>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          background: PRIMARY_GRADIENT,
          color: "#fff",
          fontWeight: 600
        }}
      >
        Behavior Details
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 10, top: 10, color: "#fff" }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ minHeight: 220 }}>
        {loading ? (
          <Stack alignItems="center" justifyContent="center" height="100%">
            <CircularProgress />
          </Stack>
        ) : behavior ? (
          <>
            <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
              {steps.map(label => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {renderStepContent()}
          </>
        ) : (
          <Typography>No data found</Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          disabled={activeStep === 0}
          onClick={() => setActiveStep(prev => prev - 1)}
        >
          Back
        </Button>

        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={() => setActiveStep(prev => prev + 1)}
          >
            Next
          </Button>
        ) : (
          <Button onClick={onClose}>Close</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ViewEmployeeBehavior;