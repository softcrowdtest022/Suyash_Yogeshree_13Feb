import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Grid,
  Box,
  Paper,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Card,
  CardContent,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  TextField
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  PictureAsPdf as PdfIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  VerifiedUser as VerifiedUserIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Archive as ArchiveIcon,
  CloudDownload as CloudDownloadIcon,
  FolderOpen as FolderOpenIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import axios from 'axios';
import { saveAs } from 'file-saver';
import BASE_URL from '../../../../config/Config';

const DownloadDocument = ({ open, onClose, onSubmit, documentId = null, documentData = null }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [documentDetails, setDocumentDetails] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [downloadFormat, setDownloadFormat] = useState('original');
  const [downloadQuality, setDownloadQuality] = useState('high');
  const [includeMetadata, setIncludeMetadata] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState('latest');
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [loadingDocument, setLoadingDocument] = useState(false);

  const steps = [
    'Document Info',
    'Download Options',
    'Download'
  ];

  const downloadFormats = [
    { value: 'original', label: 'Original Format', description: 'Download in original file format' },
    { value: 'pdf', label: 'PDF Format', description: 'Convert to PDF (if applicable)' },
    { value: 'jpg', label: 'JPG Image', description: 'Convert to JPG image' },
    { value: 'png', label: 'PNG Image', description: 'Convert to PNG image' }
  ];

  const qualityOptions = [
    { value: 'high', label: 'High Quality', description: 'Original quality, larger file size' },
    { value: 'medium', label: 'Medium Quality', description: 'Balanced quality and size' },
    { value: 'low', label: 'Low Quality', description: 'Reduced quality, smaller file size' }
  ];

  useEffect(() => {
    if (open && documentId) {
      fetchDocumentDetails(documentId);
      fetchDownloadHistory(documentId);
    } else if (open && documentData) {
      setDocumentDetails(documentData);
      if (documentData.candidateId) {
        fetchCandidateDetails(documentData.candidateId);
      }
      if (documentData._id) {
        fetchDownloadHistory(documentData._id);
      }
    }
  }, [open, documentId, documentData]);

  const fetchDocumentDetails = async (id) => {
    setFetching(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setDocumentDetails(response.data.data);
        if (response.data.data.candidateId) {
          fetchCandidateDetails(response.data.data.candidateId);
        }
      } else {
        setError('Failed to fetch document details');
      }
    } catch (err) {
      console.error('Error fetching document details:', err);
      setError(err.response?.data?.message || 'Failed to fetch document details');
    } finally {
      setFetching(false);
    }
  };

  const fetchCandidateDetails = async (candidateId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/candidates/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCandidateDetails(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching candidate details:', err);
    }
  };

  const fetchDownloadHistory = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/documents/${id}/downloads`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setDownloadHistory(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching download history:', err);
      // Don't show error for history
    }
  };

  const handleViewDocument = async () => {
    if (!documentDetails?._id) return;
    
    setLoadingDocument(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/api/documents/${documentDetails._id}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDocumentUrl(url);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error viewing document:', err);
      setError('Failed to view document');
    } finally {
      setLoadingDocument(false);
    }
  };

  const handleDownloadDocument = async () => {
    if (!documentDetails?._id) return;
    
    setDownloading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (downloadFormat !== 'original') {
        params.append('format', downloadFormat);
      }
      params.append('quality', downloadQuality);
      params.append('metadata', includeMetadata);
      if (selectedVersion !== 'latest') {
        params.append('version', selectedVersion);
      }

      const response = await axios.get(
        `${BASE_URL}/api/documents/${documentDetails._id}/download?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Determine file extension based on format
      let extension = '';
      switch (downloadFormat) {
        case 'pdf':
          extension = '.pdf';
          break;
        case 'jpg':
          extension = '.jpg';
          break;
        case 'png':
          extension = '.png';
          break;
        default:
          // Try to get extension from original filename
          const originalExt = documentDetails.filename?.split('.').pop();
          extension = originalExt ? `.${originalExt}` : '';
      }

      const filename = `${documentDetails.documentId || 'document'}_${new Date().toISOString().split('T')[0]}${extension}`;
      
      // Save file using file-saver
      saveAs(response.data, filename);

      setSuccess('Document downloaded successfully!');
      
      // Refresh download history
      fetchDownloadHistory(documentDetails._id);
      
      if (onSubmit) {
        onSubmit({ success: true, filename });
      }
    } catch (err) {
      console.error('Error downloading document:', err);
      setError(err.response?.data?.message || 'Failed to download document');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadVersion = async (versionId) => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/api/documents/${documentDetails._id}/download?version=${versionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const filename = `version-${versionId}_${documentDetails.filename}`;
      saveAs(response.data, filename);
      
      setSuccess('Version downloaded successfully!');
      fetchDownloadHistory(documentDetails._id);
    } catch (err) {
      console.error('Error downloading version:', err);
      setError('Failed to download version');
    } finally {
      setDownloading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setDownloadFormat('original');
    setDownloadQuality('high');
    setIncludeMetadata(false);
    setSelectedVersion('latest');
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    handleReset();
    setDocumentDetails(null);
    setCandidateDetails(null);
    setDownloadHistory([]);
    if (documentUrl) {
      window.URL.revokeObjectURL(documentUrl);
    }
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <FileIcon />;
    if (fileType.includes('pdf')) return <PdfIcon sx={{ color: '#F40F02' }} />;
    if (fileType.includes('image')) return <ImageIcon sx={{ color: '#2196F3' }} />;
    return <FileIcon sx={{ color: '#757575' }} />;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified':
        return { bg: '#d1fae5', color: '#065f46' };
      case 'pending':
        return { bg: '#fef3c7', color: '#92400e' };
      case 'rejected':
        return { bg: '#fee2e2', color: '#991b1b' };
      default:
        return { bg: '#f1f5f9', color: '#475569' };
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            {/* Document Info Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                📄 Document Information
              </Typography>

              {fetching ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {/* Document Icon and Basic Info */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: '#F5F5F5', 
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {getFileIcon(documentDetails?.fileType)}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">
                          {documentDetails?.filename || 'Document'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Document ID: {documentDetails?.documentId || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Document Details */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="textSecondary">
                      Document Type
                    </Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {documentDetails?.type || 'N/A'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="textSecondary">
                      File Size
                    </Typography>
                    <Typography variant="body1">
                      {formatFileSize(documentDetails?.fileSize)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="textSecondary">
                      Uploaded Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(documentDetails?.uploadedAt)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="textSecondary">
                      Status
                    </Typography>
                    <Box>
                      <Chip
                        size="small"
                        label={documentDetails?.status || 'pending'}
                        sx={{ 
                          bgcolor: getStatusColor(documentDetails?.status).bg,
                          color: getStatusColor(documentDetails?.status).color,
                          fontWeight: 500,
                          textTransform: 'capitalize'
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Action Buttons */}
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="outlined"
                        startIcon={loadingDocument ? <CircularProgress size={20} /> : <ViewIcon />}
                        onClick={handleViewDocument}
                        disabled={loadingDocument}
                        fullWidth
                      >
                        Preview
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadDocument}
                        disabled={downloading}
                        fullWidth
                      >
                        Quick Download
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              )}
            </Paper>

            {/* Candidate Info Card */}
            {candidateDetails && (
              <Paper sx={{ p: 3, bgcolor: '#F8FAFC' }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" color="primary" />
                  Candidate Information
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                  <Avatar sx={{ bgcolor: '#1976D2' }}>
                    {candidateDetails.firstName?.charAt(0)}{candidateDetails.lastName?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {candidateDetails.firstName} {candidateDetails.lastName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {candidateDetails.email} • {candidateDetails.phone}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Download History Card */}
            {downloadHistory.length > 0 && (
              <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryIcon fontSize="small" color="primary" />
                  Download History
                </Typography>

                <List>
                  {downloadHistory.slice(0, 5).map((item, index) => (
                    <ListItem key={index} divider={index < downloadHistory.length - 1}>
                      <ListItemIcon>
                        <DownloadIcon fontSize="small" color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`Downloaded on ${formatDate(item.downloadedAt)}`}
                        secondary={`IP: ${item.ipAddress || 'N/A'} • Format: ${item.format || 'original'}`}
                      />
                      <Typography variant="caption" color="textSecondary">
                        {item.downloadedBy || 'You'}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            {/* Download Options Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                ⚙️ Download Options
              </Typography>

              {/* Format Selection */}
              <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 500 }}>
                  Download Format
                </FormLabel>
                <RadioGroup
                  value={downloadFormat}
                  onChange={(e) => setDownloadFormat(e.target.value)}
                >
                  <Grid container spacing={2}>
                    {downloadFormats.map((format) => (
                      <Grid item xs={12} md={6} key={format.value}>
                        <Paper
                          sx={{
                            p: 2,
                            border: downloadFormat === format.value ? '2px solid #1976D2' : '1px solid #E0E0E0',
                            borderRadius: 2,
                            cursor: 'pointer',
                            bgcolor: downloadFormat === format.value ? '#E3F2FD' : '#FFFFFF',
                            '&:hover': {
                              borderColor: '#1976D2',
                              bgcolor: '#F5F9FF'
                            }
                          }}
                          onClick={() => setDownloadFormat(format.value)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ 
                              p: 1, 
                              borderRadius: '50%', 
                              bgcolor: downloadFormat === format.value ? '#1976D2' : '#F5F5F5',
                              color: downloadFormat === format.value ? '#FFFFFF' : '#757575'
                            }}>
                              {format.value === 'original' ? <FileIcon /> :
                               format.value === 'pdf' ? <PdfIcon /> : <ImageIcon />}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {format.label}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {format.description}
                              </Typography>
                            </Box>
                            <Radio 
                              value={format.value} 
                              checked={downloadFormat === format.value}
                              sx={{ ml: 'auto' }}
                            />
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </RadioGroup>
              </FormControl>

              {/* Quality Selection */}
              <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 500 }}>
                  Quality
                </FormLabel>
                <RadioGroup
                  value={downloadQuality}
                  onChange={(e) => setDownloadQuality(e.target.value)}
                >
                  <Grid container spacing={2}>
                    {qualityOptions.map((quality) => (
                      <Grid item xs={12} md={4} key={quality.value}>
                        <Paper
                          sx={{
                            p: 2,
                            border: downloadQuality === quality.value ? '2px solid #1976D2' : '1px solid #E0E0E0',
                            borderRadius: 2,
                            cursor: 'pointer',
                            bgcolor: downloadQuality === quality.value ? '#E3F2FD' : '#FFFFFF',
                            textAlign: 'center'
                          }}
                          onClick={() => setDownloadQuality(quality.value)}
                        >
                          <Typography variant="subtitle2" fontWeight={600}>
                            {quality.label}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {quality.description}
                          </Typography>
                          <Radio 
                            value={quality.value} 
                            checked={downloadQuality === quality.value}
                            sx={{ mt: 1 }}
                          />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </RadioGroup>
              </FormControl>

              {/* Additional Options */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Additional Options
                </Typography>
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeMetadata}
                      onChange={(e) => setIncludeMetadata(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Include metadata in download"
                />
              </Box>

              {/* Version Selection */}
              {downloadHistory.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Document Version
                  </Typography>
                  
                  <FormControl fullWidth>
                    <InputLabel>Select Version</InputLabel>
                    <Select
                      value={selectedVersion}
                      onChange={(e) => setSelectedVersion(e.target.value)}
                      label="Select Version"
                    >
                      <MenuItem value="latest">Latest Version</MenuItem>
                      {downloadHistory.map((item, index) => (
                        <MenuItem key={index} value={item.versionId || index}>
                          Version {index + 1} - {formatDate(item.downloadedAt)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
            </Paper>

            {/* Estimated Download Size */}
            <Paper sx={{ p: 2, bgcolor: '#E3F2FD', border: '1px solid #90CAF9' }}>
              <Typography variant="subtitle2" gutterBottom>
                Estimated Download Size
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CloudDownloadIcon sx={{ color: '#1976D2' }} />
                <Typography variant="body2">
                  {downloadQuality === 'high' ? formatFileSize(documentDetails?.fileSize) :
                   downloadQuality === 'medium' ? formatFileSize(documentDetails?.fileSize * 0.7) :
                   formatFileSize(documentDetails?.fileSize * 0.4)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  (May vary based on format conversion)
                </Typography>
              </Box>
            </Paper>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            {/* Download Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                📥 Download Document
              </Typography>

              {/* Summary Box */}
              <Box sx={{ p: 3, bgcolor: '#F8FAFC', borderRadius: 2, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Download Summary
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      Document
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {documentDetails?.filename}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      Format
                    </Typography>
                    <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>
                      {downloadFormat}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      Quality
                    </Typography>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {downloadQuality}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      Estimated Size
                    </Typography>
                    <Typography variant="body2">
                      {downloadQuality === 'high' ? formatFileSize(documentDetails?.fileSize) :
                       downloadQuality === 'medium' ? formatFileSize(documentDetails?.fileSize * 0.7) :
                       formatFileSize(documentDetails?.fileSize * 0.4)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Download Button */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleDownloadDocument}
                  disabled={downloading}
                  startIcon={downloading ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
                  sx={{
                    py: 2,
                    px: 4,
                    backgroundColor: '#1976D2',
                    '&:hover': { backgroundColor: '#1565C0' },
                    fontSize: '1.1rem'
                  }}
                >
                  {downloading ? 'Downloading...' : 'Start Download'}
                </Button>
              </Box>

              {/* Progress Indicator */}
              {downloading && (
                <Box sx={{ width: '100%', mb: 3 }}>
                  <LinearProgress />
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                    Preparing your download...
                  </Typography>
                </Box>
              )}

              {/* Success Message */}
              {success && (
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  {success}
                </Alert>
              )}

              {/* Alternative Options */}
              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" gutterBottom>
                Other Options
              </Typography>

              <Stack direction="row" spacing={2} justifyContent="center">
                <Tooltip title="Print Document">
                  <IconButton 
                    onClick={() => window.print()}
                    sx={{ 
                      p: 2,
                      bgcolor: '#F5F5F5',
                      '&:hover': { bgcolor: '#E0E0E0' }
                    }}
                  >
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Share Document">
                  <IconButton 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/documents/${documentDetails?._id}`);
                      setSuccess('Link copied to clipboard!');
                    }}
                    sx={{ 
                      p: 2,
                      bgcolor: '#F5F5F5',
                      '&:hover': { bgcolor: '#E0E0E0' }
                    }}
                  >
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Archive Document">
                  <IconButton 
                    onClick={() => setSuccess('Document archived successfully!')}
                    sx={{ 
                      p: 2,
                      bgcolor: '#F5F5F5',
                      '&:hover': { bgcolor: '#E0E0E0' }
                    }}
                  >
                    <ArchiveIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Paper>

            {/* Note */}
            <Paper sx={{ p: 2, bgcolor: '#FFF3E0', border: '1px solid #FFB74D' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon sx={{ color: '#F57C00' }} />
                <Typography variant="body2" color="textSecondary">
                  Downloaded documents are logged for audit purposes. Please ensure you have the necessary permissions to download this document.
                </Typography>
              </Box>
            </Paper>
          </Stack>
        );

      default:
        return 'Unknown step';
    }
  };

  if (fetching) {
    return (
      <Dialog open={open} maxWidth="md" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, flexDirection: 'column', gap: 2 }}>
            <CircularProgress />
            <Typography color="textSecondary">Loading document details...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, minHeight: '70vh' } }}
    >
      <DialogTitle sx={{
        borderBottom: '1px solid #E0E0E0',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Download Document
          </Typography>
          {documentDetails?.documentId && (
            <Typography variant="caption" color="textSecondary">
              {documentDetails.documentId} • {documentDetails.type}
            </Typography>
          )}
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Error/Success Messages */}
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError('')}
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert 
            severity="success" 
            icon={<CheckCircleIcon />}
            onClose={() => setSuccess('')}
            sx={{ mb: 3 }}
          >
            {success}
          </Alert>
        )}

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 1 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ minHeight: 450 }}>
          {getStepContent(activeStep)}
        </Box>
      </DialogContent>

      <DialogActions sx={{
        px: 3,
        py: 2,
        borderTop: '1px solid #E0E0E0',
        backgroundColor: '#F8FAFC',
        justifyContent: 'space-between'
      }}>
        <Button onClick={handleClose}>
          Cancel
        </Button>

        <Box>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleDownloadDocument}
              disabled={downloading}
              startIcon={downloading ? <CircularProgress size={20} /> : <DownloadIcon />}
              sx={{
                backgroundColor: '#1976D2',
                '&:hover': { backgroundColor: '#1565C0' },
                minWidth: 150
              }}
            >
              {downloading ? 'Downloading...' : 'Download'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{
                backgroundColor: '#1976D2',
                '&:hover': { backgroundColor: '#1565C0' }
              }}
            >
              Next
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default DownloadDocument;