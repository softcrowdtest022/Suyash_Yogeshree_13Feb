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
  FormControl,
  InputLabel,
  Select,
  Badge,
  Avatar,
  Collapse,
  Grid,
  Tab,
  Tabs
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
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  MonetizationOn as MonetizationIcon,
  CalendarToday as CalendarIcon,
  FilterAlt as FilterAltIcon,
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Comment as CommentIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

// Import modal components
import AddRequisition from './AddRequisition';
import EditRequisition from './EditRequisition';
import ViewRequisition from './ViewRequisition';
import SubmitRequisition from './SubmitRequisition';
import ApproveRequisition from './ApproveRequisition';
import RejectRequisition from './RejectRequisition';
import CommentRequisition from './CommentRequisition';
import DeleteRequisition from './DeleteRequisition';

// Color constants
const HEADER_GRADIENT = 'linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)';
const STRIPE_COLOR_ODD = '#FFFFFF';
const STRIPE_COLOR_EVEN = '#f8fafc';
const HOVER_COLOR = '#f1f5f9';
const PRIMARY_BLUE = '#00B4D8';
const TEXT_COLOR_HEADER = '#FFFFFF';
const TEXT_COLOR_MAIN = '#0f172a';

// Status color mapping
const STATUS_COLORS = {
  draft: { bg: '#FFF3E0', color: '#E65100', icon: <PendingIcon sx={{ fontSize: 14 }} />, label: 'Draft' },
  pending_approval: { bg: '#FFF3E0', color: '#E65100', icon: <PendingIcon sx={{ fontSize: 14 }} />, label: 'Pending' },
  approved: { bg: '#E8F5E9', color: '#2E7D32', icon: <CheckCircleIcon sx={{ fontSize: 14 }} />, label: 'Approved' },
  rejected: { bg: '#FFEBEE', color: '#C62828', icon: <ErrorIcon sx={{ fontSize: 14 }} />, label: 'Rejected' },
  in_progress: { bg: '#E3F2FD', color: '#1976D2', icon: <TrendingUpIcon sx={{ fontSize: 14 }} />, label: 'In Progress' },
  filled: { bg: '#E8F5E9', color: '#2E7D32', icon: <CheckCircleIcon sx={{ fontSize: 14 }} />, label: 'Filled' },
  closed: { bg: '#F5F5F5', color: '#616161', icon: <ErrorIcon sx={{ fontSize: 14 }} />, label: 'Closed' }
};

// Tab configurations
const TABS = [
  { value: 'all', label: 'All', icon: null },
  { value: 'draft', label: 'Draft', icon: <PendingIcon />, color: '#E65100' },
  { value: 'pending_approval', label: 'Pending', icon: <PendingIcon />, color: '#E65100' },
  { value: 'approved', label: 'Approved', icon: <CheckCircleIcon />, color: '#2E7D32' },
  { value: 'rejected', label: 'Rejected', icon: <ErrorIcon />, color: '#C62828' },
  { value: 'in_progress', label: 'In Progress', icon: <TrendingUpIcon />, color: '#1976D2' },
  { value: 'filled', label: 'Filled', icon: <CheckCircleIcon />, color: '#2E7D32' },
  { value: 'closed', label: 'Closed', icon: <ErrorIcon />, color: '#616161' }
];

// Priority color mapping
const PRIORITY_COLORS = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
  critical: '#9C27B0'
};

