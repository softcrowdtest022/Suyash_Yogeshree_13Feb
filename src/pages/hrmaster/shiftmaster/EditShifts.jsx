import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  Checkbox,
  FormControlLabel,
  Typography,
  Snackbar,
  Paper,
  MenuItem,
  CircularProgress,
  Autocomplete,
  Chip
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const EditShifts = ({ open, onClose, shift, onUpdate }) => {
  const [formData, setFormData] = useState({
    ShiftName: '',
    Code: '',
    StartTime: '',
    EndTime: '',
    GracePeriod: '',
    LateThreshold: '',
    BreakDuration: '',
    OvertimeRules: {
      DailyThreshold: '',
      WeeklyThreshold: '',
      RateMultiplier: ''
    },
    ApplicableDepartments: [],
    IsActive: true
  });

  // Department dropdown state
  const [departments, setDepartments] = useState([]);
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [departmentPage, setDepartmentPage] = useState(1);
  const [departmentTotalPages, setDepartmentTotalPages] = useState(1);
  const [departmentInputValue, setDepartmentInputValue] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch departments from API
  const fetchDepartments = async (search = '', page = 1) => {
    setDepartmentLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/departments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          page: page,
          limit: 10,
          search: search
        }
      });

      if (response.data.success) {
        if (page === 1) {
          setDepartments(response.data.data || []);
        } else {
          setDepartments(prev => [...prev, ...(response.data.data || [])]);
        }
        setDepartmentTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    } finally {
      setDepartmentLoading(false);
    }
  };

  // Load departments when dropdown opens
  useEffect(() => {
    if (departmentOpen) {
      fetchDepartments(departmentSearch, 1);
    }
  }, [departmentOpen]);

  // Search departments with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (departmentOpen) {
        setDepartmentPage(1);
        fetchDepartments(departmentSearch, 1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [departmentSearch, departmentOpen]);

  // Handle department scroll load more
  const handleDepartmentScroll = (event) => {
    const listboxNode = event.currentTarget;
    if (listboxNode.scrollTop + listboxNode.clientHeight >= listboxNode.scrollHeight - 50) {
      if (departmentPage < departmentTotalPages && !departmentLoading) {
        const nextPage = departmentPage + 1;
        setDepartmentPage(nextPage);
        fetchDepartments(departmentSearch, nextPage);
      }
    }
  };

  // 🔥 Load shift data and map department IDs to objects
  useEffect(() => {
    const loadShiftData = async () => {
      if (shift) {
        // First set basic shift data
        setFormData({
          ShiftName: shift.ShiftName || '',
          Code: shift.Code || '',
          StartTime: shift.StartTime || '',
          EndTime: shift.EndTime || '',
          GracePeriod: shift.GracePeriod?.toString() || '',
          LateThreshold: shift.LateThreshold?.toString() || '',
          BreakDuration: shift.BreakDuration?.toString() || '',
          OvertimeRules: {
            DailyThreshold: shift.OvertimeRules?.DailyThreshold?.toString() || '',
            WeeklyThreshold: shift.OvertimeRules?.WeeklyThreshold?.toString() || '',
            RateMultiplier: shift.OvertimeRules?.RateMultiplier?.toString() || ''
          },
          ApplicableDepartments: [],
          IsActive: shift.IsActive ?? true
        });

        // If there are department IDs, fetch department details
        if (shift.ApplicableDepartments && shift.ApplicableDepartments.length > 0) {
          try {
            const token = localStorage.getItem('token');
            // Fetch all departments first
            const response = await axios.get(`${BASE_URL}/api/departments`, {
              headers: {
                'Authorization': `Bearer ${token}`
              },
              params: {
                limit: 100 // Get a good number of departments
              }
            });

            if (response.data.success) {
              const allDepartments = response.data.data || [];
              
              // Map department IDs to actual department objects
              const selectedDepartments = allDepartments.filter(dept => 
                shift.ApplicableDepartments.includes(dept._id)
              );
              
              setFormData(prev => ({
                ...prev,
                ApplicableDepartments: selectedDepartments
              }));
            }
          } catch (err) {
            console.error('Error fetching department details:', err);
          }
        }
      }
    };

    loadShiftData();
  }, [shift]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOvertimeChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      OvertimeRules: {
        ...prev.OvertimeRules,
        [name]: value
      }
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    if (value === '' || /^\d+$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async () => {
    if (!formData.ShiftName.trim()) {
      setError('Shift name is required');
      return;
    }

    if (!formData.Code.trim()) {
      setError('Shift code is required');
      return;
    }

    if (!formData.StartTime || !formData.EndTime) {
      setError('Start and End time are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      // Prepare department IDs for submission
      const departmentIds = formData.ApplicableDepartments.map(dept => dept._id);

      const payload = {
        ShiftName: formData.ShiftName,
        Code: formData.Code,
        StartTime: formData.StartTime,
        EndTime: formData.EndTime,
        GracePeriod: Number(formData.GracePeriod || 0),
        LateThreshold: Number(formData.LateThreshold || 0),
        BreakDuration: Number(formData.BreakDuration || 0),
        OvertimeRules: {
          DailyThreshold: Number(formData.OvertimeRules.DailyThreshold || 0),
          WeeklyThreshold: Number(formData.OvertimeRules.WeeklyThreshold || 0),
          RateMultiplier: Number(formData.OvertimeRules.RateMultiplier || 1)
        },
        ApplicableDepartments: departmentIds,
        IsActive: formData.IsActive
      };

      const response = await axios.put(
        `${BASE_URL}/api/shifts/${shift._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        showSnackbar('Shift updated successfully', 'success');
        onUpdate(response.data.data);

        // Close modal after small delay so user sees success
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setError(response.data.message || 'Failed to update shift');
      }
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || 'Failed to update shift',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 1.5,
            maxHeight: '95vh'
          }
        }}
      >
        <DialogTitle sx={{
          borderBottom: '1px solid #E0E0E0',
          py: 1.5,
          px: 2,
          backgroundColor: '#F8FAFC'
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#101010' }}>
            Edit Shift
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={2}>
            {/* Basic Information Section */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                 Basic Information
              </Typography>
              
              <Stack spacing={2}>
                {/* First Row - Shift Name and Code */}
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Shift Name *"
                    name="ShiftName"
                    value={formData.ShiftName}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Morning Shift"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Shift Code *"
                    name="Code"
                    value={formData.Code}
                    onChange={handleChange}
                    required
                    placeholder="e.g., MORN"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Stack>

                {/* Second Row - Start Time and End Time */}
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="time"
                    label="Start Time *"
                    name="StartTime"
                    InputLabelProps={{ shrink: true }}
                    value={formData.StartTime}
                    onChange={handleChange}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="time"
                    label="End Time *"
                    name="EndTime"
                    InputLabelProps={{ shrink: true }}
                    value={formData.EndTime}
                    onChange={handleChange}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Stack>
              </Stack>
            </Paper>

            {/* Timing Rules Section */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                 Timing Rules
              </Typography>
              
              <Stack spacing={2}>
                {/* Third Row - Grace Period, Late Threshold, Break Duration */}
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Grace Period (min)"
                    name="GracePeriod"
                    value={formData.GracePeriod}
                    onChange={handleNumberChange}
                    placeholder="0"
                    inputProps={{ min: 0 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Late Threshold (min)"
                    name="LateThreshold"
                    value={formData.LateThreshold}
                    onChange={handleNumberChange}
                    placeholder="0"
                    inputProps={{ min: 0 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Break Duration (min)"
                    name="BreakDuration"
                    value={formData.BreakDuration}
                    onChange={handleNumberChange}
                    placeholder="0"
                    inputProps={{ min: 0 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Stack>
              </Stack>
            </Paper>

            {/* Overtime & Department Section */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                 Overtime & Department
              </Typography>
              
              <Stack spacing={2}>
                {/* Fourth Row - Overtime Rules */}
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Daily Threshold"
                    name="DailyThreshold"
                    value={formData.OvertimeRules.DailyThreshold}
                    onChange={handleOvertimeChange}
                    placeholder="Hours"
                    inputProps={{ min: 0, step: 0.5 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Weekly Threshold"
                    name="WeeklyThreshold"
                    value={formData.OvertimeRules.WeeklyThreshold}
                    onChange={handleOvertimeChange}
                    placeholder="Hours"
                    inputProps={{ min: 0, step: 0.5 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Rate Multiplier"
                    name="RateMultiplier"
                    value={formData.OvertimeRules.RateMultiplier}
                    onChange={handleOvertimeChange}
                    placeholder="1.5"
                    inputProps={{ step: "0.1", min: 1 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Stack>

                {/* Fifth Row - Department Assignment */}
                <Autocomplete
                  multiple
                  size="small"
                  id="departments-autocomplete"
                  open={departmentOpen}
                  onOpen={() => setDepartmentOpen(true)}
                  onClose={() => setDepartmentOpen(false)}
                  options={departments}
                  loading={departmentLoading}
                  value={formData.ApplicableDepartments}
                  onChange={(event, newValue) => {
                    setFormData(prev => ({ ...prev, ApplicableDepartments: newValue }));
                  }}
                  inputValue={departmentInputValue}
                  onInputChange={(event, newInputValue) => {
                    setDepartmentInputValue(newInputValue);
                    setDepartmentSearch(newInputValue);
                  }}
                  getOptionLabel={(option) => option?.DepartmentName || ''}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Applicable Departments"
                      placeholder="Select departments"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1
                        }
                      }}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {departmentLoading ? <CircularProgress size={16} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <MenuItem {...props} key={option._id} sx={{ py: 0.5 }}>
                      <Typography variant="body2">{option.DepartmentName}</Typography>
                    </MenuItem>
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option.DepartmentName}
                        size="small"
                        {...getTagProps({ index })}
                        sx={{
                          backgroundColor: '#E3F2FD',
                          borderColor: '#1976D2',
                          '& .MuiChip-label': {
                            color: '#1976D2',
                            fontSize: '0.75rem'
                          },
                          '& .MuiChip-deleteIcon': {
                            color: '#1976D2',
                            fontSize: '16px',
                            '&:hover': {
                              color: '#1565C0'
                            }
                          }
                        }}
                      />
                    ))
                  }
                  ListboxProps={{
                    onScroll: handleDepartmentScroll,
                    style: { maxHeight: 200 }
                  }}
                />

                {/* Sixth Row - Active Checkbox */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.IsActive}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          IsActive: e.target.checked
                        }))
                      }
                      size="small"
                      sx={{
                        color: '#1976D2',
                        '&.Mui-checked': {
                          color: '#1976D2',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: '#333' }}>
                      Active (Shift is currently in use)
                    </Typography>
                  }
                />
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>

        <DialogActions sx={{
          px: 2,
          py: 1.5,
          borderTop: '1px solid #E0E0E0',
          backgroundColor: '#F8FAFC',
          gap: 1
        }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            size="small"
            sx={{ color: '#666' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            size="small"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <EditIcon />}
            sx={{
              backgroundColor: '#1976D2',
              '&:hover': { backgroundColor: '#1565C0' }
            }}
          >
            {loading ? 'Updating...' : 'Update Shift'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔥 Snackbar Bottom Right */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 1 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditShifts;