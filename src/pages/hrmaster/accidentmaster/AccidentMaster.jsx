// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   IconButton,
//   Button,
//   TextField,
//   InputAdornment,
//   Typography,
//   Snackbar,
//   TablePagination,
//   Stack,
//   Alert,
//   Chip,
//   Menu,
//   MenuItem,
//   ListItemIcon,
//   ListItemText,
//   Grid,
//   Card,
//   CardContent
// } from '@mui/material';
// import {
//   Search as SearchIcon,
//   Add as AddIcon,
//   Visibility as ViewIcon,
//   Edit as EditIcon,
//   MoreVert as MoreVertIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';

// import AddAccident from './AddAccident';
// import EditAccident from './EditAccident';
// import ViewAccident from './ViewAccident';

// const HEADER_GRADIENT =
//   'linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)';

// const AccidentMaster = () => {
//   const [accidents, setAccidents] = useState([]);
//   const [filteredAccidents, setFilteredAccidents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');

//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);

//   const [openAdd, setOpenAdd] = useState(false);
//   const [openEdit, setOpenEdit] = useState(false);
//   const [openView, setOpenView] = useState(false);

//   const [selectedAccident, setSelectedAccident] = useState(null);
//   const [anchorEl, setAnchorEl] = useState(null);

//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: '',
//     severity: 'success'
//   });

//   useEffect(() => {
//     fetchAccidents();
//   }, []);

//   const fetchAccidents = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(
//         `${BASE_URL}/api/safety/accidents`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.data.success) {
//         setAccidents(response.data.data || []);
//         setFilteredAccidents(response.data.data || []);
//       }
//     } catch (err) {
//       showNotification('Failed to load accidents', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchTerm(value);

//     const filtered = accidents.filter((a) =>
//       a.location?.toLowerCase().includes(value) ||
//       a.machineName?.toLowerCase().includes(value) ||
//       a.injuryType?.toLowerCase().includes(value) ||
//       a.severity?.toLowerCase().includes(value)
//     );

//     setFilteredAccidents(filtered);
//     setPage(0);
//   };

//   /* =================== STATS =================== */

//   const totalAccidents = accidents.length;
//   const openCases = accidents.filter(a => a.investigationStatus === 'Open').length;
//   const closedCases = accidents.filter(a => a.investigationStatus === 'Closed').length;
//   const totalCost = accidents.reduce((sum, a) => sum + (a.costIncurred || 0), 0);

//   const getSeverityColor = (severity) => {
//     if (severity === 'Minor') return 'success';
//     if (severity === 'Moderate') return 'info';
//     if (severity === 'Severe') return 'warning';
//     if (severity === 'Fatal') return 'error';
//     return 'default';
//   };

//   const getStatusColor = (status) => {
//     if (status === 'Open') return 'error';
//     if (status === 'Closed') return 'success';
//     return 'warning';
//   };

//   const showNotification = (message, severity) => {
//     setSnackbar({ open: true, message, severity });
//   };

//   const paginatedData = filteredAccidents.slice(
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
//           WebkitBackgroundClip: 'text',
//           WebkitTextFillColor: 'transparent',
//           mb: 3
//         }}
//       >
//         Accident / Incident Management
//       </Typography>

//       {/* 🔥 BEAUTIFUL STATS CARDS */}
//       <Grid container spacing={3} mb={3}>

//         <Grid item xs={12} md={3}>
//           <Card sx={{ bgcolor: '#E3F2FD', borderRadius: 3 }}>
//             <CardContent>
//               <Typography variant="subtitle2" color="text.secondary">
//                 Total Accidents
//               </Typography>
//               <Typography variant="h4" fontWeight={700}>
//                 {totalAccidents}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} md={3}>
//           <Card sx={{ bgcolor: '#FFF3E0', borderRadius: 3 }}>
//             <CardContent>
//               <Typography variant="subtitle2" color="text.secondary">
//                 Open Cases
//               </Typography>
//               <Typography variant="h4" fontWeight={700}>
//                 {openCases}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} md={3}>
//           <Card sx={{ bgcolor: '#E8F5E9', borderRadius: 3 }}>
//             <CardContent>
//               <Typography variant="subtitle2" color="text.secondary">
//                 Closed Cases
//               </Typography>
//               <Typography variant="h4" fontWeight={700}>
//                 {closedCases}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} md={3}>
//           <Card sx={{ bgcolor: '#FFEBEE', borderRadius: 3 }}>
//             <CardContent>
//               <Typography variant="subtitle2" color="text.secondary">
//                 Total Cost
//               </Typography>
//               <Typography variant="h4" fontWeight={700}>
//                 ₹ {totalCost}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//       </Grid>

