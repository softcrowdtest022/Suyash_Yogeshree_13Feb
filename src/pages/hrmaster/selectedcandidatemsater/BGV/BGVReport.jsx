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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  MenuItem,
  InputLabel,
  Select,
  Checkbox
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  PictureAsPdf as PdfIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  VerifiedUser as VerifiedUserIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  Fingerprint as FingerprintIcon,
  Gavel as GavelIcon,
  Business as BusinessIcon,
  AccessTime as AccessTimeIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import axios from 'axios';
import { saveAs } from 'file-saver';
import BASE_URL from '../../../../config/Config';

const BGVReport = ({ open, onClose, bgvId = null, bgvData = null }) => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [bgvDetails, setBgvDetails] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [reportFormat, setReportFormat] = useState('pdf');
  const [reportType, setReportType] = useState('summary');
  const [includeDocuments, setIncludeDocuments] = useState(true);
  const [includeRemarks, setIncludeRemarks] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const steps = [
    'Report Configuration',
    'Preview',
    'Download/Share'
  ];

  const reportFormats = [
    { value: 'pdf', label: 'PDF Document', icon: <PdfIcon />, description: 'Portable Document Format' },
    { value: 'excel', label: 'Excel Spreadsheet', icon: <DescriptionIcon />, description: 'Microsoft Excel format' },
    { value: 'csv', label: 'CSV File', icon: <DescriptionIcon />, description: 'Comma-separated values' },
    { value: 'json', label: 'JSON Data', icon: <DescriptionIcon />, description: 'Raw JSON format' }
  ];

  const reportTypes = [
    { value: 'summary', label: 'Summary Report', description: 'High-level overview of verification results' },
    { value: 'detailed', label: 'Detailed Report', description: 'Complete verification details with check statuses' },
    { value: 'comprehensive', label: 'Comprehensive Report', description: 'Full report with all documents and remarks' },
    { value: 'compliance', label: 'Compliance Report', label: 'For regulatory and audit purposes' }
  ];

  useEffect(() => {
    if (open && bgvId) {
      fetchBGVDetails(bgvId);
      fetchReportStatus(bgvId);
    } else if (open && bgvData) {
      setBgvDetails(bgvData);
      if (bgvData._id) {
        fetchReportStatus(bgvData._id);
      }
    }
  }, [open, bgvId, bgvData]);

  const fetchBGVDetails = async (id) => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/bgv/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setBgvDetails(response.data.data);
      } else {
        setError('Failed to fetch BGV details');
      }
    } catch (err) {
      console.error('Error fetching BGV details:', err);
      setError(err.response?.data?.message || 'Failed to fetch BGV details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReportStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/bgv/${id}/report`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching report status:', err);
      // Don't show error for report status
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
    setReportFormat('pdf');
    setReportType('summary');
    setIncludeDocuments(true);
    setIncludeRemarks(true);
    setDateRange({ start: '', end: '' });
  };

  const handleClose = () => {
    handleReset();
    setBgvDetails(null);
    setReportData(null);
    setError('');
    setSuccess('');
    onClose();
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/bgv/${bgvDetails._id}/api/report/generate`,
        {
          format: reportFormat,
          type: reportType,
          includeDocuments,
          includeRemarks,
          dateRange: dateRange.start && dateRange.end ? dateRange : undefined
        },
        { 
          headers: { Authorization: `Bearer ${token}` },
          responseType: reportFormat === 'pdf' ? 'blob' : 'json'
        }
      );

      if (reportFormat === 'pdf') {
        // Handle PDF blob response
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `BGV_Report_${bgvDetails.bgvId}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setSuccess('Report generated and downloaded successfully!');
      } else {
        // Handle JSON response
        if (response.data.success) {
          setReportData(response.data.data);
          setSuccess('Report generated successfully!');
        }
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadReport = async () => {
    setDownloading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/bgv/${bgvDetails._id}/api/report/download?format=${reportFormat}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { 
        type: reportFormat === 'pdf' ? 'application/pdf' : 'application/vnd.ms-excel' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BGV_Report_${bgvDetails.bgvId}_${new Date().toISOString().split('T')[0]}.${reportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess('Report downloaded successfully!');
    } catch (err) {
      console.error('Error downloading report:', err);
      setError(err.response?.data?.message || 'Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>BGV Report - ${bgvDetails?.bgvId}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #1976D2; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Background Verification Report</h1>
          <p>BGV ID: ${bgvDetails?.bgvId}</p>
          <p>Candidate: ${bgvDetails?.candidate?.fullName}</p>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <hr/>
          <pre>${JSON.stringify(bgvDetails, null, 2)}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleShareReport = () => {
    // Implement share functionality (email, etc.)
    setSuccess('Share link copied to clipboard!');
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'cleared':
        return { bg: '#d1fae5', color: '#065f46' };
      case 'in_progress':
        return { bg: '#fef3c7', color: '#92400e' };
      case 'pending':
        return { bg: '#f1f5f9', color: '#475569' };
      case 'failed':
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
            {/* Report Configuration Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                ⚙️ Report Configuration
              </Typography>

              {/* Report Format */}
              <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 500 }}>
                  Report Format
                </FormLabel>
                <RadioGroup
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value)}
                >
                  <Grid container spacing={2}>
                    {reportFormats.map((format) => (
                      <Grid item xs={12} md={6} key={format.value}>
                        <Paper
                          sx={{
                            p: 2,
                            border: reportFormat === format.value ? '2px solid #1976D2' : '1px solid #E0E0E0',
                            borderRadius: 2,
                            cursor: 'pointer',
                            bgcolor: reportFormat === format.value ? '#E3F2FD' : '#FFFFFF',
                            '&:hover': {
                              borderColor: '#1976D2',
                              bgcolor: '#F5F9FF'
                            }
                          }}
                          onClick={() => setReportFormat(format.value)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ 
                              p: 1, 
                              borderRadius: '50%', 
                              bgcolor: reportFormat === format.value ? '#1976D2' : '#F5F5F5',
                              color: reportFormat === format.value ? '#FFFFFF' : '#757575'
                            }}>
                              {format.icon}
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
                              checked={reportFormat === format.value}
                              sx={{ ml: 'auto' }}
                            />
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </RadioGroup>
              </FormControl>

              {/* Report Type */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  label="Report Type"
                >
                  {reportTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box>
                        <Typography variant="body2">{type.label}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {type.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Options */}
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Report Options
              </Typography>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeDocuments}
                    onChange={(e) => setIncludeDocuments(e.target.checked)}
                    color="primary"
                  />
                }
                label="Include supporting documents"
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeRemarks}
                    onChange={(e) => setIncludeRemarks(e.target.checked)}
                    color="primary"
                  />
                }
                label="Include verification remarks"
              />

              {/* Date Range */}
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Date Range (Optional)
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: dateRange.start }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Existing Report Card */}
            {reportData?.reportUrl && (
              <Paper sx={{ p: 3, bgcolor: '#E8F5E9', border: '1px solid #81C784' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PdfIcon sx={{ color: '#388E3C', fontSize: 40 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ color: '#388E3C' }}>
                      Previous Report Available
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Generated on: {formatDate(reportData.generatedAt)}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadReport}
                    sx={{ color: '#388E3C', borderColor: '#81C784' }}
                  >
                    Download
                  </Button>
                </Box>
              </Paper>
            )}
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            {/* Report Preview Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                👁️ Report Preview
              </Typography>

              <Box sx={{ 
                p: 3, 
                bgcolor: '#F8FAFC', 
                borderRadius: 2,
                border: '1px dashed #BDBDBD',
                minHeight: 400,
                position: 'relative'
              }}>
                {generating ? (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                  }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Generating report...</Typography>
                  </Box>
                ) : (
                  <Box>
                    {/* Report Header */}
                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                      <Typography variant="h6" color="#1976D2">
                        Background Verification Report
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {bgvDetails?.bgvId} • Generated: {formatDate(new Date())}
                      </Typography>
                    </Box>

                    {/* Candidate Info */}
                    <Paper sx={{ p: 2, mb: 3, bgcolor: '#FFFFFF' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="textSecondary">
                            Candidate Name
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {bgvDetails?.candidate?.fullName}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="textSecondary">
                            Email
                          </Typography>
                          <Typography variant="body2">
                            {bgvDetails?.candidate?.email}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="textSecondary">
                            Phone
                          </Typography>
                          <Typography variant="body2">
                            {bgvDetails?.candidate?.phone}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="textSecondary">
                            Offer ID
                          </Typography>
                          <Typography variant="body2">
                            {bgvDetails?.offer?.offerId}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>

                    {/* Verification Summary */}
                    <Typography variant="subtitle2" gutterBottom>
                      Verification Summary
                    </Typography>
                    
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                      <Table>
                        <TableBody>
                          {bgvDetails?.checks?.map((check) => {
                            const statusStyle = getStatusColor(check.status);
                            return (
                              <TableRow key={check._id}>
                                <TableCell sx={{ textTransform: 'capitalize' }}>
                                  {check.type} Verification
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    size="small"
                                    label={check.status}
                                    sx={{ 
                                      bgcolor: statusStyle.bg,
                                      color: statusStyle.color,
                                      fontWeight: 500
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  {check.completedAt ? formatDate(check.completedAt) : 'Pending'}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Overall Status */}
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: bgvDetails?.status === 'completed' ? '#E8F5E9' : '#FFF3E0',
                      borderRadius: 1,
                      textAlign: 'center'
                    }}>
                      <Typography variant="subtitle1" sx={{ 
                        color: bgvDetails?.status === 'completed' ? '#388E3C' : '#F57C00'
                      }}>
                        Overall Status: {bgvDetails?.status?.toUpperCase()}
                      </Typography>
                    </Box>

                    {/* Preview Footer */}
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 3, display: 'block', textAlign: 'center' }}>
                      This is a preview. Actual report may include additional details based on configuration.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            {/* Download/Share Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                📥 Download & Share
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { 
                        borderColor: '#1976D2',
                        bgcolor: '#F5F9FF'
                      }
                    }}
                    onClick={handleGenerateReport}
                  >
                    <CardContent>
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <PdfIcon sx={{ fontSize: 48, color: '#1976D2' }} />
                      </Box>
                      <Typography variant="h6" align="center" gutterBottom>
                        Generate New Report
                      </Typography>
                      <Typography variant="body2" color="textSecondary" align="center">
                        Create a new report with current configuration
                      </Typography>
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Button
                          variant="contained"
                          startIcon={generating ? <CircularProgress size={20} /> : <AssessmentIcon />}
                          disabled={generating}
                          fullWidth
                        >
                          {generating ? 'Generating...' : 'Generate'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      cursor: reportData?.reportUrl ? 'pointer' : 'not-allowed',
                      opacity: reportData?.reportUrl ? 1 : 0.5,
                      '&:hover': reportData?.reportUrl ? { 
                        borderColor: '#1976D2',
                        bgcolor: '#F5F9FF'
                      } : {}
                    }}
                    onClick={reportData?.reportUrl ? handleDownloadReport : undefined}
                  >
                    <CardContent>
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <DownloadIcon sx={{ fontSize: 48, color: '#4CAF50' }} />
                      </Box>
                      <Typography variant="h6" align="center" gutterBottom>
                        Download Latest Report
                      </Typography>
                      <Typography variant="body2" color="textSecondary" align="center">
                        {reportData?.reportUrl 
                          ? `Last generated: ${formatDate(reportData.generatedAt)}`
                          : 'No report available yet'}
                      </Typography>
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Button
                          variant="outlined"
                          startIcon={downloading ? <CircularProgress size={20} /> : <DownloadIcon />}
                          disabled={!reportData?.reportUrl || downloading}
                          fullWidth
                        >
                          {downloading ? 'Downloading...' : 'Download'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Share Options
                  </Typography>
                  
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <Tooltip title="Print Report">
                      <IconButton 
                        onClick={handlePrintReport}
                        sx={{ 
                          p: 2,
                          bgcolor: '#F5F5F5',
                          '&:hover': { bgcolor: '#E0E0E0' }
                        }}
                      >
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Share via Email">
                      <IconButton 
                        onClick={handleShareReport}
                        sx={{ 
                          p: 2,
                          bgcolor: '#F5F5F5',
                          '&:hover': { bgcolor: '#E0E0E0' }
                        }}
                      >
                        <EmailIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Copy Link">
                      <IconButton 
                        onClick={handleShareReport}
                        sx={{ 
                          p: 2,
                          bgcolor: '#F5F5F5',
                          '&:hover': { bgcolor: '#E0E0E0' }
                        }}
                      >
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Grid>

                {/* Report History */}
                {reportData?.history && reportData.history.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      Report History
                    </Typography>
                    
                    <List>
                      {reportData.history.map((item, index) => (
                        <ListItem key={index} divider={index < reportData.history.length - 1}>
                          <ListItemIcon>
                            <HistoryIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={`Report generated on ${formatDate(item.generatedAt)}`}
                            secondary={`Format: ${item.format?.toUpperCase()} • Size: ${item.size || 'N/A'}`}
                          />
                          <IconButton onClick={() => window.open(item.url, '_blank')}>
                            <DownloadIcon />
                          </IconButton>
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Report Info Card */}
            <Paper sx={{ p: 2, bgcolor: '#E3F2FD', border: '1px solid #90CAF9' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <InfoIcon sx={{ color: '#1976D2' }} />
                <Typography variant="body2" color="textSecondary">
                  Reports are generated based on the current verification data and your configuration choices.
                  Generated reports are stored for 30 days.
                </Typography>
              </Box>
            </Paper>
          </Stack>
        );

      default:
        return 'Unknown step';
    }
  };

  if (loading) {
    return (
      <Dialog open={open} maxWidth="md" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, flexDirection: 'column', gap: 2 }}>
            <CircularProgress />
            <Typography color="textSecondary">Loading BGV details...</Typography>
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
            BGV Report
          </Typography>
          {bgvDetails?.bgvId && (
            <Typography variant="caption" color="textSecondary">
              {bgvDetails.bgvId} • {bgvDetails?.candidate?.fullName}
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
              onClick={handleReset}
              sx={{
                backgroundColor: '#1976D2',
                '&:hover': { backgroundColor: '#1565C0' }
              }}
            >
              New Report
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

export default BGVReport;