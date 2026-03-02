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
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput
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
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Description as DescriptionIcon,
  VerifiedUser as VerifiedUserIcon,
  CloudUpload as CloudUploadIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  Error as ErrorIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
import axios from 'axios';

// Import document components
import UploadDocument from './UploadDocument';
import VerifyDocument from './VerifyDocument';
import DownloadDocument from './DownloadDocument';
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
    case 'verified':
      return { bg: '#d1fae5', color: '#065f46', label: 'Verified', icon: <CheckCircleIcon /> };
    case 'pending':
      return { bg: '#fef3c7', color: '#92400e', label: 'Pending', icon: <AccessTimeIcon /> };
    case 'rejected':
      return { bg: '#fee2e2', color: '#991b1b', label: 'Rejected', icon: <ErrorIcon /> };
    default:
      return { bg: '#f1f5f9', color: '#475569', label: status || 'Unknown', icon: <InfoIcon /> };
  }
};

// Get file icon based on mime type
const getFileIcon = (mimeType) => {
  if (!mimeType) return <FileIcon />;
  if (mimeType.includes('pdf')) return <PdfIcon sx={{ color: '#F40F02' }} />;
  if (mimeType.includes('image')) return <ImageIcon sx={{ color: '#2196F3' }} />;
  if (mimeType.includes('word') || mimeType.includes('document')) return <DescriptionIcon sx={{ color: '#2B5797' }} />;
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return <DescriptionIcon sx={{ color: '#217346' }} />;
  return <FileIcon sx={{ color: '#757575' }} />;
};