//       {/* Action Bar */}
//       <Paper sx={{ p: 2, mb: 3 }}>
//         <Stack direction="row" justifyContent="space-between">
//           <TextField
//             size="small"
//             placeholder="Search by location, machine, severity..."
//             value={searchTerm}
//             onChange={handleSearch}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon />
//                 </InputAdornment>
//               )
//             }}
//           />

//           <Button
//             variant="contained"
//             startIcon={<AddIcon />}
//             onClick={() => setOpenAdd(true)}
//           >
//             Add Accident
//           </Button>
//         </Stack>
//       </Paper>

//       {/* Table */}
//       <Paper>
//         <TableContainer>
//           <Table>
//             <TableHead>
//               <TableRow sx={{ background: HEADER_GRADIENT }}>
//                 <TableCell sx={{ color: '#fff' }}>Date</TableCell>
//                 <TableCell sx={{ color: '#fff' }}>Location</TableCell>
//                 <TableCell sx={{ color: '#fff' }}>Machine</TableCell>
//                 <TableCell sx={{ color: '#fff' }}>Severity</TableCell>
//                 <TableCell sx={{ color: '#fff' }}>Status</TableCell>
//                 <TableCell sx={{ color: '#fff' }} align="center">
//                   Actions
//                 </TableCell>
//               </TableRow>
//             </TableHead>

//             <TableBody>
//               {paginatedData.map((accident) => (
//                 <TableRow key={accident._id} hover>
//                   <TableCell>
//                     {new Date(accident.date).toLocaleDateString()}
//                   </TableCell>
//                   <TableCell>{accident.location}</TableCell>
//                   <TableCell>{accident.machineName}</TableCell>
//                   <TableCell>
//                     <Chip
//                       label={accident.severity}
//                       color={getSeverityColor(accident.severity)}
//                       size="small"
//                     />
//                   </TableCell>
//                   <TableCell>
//                     <Chip
//                       label={accident.investigationStatus}
//                       color={getStatusColor(accident.investigationStatus)}
//                       size="small"
//                     />
//                   </TableCell>
//                   <TableCell align="center">
//                     <IconButton
//                       onClick={(e) => {
//                         setAnchorEl(e.currentTarget);
//                         setSelectedAccident(accident);
//                       }}
//                     >
//                       <MoreVertIcon />
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Paper>

//       {/* 3 Dot Menu */}
//       <Menu
//         anchorEl={anchorEl}
//         open={Boolean(anchorEl)}
//         onClose={() => setAnchorEl(null)}
//       >
//         <MenuItem onClick={() => { setOpenView(true); setAnchorEl(null); }}>
//           <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
//           <ListItemText>View</ListItemText>
//         </MenuItem>

//         <MenuItem onClick={() => { setOpenEdit(true); setAnchorEl(null); }}>
//           <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
//           <ListItemText>Investigate</ListItemText>
//         </MenuItem>
//       </Menu>

//       {/* Modals */}
//       <AddAccident
//         open={openAdd}
//         onClose={() => setOpenAdd(false)}
//         onAdd={() => {
//           fetchAccidents();
//           showNotification('Accident added successfully', 'success');
//         }}
//       />

//       {selectedAccident && (
//         <>
//           <EditAccident
//             open={openEdit}
//             onClose={() => setOpenEdit(false)}
//             accident={selectedAccident}
//             onUpdate={() => {
//               fetchAccidents();
//               showNotification('Investigation updated successfully', 'success');
//             }}
//           />

//           <ViewAccident
//             open={openView}
//             onClose={() => setOpenView(false)}
//             accident={selectedAccident}
//             onEdit={() => {
//               setOpenView(false);
//               setOpenEdit(true);
//             }}
//           />
//         </>
//       )}

//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//       >
//         <Alert severity={snackbar.severity} variant="filled">
//           {snackbar.message}
//         </Alert>
//       </Snackbar>

//     </Box>
//   );
// };

// export default AccidentMaster;


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
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Tooltip,
  Typography,
  Snackbar,
  TablePagination,
  Checkbox,
  Stack,
  alpha,
  Alert,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpwardIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

import AddAccident from './AddAccident';
import EditAccident from './EditAccident';
import ViewAccident from './ViewAccident';
//import DeleteAccident from './DeleteAccident';

// Color constants
const HEADER_GRADIENT = 'linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)';
const STRIPE_COLOR_ODD = '#FFFFFF';
const STRIPE_COLOR_EVEN = '#f8fafc';
const HOVER_COLOR = '#f1f5f9';
const PRIMARY_BLUE = '#00B4D8';
const TEXT_COLOR_HEADER = '#FFFFFF';
const TEXT_COLOR_MAIN = '#0f172a';

