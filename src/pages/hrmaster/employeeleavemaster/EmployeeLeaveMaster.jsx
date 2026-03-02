import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  InputAdornment,
  Typography,
  Snackbar,
  TablePagination,
  Stack,
  Alert,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  FormHelperText,
  Card,
  CardContent,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Event as EventIcon,
  Celebration as CelebrationIcon,
  Person as PersonIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

// Import components
import ApplyLeave from './ApplyLeave';
import ViewHoliday from './ViewHoliday';
import EditLeave from './EditLeave';
import DeleteLeave from './DeleteLeave';

const HEADER_GRADIENT = 'linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)';

// Styled Status Chip
const StatusChip = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' };
      case 'rejected':
        return { bg: '#ffebee', color: '#c62828', border: '#ef9a9a' };
      case 'pending':
        return { bg: '#fff3e0', color: '#ed6c02', border: '#ffb74d' };
      default:
        return { bg: '#f5f5f5', color: '#757575', border: '#bdbdbd' };
    }
  };

  const colors = getStatusColor(status);

  return (
    <Chip
      label={status}
      size="small"
      icon={
        status?.toLowerCase() === 'approved' ? <CheckCircleIcon /> :
          status?.toLowerCase() === 'rejected' ? <CancelIcon /> :
            <PendingIcon />
      }
      sx={{
        backgroundColor: colors.bg,
        color: colors.color,
        borderColor: colors.border,
        fontWeight: 500,
        '& .MuiChip-icon': {
          color: colors.color,
        },
      }}
      variant="outlined"
    />
  );
};

