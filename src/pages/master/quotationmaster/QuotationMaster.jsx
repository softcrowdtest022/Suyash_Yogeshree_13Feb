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
  Description as DescriptionIcon,
  People as PeopleIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';
import PrintIcon from '@mui/icons-material/Print';

// Import modal components
import AddQuotation from './AddQuotation';
import EditQuotation from './EditQuotation';
import ViewQuotation from './ViewQuotation';
import DeleteQuotation from './DeleteQuotation';
import PrintQuotation from './PrintQuotation';
// Color constants
const HEADER_GRADIENT = 'linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)';
const STRIPE_COLOR_ODD = '#FFFFFF';
const STRIPE_COLOR_EVEN = '#f8fafc';
const HOVER_COLOR = '#f1f5f9';
const PRIMARY_BLUE = '#00B4D8';
const TEXT_COLOR_HEADER = '#FFFFFF';
const TEXT_COLOR_MAIN = '#0f172a';

// Status colors
const STATUS_COLORS = {
  'Draft': { bg: '#FEF3C7', text: '#92400E', border: '#FBBF24' },
  'Sent': { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
  'Approved': { bg: '#D1FAE5', text: '#065F46', border: '#34D399' },
  'Rejected': { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' }
};

// Action Menu Component
// In QuotationMaster.jsx - Update the ActionMenu component
const ActionMenu = ({ item, onView, onEdit, onDelete, onPrint, anchorEl, onClose, onOpen }) => {
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
            onView(item);
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
            onPrint(item);
            onClose();
          }}
          sx={{ py: 1 }}
        >
          <ListItemIcon sx={{ color: '#6B7280', minWidth: 36 }}>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" fontWeight={500}>Generate PDF</Typography>
          </ListItemText>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem 
          onClick={() => {
            onDelete(item);
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

const QuotationMaster = () => {
  // State for data
  const [quotations, setQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  
  // Menu state for action buttons
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedQuotationForAction, setSelectedQuotationForAction] = useState(null);
  
  // Modal state
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openPrintModal, setOpenPrintModal] = useState(false);

  // Selected quotation
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  
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

  // Statistics state
  const [statistics, setStatistics] = useState({
    totalQuotations: 0,
    totalAmount: 0,
    avgAmount: 0,
    draftCount: 0,
    sentCount: 0,
    approvedCount: 0
  });
  
  // onPrint handler
  const openPrintQuotation = (quotation) => {
    setSelectedQuotation(quotation);
    setOpenPrintModal(true);
    handleActionMenuClose();
  };

  // Fetch quotations from API
  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/quotations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setQuotations(response.data.data || []);
        setFilteredQuotations(response.data.data || []);
        setPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: response.data.data?.length || 0,
          itemsPerPage: 10
        });
        setStatistics(response.data.statistics || {
          totalQuotations: response.data.data?.length || 0,
          totalAmount: 0,
          avgAmount: 0,
          draftCount: 0,
          sentCount: 0,
          approvedCount: 0
        });
      } else {
        showNotification('Failed to load quotations', 'error');
      }
    } catch (err) {
      console.error('Error fetching quotations:', err);
      showNotification('Failed to load quotations. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    
    const filtered = quotations.filter(quotation =>
      quotation.QuotationNo.toLowerCase().includes(value) ||
      quotation.VendorName.toLowerCase().includes(value) ||
      quotation.CompanyName.toLowerCase().includes(value) ||
      quotation.Status.toLowerCase().includes(value)
    );
    
    setFilteredQuotations(filtered);
    setPage(0);
  };
  
  // Handle select all
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(filteredQuotations.map(quotation => quotation._id));
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
  
  // Handle add quotation
  const handleAddQuotation = (newQuotation) => {
    setQuotations([newQuotation, ...quotations]);
    setFilteredQuotations([newQuotation, ...filteredQuotations]);
    showNotification('Quotation added successfully!', 'success');
  };
  
  // Handle edit quotation
  const handleEditQuotation = (updatedQuotation) => {
    const updatedQuotations = quotations.map(quotation =>
      quotation._id === updatedQuotation._id ? updatedQuotation : quotation
    );
    
    setQuotations(updatedQuotations);
    setFilteredQuotations(updatedQuotations);
    showNotification('Quotation updated successfully!', 'success');
  };
  
  // Handle delete quotation
  const handleDeleteQuotation = (quotationId) => {
    const updatedQuotations = quotations.filter(quotation => quotation._id !== quotationId);
    setQuotations(updatedQuotations);
    setFilteredQuotations(updatedQuotations);
    setSelected(selected.filter(id => id !== quotationId));
    showNotification('Quotation deleted successfully!', 'success');
  };
  
  // Handle bulk delete
  const handleBulkDelete = () => {
    showNotification('Bulk delete requires API implementation', 'warning');
  };
  
  // Action menu handlers
  const handleActionMenuOpen = (event, quotation) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedQuotationForAction(quotation);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedQuotationForAction(null);
  };

  // Open edit modal
  const openEditQuotationModal = (quotation) => {
    setSelectedQuotation(quotation);
    setOpenEditModal(true);
    handleActionMenuClose();
  };
  
  // Open view modal
  const openViewQuotationModal = (quotation) => {
    setSelectedQuotation(quotation);
    setOpenViewModal(true);
    handleActionMenuClose();
  };
  
  // Open delete confirmation
  const openDeleteQuotationDialog = (quotation) => {
    setSelectedQuotation(quotation);
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
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Status chip
  const getStatusChip = (status) => {
    const colors = STATUS_COLORS[status] || STATUS_COLORS.Draft;
    return (
      <Chip
        label={status}
        size="small"
        sx={{
          bgcolor: colors.bg,
          color: colors.text,
          border: `1px solid ${colors.border}`,
          fontWeight: 600,
          fontSize: '0.75rem'
        }}
      />
    );
  };
  
  // Paginated quotations
  const paginatedQuotations = filteredQuotations.slice(
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
          Quotation Master
        </Typography>
        <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
          Manage and track vendor quotations and purchase requests
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            borderRadius: 2,
            bgcolor: '#E0F2FE',
            border: '1px solid #BAE6FD',
            boxShadow: 'none'
          }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <DescriptionIcon sx={{ color: '#0369A1' }} />
                <Typography variant="body2" color="#64748B">
                  Total
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight={700} color="#0C4A6E" sx={{ mt: 1 }}>
                {statistics.totalQuotations}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            borderRadius: 2,
            bgcolor: '#DCFCE7',
            border: '1px solid #BBF7D0',
            boxShadow: 'none'
          }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <MoneyIcon sx={{ color: '#166534' }} />
                <Typography variant="body2" color="#64748B">
                  Total Amount
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight={700} color="#166534" sx={{ mt: 1 }}>
                {formatCurrency(statistics.totalAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            borderRadius: 2,
            bgcolor: '#FEF3C7',
            border: '1px solid #FDE68A',
            boxShadow: 'none'
          }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <DescriptionIcon sx={{ color: '#92400E' }} />
                <Typography variant="body2" color="#64748B">
                  Draft
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight={700} color="#92400E" sx={{ mt: 1 }}>
                {statistics.draftCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            borderRadius: 2,
            bgcolor: '#DBEAFE',
            border: '1px solid #BFDBFE',
            boxShadow: 'none'
          }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <DescriptionIcon sx={{ color: '#1E40AF' }} />
                <Typography variant="body2" color="#64748B">
                  Sent
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight={700} color="#1E40AF" sx={{ mt: 1 }}>
                {statistics.sentCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            borderRadius: 2,
            bgcolor: '#D1FAE5',
            border: '1px solid #A7F3D0',
            boxShadow: 'none'
          }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <DescriptionIcon sx={{ color: '#065F46' }} />
                <Typography variant="body2" color="#64748B">
                  Approved
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight={700} color="#065F46" sx={{ mt: 1 }}>
                {statistics.approvedCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ 
            borderRadius: 2,
            bgcolor: '#FEF3C7',
            border: '1px solid #FDE68A',
            boxShadow: 'none'
          }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <MoneyIcon sx={{ color: '#92400E' }} />
                <Typography variant="body2" color="#64748B">
                  Avg. Amount
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight={700} color="#92400E" sx={{ mt: 1 }}>
                {formatCurrency(statistics.avgAmount)}
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
              placeholder="Search by quotation no, vendor, or company..."
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
              Add Quotation
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Quotations Table */}
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
                    indeterminate={selected.length > 0 && selected.length < filteredQuotations.length}
                    checked={filteredQuotations.length > 0 && selected.length === filteredQuotations.length}
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
                    Quotation No
                    <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
                  </Stack>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  Vendor
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  Company
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  Date
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  Valid Till
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.875rem',
                  py: 2,
                  color: TEXT_COLOR_HEADER
                }}>
                  Amount
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
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Typography color="textSecondary" sx={{ fontStyle: 'italic' }}>
                      Loading quotations...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedQuotations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body1" color="#64748B" fontWeight={500}>
                        {searchTerm ? 'No quotations found' : 'No quotations available'}
                      </Typography>
                      <Typography variant="body2" color="#94A3B8" sx={{ mt: 1 }}>
                        {searchTerm ? 'Try adjusting your search terms' : 'Add your first quotation to get started'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedQuotations.map((quotation, index) => {
                  const isSelected = selected.includes(quotation._id);
                  const isOddRow = index % 2 === 0;
                  const isActionMenuOpen = Boolean(actionMenuAnchor) && 
                    selectedQuotationForAction?._id === quotation._id;

                  return (
                    <TableRow
                      key={quotation._id}
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
                          onChange={() => handleSelect(quotation._id)}
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
                          {quotation.QuotationNo}
                        </Typography>
                        <Typography variant="caption" color="#64748B">
                          Items: {quotation.Items?.length || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500} color={TEXT_COLOR_MAIN}>
                          {quotation.VendorName}
                        </Typography>
                        <Typography variant="caption" color="#64748B">
                          {quotation.VendorGSTIN}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="#475569" fontWeight={500}>
                          {quotation.CompanyName}
                        </Typography>
                        <Typography variant="caption" color="#64748B">
                          {quotation.CompanyGSTIN}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="#475569">
                          {formatDate(quotation.QuotationDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="#475569">
                          {formatDate(quotation.ValidTill)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="#059669">
                          {formatCurrency(quotation.GrandTotal)}
                        </Typography>
                        <Typography variant="caption" color="#64748B">
                          GST: {quotation.GSTPercentage}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(quotation.Status)}
                      </TableCell>
                      <TableCell align="center" sx={{ width: 100 }}>
                        <ActionMenu 
                          item={quotation}
                          onView={openViewQuotationModal}
                          onEdit={openEditQuotationModal}
                          onDelete={openDeleteQuotationDialog}
                          onPrint={openPrintQuotation}
                          anchorEl={isActionMenuOpen ? actionMenuAnchor : null}
                          onClose={handleActionMenuClose}
                          onOpen={(e) => handleActionMenuOpen(e, quotation)}
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
          count={filteredQuotations.length}
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
      <AddQuotation 
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onAdd={handleAddQuotation}
      />

      {selectedQuotation && (
        <>
          <EditQuotation 
            open={openEditModal}
            onClose={() => {
              setOpenEditModal(false);
              setSelectedQuotation(null);
            }}
            quotation={selectedQuotation}
            onUpdate={handleEditQuotation}
          />

          <ViewQuotation 
            open={openViewModal}
            onClose={() => {
              setOpenViewModal(false);
              setSelectedQuotation(null);
            }}
            quotation={selectedQuotation}
            onEdit={() => {
              setOpenViewModal(false);
              setOpenEditModal(true);
            }}
          />
          <PrintQuotation
      open={openPrintModal}
      onClose={() => {
        setOpenPrintModal(false);
        setSelectedQuotation(null);
      }}
      quotation={selectedQuotation}
    />
          <DeleteQuotation 
            open={openDeleteDialog}
            onClose={() => {
              setOpenDeleteDialog(false);
              setSelectedQuotation(null);
            }}
            quotation={selectedQuotation}
            onDelete={handleDeleteQuotation}
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

export default QuotationMaster;