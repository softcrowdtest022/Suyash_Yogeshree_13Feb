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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Avatar,
  Badge,
  LinearProgress,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpwardIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  AccessTime as AccessTimeIcon,
  Error as ErrorIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Update as UpdateIcon,
  Pause as PauseIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import axios from 'axios';

// Import Onboarding components
import CreateOnboarding from './CreateOnboarding';
import ViewOnboarding from './ViewOnboarding';
import UpdateOnboardingStatus from './UpdateOnboardingStatus';
import BASE_URL from '../../../../config/Config';

// Color constants - EXACT SAME as header gradient
const HEADER_GRADIENT = 'linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)';
const STRIPE_COLOR_ODD = '#FFFFFF';
const STRIPE_COLOR_EVEN = '#f8fafc';
const HOVER_COLOR = '#f1f5f9';
const PRIMARY_BLUE = '#00B4D8';
const TEXT_COLOR_HEADER = '#FFFFFF';
const TEXT_COLOR_MAIN = '#0f172a';

// Status color mapping
const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return { bg: '#f1f5f9', color: '#475569', label: 'Pending', icon: <AccessTimeIcon /> };
    case 'IN_PROGRESS':
      return { bg: '#fef3c7', color: '#92400e', label: 'In Progress', icon: <ScheduleIcon /> };
    case 'COMPLETED':
      return { bg: '#d1fae5', color: '#065f46', label: 'Completed', icon: <CheckCircleIcon /> };
    case 'HOLD':
      return { bg: '#fff3e0', color: '#f57c00', label: 'On Hold', icon: <PauseIcon /> };
    case 'CANCELLED':
      return { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled', icon: <CancelIcon /> };
    default:
      return { bg: '#f1f5f9', color: '#475569', label: status || 'Unknown', icon: <InfoIcon /> };
  }
};

