import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Alert,
  Typography,
  Paper,
  Box,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Tooltip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Divider,
  Badge,
  LinearProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Description as ResumeIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
  NoteAdd as NoteAddIcon,
  Star as StarIcon,
  Update as UpdateIcon,
  History as HistoryIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

// Import child components
import AddCandidate from './AddCandidate';
import UploadResume from './UploadResume';
import ViewCandidate from './ViewCandidate';
import ShortlistCandidate from './ShortlistCandidate';
import UpdateCandidateStatus from './UpdateCandidateStatus';
import AddNotes from './AddNotes';

const CandidateList = ({ open, onClose }) => {
  // State for candidates data
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Sorting state
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    source: ''
  });
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  
  // Modal states for child components
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openShortlistModal, setOpenShortlistModal] = useState(false);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [openNotesModal, setOpenNotesModal] = useState(false);

  // Fetch candidates
  const fetchCandidates = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        sortBy: orderBy,
        sortOrder: order,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.source && { source: filters.source })
      });

      const response = await axios.get(`${BASE_URL}/api/candidates?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setCandidates(response.data.data);
        setTotalItems(response.data.pagination?.totalItems || response.data.data.length);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setError(response.data.message || 'Failed to fetch candidates');
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError(err.response?.data?.message || 'Failed to fetch candidates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when dependencies change
  useEffect(() => {
    if (open) {
      fetchCandidates();
    }
  }, [open, page, rowsPerPage, orderBy, order, filters.status, filters.source]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (open) {
        setPage(0);
        fetchCandidates();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Handle sort
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      source: ''
    });
    setPage(0);
  };

  // Handle menu open
  const handleMenuOpen = (event, candidate) => {
    setAnchorEl(event.currentTarget);
    setSelectedCandidate(candidate);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCandidate(null);
  };

  // Handle filter menu
  const handleFilterMenuOpen = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
  };

  // Handle view details
  const handleViewDetails = () => {
    setOpenViewModal(true);
    handleMenuClose();
  };

  // Handle shortlist
  const handleShortlist = () => {
    setOpenShortlistModal(true);
    handleMenuClose();
  };

  // Handle update status
  const handleUpdateStatus = () => {
    setOpenStatusModal(true);
    handleMenuClose();
  };

  // Handle add note
  const handleAddNote = () => {
    setOpenNotesModal(true);
    handleMenuClose();
  };

  // Handle view resume
  const handleViewResume = () => {
    if (selectedCandidate?.resume?.fileUrl) {
      window.open(`${BASE_URL}${selectedCandidate.resume.fileUrl}`, '_blank');
    }
    handleMenuClose();
  };

  // Handle refresh
  const handleRefresh = () => {
    setPage(0);
    fetchCandidates();
  };

  // Handle success callbacks
  const handleAddSuccess = (data) => {
    fetchCandidates();
    setOpenAddModal(false);
  };

  const handleUploadSuccess = (data) => {
    fetchCandidates();
    setOpenUploadModal(false);
  };

  const handleShortlistSuccess = (data) => {
    fetchCandidates();
    setOpenShortlistModal(false);
  };

  const handleStatusUpdateSuccess = (data) => {
    fetchCandidates();
    setOpenStatusModal(false);
  };

  const handleNoteAddSuccess = (data) => {
    fetchCandidates();
    // Don't close modal automatically, let user close it
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'new': { bg: '#E3F2FD', color: '#1976D2', label: 'New' },
      'screening': { bg: '#F3E5F5', color: '#7B1FA2', label: 'Screening' },
      'shortlisted': { bg: '#E8F5E8', color: '#2E7D32', label: 'Shortlisted' },
      'interview_scheduled': { bg: '#FFF3E0', color: '#F57C00', label: 'Interview Scheduled' },
      'interviewed': { bg: '#E1F5FE', color: '#0288D1', label: 'Interviewed' },
      'selected': { bg: '#E8F5E8', color: '#2E7D32', label: 'Selected' },
      'offered': { bg: '#F1F8E9', color: '#558B2F', label: 'Offered' },
      'accepted': { bg: '#E8F5E8', color: '#1B5E20', label: 'Accepted' },
      'rejected': { bg: '#FFEBEE', color: '#C62828', label: 'Rejected' },
      'on_hold': { bg: '#FFF8E1', color: '#FF8F00', label: 'On Hold' },
      'withdrawn': { bg: '#EEEEEE', color: '#616161', label: 'Withdrawn' }
    };
    return colors[status?.toLowerCase()] || { bg: '#EEEEEE', color: '#616161', label: status };
  };

  // Get source icon
  const getSourceIcon = (source) => {
    switch(source?.toLowerCase()) {
      case 'walkin':
        return <PersonIcon sx={{ fontSize: 16, color: '#1976D2' }} />;
      case 'portal':
        return <WorkIcon sx={{ fontSize: 16, color: '#7B1FA2' }} />;
      case 'referral':
        return <TrendingUpIcon sx={{ fontSize: 16, color: '#2E7D32' }} />;
      case 'consultant':
        return <SchoolIcon sx={{ fontSize: 16, color: '#F57C00' }} />;
      default:
        return <PersonIcon sx={{ fontSize: 16, color: '#757575' }} />;
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="xl" 
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 2,
            maxHeight: '90vh',
            height: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #E0E0E0', 
          pb: 2,
          backgroundColor: '#F8FAFC',
          position: 'sticky',
          top: 0,
          zIndex: 2
        }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#101010',
              paddingTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <PersonIcon sx={{ color: '#1976D2' }} />
              Candidate Management
              <Chip 
                label={`${totalItems} Total`}
                size="small"
                sx={{ 
                  ml: 1,
                  backgroundColor: '#E3F2FD',
                  color: '#1976D2',
                  fontWeight: 500
                }}
              />
            </div>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Add Candidate">
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setOpenAddModal(true)}
                  startIcon={<PersonIcon />}
                  sx={{
                    borderRadius: 1,
                    textTransform: 'none',
                    backgroundColor: '#1976D2'
                  }}
                >
                  Add
                </Button>
              </Tooltip>
              <Tooltip title="Upload Resume">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setOpenUploadModal(true)}
                  startIcon={<ResumeIcon />}
                  sx={{
                    borderRadius: 1,
                    textTransform: 'none'
                  }}
                >
                  Upload
                </Button>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton onClick={handleRefresh} size="small" disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </div>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 0 }}>
          <Stack spacing={3}>
            {/* Filters Section */}
            <Paper elevation={0} sx={{ p: 2, backgroundColor: '#F9F9F9', borderRadius: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    placeholder="Search by name, email, phone, skills..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#9E9E9E' }} />
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        backgroundColor: 'white'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      label="Status"
                      sx={{
                        borderRadius: 1,
                        backgroundColor: 'white'
                      }}
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="new">New</MenuItem>
                      <MenuItem value="screening">Screening</MenuItem>
                      <MenuItem value="shortlisted">Shortlisted</MenuItem>
                      <MenuItem value="interview_scheduled">Interview Scheduled</MenuItem>
                      <MenuItem value="interviewed">Interviewed</MenuItem>
                      <MenuItem value="selected">Selected</MenuItem>
                      <MenuItem value="offered">Offered</MenuItem>
                      <MenuItem value="accepted">Accepted</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                      <MenuItem value="on_hold">On Hold</MenuItem>
                      <MenuItem value="withdrawn">Withdrawn</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Source</InputLabel>
                    <Select
                      name="source"
                      value={filters.source}
                      onChange={handleFilterChange}
                      label="Source"
                      sx={{
                        borderRadius: 1,
                        backgroundColor: 'white'
                      }}
                    >
                      <MenuItem value="">All Sources</MenuItem>
                      <MenuItem value="walkin">Walk-in</MenuItem>
                      <MenuItem value="portal">Job Portal</MenuItem>
                      <MenuItem value="referral">Referral</MenuItem>
                      <MenuItem value="consultant">Consultant</MenuItem>
                      <MenuItem value="upload">Upload</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleClearFilters}
                    disabled={!filters.search && !filters.status && !filters.source}
                    sx={{
                      borderRadius: 1,
                      textTransform: 'none',
                      height: '40px'
                    }}
                  >
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Loading Progress */}
            {loading && (
              <LinearProgress 
                sx={{ 
                  borderRadius: 1,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#1976D2'
                  }
                }}
              />
            )}

            {/* Error Message */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: 1,
                  '& .MuiAlert-icon': {
                    alignItems: 'center'
                  }
                }}
              >
                {error}
              </Alert>
            )}

            {/* Candidates Table */}
            {!loading && !error && (
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, maxHeight: 'calc(90vh - 250px)' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F5F5', width: '15%' }}>
                        <TableSortLabel
                          active={orderBy === 'candidateId'}
                          direction={orderBy === 'candidateId' ? order : 'asc'}
                          onClick={() => handleRequestSort('candidateId')}
                        >
                          Candidate ID
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F5F5', width: '20%' }}>
                        <TableSortLabel
                          active={orderBy === 'firstName'}
                          direction={orderBy === 'firstName' ? order : 'asc'}
                          onClick={() => handleRequestSort('firstName')}
                        >
                          Name
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F5F5', width: '20%' }}>Contact</TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F5F5', width: '15%' }}>Skills</TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F5F5', width: '10%' }}>
                        <TableSortLabel
                          active={orderBy === 'status'}
                          direction={orderBy === 'status' ? order : 'asc'}
                          onClick={() => handleRequestSort('status')}
                        >
                          Status
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F5F5', width: '10%' }}>Source</TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F5F5', width: '10%' }}>
                        <TableSortLabel
                          active={orderBy === 'createdAt'}
                          direction={orderBy === 'createdAt' ? order : 'asc'}
                          onClick={() => handleRequestSort('createdAt')}
                        >
                          Added On
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F5F5', width: '5%' }} align="center">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {candidates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                          <Typography color="textSecondary">No candidates found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      candidates.map((candidate) => {
                        const statusColor = getStatusColor(candidate.status);
                        const noteCount = candidate.notes?.length || 0;
                        
                        return (
                          <TableRow key={candidate._id} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: '#1976D2' }}>
                                {candidate.candidateId}
                              </Typography>
                              {candidate.latestApplication?.jobId && (
                                <Typography variant="caption" color="textSecondary">
                                  {candidate.latestApplication.jobId.title}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar 
                                  sx={{ 
                                    width: 32, 
                                    height: 32, 
                                    bgcolor: '#E3F2FD',
                                    color: '#1976D2',
                                    fontSize: '14px'
                                  }}
                                >
                                  {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {candidate.fullName}
                                  </Typography>
                                  {candidate.dateOfBirth && (
                                    <Typography variant="caption" color="textSecondary">
                                      DOB: {formatDate(candidate.dateOfBirth)}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <EmailIcon sx={{ fontSize: 14, color: '#9E9E9E' }} />
                                  <Typography variant="caption" noWrap sx={{ maxWidth: '150px' }}>
                                    {candidate.email}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <PhoneIcon sx={{ fontSize: 14, color: '#9E9E9E' }} />
                                  <Typography variant="caption">{candidate.phone}</Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {candidate.skills?.slice(0, 2).map((skill, idx) => (
                                  <Chip
                                    key={idx}
                                    label={skill}
                                    size="small"
                                    sx={{
                                      backgroundColor: '#F5F5F5',
                                      fontSize: '11px',
                                      height: '20px'
                                    }}
                                  />
                                ))}
                                {candidate.skills?.length > 2 && (
                                  <Chip
                                    label={`+${candidate.skills.length - 2}`}
                                    size="small"
                                    sx={{
                                      backgroundColor: '#F5F5F5',
                                      fontSize: '11px',
                                      height: '20px'
                                    }}
                                  />
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Badge
                                badgeContent={noteCount}
                                color="primary"
                                sx={{
                                  '& .MuiBadge-badge': {
                                    fontSize: '9px',
                                    height: '16px',
                                    minWidth: '16px',
                                    backgroundColor: '#1976D2'
                                  }
                                }}
                              >
                                <Chip
                                  label={statusColor.label}
                                  size="small"
                                  sx={{
                                    backgroundColor: statusColor.bg,
                                    color: statusColor.color,
                                    fontWeight: 500,
                                    fontSize: '12px'
                                  }}
                                />
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {getSourceIcon(candidate.source)}
                                <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                                  {candidate.source || 'N/A'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                {formatDate(candidate.createdAt)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, candidate)}
                                sx={{ color: '#1976D2' }}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Pagination */}
            {!loading && !error && candidates.length > 0 && (
              <TablePagination
                component="div"
                count={totalItems}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ 
          px: 3, 
          py: 2, 
          borderTop: '1px solid #E0E0E0', 
          backgroundColor: '#F8FAFC',
          position: 'sticky',
          bottom: 0,
          zIndex: 1
        }}>
          <Typography variant="caption" color="textSecondary">
            Total: {totalItems} candidates | Page {page + 1} of {totalPages}
          </Typography>
        </DialogActions>
      </Dialog>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 200,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        <MenuItem onClick={handleViewDetails} sx={{ gap: 1, py: 1 }}>
          <VisibilityIcon sx={{ fontSize: 20, color: '#1976D2' }} />
          <Typography variant="body2">View Details</Typography>
        </MenuItem>
        
        {selectedCandidate?.resume && (
          <MenuItem onClick={handleViewResume} sx={{ gap: 1, py: 1 }}>
            <ResumeIcon sx={{ fontSize: 20, color: '#2E7D32' }} />
            <Typography variant="body2">View Resume</Typography>
          </MenuItem>
        )}

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={handleShortlist} sx={{ gap: 1, py: 1 }}>
          <StarIcon sx={{ fontSize: 20, color: '#FFB74D' }} />
          <Typography variant="body2">Shortlist Candidate</Typography>
        </MenuItem>

        <MenuItem onClick={handleUpdateStatus} sx={{ gap: 1, py: 1 }}>
          <UpdateIcon sx={{ fontSize: 20, color: '#1976D2' }} />
          <Typography variant="body2">Update Status</Typography>
        </MenuItem>

        <MenuItem onClick={handleAddNote} sx={{ gap: 1, py: 1 }}>
          <NoteAddIcon sx={{ fontSize: 20, color: '#7B1FA2' }} />
          <Typography variant="body2">Add Note</Typography>
        </MenuItem>

        {selectedCandidate?.latestApplication && (
          <>
            <Divider sx={{ my: 1 }} />
            <MenuItem disabled sx={{ opacity: 1 }}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="caption" color="textSecondary">
                  Latest Application:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {selectedCandidate.latestApplication.jobId?.title}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Status: {selectedCandidate.latestApplication.status}
                </Typography>
              </Box>
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Child Components */}
      <AddCandidate
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onAdd={handleAddSuccess}
      />

      <UploadResume
        open={openUploadModal}
        onClose={() => setOpenUploadModal(false)}
        onUpload={handleUploadSuccess}
      />

      {selectedCandidate && (
        <>
          <ViewCandidate
            open={openViewModal}
            onClose={() => setOpenViewModal(false)}
            candidateId={selectedCandidate._id}
            candidateData={selectedCandidate}
          />

          <ShortlistCandidate
            open={openShortlistModal}
            onClose={() => setOpenShortlistModal(false)}
            onShortlist={handleShortlistSuccess}
            candidateId={selectedCandidate._id}
            candidateData={selectedCandidate}
          />

          <UpdateCandidateStatus
            open={openStatusModal}
            onClose={() => setOpenStatusModal(false)}
            onUpdate={handleStatusUpdateSuccess}
            candidateId={selectedCandidate._id}
            candidateData={selectedCandidate}
          />

          <AddNotes
            open={openNotesModal}
            onClose={() => setOpenNotesModal(false)}
            onAdd={handleNoteAddSuccess}
            candidateId={selectedCandidate._id}
            candidateData={selectedCandidate}
          />
        </>
      )}
    </>
  );
};

export default CandidateList;