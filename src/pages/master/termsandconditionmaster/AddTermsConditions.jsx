import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert
} from "@mui/material";
import { Add } from "@mui/icons-material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

const AddTermAndCondition = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    Title: "",
    Description: "",
    Sequence: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (!formData.Title.trim()) {
      setError("Title is required");
      return;
    }

    if (!formData.Description.trim()) {
      setError("Description is required");
      return;
    }

    if (!formData.Sequence) {
      setError("Sequence number is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${BASE_URL}/api/terms-conditions`,
        {
          Title: formData.Title,
          Description: formData.Description,
          Sequence: Number(formData.Sequence)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        onSuccess(response.data.data);
        onClose();
        setFormData({
          Title: "",
          Description: "",
          Sequence: ""
        });
      } else {
        setError(response.data.message || "Failed to add term");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Term & Condition</DialogTitle>

      <DialogContent>
        <Stack spacing={3} mt={1}>
          <TextField
            label="Title"
            name="Title"
            value={formData.Title}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            label="Description"
            name="Description"
            value={formData.Description}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
            required
          />

          <TextField
            label="Sequence"
            name="Sequence"
            type="number"
            value={formData.Sequence}
            onChange={handleChange}
            fullWidth
            required
          />

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Term"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTermAndCondition;