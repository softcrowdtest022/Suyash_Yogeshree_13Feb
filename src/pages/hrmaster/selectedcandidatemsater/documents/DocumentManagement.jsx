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
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
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
  VerifiedUser as VerifiedUserIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Description as DescriptionIcon,
  CloudUpload as CloudUploadIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon
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

// Action Menu Component for Documents
const DocumentActionMenu = ({ 
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
        {/* View Details */}
        <MenuItem 
          onClick={() => {
            onView(document);
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

        <Divider sx={{ my: 0.5 }} />

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

// Candidate Action Menu Component
const CandidateActionMenu = ({ 
  candidate, 
  onView, 
  onEdit, 
  onDelete, 
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
            border: '1px solid #e2e8f0',
            maxHeight: 400
          }
        }}
      >
        {/* View Details */}
        <MenuItem 
          onClick={() => {
            onView(candidate);
            onClose();
          }}
          sx={{ py: 1 }}
        >
          <ListItemIcon sx={{ color: PRIMARY_BLUE, minWidth: 36 }}>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" fontWeight={500}>View Candidate</Typography>
          </ListItemText>
        </MenuItem>

        {/* Edit Candidate */}
        <MenuItem 
          onClick={() => {
            onEdit(candidate);
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

        <Divider sx={{ my: 0.5 }} />

        {/* Delete Candidate */}
        <MenuItem 
          onClick={() => {
            onDelete(candidate);
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

// Document Table Component
const DocumentTable = ({
  documents,
  loading,
  selected,
  onSelect,
  onSelectAll,
  actionMenuAnchor,
  selectedDocumentForAction,
  onActionMenuOpen,
  onActionMenuClose,
  onView,
  onVerify,
  onDownload,
  onEdit,
  onDelete
}) => {
  return (
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
                indeterminate={selected.length > 0 && selected.length < documents.length}
                checked={documents.length > 0 && selected.length === documents.length}
                onChange={onSelectAll}
                sx={{
                  color: TEXT_COLOR_HEADER,
                  '&.Mui-checked': { color: TEXT_COLOR_HEADER },
                  '&.MuiCheckbox-indeterminate': { color: TEXT_COLOR_HEADER },
                  '& .MuiSvgIcon-root': { fontSize: 20 }
                }}
                disabled={loading}
              />
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2, color: TEXT_COLOR_HEADER }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                Document ID
                <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
              </Stack>
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2, color: TEXT_COLOR_HEADER }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                Candidate
                <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
              </Stack>
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2, color: TEXT_COLOR_HEADER }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                Type
                <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
              </Stack>
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2, color: TEXT_COLOR_HEADER }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                Status
                <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
              </Stack>
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2, color: TEXT_COLOR_HEADER }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                Size
                <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
              </Stack>
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2, color: TEXT_COLOR_HEADER }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                Uploaded
                <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
              </Stack>
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2, width: 100, color: TEXT_COLOR_HEADER }} align="center">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                <Typography color="textSecondary" sx={{ fontStyle: 'italic' }}>
                  Loading documents...
                </Typography>
              </TableCell>
            </TableRow>
          ) : documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <DescriptionIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
                  <Typography variant="body1" color="#64748B" fontWeight={500}>
                    No documents available
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            documents.map((doc, index) => {
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
                    '&:hover': { bgcolor: HOVER_COLOR },
                    '&.Mui-selected': {
                      bgcolor: alpha(PRIMARY_BLUE, 0.08),
                      '&:hover': { bgcolor: alpha(PRIMARY_BLUE, 0.12) }
                    }
                  }}
                >
                  <TableCell padding="checkbox" sx={{ width: 60 }}>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => onSelect(doc._id)}
                      sx={{
                        color: PRIMARY_BLUE,
                        '&.Mui-checked': { color: PRIMARY_BLUE }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {doc.documentId || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 28, height: 28, bgcolor: PRIMARY_BLUE, fontSize: '0.75rem' }}>
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
                    <DocumentActionMenu 
                      document={doc}
                      onView={onView}
                      onVerify={onVerify}
                      onDownload={onDownload}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      anchorEl={isActionMenuOpen ? actionMenuAnchor : null}
                      onClose={onActionMenuClose}
                      onOpen={(e) => onActionMenuOpen(e, doc)}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const DocumentManagement = () => {
  // View state - to toggle between candidate view and document view
  const [viewMode, setViewMode] = useState('candidates'); // 'candidates' or 'documents'
  
  // State for documents data
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsSearchTerm, setDocumentsSearchTerm] = useState('');
  const [documentsTotalCount, setDocumentsTotalCount] = useState(0);
  
  // State for candidates data
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Menu states for action buttons
  const [documentActionMenuAnchor, setDocumentActionMenuAnchor] = useState(null);
  const [selectedDocumentForAction, setSelectedDocumentForAction] = useState(null);
  
  const [candidateActionMenuAnchor, setCandidateActionMenuAnchor] = useState(null);
  const [selectedCandidateForAction, setSelectedCandidateForAction] = useState(null);
  
  // Filter states
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter menu state
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [tempFilters, setTempFilters] = useState({
    candidate: '',
    type: '',
    status: ''
  });
  
  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  
  // Selected document
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Document types for filter
  const documentTypes = [
    { value: 'aadhar', label: 'Aadhar Card' },
    { value: 'pan', label: 'PAN Card' },
    { value: 'voter', label: 'Voter ID' },
    { value: 'passport', label: 'Passport' },
    { value: 'driving_license', label: 'Driving License' },
    { value: 'education_10th', label: '10th Marksheet' },
    { value: 'education_12th', label: '12th Marksheet' },
    { value: 'education_degree', label: 'Degree Certificate' },
    { value: 'education_master', label: 'Master\'s Degree' },
    { value: 'experience_letter', label: 'Experience Letter' },
    { value: 'salary_slip', label: 'Salary Slip' },
    { value: 'bank_statement', label: 'Bank Statement' },
    { value: 'photo', label: 'Passport Photo' },
    { value: 'signature', label: 'Signature' },
    { value: 'other', label: 'Other' }
  ];

  // Status options for filter
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' }
  ];

  // Fetch documents from API
  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${BASE_URL}/api/documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setDocuments(response.data.data || []);
        setFilteredDocuments(response.data.data || []);
        setDocumentsTotalCount(response.data.data?.length || 0);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      showNotification('Failed to load documents', 'error');
    } finally {
      setDocumentsLoading(false);
    }
  };

  // Fetch candidates from API
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      params.append('page', page + 1);
      params.append('limit', rowsPerPage);
      if (selectedCandidate) params.append('candidateId', selectedCandidate);
      if (selectedType) params.append('type', selectedType);
      if (selectedStatus) params.append('status', selectedStatus);
      
      const response = await axios.get(`${BASE_URL}/api/candidates?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setCandidates(response.data.data || []);
        setFilteredCandidates(response.data.data || []);
        setTotalCount(response.data.pagination?.total || 0);
      } else {
        showNotification('Failed to load candidates', 'error');
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
      showNotification('Failed to load candidates. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data based on view mode
  useEffect(() => {
    if (viewMode === 'candidates') {
      fetchCandidates();
    } else {
      fetchDocuments();
    }
  }, [viewMode, page, rowsPerPage, selectedCandidate, selectedType, selectedStatus]);

  // Handle search for candidates
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    
    const filtered = candidates.filter(candidate =>
      candidate.candidateId?.toLowerCase().includes(value) ||
      candidate.firstName?.toLowerCase().includes(value) ||
      candidate.lastName?.toLowerCase().includes(value) ||
      candidate.email?.toLowerCase().includes(value) ||
      candidate.phone?.toLowerCase().includes(value)
    );
    
    setFilteredCandidates(filtered);
    setPage(0);
  };

  // Handle search for documents
  const handleDocumentsSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setDocumentsSearchTerm(value);
    
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
    const currentData = viewMode === 'candidates' ? filteredCandidates : filteredDocuments;
    if (event.target.checked) {
      setSelected(currentData.map(item => item._id));
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
    if (viewMode === 'candidates') {
      fetchCandidates();
    } else {
      fetchDocuments();
    }
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
  
  // Document action menu handlers
  const handleDocumentActionMenuOpen = (event, document) => {
    setDocumentActionMenuAnchor(event.currentTarget);
    setSelectedDocumentForAction(document);
  };

  const handleDocumentActionMenuClose = () => {
    setDocumentActionMenuAnchor(null);
    setSelectedDocumentForAction(null);
  };

  // Candidate action menu handlers
  const handleCandidateActionMenuOpen = (event, candidate) => {
    setCandidateActionMenuAnchor(event.currentTarget);
    setSelectedCandidateForAction(candidate);
  };

  const handleCandidateActionMenuClose = () => {
    setCandidateActionMenuAnchor(null);
    setSelectedCandidateForAction(null);
  };

  // Modal open handlers
  const openUploadModal = () => {
    setShowUploadModal(true);
    handleDocumentActionMenuClose();
    handleCandidateActionMenuClose();
  };
  
  const openViewAllDocuments = () => {
    setViewMode('documents');
    fetchDocuments();
    setSelected([]);
    setPage(0);
  };
  
  const backToCandidates = () => {
    setViewMode('candidates');
    setSelected([]);
    setPage(0);
  };
  
  // Document action handlers
  const openViewDocumentModal = (document) => {
    setSelectedDocument(document);
    showNotification(`Viewing document: ${document.documentId}`, 'info');
    handleDocumentActionMenuClose();
  };
  
  const openVerifyDocumentModal = (document) => {
    setSelectedDocument(document);
    setShowVerifyModal(true);
    handleDocumentActionMenuClose();
  };
  
  const openDownloadDocumentModal = (document) => {
    setSelectedDocument(document);
    setShowDownloadModal(true);
    handleDocumentActionMenuClose();
  };
  
  const openEditDocumentModal = (document) => {
    showNotification('Edit functionality coming soon', 'info');
    handleDocumentActionMenuClose();
  };
  
  const openDeleteDocumentModal = (document) => {
    showNotification('Delete functionality coming soon', 'info');
    handleDocumentActionMenuClose();
  };

  // Candidate action handlers
  const openViewCandidateModal = (candidate) => {
    showNotification(`Viewing candidate: ${candidate.firstName} ${candidate.lastName}`, 'info');
    handleCandidateActionMenuClose();
  };
  
  const openEditCandidateModal = (candidate) => {
    showNotification('Edit candidate functionality coming soon', 'info');
    handleCandidateActionMenuClose();
  };
  
  const openDeleteCandidateModal = (candidate) => {
    showNotification('Delete candidate functionality coming soon', 'info');
    handleCandidateActionMenuClose();
  };
  
  // Callback handlers for modals
  const handleDocumentUploaded = (newDocument) => {
    if (viewMode === 'documents') {
      fetchDocuments();
    }
    showNotification('Document uploaded successfully!', 'success');
  };
  
  const handleDocumentVerified = (verifiedDocument) => {
    if (viewMode === 'documents') {
      fetchDocuments();
    }
    showNotification('Document verified successfully!', 'success');
  };
  
  const handleDocumentDownloaded = () => {
    if (viewMode === 'documents') {
      fetchDocuments();
    }
  };
  
  // Show notification
  const showNotification = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  // Paginated data
  const currentData = viewMode === 'candidates' ? filteredCandidates : filteredDocuments;
  const paginatedData = currentData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Check if any items are selected
  const hasSelected = selected.length > 0;

  // Calculate stats for cards
  const totalVerified = documents.filter(d => d.status?.toLowerCase() === 'verified').length;
  const totalPending = documents.filter(d => d.status?.toLowerCase() === 'pending').length;
  const totalRejected = documents.filter(d => d.status?.toLowerCase() === 'rejected').length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Back Button when in Documents View */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        {viewMode === 'documents' && (
          <IconButton 
            onClick={backToCandidates}
            sx={{ 
              bgcolor: '#F1F5F9',
              '&:hover': { bgcolor: '#E2E8F0' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Box>
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
            {viewMode === 'candidates' ? 'Document Management' : 'All Documents'}
          </Typography>
          <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
            {viewMode === 'candidates' 
              ? 'Upload, verify, and manage candidate documents'
              : 'View and manage all candidate documents'}
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards - Only show in candidates view */}
      {viewMode === 'candidates' && (
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
      )}

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
              placeholder={viewMode === 'candidates' 
                ? "Search by Candidate ID, Name, Email, Phone..." 
                : "Search documents..."}
              size="small"
              value={viewMode === 'candidates' ? searchTerm : documentsSearchTerm}
              onChange={viewMode === 'candidates' ? handleSearch : handleDocumentsSearch}
              sx={{ 
                width: { xs: '100%', sm: 400 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  '&:hover fieldset': { borderColor: PRIMARY_BLUE }
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
                  '& input': { padding: '8px 12px', fontSize: '0.875rem' }
                }
              }}
              disabled={viewMode === 'candidates' ? loading : documentsLoading}
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
              disabled={viewMode === 'candidates' ? loading : documentsLoading}
            >
              Filter
              {(selectedCandidate || selectedType || selectedStatus) && (
                <Badge color="primary" variant="dot" sx={{ ml: 1 }} />
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
                disabled={viewMode === 'candidates' ? loading : documentsLoading}
              >
                Delete ({selected.length})
              </Button>
            )}
            
            {/* View All Documents Button - Only show in candidates view */}
            {viewMode === 'candidates' && (
              <Button
                variant="outlined"
                startIcon={<VisibilityIcon />}
                onClick={openViewAllDocuments}
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
                View All
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
              disabled={viewMode === 'candidates' ? loading : documentsLoading}
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
              disabled={viewMode === 'candidates' ? loading : documentsLoading}
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

      {/* Data Table - Switches based on view mode */}
      <Paper sx={{ 
        width: '100%', 
        borderRadius: 2, 
        overflow: 'hidden',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0'
      }}>
        {viewMode === 'candidates' ? (
          // Candidate Table (displaying candidate information)
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
                      indeterminate={selected.length > 0 && selected.length < filteredCandidates.length}
                      checked={filteredCandidates.length > 0 && selected.length === filteredCandidates.length}
                      onChange={handleSelectAll}
                      sx={{
                        color: TEXT_COLOR_HEADER,
                        '&.Mui-checked': { color: TEXT_COLOR_HEADER },
                        '&.MuiCheckbox-indeterminate': { color: TEXT_COLOR_HEADER },
                        '& .MuiSvgIcon-root': { fontSize: 20 }
                      }}
                      disabled={loading}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2, color: TEXT_COLOR_HEADER }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      Candidate ID
                      <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2, color: TEXT_COLOR_HEADER }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      Candidate Name
                      <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2, color: TEXT_COLOR_HEADER }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      Email
                      <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2, color: TEXT_COLOR_HEADER }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      Phone
                      <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2, color: TEXT_COLOR_HEADER }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      Source
                      <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2, color: TEXT_COLOR_HEADER }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      Status
                      <ArrowUpwardIcon sx={{ fontSize: 14, color: TEXT_COLOR_HEADER, opacity: 0.9 }} />
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', py: 2, width: 100, color: TEXT_COLOR_HEADER }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Typography color="textSecondary" sx={{ fontStyle: 'italic' }}>
                        Loading candidates...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <PersonIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
                        <Typography variant="body1" color="#64748B" fontWeight={500}>
                          No candidates found
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((candidate, index) => {
                    const isSelected = selected.includes(candidate._id);
                    const isOddRow = index % 2 === 0;
                    const isActionMenuOpen = Boolean(candidateActionMenuAnchor) && 
                      selectedCandidateForAction?._id === candidate._id;
                    const statusStyle = getStatusColor(candidate.status);

                    return (
                      <TableRow
                        key={candidate._id}
                        hover
                        selected={isSelected}
                        sx={{ 
                          bgcolor: isOddRow ? STRIPE_COLOR_ODD : STRIPE_COLOR_EVEN,
                          '&:hover': { bgcolor: HOVER_COLOR },
                          '&.Mui-selected': {
                            bgcolor: alpha(PRIMARY_BLUE, 0.08),
                            '&:hover': { bgcolor: alpha(PRIMARY_BLUE, 0.12) }
                          }
                        }}
                      >
                        <TableCell padding="checkbox" sx={{ width: 60 }}>
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleSelect(candidate._id)}
                            sx={{
                              color: PRIMARY_BLUE,
                              '&.Mui-checked': { color: PRIMARY_BLUE }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {candidate.candidateId || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 32, height: 32, bgcolor: PRIMARY_BLUE, fontSize: '0.875rem' }}>
                              {candidate.firstName?.charAt(0)}{candidate.lastName?.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" fontWeight={500}>
                              {candidate.firstName} {candidate.lastName}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {candidate.email || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {candidate.phone || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {candidate.source || 'N/A'}
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
                        <TableCell align="center" sx={{ width: 100 }}>
                          <CandidateActionMenu 
                            candidate={candidate}
                            onView={openViewCandidateModal}
                            onEdit={openEditCandidateModal}
                            onDelete={openDeleteCandidateModal}
                            anchorEl={isActionMenuOpen ? candidateActionMenuAnchor : null}
                            onClose={handleCandidateActionMenuClose}
                            onOpen={(e) => handleCandidateActionMenuOpen(e, candidate)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          // Document Table (full view with all columns)
          <DocumentTable
            documents={paginatedData}
            loading={documentsLoading}
            selected={selected}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            actionMenuAnchor={documentActionMenuAnchor}
            selectedDocumentForAction={selectedDocumentForAction}
            onActionMenuOpen={handleDocumentActionMenuOpen}
            onActionMenuClose={handleDocumentActionMenuClose}
            onView={openViewDocumentModal}
            onVerify={openVerifyDocumentModal}
            onDownload={openDownloadDocumentModal}
            onEdit={openEditDocumentModal}
            onDelete={openDeleteDocumentModal}
          />
        )}

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={viewMode === 'candidates' 
            ? (searchTerm ? filteredCandidates.length : totalCount)
            : (documentsSearchTerm ? filteredDocuments.length : documentsTotalCount)}
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
              color: PRIMARY_BLUE
            }
          }}
        />
      </Paper>

      {/* Modal Components */}
      <UploadDocument 
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
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

export default DocumentManagement;