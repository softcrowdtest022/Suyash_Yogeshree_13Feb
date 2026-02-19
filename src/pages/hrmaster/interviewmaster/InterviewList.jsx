import React, { useState, useEffect } from 'react';
import {
  // Layout components
  Box,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  
  // Form components
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  
  // Feedback components
  Alert,
  CircularProgress,
  Skeleton,
  
  // Data display
  Typography,
  Chip,
  Avatar,
  Badge,
  Tooltip,
  IconButton,
  
  // Buttons and actions
  Button,
  ButtonGroup,
  
  // Navigation
  Link,
  
  // Utils
  Stack,
  Card,
  CardContent,
  CardActions,
  Divider,
  Menu,
  MenuItem as MenuItemMui,
  useMediaQuery,
  useTheme,
  
} from '@mui/material';
import { 
  Add as AddIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Feedback as FeedbackIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  VideoCall as VideoCallIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIconMui,
  Event as EventIcon,
  Download as DownloadIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';
import ViewInterviewDetails from './ViewInterviewDetails';
import ScheduleInterview from './ScheduleInterview';
import RescheduleInterview from './RescheduleInterview';
import InterviewFeedback from './InterviewFeedback';
import CancelInterview from './CancelInterview';

// Status color mapping
const STATUS_COLORS = {
  'scheduled': { bg: '#E3F2FD', color: '#1976D2', icon: <ScheduleIcon /> },
  'completed': { bg: '#E8F5E9', color: '#2E7D32', icon: <CheckCircleIcon /> },
  'cancelled': { bg: '#FFEBEE', color: '#C62828', icon: <CancelIconMui /> },
  'rescheduled': { bg: '#FFF3E0', color: '#ED6C02', icon: <AccessTimeIcon /> },
  'in_progress': { bg: '#F3E5F5', color: '#7B1FA2', icon: <AccessTimeIcon /> }
};

// Interview type icons
const TYPE_ICONS = {
  'video': <VideoCallIcon fontSize="small" />,
  'phone': <PhoneIcon fontSize="small" />,
  'in-person': <LocationIcon fontSize="small" />
};

const InterviewList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // View mode state (table/card)
  const [viewMode, setViewMode] = useState('table');
  
  // Data states
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Sorting states
  const [orderBy, setOrderBy] = useState('scheduledAt');
  const [order, setOrder] = useState('desc');
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    round: '',
    dateFrom: '',
    dateTo: ''
  });
  
  // Filter menu state
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const filterOpen = Boolean(filterAnchorEl);
  
  // Action menu state
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const actionOpen = Boolean(actionAnchorEl);
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  
  // Interview rounds for filter
  const interviewRounds = [
  'Telephonic',
  'Technical',
  'HR', 
  'Managerial',
  'Final'
  ];

  // Interview types for filter
  const interviewTypes = [
    { value: 'video', label: 'Video Call' },
    { value: 'phone', label: 'Phone Call' },
    { value: 'in-person', label: 'In Person' }
  ];

  // Fetch interviews
  const fetchInterviews = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Build query params
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy: orderBy,
        sortOrder: order,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
        ...(filters.round && { round: filters.round }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo })
      };

      const response = await axios.get(`${BASE_URL}/api/interviews`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params
      });

      if (response.data.success) {
        setInterviews(response.data.data || []);
        setTotalItems(response.data.pagination?.totalItems || 0);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setError(response.data.message || 'Failed to fetch interviews');
      }
    } catch (err) {
      console.error('Error fetching interviews:', err);
      if (err.response) {
        setError(err.response.data?.message || 'Failed to fetch interviews');
      } else {
        setError('Failed to fetch interviews. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchInterviews();
  }, [page, rowsPerPage, orderBy, order]);

  // Fetch when filters change (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 0) {
        setPage(0);
      } else {
        fetchInterviews();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      type: '',
      round: '',
      dateFrom: '',
      dateTo: ''
    });
    setFilterAnchorEl(null);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleActionClick = (event, interview) => {
    setSelectedInterview(interview);
    setActionAnchorEl(event.currentTarget);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
  };

  const handleViewDetails = () => {
    setViewDialogOpen(true);
    handleActionClose();
  };

  const handleReschedule = () => {
    setRescheduleDialogOpen(true);
    handleActionClose();
  };

  const handleFeedback = () => {
    setFeedbackDialogOpen(true);
    handleActionClose();
  };

  const handleCancel = () => {
    setCancelDialogOpen(true);
    handleActionClose();
  };

  const handleRefresh = () => {
    fetchInterviews(true);
  };

  const handleAddSuccess = (newInterview) => {
    fetchInterviews();
    setScheduleDialogOpen(false);
  };

  const handleRescheduleSuccess = (updatedInterview) => {
    fetchInterviews();
    setRescheduleDialogOpen(false);
    setSelectedInterview(null);
  };

  const handleFeedbackSuccess = (updatedInterview) => {
    fetchInterviews();
    setFeedbackDialogOpen(false);
    setSelectedInterview(null);
  };

  const handleCancelSuccess = (cancelledInterview) => {
    fetchInterviews();
    setCancelDialogOpen(false);
    setSelectedInterview(null);
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const getStatusChip = (status) => {
    const config = STATUS_COLORS[status] || { bg: '#F5F5F5', color: '#666', icon: <EventIcon /> };
    
    return (
      <Chip
        label={status?.replace('_', ' ').toUpperCase()}
        size="small"
        icon={config.icon}
        sx={{
          backgroundColor: config.bg,
          color: config.color,
          fontWeight: 500,
          '& .MuiChip-icon': {
            color: config.color
          }
        }}
      />
    );
  };

  const getCandidateName = (interview) => {
    if (interview.applicationId?.candidateId) {
      const candidate = interview.applicationId.candidateId;
      return candidate.fullName || `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'N/A';
    }
    return interview.candidateId?.fullName || 'N/A';
  };

  const getCandidateEmail = (interview) => {
    return interview.applicationId?.candidateId?.email || interview.candidateId?.email || 'N/A';
  };

  const getJobTitle = (interview) => {
    return interview.applicationId?.jobId?.title || interview.jobId?.title || 'N/A';
  };

  const renderTableSkeleton = () => {
    return [...Array(rowsPerPage)].map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="circular" width={40} height={40} /></TableCell>
      </TableRow>
    ));
  };

  const renderCardSkeleton = () => {
    return [...Array(4)].map((_, index) => (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
        <Card sx={{ borderRadius: 1 }}>
          <CardContent>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="40%" />
            <Box sx={{ mt: 2 }}>
              <Skeleton variant="rectangular" height={36} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ));
  };

  const renderTableHeader = () => {
    const headers = [
      { id: 'interviewId', label: 'Interview ID' },
      { id: 'candidate', label: 'Candidate' },
      { id: 'job', label: 'Job Position' },
      { id: 'round', label: 'Round' },
      { id: 'scheduledAt', label: 'Scheduled Time' },
      { id: 'status', label: 'Status' },
      { id: 'actions', label: 'Actions', sortable: false }
    ];

    return (
      <TableHead>
        <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
          {headers.map((header) => (
            <TableCell 
              key={header.id}
              sortDirection={orderBy === header.id ? order : false}
              sx={{ fontWeight: 600 }}
            >
              {header.sortable !== false ? (
                <TableSortLabel
                  active={orderBy === header.id}
                  direction={orderBy === header.id ? order : 'asc'}
                  onClick={() => handleRequestSort(header.id)}
                >
                  {header.label}
                </TableSortLabel>
              ) : (
                header.label
              )}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  };

  const renderTableBody = () => {
    if (loading) {
      return renderTableSkeleton();
    }

    if (interviews.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
            <Typography variant="body2" color="textSecondary">
              No interviews found
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    return interviews.map((interview) => (
      <TableRow key={interview._id} hover>
        <TableCell>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
            {interview.interviewId || interview._id.slice(-6).toUpperCase()}
          </Typography>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976D2' }}>
              {getCandidateName(interview).charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {getCandidateName(interview)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {getCandidateEmail(interview)}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{getJobTitle(interview)}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{interview.round}</Typography>
        </TableCell>
        <TableCell>
          <Box>
            <Typography variant="body2">
              {formatDateTime(interview.scheduledAt)}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {interview.duration} min • {interview.type}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          {getStatusChip(interview.status)}
          {interview.feedback && (
            <Chip
              label="Feedback"
              size="small"
              icon={<FeedbackIcon />}
              sx={{ 
                ml: 0.5,
                backgroundColor: '#F3E5F5',
                color: '#7B1FA2',
                '& .MuiChip-icon': { color: '#7B1FA2' }
              }}
            />
          )}
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="View Details">
              <IconButton 
                size="small" 
                onClick={() => {
                  setSelectedInterview(interview);
                  setViewDialogOpen(true);
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {interview.status === 'scheduled' && (
              <>
                <Tooltip title="Reschedule">
                  <IconButton 
                    size="small"
                    onClick={() => {
                      setSelectedInterview(interview);
                      setRescheduleDialogOpen(true);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Submit Feedback">
                  <IconButton 
                    size="small"
                    onClick={() => {
                      setSelectedInterview(interview);
                      setFeedbackDialogOpen(true);
                    }}
                  >
                    <FeedbackIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel Interview">
                  <IconButton 
                    size="small"
                    onClick={() => {
                      setSelectedInterview(interview);
                      setCancelDialogOpen(true);
                    }}
                  >
                    <CancelIconMui fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {interview.status === 'completed' && !interview.feedback && (
              <Tooltip title="Submit Feedback">
                <IconButton 
                  size="small"
                  onClick={() => {
                    setSelectedInterview(interview);
                    setFeedbackDialogOpen(true);
                  }}
                >
                  <FeedbackIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </TableCell>
      </TableRow>
    ));
  };

  const renderCardView = () => {
    if (loading) {
      return renderCardSkeleton();
    }

    if (interviews.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="textSecondary">
            No interviews found
          </Typography>
        </Box>
      );
    }

    return interviews.map((interview) => (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={interview._id}>
        <Card 
          sx={{ 
            borderRadius: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            '&:hover': {
              boxShadow: 3
            }
          }}
        >
          <CardContent sx={{ flex: 1 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#666' }}>
                {interview.interviewId || interview._id.slice(-6).toUpperCase()}
              </Typography>
              {getStatusChip(interview.status)}
            </Box>

            {/* Candidate Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Avatar sx={{ width: 40, height: 40, bgcolor: '#1976D2' }}>
                {getCandidateName(interview).charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {getCandidateName(interview)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {getCandidateEmail(interview)}
                </Typography>
              </Box>
            </Box>

            {/* Job Details */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="textSecondary">
                Position
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {getJobTitle(interview)}
              </Typography>
            </Box>

            {/* Interview Details */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              <Chip
                label={interview.round}
                size="small"
                variant="outlined"
              />
              <Chip
                label={interview.type}
                size="small"
                icon={TYPE_ICONS[interview.type]}
                variant="outlined"
              />
              <Chip
                label={`${interview.duration} min`}
                size="small"
                icon={<AccessTimeIcon />}
                variant="outlined"
              />
            </Box>

            {/* Schedule */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="textSecondary">
                Scheduled
              </Typography>
              <Typography variant="body2">
                {formatDateTime(interview.scheduledAt)}
              </Typography>
            </Box>

            {/* Feedback Indicator */}
            {interview.feedback && (
              <Box sx={{ mt: 2 }}>
                <Chip
                  label="Feedback Submitted"
                  size="small"
                  icon={<FeedbackIcon />}
                  sx={{ 
                    backgroundColor: '#F3E5F5',
                    color: '#7B1FA2',
                    '& .MuiChip-icon': { color: '#7B1FA2' }
                  }}
                />
              </Box>
            )}
          </CardContent>

          <CardActions sx={{ p: 2, pt: 0, justifyContent: 'flex-end' }}>
            <Button 
              size="small" 
              startIcon={<VisibilityIcon />}
              onClick={() => {
                setSelectedInterview(interview);
                setViewDialogOpen(true);
              }}
            >
              View
            </Button>
            {interview.status === 'scheduled' && (
              <>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={() => {
                    setSelectedInterview(interview);
                    setRescheduleDialogOpen(true);
                  }}
                >
                  Reschedule
                </Button>
                <Button 
                  size="small" 
                  color="error"
                  onClick={() => {
                    setSelectedInterview(interview);
                    setCancelDialogOpen(true);
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
          </CardActions>
        </Card>
      </Grid>
    ));
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 1, border: '1px solid #E0E0E0' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Interview Management
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Schedule and manage candidate interviews
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: { md: 'flex-end' } }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={refreshing}
                size="small"
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setScheduleDialogOpen(true)}
                size="small"
                sx={{
                  backgroundColor: '#1976D2',
                  '&:hover': { backgroundColor: '#1565C0' }
                }}
              >
                Schedule Interview
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Filters Bar */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 1, border: '1px solid #E0E0E0' }}>
        <Grid container spacing={1.5} alignItems="center">
          {/* Search */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by candidate, email, interview ID..."
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: filters.search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setFilters(prev => ({ ...prev, search: '' }))}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
            />
          </Grid>

          {/* Status Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="rescheduled">Rescheduled</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Type Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                label="Type"
              >
                <MenuItem value="">All</MenuItem>
                {interviewTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Round Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Round</InputLabel>
              <Select
                name="round"
                value={filters.round}
                onChange={handleFilterChange}
                label="Round"
              >
                <MenuItem value="">All</MenuItem>
                {interviewRounds.map(round => (
                  <MenuItem key={round} value={round}>{round}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* View Toggle */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Table View">
                <IconButton 
                  onClick={() => setViewMode('table')}
                  color={viewMode === 'table' ? 'primary' : 'default'}
                >
                  <ViewListIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Card View">
                <IconButton 
                  onClick={() => setViewMode('card')}
                  color={viewMode === 'card' ? 'primary' : 'default'}
                >
                  <ViewModuleIcon />
                </IconButton>
              </Tooltip>
              {(filters.status || filters.type || filters.round || filters.dateFrom || filters.dateTo) && (
                <Tooltip title="Clear Filters">
                  <IconButton onClick={handleClearFilters} size="small">
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Advanced Filters */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            type="date"
            label="From Date"
            name="dateFrom"
            value={filters.dateFrom}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 200 }}
          />
          <TextField
            size="small"
            type="date"
            label="To Date"
            name="dateTo"
            value={filters.dateTo}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 200 }}
          />
        </Box>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
          {error}
        </Alert>
      )}

      {/* Table View */}
      {viewMode === 'table' ? (
        <Paper sx={{ borderRadius: 1, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader size="small">
              {renderTableHeader()}
              <TableBody>
                {renderTableBody()}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalItems}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      ) : (
        /* Card View */
        <>
          <Grid container spacing={2}>
            {renderCardView()}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <TablePagination
              rowsPerPageOptions={[6, 12, 24, 48]}
              component="div"
              count={totalItems}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>
        </>
      )}

      {/* Dialogs */}
      <ViewInterviewDetails
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        interviewId={selectedInterview?._id}
      />

      <ScheduleInterview
        open={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        onAdd={handleAddSuccess}
      />

      {selectedInterview && (
        <>
          <RescheduleInterview
            open={rescheduleDialogOpen}
            onClose={() => {
              setRescheduleDialogOpen(false);
              setSelectedInterview(null);
            }}
            onReschedule={handleRescheduleSuccess}
            interviewData={selectedInterview}
          />

          <InterviewFeedback
            open={feedbackDialogOpen}
            onClose={() => {
              setFeedbackDialogOpen(false);
              setSelectedInterview(null);
            }}
            onSubmit={handleFeedbackSuccess}
            interviewData={selectedInterview}
          />

          <CancelInterview
            open={cancelDialogOpen}
            onClose={() => {
              setCancelDialogOpen(false);
              setSelectedInterview(null);
            }}
            onCancel={handleCancelSuccess}
            interviewData={selectedInterview}
          />
        </>
      )}
    </Box>
  );
};

export default InterviewList;