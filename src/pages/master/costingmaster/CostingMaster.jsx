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
  Card,
  CardContent,
  Grid
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
  Sort as SortIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AttachMoney as MoneyIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Percent as PercentIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

// Import modal components
import AddCosting from './AddCosting';
import EditCosting from './EditCosting';
import ViewCosting from './ViewCosting';
import DeleteCosting from './DeleteCosting';

// Color constants
const HEADER_GRADIENT = 'linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)';
const STRIPE_COLOR_ODD = '#FFFFFF';
const STRIPE_COLOR_EVEN = '#f8fafc';
const HOVER_COLOR = '#f1f5f9';
const PRIMARY_BLUE = '#00B4D8';
const TEXT_COLOR_HEADER = '#FFFFFF';
const TEXT_COLOR_MAIN = '#0f172a';

// Action Menu Component
const ActionMenu = ({ costing, onView, onEdit, onDelete, anchorEl, onClose, onOpen }) => {
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
            onView(costing);
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
            onEdit(costing);
            onClose();
          }}
          sx={{ py: 1 }}
        >
          <ListItemIcon sx={{ color: '#10B981', minWidth: 36 }}>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" fontWeight={500}>Edit</Typography>
          </ListItemText>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem 
          onClick={() => {
            onDelete(costing);
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
      </Menu>
    </>
  );
};

