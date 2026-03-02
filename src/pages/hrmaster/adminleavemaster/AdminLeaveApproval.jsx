import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  Button,
  TablePagination,
  Chip,
  MenuItem,
  Select,
  FormControl,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Menu,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Sort as SortIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Event as EventIcon,
  Refresh as RefreshIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
   MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  CloseSharp
} from "@mui/icons-material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

const HEADER_GRADIENT = "linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)";

const AdminLeaveApproval = () => {
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId") || "admin";

  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortBy, setSortBy] = useState("AppliedOn");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [processing, setProcessing] = useState(false);

  const [actionAnchor, setActionAnchor] = useState(null);



  // View details dialog
  const [openViewDialog, setOpenViewDialog] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Fetch pending leaves on component mount
  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, sortOrder, sortBy, leaves]);

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/leaves/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Pending leaves response:", response.data);
      
      // Extract data from the response structure
      const leavesData = response.data.data || [];
      setLeaves(leavesData);
      
      // Update stats
      setStats({
        pending: leavesData.length,
        approved: 0,
        rejected: 0
      });
      
    } catch (error) {
      console.error("Error fetching pending leaves:", error);
      showSnackbar("Failed to load pending leave applications", "error");
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let data = [...leaves];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (leave) =>
          leave.EmployeeID?.FirstName?.toLowerCase().includes(term) ||
          leave.EmployeeID?.LastName?.toLowerCase().includes(term) ||
          leave.EmployeeID?.FullName?.toLowerCase().includes(term) ||
          leave.EmployeeID?.EmployeeID?.toLowerCase().includes(term) ||
          leave.LeaveTypeID?.Name?.toLowerCase().includes(term) ||
          leave.Reason?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "All") {
      data = data.filter((leave) => 
        leave.Status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Sort
    data.sort((a, b) => {
      let valueA, valueB;
      
      switch(sortBy) {
        case 'AppliedOn':
          valueA = new Date(a.AppliedOn || a.CreatedAt);
          valueB = new Date(b.AppliedOn || b.CreatedAt);
          break;
        case 'StartDate':
          valueA = new Date(a.StartDate);
          valueB = new Date(b.StartDate);
          break;
        case 'NumberOfDays':
          valueA = a.NumberOfDays || 0;
          valueB = b.NumberOfDays || 0;
          break;
        case 'EmployeeName':
          valueA = (a.EmployeeID?.FullName || `${a.EmployeeID?.FirstName} ${a.EmployeeID?.LastName}`).toLowerCase();
          valueB = (b.EmployeeID?.FullName || `${b.EmployeeID?.FirstName} ${b.EmployeeID?.LastName}`).toLowerCase();
          break;
        default:
          valueA = new Date(a.AppliedOn || a.CreatedAt);
          valueB = new Date(b.AppliedOn || b.CreatedAt);
      }
      
      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setFilteredLeaves(data);
  };

  const handleProcessClick = (leave, action) => {
    setSelectedLeave(leave);
    setActionType(action);
    setRemarks("");
    setOpenDialog(true);
  };

  const handleViewDetails = (leave) => {
    setSelectedLeave(leave);
    setOpenViewDialog(true);
  };


  const handleActionOpen = (event, leave) => {
  setActionAnchor(event.currentTarget);
  setSelectedLeave(leave);
};

const handleActionClose = () => {
  setActionAnchor(null);
};

  const handleProcessConfirm = async () => {
    if (!selectedLeave || !actionType) return;

    try {
      setProcessing(true);
      
      const payload = {
        status: actionType,
        remarks: remarks || `${actionType} by admin`,
        approvedBy: currentUserId
      };

      console.log(`Processing leave ${selectedLeave._id} with status: ${actionType}`);
      console.log("Payload:", payload);

      const response = await axios.put(
        `${BASE_URL}/api/leaves/${selectedLeave._id}/process`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Process response:", response.data);

      showSnackbar(`Leave ${actionType.toLowerCase()} successfully`, "success");
      
      // Close dialog
      setOpenDialog(false);
      
      // Refresh the pending leaves list
      await fetchPendingLeaves();
      
    } catch (error) {
      console.error("Error processing leave:", error);
      const errorMessage = error.response?.data?.message || "Error processing leave application";
      showSnackbar(errorMessage, "error");
    } finally {
      setProcessing(false);
      setSelectedLeave(null);
      setActionType(null);
      setRemarks("");
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLeave(null);
    setActionType(null);
    setRemarks("");
  };

  const exportCSV = () => {
    try {
      const headers = [
        "Employee ID",
        "Employee Name",
        "Department",
        "Designation",
        "Leave Type",
        "From Date",
        "To Date",
        "Days",
        "Reason",
        "Contact Number",
        "Address",
        "Status",
        "Applied On"
      ];
      
      const csvData = filteredLeaves.map((l) => [
        l.EmployeeID?.EmployeeID || 'N/A',
        l.EmployeeID?.FullName || `${l.EmployeeID?.FirstName || ''} ${l.EmployeeID?.LastName || ''}`.trim() || 'N/A',
        l.EmployeeID?.DepartmentID?.DepartmentName || 'N/A',
        l.EmployeeID?.DesignationID?.DesignationName || 'N/A',
        l.LeaveTypeID?.Name || 'N/A',
        new Date(l.StartDate).toLocaleDateString(),
        new Date(l.EndDate).toLocaleDateString(),
        l.NumberOfDays || '1',
        l.Reason || 'N/A',
        l.ContactNumber || 'N/A',
        l.AddressDuringLeave || 'N/A',
        l.Status || 'N/A',
        new Date(l.AppliedOn || l.CreatedAt).toLocaleDateString()
      ]);

      const csv = [headers, ...csvData].map(row => row.join(",")).join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `pending_leaves_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      showSnackbar("Export successful", "success");
    } catch (error) {
      console.error("Export error:", error);
      showSnackbar("Failed to export data", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getEmployeeName = (leave) => {
    if (leave.EmployeeID?.FullName) return leave.EmployeeID.FullName;
    if (leave.EmployeeID?.FirstName || leave.EmployeeID?.LastName) {
      return `${leave.EmployeeID.FirstName || ''} ${leave.EmployeeID.LastName || ''}`.trim();
    }
    return 'Unknown Employee';
  };

  const getAvatarInitials = (leave) => {
    const name = getEmployeeName(leave);
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase() || 'U';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDaysDifference = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Including both start and end dates
  };

  const paginatedData = filteredLeaves.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box >
      {/* Header */}
      <Typography
        variant="h5"
        fontWeight={600}
        sx={{
          background: HEADER_GRADIENT,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 1
        }}
      >
        Admin Leave Approval
      </Typography>

      <Typography variant="body1" color="#64748B" sx={{ mb: 3 }}>
        Review and process employee leave applications
      </Typography>

      {/* Stats Cards */}
      {/* <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(5, 1fr)' },
          gap: 2,
          mb: 3
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            bgcolor: '#fff3e0'
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Pending Approvals
          </Typography>
          <Typography variant="h5" fontWeight={600} sx={{ color: '#ed6c02' }}>
            {stats.pending}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            bgcolor: '#e8f5e9'
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Approved Today
          </Typography>
          <Typography variant="h5" fontWeight={600} sx={{ color: '#2e7d32' }}>
            {stats.approved}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            bgcolor: '#ffebee'
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Rejected Today
          </Typography>
          <Typography variant="h5" fontWeight={600} sx={{ color: '#d32f2f' }}>
            {stats.rejected}
          </Typography>
        </Paper>
      </Box> */}

      {/* Action Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flex={1}>
            <TextField
              size="small"
              placeholder="Search employee, leave type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: { xs: '100%', sm: 500 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#64748B' }} />
                  </InputAdornment>
                )
              }}
            />

            {/* <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl> */}

            {/* <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="AppliedOn">Sort by Applied Date</MenuItem>
                <MenuItem value="StartDate">Sort by Start Date</MenuItem>
                <MenuItem value="NumberOfDays">Sort by Days</MenuItem>
                <MenuItem value="EmployeeName">Sort by Employee Name</MenuItem>
              </Select>
            </FormControl> */}

            {/* <Button
              variant="outlined"
              startIcon={<SortIcon />}
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? "Ascending ↑" : "Descending ↓"}
            </Button> */}
          </Stack>

          <Stack direction="row" spacing={2}>
            {/* <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportCSV}
              disabled={filteredLeaves.length === 0}
            >
              Export
            </Button> */}
{/*             
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchPendingLeaves}
              disabled={loading}
              sx={{
                background: HEADER_GRADIENT,
                '&:hover': {
                  background: 'linear-gradient(135deg, #0e7490 0%, #00B4D8 50%, #164e63 100%)'
                }
              }}
            >
              Refresh
            </Button> */}
          </Stack>
        </Stack>
      </Paper>

      {/* Table */}
      <Paper sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: HEADER_GRADIENT }}>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Employee</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Leave Type</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Duration</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Days</TableCell>
                {/* <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Reason</TableCell> */}
                {/* <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Contact</TableCell> */}
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Applied On</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                      Loading leave applications...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((leave) => (
                  <TableRow 
                    key={leave._id} 
                    hover
                    sx={{ '&:hover': { bgcolor: '#f8fafc' } }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar 
                          sx={{ 
                            width: 36, 
                            height: 36, 
                            bgcolor: '#00B4D8',
                            fontSize: '0.875rem',
                            fontWeight: 600
                          }}
                        >
                          {getAvatarInitials(leave)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {getEmployeeName(leave)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {leave.EmployeeID?.EmployeeID} • {leave.EmployeeID?.DepartmentID?.DepartmentName || 'No Dept'}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={leave.LeaveTypeID?.Name || 'Unknown Type'}
                        size="small"
                        sx={{ 
                          bgcolor: '#e0f2fe',
                          color: '#0369a1',
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          From: {formatDate(leave.StartDate)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          To: {formatDate(leave.EndDate)}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={leave.NumberOfDays || calculateDaysDifference(leave.StartDate, leave.EndDate)}
                        size="small"
                        sx={{ 
                          bgcolor: '#f1f5f9',
                          fontWeight: 600,
                          minWidth: 40
                        }}
                      />
                    </TableCell>
                    {/* <TableCell>
                      <Tooltip title={leave.Reason || 'No reason provided'}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 150,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {leave.Reason || 'No reason provided'}
                        </Typography>
                      </Tooltip>
                    </TableCell> */}
                    {/* <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" display="flex" alignItems="center" gap={0.5}>
                          <PhoneIcon sx={{ fontSize: 14, color: '#64748b' }} />
                          {leave.ContactNumber || 'N/A'}
                        </Typography>
                      </Stack>
                    </TableCell> */}
                    <TableCell>
                      <Typography variant="caption">
                        {formatDateTime(leave.AppliedOn || leave.CreatedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={leave.Status || 'Pending'}
                        color={getStatusColor(leave.Status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
<TableCell align="center">
  <IconButton onClick={(e) => handleActionOpen(e, leave)}>
    <MoreVertIcon />
  </IconButton>
</TableCell>

                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <EventIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No Pending Leave Applications
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {searchTerm || statusFilter !== 'All' 
                        ? 'Try adjusting your filters' 
                        : 'All leave requests have been processed'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Menu
  anchorEl={actionAnchor}
  open={Boolean(actionAnchor)}
  onClose={handleActionClose}
>
  <MenuItem
    onClick={() => {
      handleViewDetails(selectedLeave);
      handleActionClose();
    }}
  >
    <ListItemIcon>
      <ViewIcon fontSize="small" />
    </ListItemIcon>
    <ListItemText>View</ListItemText>
  </MenuItem>

  {selectedLeave?.Status === "Pending" && (
    <>
      <MenuItem
        onClick={() => {
          handleProcessClick(selectedLeave, "Approved");
          handleActionClose();
        }}
      >
        <ListItemIcon>
          <ApproveIcon fontSize="small" color="success" />
        </ListItemIcon>
        <ListItemText>Approve</ListItemText>
      </MenuItem>

      <MenuItem
        onClick={() => {
          handleProcessClick(selectedLeave, "Rejected");
          handleActionClose();
        }}
      >
        <ListItemIcon>
          <RejectIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText>Reject</ListItemText>
      </MenuItem>
    </>
  )}
</Menu>


        {filteredLeaves.length > 0 && (
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

      {/* Process Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ 
          background: actionType === 'Approved' ? '#2e7d32' : '#d32f2f',
          color: 'white',
          fontWeight: 600,
          py: 2
        }}>
          {actionType === 'Approved' ? 'Approve Leave Application' : 'Reject Leave Application'}
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          {selectedLeave && (
            <Card variant="outlined" sx={{ mb: 3, bgcolor: '#f8fafc' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle2" gutterBottom color="primary">
                  Leave Details
                </Typography>
                <Stack spacing={1.5} >
                  <Stack spacing={21} direction="row"> 
                  <Box>
                    <Typography variant="caption" color="text.secondary">Employee</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {getEmployeeName(selectedLeave)} ({selectedLeave.EmployeeID?.EmployeeID})
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Leave Type</Typography>
                    <Typography variant="body2">{selectedLeave.LeaveTypeID?.Name}</Typography>
                  </Box>
                  </Stack>
                  <Stack spacing={10} direction="row"> 
                  <Box>
                    <Typography variant="caption" color="text.secondary">Duration</Typography>
                    <Typography variant="body2">
                      {formatDate(selectedLeave.StartDate)} to {formatDate(selectedLeave.EndDate)}
                      {' '}({selectedLeave.NumberOfDays || calculateDaysDifference(selectedLeave.StartDate, selectedLeave.EndDate)} days)
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Reason</Typography>
                    <Typography variant="body2">{selectedLeave.Reason || 'No reason provided'}</Typography>
                  </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          )}
          
          <TextField
            label="Remarks"
            multiline
            rows={2}
            fullWidth
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder={`Add remarks for ${actionType?.toLowerCase()} request...`}
            variant="outlined"
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleCloseDialog} disabled={processing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={actionType === 'Approved' ? 'success' : 'error'}
            onClick={handleProcessConfirm}
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : null}
          >
            {processing ? 'Processing...' : `Confirm ${actionType}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
     {/* View Details Dialog */}
<Dialog
  open={openViewDialog}
  onClose={() => setOpenViewDialog(false)}
  maxWidth="sm"
  fullWidth
  PaperProps={{ sx: { borderRadius: 2 } }}
>
  {/* Header */}
  <DialogTitle
    sx={{
      borderBottom: "1px solid #E0E0E0",
      py: 1,
      backgroundColor: "#F8FAFC",
    }}
  >
    <Typography fontSize={18} fontWeight={600} color="#101010">
      Leave Application Details
    </Typography>
  </DialogTitle>

  {/* Content */}
  <DialogContent sx={{ pt: 1.5, pb: 1 }}>
    {selectedLeave && (
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
            {getAvatarInitials(selectedLeave)}
          </Avatar>
          <Box>
            <Typography fontWeight={600}>
              {getEmployeeName(selectedLeave)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {selectedLeave.EmployeeID?.EmployeeID}
            </Typography>
          </Box>
        </Stack>

        <Divider />

        {/* Leave Details */}
        <Stack spacing={1.5}>
          <Typography variant="subtitle2" fontWeight={600}>
            Leave Details
          </Typography>

          <Stack direction="row" spacing={2}>
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary">
                Leave Type
              </Typography>
              <Typography fontWeight={600}>
                {selectedLeave.LeaveTypeID?.Name}
              </Typography>
            </Box>

            <Box flex={1}>
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography><br></br>
              <Chip
                label={selectedLeave.Status}
                size="small"
                color={getStatusColor(selectedLeave.Status)}
              />
            </Box>

            <Box flex={1}>
              <Typography variant="caption" color="text.secondary">
                Duration
              </Typography>
              <Typography>
                {formatDate(selectedLeave.StartDate)} {" "}
                {formatDate(selectedLeave.EndDate)}
              </Typography>
            </Box>

            <Box flex={1}>
              <Typography variant="caption" color="text.secondary">
                Days
              </Typography>
              <Typography fontWeight={600}>
                {selectedLeave.NumberOfDays ||
                  calculateDaysDifference(
                    selectedLeave.StartDate,
                    selectedLeave.EndDate
                  )}{" "}
                days
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2}>
            

            
          </Stack>
        </Stack>

        <Divider />

        {/* Contact Info */}
        <Stack spacing={1}  >
          <Typography variant="subtitle2" fontWeight={600}>
            Contact Information
          </Typography>

                  <Stack direction="row" spacing={10}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Contact Number
            </Typography>
            <Typography>
              {selectedLeave.ContactNumber || "Not provided"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Address During Leave
            </Typography>
            <Typography>
              {selectedLeave.AddressDuringLeave || "Not specified"}
            </Typography>
          </Box>
          </Stack>
        </Stack>

        <Divider />

        {/* Reason */}
        <Stack spacing={1}>
          <Typography variant="subtitle2" fontWeight={600}>
            Reason
          </Typography>
          <Typography
            variant="body2"
            sx={{
              backgroundColor: "#F8FAFC",
              p: 1,
              borderRadius: 1,
              minHeight: 50,
              lineHeight: 1.4,
            }}
          >
            {selectedLeave.Reason || "No reason provided"}
          </Typography>
        </Stack>

        <Divider />

        {/* System Info */}
        <Stack spacing={1}>
          <Typography variant="subtitle2" fontWeight={600}>
            System Information
          </Typography>

          <Stack direction="row" spacing={2}>
            <Box flex={1}>
              <Typography variant="caption" color="text.secondary">
                Applied On
              </Typography>
              <Typography variant="body2">
                {formatDateTime(selectedLeave.AppliedOn)}
              </Typography>
            </Box>

            <Box flex={1}>
              <Typography variant="caption" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body2">
                {formatDateTime(selectedLeave.UpdatedAt)}
              </Typography>
            </Box>
          </Stack>

          {/* <Box>
            <Typography variant="caption" color="text.secondary">
              Application ID
            </Typography>
            <Typography variant="body2">{selectedLeave._id}</Typography>
          </Box> */}
        </Stack>
      </Stack>
    )}
  </DialogContent>

  {/* Actions */}
  <DialogActions
    sx={{
      px: 3,
      pb: 2,
      pt: 2,
      borderTop: "1px solid #E0E0E0",
      backgroundColor: "#F8FAFC",
    }}
  >
    <Button
      variant="contained"
      onClick={() => setOpenViewDialog(false)}
      startIcon={<CloseSharp />}
      sx={{
        borderRadius: 1,
        px: 3,
        py: 1,
        textTransform: "none",
        fontWeight: 500,
        backgroundColor: "#1976D2",
        "&:hover": { backgroundColor: "#1565C0" },
      }}
    >
      Close
    </Button>
  </DialogActions>
</Dialog>


      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminLeaveApproval;