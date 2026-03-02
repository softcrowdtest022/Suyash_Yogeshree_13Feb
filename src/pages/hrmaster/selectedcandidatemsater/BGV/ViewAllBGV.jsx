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
  Visibility as ViewIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Sort as SortIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  AccessTime as AccessTimeIcon,
  Error as ErrorIcon,
  VerifiedUser as VerifiedUserIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Import BGV components
import InitiateBGV from './InitiateBGV';
import BGVStatus from './BGVStatus';
import BASE_URL from '../../../../config/Config';


// Color constants - EXACT SAME as header gradient
const HEADER_GRADIENT = 'linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)';
const STRIPE_COLOR_ODD = '#FFFFFF';
const STRIPE_COLOR_EVEN = '#f8fafc'; // slate-50
const HOVER_COLOR = '#f1f5f9'; // slate-100
const PRIMARY_BLUE = '#00B4D8';
const TEXT_COLOR_HEADER = '#FFFFFF';
const TEXT_COLOR_MAIN = '#0f172a'; // slate-900

// Status color mapping
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return { bg: '#f1f5f9', color: '#475569', icon: <AccessTimeIcon />, label: 'Pending' };
    case 'in_progress':
    case 'in progress':
      return { bg: '#fef3c7', color: '#92400e', icon: <RefreshIcon />, label: 'In Progress' };
    case 'completed':
    case 'cleared':
      return { bg: '#d1fae5', color: '#065f46', icon: <CheckCircleIcon />, label: 'Completed' };
    case 'failed':
    case 'discrepancy':
      return { bg: '#fee2e2', color: '#991b1b', icon: <ErrorIcon />, label: 'Failed' };
    case 'under_review':
      return { bg: '#dbeafe', color: '#1e40af', icon: <InfoIcon />, label: 'Under Review' };
    default:
      return { bg: '#f1f5f9', color: '#475569', icon: <InfoIcon />, label: status || 'Unknown' };
  }
};

