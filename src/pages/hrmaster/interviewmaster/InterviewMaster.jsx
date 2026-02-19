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
  TableSortLabel,
  Card,
  CardContent
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  FilterAlt as FilterAltIcon,
  Clear as ClearIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Feedback as FeedbackIcon,
  VideoCall as VideoCallIcon,
  Phone as PhoneIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  PersonOff as PersonOffIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../../../config/Config';
import { format, parseISO, isAfter, isBefore } from 'date-fns';

// Import interview components
import ScheduleInterview from './ScheduleInterview';
import RescheduleInterview from './RescheduleInterview';
import InterviewFeedback from './InterviewFeedback';
import CancelInterview from './CancelInterview';
import ViewInterviewDetails from './ViewInterviewDetails';

// Color constants
const HEADER_GRADIENT = 'linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)';
const STRIPE_COLOR_ODD = '#FFFFFF';
const STRIPE_COLOR_EVEN = '#f8fafc';
const HOVER_COLOR = '#f1f5f9';
const PRIMARY_BLUE = '#00B4D8';
const TEXT_COLOR_HEADER = '#FFFFFF';
const TEXT_COLOR_MAIN = '#0f172a';

// Status color mapping - Updated with all enum values
const STATUS_COLORS = {
  'scheduled': { bg: '#E3F2FD', color: '#1976D2', icon: <ScheduleIcon sx={{ fontSize: 14 }} />, label: 'Scheduled' },
  'rescheduled': { bg: '#FFF3E0', color: '#ED6C02', icon: <AccessTimeIcon sx={{ fontSize: 14 }} />, label: 'Rescheduled' },
  'cancelled': { bg: '#FFEBEE', color: '#C62828', icon: <CancelIcon sx={{ fontSize: 14 }} />, label: 'Cancelled' },
  'completed': { bg: '#E8F5E9', color: '#2E7D32', icon: <CheckCircleIcon sx={{ fontSize: 14 }} />, label: 'Completed' },
  'no-show': { bg: '#FEF3C7', color: '#B45309', icon: <PersonOffIcon sx={{ fontSize: 14 }} />, label: 'No Show' }
};

// Interview type icons and labels
const TYPE_CONFIG = {
  'video': { icon: <VideoCallIcon />, label: 'Video Call', color: '#1976D2' },
  'phone': { icon: <PhoneIcon />, label: 'Phone Call', color: '#2E7D32' },
  'in-person': { icon: <LocationIcon />, label: 'In Person', color: '#ED6C02' }
};

// Interview rounds
const INTERVIEW_ROUNDS = [
  'Telephonic',
  'Technical',
  'HR',
  'Managerial',
  'Final'
];

// Interview types
const INTERVIEW_TYPES = [
  { value: 'video', label: 'Video Call' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'in-person', label: 'In Person' }
];