const CostingMaster = () => {
  // State for data
  const [costings, setCostings] = useState([]);
  const [filteredCostings, setFilteredCostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  
  // Statistics state
  const [statistics, setStatistics] = useState({
    totalRMCost: 0,
    totalProcessCost: 0,
    totalFinalRate: 0,
    avgMargin: 0,
    count: 0
  });
  
  // Menu state for action buttons
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedCostingForAction, setSelectedCostingForAction] = useState(null);
  
  // Modal state
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  // Selected costing
  const [selectedCosting, setSelectedCosting] = useState(null);
  
  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Pagination state from API
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Fetch costings from API
  useEffect(() => {
    fetchCostings();
  }, []);

  const fetchCostings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/costings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setCostings(response.data.data || []);
        setFilteredCostings(response.data.data || []);
        setPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: response.data.data?.length || 0,
          itemsPerPage: 10
        });
        setStatistics(response.data.statistics || {
          totalRMCost: 0,
          totalProcessCost: 0,
          totalFinalRate: 0,
          avgMargin: 0,
          count: 0
        });
      } else {
        showNotification('Failed to load costings', 'error');
      }
    } catch (err) {
      console.error('Error fetching costings:', err);
      showNotification('Failed to load costings. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    
    const filtered = costings.filter(costing =>
      costing.PartNo.toLowerCase().includes(value) ||
      (costing.ItemID?.PartName?.toLowerCase() || '').includes(value) ||
      costing.FinalRate.toString().includes(value)
    );
    
    setFilteredCostings(filtered);
    setPage(0);
  };
  
  // Handle select all
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(filteredCostings.map(costing => costing._id));
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
  
  // Handle add costing
  const handleAddCosting = (newCosting) => {
    setCostings([...costings, newCosting]);
    setFilteredCostings([...filteredCostings, newCosting]);
    updateStatisticsAfterAdd(newCosting);
    showNotification('Costing added successfully!', 'success');
  };
  
  // Handle edit costing
  const handleEditCosting = (updatedCosting) => {
    const updatedCostings = costings.map(costing =>
      costing._id === updatedCosting._id ? updatedCosting : costing
    );
    
    setCostings(updatedCostings);
    setFilteredCostings(updatedCostings);
    updateStatisticsAfterUpdate(updatedCosting);
    showNotification('Costing updated successfully!', 'success');
  };
  
  // Handle delete costing
  const handleDeleteCosting = (costingId) => {
    const deletedCosting = costings.find(c => c._id === costingId);
    const updatedCostings = costings.filter(costing => costing._id !== costingId);
    setCostings(updatedCostings);
    setFilteredCostings(updatedCostings);
    setSelected(selected.filter(id => id !== costingId));
    updateStatisticsAfterDelete(deletedCosting);
    showNotification('Costing deleted successfully!', 'success');
  };
  
  // Update statistics after add
  const updateStatisticsAfterAdd = (newCosting) => {
    setStatistics(prev => ({
      totalRMCost: prev.totalRMCost + (newCosting.RMCost || 0),
      totalProcessCost: prev.totalProcessCost + (newCosting.ProcessCost || 0),
      totalFinalRate: prev.totalFinalRate + (newCosting.FinalRate || 0),
      avgMargin: (prev.avgMargin * prev.count + (newCosting.MarginPercentage || 0)) / (prev.count + 1),
      count: prev.count + 1
    }));
  };
  
  // Update statistics after update
  const updateStatisticsAfterUpdate = (updatedCosting) => {
    // Recalculate all statistics from current data
    const newStats = costings.reduce((acc, costing) => {
      if (costing._id === updatedCosting._id) {
        // Use updated costing
        return {
          totalRMCost: acc.totalRMCost + (updatedCosting.RMCost || 0),
          totalProcessCost: acc.totalProcessCost + (updatedCosting.ProcessCost || 0),
          totalFinalRate: acc.totalFinalRate + (updatedCosting.FinalRate || 0),
          totalMargin: acc.totalMargin + (updatedCosting.MarginPercentage || 0),
          count: acc.count + 1
        };
      } else {
        // Use existing costing
        return {
          totalRMCost: acc.totalRMCost + (costing.RMCost || 0),
          totalProcessCost: acc.totalProcessCost + (costing.ProcessCost || 0),
          totalFinalRate: acc.totalFinalRate + (costing.FinalRate || 0),
          totalMargin: acc.totalMargin + (costing.MarginPercentage || 0),
          count: acc.count + 1
        };
      }
    }, { totalRMCost: 0, totalProcessCost: 0, totalFinalRate: 0, totalMargin: 0, count: 0 });
    
    setStatistics({
      totalRMCost: newStats.totalRMCost,
      totalProcessCost: newStats.totalProcessCost,
      totalFinalRate: newStats.totalFinalRate,
      avgMargin: newStats.totalMargin / newStats.count,
      count: newStats.count
    });
  };
  
  // Update statistics after delete
  const updateStatisticsAfterDelete = (deletedCosting) => {
    const remainingCostings = costings.filter(c => c._id !== deletedCosting._id);
    if (remainingCostings.length === 0) {
      setStatistics({
        totalRMCost: 0,
        totalProcessCost: 0,
        totalFinalRate: 0,
        avgMargin: 0,
        count: 0
      });
      return;
    }
    
    const newStats = remainingCostings.reduce((acc, costing) => ({
      totalRMCost: acc.totalRMCost + (costing.RMCost || 0),
      totalProcessCost: acc.totalProcessCost + (costing.ProcessCost || 0),
      totalFinalRate: acc.totalFinalRate + (costing.FinalRate || 0),
      totalMargin: acc.totalMargin + (costing.MarginPercentage || 0),
      count: acc.count + 1
    }), { totalRMCost: 0, totalProcessCost: 0, totalFinalRate: 0, totalMargin: 0, count: 0 });
    
    setStatistics({
      totalRMCost: newStats.totalRMCost,
      totalProcessCost: newStats.totalProcessCost,
      totalFinalRate: newStats.totalFinalRate,
      avgMargin: newStats.totalMargin / newStats.count,
      count: newStats.count
    });
  };
  
  // Handle bulk delete
  const handleBulkDelete = () => {
    showNotification('Bulk delete requires API implementation', 'warning');
  };
  
  // Action menu handlers
  const handleActionMenuOpen = (event, costing) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedCostingForAction(costing);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedCostingForAction(null);
  };

  // Open edit modal
  const openEditCostingModal = (costing) => {
    setSelectedCosting(costing);
    setOpenEditModal(true);
    handleActionMenuClose();
  };
  
  // Open view modal
  const openViewCostingModal = (costing) => {
    setSelectedCosting(costing);
    setOpenViewModal(true);
    handleActionMenuClose();
  };
  
  // Open delete confirmation
  const openDeleteCostingDialog = (costing) => {
    setSelectedCosting(costing);
    setOpenDeleteDialog(true);
    handleActionMenuClose();
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Get part initials for avatar
  const getPartInitials = (partNo) => {
    if (!partNo) return 'PN';
    return partNo.substring(0, 2).toUpperCase();
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
  
  // Paginated costings
  const paginatedCostings = filteredCostings.slice(
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
          Costing Master
        </Typography>
        <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
          Manage product costings, margins, and pricing calculations
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="caption" color="#64748B" gutterBottom>
                Total Items
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#0f172a">
                {statistics.count}
              </Typography>
              <Typography variant="caption" color="#94A3B8">
                Active costings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="caption" color="#64748B" gutterBottom>
                Avg. Margin
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#059669">
                {statistics.avgMargin.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="#94A3B8">
                Average profit margin
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="caption" color="#64748B" gutterBottom>
                Total RM Cost
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#DC2626">
                {formatCurrency(statistics.totalRMCost)}
              </Typography>
              <Typography variant="caption" color="#94A3B8">
                Raw material costs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="caption" color="#64748B" gutterBottom>
                Total Process Cost
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#D97706">
                {formatCurrency(statistics.totalProcessCost)}
              </Typography>
              <Typography variant="caption" color="#94A3B8">
                Manufacturing costs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="caption" color="#64748B" gutterBottom>
                Total Final Rate
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#059669">
                {formatCurrency(statistics.totalFinalRate)}
              </Typography>
              <Typography variant="caption" color="#94A3B8">
                Total selling price
              </Typography>
            </CardContent>
          </Card>
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
          {/* Search and Filters */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
            <TextField
              placeholder="Search by Part No, Item name, or rate..."
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
              Add Costing
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Costings Table */}
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
                    indeterminate={selected.length > 0 && selected.length < filteredCostings.length}
                    checked={filteredCostings.length > 0 && selected.length === filteredCostings.length}
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
                    Part Details
                    <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
                  </Stack>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  Cost Components
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  Calculations
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
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography color="textSecondary" sx={{ fontStyle: 'italic' }}>
                      Loading costings...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedCostings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body1" color="#64748B" fontWeight={500}>
                        {searchTerm ? 'No costings found' : 'No costings available'}
                      </Typography>
                      <Typography variant="body2" color="#94A3B8" sx={{ mt: 1 }}>
                        {searchTerm ? 'Try adjusting your search terms' : 'Add your first costing to get started'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCostings.map((costing, index) => {
                  const isSelected = selected.includes(costing._id);
                  const isOddRow = index % 2 === 0;
                  const isActionMenuOpen = Boolean(actionMenuAnchor) && 
                    selectedCostingForAction?._id === costing._id;

                  return (
                    <TableRow
                      key={costing._id}
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
                          onChange={() => handleSelect(costing._id)}
                          sx={{
                            color: PRIMARY_BLUE,
                            '&.Mui-checked': {
                              color: PRIMARY_BLUE,
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ 
                            width: 40, 
                            height: 40, 
                            bgcolor: '#4F46E5',
                            fontSize: '0.875rem',
                            fontWeight: 500
                          }}>
                            {getPartInitials(costing.PartNo)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600} color={TEXT_COLOR_MAIN}>
                              {costing.PartNo}
                            </Typography>
                            {costing.ItemID ? (
                              <>
                                <Typography variant="caption" color="#64748B" display="block">
                                  {costing.ItemID.PartName}
                                </Typography>
                                <Typography variant="caption" color="#64748B" display="block">
                                  Unit: {costing.ItemID.Unit || 'N/A'}
                                </Typography>
                              </>
                            ) : (
                              <Typography variant="caption" color="#64748B" display="block">
                                No associated item
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <InventoryIcon fontSize="small" sx={{ color: '#EF4444' }} />
                            <Typography variant="body2" color="#475569">
                              RM: <strong>{formatCurrency(costing.RMRate)}</strong>
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <TrendingUpIcon fontSize="small" sx={{ color: '#D97706' }} />
                            <Typography variant="body2" color="#475569">
                              Process: <strong>{formatCurrency(costing.ProcessCost)}</strong>
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <MoneyIcon fontSize="small" sx={{ color: '#059669' }} />
                            <Typography variant="body2" color="#475569">
                              Sub Total: <strong>{formatCurrency(costing.SubCost)}</strong>
                            </Typography>
                          </Stack>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <PercentIcon fontSize="small" sx={{ color: '#7C3AED' }} />
                            <Typography variant="body2" color="#475569">
                              Overhead: <strong>{costing.OverheadPercentage}%</strong>
                            </Typography>
                            <Chip
                              label={formatCurrency(costing.OverheadCost)}
                              size="small"
                              sx={{
                                bgcolor: '#F3E8FF',
                                color: '#7C3AED',
                                border: '1px solid #D8B4FE',
                                fontWeight: 500,
                                fontSize: '0.625rem'
                              }}
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <PercentIcon fontSize="small" sx={{ color: '#059669' }} />
                            <Typography variant="body2" color="#475569">
                              Margin: <strong>{costing.MarginPercentage}%</strong>
                            </Typography>
                            <Chip
                              label={formatCurrency(costing.MarginCost)}
                              size="small"
                              sx={{
                                bgcolor: '#DCFCE7',
                                color: '#059669',
                                border: '1px solid #86EFAC',
                                fontWeight: 500,
                                fontSize: '0.625rem'
                              }}
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <MoneyIcon fontSize="small" sx={{ color: '#101010' }} />
                            <Typography variant="body2" fontWeight={600} color="#101010">
                              Final Rate: <strong>{formatCurrency(costing.FinalRate)}</strong>
                            </Typography>
                          </Stack>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(costing.IsActive)}
                        <Typography variant="caption" color="#64748B" display="block" sx={{ mt: 0.5 }}>
                          Created: {formatDate(costing.CreatedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ width: 100 }}>
                        <ActionMenu 
                          costing={costing}
                          onView={openViewCostingModal}
                          onEdit={openEditCostingModal}
                          onDelete={openDeleteCostingDialog}
                          anchorEl={isActionMenuOpen ? actionMenuAnchor : null}
                          onClose={handleActionMenuClose}
                          onOpen={(e) => handleActionMenuOpen(e, costing)}
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
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCostings.length}
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

      {/* Separate Modal Components */}
      <AddCosting 
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onAdd={handleAddCosting}
      />

      {selectedCosting && (
        <>
          <EditCosting 
            open={openEditModal}
            onClose={() => {
              setOpenEditModal(false);
              setSelectedCosting(null);
            }}
            costing={selectedCosting}
            onUpdate={handleEditCosting}
          />

          <ViewCosting 
            open={openViewModal}
            onClose={() => {
              setOpenViewModal(false);
              setSelectedCosting(null);
            }}
            costing={selectedCosting}
            onEdit={() => {
              setOpenViewModal(false);
              setOpenEditModal(true);
            }}
          />

          <DeleteCosting 
            open={openDeleteDialog}
            onClose={() => {
              setOpenDeleteDialog(false);
              setSelectedCosting(null);
            }}
            costing={selectedCosting}
            onDelete={handleDeleteCosting}
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

export default CostingMaster;