// Action Menu Component
const ActionMenu = ({ accident, onView, onEdit, onDelete, anchorEl, onClose, onOpen }) => {
  return (
    <>
      <Tooltip title="Actions">
        <IconButton
          size="small"
          onClick={onOpen}
          sx={{
            color: '#64748b',
            '&:hover': {
              bgcolor: alpha(PRIMARY_BLUE, 0.1)
            }
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
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
        <MenuItem 
          onClick={() => {
            onView(accident);
            onClose();
          }}
          sx={{ py: 1 }}
        >
          <ListItemIcon sx={{ color: PRIMARY_BLUE, minWidth: 36 }}>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" fontWeight={500}>View Details</Typography>
          </ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            onEdit(accident);
            onClose();
          }}
          sx={{ py: 1 }}
        >
          <ListItemIcon sx={{ color: '#10B981', minWidth: 36 }}>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" fontWeight={500}>Investigate</Typography>
          </ListItemText>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem 
          onClick={() => {
            onDelete(accident);
            onClose();
          }}
          sx={{ py: 1 }}
        >
          {/* <ListItemIcon sx={{ color: '#EF4444', minWidth: 36 }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" fontWeight={500} color="#EF4444">
              Delete
            </Typography>
          </ListItemText> */}
        </MenuItem>
      </Menu>
    </>
  );
};

