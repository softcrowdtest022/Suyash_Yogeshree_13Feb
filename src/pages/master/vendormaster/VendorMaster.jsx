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
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  ArrowUpward as ArrowUpwardIcon,
  MoreVert as MoreVertIcon,
  Sort as SortIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

// Color constants
const HEADER_GRADIENT = 'linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)';
const STRIPE_COLOR_ODD = '#FFFFFF';
const STRIPE_COLOR_EVEN = '#f8fafc';
const HOVER_COLOR = '#f1f5f9';
const PRIMARY_BLUE = '#00B4D8';
const TEXT_COLOR_HEADER = '#FFFFFF';
const TEXT_COLOR_MAIN = '#0f172a';

const VendorMaster = () => {
  // State for data
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  
  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch vendors from API
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('Fetching vendors from:', `${BASE_URL}/api/quotations/vendors`);
      console.log('Token available:', !!token);
      
      // Use the correct endpoint
      const response = await axios.get(`${BASE_URL}/api/quotations/vendors`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('API Response:', response);
      console.log('Response data:', response.data);

      if (response.data.success) {
        const vendorsData = response.data.data || [];
        console.log('Vendors data received:', vendorsData);
        
        // Check the first vendor to see field names
        if (vendorsData.length > 0) {
          console.log('First vendor fields:', Object.keys(vendorsData[0]));
          console.log('First vendor values:', vendorsData[0]);
        }
        
        setVendors(vendorsData);
        setFilteredVendors(vendorsData);
        
        showNotification(`${vendorsData.length} vendors loaded successfully`, 'success');
      } else {
        console.error('API returned success: false', response.data);
        showNotification('Failed to load vendors', 'error');
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers
      });
      
      if (err.response?.status === 401) {
        showNotification('Session expired. Please login again.', 'error');
      } else if (err.response?.status === 404) {
        showNotification('Vendors API endpoint not found', 'error');
      } else {
        showNotification('Failed to load vendors. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    
    const filtered = vendors.filter(vendor =>
      (vendor.VendorName && vendor.VendorName.toLowerCase().includes(value)) ||
      (vendor.VendorCode && vendor.VendorCode.toLowerCase().includes(value)) ||
      (vendor.ContactPerson && vendor.ContactPerson.toLowerCase().includes(value)) ||
      (vendor.Email && vendor.Email.toLowerCase().includes(value)) ||
      (vendor.GSTIN && vendor.GSTIN.toLowerCase().includes(value)) ||
      (vendor.State && vendor.State.toLowerCase().includes(value))
    );
    
    setFilteredVendors(filtered);
    setPage(0);
  };
  
  // Handle select all
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(filteredVendors.map(vendor => vendor._id));
    } else {
      setSelected([]);
    }
  };
  
  // Handle single selection
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
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle bulk delete (disabled as per requirement)
  const handleBulkDelete = () => {
    showNotification('Delete functionality is disabled', 'info');
  };
  
  // Show notification
  const showNotification = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  // Active status chip
  const getStatusChip = (isActive) => {
    return isActive ? (
      <Chip
        icon={<CheckCircleIcon />}
        label="Active"
        size="small"
        sx={{
          bgcolor: '#dcfce7',
          color: '#166534',
          border: '1px solid #86efac',
          fontWeight: 500,
          '& .MuiChip-icon': {
            color: '#166534',
            fontSize: 14
          }
        }}
      />
    ) : (
      <Chip
        icon={<CancelIcon />}
        label="Inactive"
        size="small"
        sx={{
          bgcolor: '#fee2e2',
          color: '#991b1b',
          border: '1px solid #fca5a5',
          fontWeight: 500,
          '& .MuiChip-icon': {
            color: '#991b1b',
            fontSize: 14
          }
        }}
      />
    );
  };
  
  // Paginated vendors
  const paginatedVendors = filteredVendors.slice(
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
          Vendor Master
        </Typography>
        <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
          View and manage vendor information
        </Typography>
      </Box>

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
          {/* Search and Filters */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
            <TextField
              placeholder="Search by name, code, GSTIN, or contact..."
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

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} alignItems="center">
            {selected.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleBulkDelete}
                sx={{ 
                  height: 40,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  borderColor: '#fca5a5',
                  color: '#991b1b',
                  '&:hover': {
                    borderColor: '#ef4444',
                    bgcolor: '#fee2e2'
                  }
                }}
                disabled={loading}
              >
                Selected ({selected.length})
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
          </Stack>
        </Stack>
      </Paper>

      {/* Vendors Table */}
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
                    indeterminate={selected.length > 0 && selected.length < filteredVendors.length}
                    checked={filteredVendors.length > 0 && selected.length === filteredVendors.length}
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
                    disabled={loading || filteredVendors.length === 0}
                  />
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    Vendor Code
                    <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
                  </Stack>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  Vendor Name
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  Contact Person
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  GSTIN
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography color="textSecondary" sx={{ fontStyle: 'italic' }}>
                      Loading vendors...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedVendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body1" color="#64748B" fontWeight={500}>
                        {searchTerm ? 'No vendors found' : 'No vendors available'}
                      </Typography>
                      <Typography variant="body2" color="#94A3B8" sx={{ mt: 1 }}>
                        {searchTerm ? 'Try adjusting your search terms' : 'Vendor data will appear here'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedVendors.map((vendor, index) => {
                  const isSelected = selected.includes(vendor._id);
                  const isOddRow = index % 2 === 0;

                  return (
                    <TableRow
                      key={vendor._id}
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
                          onChange={() => handleSelect(vendor._id)}
                          sx={{
                            color: PRIMARY_BLUE,
                            '&.Mui-checked': {
                              color: PRIMARY_BLUE,
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color={TEXT_COLOR_MAIN}>
                          {/* Directly access the VendorCode field from API response */}
                          {vendor.VendorCode || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500} color={TEXT_COLOR_MAIN}>
                          {/* Directly access the VendorName field from API response */}
                          {vendor.VendorName || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="#64748B">
                          {vendor.State || 'State not specified'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="#475569" fontWeight={500}>
                          {vendor.ContactPerson || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="#64748B">
                          {vendor.Phone || 'No phone'} {vendor.Email && '•'} {vendor.Email || ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="#475569">
                          {vendor.GSTIN || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {/* Since your API response doesn't have IsActive field, we'll default to Active */}
                        {getStatusChip(true)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredVendors.length}
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

export default VendorMaster;



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
//   Tooltip,
//   Typography,
//   Snackbar,
//   TablePagination,
//   Checkbox,
//   Stack,
//   alpha,
//   Alert,
//   Menu,
//   MenuItem,
//   ListItemIcon,
//   ListItemText,
//   Divider,
//   Chip
// } from '@mui/material';
// import {
//   Search as SearchIcon,
//   FilterList as FilterIcon,
//   Download as DownloadIcon,
//   Add as AddIcon,
//   Delete as DeleteIcon,
//   ArrowUpward as ArrowUpwardIcon,
//   Visibility as ViewIcon,
//   Edit as EditIcon,
//   MoreVert as MoreVertIcon,
//   Sort as SortIcon,
//   CheckCircle as CheckCircleIcon,
//   Cancel as CancelIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';

// // Import modal components
// import AddVendor from './AddVendor';
// import EditVendor from './EditVendor';
// import ViewVendor from './ViewVendor';
// import DeleteVendor from './DeleteVendor';

// // Color constants
// const HEADER_GRADIENT = 'linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)';
// const STRIPE_COLOR_ODD = '#FFFFFF';
// const STRIPE_COLOR_EVEN = '#f8fafc';
// const HOVER_COLOR = '#f1f5f9';
// const PRIMARY_BLUE = '#00B4D8';
// const TEXT_COLOR_HEADER = '#FFFFFF';
// const TEXT_COLOR_MAIN = '#0f172a';

// // Action Menu Component
// const ActionMenu = ({ vendor, onView, onEdit, onDelete, anchorEl, onClose, onOpen }) => {
//   return (
//     <>
//       <Tooltip title="Actions">
//         <IconButton
//           size="small"
//           onClick={onOpen}
//           sx={{
//             color: '#64748b',
//             '&:hover': {
//               bgcolor: alpha(PRIMARY_BLUE, 0.1)
//             }
//           }}
//         >
//           <MoreVertIcon fontSize="small" />
//         </IconButton>
//       </Tooltip>
//       <Menu
//         anchorEl={anchorEl}
//         open={Boolean(anchorEl)}
//         onClose={onClose}
//         PaperProps={{
//           elevation: 3,
//           sx: {
//             mt: 1,
//             minWidth: 180,
//             borderRadius: 2,
//             border: '1px solid #e2e8f0'
//           }
//         }}
//       >
//         <MenuItem 
//           onClick={() => {
//             onView(vendor);
//             onClose();
//           }}
//           sx={{ py: 1 }}
//         >
//           <ListItemIcon sx={{ color: PRIMARY_BLUE, minWidth: 36 }}>
//             <ViewIcon fontSize="small" />
//           </ListItemIcon>
//           <ListItemText>
//             <Typography variant="body2" fontWeight={500}>View Details</Typography>
//           </ListItemText>
//         </MenuItem>
//         <MenuItem 
//           onClick={() => {
//             onEdit(vendor);
//             onClose();
//           }}
//           sx={{ py: 1 }}
//         >
//           <ListItemIcon sx={{ color: '#10B981', minWidth: 36 }}>
//             <EditIcon fontSize="small" />
//           </ListItemIcon>
//           <ListItemText>
//             <Typography variant="body2" fontWeight={500}>Edit</Typography>
//           </ListItemText>
//         </MenuItem>
//         <Divider sx={{ my: 0.5 }} />
//         <MenuItem 
//           onClick={() => {
//             onDelete(vendor);
//             onClose();
//           }}
//           sx={{ py: 1 }}
//         >
//           <ListItemIcon sx={{ color: '#EF4444', minWidth: 36 }}>
//             <DeleteIcon fontSize="small" />
//           </ListItemIcon>
//           <ListItemText>
//             <Typography variant="body2" fontWeight={500} color="#EF4444">
//               Delete
//             </Typography>
//           </ListItemText>
//         </MenuItem>
//       </Menu>
//     </>
//   );
// };

// const VendorMaster = () => {
//   // State for data
//   const [vendors, setVendors] = useState([]);
//   const [filteredVendors, setFilteredvendors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
  
//   // Table state
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [selected, setSelected] = useState([]);
  
//   // Menu state for action buttons
//   const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
//   const [selectedVendorForAction, setSelectedVendorForAction] = useState(null);
  
//   // Modal state
//   const [openAddModal, setOpenAddModal] = useState(false);
//   const [openEditModal, setOpenEditModal] = useState(false);
//   const [openViewModal, setOpenViewModal] = useState(false);
//   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
//   // Selected customer
//   const [selectedVendor, setSelectedVendor] = useState(null);
  
//   // Notification state
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: '',
//     severity: 'success'
//   });

//   // Pagination state from API
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalItems: 0,
//     itemsPerPage: 10
//   });

//   // Fetch customers from API
//   useEffect(() => {
//     fetchVendors();
//   }, []);

//   const fetchVendors = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/customers`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (response.data.success) {
//         setVendors(response.data.data || []);
//         setFilteredVendors(response.data.data || []);
//         setPagination(response.data.pagination || {
//           currentPage: 1,
//           totalPages: 1,
//           totalItems: response.data.data?.length || 0,
//           itemsPerPage: 10
//         });
//       } else {
//         showNotification('Failed to load vendors', 'error');
//       }
//     } catch (err) {
//       console.error('Error fetching vendors:', err);
//       showNotification('Failed to load vendors. Please try again.', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Handle search
//   const handleSearch = (event) => {
//     const value = event.target.value.toLowerCase();
//     setSearchTerm(value);
    
//     const filtered = vendors.filter(vendor =>
//       vendor.VendorName.toLowerCase().includes(value) ||
//       vendor.VendorCode.toLowerCase().includes(value) ||
//       (vendor.ContactPerson && vendor.ContactPerson.toLowerCase().includes(value)) ||
//       (vendor.Email && vendor.Email.toLowerCase().includes(value))
//     );
    
//     setFilteredVendors(filtered);
//     setPage(0);
//   };
  
//   // Handle select all
//   const handleSelectAll = (event) => {
//     if (event.target.checked) {
//       setSelected(filteredVendors.map(vendor => vendor._id));
//     } else {
//       setSelected([]);
//     }
//   };
  
//   // Handle single selection
//   const handleSelect = (id) => {
//     const selectedIndex = selected.indexOf(id);
//     let newSelected = [];
    
//     if (selectedIndex === -1) {
//       newSelected = newSelected.concat(selected, id);
//     } else {
//       newSelected = selected.filter(item => item !== id);
//     }
    
//     setSelected(newSelected);
//   };
  
//   // Handle page change
//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };
  
//   // Handle rows per page change
//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };
  
//   // Handle add customer
//   const handleAddVendor = (newVendor) => {
//     setVendors([...vendors, newVendor]);
//     setFilteredVendors([...filteredVendors, newVendor]);
//     showNotification('Vendor added successfully!', 'success');
//   };
  
//   // Handle edit customer
//   const handleEditVendor = (updatedVendor) => {
//     const updatedVendors = vendors.map(vendor =>
//       vendor._id === updatedVendor._id ? updatedVendor : vendor
//     );
    
//     setVendors(updatedVendors);
//     setFilteredVendors(updatedVendors);
//     showNotification('Vendor updated successfully!', 'success');
//   };
  
//   // Handle delete customer
//   const handleDeleteVendor = (vendorId) => {
//     const updatedVendors = vendors.filter(vendor => vendor._id !== vendorId);
//     setVendors(updatedVendors);
//     setFilteredVendors(updatedVendors);
//     setSelected(selected.filter(id => id !== vendorId));
//     showNotification('Vendor deleted successfully!', 'success');
//   };
  
//   // Handle bulk delete
//   const handleBulkDelete = () => {
//     showNotification('Bulk delete requires API implementation', 'warning');
//   };
  
//   // Action menu handlers
//   const handleActionMenuOpen = (event, vendor) => {
//     setActionMenuAnchor(event.currentTarget);
//     setSelectedVendorForAction(vendor);
//   };

//   const handleActionMenuClose = () => {
//     setActionMenuAnchor(null);
//     setSelectedVendorForAction(null);
//   };

//   // Open edit modal
//   const openEditVendorModal = (vendor) => {
//     setSelectedVendor(vendor);
//     setOpenEditModal(true);
//     handleActionMenuClose();
//   };
  
//   // Open view modal
//   const openViewVendorModal = (vendor) => {
//     setSelectedVendor(vendor);
//     setOpenViewModal(true);
//     handleActionMenuClose();
//   };
  
//   // Open delete confirmation
//   const openDeleteVendorDialog = (vendor) => {
//     setSelectedVendor(vendor);
//     setOpenDeleteDialog(true);
//     handleActionMenuClose();
//   };
  
//   // Show notification
//   const showNotification = (message, severity) => {
//     setSnackbar({
//       open: true,
//       message,
//       severity
//     });
//   };
  
//   // Format date
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };
  
//   // Active status chip
//   const getStatusChip = (isActive) => {
//     return isActive ? (
//       <Chip
//         icon={<CheckCircleIcon />}
//         label="Active"
//         size="small"
//         sx={{
//           bgcolor: '#dcfce7',
//           color: '#166534',
//           border: '1px solid #86efac',
//           fontWeight: 500,
//           '& .MuiChip-icon': {
//             color: '#166534',
//             fontSize: 14
//           }
//         }}
//       />
//     ) : (
//       <Chip
//         icon={<CancelIcon />}
//         label="Inactive"
//         size="small"
//         sx={{
//           bgcolor: '#fee2e2',
//           color: '#991b1b',
//           border: '1px solid #fca5a5',
//           fontWeight: 500,
//           '& .MuiChip-icon': {
//             color: '#991b1b',
//             fontSize: 14
//           }
//         }}
//       />
//     );
//   };
  
//   // Paginated customers
//   const paginatedVendors = filteredVendors.slice(
//     page * rowsPerPage,
//     page * rowsPerPage + rowsPerPage
//   );

//   return (
//     <Box sx={{ p: 3 }}>
//       {/* Header */}
//       <Box sx={{ mb: 3 }}>
//         <Typography 
//           variant="h5" 
//           component="h1" 
//           fontWeight="600" 
//           sx={{ 
//             color: TEXT_COLOR_MAIN,
//             background: HEADER_GRADIENT,
//             WebkitBackgroundClip: 'text',
//             WebkitTextFillColor: 'transparent',
//             backgroundClip: 'text',
//             display: 'inline-block'
//           }}
//         >
//           Vendor Master
//         </Typography>
//         <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
//           Manage and organize vendor information and details
//         </Typography>
//       </Box>

//       {/* Action Bar */}
//       <Paper sx={{ 
//         p: 2, 
//         mb: 3, 
//         borderRadius: 2,
//         bgcolor: '#FFFFFF',
//         boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
//         border: '1px solid #e2e8f0'
//       }}>
//         <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
//           {/* Search and Filters */}
//           <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
//             <TextField
//               placeholder="Search by name, code, or contact..."
//               size="small"
//               value={searchTerm}
//               onChange={handleSearch}
//               sx={{ 
//                 width: { xs: '100%', sm: 320 },
//                 '& .MuiOutlinedInput-root': {
//                   borderRadius: 1.5,
//                   '&:hover fieldset': {
//                     borderColor: PRIMARY_BLUE,
//                   },
//                 }
//               }}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <SearchIcon sx={{ color: '#64748B' }} />
//                   </InputAdornment>
//                 ),
//                 sx: { 
//                   height: 40,
//                   bgcolor: '#f8fafc',
//                   '& input': {
//                     padding: '8px 12px',
//                     fontSize: '0.875rem'
//                   }
//                 }
//               }}
//               disabled={loading}
//             />
//             <Button
//               variant="outlined"
//               startIcon={<FilterIcon />}
//               sx={{ 
//                 height: 40,
//                 borderRadius: 1.5,
//                 borderColor: '#cbd5e1',
//                 color: '#475569',
//                 fontSize: '0.875rem',
//                 fontWeight: 500,
//                 textTransform: 'none',
//                 '&:hover': {
//                   borderColor: PRIMARY_BLUE,
//                   bgcolor: alpha(PRIMARY_BLUE, 0.04)
//                 }
//               }}
//               disabled={loading}
//             >
//               Filter
//             </Button>
//             <Button
//               variant="outlined"
//               startIcon={<SortIcon />}
//               sx={{ 
//                 height: 40,
//                 borderRadius: 1.5,
//                 borderColor: '#cbd5e1',
//                 color: '#475569',
//                 fontSize: '0.875rem',
//                 fontWeight: 500,
//                 textTransform: 'none',
//                 '&:hover': {
//                   borderColor: PRIMARY_BLUE,
//                   bgcolor: alpha(PRIMARY_BLUE, 0.04)
//                 }
//               }}
//               disabled={loading}
//             >
//               Sort
//             </Button>
//           </Stack>

//           {/* Action Buttons */}
//           <Stack direction="row" spacing={2} alignItems="center">
//             {selected.length > 0 && (
//               <Button
//                 variant="outlined"
//                 color="error"
//                 startIcon={<DeleteIcon />}
//                 onClick={handleBulkDelete}
//                 sx={{ 
//                   height: 40,
//                   borderRadius: 1.5,
//                   textTransform: 'none',
//                   fontSize: '0.875rem',
//                   fontWeight: 500
//                 }}
//                 disabled={loading}
//               >
//                 Delete ({selected.length})
//               </Button>
//             )}
//             <Button
//               variant="outlined"
//               startIcon={<DownloadIcon />}
//               sx={{ 
//                 height: 40,
//                 borderRadius: 1.5,
//                 borderColor: '#cbd5e1',
//                 color: '#475569',
//                 fontSize: '0.875rem',
//                 fontWeight: 500,
//                 textTransform: 'none',
//                 '&:hover': {
//                   borderColor: PRIMARY_BLUE,
//                   bgcolor: alpha(PRIMARY_BLUE, 0.04)
//                 }
//               }}
//               disabled={loading}
//             >
//               Export
//             </Button>
//             {/* <Button
//               variant="contained"
//               startIcon={<AddIcon />}
//               onClick={() => setOpenAddModal(true)}
//               sx={{
//                 height: 40,
//                 borderRadius: 1.5,
//                 background: HEADER_GRADIENT,
//                 fontSize: '0.875rem',
//                 fontWeight: 500,
//                 textTransform: 'none',
//                 '&:hover': {
//                   opacity: 0.9,
//                   background: HEADER_GRADIENT,
//                 }
//               }}
//               disabled={loading}
//             >
//               Add Vendor
//             </Button> */}
//           </Stack>
//         </Stack>
//       </Paper>

//       {/* Vendors Table */}
//       <Paper sx={{ 
//         width: '100%', 
//         borderRadius: 2, 
//         overflow: 'hidden',
//         boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
//         border: '1px solid #e2e8f0'
//       }}>
//         <TableContainer>
//           <Table>
//             <TableHead>
//               <TableRow sx={{ 
//                 background: HEADER_GRADIENT,
//                 '& .MuiTableCell-root': {
//                   borderBottom: 'none',
//                   color: TEXT_COLOR_HEADER
//                 }
//               }}>
//                 <TableCell padding="checkbox" sx={{ width: 60 }}>
//                   <Checkbox
//                     indeterminate={selected.length > 0 && selected.length < filteredVendors.length}
//                     checked={filteredVendors.length > 0 && selected.length === filteredVendors.length}
//                     onChange={handleSelectAll}
//                     sx={{
//                       color: TEXT_COLOR_HEADER,
//                       '&.Mui-checked': {
//                         color: TEXT_COLOR_HEADER,
//                       },
//                       '&.MuiCheckbox-indeterminate': {
//                         color: TEXT_COLOR_HEADER,
//                       },
//                       '& .MuiSvgIcon-root': {
//                         fontSize: 20
//                       }
//                     }}
//                     disabled={loading}
//                   />
//                 </TableCell>
//                 <TableCell sx={{ 
//                   fontWeight: 700, 
//                   fontSize: '0.875rem',
//                   py: 2,
//                   color: TEXT_COLOR_HEADER
//                 }}>
//                   <Stack direction="row" alignItems="center" spacing={0.5}>
//                     Vendor Code
//                     <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
//                   </Stack>
//                 </TableCell>
//                 <TableCell sx={{ 
//                   fontWeight: 700, 
//                   fontSize: '0.875rem',
//                   py: 2,
//                   color: TEXT_COLOR_HEADER
//                 }}>
//                   Vendor Name
//                 </TableCell>
//                 <TableCell sx={{ 
//                   fontWeight: 700, 
//                   fontSize: '0.875rem',
//                   py: 2,
//                   color: TEXT_COLOR_HEADER
//                 }}>
//                   Contact Person
//                 </TableCell>
//                 <TableCell sx={{ 
//                   fontWeight: 700, 
//                   fontSize: '0.875rem',
//                   py: 2,
//                   color: TEXT_COLOR_HEADER
//                 }}>
//                   GSTIN
//                 </TableCell>
//                 <TableCell sx={{ 
//                   fontWeight: 700, 
//                   fontSize: '0.875rem',
//                   py: 2,
//                   color: TEXT_COLOR_HEADER
//                 }}>
//                   Status
//                 </TableCell>
//                 <TableCell sx={{ 
//                   fontWeight: 700, 
//                   fontSize: '0.875rem',
//                   py: 2,
//                   width: 100,
//                   color: TEXT_COLOR_HEADER
//                 }} align="center">
//                   Actions
//                 </TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {loading ? (
//                 <TableRow>
//                   <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
//                     <Typography color="textSecondary" sx={{ fontStyle: 'italic' }}>
//                       Loading vendors...
//                     </Typography>
//                   </TableCell>
//                 </TableRow>
//               ) : paginatedVendors.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
//                     <Box sx={{ textAlign: 'center' }}>
//                       <Typography variant="body1" color="#64748B" fontWeight={500}>
//                         {searchTerm ? 'No vendors found' : 'No vendors available'}
//                       </Typography>
//                       <Typography variant="body2" color="#94A3B8" sx={{ mt: 1 }}>
//                         {searchTerm ? 'Try adjusting your search terms' : 'Add your first vendor to get started'}
//                       </Typography>
//                     </Box>
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 paginatedVendors.map((vendor, index) => {
//                   const isSelected = selected.includes(vendor._id);
//                   const isOddRow = index % 2 === 0;
//                   const isActionMenuOpen = Boolean(actionMenuAnchor) && 
//                     selectedVendorForAction?._id === vendor._id;

//                   return (
//                     <TableRow
//                       key={vendor._id}
//                       hover
//                       selected={isSelected}
//                       sx={{ 
//                         bgcolor: isOddRow ? STRIPE_COLOR_ODD : STRIPE_COLOR_EVEN,
//                         '&:hover': {
//                           bgcolor: HOVER_COLOR
//                         },
//                         '&.Mui-selected': {
//                           bgcolor: alpha(PRIMARY_BLUE, 0.08),
//                           '&:hover': {
//                             bgcolor: alpha(PRIMARY_BLUE, 0.12)
//                           }
//                         }
//                       }}
//                     >
//                       <TableCell padding="checkbox" sx={{ width: 60 }}>
//                         <Checkbox
//                           checked={isSelected}
//                           onChange={() => handleSelect(vendor._id)}
//                           sx={{
//                             color: PRIMARY_BLUE,
//                             '&.Mui-checked': {
//                               color: PRIMARY_BLUE,
//                             },
//                           }}
//                         />
//                       </TableCell>
//                       <TableCell>
//                         <Typography variant="body2" fontWeight={600} color={TEXT_COLOR_MAIN}>
//                           {vendor.VendorCode}
//                         </Typography>
//                       </TableCell>
//                       <TableCell>
//                         <Typography variant="body2" fontWeight={500} color={TEXT_COLOR_MAIN}>
//                           {vendor.VendorName}
//                         </Typography>
//                         <Typography variant="caption" color="#64748B">
//                           {vendor.State || 'State not specified'}
//                         </Typography>
//                       </TableCell>
//                       <TableCell>
//                         <Typography variant="body2" color="#475569" fontWeight={500}>
//                           {vendor.ContactPerson}
//                         </Typography>
//                         <Typography variant="caption" color="#64748B">
//                           {vendor.Phone || 'No phone'}
//                         </Typography>
//                       </TableCell>
//                       <TableCell>
//                         <Typography variant="body2" color="#475569">
//                           {vendor.GSTIN || 'N/A'}
//                         </Typography>
//                       </TableCell>
//                       <TableCell>
//                         {getStatusChip(vendor.IsActive)}
//                       </TableCell>
//                       <TableCell align="center" sx={{ width: 100 }}>
//                         <ActionMenu 
//                           vendor={vendor}
//                           onView={openViewVendorModal}
//                           onEdit={openEditVendorModal}
//                           onDelete={openDeleteVendorDialog}
//                           anchorEl={isActionMenuOpen ? actionMenuAnchor : null}
//                           onClose={handleActionMenuClose}
//                           onOpen={(e) => handleActionMenuOpen(e, vendor)}
//                         />
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>

//         {/* Pagination */}
//         <TablePagination
//           rowsPerPageOptions={[5, 10, 25]}
//           component="div"
//           count={filteredVendors.length}
//           rowsPerPage={rowsPerPage}
//           page={page}
//           onPageChange={handleChangePage}
//           onRowsPerPageChange={handleChangeRowsPerPage}
//           sx={{
//             borderTop: '1px solid #e2e8f0',
//             '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
//               fontSize: '0.875rem',
//               color: '#64748B'
//             },
//             '& .MuiTablePagination-actions button': {
//               color: PRIMARY_BLUE,
//             }
//           }}
//         />
//       </Paper>

//       {/* Separate Modal Components */}
//       <AddVendor 
//         open={openAddModal}
//         onClose={() => setOpenAddModal(false)}
//         onAdd={handleAddVendor}
//       />

//       {selectedVendor && (
//         <>
//           <EditVendor 
//             open={openEditModal}
//             onClose={() => {
//               setOpenEditModal(false);
//               setSelectedVendor(null);
//             }}
//             vendor={selectedVendor}
//             onUpdate={handleEditVendor}
//           />

//           <ViewVendor 
//             open={openViewModal}
//             onClose={() => {
//               setOpenViewModal(false);
//               setSelectedVendor(null);
//             }}
//             vendor={selectedVendor}
//             onEdit={() => {
//               setOpenViewModal(false);
//               setOpenEditModal(true);
//             }}
//           />

//           <DeleteVendor 
//             open={openDeleteDialog}
//             onClose={() => {
//               setOpenDeleteDialog(false);
//               setSelectedVendor(null);
//             }}
//             vendor={selectedVendor}
//             onDelete={handleDeleteVendor}
//           />
//         </>
//       )}

//       {/* Snackbar Notification */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={() => setSnackbar({...snackbar, open: false})}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//       >
//         <Alert 
//           onClose={() => setSnackbar({...snackbar, open: false})} 
//           severity={snackbar.severity}
//           variant="filled"
//           sx={{ 
//             width: '100%',
//             borderRadius: 1.5,
//             boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//           }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default VendorMaster;