// Action Menu Component
const ActionMenu = ({ bgv, onView, onEdit, anchorEl, onClose, onOpen }) => {
  return (
    <>
      <Tooltip title="Actions">
        <IconButton
          size="small"
          onClick={onOpen}
          sx={{
            color: '#64748b', // slate-500
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
            onView(bgv);
            onClose();
          }}
          sx={{ py: 1 }}
        >
          <ListItemIcon sx={{ color: PRIMARY_BLUE, minWidth: 36 }}>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" fontWeight={500}>View Status</Typography>
          </ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            onEdit(bgv);
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
            // Handle delete
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

const ViewAllBGV = () => {
  const navigate = useNavigate();
  
  // State for data
  const [bgvList, setBgvList] = useState([]);
  const [filteredBgvList, setFilteredBgvList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Menu state for action buttons
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedBgvForAction, setSelectedBgvForAction] = useState(null);
  
  // Modal states
  const [openInitiateModal, setOpenInitiateModal] = useState(false);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [selectedBgv, setSelectedBgv] = useState(null);
  
  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch BGV list from API
  useEffect(() => {
    fetchBGVList();
  }, [page, rowsPerPage]);

  const fetchBGVList = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/bgv?page=${page + 1}&limit=${rowsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setBgvList(response.data.data || []);
        setFilteredBgvList(response.data.data || []);
        setTotalCount(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      } else {
        showNotification('Failed to load BGV records', 'error');
      }
    } catch (err) {
      console.error('Error fetching BGV list:', err);
      showNotification('Failed to load BGV records. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    
    const filtered = bgvList.filter(bgv =>
      bgv.bgvId?.toLowerCase().includes(value) ||
      bgv.candidate?.fullName?.toLowerCase().includes(value) ||
      bgv.candidate?.email?.toLowerCase().includes(value) ||
      bgv.offer?.offerId?.toLowerCase().includes(value) ||
      bgv.vendor?.toLowerCase().includes(value)
    );
    
    setFilteredBgvList(filtered);
    setPage(0);
  };
  
  // Handle select all
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(filteredBgvList.map(bgv => bgv._id));
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
    fetchBGVList();
    showNotification('Data refreshed successfully', 'success');
  };
  
  // Handle bulk delete
  const handleBulkDelete = () => {
    showNotification('Bulk delete requires API implementation', 'warning');
  };
  
  // Action menu handlers
  const handleActionMenuOpen = (event, bgv) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedBgvForAction(bgv);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedBgvForAction(null);
  };

  // Modal open handlers
  const openInitiateModalHandler = () => {
    setOpenInitiateModal(true);
    handleActionMenuClose();
  };
  
  const openStatusModalHandler = (bgv) => {
    setSelectedBgv(bgv);
    setOpenStatusModal(true);
    handleActionMenuClose();
  };
  
  const openEditModalHandler = (bgv) => {
    // Handle edit
    showNotification('Edit functionality coming soon', 'info');
    handleActionMenuClose();
  };
  
  // Callback handlers for modals
  const handleBGVInitiated = (newBGV) => {
    fetchBGVList();
    showNotification('Background verification initiated successfully!', 'success');
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
  
  // Calculate check statistics
  const getCheckStats = (checks) => {
    if (!checks || checks.length === 0) {
      return { total: 0, completed: 0, pending: 0, failed: 0 };
    }
    
    const total = checks.length;
    const completed = checks.filter(c => 
      c.status?.toLowerCase() === 'completed' || 
      c.status?.toLowerCase() === 'cleared'
    ).length;
    const failed = checks.filter(c => 
      c.status?.toLowerCase() === 'failed' || 
      c.status?.toLowerCase() === 'discrepancy'
    ).length;
    const pending = total - completed - failed;
    
    return { total, completed, pending, failed };
  };
  
  // Get progress percentage
  const getProgress = (checks) => {
    const stats = getCheckStats(checks);
    return stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  };
  
  // Paginated BGV list (client-side pagination when search is active)
  const paginatedBgvList = searchTerm 
    ? filteredBgvList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : filteredBgvList;

  // Check if any BGV are selected
  const hasSelected = selected.length > 0;

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
          Background Verification
        </Typography>
        <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
          Manage and track candidate background verification
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
                  Total Verifications
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#FFF3E0' }}>
                <AccessTimeIcon sx={{ color: '#F57C00' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {bgvList.filter(b => b.status?.toLowerCase() === 'pending').length}
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
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#E8F5E9' }}>
                <RefreshIcon sx={{ color: '#2E7D32' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {bgvList.filter(b => b.status?.toLowerCase() === 'in_progress').length}
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
                  {bgvList.filter(b => b.status?.toLowerCase() === 'completed').length}
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
          {/* Search and Filters */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
            <TextField
              placeholder="Search by BGV ID, Candidate, Offer..."
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
              onClick={openInitiateModalHandler}
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
              Initiate BGV
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* BGV Table */}
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
                    indeterminate={selected.length > 0 && selected.length < filteredBgvList.length}
                    checked={filteredBgvList.length > 0 && selected.length === filteredBgvList.length}
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
                    BGV ID
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
                    Candidate
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
                    Offer
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
                    Vendor
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
                  color: TEXT_COLOR_HEADER
                }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    Progress
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
                    Initiated
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
                      Loading BGV records...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedBgvList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <SecurityIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
                      <Typography variant="body1" color="#64748B" fontWeight={500}>
                        {searchTerm ? 'No BGV records found' : 'No background verifications yet'}
                      </Typography>
                      <Typography variant="body2" color="#94A3B8" sx={{ mt: 1 }}>
                        {searchTerm ? 'Try adjusting your search terms' : 'Click "Initiate BGV" to start a new verification'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBgvList.map((bgv, index) => {
                  const isSelected = selected.includes(bgv._id);
                  const isOddRow = index % 2 === 0;
                  const isActionMenuOpen = Boolean(actionMenuAnchor) && 
                    selectedBgvForAction?._id === bgv._id;
                  const statusStyle = getStatusColor(bgv.status);
                  const stats = getCheckStats(bgv.checks);
                  const progress = getProgress(bgv.checks);

                  return (
                    <TableRow
                      key={bgv._id}
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
                          onChange={() => handleSelect(bgv._id)}
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
                          {bgv.bgvId || 'N/A'}
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
                            {bgv.candidate?.fullName?.charAt(0) || '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {bgv.candidate?.fullName || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="#64748B">
                              {bgv.candidate?.email || ''}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {bgv.offer?.offerId || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="#64748B">
                          {bgv.offer?.status || ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={bgv.vendor || 'authbridge'}
                          size="small"
                          variant="outlined"
                          sx={{ textTransform: 'capitalize' }}
                        />
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
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ minWidth: 60 }}>
                            <Typography variant="caption" color="textSecondary">
                              {stats.completed}/{stats.total}
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={progress} 
                            sx={{ 
                              width: 80, 
                              height: 6, 
                              borderRadius: 3,
                              bgcolor: '#E0E0E0',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: statusStyle.color
                              }
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(bgv.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ width: 100 }}>
                        <ActionMenu 
                          bgv={bgv}
                          onView={openStatusModalHandler}
                          onEdit={openEditModalHandler}
                          anchorEl={isActionMenuOpen ? actionMenuAnchor : null}
                          onClose={handleActionMenuClose}
                          onOpen={(e) => handleActionMenuOpen(e, bgv)}
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
          count={searchTerm ? filteredBgvList.length : totalCount}
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
      <InitiateBGV 
        open={openInitiateModal}
        onClose={() => setOpenInitiateModal(false)}
        onSubmit={handleBGVInitiated}
      />

      <BGVStatus 
        open={openStatusModal}
        onClose={() => {
          setOpenStatusModal(false);
          setSelectedBgv(null);
        }}
        bgvData={selectedBgv}
        bgvId={selectedBgv?._id}
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

export default ViewAllBGV;