// Action Menu Component
const ActionMenu = ({ 
  onboarding, 
  onView, 
  onUpdateStatus, 
  onEdit, 
  onDelete, 
  anchorEl, 
  onClose, 
  onOpen 
}) => {
  const status = onboarding?.status?.toUpperCase();
  
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
            minWidth: 200,
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            maxHeight: 400
          }
        }}
      >
        {/* View Details - Always visible */}
        <MenuItem 
          onClick={() => {
            onView(onboarding);
            onClose();
          }}
          sx={{ py: 1 }}
        >
          <ListItemIcon sx={{ color: PRIMARY_BLUE, minWidth: 36 }}>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" fontWeight={500}>View Details</Typography>
          </ListItemText>
        </MenuItem>

        {/* Update Status - Always visible except for completed/cancelled */}
        {status !== 'COMPLETED' && status !== 'CANCELLED' && (
          <MenuItem 
            onClick={() => {
              onUpdateStatus(onboarding);
              onClose();
            }}
            sx={{ py: 1 }}
          >
            <ListItemIcon sx={{ color: '#F59E0B', minWidth: 36 }}>
              <UpdateIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2" fontWeight={500}>Update Status</Typography>
            </ListItemText>
          </MenuItem>
        )}

        <Divider sx={{ my: 0.5 }} />

        {/* Edit - Only for Pending status */}
        {status === 'PENDING' && (
          <MenuItem 
            onClick={() => {
              onEdit(onboarding);
              onClose();
            }}
            sx={{ py: 1 }}
          >
            <ListItemIcon sx={{ color: '#3B82F6', minWidth: 36 }}>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2" fontWeight={500}>Edit Onboarding</Typography>
            </ListItemText>
          </MenuItem>
        )}

        {/* Delete - Only for Pending or Cancelled status */}
        {(status === 'PENDING' || status === 'CANCELLED') && (
          <MenuItem 
            onClick={() => {
              onDelete(onboarding);
              onClose();
            }}
            sx={{ py: 1 }}
          >
            <ListItemIcon sx={{ color: '#EF4444', minWidth: 36 }}>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2" fontWeight={500} color="#EF4444">
                Delete
              </Typography>
            </ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

const OnboardingManagement = () => {
  // State for data
  const [onboardingList, setOnboardingList] = useState([]);
  const [filteredOnboardingList, setFilteredOnboardingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  
  // Menu state for action buttons
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedOnboardingForAction, setSelectedOnboardingForAction] = useState(null);
  
  // Modal states for all Onboarding actions
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  
  // Selected Onboarding
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);
  
  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch Onboarding list from API
  useEffect(() => {
    fetchOnboardingList();
  }, [page, rowsPerPage]);

  const fetchOnboardingList = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/onboarding?page=${page + 1}&limit=${rowsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setOnboardingList(response.data.data || []);
        setFilteredOnboardingList(response.data.data || []);
        setTotalCount(response.data.total || 0);
      } else {
        showNotification('Failed to load onboarding records', 'error');
      }
    } catch (err) {
      console.error('Error fetching onboarding list:', err);
      showNotification('Failed to load onboarding records. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    
    const filtered = onboardingList.filter(item =>
      item.onboardingId?.toLowerCase().includes(value) ||
      item.employee?.name?.toLowerCase().includes(value) ||
      item.employee?.id?.toLowerCase().includes(value) ||
      item.employee?.email?.toLowerCase().includes(value) ||
      item.department?.toLowerCase().includes(value) ||
      item.workLocation?.toLowerCase().includes(value)
    );
    
    setFilteredOnboardingList(filtered);
    setPage(0);
  };
  
  // Handle select all
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(filteredOnboardingList.map(item => item._id || item.onboardingId));
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
  
  // Handle refresh
  const handleRefresh = () => {
    fetchOnboardingList();
    showNotification('Data refreshed successfully', 'success');
  };
  
  // Handle bulk delete
  const handleBulkDelete = () => {
    showNotification('Bulk delete requires API implementation', 'warning');
  };
  
  // Handle export
  const handleExport = () => {
    showNotification('Export functionality coming soon', 'info');
  };
  
  // Action menu handlers
  const handleActionMenuOpen = (event, onboarding) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedOnboardingForAction(onboarding);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedOnboardingForAction(null);
  };

  // Modal open handlers
  const openCreateModal = () => {
    setShowCreateModal(true);
    handleActionMenuClose();
  };
  
  const openViewModal = (onboarding) => {
    setSelectedOnboarding(onboarding);
    setShowViewModal(true);
    handleActionMenuClose();
  };
  
  const openUpdateStatusModal = (onboarding) => {
    setSelectedOnboarding(onboarding);
    setShowUpdateStatusModal(true);
    handleActionMenuClose();
  };
  
  const openEditModal = (onboarding) => {
    // For now, just show a message
    showNotification('Edit functionality coming soon', 'info');
    handleActionMenuClose();
  };
  
  const openDeleteModal = (onboarding) => {
    // For now, just show a message
    showNotification('Delete functionality coming soon', 'info');
    handleActionMenuClose();
  };
  
  // Callback handlers for modals
  const handleOnboardingCreated = (newOnboarding) => {
    fetchOnboardingList();
    showNotification('Onboarding created successfully!', 'success');
  };
  
  const handleStatusUpdated = (updatedOnboarding) => {
    fetchOnboardingList();
    showNotification('Onboarding status updated successfully!', 'success');
  };
  
  // Show notification
  const showNotification = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Paginated Onboarding list
  const paginatedOnboardingList = searchTerm 
    ? filteredOnboardingList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : filteredOnboardingList;

  // Check if any onboarding records are selected
  const hasSelected = selected.length > 0;

  // Calculate stats for cards
  const totalPending = onboardingList.filter(item => item.status?.toUpperCase() === 'PENDING').length;
  const totalInProgress = onboardingList.filter(item => item.status?.toUpperCase() === 'IN_PROGRESS').length;
  const totalCompleted = onboardingList.filter(item => item.status?.toUpperCase() === 'COMPLETED').length;
  const totalHold = onboardingList.filter(item => item.status?.toUpperCase() === 'HOLD').length;

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
          Onboarding Management
        </Typography>
        <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
          Manage and track employee onboarding processes
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#E3F2FD' }}>
                <AssignmentIcon sx={{ color: '#1976D2' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {totalCount}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Total Onboardings
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F1F5F9' }}>
                <AccessTimeIcon sx={{ color: '#475569' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {totalPending}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Pending
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#FFF3E0' }}>
                <ScheduleIcon sx={{ color: '#F57C00' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {totalInProgress}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  In Progress
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#E8F5E9' }}>
                <CheckCircleIcon sx={{ color: '#2E7D32' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {totalCompleted}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Completed
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

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
          {/* Search */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
            <TextField
              placeholder="Search by Onboarding ID, Employee, Department..."
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              sx={{ 
                width: { xs: '100%', sm: 400 },
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
            <Tooltip title="Refresh">
              <IconButton 
                onClick={handleRefresh}
                sx={{ 
                  color: '#64748B',
                  '&:hover': {
                    bgcolor: alpha(PRIMARY_BLUE, 0.1),
                    color: PRIMARY_BLUE
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} alignItems="center">
            {hasSelected && (
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
              onClick={handleExport}
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
              onClick={openCreateModal}
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
              Create Onboarding
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Onboarding Table */}
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
                    indeterminate={selected.length > 0 && selected.length < filteredOnboardingList.length}
                    checked={filteredOnboardingList.length > 0 && selected.length === filteredOnboardingList.length}
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
                    Onboarding ID
                    <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
                  </Stack>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    Employee
                    <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
                  </Stack>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    Department
                    <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
                  </Stack>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    Reporting Manager
                    <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
                  </Stack>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    Work Location
                    <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
                  </Stack>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    Joining Date
                    <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
                  </Stack>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    Status
                    <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
                  </Stack>
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
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Typography color="textSecondary" sx={{ fontStyle: 'italic' }}>
                      Loading onboarding records...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedOnboardingList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <AssignmentIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
                      <Typography variant="body1" color="#64748B" fontWeight={500}>
                        {searchTerm ? 'No onboarding records found' : 'No onboarding processes yet'}
                      </Typography>
                      <Typography variant="body2" color="#94A3B8" sx={{ mt: 1 }}>
                        {searchTerm ? 'Try adjusting your search terms' : 'Click "Create Onboarding" to start a new onboarding process'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOnboardingList.map((item, index) => {
                  const isSelected = selected.includes(item._id || item.onboardingId);
                  const isOddRow = index % 2 === 0;
                  const isActionMenuOpen = Boolean(actionMenuAnchor) && 
                    selectedOnboardingForAction?._id === item._id;
                  const statusStyle = getStatusColor(item.status);

                  return (
                    <TableRow
                      key={item._id || item.onboardingId}
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
                          onChange={() => handleSelect(item._id || item.onboardingId)}
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
                          {item.onboardingId || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              bgcolor: PRIMARY_BLUE,
                              fontSize: '0.875rem'
                            }}
                          >
                            {item.employee?.name?.charAt(0) || 'E'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {item.employee?.name || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="#64748B">
                              {item.employee?.id || ''}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.department || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.reportingManager?.name || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="#64748B">
                          {item.reportingManager?.id || ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.workLocation || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(item.joiningDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={statusStyle.icon}
                          label={statusStyle.label}
                          size="small"
                          sx={{
                            bgcolor: statusStyle.bg,
                            color: statusStyle.color,
                            fontWeight: 500,
                            minWidth: 90
                          }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ width: 100 }}>
                        <ActionMenu 
                          onboarding={item}
                          onView={openViewModal}
                          onUpdateStatus={openUpdateStatusModal}
                          onEdit={openEditModal}
                          onDelete={openDeleteModal}
                          anchorEl={isActionMenuOpen ? actionMenuAnchor : null}
                          onClose={handleActionMenuClose}
                          onOpen={(e) => handleActionMenuOpen(e, item)}
                        />
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
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={searchTerm ? filteredOnboardingList.length : totalCount}
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
      <CreateOnboarding 
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
        }}
        onSubmit={handleOnboardingCreated}
      />

      <ViewOnboarding 
        open={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedOnboarding(null);
        }}
        onboardingData={selectedOnboarding}
        employeeId={selectedOnboarding?.employee?.id}
      />

      <UpdateOnboardingStatus 
        open={showUpdateStatusModal}
        onClose={() => {
          setShowUpdateStatusModal(false);
          setSelectedOnboarding(null);
        }}
        onSubmit={handleStatusUpdated}
        onboardingData={selectedOnboarding}
        employeeId={selectedOnboarding?.employee?.id}
        currentStatus={selectedOnboarding?.status}
      />

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

export default OnboardingManagement;