// Filter Bar Component - With fixed widths
// Filter Bar Component - With inline layout
const FilterBar = ({ 
  filters, 
  onFilterChange, 
  onApplyFilters, 
  onClearFilters 
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={
          <Badge 
            badgeContent={Object.values(filters).filter(v => v && v !== 'all').length} 
            color="primary"
            variant="dot"
          >
            <FilterAltIcon />
          </Badge>
        }
        onClick={() => setOpen(!open)}
        sx={{ 
          height: 40,
          borderRadius: 1.5,
          borderColor: '#cbd5e1',
          color: '#475569',
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none',
          minWidth: 90,
          '&:hover': {
            borderColor: PRIMARY_BLUE,
            bgcolor: alpha(PRIMARY_BLUE, 0.04)
          }
        }}
      >
        Filters
      </Button>

      <Collapse in={open}>
        <Paper sx={{ 
          p: 2, 
          mt: 2, 
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          bgcolor: '#f8fafc',
          position: 'absolute',
          zIndex: 10,
          width: 'auto',
          minWidth: 900
        }}>
          <Stack direction="row" alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status || 'all'}
                onChange={onFilterChange}
                label="Status"
                sx={{ borderRadius: 1.5, bgcolor: '#FFFFFF', width: '100px' }}
              >
                <MenuItem value="all">All Status</MenuItem>
                {Object.entries(STATUS_COLORS).map(([key, config]) => (
                  <MenuItem key={key} value={key}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%',
                        bgcolor: config.color 
                      }} />
                      <span>{config.label}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={filters.type || 'all'}
                onChange={onFilterChange}
                label="Type"
                sx={{ borderRadius: 1.5, bgcolor: '#FFFFFF',width: '100px' }}
              >
                <MenuItem value="all">All Types</MenuItem>
                {INTERVIEW_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel>Round</InputLabel>
              <Select
                name="round"
                value={filters.round || 'all'}
                onChange={onFilterChange}
                label="Round"
                sx={{ borderRadius: 1.5, bgcolor: '#FFFFFF', width: '100px' }}
              >
                <MenuItem value="all">All Rounds</MenuItem>
                {INTERVIEW_ROUNDS.map(round => (
                  <MenuItem key={round} value={round}>{round}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              type="date"
              label="From Date"
              name="dateFrom"
              value={filters.dateFrom || ''}
              onChange={onFilterChange}
              InputLabelProps={{ shrink: true }}
              sx={{ 
                width: 140,
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 1.5, 
                  bgcolor: '#FFFFFF' 
                }
              }}
            />

            <TextField
              size="small"
              type="date"
              label="To Date"
              name="dateTo"
              value={filters.dateTo || ''}
              onChange={onFilterChange}
              InputLabelProps={{ shrink: true }}
              sx={{ 
                width: 140,
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 1.5, 
                  bgcolor: '#FFFFFF' 
                }
              }}
            />

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                onClick={onApplyFilters}
                sx={{
                  height: 40,
                  borderRadius: 1.5,
                  background: HEADER_GRADIENT,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  minWidth: 80
                }}
              >
                Apply
              </Button>
              {Object.values(filters).some(v => v && v !== 'all') && (
                <Button
                  variant="outlined"
                  onClick={onClearFilters}
                  sx={{
                    height: 40,
                    borderRadius: 1.5,
                    borderColor: '#cbd5e1',
                    color: '#475569',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    minWidth: 40,
                    px: 1
                  }}
                >
                  <ClearIcon />
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>
      </Collapse>
    </Box>
  );
};

// Action Menu Component
const ActionMenu = ({ 
  interview, 
  onView, 
  onReschedule, 
  onFeedback, 
  onCancel,
  anchorEl, 
  onClose, 
  onOpen 
}) => {
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
        <MenuItem 
          onClick={() => {
            onView(interview);
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
        
        {interview.status === 'scheduled' && (
          <>
            <Divider />
            <MenuItem 
              onClick={() => {
                onReschedule(interview);
                onClose();
              }}
              sx={{ py: 1 }}
            >
              <ListItemIcon sx={{ color: '#ED6C02', minWidth: 36 }}>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body2" fontWeight={500}>Reschedule</Typography>
              </ListItemText>
            </MenuItem>
            
            <MenuItem 
              onClick={() => {
                onFeedback(interview);
                onClose();
              }}
              sx={{ py: 1 }}
            >
              <ListItemIcon sx={{ color: '#10B981', minWidth: 36 }}>
                <FeedbackIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body2" fontWeight={500}>Submit Feedback</Typography>
              </ListItemText>
            </MenuItem>
            
            <MenuItem 
              onClick={() => {
                onCancel(interview);
                onClose();
              }}
              sx={{ py: 1 }}
            >
              <ListItemIcon sx={{ color: '#DC2626', minWidth: 36 }}>
                <CancelIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body2" fontWeight={500}>Cancel Interview</Typography>
              </ListItemText>
            </MenuItem>
          </>
        )}
        
        {interview.status === 'completed' && !interview.feedback && (
          <>
            <Divider />
            <MenuItem 
              onClick={() => {
                onFeedback(interview);
                onClose();
              }}
              sx={{ py: 1 }}
            >
              <ListItemIcon sx={{ color: '#10B981', minWidth: 36 }}>
                <FeedbackIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body2" fontWeight={500}>Submit Feedback</Typography>
              </ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

const InterviewMaster = () => {
  const navigate = useNavigate();

  // State for data
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); 
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Selection state
  const [selected, setSelected] = useState([]);
  
  // Sorting state
  const [orderBy, setOrderBy] = useState('scheduledAt');
  const [order, setOrder] = useState('desc');
  
  // Filter state
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    round: '',
    dateFrom: '',
    dateTo: ''
  });
  
  // Menu state
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedInterviewForAction, setSelectedInterviewForAction] = useState(null);
  
  // Modal state
  const [openScheduleModal, setOpenScheduleModal] = useState(false);
  const [openRescheduleModal, setOpenRescheduleModal] = useState(false);
  const [openFeedbackModal, setOpenFeedbackModal] = useState(false);
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  
  // Selected interview
  const [selectedInterview, setSelectedInterview] = useState(null);
  
  // Stats
//   const [stats, setStats] = useState({
//     total: 0,
//     scheduled: 0,
//     completed: 0,
//     cancelled: 0,
//     today: 0,
//     upcoming: 0
//   });
  
  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch interviews with pagination and filters
  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query params
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        sortBy: orderBy,
        sortOrder: order
      });
      
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.round) params.append('round', filters.round);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const response = await axios.get(`${BASE_URL}/api/interviews?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setInterviews(response.data.data || []);
        setTotalItems(response.data.pagination?.totalItems || 0);
        setTotalPages(response.data.pagination?.totalPages || 1);
        calculateStats(response.data.data || []);
        setError(''); // Clear any previous errors
      } else {
        setError(response.data.message || 'Failed to load interviews');
        showNotification('Failed to load interviews', 'error');
      }
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setError(err.response?.data?.message || 'Failed to load interviews. Please try again.');
      showNotification('Failed to load interviews. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [page, rowsPerPage, orderBy, order, filters]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchInterviews();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const calculateStats = (data) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const scheduled = data.filter(i => i.status === 'scheduled').length;
    const completed = data.filter(i => i.status === 'completed').length;
    const cancelled = data.filter(i => i.status === 'cancelled').length;
    
    const todayCount = data.filter(i => {
      if (i.status !== 'scheduled' && i.status !== 'rescheduled') return false;
      const interviewDate = new Date(i.scheduledAt);
      interviewDate.setHours(0, 0, 0, 0);
      return interviewDate.getTime() === today.getTime();
    }).length;

    const upcomingCount = data.filter(i => {
      if (i.status !== 'scheduled' && i.status !== 'rescheduled') return false;
      const interviewDate = new Date(i.scheduledAt);
      return isAfter(interviewDate, today) && isBefore(interviewDate, nextWeek);
    }).length;

 
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

  // Handle apply filters
  const handleApplyFilters = () => {
    setPage(0);
    fetchInterviews();
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      status: '',
      type: '',
      round: '',
      dateFrom: '',
      dateTo: ''
    });
    setPage(0);
  };

  // Handle sort
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle select all
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(interviews.map(interview => interview._id));
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

  // Handle actions
  const handleView = (interview) => {
    setSelectedInterview(interview);
    setOpenViewModal(true);
  };

  const handleReschedule = (interview) => {
    setSelectedInterview(interview);
    setOpenRescheduleModal(true);
  };

  const handleFeedback = (interview) => {
    setSelectedInterview(interview);
    setOpenFeedbackModal(true);
  };

  const handleCancel = (interview) => {
    setSelectedInterview(interview);
    setOpenCancelModal(true);
  };

  // Action menu handlers
  const handleActionMenuOpen = (event, interview) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedInterviewForAction(interview);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedInterviewForAction(null);
  };

  // Handle CRUD success
  const handleScheduleSuccess = (newInterview) => {
    fetchInterviews();
    setOpenScheduleModal(false);
    showNotification('Interview scheduled successfully!', 'success');
  };

  const handleRescheduleSuccess = (updatedInterview) => {
    fetchInterviews();
    setOpenRescheduleModal(false);
    setSelectedInterview(null);
    showNotification('Interview rescheduled successfully!', 'success');
  };

  const handleFeedbackSuccess = (updatedInterview) => {
    fetchInterviews();
    setOpenFeedbackModal(false);
    setSelectedInterview(null);
    showNotification('Feedback submitted successfully!', 'success');
  };

  const handleCancelSuccess = (cancelledInterview) => {
    fetchInterviews();
    setOpenCancelModal(false);
    setSelectedInterview(null);
    showNotification('Interview cancelled successfully!', 'success');
  };

  // Show notification
  const showNotification = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Helper functions
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return format(parseISO(dateTimeString), 'dd MMM yyyy, hh:mm a');
  };

  const getCandidateName = (interview) => {
    if (interview.applicationId?.candidateId) {
      const candidate = interview.applicationId.candidateId;
      return `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Unknown';
    }
    return interview.candidateId?.fullName || 'Unknown';
  };

  const getCandidateEmail = (interview) => {
    return interview.applicationId?.candidateId?.email || interview.candidateId?.email || 'N/A';
  };

  const getJobTitle = (interview) => {
    return interview.applicationId?.jobId?.title || interview.jobId?.title || 'N/A';
  };

  const getAvatarInitials = (interview) => {
    const name = getCandidateName(interview);
    if (name === 'Unknown') return '?';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name) => {
    if (!name) return PRIMARY_BLUE;
    
    const colors = [
      '#164e63', '#0e7490', '#0891b2', '#0c4a6e', '#1d4ed8',
      '#7c3aed', '#7e22ce', '#be185d', '#c2410c', '#059669'
    ];
    
    const charCode = name.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  const getStatusChip = (status) => {
    const config = STATUS_COLORS[status] || { bg: '#F5F5F5', color: '#666', icon: <EventIcon sx={{ fontSize: 14 }} />, label: status };
    
    return (
      <Chip
        label={config.label}
        size="small"
        icon={config.icon}
        sx={{
          bgcolor: config.bg,
          color: config.color,
          fontWeight: 500,
          fontSize: '0.75rem',
          height: 24,
          '& .MuiChip-icon': {
            color: config.color
          }
        }}
      />
    );
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
          Interview Master
        </Typography>
        <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
          Schedule and manage candidate interviews across all job openings
        </Typography>
      </Box>

      {/* Stats Cards */}
      {/* <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="#64748B">Total Interviews</Typography>
                  <Typography variant="h4" fontWeight={600} color={TEXT_COLOR_MAIN}>
                    {stats.total}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(PRIMARY_BLUE, 0.1), color: PRIMARY_BLUE, width: 48, height: 48 }}>
                  <EventIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="#64748B">Scheduled</Typography>
                  <Typography variant="h4" fontWeight={600} color="#1976D2">
                    {stats.scheduled}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#1976D2', 0.1), color: '#1976D2', width: 48, height: 48 }}>
                  <ScheduleIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="#64748B">Completed</Typography>
                  <Typography variant="h4" fontWeight={600} color="#2E7D32">
                    {stats.completed}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#2E7D32', 0.1), color: '#2E7D32', width: 48, height: 48 }}>
                  <CheckCircleIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="#64748B">Today</Typography>
                  <Typography variant="h4" fontWeight={600} color="#F59E0B">
                    {stats.today}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#F59E0B', 0.1), color: '#F59E0B', width: 48, height: 48 }}>
                  <TodayIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="#64748B">Upcoming (7d)</Typography>
                  <Typography variant="h4" fontWeight={600} color="#10B981">
                    {stats.upcoming}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#10B981', 0.1), color: '#10B981', width: 48, height: 48 }}>
                  <DateRangeIcon />
                </Avatar>
              </Stack>
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
          {/* Search and Filters */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search by candidate, email, interview ID..."
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
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
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
            
            <FilterBar 
              filters={filters}
              onFilterChange={handleFilterChange}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
            />

           
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} alignItems="center">
            {selected.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${selected.length} selected interviews?`)) {
                    showNotification('Bulk delete requires API implementation', 'warning');
                  }
                }}
                sx={{ 
                  height: 40,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  minWidth: 100
                }}
                disabled={loading}
              >
                Delete ({selected.length})
              </Button>
            )}
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenScheduleModal(true)}
              sx={{
                height: 40,
                borderRadius: 1.5,
                background: HEADER_GRADIENT,
                fontSize: '0.875rem',
                fontWeight: 500,
                textTransform: 'none',
                minWidth: 150,
                '&:hover': {
                  opacity: 0.9,
                  background: HEADER_GRADIENT,
                }
              }}
              disabled={loading}
            >
              Schedule Interview
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 1.5 }}>
          {error}
        </Alert>
      )}

      {/* Interviews Table */}
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
                    indeterminate={selected.length > 0 && selected.length < interviews.length}
                    checked={interviews.length > 0 && selected.length === interviews.length}
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
                    <TableSortLabel
                      active={orderBy === 'interviewId'}
                      direction={orderBy === 'interviewId' ? order : 'asc'}
                      onClick={() => handleRequestSort('interviewId')}
                      sx={{ 
                        color: `${TEXT_COLOR_HEADER} !important`,
                        '& .MuiTableSortLabel-icon': {
                          color: `${TEXT_COLOR_HEADER} !important`
                        }
                      }}
                    >
                      Interview ID
                    </TableSortLabel>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <TableSortLabel
                      active={orderBy === 'candidate'}
                      direction={orderBy === 'candidate' ? order : 'asc'}
                      onClick={() => handleRequestSort('candidate')}
                      sx={{ 
                        color: `${TEXT_COLOR_HEADER} !important`,
                        '& .MuiTableSortLabel-icon': {
                          color: `${TEXT_COLOR_HEADER} !important`
                        }
                      }}
                    >
                      Candidate
                    </TableSortLabel>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <TableSortLabel
                      active={orderBy === 'job'}
                      direction={orderBy === 'job' ? order : 'asc'}
                      onClick={() => handleRequestSort('job')}
                      sx={{ 
                        color: `${TEXT_COLOR_HEADER} !important`,
                        '& .MuiTableSortLabel-icon': {
                          color: `${TEXT_COLOR_HEADER} !important`
                        }
                      }}
                    >
                      Position
                    </TableSortLabel>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <TableSortLabel
                      active={orderBy === 'round'}
                      direction={orderBy === 'round' ? order : 'asc'}
                      onClick={() => handleRequestSort('round')}
                      sx={{ 
                        color: `${TEXT_COLOR_HEADER} !important`,
                        '& .MuiTableSortLabel-icon': {
                          color: `${TEXT_COLOR_HEADER} !important`
                        }
                      }}
                    >
                      Round
                    </TableSortLabel>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2 }}>
                  Type
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <TableSortLabel
                      active={orderBy === 'scheduledAt'}
                      direction={orderBy === 'scheduledAt' ? order : 'asc'}
                      onClick={() => handleRequestSort('scheduledAt')}
                      sx={{ 
                        color: `${TEXT_COLOR_HEADER} !important`,
                        '& .MuiTableSortLabel-icon': {
                          color: `${TEXT_COLOR_HEADER} !important`
                        }
                      }}
                    >
                      Scheduled Time
                    </TableSortLabel>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <TableSortLabel
                      active={orderBy === 'status'}
                      direction={orderBy === 'status' ? order : 'asc'}
                      onClick={() => handleRequestSort('status')}
                      sx={{ 
                        color: `${TEXT_COLOR_HEADER} !important`,
                        '& .MuiTableSortLabel-icon': {
                          color: `${TEXT_COLOR_HEADER} !important`
                        }
                      }}
                    >
                      Status
                    </TableSortLabel>
                  </Stack>
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
                      Loading interviews...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : interviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <EventIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
                      <Typography variant="body1" color="#64748B" fontWeight={500}>
                        {searchTerm || filters.status || filters.type || filters.round || filters.dateFrom || filters.dateTo
                          ? 'No interviews found matching your criteria' 
                          : 'No interviews scheduled yet'}
                      </Typography>
                      <Typography variant="body2" color="#94A3B8" sx={{ mt: 1 }}>
                        {searchTerm || filters.status || filters.type || filters.round || filters.dateFrom || filters.dateTo
                          ? 'Try adjusting your filters or search terms' 
                          : 'Click "Schedule Interview" to create your first interview'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                interviews.map((interview, index) => {
                  const isSelected = selected.includes(interview._id);
                  const isOddRow = index % 2 === 0;
                  const isActionMenuOpen = Boolean(actionMenuAnchor) && 
                    selectedInterviewForAction?._id === interview._id;
                  const avatarColor = getAvatarColor(getCandidateName(interview));
                  const typeConfig = TYPE_CONFIG[interview.type] || { icon: <EventIcon />, label: interview.type, color: '#64748B' };

                  return (
                    <TableRow
                      key={interview._id}
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
                          onChange={() => handleSelect(interview._id)}
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
                            {interview.interviewId || interview._id.slice(-6).toUpperCase()}
                          </Typography>
                          <Typography variant="caption" color="#64748B">
                            {interview._id.slice(-6)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar 
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              bgcolor: avatarColor,
                              fontSize: '0.875rem',
                              fontWeight: 600
                            }}
                          >
                            {getAvatarInitials(interview)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600} color={TEXT_COLOR_MAIN}>
                              {getCandidateName(interview)}
                            </Typography>
                            <Typography variant="caption" color="#64748B">
                              {getCandidateEmail(interview)}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500} color={TEXT_COLOR_MAIN}>
                          {getJobTitle(interview)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={interview.round}
                          size="small"
                          sx={{ 
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            height: 24,
                            backgroundColor: '#EFF6FF',
                            color: '#1E40AF'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={typeConfig.label}
                          size="small"
                          icon={typeConfig.icon}
                          sx={{ 
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            height: 24,
                            backgroundColor: alpha(typeConfig.color, 0.1),
                            color: typeConfig.color,
                            '& .MuiChip-icon': {
                              color: typeConfig.color,
                              fontSize: 14
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="body2">
                            {formatDateTime(interview.scheduledAt)}
                          </Typography>
                          <Typography variant="caption" color="#64748B">
                            {interview.duration} minutes
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          {getStatusChip(interview.status)}
                          {interview.feedback && (
                            <Tooltip title="Feedback submitted">
                              <FeedbackIcon sx={{ fontSize: 16, color: '#10B981' }} />
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <ActionMenu 
                          interview={interview}
                          onView={handleView}
                          onReschedule={handleReschedule}
                          onFeedback={handleFeedback}
                          onCancel={handleCancel}
                          anchorEl={isActionMenuOpen ? actionMenuAnchor : null}
                          onClose={handleActionMenuClose}
                          onOpen={(e) => handleActionMenuOpen(e, interview)}
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
      <ScheduleInterview
        open={openScheduleModal}
        onClose={() => setOpenScheduleModal(false)}
        onAdd={handleScheduleSuccess}
      />

      {selectedInterview && (
        <>
          <RescheduleInterview
            open={openRescheduleModal}
            onClose={() => {
              setOpenRescheduleModal(false);
              setSelectedInterview(null);
            }}
            onReschedule={handleRescheduleSuccess}
            interviewData={selectedInterview}
          />

          <InterviewFeedback
            open={openFeedbackModal}
            onClose={() => {
              setOpenFeedbackModal(false);
              setSelectedInterview(null);
            }}
            onSubmit={handleFeedbackSuccess}
            interviewData={selectedInterview}
          />

          <CancelInterview
            open={openCancelModal}
            onClose={() => {
              setOpenCancelModal(false);
              setSelectedInterview(null);
            }}
            onCancel={handleCancelSuccess}
            interviewData={selectedInterview}
          />

          <ViewInterviewDetails
            open={openViewModal}
            onClose={() => {
              setOpenViewModal(false);
              setSelectedInterview(null);
            }}
            interviewId={selectedInterview._id}
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

export default InterviewMaster;