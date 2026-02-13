// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Typography,
//   Stack,
//   TextField,
//   InputAdornment,
//   Button,
//   TablePagination,
//   Chip,
//   MenuItem,
//   Select,
//   FormControl,
//   Snackbar,
//   Alert,
//   alpha
// } from "@mui/material";
// import {
//   Search as SearchIcon,
//   Download as DownloadIcon,
//   Add as AddIcon,
//   Sort as SortIcon
// } from "@mui/icons-material";
// import axios from "axios";
// import BASE_URL from "../../../config/Config";
// import ApplyLeave from "./ApplyLeave";

// const HEADER_GRADIENT =
//   "linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)";

// const PRIMARY_BLUE = "#00B4D8";

// const EmployeeLeaveMaster = () => {
//   const [leaves, setLeaves] = useState([]);
//   const [filteredLeaves, setFilteredLeaves] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [sortField, setSortField] = useState("fromDate");
//   const [sortOrder, setSortOrder] = useState("desc");

//   const [openModal, setOpenModal] = useState(false);


//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);

//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success"
//   });

// useEffect(() => {
//     applyFilters();
//   }, [searchTerm, statusFilter, sortField, sortOrder, leaves]);

//   const employeeId = localStorage.getItem("employeeId");
//   useEffect(() => {
//     if (employeeId) {
//       fetchLeaves();
//     } 
//   }, [employeeId]);
//   const fetchLeaves = async () => {
//       if (!employeeId) {
//     console.error("No employeeId found");
//     return;
//   }
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.get(
//         `${BASE_URL}/api/leaves/employee/${employeeId}`,
//         {
//           headers: { Authorization: `Bearer ${token}` }
//         }
//       );

//       setLeaves(res.data.data || res.data);
//     } catch (err) {
//       showSnackbar("Failed to load leaves", "error");
//     }
//   };

//   const applyFilters = () => {
//     let data = [...leaves];

//     // Search
//     if (searchTerm) {
//       data = data.filter(
//         (leave) =>
//           leave.leaveTypeId?.Name
//             ?.toLowerCase()
//             .includes(searchTerm.toLowerCase()) ||
//           leave.status?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     // Filter
//     if (statusFilter !== "All") {
//       data = data.filter((leave) => leave.status === statusFilter);
//     }

//     // Sort
//     data.sort((a, b) => {
//       if (sortOrder === "asc") {
//         return new Date(a[sortField]) - new Date(b[sortField]);
//       } else {
//         return new Date(b[sortField]) - new Date(a[sortField]);
//       }
//     });

//     setFilteredLeaves(data);
//   };

//   const handleCancel = async (id) => {
//     try {
//       const token = localStorage.getItem("token");
//       await axios.put(
//         `${BASE_URL}/api/leaves/${id}/cancel`,
//         {},
//         {
//           headers: { Authorization: `Bearer ${token}` }
//         }
//       );

//       showSnackbar("Leave cancelled successfully", "success");
//       fetchLeaves();
//     } catch {
//       showSnackbar("Cancel failed", "error");
//     }
//   };

//   const showSnackbar = (message, severity) => {
//     setSnackbar({ open: true, message, severity });
//   };

//   const exportCSV = () => {
//     const csv = [
//       ["Leave Type", "From", "To", "Status"],
//       ...filteredLeaves.map((l) => [
//         l.leaveTypeId?.Name,
//         l.fromDate,
//         l.toDate,
//         l.status
//       ])
//     ]
//       .map((e) => e.join(","))
//       .join("\n");

//     const blob = new Blob([csv], { type: "text/csv" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = "my_leaves.csv";
//     link.click();
//   };

//   const paginatedData = filteredLeaves.slice(
//     page * rowsPerPage,
//     page * rowsPerPage + rowsPerPage
//   );

//   return (
//     <Box sx={{ p: 3 }}>
//       {/* Header */}
//       <Typography
//         variant="h5"
//         fontWeight={600}
//         sx={{
//           background: HEADER_GRADIENT,
//           WebkitBackgroundClip: "text",
//           WebkitTextFillColor: "transparent"
//         }}
//       >
//         My Leaves
//       </Typography>

//       <Typography variant="body2" color="#64748B" sx={{ mb: 3 }}>
//         View, apply and manage your leave requests
//       </Typography>

//       {/* Action Bar */}
//       <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
//         <Stack direction="row" spacing={2} justifyContent="space-between">
//           <Stack direction="row" spacing={2}>
//             <TextField
//               size="small"
//               placeholder="Search..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <SearchIcon />
//                   </InputAdornment>
//                 )
//               }}
//             />

//             <FormControl size="small">
//               <Select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//               >
//                 <MenuItem value="All">All Status</MenuItem>
//                 <MenuItem value="Pending">Pending</MenuItem>
//                 <MenuItem value="Approved">Approved</MenuItem>
//                 <MenuItem value="Rejected">Rejected</MenuItem>
//                 <MenuItem value="Cancelled">Cancelled</MenuItem>
//               </Select>
//             </FormControl>

//             <Button
//               variant="outlined"
//               startIcon={<SortIcon />}
//               onClick={() =>
//                 setSortOrder(sortOrder === "asc" ? "desc" : "asc")
//               }
//             >
//               Sort
//             </Button>
//           </Stack>

//           <Stack direction="row" spacing={2}>
//             <Button
//               variant="outlined"
//               startIcon={<DownloadIcon />}
//               onClick={exportCSV}
//             >
//               Export
//             </Button>

//             <Button
//               variant="contained"
//               startIcon={<AddIcon />}
//               sx={{ background: HEADER_GRADIENT }}
//               onClick={() => setOpenModal(true)}
//             >
//               Apply Leave
//             </Button>

//           </Stack>
//         </Stack>
//       </Paper>

//       {/* Table */}
//       <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
//         <TableContainer>
//           <Table>
//             <TableHead>
//               <TableRow sx={{ background: HEADER_GRADIENT }}>
//                 {["Leave Type", "From", "To", "Status", "Action"].map(
//                   (head) => (
//                     <TableCell
//                       key={head}
//                       sx={{ color: "#fff", fontWeight: 600 }}
//                     >
//                       {head}
//                     </TableCell>
//                   )
//                 )}
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {paginatedData.map((leave) => (
//                 <TableRow key={leave._id} hover>
//                   <TableCell>{leave.leaveTypeId?.Name}</TableCell>
//                   <TableCell>{leave.fromDate}</TableCell>
//                   <TableCell>{leave.toDate}</TableCell>
//                   <TableCell>
//                     <Chip
//                       label={leave.status}
//                       size="small"
//                       sx={{
//                         backgroundColor:
//                           leave.status === "Approved"
//                             ? "#dcfce7"
//                             : leave.status === "Rejected"
//                               ? "#fee2e2"
//                               : leave.status === "Pending"
//                                 ? "#fef9c3"
//                                 : "#e2e8f0"
//                       }}
//                     />
//                   </TableCell>
//                   <TableCell>
//                     {leave.status === "Pending" && (
//                       <Button
//                         color="error"
//                         size="small"
//                         onClick={() => handleCancel(leave._id)}
//                       >
//                         Cancel
//                       </Button>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>

//         <TablePagination
//           rowsPerPageOptions={[5, 10, 25]}
//           component="div"
//           count={filteredLeaves.length}
//           rowsPerPage={rowsPerPage}
//           page={page}
//           onPageChange={(e, newPage) => setPage(newPage)}
//           onRowsPerPageChange={(e) =>
//             setRowsPerPage(parseInt(e.target.value, 10))
//           }
//         />
//       </Paper>

//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//       >
//         <Alert severity={snackbar.severity} variant="filled">
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//       <ApplyLeave
//         open={openModal}
//         handleClose={() => setOpenModal(false)}
//         onSuccess={fetchLeaves}
//       />
//     </Box>

//   );
// };

// export default EmployeeLeaveMaster;


// EmployeeLeaveMaster.jsx
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
  Card,
  CardContent,
  Grid,
  LinearProgress
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
  Celebration as CelebrationIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

// Import components
import ApplyLeave from './ApplyLeave';
import ViewHoliday from './ViewHoliday'; // Import the new ViewHoliday component

const HEADER_GRADIENT = 'linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)';

const EmployeeLeaveMaster = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal states
  const [openApplyLeave, setOpenApplyLeave] = useState(false);
  const [openViewHoliday, setOpenViewHoliday] = useState(false); // State for ViewHoliday modal

  // Action menu
  const [actionAnchor, setActionAnchor] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchEmployeeLeaves();
  }, []);

  const fetchEmployeeLeaves = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/employee/leaves`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setLeaves(response.data.data || []);
        setFilteredLeaves(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      showNotification('Failed to load leave applications', 'error');
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
      leave.LeaveType?.Name?.toLowerCase().includes(value) ||
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
    if (success) {
      fetchEmployeeLeaves();
      showNotification('Leave applied successfully');
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

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const paginatedLeaves = filteredLeaves.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calculate leave stats
  const totalLeaves = leaves.length;
  const pendingLeaves = leaves.filter(l => l.Status === 'Pending').length;
  const approvedLeaves = leaves.filter(l => l.Status === 'Approved').length;
  const rejectedLeaves = leaves.filter(l => l.Status === 'Rejected').length;

  //
  const stats = [
    { label: 'Total Leaves', value: totalLeaves, color: '#164e63', bg: '#f1f5f9' },
    { label: 'Pending', value: pendingLeaves, color: '#ed6c02', bg: '#fff3e0' },
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
          Apply for leave and track your applications
        </Typography>
      </Box>

      {/* Stats Cards */}
      {/* <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', minWidth: '50px' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Leaves
              </Typography>
              <Typography variant="h4" fontWeight={600}>
                {totalLeaves}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#fef9e7' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Pending
              </Typography>
              <Typography variant="h4" fontWeight={600} color="#ed6c02">
                {pendingLeaves}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#edf7ed' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Approved
              </Typography>
              <Typography variant="h4" fontWeight={600} color="#2e7d32">
                {approvedLeaves}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#fdeded' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Rejected
              </Typography>
              <Typography variant="h4" fontWeight={600} color="#d32f2f">
                {rejectedLeaves}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid> */}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 1
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
          </Paper>
        ))}
      </Box>


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
              sx={{ justifyContent: { xs: 'flex-start', sm: 'center' } }}
            >
              Filter
            </Button>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
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
              ) : paginatedLeaves.length > 0 ? (
                paginatedLeaves.map((leave) => (
                  <TableRow key={leave._id} hover>
                    <TableCell>
                      <Typography fontWeight={500}>
                        {leave.LeaveType?.Name || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(leave.FromDate)}</TableCell>
                    <TableCell>{formatDate(leave.ToDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={leave.TotalDays || 1}
                        size="small"
                        sx={{ bgcolor: '#f1f5f9' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {leave.Reason || 'No reason provided'}
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
                    <TableCell>{formatDate(leave.CreatedAt)}</TableCell>
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
                      You haven't applied for any leave yet
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
      <ApplyLeave
        open={openApplyLeave}
        handleClose={handleApplyLeaveClose}
      />

      {/* View Holidays Modal */}
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