// Format file size
const formatFileSize = (bytes) => {
  if (!bytes) return 'N/A';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

// Action Menu Component
const ActionMenu = ({ 
  document, 
  onView, 
  onVerify, 
  onDownload, 
  onEdit, 
  onDelete, 
  anchorEl, 
  onClose, 
  onOpen 
}) => {
  const status = document?.status?.toLowerCase();
  
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
            minWidth: 200,
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            maxHeight: 400
          }
        }}
      >
        {/* View Document */}
        <MenuItem 
          onClick={() => {
            onView(document);
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

        {/* Download Document */}
        <MenuItem 
          onClick={() => {
            onDownload(document);
            onClose();
          }}
          sx={{ py: 1 }}
        >
          <ListItemIcon sx={{ color: '#3B82F6', minWidth: 36 }}>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" fontWeight={500}>Download</Typography>
          </ListItemText>
        </MenuItem>

        {/* Verify Document - Only for Pending status */}
        {status === 'pending' && (
          <MenuItem 
            onClick={() => {
              onVerify(document);
              onClose();
            }}
            sx={{ py: 1 }}
          >
            <ListItemIcon sx={{ color: '#10B981', minWidth: 36 }}>
              <VerifiedUserIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2" fontWeight={500}>Verify Document</Typography>
            </ListItemText>
          </MenuItem>
        )}

        <Divider sx={{ my: 0.5 }} />

        {/* Edit - Only for Pending status */}
        {status === 'pending' && (
          <MenuItem 
            onClick={() => {
              onEdit(document);
              onClose();
            }}
            sx={{ py: 1 }}
          >
            <ListItemIcon sx={{ color: '#F59E0B', minWidth: 36 }}>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2" fontWeight={500}>Edit</Typography>
            </ListItemText>
          </MenuItem>
        )}

        {/* Delete - Only for Pending or Rejected status */}
        {(status === 'pending' || status === 'rejected') && (
          <MenuItem 
            onClick={() => {
              onDelete(document);
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

const GetAllDocuments = () => {
  // State for data
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [candidates, setCandidates] = useState([]);
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Menu state for action buttons
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedDocumentForAction, setSelectedDocumentForAction] = useState(null);
  
  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // Filter menu state
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [tempFilters, setTempFilters] = useState({
    candidate: '',
    type: '',
    status: ''
  });
  
  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Document types for filter
  const documentTypes =  [
      { value: 'resume', label: 'Resume/CV'},
      { value: 'offer_letter', label: 'Offer Letter'},
      { value: 'appointment_letter', label: 'Appointment Letter'},
      { value: 'ctc_breakdown', label: 'CTC Breakdown'},
      { value: 'aadhar', label: 'Aadhar Card'},      
      { value: 'pan', label: 'PAN Card'},
      { value: 'passport', label: 'Passport'},
      { value: 'voter_id', label: 'Voter ID'},
      { value: 'driving_license', label: 'Driving License'},
      { value: 'educational_certificate', label: 'Educational Certificate'},
      { value: 'experience_certificate', label: 'Experience Certificate'},
      { value: 'salary_slip', label: 'Salary Slip'},
      { value: 'bank_statement', label: 'Bank Statement'},
      { value: 'photograph', label: 'Photograph' },
      { value: 'other', label: 'Other' }
    ];

  // Status options for filter
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' }
  ];

  // Fetch documents from API
  useEffect(() => {
    fetchDocuments();
    fetchCandidates();
  }, [page, rowsPerPage, selectedCandidate, selectedType, selectedStatus]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page + 1);
      params.append('limit', rowsPerPage);
      if (selectedCandidate) params.append('candidateId', selectedCandidate);
      if (selectedType) params.append('type', selectedType);
      if (selectedStatus) params.append('status', selectedStatus);
      
      const response = await axios.get(`${BASE_URL}/api/documents?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setDocuments(response.data.data || []);
        setFilteredDocuments(response.data.data || []);
        setTotalCount(response.data.pagination?.total || 0);
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        showNotification('Failed to load documents', 'error');
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      showNotification('Failed to load documents. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/candidates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCandidates(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
    }
  };
  
  // Handle search
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    
    const filtered = documents.filter(doc =>
      doc.documentId?.toLowerCase().includes(value) ||
      doc.originalFilename?.toLowerCase().includes(value) ||
      doc.type?.toLowerCase().includes(value) ||
      doc.candidateId?.fullName?.toLowerCase().includes(value) ||
      doc.candidateId?.email?.toLowerCase().includes(value)
    );
    
    setFilteredDocuments(filtered);
    setPage(0);
  };
  
  // Handle select all
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(filteredDocuments.map(doc => doc._id));
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
    fetchDocuments();
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
  
  // Filter menu handlers
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
    setTempFilters({
      candidate: selectedCandidate,
      type: selectedType,
      status: selectedStatus
    });
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleApplyFilters = () => {
    setSelectedCandidate(tempFilters.candidate);
    setSelectedType(tempFilters.type);
    setSelectedStatus(tempFilters.status);
    setPage(0);
    handleFilterClose();
    showNotification('Filters applied', 'success');
  };

  const handleClearFilters = () => {
    setTempFilters({ candidate: '', type: '', status: '' });
    setSelectedCandidate('');
    setSelectedType('');
    setSelectedStatus('');
    setPage(0);
    handleFilterClose();
    showNotification('Filters cleared', 'success');
  };
  
  // Action menu handlers
  const handleActionMenuOpen = (event, document) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedDocumentForAction(document);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedDocumentForAction(null);
  };

  // Modal open handlers
  const openUploadModal = () => {
    setShowUploadModal(true);
    handleActionMenuClose();
  };
  
  const openViewModal = (document) => {
    setSelectedDocument(document);
    // For now, just show details in a snackbar
    showNotification(`Viewing document: ${document.documentId}`, 'info');
    handleActionMenuClose();
  };
  
  const openVerifyModal = (document) => {
    setSelectedDocument(document);
    setShowVerifyModal(true);
    handleActionMenuClose();
  };
  
  const openDownloadModal = (document) => {
    setSelectedDocument(document);
    setShowDownloadModal(true);
    handleActionMenuClose();
  };
  
  const openEditModal = (document) => {
    showNotification('Edit functionality coming soon', 'info');
    handleActionMenuClose();
  };
  
  const openDeleteModal = (document) => {
    showNotification('Delete functionality coming soon', 'info');
    handleActionMenuClose();
  };
  
  // Callback handlers for modals
  const handleDocumentUploaded = (newDocument) => {
    fetchDocuments();
    showNotification('Document uploaded successfully!', 'success');
  };
  
  const handleDocumentVerified = (verifiedDocument) => {
    fetchDocuments();
    showNotification('Document verified successfully!', 'success');
  };
  
  const handleDocumentDownloaded = () => {
    // Just refresh, no need for extra message as DownloadDocument already shows one
    fetchDocuments();
  };
  
  // Show notification
  const showNotification = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  // Paginated documents (client-side pagination when search is active)
  const paginatedDocuments = searchTerm 
    ? filteredDocuments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : filteredDocuments;

  // Check if any documents are selected
  const hasSelected = selected.length > 0;

  // Calculate stats
  const totalVerified = documents.filter(d => d.status?.toLowerCase() === 'verified').length;
  const totalPending = documents.filter(d => d.status?.toLowerCase() === 'pending').length;
  const totalRejected = documents.filter(d => d.status?.toLowerCase() === 'rejected').length;

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
          Document Management
        </Typography>
        <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
          Upload, verify, and manage candidate documents
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#E3F2FD' }}>
                <DescriptionIcon sx={{ color: '#1976D2' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {totalCount}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Total Documents
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
                  {totalVerified}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Verified
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
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#FFEBEE' }}>
                <ErrorIcon sx={{ color: '#D32F2F' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {totalRejected}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Rejected
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
              placeholder="Search by Document ID, Filename, Candidate..."
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
            
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
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
              Filter
              {(selectedCandidate || selectedType || selectedStatus) && (
                <Badge
                  color="primary"
                  variant="dot"
                  sx={{ ml: 1 }}
                />
              )}
            </Button>
            
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
              startIcon={<CloudUploadIcon />}
              onClick={openUploadModal}
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
              Upload Document
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        PaperProps={{
          sx: {
            p: 2,
            width: 320,
            borderRadius: 2,
            border: '1px solid #e2e8f0'
          }
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Filter Documents
        </Typography>
        
        <Stack spacing={2} sx={{ mt: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Candidate</InputLabel>
            <Select
              value={tempFilters.candidate}
              onChange={(e) => setTempFilters({ ...tempFilters, candidate: e.target.value })}
              label="Candidate"
            >
              <MenuItem value="">All Candidates</MenuItem>
              {candidates.map((cand) => (
                <MenuItem key={cand._id} value={cand._id}>
                  {cand.firstName} {cand.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Document Type</InputLabel>
            <Select
              value={tempFilters.type}
              onChange={(e) => setTempFilters({ ...tempFilters, type: e.target.value })}
              label="Document Type"
            >
              <MenuItem value="">All Types</MenuItem>
              {documentTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={tempFilters.status}
              onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value })}
              label="Status"
            >
              <MenuItem value="">All Status</MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button size="small" onClick={handleClearFilters}>
              Clear
            </Button>
            <Button 
              size="small" 
              variant="contained" 
              onClick={handleApplyFilters}
              sx={{ backgroundColor: PRIMARY_BLUE }}
            >
              Apply Filters
            </Button>
          </Stack>
        </Stack>
      </Menu>

      {/* Documents Table */}
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
                    indeterminate={selected.length > 0 && selected.length < filteredDocuments.length}
                    checked={filteredDocuments.length > 0 && selected.length === filteredDocuments.length}
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
                    Document ID
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
                    Type
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
                    Size
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
                    Uploaded
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
                      Loading documents...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <DescriptionIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
                      <Typography variant="body1" color="#64748B" fontWeight={500}>
                        {searchTerm || selectedCandidate || selectedType || selectedStatus 
                          ? 'No documents found' 
                          : 'No documents available'}
                      </Typography>
                      <Typography variant="body2" color="#94A3B8" sx={{ mt: 1 }}>
                        {searchTerm || selectedCandidate || selectedType || selectedStatus 
                          ? 'Try adjusting your search or filters' 
                          : 'Click "Upload Document" to upload your first document'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDocuments.map((doc, index) => {
                  const isSelected = selected.includes(doc._id);
                  const isOddRow = index % 2 === 0;
                  const isActionMenuOpen = Boolean(actionMenuAnchor) && 
                    selectedDocumentForAction?._id === doc._id;
                  const statusStyle = getStatusColor(doc.status);

                  return (
                    <TableRow
                      key={doc._id}
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
                          onChange={() => handleSelect(doc._id)}
                          sx={{
                            color: PRIMARY_BLUE,
                            '&.Mui-checked': {
                              color: PRIMARY_BLUE,
                            },
                          }}
                        />
                      </TableCell>
                      {/* <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ 
                            p: 1, 
                            bgcolor: '#F5F5F5', 
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            {getFileIcon(doc.mimeType)}
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={500} color={TEXT_COLOR_MAIN}>
                              {doc.originalFilename || doc.filename}
                            </Typography>
                            <Typography variant="caption" color="#64748B">
                              v{doc.version || 1}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell> */}
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {doc.documentId || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar 
                            sx={{ 
                              width: 28, 
                              height: 28, 
                              bgcolor: PRIMARY_BLUE,
                              fontSize: '0.75rem'
                            }}
                          >
                            {doc.candidateId?.fullName?.charAt(0) || '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {doc.candidateId?.fullName || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="#64748B">
                              {doc.candidateId?.email || ''}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {doc.type?.replace('_', ' ') || 'N/A'}
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
                            minWidth: 80
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatFileSize(doc.fileSize)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(doc.createdAt)}
                        </Typography>
                        {doc.verificationDetails?.verifiedAt && doc.status === 'verified' && (
                          <Typography variant="caption" color="#2E7D32" display="block">
                            Verified: {formatDate(doc.verificationDetails.verifiedAt)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center" sx={{ width: 100 }}>
                        <ActionMenu 
                          document={doc}
                          onView={openViewModal}
                          onVerify={openVerifyModal}
                          onDownload={openDownloadModal}
                          onEdit={openEditModal}
                          onDelete={openDeleteModal}
                          anchorEl={isActionMenuOpen ? actionMenuAnchor : null}
                          onClose={handleActionMenuClose}
                          onOpen={(e) => handleActionMenuOpen(e, doc)}
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
          count={searchTerm ? filteredDocuments.length : totalCount}
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
      <UploadDocument 
        open={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
        }}
        onSubmit={handleDocumentUploaded}
      />

      <VerifyDocument 
        open={showVerifyModal}
        onClose={() => {
          setShowVerifyModal(false);
          setSelectedDocument(null);
        }}
        onSubmit={handleDocumentVerified}
        documentData={selectedDocument}
        documentId={selectedDocument?._id}
      />

      <DownloadDocument 
        open={showDownloadModal}
        onClose={() => {
          setShowDownloadModal(false);
          setSelectedDocument(null);
        }}
        onSubmit={handleDocumentDownloaded}
        documentData={selectedDocument}
        documentId={selectedDocument?._id}
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

export default GetAllDocuments;