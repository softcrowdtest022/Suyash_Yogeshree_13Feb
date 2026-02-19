import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Chip,
  Divider,
  Box,
  CircularProgress
} from '@mui/material';
import { Edit as EditIcon, AccessTime, Business, Schedule } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const ViewShifts = ({ open, onClose, shift, onEdit }) => {
  const [departmentNames, setDepartmentNames] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch department names when shift data changes
  useEffect(() => {
    const fetchDepartmentNames = async () => {
      if (!shift?.ApplicableDepartments || shift.ApplicableDepartments.length === 0) {
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/api/departments`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            limit: 100 // Get all departments
          }
        });

        if (response.data.success) {
          const departments = response.data.data || [];
          // Create a mapping of department ID to department name
          const nameMap = {};
          departments.forEach(dept => {
            nameMap[dept._id] = dept.DepartmentName;
          });
          setDepartmentNames(nameMap);
        }
      } catch (err) {
        console.error('Error fetching department names:', err);
      } finally {
        setLoading(false);
      }
    };

    if (open && shift) {
      fetchDepartmentNames();
    }
  }, [shift, open]);

  if (!shift) return null;

  const formatTime = (time) => {
    if (!time) return '-';
    return time;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get department name from ID
  const getDepartmentName = (deptId) => {
    return departmentNames[deptId] || deptId; // Fallback to ID if name not found
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
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
            fontWeight: '600',
            color: '#101010',
            paddingTop: '8px'
          }}
        >
          Shift Details
        </div>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>

          {/* Basic Info */}
          <div style={{ marginTop: '16px' }}>
            <Stack direction="row" spacing={3} alignItems="center">

              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {shift.ShiftName}
                </Typography>

                <Typography variant="body2" color="textSecondary">
                  Code: {shift.Code}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip
                    label={shift.IsActive ? "Active" : "Inactive"}
                    size="small"
                    color={shift.IsActive ? "success" : "default"}
                  />
                </Stack>
              </Box>

            </Stack>
          </div>

          <Divider />

          {/* Timing Information */}
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Timing Information
            </Typography>

            <Stack direction="row" spacing={4}>

              <Stack spacing={1} flex={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTime fontSize="small" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">Start Time</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatTime(shift.StartTime)}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>

              <Stack spacing={1} flex={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTime fontSize="small" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">End Time</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatTime(shift.EndTime)}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>

            </Stack>
          </Stack>

          <Divider />

          {/* Policy Information */}
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Policy Configuration
            </Typography>

            <Stack direction="row" spacing={4}>

              <Stack spacing={1} flex={1}>
                <Typography variant="caption" color="textSecondary">Grace Period</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {shift.GracePeriod || 0} minutes
                </Typography>
              </Stack>

              <Stack spacing={1} flex={1}>
                <Typography variant="caption" color="textSecondary">Late Threshold</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {shift.LateThreshold || 0} minutes
                </Typography>
              </Stack>

              <Stack spacing={1} flex={1}>
                <Typography variant="caption" color="textSecondary">Break Duration</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {shift.BreakDuration || 0} minutes
                </Typography>
              </Stack>

            </Stack>
          </Stack>

          <Divider />

          {/* Overtime Rules */}
          {shift.OvertimeRules && (
            <>
              <Stack spacing={2}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Overtime Rules
                </Typography>

                <Stack direction="row" spacing={4}>

                  <Stack spacing={1} flex={1}>
                    <Typography variant="caption" color="textSecondary">Daily Threshold</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {shift.OvertimeRules.DailyThreshold || 0} hrs
                    </Typography>
                  </Stack>

                  <Stack spacing={1} flex={1}>
                    <Typography variant="caption" color="textSecondary">Weekly Threshold</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {shift.OvertimeRules.WeeklyThreshold || 0} hrs
                    </Typography>
                  </Stack>

                  <Stack spacing={1} flex={1}>
                    <Typography variant="caption" color="textSecondary">Rate Multiplier</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {shift.OvertimeRules.RateMultiplier || 1}x
                    </Typography>
                  </Stack>

                </Stack>
              </Stack>

              <Divider />
            </>
          )}

          {/* Departments */}
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Applicable Departments
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="textSecondary">
                  Loading department names...
                </Typography>
              </Box>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                {shift.ApplicableDepartments?.length > 0 ? (
                  shift.ApplicableDepartments.map((deptId, index) => (
                    <Chip
                      key={index}
                      label={getDepartmentName(deptId)}
                      size="small"
                      variant="outlined"
                      sx={{
                        backgroundColor: '#E3F2FD',
                        borderColor: '#1976D2',
                        '& .MuiChip-label': {
                          color: '#1976D2',
                          fontWeight: 500
                        }
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No departments assigned
                  </Typography>
                )}
              </Stack>
            )}
          </Stack>

          <Divider />

          {/* System Info */}
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              System Information
            </Typography>

            <Stack direction="row" spacing={4}>
              <Stack flex={1}>
                <Typography variant="caption" color="textSecondary">Created At</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatDate(shift.CreatedAt)}
                </Typography>
              </Stack>

              <Stack flex={1}>
                <Typography variant="caption" color="textSecondary">Last Updated</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatDate(shift.UpdatedAt)}
                </Typography>
              </Stack>
            </Stack>
          </Stack>

        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid #E0E0E0',
          backgroundColor: '#F8FAFC',
          gap: 1
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            borderRadius: 1,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500,
            color: '#666'
          }}
        >
          Close
        </Button>

        <Button
          variant="contained"
          onClick={() => {
            onClose();
            onEdit();
          }}
          startIcon={<EditIcon />}
          sx={{
            borderRadius: 1,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500,
            backgroundColor: '#1976D2',
            '&:hover': {
              backgroundColor: '#1565C0'
            }
          }}
        >
          Edit Shift
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewShifts;