import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Stack,
  MenuItem,
  CircularProgress
} from "@mui/material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

const HEADER_GRADIENT =
  "linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)";

const ApplyLeave = ({ open, handleClose, onSuccess }) => {
  const userData = JSON.parse(localStorage.getItem("userData"));
const employeeId = userData?._id;
  const token = localStorage.getItem("token");

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [form, setForm] = useState({
    leaveTypeId: "",
    fromDate: "",
    toDate: "",
    reason: ""
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /* ================= FETCH LEAVE TYPES ================= */
  useEffect(() => {
    if (open) {
      fetchLeaveTypes();
    }
  }, [open]);
useEffect(() => {
  console.log("Leave Types:", leaveTypes);
}, [leaveTypes]);

  const fetchLeaveTypes = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${BASE_URL}/api/leavetypes`,   //  SAME AS MASTER
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const allLeaveTypes = response.data.data || [];

        // ✅ Only show active leave types
        const activeLeaveTypes = allLeaveTypes.filter(
          (type) => type.IsActive === true
        );

        setLeaveTypes(activeLeaveTypes);
      }
    } catch (err) {
      console.error("Failed to load leave types", err);
    }
  };


  /* ================= VALIDATION ================= */
  const validate = () => {
    let temp = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const from = form
    if (!form.leaveTypeId) temp.leaveTypeId = "Required";
    if (!form.fromDate) temp.fromDate = "Required";
    if (!form.toDate) temp.toDate = "Required";
    if (form.fromDate > form.toDate)
      temp.toDate = "To Date must be after From Date";
    if (!form.reason) temp.reason = "Required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      console.log("Submitting Data:", {
  ...form,
  employeeId
});

      await axios.post(
        `${BASE_URL}/api/leaves`,
        {
          ...form,
          employeeId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      onSuccess();
      handleClose();

      setForm({
        leaveTypeId: "",
        fromDate: "",
        toDate: "",
        reason: ""
      });
    } catch (err) {
      alert("Failed to apply leave");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" disableEnforceFocus >
      <DialogTitle
        sx={{
          background: HEADER_GRADIENT,
          color: "#fff",
          fontWeight: 600
        }}
      >
        Apply Leave
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3} mt={1}>

          {/* LEAVE TYPE DROPDOWN */}
          <TextField
            select
            label="Leave Type"
            value={form.leaveTypeId}
            onChange={(e) =>
              setForm({ ...form, leaveTypeId: e.target.value })
            }
            error={!!errors.leaveTypeId}
            helperText={errors.leaveTypeId}
            fullWidth
            size="small"
            SelectProps={{
              MenuProps: {
                keepMounted: true,   // ✅ important
              },
            }}
          >
            {leaveTypes.map((type) => (
              <MenuItem key={type._id} value={type._id}>
                {type.Name}
              </MenuItem>
            ))}
          </TextField>



          {/* DATE FIELDS */}
          <Stack direction="row" spacing={2}>
            <TextField
              type="date"
              label="From Date"
              InputLabelProps={{ shrink: true }}
              value={form.fromDate}
              onChange={(e) =>
                setForm({ ...form, fromDate: e.target.value })
              }
              error={!!errors.fromDate}
              helperText={errors.fromDate}
              fullWidth
            />

            <TextField
              type="date"
              label="To Date"
              InputLabelProps={{ shrink: true }}
              value={form.toDate}
              onChange={(e) =>
                setForm({ ...form, toDate: e.target.value })
              }
              error={!!errors.toDate}
              helperText={errors.toDate}
              fullWidth
            />
          </Stack>

          {/* REASON */}
          <TextField
            label="Reason"
            multiline
            rows={4}
            value={form.reason}
            onChange={(e) =>
              setForm({ ...form, reason: e.target.value })
            }
            error={!!errors.reason}
            helperText={errors.reason}
            fullWidth
          />

          {/* BUTTONS */}
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                background: HEADER_GRADIENT,
                fontWeight: 600
              }}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ color: "#fff" }} />
              ) : (
                "Submit"
              )}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyLeave;