const AccidentMaster = () => {
  const [accidents, setAccidents] = useState([]);
  const [filteredAccidents, setFilteredAccidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);

  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedAccidentForAction, setSelectedAccidentForAction] = useState(null);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [selectedAccident, setSelectedAccident] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchAccidents();
  }, []);

  const fetchAccidents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/api/safety/accidents`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAccidents(response.data.data || []);
        setFilteredAccidents(response.data.data || []);
      } else {
        showNotification('Failed to load accidents', 'error');
      }
    } catch (err) {
      console.error('Error fetching accidents:', err);
      showNotification('Failed to load accidents. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = accidents.filter(accident =>
      accident.location?.toLowerCase().includes(value) ||
      accident.machineName?.toLowerCase().includes(value) ||
      accident.injuryType?.toLowerCase().includes(value) ||
      accident.severity?.toLowerCase().includes(value) ||
      accident.reportedBy?.name?.toLowerCase().includes(value)
    );

    setFilteredAccidents(filtered);
    setPage(0);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(filteredAccidents.map(accident => accident._id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else {
      newSelected = selected.filter(item => item !== id);
    }
    
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddAccident = (newAccident) => {
    setAccidents([...accidents, newAccident]);
    setFilteredAccidents([...filteredAccidents, newAccident]);
    showNotification('Accident reported successfully!', 'success');
  };

  const handleEditAccident = (updatedAccident) => {
    const updatedAccidents = accidents.map(accident =>
      accident._id === updatedAccident._id ? updatedAccident : accident
    );
    
    setAccidents(updatedAccidents);
    setFilteredAccidents(updatedAccidents);
    showNotification('Investigation updated successfully!', 'success');
  };

  const handleDeleteAccident = (accidentId) => {
    const updatedAccidents = accidents.filter(accident => accident._id !== accidentId);
    setAccidents(updatedAccidents);
    setFilteredAccidents(updatedAccidents);
    setSelected(selected.filter(id => id !== accidentId));
    showNotification('Accident record deleted successfully!', 'success');
  };

  const handleBulkDelete = () => {
    // This would need API implementation for bulk delete
    showNotification('Bulk delete requires API implementation', 'warning');
  };

  const handleActionMenuOpen = (event, accident) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedAccidentForAction(accident);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedAccidentForAction(null);
  };

  const openEditAccidentModal = (accident) => {
    setSelectedAccident(accident);
    setOpenEditModal(true);
    handleActionMenuClose();
  };

  const openViewAccidentModal = (accident) => {
    setSelectedAccident(accident);
    setOpenViewModal(true);
    handleActionMenuClose();
  };

  const openDeleteAccidentDialog = (accident) => {
    setSelectedAccident(accident);
    setOpenDeleteDialog(true);
    handleActionMenuClose();
  };

  const showNotification = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Stats calculations
  const totalAccidents = accidents.length;
  const openCases = accidents.filter(a => a.investigationStatus === 'Open').length;
  const closedCases = accidents.filter(a => a.investigationStatus === 'Closed').length;
  const totalCost = accidents.reduce((sum, a) => sum + (a.costIncurred || 0), 0);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'minor':
        return { bgcolor: '#dcfce7', color: '#166534', border: '1px solid #86efac' };
      case 'moderate':
        return { bgcolor: '#e0f2fe', color: '#0c4a6e', border: '1px solid #7dd3fc' };
      case 'severe':
        return { bgcolor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' };
      case 'fatal':
        return { bgcolor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' };
      default:
        return { bgcolor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' };
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'open':
        return { bgcolor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' };
      case 'investigating':
        return { bgcolor: '#e0f2fe', color: '#0c4a6e', border: '1px solid #7dd3fc' };
      case 'closed':
        return { bgcolor: '#dcfce7', color: '#166534', border: '1px solid #86efac' };
      default:
        return { bgcolor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' };
    }
  };

  const paginatedData = filteredAccidents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h5" 
          component="h1" 
          fontWeight="600" 
          sx={{ 
            color: TEXT_COLOR_MAIN,
            background: HEADER_GRADIENT,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'inline-block'
          }}
        >
          Accident / Incident Management
        </Typography>
        <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
          Track and manage workplace accidents, injuries, and safety incidents
        </Typography>
      </Box>

      {/* Stats Cards */}
      {/* <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }
          }}>
            <CardContent>
              <Typography variant="subtitle2" color="#64748B" gutterBottom>
                Total Accidents
              </Typography>
              <Typography variant="h4" fontWeight={700} color={TEXT_COLOR_MAIN}>
                {totalAccidents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }
          }}>
            <CardContent>
              <Typography variant="subtitle2" color="#64748B" gutterBottom>
                Open Cases
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#991b1b">
                {openCases}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }
          }}>
            <CardContent>
              <Typography variant="subtitle2" color="#64748B" gutterBottom>
                Closed Cases
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#166534">
                {closedCases}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }
          }}>
            <CardContent>
              <Typography variant="subtitle2" color="#64748B" gutterBottom>
                Total Cost
              </Typography>
              <Typography variant="h4" fontWeight={700} color={TEXT_COLOR_MAIN}>
                {formatCurrency(totalCost)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid> */}

      {/* Action Bar */}
      <Paper sx={{ 
        p: 2, 
        mb: 3, 
        borderRadius: 2,
        bgcolor: '#FFFFFF',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0'
      }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
            <TextField
              placeholder="Search by location, machine, severity..."
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              sx={{ 
                width: { xs: '100%', sm: 320 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  '&:hover fieldset': {
                    borderColor: PRIMARY_BLUE,
                  },
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#64748B' }} />
                  </InputAdornment>
                ),
                sx: { 
                  height: 40,
                  bgcolor: '#f8fafc',
                  '& input': {
                    padding: '8px 12px',
                    fontSize: '0.875rem'
                  }
                }
              }}
              disabled={loading}
            />
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              sx={{ 
                height: 40,
                borderRadius: 1.5,
                borderColor: '#cbd5e1',
                color: '#475569',
                fontSize: '0.875rem',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  borderColor: PRIMARY_BLUE,
                  bgcolor: alpha(PRIMARY_BLUE, 0.04)
                }
              }}
              disabled={loading}
            >
              Filter
            </Button>
            <Button
              variant="outlined"
              startIcon={<SortIcon />}
              sx={{ 
                height: 40,
                borderRadius: 1.5,
                borderColor: '#cbd5e1',
                color: '#475569',
                fontSize: '0.875rem',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  borderColor: PRIMARY_BLUE,
                  bgcolor: alpha(PRIMARY_BLUE, 0.04)
                }
              }}
              disabled={loading}
            >
              Sort
            </Button>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            {selected.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleBulkDelete}
                sx={{ 
                  height: 40,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
                disabled={loading}
              >
                Delete ({selected.length})
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{ 
                height: 40,
                borderRadius: 1.5,
                borderColor: '#cbd5e1',
                color: '#475569',
                fontSize: '0.875rem',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  borderColor: PRIMARY_BLUE,
                  bgcolor: alpha(PRIMARY_BLUE, 0.04)
                }
              }}
              disabled={loading}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddModal(true)}
              sx={{
                height: 40,
                borderRadius: 1.5,
                background: HEADER_GRADIENT,
                fontSize: '0.875rem',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  opacity: 0.9,
                  background: HEADER_GRADIENT,
                }
              }}
              disabled={loading}
            >
              Report Accident
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Accidents Table */}
      <Paper sx={{ 
        width: '100%', 
        borderRadius: 2, 
        overflow: 'hidden',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0'
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                background: HEADER_GRADIENT,
                '& .MuiTableCell-root': {
                  borderBottom: 'none',
                  color: TEXT_COLOR_HEADER
                }
              }}>
                <TableCell padding="checkbox" sx={{ width: 60 }}>
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < filteredAccidents.length}
                    checked={filteredAccidents.length > 0 && selected.length === filteredAccidents.length}
                    onChange={handleSelectAll}
                    sx={{
                      color: TEXT_COLOR_HEADER,
                      '&.Mui-checked': {
                        color: TEXT_COLOR_HEADER,
                      },
                      '&.MuiCheckbox-indeterminate': {
                        color: TEXT_COLOR_HEADER,
                      },
                      '& .MuiSvgIcon-root': {
                        fontSize: 20
                      }
                    }}
                    disabled={loading}
                  />
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    Date
                    <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
                  </Stack>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  Location
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  Machine
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  Severity
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  Status
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  Reported By
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  width: 100,
                  color: TEXT_COLOR_HEADER
                }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography color="textSecondary" sx={{ fontStyle: 'italic' }}>
                      Loading accidents...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body1" color="#64748B" fontWeight={500}>
                        {searchTerm ? 'No accidents found' : 'No accidents reported'}
                      </Typography>
                      <Typography variant="body2" color="#94A3B8" sx={{ mt: 1 }}>
                        {searchTerm ? 'Try adjusting your search terms' : 'Report your first accident to get started'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((accident, index) => {
                  const isSelected = selected.includes(accident._id);
                  const isOddRow = index % 2 === 0;
                  const isActionMenuOpen = Boolean(actionMenuAnchor) && 
                    selectedAccidentForAction?._id === accident._id;
                  const severityStyle = getSeverityColor(accident.severity);
                  const statusStyle = getStatusColor(accident.investigationStatus);

                  return (
                    <TableRow
                      key={accident._id}
                      hover
                      selected={isSelected}
                      sx={{ 
                        bgcolor: isOddRow ? STRIPE_COLOR_ODD : STRIPE_COLOR_EVEN,
                        '&:hover': {
                          bgcolor: HOVER_COLOR
                        },
                        '&.Mui-selected': {
                          bgcolor: alpha(PRIMARY_BLUE, 0.08),
                          '&:hover': {
                            bgcolor: alpha(PRIMARY_BLUE, 0.12)
                          }
                        }
                      }}
                    >
                      <TableCell padding="checkbox" sx={{ width: 60 }}>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelect(accident._id)}
                          sx={{
                            color: PRIMARY_BLUE,
                            '&.Mui-checked': {
                              color: PRIMARY_BLUE,
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500} color={TEXT_COLOR_MAIN}>
                          {formatDate(accident.date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="#475569">
                          {accident.location}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500} color={TEXT_COLOR_MAIN}>
                          {accident.machineName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'inline-block',
                            ...severityStyle
                          }}
                        >
                          {accident.severity}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'inline-block',
                            ...statusStyle
                          }}
                        >
                          {accident.investigationStatus}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="#475569">
                          {accident.reportedBy?.name || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ width: 100 }}>
                        <ActionMenu 
                          accident={accident}
                          onView={openViewAccidentModal}
                          onEdit={openEditAccidentModal}
                          onDelete={openDeleteAccidentDialog}
                          anchorEl={isActionMenuOpen ? actionMenuAnchor : null}
                          onClose={handleActionMenuClose}
                          onOpen={(e) => handleActionMenuOpen(e, accident)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAccidents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid #e2e8f0',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '0.875rem',
              color: '#64748B'
            },
            '& .MuiTablePagination-actions button': {
              color: PRIMARY_BLUE,
            }
          }}
        />
      </Paper>

      {/* Modal Components */}
      <AddAccident 
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onAdd={handleAddAccident}
      />

      {selectedAccident && (
        <>
          <EditAccident 
            open={openEditModal}
            onClose={() => {
              setOpenEditModal(false);
              setSelectedAccident(null);
            }}
            accident={selectedAccident}
            onUpdate={handleEditAccident}
          />

          <ViewAccident 
            open={openViewModal}
            onClose={() => {
              setOpenViewModal(false);
              setSelectedAccident(null);
            }}
            accident={selectedAccident}
            onEdit={() => {
              setOpenViewModal(false);
              setOpenEditModal(true);
            }}
          />

          {/* <DeleteAccident 
            open={openDeleteDialog}
            onClose={() => {
              setOpenDeleteDialog(false);
              setSelectedAccident(null);
            }}
            accident={selectedAccident}
            onDelete={handleDeleteAccident}
          /> */}
        </>
      )}

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 1.5,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AccidentMaster;