import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  MenuItem,
  Snackbar
} from '@mui/material';
import { AssignmentTurnedIn as AssignIcon } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const AssignShift = ({ open, onClose }) => {

  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);

  const [formData, setFormData] = useState({
    employeeId: '',
    shiftId: '',
    effectiveFrom: '',
    effectiveTo: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ Snackbar State
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // 🔥 Load Employees
  useEffect(() => {
    if (!open) return;

    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/api/employees`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setEmployees(res.data.data || []);
      } catch {
        setError('Failed to load employees');
      }
    };

    fetchEmployees();
  }, [open]);

  // 🔥 Load Shifts
  useEffect(() => {
    if (!open) return;

    const fetchShifts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/api/shifts`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setShifts(res.data.data || []);
      } catch {
        setError('Failed to load shifts');
      }
    };

    fetchShifts();
  }, [open]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async () => {

    if (!formData.employeeId)
      return setError('Please select employee');

    if (!formData.shiftId)
      return setError('Please select shift');

    if (!formData.effectiveFrom || !formData.effectiveTo)
      return setError('Please select effective dates');

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      // Format dates to ISO string with time set to start of day (00:00:00)
      const payload = {
        ...formData,
        effectiveFrom: new Date(formData.effectiveFrom).toISOString().split('T')[0] + 'T00:00:00.000Z',
        effectiveTo: new Date(formData.effectiveTo).toISOString().split('T')[0] + 'T00:00:00.000Z'
      };

      const res = await axios.post(
        `${BASE_URL}/api/shifts/assign`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (res.data.success) {

        // ✅ Show Success Snackbar
        setSnackbar({
          open: true,
          message: 'Shift assigned successfully!',
          severity: 'success'
        });

        handleClose();

      } else {
        setError(res.data.message || 'Failed to assign shift');
      }

    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Internal server error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      employeeId: '',
      shiftId: '',
      effectiveFrom: '',
      effectiveTo: ''
    });
    setError('');
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle
          sx={{
            borderBottom: '1px solid #E0E0E0',
            pb: 2,
            backgroundColor: '#F8FAFC'
          }}
        >
          <div
            style={{
              fontSize: '20px',
              fontWeight: 600,
              paddingTop: '8px'
            }}
          >
            Assign Shift to Employee
          </div>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3} sx={{ mt: 2 }}>

            <TextField
              select
              fullWidth
              label="Select Employee"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              required
            >
              {employees.map(emp => (
                <MenuItem key={emp._id} value={emp._id}>
                  {emp.FirstName} {emp.LastName}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Select Shift"
              name="shiftId"
              value={formData.shiftId}
              onChange={handleChange}
              required
            >
              {shifts.map(shift => (
                <MenuItem key={shift._id} value={shift._id}>
                  {shift.ShiftName} ({shift.StartTime} - {shift.EndTime})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              type="date"
              label="Effective From"
              name="effectiveFrom"
              value={formData.effectiveFrom}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              fullWidth
              type="date"
              label="Effective To"
              name="effectiveTo"
              value={formData.effectiveTo}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            borderTop: '1px solid #E0E0E0',
            pt: 2,
            backgroundColor: '#F8FAFC'
          }}
        >
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? null : <AssignIcon />}
            sx={{
              textTransform: 'none',
              backgroundColor: '#1976D2',
              '&:hover': { backgroundColor: '#1565C0' }
            }}
          >
            {loading ? 'Assigning...' : 'Assign Shift'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Snackbar Bottom Right */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AssignShift;