// Leave Balance Card Component
const LeaveBalanceCard = ({ balance }) => {
  const percentage = balance.utilizationPercentage || 0;

  const getProgressColor = (percent) => {
    if (percent >= 80) return '#d32f2f';
    if (percent >= 60) return '#ed6c02';
    if (percent >= 30) return '#1976d2';
    return '#4caf50';
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2" fontWeight="600">
            {balance.leaveTypeName}
          </Typography>
          <Chip
            label={`${balance.usedDays}/${balance.maxDaysPerYear}`}
            size="small"
            sx={{
              backgroundColor: getProgressColor(percentage) + '20',
              color: getProgressColor(percentage),
              fontWeight: 500,
              fontSize: '0.7rem'
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(percentage, 100)}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getProgressColor(percentage),
                  borderRadius: 3,
                }
              }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            {percentage.toFixed(0)}%
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between">
          <Typography variant="caption" color="text.secondary">
            Used: {balance.usedDays}
          </Typography>
          <Typography variant="caption" color="success.main" fontWeight="500">
            Remaining: {balance.remainingDays}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// View Leave Details Modal
const ViewLeaveDetails = ({ open, onClose, leave }) => {
  if (!leave) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvatarInitials = (leaveData) => {
    if (!leaveData?.EmployeeID) return 'U';
    const firstName = leaveData.EmployeeID.FirstName || '';
    const lastName = leaveData.EmployeeID.LastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  const getEmployeeName = (leaveData) => {
    if (!leaveData?.EmployeeID) return 'Unknown';
    const firstName = leaveData.EmployeeID.FirstName || '';
    const lastName = leaveData.EmployeeID.LastName || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown';
  };

  const calculateDaysDifference = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          borderBottom: "1px solid #E0E0E0",
          py: 1,
          backgroundColor: "#F8FAFC",
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography fontSize={18} fontWeight={600} color="#101010">
          Leave Application Details
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ pt: 1.5, pb: 1 }}>
        <Stack spacing={2}>
          {/* Employee Info */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: "#00B4D8",
                fontSize: "1.2rem",
              }}
            >
              {getAvatarInitials(leave)}
            </Avatar>
            <Box>
              <Typography fontWeight={600}>
                {getEmployeeName(leave)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ID: {leave.EmployeeID?.EmployeeID}
              </Typography>
              {leave.EmployeeID?.DesignationID && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {leave.EmployeeID.DesignationID?.DesignationName || 'No Designation'}
                </Typography>
              )}
            </Box>
          </Stack>

          <Divider />

          {/* Leave Details */}
          <Stack spacing={1.5}>
            <Typography variant="subtitle2" fontWeight={600}>
              Leave Details
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
              <Box flex={1} minWidth={150}>
                <Typography variant="caption" color="text.secondary">
                  Leave Type
                </Typography>
                <Typography fontWeight={600}>
                  {leave.LeaveTypeID?.Name || 'N/A'}
                </Typography>
                {leave.LeaveTypeID?.Description && (
                  <Typography variant="caption" color="text.secondary">
                    {leave.LeaveTypeID.Description}
                  </Typography>
                )}
              </Box>

              <Box flex={1} minWidth={120}>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box mt={0.5}>
                  <Chip
                    label={leave.Status}
                    size="small"
                    color={
                      leave.Status?.toLowerCase() === 'approved' ? 'success' :
                        leave.Status?.toLowerCase() === 'rejected' ? 'error' : 'warning'
                    }
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
              </Box>

              <Box flex={1} minWidth={150}>
                <Typography variant="caption" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body2">
                  {formatDate(leave.StartDate)} - {formatDate(leave.EndDate)}
                </Typography>
              </Box>

              <Box flex={1} minWidth={100}>
                <Typography variant="caption" color="text.secondary">
                  Days
                </Typography>
                <Typography fontWeight={600}>
                  {leave.NumberOfDays ||
                    calculateDaysDifference(
                      leave.StartDate,
                      leave.EndDate
                    )} {leave.NumberOfDays === 1 ? 'day' : 'days'}
                </Typography>
              </Box>
            </Stack>
          </Stack>

          <Divider />

          {/* Contact Info */}
          <Stack spacing={1}>
            <Typography variant="subtitle2" fontWeight={600}>
              Contact Information
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <Box flex={1}>
                <Typography variant="caption" color="text.secondary">
                  Contact Number
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {leave.ContactNumber || "Not provided"}
                </Typography>
              </Box>

              <Box flex={2}>
                <Typography variant="caption" color="text.secondary">
                  Address During Leave
                </Typography>
                <Typography variant="body2">
                  {leave.AddressDuringLeave || "Not specified"}
                </Typography>
              </Box>
            </Stack>
          </Stack>

          <Divider />

          {/* Reason */}
          <Stack spacing={1}>
            <Typography variant="subtitle2" fontWeight={600}>
              Reason for Leave
            </Typography>
            <Typography
              variant="body2"
              sx={{
                backgroundColor: "#F8FAFC",
                p: 1.5,
                borderRadius: 1,
                minHeight: 60,
                lineHeight: 1.5,
                border: '1px solid #E0E0E0'
              }}
            >
              {leave.Reason || "No reason provided"}
            </Typography>
          </Stack>

          <Divider />

          {/* System Info */}
          <Stack spacing={1}>
            <Typography variant="subtitle2" fontWeight={600}>
              System Information
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <Box flex={1}>
                <Typography variant="caption" color="text.secondary">
                  Applied On
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatDateTime(leave.AppliedOn || leave.CreatedAt)}
                </Typography>
              </Box>

              <Box flex={1}>
                <Typography variant="caption" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body2">
                  {formatDateTime(leave.UpdatedAt || leave.CreatedAt)}
                </Typography>
              </Box>

              {leave.ProcessedOn && (
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Processed On
                  </Typography>
                  <Typography variant="body2">
                    {formatDateTime(leave.ProcessedOn)}
                  </Typography>

                </Box>
              )}
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ p: 2, borderTop: "1px solid #E0E0E0" }}>
        <Button
          variant="contained"
          onClick={onClose}
          startIcon={<CloseIcon />}
          sx={{
            borderRadius: 1,
            textTransform: "none",
            backgroundColor: "#1976D2",
            "&:hover": {
              backgroundColor: "#1565C0",
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EmployeeLeaveMaster = () => {
  // State for employees dropdown
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeeDetails, setEmployeeDetails] = useState(null);

  // State for leaves
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal states
  const [openApplyLeave, setOpenApplyLeave] = useState(false);
  const [openViewHoliday, setOpenViewHoliday] = useState(false);
  const [openViewLeave, setOpenViewLeave] = useState(false);
  const [openEditLeave, setOpenEditLeave] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Action menu
  const [actionAnchor, setActionAnchor] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState({
    start: null,
    end: null
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch leaves when employee is selected
  useEffect(() => {
    if (selectedEmployee) {
      fetchEmployeeLeaves(selectedEmployee);
    } else {
      clearEmployeeData();
    }
  }, [selectedEmployee]);

  // Apply filters when leaves, statusFilter, searchTerm, or dateRangeFilter changes
  useEffect(() => {
    applyFilters();
  }, [leaves, statusFilter, searchTerm, dateRangeFilter.start, dateRangeFilter.end]);

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const employeesData = response.data.data || [];
        setEmployees(employeesData);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      showNotification('Failed to load employees', 'error');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchEmployeeLeaves = async (employeeId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Find selected employee details
      const employee = employees.find(emp => emp._id === employeeId);
      setEmployeeDetails(employee);

      // Fetch leaves for specific employee
      const response = await axios.get(`${BASE_URL}/api/leaves/employee/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Extract data from the response structure
        const leavesData = response.data.data || [];
        const summaryData = response.data.summary || null;
        const balanceData = response.data.leaveBalance || [];

        setLeaves(leavesData);
        setFilteredLeaves(leavesData);
        setSummary(summaryData);
        setLeaveBalance(balanceData);

        return response.data;
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      showNotification('Failed to load leave applications', 'error');
      clearEmployeeData();
    } finally {
      setLoading(false);
    }
  };

  const clearEmployeeData = () => {
    setLeaves([]);
    setFilteredLeaves([]);
    setLeaveBalance([]);
    setSummary(null);
    setEmployeeDetails(null);
    setSearchTerm('');
    setStatusFilter('all');
    setDateRangeFilter({ start: null, end: null });
  };

  // CORRECTED FILTER FUNCTION
  const applyFilters = () => {
    let filtered = [...leaves];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(leave =>
        leave.LeaveTypeID?.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.Reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(leave => leave.Status === statusFilter);
    }

    // Apply date range filter - CORRECTED VERSION WITH OVERLAP LOGIC
    if (dateRangeFilter.start || dateRangeFilter.end) {
      filtered = filtered.filter(leave => {
        const leaveStart = new Date(leave.StartDate);
        const leaveEnd = new Date(leave.EndDate);

        // Normalize dates to remove time component for accurate date comparison
        leaveStart.setHours(0, 0, 0, 0);
        leaveEnd.setHours(23, 59, 59, 999);

        if (dateRangeFilter.start && dateRangeFilter.end) {
          // If both dates are selected, find leaves that overlap with the range
          const filterStart = new Date(dateRangeFilter.start);
          const filterEnd = new Date(dateRangeFilter.end);
          filterStart.setHours(0, 0, 0, 0);
          filterEnd.setHours(23, 59, 59, 999);

          // Check if leave period overlaps with filter period
          return leaveStart <= filterEnd && leaveEnd >= filterStart;
        }
        else if (dateRangeFilter.start) {
          // Only start date selected - leaves starting on or after this date
          const filterStart = new Date(dateRangeFilter.start);
          filterStart.setHours(0, 0, 0, 0);
          return leaveStart >= filterStart;
        }
        else if (dateRangeFilter.end) {
          // Only end date selected - leaves ending on or before this date
          const filterEnd = new Date(dateRangeFilter.end);
          filterEnd.setHours(23, 59, 59, 999);
          return leaveEnd <= filterEnd;
        }

        return true;
      });
    }

    setFilteredLeaves(filtered);
    setPage(0);
  };

  const showNotification = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleActionOpen = (e, leave) => {
    setActionAnchor(e.currentTarget);
    setSelectedLeave(leave);
  };

  const handleActionClose = () => {
    setActionAnchor(null);
  };

  const handleViewLeave = () => {
    setOpenViewLeave(true);
    handleActionClose();
  };

  const handleEditLeave = () => {
    setOpenEditLeave(true);
    handleActionClose();
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
    handleActionClose();
  };

  const handleApplyLeaveClose = (success = false) => {
    setOpenApplyLeave(false);

    if (success && selectedEmployee) {
      setLoading(true);
      fetchEmployeeLeaves(selectedEmployee)
        .then(() => {
          showNotification('Leave applied successfully');
        })
        .catch(() => {
          showNotification('Leave applied but failed to refresh list', 'warning');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleEditLeaveClose = (success = false) => {
    setOpenEditLeave(false);
    setSelectedLeave(null);

    if (success && selectedEmployee) {
      setLoading(true);
      fetchEmployeeLeaves(selectedEmployee)
        .then(() => {
          showNotification('Leave updated successfully');
        })
        .catch(() => {
          showNotification('Leave updated but failed to refresh list', 'warning');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleDeleteLeaveClose = (deleted = false) => {
    setOpenDeleteDialog(false);
    setSelectedLeave(null);

    if (deleted && selectedEmployee) {
      setLoading(true);
      fetchEmployeeLeaves(selectedEmployee)
        .then(() => {
          showNotification('Leave deleted successfully');
        })
        .catch(() => {
          showNotification('Leave deleted but failed to refresh list', 'warning');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleViewLeaveClose = () => {
    setOpenViewLeave(false);
    setSelectedLeave(null);
  };

  const handleRefresh = () => {
    if (selectedEmployee) {
      setLoading(true);
      fetchEmployeeLeaves(selectedEmployee)
        .then(() => {
          showNotification('Data refreshed successfully');
        })
        .catch(() => {
          showNotification('Failed to refresh data', 'error');
        });
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRangeFilter({ start: null, end: null });
  };

  const handleEmployeeChange = (event) => {
    setSelectedEmployee(event.target.value);
    setPage(0);
    handleClearFilters();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEmployeeName = (employee) => {
    if (!employee) return '';
    return `${employee.FirstName || ''} ${employee.LastName || ''}`.trim();
  };

  const getAvatarInitials = (employee) => {
    if (!employee) return 'U';
    const first = employee.FirstName ? employee.FirstName.charAt(0) : '';
    const last = employee.LastName ? employee.LastName.charAt(0) : '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  const paginatedLeaves = filteredLeaves.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calculate stats
  const pendingCount = summary?.Pending?.count || leaves.filter(l => l.Status === 'Pending').length;
  const pendingDays = summary?.Pending?.totalDays || 0;
  const approvedCount = summary?.Approved?.count || leaves.filter(l => l.Status === 'Approved').length;
  const approvedDays = summary?.Approved?.totalDays || 0;
  const rejectedCount = summary?.Rejected?.count || leaves.filter(l => l.Status === 'Rejected').length;
  const rejectedDays = summary?.Rejected?.totalDays || 0;
  const totalLeaves = leaves.length;

  const stats = [
    {
      label: 'Total Leaves',
      value: totalLeaves,
      color: '#164e63',
      bg: '#f1f5f9',
      icon: <EventIcon sx={{ fontSize: 24 }} />
    },
    {
      label: 'Pending',
      value: pendingCount,
      subValue: `${pendingDays} days`,
      color: '#ed6c02',
      bg: '#fff3e0',
      icon: <PendingIcon sx={{ fontSize: 24 }} />
    },
    {
      label: 'Approved',
      value: approvedCount,
      subValue: `${approvedDays} days`,
      color: '#2e7d32',
      bg: '#e8f5e9',
      icon: <CheckCircleIcon sx={{ fontSize: 24 }} />
    },
    {
      label: 'Rejected',
      value: rejectedCount,
      subValue: `${rejectedDays} days`,
      color: '#d32f2f',
      bg: '#ffebee',
      icon: <CancelIcon sx={{ fontSize: 24 }} />
    }
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="h5"
            fontWeight={600}
            sx={{
              background: HEADER_GRADIENT,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Employee Leave Management
          </Typography>
          <Typography variant="body1" color="#64748B">
            View and manage leave applications for employees
          </Typography>
        </Box>

        {/* Employee Selection Card */}
        <Paper sx={{
          p: 1.5, // Reduced padding
          mb: 2,
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          background: 'linear-gradient(to right, #f8fafc, #ffffff)'
        }}>
          <Grid container spacing={2} alignItems="center"> {/* Reduced spacing */}
            <Grid item xs={12} md={6} sx={{ width: "400px" }}>
              <FormControl fullWidth variant="outlined" size="small"> {/* Changed to small size */}
                <InputLabel id="employee-select-label" sx={{ fontSize: '0.9rem' }}>Select Employee</InputLabel>
                <Select
                  labelId="employee-select-label"
                  value={selectedEmployee}
                  onChange={handleEmployeeChange}
                  label="Select Employee"
                  disabled={loadingEmployees}
                  size="medium" // Added small size
                  sx={{
                    borderRadius: 1.5,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e2e8f0',
                    },
                    '& .MuiSelect-select': {
                      py: 1, // Reduced padding
                    }
                  }}
                >
                  <MenuItem value="">
                    <em>Select an employee</em>
                  </MenuItem>
                  {employees.map((emp) => (
                    <MenuItem key={emp._id} value={emp._id}>
                      <Stack direction="row" spacing={1.5} alignItems="center"> {/* Reduced spacing */}
                        <Box>
                          <Typography variant="body2" fontWeight={500} sx={{ lineHeight: 1.2 }}>
                            {getEmployeeName(emp)}
                          </Typography>
                          {/* <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {emp.EmployeeID}
                  </Typography> */}
                        </Box>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
                {!loadingEmployees && employees.length === 0 && (
                  <FormHelperText error sx={{ mt: 0.5 }}>No employees found</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {employeeDetails && (
              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={1.5} alignItems="center"> {/* Reduced spacing */}
                  <Stack
                    direction="row"
                    spacing={1.5}
                    divider={<Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />}
                    sx={{ mt: 0.25 }}
                  >
                    <Avatar
                      sx={{
                        width: 40, // Slightly smaller
                        height: 40,
                        bgcolor: '#00B4D8',
                        fontSize: '1rem'
                      }}
                    >
                      {getAvatarInitials(employeeDetails)}
                    </Avatar>
                    <Box>

                      <Typography variant="subtitle1" fontWeight={600} sx={{ lineHeight: 1.2 }}> {/* Changed to subtitle1 */}
                        {getEmployeeName(employeeDetails)}
                      </Typography>

                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        ID: {employeeDetails.EmployeeID}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {employeeDetails.DepartmentID?.DepartmentName || 'No Dept'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {employeeDetails.DesignationID?.DesignationName || 'No Desig'}
                      </Typography>
                    </Box>
                  </Stack>

                </Stack>
              </Grid>
            )}
          </Grid>
        </Paper>

        {selectedEmployee && (
          <>
            {/* Stats Cards */}
            {/* <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 3,
                mb: 4
              }}
            >
              {stats.map((stat, i) => (
                <Paper
                  key={i}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                    bgcolor: stat.bg,
                    transition: '0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: stat.color,
                      boxShadow: `0 4px 12px ${stat.color}20`
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} marginTop={-2}>
                      {stat.label}
                    </Typography>
                    <Avatar sx={{ bgcolor: stat.color, width: 32, height: 32 }}>
                      {stat.icon}
                    </Avatar>
                  </Box>
                  <Typography variant="h5" fontWeight={600} sx={{ color: stat.color, marginTop: -3, marginBottom: -1 }}>
                    {stat.value}
                  </Typography>
                  {stat.subValue && (
                    <Typography variant="caption" sx={{ color: stat.color, opacity: 0.8, marginTop: -3 }}>
                      {stat.subValue}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box> */}

            {/* Leave Balance Cards */}
            {/* {leaveBalance.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={600} sx={{  color: '#164e63', m: '-5px' }}>
                  Leave Balance
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                    gap: 2
                  }}
                >
                  {leaveBalance.map((balance, index) => (
                    <LeaveBalanceCard key={index} balance={balance} />
                  ))}
                </Box>
              </Box>
            )} */}

            {/* Action Bar */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flex={1}>
                  <TextField
                    placeholder="Search leaves..."
                    size="small"
                    value={searchTerm}
                    onChange={handleSearch}
                    sx={{ width: { xs: '100%', sm: 250 } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#64748B' }} />
                        </InputAdornment>
                      )
                    }}
                  />

                  <Button
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    onClick={() => setShowFilters(!showFilters)}
                    color={showFilters ? 'primary' : 'inherit'}
                  >
                    Filters
                  </Button>

                  {(statusFilter !== 'all' || dateRangeFilter.start || dateRangeFilter.end || searchTerm) && (
                    <Button
                      variant="text"
                      startIcon={<CloseIcon />}
                      onClick={handleClearFilters}
                      size="small"
                    >
                      Clear
                    </Button>
                  )}
                </Stack>

                <Stack direction="row" spacing={2}>
                  {/* <Tooltip title="Refresh Data">
                    <IconButton onClick={handleRefresh} disabled={loading}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip> */}

                  <Button
                    variant="contained"
                    startIcon={<CelebrationIcon />}
                    onClick={() => setOpenViewHoliday(true)}
                    sx={{
                      background: HEADER_GRADIENT,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0e7490 0%, #00B4D8 50%, #164e63 100%)'
                      }
                    }}
                  >
                    Holidays
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenApplyLeave(true)}
                    sx={{
                      background: HEADER_GRADIENT,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0e7490 0%, #00B4D8 50%, #164e63 100%)'
                      }
                    }}
                  >
                    Apply Leave
                  </Button>
                </Stack>
              </Stack>

              {/* Filter Panel */}
              {showFilters && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Status Filter</InputLabel>
                        <Select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          label="Status Filter"
                        >
                          <MenuItem value="all">All Status</MenuItem>
                          <MenuItem value="Pending">Pending</MenuItem>
                          <MenuItem value="Approved">Approved</MenuItem>
                          <MenuItem value="Rejected">Rejected</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <DatePicker
                        label="From Date"
                        value={dateRangeFilter.start}
                        onChange={(date) => setDateRangeFilter({ ...dateRangeFilter, start: date })}
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <DatePicker
                        label="To Date"
                        value={dateRangeFilter.end}
                        onChange={(date) => setDateRangeFilter({ ...dateRangeFilter, end: date })}
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>

            {/* Leave Applications Table */}
            <Paper sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: HEADER_GRADIENT }}>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Leave Type</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>From Date</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>To Date</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Days</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Reason</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Applied On</TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} sx={{ p: 0 }}>
                          <LinearProgress />
                        </TableCell>
                      </TableRow>
                    ) : paginatedLeaves.length > 0 ? (
                      paginatedLeaves.map((leave) => (
                        <TableRow key={leave._id} hover>
                          <TableCell>
                            <Typography fontWeight={500}>
                              {leave.LeaveTypeID?.Name || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>{formatDate(leave.StartDate)}</TableCell>
                          <TableCell>{formatDate(leave.EndDate)}</TableCell>
                          <TableCell>
                            <Chip
                              label={leave.NumberOfDays}
                              size="small"
                              sx={{
                                bgcolor: '#f1f5f9',
                                fontWeight: 500,
                                minWidth: 40
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title={leave.Reason || ''}>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                {leave.Reason || 'No reason provided'}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <StatusChip status={leave.Status} />
                          </TableCell>
                          <TableCell>{formatDateTime(leave.AppliedOn || leave.CreatedAt)}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={(e) => handleActionOpen(e, leave)}
                              sx={{ color: '#64748b' }}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                          <EventIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
                          <Typography variant="h6" color="textSecondary" gutterBottom>
                            No Leave Applications Found
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {searchTerm || statusFilter !== 'all' || dateRangeFilter.start || dateRangeFilter.end
                              ? 'Try adjusting your filters'
                              : 'This employee hasn\'t applied for any leave yet'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {filteredLeaves.length > 0 && (
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={filteredLeaves.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              )}
            </Paper>
          </>
        )}

        {!selectedEmployee && (
          <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 2 }}>
            <PersonIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
            <Typography variant="h5" color="textSecondary" gutterBottom>
              No Employee Selected
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Please select an employee from the dropdown above to view their leave information
            </Typography>
          </Paper>
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={actionAnchor}
          open={Boolean(actionAnchor)}
          onClose={handleActionClose}
        >
          <MenuItem onClick={handleViewLeave}>
            <ListItemIcon>
              <ViewIcon fontSize="small" sx={{ color: '#00B4D8' }} />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>

          {selectedLeave?.Status === 'Pending' && (
            <MenuItem onClick={handleEditLeave}>
              <ListItemIcon>
                <EditIcon fontSize="small" sx={{ color: '#10B981' }} />
              </ListItemIcon>
              <ListItemText>Edit Leave</ListItemText>
            </MenuItem>
          )}

          {selectedLeave?.Status === 'Pending' && (
            <MenuItem onClick={handleDeleteClick}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Delete Leave" sx={{ color: '#d32f2f' }} />
            </MenuItem>
          )}
        </Menu>

        {/* Modals */}
        {selectedEmployee && (
          <>
            <ApplyLeave
              open={openApplyLeave}
              handleClose={handleApplyLeaveClose}
              onSuccess={handleApplyLeaveClose}
              employeeId={selectedEmployee}
              employeeDetails={employeeDetails}
            />

            <EditLeave
              open={openEditLeave}
              onClose={handleEditLeaveClose}
              leaveData={selectedLeave}
              onUpdate={handleEditLeaveClose}
            />

            <DeleteLeave
              open={openDeleteDialog}
              onClose={handleDeleteLeaveClose}
              leaveData={selectedLeave}
              onDelete={handleDeleteLeaveClose}
            />
          </>
        )}

        <ViewHoliday
          open={openViewHoliday}
          onClose={() => setOpenViewHoliday(false)}
        />

        <ViewLeaveDetails
          open={openViewLeave}
          onClose={handleViewLeaveClose}
          leave={selectedLeave}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={snackbar.severity}
            variant="filled"
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default EmployeeLeaveMaster;