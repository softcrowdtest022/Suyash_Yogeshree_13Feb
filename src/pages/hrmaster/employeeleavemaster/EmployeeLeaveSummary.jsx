import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  LinearProgress,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Cancel as RejectedIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import BASE_URL from '../../../config/Config';
import { useParams } from 'react-router-dom';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
  },
}));

const StatusChip = styled(Chip)(({ status }) => {
  const colors = {
    Approved: { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' },
    Pending: { bg: '#fff3e0', color: '#ed6c02', border: '#ffb74d' },
    Rejected: { bg: '#ffebee', color: '#c62828', border: '#ef9a9a' }
  };
  const style = colors[status] || colors.Pending;
  
  return {
    backgroundColor: style.bg,
    color: style.color,
    borderColor: style.border,
    fontWeight: 500,
    fontSize: '0.75rem',
    '& .MuiChip-icon': {
      color: style.color,
    },
  };
});

const SummaryCard = ({ title, count, days, icon, color }) => (
  <StyledCard>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Avatar sx={{ bgcolor: `${color}20`, color: color, width: 40, height: 40 }}>
          {icon}
        </Avatar>
      </Box>
      <Typography variant="h4" component="div" fontWeight="600" color={color}>
        {count}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Total Days: <strong>{days}</strong>
      </Typography>
    </CardContent>
  </StyledCard>
);

const LeaveBalanceCard = ({ balance }) => {
  const percentage = balance.utilizationPercentage || 0;
  
  const getProgressColor = (percent) => {
    if (percent >= 80) return '#d32f2f';
    if (percent >= 60) return '#ed6c02';
    if (percent >= 30) return '#1976d2';
    return '#4caf50';
  };

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 2, 
        borderRadius: 2,
        '&:hover': {
          backgroundColor: '#f8f9fa'
        }
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle2" fontWeight="600">
          {balance.leaveTypeName}
        </Typography>
        <Chip 
          label={`${balance.usedDays}/${balance.maxDaysPerYear} days`}
          size="small"
          sx={{ 
            backgroundColor: getProgressColor(percentage) + '20',
            color: getProgressColor(percentage),
            fontWeight: 500
          }}
        />
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Box sx={{ flex: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(percentage, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getProgressColor(percentage),
                borderRadius: 4,
              }
            }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary">
          {percentage.toFixed(1)}%
        </Typography>
      </Box>
      
      <Box display="flex" justifyContent="space-between">
        <Typography variant="caption" color="text.secondary">
          Used: {balance.usedDays} days
        </Typography>
        <Typography variant="caption" color="success.main" fontWeight="500">
          Remaining: {balance.remainingDays} days
        </Typography>
      </Box>
    </Paper>
  );
};

const EmployeeLeaveSummary = () => {
  const { employeeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leaveData, setLeaveData] = useState({
    summary: {},
    leaveBalance: [],
    data: [],
    count: 0,
    total: 0,
    totalPages: 1,
    currentPage: 1
  });
  
  // Employee details from the first record
  const [employeeDetails, setEmployeeDetails] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filtering
  const [statusFilter, setStatusFilter] = useState('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const fetchLeaveSummary = async () => {
    if (!employeeId) {
      setError('Employee ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/api/leaves/employee/${employeeId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            page: page + 1,
            limit: rowsPerPage,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            leaveType: leaveTypeFilter !== 'all' ? leaveTypeFilter : undefined
          }
        }
      );

      if (response.data.success) {
        setLeaveData({
          summary: response.data.summary || {},
          leaveBalance: response.data.leaveBalance || [],
          data: response.data.data || [],
          count: response.data.data?.length || 0,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1,
          currentPage: response.data.currentPage || 1
        });

        // Set employee details from the first record
        if (response.data.data && response.data.data.length > 0) {
          setEmployeeDetails(response.data.data[0].EmployeeID);
        }
      } else {
        setError(response.data.message || 'Failed to fetch leave summary');
      }
    } catch (err) {
      console.error('Error fetching leave summary:', err);
      
      if (err.response?.status === 404) {
        setError('Employee not found');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view this employee\'s leaves');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to fetch leave summary');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveSummary();
  }, [employeeId, page, rowsPerPage, statusFilter, leaveTypeFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    fetchLeaveSummary();
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setLeaveTypeFilter('all');
    setPage(0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Approved':
        return <ApprovedIcon fontSize="small" />;
      case 'Rejected':
        return <RejectedIcon fontSize="small" />;
      default:
        return <PendingIcon fontSize="small" />;
    }
  };

  if (loading && !leaveData.data.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Employee Info */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar 
              sx={{ 
                width: 60, 
                height: 60, 
                bgcolor: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.5)'
              }}
            >
              <PersonIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="600">
                {employeeDetails ? 
                  `${employeeDetails.FirstName || ''} ${employeeDetails.LastName || ''}`.trim() || 
                  'Employee' 
                  : 'Employee'} Leave Summary
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Employee ID: {employeeDetails?.EmployeeID || employeeId}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Total Leaves: {leaveData.total} | Pages: {leaveData.totalPages}
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh">
              <IconButton 
                onClick={handleRefresh} 
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Toggle Filters">
              <IconButton 
                onClick={() => setShowFilters(!showFilters)}
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                <FilterIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Filters */}
        {showFilters && (
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small" sx={{ bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 1 }}>
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
                <FormControl fullWidth size="small" sx={{ bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 1 }}>
                  <InputLabel>Leave Type Filter</InputLabel>
                  <Select
                    value={leaveTypeFilter}
                    onChange={(e) => setLeaveTypeFilter(e.target.value)}
                    label="Leave Type Filter"
                  >
                    <MenuItem value="all">All Leave Types</MenuItem>
                    {leaveData.leaveBalance.map((balance) => (
                      <MenuItem key={balance.leaveTypeId} value={balance.leaveTypeId}>
                        {balance.leaveTypeName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  startIcon={<ClearIcon />}
                  sx={{ 
                    bgcolor: 'white',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard
            title="Approved Leaves"
            count={leaveData.summary?.Approved?.count || 0}
            days={leaveData.summary?.Approved?.totalDays || 0}
            icon={<ApprovedIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard
            title="Pending Leaves"
            count={leaveData.summary?.Pending?.count || 0}
            days={leaveData.summary?.Pending?.totalDays || 0}
            icon={<PendingIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard
            title="Rejected Leaves"
            count={leaveData.summary?.Rejected?.count || 0}
            days={leaveData.summary?.Rejected?.totalDays || 0}
            icon={<RejectedIcon />}
            color="#c62828"
          />
        </Grid>
      </Grid>

      {/* Leave Balance Section */}
      {leaveData.leaveBalance.length > 0 && (
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Leave Balance
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={2}>
            {leaveData.leaveBalance.map((balance) => (
              <Grid item xs={12} sm={6} md={4} key={balance.leaveTypeId}>
                <LeaveBalanceCard balance={balance} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Leave History Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" fontWeight="600">
            Leave History
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Leave Type</strong></TableCell>
                <TableCell><strong>Date Range</strong></TableCell>
                <TableCell><strong>Days</strong></TableCell>
                <TableCell><strong>Reason</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Applied On</strong></TableCell>
                <TableCell><strong>Processed</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveData.data.length > 0 ? (
                leaveData.data.map((leave) => (
                  <TableRow key={leave._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {leave.LeaveTypeID?.Name || 'N/A'}
                      </Typography>
                      {leave.LeaveTypeID?.Description && (
                        <Typography variant="caption" color="text.secondary">
                          {leave.LeaveTypeID.Description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {formatDate(leave.StartDate)} - {formatDate(leave.EndDate)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {leave.NumberOfDays} {leave.NumberOfDays === 1 ? 'day' : 'days'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={leave.NumberOfDays}
                        size="small"
                        sx={{ 
                          bgcolor: '#e3f2fd',
                          color: '#1976d2',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={leave.Reason || ''}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {leave.Reason || 'N/A'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <StatusChip
                        status={leave.Status}
                        label={leave.Status}
                        icon={getStatusIcon(leave.Status)}
                        size="small"
                        variant="outlined"
                      />
                      {leave.ProcessRemarks && (
                        <Tooltip title={leave.ProcessRemarks}>
                          <InfoIcon 
                            fontSize="small" 
                            sx={{ 
                              ml: 1, 
                              fontSize: 16, 
                              color: 'text.secondary',
                              cursor: 'help',
                              verticalAlign: 'middle'
                            }} 
                          />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <EventIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption">
                          {formatDate(leave.AppliedOn)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {leave.ProcessedOn ? (
                        <Box>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption">
                              {formatDate(leave.ProcessedOn)}
                            </Typography>
                          </Box>
                          {leave.ProcessedBy && (
                            <Typography variant="caption" color="text.secondary">
                              By: {leave.ProcessedBy._id || 'System'}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Not processed
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No leave records found
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {statusFilter !== 'all' || leaveTypeFilter !== 'all' 
                        ? 'Try clearing the filters' 
                        : 'This employee has not applied for any leaves yet'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={leaveData.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default EmployeeLeaveSummary;