// Action Menu Component - Enhanced with Delete option
const ActionMenu = ({ 
  requisition, 
  onView, 
  onEdit, 
  onSubmit, 
  onApprove, 
  onReject, 
  onComment,
  onDelete,
  anchorEl, 
  onClose, 
  onOpen,
  currentTab
}) => {
  // Status-based permission checks
  const canEdit = requisition.status === 'draft';
  const canSubmit = requisition.status === 'draft';
  const canApprove = requisition.status === 'pending_approval';
  const canReject = requisition.status === 'pending_approval' || requisition.status === 'draft';
  const canDelete = requisition.status === 'draft' || requisition.status === 'rejected';
  const canView = true; // Everyone can view
  const canComment = true; // Everyone can comment

  // Determine which actions to show based on current tab and status
  const getVisibleActions = () => {
    const actions = [];

    // View is always available
    actions.push({
      key: 'view',
      label: 'View Details',
      icon: <ViewIcon fontSize="small" />,
      color: PRIMARY_BLUE,
      onClick: () => onView(requisition),
      show: true
    });

    // Edit - only for draft status
    if (canEdit) {
      actions.push({
        key: 'edit',
        label: 'Edit',
        icon: <EditIcon fontSize="small" />,
        color: '#10B981',
        onClick: () => onEdit(requisition)
      });
    }

    // Submit - only for draft status
    if (canSubmit) {
      actions.push({
        key: 'submit',
        label: 'Submit for Approval',
        icon: <SendIcon fontSize="small" />,
        color: '#1976D2',
        onClick: () => onSubmit(requisition)
      });
    }

    // Approve - only for pending_approval
    if (canApprove) {
      actions.push({
        key: 'approve',
        label: 'Approve',
        icon: <ThumbUpIcon fontSize="small" />,
        color: '#2E7D32',
        onClick: () => onApprove(requisition)
      });
    }

    // Reject - for pending_approval or draft
    if (canReject) {
      actions.push({
        key: 'reject',
        label: 'Reject',
        icon: <ThumbDownIcon fontSize="small" />,
        color: '#C62828',
        onClick: () => onReject(requisition)
      });
    }

    // Comment - always available
    actions.push({
      key: 'comment',
      label: 'Add Comment',
      icon: <CommentIcon fontSize="small" />,
      color: '#7B1FA2',
      onClick: () => onComment(requisition)
    });

    // Delete - for draft or rejected
    if (canDelete) {
      actions.push({
        key: 'delete',
        label: 'Delete',
        icon: <DeleteIcon fontSize="small" />,
        color: '#DC2626',
        onClick: () => onDelete(requisition)
      });
    }

    return actions;
  };

  const visibleActions = getVisibleActions();

  // If only view action is available, show just the view button instead of menu
  if (visibleActions.length === 1 && visibleActions[0].key === 'view') {
    return (
      <Tooltip title="View Details">
        <IconButton
          size="small"
          onClick={() => onView(requisition)}
          sx={{
            color: PRIMARY_BLUE,
            '&:hover': {
              bgcolor: alpha(PRIMARY_BLUE, 0.1)
            }
          }}
        >
          <ViewIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  }

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
            border: '1px solid #e2e8f0'
          }
        }}
      >
        {visibleActions.map((action, index) => (
          <MenuItem 
            key={action.key}
            onClick={() => {
              action.onClick();
              onClose();
            }}
            sx={{ py: 1 }}
          >
            <ListItemIcon sx={{ color: action.color, minWidth: 36 }}>
              {action.icon}
            </ListItemIcon>
            <ListItemText>
              <Typography 
                variant="body2" 
                fontWeight={500}
                color={action.key === 'delete' || action.key === 'reject' ? action.color : 'inherit'}
              >
                {action.label}
              </Typography>
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

// Filter Dropdown Component - Opens on the right side
const FilterDropdown = ({ 
  filters, 
  onFilterChange, 
  onApplyFilters, 
  onClearFilters,
  departments,
  statuses,
  anchorEl,
  open,
  onClose,
  currentTab
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        elevation: 3,
        sx: {
          mt: 1,
          width: 650,
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          p: 2.5
        }
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" fontWeight={600} color={TEXT_COLOR_MAIN}>
            Filter Requisitions
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: '#64748B' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status || ''}
                onChange={onFilterChange}
                label="Status"
                disabled={currentTab !== 'all'}
                sx={{ 
                  borderRadius: 1.5, 
                  bgcolor: '#FFFFFF',
                  minWidth: 160
                }}
              >
                <MenuItem value="">
                  <em>All Statuses</em>
                </MenuItem>
                {statuses.map(status => (
                  <MenuItem key={status} value={status}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%',
                        bgcolor: STATUS_COLORS[status]?.color 
                      }} />
                      <span>{STATUS_COLORS[status]?.label || status}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                name="department"
                value={filters.department || ''}
                onChange={onFilterChange}
                label="Department"
                sx={{ 
                  borderRadius: 1.5, 
                  bgcolor: '#FFFFFF',
                  minWidth: 160
                }}
              >
                <MenuItem value="">
                  <em>All Departments</em>
                </MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={filters.priority || ''}
                onChange={onFilterChange}
                label="Priority"
                sx={{ 
                  borderRadius: 1.5, 
                  bgcolor: '#FFFFFF',
                  minWidth: 160
                }}
              >
                <MenuItem value="">
                  <em>All Priorities</em>
                </MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={() => {
              onClearFilters();
              onClose();
            }}
            sx={{
              height: 36,
              borderRadius: 1.5,
              borderColor: '#cbd5e1',
              color: '#475569',
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'none',
              px: 2
            }}
          >
            Clear All
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              onApplyFilters();
              onClose();
            }}
            sx={{
              height: 36,
              borderRadius: 1.5,
              background: HEADER_GRADIENT,
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'none',
              px: 3
            }}
          >
            Apply Filters
          </Button>
        </Stack>
      </Stack>
    </Menu>
  );
};

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`requisition-tabpanel-${index}`}
      aria-labelledby={`requisition-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

const RequisitionMaster = () => {
  // State for data
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Tab state
  const [currentTab, setCurrentTab] = useState(0);
  const [tabStatus, setTabStatus] = useState('all');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Selection state
  const [selected, setSelected] = useState([]);
  
  // Filter state
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    priority: ''
  });
  const [departments, setDepartments] = useState([]);
  const [statuses] = useState(['draft', 'pending_approval', 'approved', 'rejected', 'in_progress', 'filled', 'closed']);
  
  // Filter dropdown state
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const filterOpen = Boolean(filterAnchorEl);
  
  // Menu state
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedRequisitionForAction, setSelectedRequisitionForAction] = useState(null);
  
  // Modal state
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openSubmitModal, setOpenSubmitModal] = useState(false);
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openCommentModal, setOpenCommentModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  
  // Selected requisition
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  
  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Count by status for badges
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    draft: 0,
    pending_approval: 0,
    approved: 0,
    rejected: 0,
    in_progress: 0,
    filled: 0,
    closed: 0
  });

  // Fetch requisitions with pagination and filters
  const fetchRequisitions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query params
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm
      });
      
      // Apply status filter based on selected tab
      if (tabStatus !== 'all') {
        params.append('status', tabStatus);
      } else if (filters.status) {
        params.append('status', filters.status);
      }
      
      if (filters.department) params.append('department', filters.department);
      if (filters.priority) params.append('priority', filters.priority);

      const response = await axios.get(`${BASE_URL}/api/requisitions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setRequisitions(response.data.data || []);
        setTotalItems(response.data.pagination?.totalItems || 0);
        setTotalPages(response.data.pagination?.totalPages || 1);
        
        // Extract unique departments for filter
        const depts = [...new Set(response.data.data.map(r => r.department).filter(Boolean))];
        setDepartments(depts);
        
        // Fetch counts for all statuses
        fetchStatusCounts();
      } else {
        showNotification('Failed to load requisitions', 'error');
      }
    } catch (err) {
      console.error('Error fetching requisitions:', err);
      showNotification('Failed to load requisitions. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch counts by status
  const fetchStatusCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/requisitions/count-by-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setStatusCounts(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching status counts:', err);
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, [page, rowsPerPage, tabStatus, filters]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchRequisitions();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setTabStatus(TABS[newValue].value);
    setPage(0);
    setSelected([]);
  };

  // Handle search input
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle filter dropdown
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    setPage(0);
    fetchRequisitions();
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      status: '',
      department: '',
      priority: ''
    });
    setPage(0);
  };

  // Handle select all
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(requisitions.map(req => req._id));
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

  // Handle add requisition
  const handleAddRequisition = (newRequisition) => {
    showNotification('Requisition created successfully!', 'success');
    fetchRequisitions();
  };

  // Handle edit requisition
  const handleEditRequisition = (updatedRequisition) => {
    showNotification('Requisition updated successfully!', 'success');
    fetchRequisitions();
  };

  // Handle view requisition
  const handleViewRequisition = (requisition) => {
    setSelectedRequisition(requisition);
    setOpenViewModal(true);
  };

  // Handle submit requisition
  const handleSubmitRequisition = (requisition) => {
    setSelectedRequisition(requisition);
    setOpenSubmitModal(true);
  };

  // Handle approve requisition
  const handleApproveRequisition = (requisition) => {
    setSelectedRequisition(requisition);
    setOpenApproveModal(true);
  };

  // Handle reject requisition
  const handleRejectRequisition = (requisition) => {
    setSelectedRequisition(requisition);
    setOpenRejectModal(true);
  };

  // Handle comment on requisition
  const handleCommentRequisition = (requisition) => {
    setSelectedRequisition(requisition);
    setOpenCommentModal(true);
  };

  // Handle delete requisition
  const handleDeleteRequisition = (requisition) => {
    setSelectedRequisition(requisition);
    setOpenDeleteModal(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedRequisition) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(`${BASE_URL}/api/requisitions/${selectedRequisition._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        showNotification('Requisition deleted successfully!', 'success');
        fetchRequisitions();
        setSelected([]);
        setOpenDeleteModal(false);
        setSelectedRequisition(null);
      } else {
        showNotification(response.data.message || 'Failed to delete requisition', 'error');
      }
    } catch (err) {
      console.error('Error deleting requisition:', err);
      showNotification(err.response?.data?.message || 'Failed to delete requisition', 'error');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selected.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selected.length} selected requisitions?`)) {
      showNotification('Bulk delete requires API implementation', 'warning');
    }
  };

  // Action menu handlers
  const handleActionMenuOpen = (event, requisition) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedRequisitionForAction(requisition);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedRequisitionForAction(null);
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

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    return Object.values(filters).filter(v => v).length;
  };

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
          Requisition Master
        </Typography>
        <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
          Manage and track job requisitions throughout the approval workflow
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
          {/* Search */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
            <TextField
              placeholder="Search by ID, position, department..."
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
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="outlined"
              startIcon={
                <Badge badgeContent={getActiveFilterCount()} color="primary">
                  <FilterAltIcon />
                </Badge>
              }
              onClick={handleFilterClick}
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
              Filters
            </Button>

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
              New Requisition
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Filter Dropdown */}
      <FilterDropdown
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        departments={departments}
        statuses={statuses}
        anchorEl={filterAnchorEl}
        open={filterOpen}
        onClose={handleFilterClose}
        currentTab={tabStatus}
      />

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 48,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#64748B',
              '&.Mui-selected': {
                color: PRIMARY_BLUE,
                fontWeight: 600
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: PRIMARY_BLUE,
              height: 3
            }
          }}
        >
          {TABS.map((tab, index) => (
            <Tab
              key={tab.value}
              icon={tab.icon}
              iconPosition="start"
              label={
                <Badge 
                  badgeContent={statusCounts[tab.value] || 0} 
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.65rem',
                      height: 18,
                      minWidth: 18,
                      bgcolor: tab.color,
                      color: '#FFFFFF'
                    }
                  }}
                >
                  {tab.label}
                </Badge>
              }
              sx={{
                '& .MuiSvgIcon-root': {
                  fontSize: 18,
                  color: tab.color || 'inherit'
                }
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Requisitions Table */}
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
                    indeterminate={selected.length > 0 && selected.length < requisitions.length}
                    checked={requisitions.length > 0 && selected.length === requisitions.length}
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
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    Requisition ID
                    <ArrowUpwardIcon sx={{ fontSize: 14, opacity: 0.9 }} />
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2 }}>
                  Position Details
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2 }}>
                  Department/Location
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2 }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2 }}>
                  Priority
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2 }}>
                  Budget
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2 }}>
                  Created
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2, width: 100 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Typography color="textSecondary" sx={{ fontStyle: 'italic' }}>
                      Loading requisitions...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : requisitions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <AssignmentIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
                      <Typography variant="body1" color="#64748B" fontWeight={500}>
                        {searchTerm || filters.department || filters.priority 
                          ? 'No requisitions found matching your criteria' 
                          : `No ${tabStatus !== 'all' ? TABS[currentTab].label.toLowerCase() : ''} requisitions available`}
                      </Typography>
                      <Typography variant="body2" color="#94A3B8" sx={{ mt: 1 }}>
                        {searchTerm || filters.department || filters.priority 
                          ? 'Try adjusting your filters or search terms' 
                          : 'Create your first requisition to get started'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                requisitions.map((requisition, index) => {
                  const isSelected = selected.includes(requisition._id);
                  const isOddRow = index % 2 === 0;
                  const isActionMenuOpen = Boolean(actionMenuAnchor) && 
                    selectedRequisitionForAction?._id === requisition._id;
                  const statusStyle = STATUS_COLORS[requisition.status] || STATUS_COLORS.draft;
                  const priorityColor = PRIORITY_COLORS[requisition.priority?.toLowerCase()] || '#757575';

                  return (
                    <TableRow
                      key={requisition._id}
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
                          onChange={() => handleSelect(requisition._id)}
                          sx={{
                            color: PRIMARY_BLUE,
                            '&.Mui-checked': {
                              color: PRIMARY_BLUE,
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" fontWeight={600} color={TEXT_COLOR_MAIN}>
                            {requisition.requisitionId}
                          </Typography>
                          <Typography variant="caption" color="#64748B">
                            {requisition._id.slice(-6)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" fontWeight={500} color={TEXT_COLOR_MAIN}>
                            {requisition.positionTitle}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Chip
                              label={`${requisition.noOfPositions} Position${requisition.noOfPositions > 1 ? 's' : ''}`}
                              size="small"
                              sx={{ 
                                height: 20, 
                                fontSize: '0.625rem',
                                bgcolor: '#E3F2FD',
                                color: '#1976D2'
                              }}
                            />
                            <Typography variant="caption" color="#64748B">
                              {requisition.employmentType}
                            </Typography>
                          </Stack>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <BusinessIcon sx={{ fontSize: 14, color: '#64748B' }} />
                            <Typography variant="body2" color={TEXT_COLOR_MAIN}>
                              {requisition.department}
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <LocationIcon sx={{ fontSize: 14, color: '#64748B' }} />
                            <Typography variant="caption" color="#64748B">
                              {requisition.location}
                            </Typography>
                          </Stack>
                        </Stack>
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
                            fontSize: '0.75rem',
                            height: 24,
                            '& .MuiChip-icon': {
                              color: statusStyle.color
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={requisition.priority || 'Medium'}
                          size="small"
                          sx={{
                            bgcolor: `${priorityColor}20`,
                            color: priorityColor,
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            height: 24
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" fontWeight={500} color={TEXT_COLOR_MAIN}>
                            {formatCurrency(requisition.budgetMin)} - {formatCurrency(requisition.budgetMax)}
                          </Typography>
                          <Typography variant="caption" color="#64748B">
                            Grade: {requisition.grade}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="caption" color="#64748B">
                            {formatDate(requisition.createdAt)}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <PersonIcon sx={{ fontSize: 12, color: '#94A3B8' }} />
                            <Typography variant="caption" color="#64748B">
                              {requisition.createdByName}
                            </Typography>
                          </Stack>
                        </Stack>
                      </TableCell>
                      <TableCell align="center" sx={{ width: 100 }}>
                        <ActionMenu 
                          requisition={requisition}
                          onView={handleViewRequisition}
                          onEdit={() => {
                            setSelectedRequisition(requisition);
                            setOpenEditModal(true);
                          }}
                          onSubmit={handleSubmitRequisition}
                          onApprove={handleApproveRequisition}
                          onReject={handleRejectRequisition}
                          onComment={handleCommentRequisition}
                          onDelete={handleDeleteRequisition}
                          anchorEl={isActionMenuOpen ? actionMenuAnchor : null}
                          onClose={handleActionMenuClose}
                          onOpen={(e) => handleActionMenuOpen(e, requisition)}
                          currentTab={tabStatus}
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
          count={totalItems}
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
      <AddRequisition 
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onAdd={handleAddRequisition}
      />

      {selectedRequisition && (
        <>
          <EditRequisition 
            open={openEditModal}
            onClose={() => {
              setOpenEditModal(false);
              setSelectedRequisition(null);
            }}
            requisitionId={selectedRequisition._id}
            onUpdate={handleEditRequisition}
          />

          <ViewRequisition 
            open={openViewModal}
            onClose={() => {
              setOpenViewModal(false);
              setSelectedRequisition(null);
            }}
            requisitionId={selectedRequisition._id}
          />

          <SubmitRequisition 
            open={openSubmitModal}
            onClose={() => {
              setOpenSubmitModal(false);
              setSelectedRequisition(null);
            }}
            requisitionId={selectedRequisition._id}
            onSubmit={(data) => {
              showNotification('Requisition submitted successfully', 'success');
              fetchRequisitions();
              setOpenSubmitModal(false);
              setSelectedRequisition(null);
            }}
          />

          <ApproveRequisition 
            open={openApproveModal}
            onClose={() => {
              setOpenApproveModal(false);
              setSelectedRequisition(null);
            }}
            requisitionId={selectedRequisition._id}
            onApprove={(data) => {
              showNotification('Requisition approved successfully', 'success');
              fetchRequisitions();
              setOpenApproveModal(false);
              setSelectedRequisition(null);
            }}
          />

          <RejectRequisition 
            open={openRejectModal}
            onClose={() => {
              setOpenRejectModal(false);
              setSelectedRequisition(null);
            }}
            requisitionId={selectedRequisition._id}
            onReject={(data) => {
              showNotification('Requisition rejected', 'info');
              fetchRequisitions();
              setOpenRejectModal(false);
              setSelectedRequisition(null);
            }}
          />

          <CommentRequisition 
            open={openCommentModal}
            onClose={() => {
              setOpenCommentModal(false);
              setSelectedRequisition(null);
            }}
            requisitionId={selectedRequisition._id}
            onCommentAdd={(data) => {
              showNotification('Comment added successfully', 'success');
              fetchRequisitions();
            }}
          />

          <DeleteRequisition 
            open={openDeleteModal}
            onClose={() => {
              setOpenDeleteModal(false);
              setSelectedRequisition(null);
            }}
            requisition={selectedRequisition}
            onDelete={handleConfirmDelete}
          />
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

export default RequisitionMaster;