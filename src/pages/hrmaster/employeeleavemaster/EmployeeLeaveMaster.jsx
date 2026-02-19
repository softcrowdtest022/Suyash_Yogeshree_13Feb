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
  FormHelperText
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Event as EventIcon,
  Celebration as CelebrationIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

// Import components
import ApplyLeave from './ApplyLeave';
import ViewHoliday from './ViewHoliday';

const HEADER_GRADIENT = 'linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)';

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

  // Action menu
  const [actionAnchor, setActionAnchor] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch leaves when employee is selected
  useEffect(() => {
    if (selectedEmployee) {
      fetchEmployeeLeaves(selectedEmployee);
    } else {
      setLeaves([]);
      setFilteredLeaves([]);
      setLeaveBalance([]);
      setSummary(null);
      setEmployeeDetails(null);
    }
  }, [selectedEmployee]);

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
        
        // Auto-select first employee if available
        if (employeesData.length > 0) {
          setSelectedEmployee(employeesData[0]._id);
        }
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

      console.log("Leaves API Response:", response.data);

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
      setLeaves([]);
      setFilteredLeaves([]);
      setLeaveBalance([]);
      setSummary(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = leaves.filter(leave =>
      leave.LeaveTypeID?.Name?.toLowerCase().includes(value) ||
      leave.Reason?.toLowerCase().includes(value) ||
      leave.Status?.toLowerCase().includes(value)
    );

    setFilteredLeaves(filtered);
    setPage(0);
  };

  const handleActionOpen = (e, leave) => {
    setActionAnchor(e.currentTarget);
    setSelectedLeave(leave);
  };

  const handleActionClose = () => {
    setActionAnchor(null);
    setSelectedLeave(null);
  };

  const handleApplyLeaveClose = (success = false) => {
    setOpenApplyLeave(false);
    
    if (success && selectedEmployee) {
      // Show loading state while refreshing data
      setLoading(true);
      
      // Fetch leaves again to get the updated list
      fetchEmployeeLeaves(selectedEmployee)
        .then(() => {
          showNotification('Leave applied successfully');
        })
        .catch((error) => {
          console.error('Error refreshing leaves:', error);
          showNotification('Leave applied but failed to refresh list', 'warning');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
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
    return date.toLocaleDateString('en-US', {
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

  const handleEmployeeChange = (event) => {
    setSelectedEmployee(event.target.value);
    setPage(0);
    setSearchTerm('');
  };

  const paginatedLeaves = filteredLeaves.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calculate leave stats from summary
  const pendingCount = summary?.Pending?.count || 0;
  const pendingDays = summary?.Pending?.totalDays || 0;
  
  // For now, we don't have approved/rejected counts from the API response
  // We'll calculate them from the leaves data
  const approvedLeaves = leaves.filter(l => l.Status === 'Approved').length;
  const rejectedLeaves = leaves.filter(l => l.Status === 'Rejected').length;
  const totalLeaves = leaves.length;

  const stats = [
    { label: 'Total Leaves', value: totalLeaves, color: '#164e63', bg: '#f1f5f9' },
    { label: 'Pending', value: pendingCount, subValue: `${pendingDays} days`, color: '#ed6c02', bg: '#fff3e0' },
    { label: 'Approved', value: approvedLeaves, color: '#2e7d32', bg: '#e8f5e9' },
    { label: 'Rejected', value: rejectedLeaves, color: '#d32f2f', bg: '#ffebee' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
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
        p: 3, 
        mb: 4, 
        borderRadius: 2, 
        border: '1px solid #e2e8f0',
        background: 'linear-gradient(to right, #f8fafc, #ffffff)'
      }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" size="medium">
              <InputLabel id="employee-select-label">Select Employee</InputLabel>
              <Select
                labelId="employee-select-label"
                id="employee-select"
                value={selectedEmployee}
                onChange={handleEmployeeChange}
                label="Select Employee"
                disabled={loadingEmployees}
                sx={{
                  borderRadius: 1.5,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e2e8f0'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#00B4D8'
                  }
                }}
              >
                <MenuItem value="">
                  <em>Select an employee</em>
                </MenuItem>
                {employees.map((emp) => (
                  <MenuItem key={emp._id} value={emp._id}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: '#00B4D8',
                          fontSize: '0.875rem'
                        }}
                      >
                        {getAvatarInitials(emp)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {getEmployeeName(emp)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {emp.EmployeeID} • {emp.DepartmentID?.DepartmentName || 'No Dept'}
                        </Typography>
                      </Box>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
              {!loadingEmployees && employees.length === 0 && (
                <FormHelperText error>No employees found</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          {employeeDetails && (
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar 
                  sx={{ 
                    width: 56, 
                    height: 56, 
                    bgcolor: '#00B4D8',
                    fontSize: '1.25rem',
                    fontWeight: 600
                  }}
                >
                  {getAvatarInitials(employeeDetails)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {getEmployeeName(employeeDetails)}
                  </Typography>
                  <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
                    <Typography variant="body2" color="text.secondary">
                      ID: {employeeDetails.EmployeeID}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {employeeDetails.DepartmentID?.DepartmentName || 'No Department'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {employeeDetails.DesignationID?.DesignationName || 'No Designation'}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Stats Cards - Only show if employee selected */}
      {selectedEmployee && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 3,
            mb: 3
          }}
        >
          {stats.map((stat, i) => (
            <Paper
              key={i}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                bgcolor: stat.bg,
                minWidth: { xs: '100%', sm: '180px', md: '200px' },
                transition: '0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  borderColor: stat.color,
                  boxShadow: `0 4px 12px ${stat.color}20`
                }
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={300}>
                {stat.label}
              </Typography>
              <Typography variant="h5" fontWeight={300} sx={{ color: stat.color }}>
                {stat.value}
              </Typography>
              {stat.subValue && (
                <Typography variant="caption" sx={{ color: stat.color, opacity: 0.8 }}>
                  {stat.subValue}
                </Typography>
              )}
            </Paper>
          ))}
        </Box>
      )}

      {/* Leave Balance Cards */}
      {/* {selectedEmployee && leaveBalance.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: '#164e63' }}>
            Leave Balance
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 2
            }}
          >
            {leaveBalance.map((balance, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  bgcolor: '#f8fafc'
                }}
              >
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {balance.leaveTypeName}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary">Used</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {balance.usedDays} / {balance.maxDaysPerYear}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Remaining</Typography>
                    <Typography variant="body1" fontWeight={600} sx={{ color: '#00B4D8' }}>
                      {balance.remainingDays}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={balance.utilizationPercentage}
                    sx={{
                      width: 60,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#e2e8f0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: balance.utilizationPercentage > 80 ? '#ef4444' : '#00B4D8'
                      }
                    }}
                  />
                </Stack>
              </Paper>
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              placeholder="Search leaves..."
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              disabled={!selectedEmployee || loading}
              sx={{ width: { xs: '100%', sm: 300 } }}
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
              disabled={!selectedEmployee || loading}
              sx={{ justifyContent: { xs: 'flex-start', sm: 'center' } }}
            >
              Filter
            </Button>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              disabled={!selectedEmployee || leaves.length === 0 || loading}
              sx={{ justifyContent: { xs: 'flex-start', sm: 'center' } }}
            >
              Export
            </Button>

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
              View Holidays
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenApplyLeave(true)}
              disabled={!selectedEmployee}
              sx={{
                background: HEADER_GRADIENT,
                '&:hover': {
                  background: 'linear-gradient(135deg, #0e7490 0%, #00B4D8 50%, #164e63 100%)'
                },
                '&.Mui-disabled': {
                  background: '#e2e8f0'
                }
              }}
            >
              Apply Leave
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Leave Applications Table */}
      <Paper sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
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
              ) : !selectedEmployee ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <PersonIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No Employee Selected
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Please select an employee from the dropdown above
                    </Typography>
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
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {leave.Reason || 'No reason provided'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={leave.Status}
                        color={getStatusColor(leave.Status)}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
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
                      No Leave Applications
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      This employee hasn't applied for any leave yet
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenApplyLeave(true)}
                      sx={{ mt: 2, background: HEADER_GRADIENT }}
                    >
                      Apply for Leave
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {selectedEmployee && filteredLeaves.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
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

      {/* Action Menu */}
      <Menu
        anchorEl={actionAnchor}
        open={Boolean(actionAnchor)}
        onClose={handleActionClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 180,
            borderRadius: 2,
            border: '1px solid #e2e8f0'
          }
        }}
      >
        <MenuItem onClick={handleActionClose}>
          <ListItemIcon>
            <ViewIcon fontSize="small" sx={{ color: '#00B4D8' }} />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        {selectedLeave?.Status === 'Pending' && (
          <MenuItem onClick={handleActionClose}>
            <ListItemIcon>
              <EditIcon fontSize="small" sx={{ color: '#10B981' }} />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}
        {selectedLeave?.Status === 'Pending' && (
          <MenuItem onClick={handleActionClose}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: '#EF4444' }} />
            </ListItemIcon>
            <ListItemText sx={{ color: '#EF4444' }}>Cancel</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Modals */}
      {selectedEmployee && (
        <ApplyLeave
          open={openApplyLeave}
          handleClose={handleApplyLeaveClose}
          onSuccess={handleApplyLeaveClose}
          employeeId={selectedEmployee}
          employeeDetails={employeeDetails}
        />
      )}

      <ViewHoliday
        open={openViewHoliday}
        onClose={() => setOpenViewHoliday(false)}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployeeLeaveMaster;