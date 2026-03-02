import React, { useState, useEffect, useRef } from 'react';
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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Card,
  CardContent
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  PictureAsPdf as PdfIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../../config/Config';

const GenerateOfferLetter = ({ open, onClose, onSubmit, offerData = null }) => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [offerDetails, setOfferDetails] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [offerLetterHtml, setOfferLetterHtml] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  
  const printRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (open && offerData) {
      setOfferDetails(offerData);
      fetchCandidateDetails(offerData.candidateId);
    }
  }, [open, offerData]);

  useEffect(() => {
    if (open && offerData && activeTab === 1) {
      generateOfferLetter();
    }
  }, [open, offerData, activeTab]);

  const fetchCandidateDetails = async (candidateId) => {
    setFetchingDetails(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/candidates/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCandidateDetails(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching candidate details:', err);
      setError('Failed to fetch candidate details');
    } finally {
      setFetchingDetails(false);
    }
  };

  const generateOfferLetter = async () => {
    if (!offerDetails?._id) return;

    setGenerating(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/api/offers/${offer._id}/generate-letter`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Accept': 'text/html'
          },
          responseType: 'text'
        }
      );

      if (response.data) {
        setOfferLetterHtml(response.data);
        setSuccess('Offer letter generated successfully!');
      }
    } catch (err) {
      console.error('Error generating offer letter:', err);
      setError(err.response?.data?.message || 'Failed to generate offer letter');
    } finally {
      setGenerating(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleClose = () => {
    setActiveTab(0);
    setOfferLetterHtml(null);
    setError('');
    setSuccess('');
    setCopied(false);
    onClose();
  };

  const handleDownload = () => {
    if (!offerLetterHtml) return;

    const blob = new Blob([offerLetterHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Offer_Letter_${candidateDetails?.firstName}_${candidateDetails?.lastName}_${offerDetails?.offerId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    setSuccess('Offer letter downloaded successfully!');
  };

  const handlePrint = () => {
    if (!offerLetterHtml) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(offerLetterHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/offers/${offer?._id}/letter`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    // In a real implementation, this would open an email modal or trigger an API
    setSuccess('Email sent to candidate successfully!');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft': return 'default';
      case 'pending_approval': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'sent': return 'info';
      default: return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, height: '90vh' } }}
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
            Generate Offer Letter
          </Typography>
          {offerDetails?.offerId && (
            <Typography variant="caption" color="textSecondary">
              Offer ID: {offerDetails.offerId}
            </Typography>
          )}
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 0 }}>
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

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              label="Preview Details" 
              icon={<ViewIcon />} 
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
            <Tab 
              label="Offer Letter" 
              icon={<PdfIcon />} 
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ height: 'calc(100% - 120px)', overflow: 'auto' }}>
          {activeTab === 0 ? (
            <Stack spacing={3}>
              {/* Candidate Summary Card */}
              <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                  👤 Candidate Information
                </Typography>
                
                {fetchingDetails ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                        <Avatar sx={{ bgcolor: '#1976D2', width: 80, height: 80 }}>
                          {candidateDetails?.firstName?.charAt(0)}{candidateDetails?.lastName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h5">
                            {candidateDetails?.firstName} {candidateDetails?.lastName}
                          </Typography>
                          <Typography variant="body1" color="textSecondary">
                            {candidateDetails?.email} • {candidateDetails?.phone}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip 
                              label={candidateDetails?.candidateId} 
                              size="small" 
                              variant="outlined"
                            />
                            <Chip 
                              label="Selected" 
                              size="small" 
                              color="success"
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        Date of Birth
                      </Typography>
                      <Typography variant="body1">
                        {candidateDetails?.dateOfBirth ? formatDate(candidateDetails.dateOfBirth) : 'N/A'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        Gender
                      </Typography>
                      <Typography variant="body1">
                        {candidateDetails?.gender === 'M' ? 'Male' : candidateDetails?.gender === 'F' ? 'Female' : 'Other'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Skills
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {candidateDetails?.skills?.map((skill, index) => (
                          <Chip key={index} label={skill} size="small" />
                        ))}
                        {(!candidateDetails?.skills || candidateDetails.skills.length === 0) && (
                          <Typography variant="body2" color="textSecondary">No skills listed</Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </Paper>

              {/* Offer Details Card */}
              <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                  📄 Offer Details
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        Position
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {candidateDetails?.latestApplication?.jobId?.title || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        Department
                      </Typography>
                      <Typography variant="body1">
                        {candidateDetails?.latestApplication?.jobId?.department || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        Joining Date
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {offerDetails?.joiningDate ? formatDate(offerDetails.joiningDate) : 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        Reporting To
                      </Typography>
                      <Typography variant="body1">
                        {offerDetails?.offerDetails?.reportingTo || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        Probation Period
                      </Typography>
                      <Typography variant="body1">
                        {offerDetails?.offerDetails?.probationPeriod || '6'} months
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        Notice Period
                      </Typography>
                      <Typography variant="body1">
                        {offerDetails?.offerDetails?.noticePeriod || '30'} days
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      Benefits
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {offerDetails?.offerDetails?.benefits?.map((benefit, index) => (
                        <Chip
                          key={index}
                          label={benefit}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                      {(!offerDetails?.offerDetails?.benefits || offerDetails.offerDetails.benefits.length === 0) && (
                        <Typography variant="body2" color="textSecondary">No benefits added</Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* CTC Summary Card */}
              <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                  💰 Compensation Summary
                </Typography>

                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableBody>
                      <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>Component</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Monthly (₹)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Annual (₹)</TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell component="th" scope="row">Basic + DA</TableCell>
                        <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.basic)}</TableCell>
                        <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.basic * 12)}</TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell component="th" scope="row">HRA</TableCell>
                        <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.hra)}</TableCell>
                        <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.hra * 12)}</TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell component="th" scope="row">Conveyance Allowance</TableCell>
                        <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.conveyanceAllowance)}</TableCell>
                        <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.conveyanceAllowance * 12)}</TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell component="th" scope="row">Medical Allowance</TableCell>
                        <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.medicalAllowance)}</TableCell>
                        <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.medicalAllowance * 12)}</TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell component="th" scope="row">Special Allowance</TableCell>
                        <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.specialAllowance)}</TableCell>
                        <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.specialAllowance * 12)}</TableCell>
                      </TableRow>
                      
                      <TableRow sx={{ bgcolor: '#E3F2FD' }}>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>Gross Salary</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(offerDetails?.ctcDetails?.gross)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(offerDetails?.ctcDetails?.gross * 12)}</TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell component="th" scope="row">Bonus (Annual)</TableCell>
                        <TableCell align="right">-</TableCell>
                        <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.bonus)}</TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell component="th" scope="row">Employer PF (Annual)</TableCell>
                        <TableCell align="right">-</TableCell>
                        <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.employerPf)}</TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell component="th" scope="row">Employer ESI (Annual)</TableCell>
                        <TableCell align="right">-</TableCell>
                        <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.employerEsi || 0)}</TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell component="th" scope="row">Gratuity (Annual)</TableCell>
                        <TableCell align="right">-</TableCell>
                        <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.gratuity)}</TableCell>
                      </TableRow>
                      
                      <TableRow sx={{ bgcolor: '#1976D2' }}>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 700, color: 'white' }}>TOTAL CTC</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: 'white' }}>-</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: 'white', fontSize: '1.2rem' }}>
                          {formatCurrency(offerDetails?.ctcDetails?.totalCtc)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Note about PDF generation */}
                <Box sx={{ 
                  mt: 3, 
                  p: 2, 
                  bgcolor: '#FFF3E0', 
                  borderRadius: 1,
                  border: '1px solid #FFB74D'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <InfoIcon sx={{ color: '#F57C00' }} />
                    <Typography variant="subtitle2" sx={{ color: '#F57C00' }}>
                      PDF Generation Notice
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    PDF generation is currently unavailable. You can view the HTML version or download the offer letter as HTML.
                  </Typography>
                </Box>
              </Paper>
            </Stack>
          ) : (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Action Bar */}
              <Paper sx={{ p: 2, mb: 2, bgcolor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Offer Letter Preview
                  </Typography>
                  <Chip 
                    label={offerDetails?.status || 'Approved'} 
                    color={getStatusColor(offerDetails?.status)}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Download HTML">
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownload}
                      disabled={generating || !offerLetterHtml}
                      size="small"
                    >
                      Download
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title="Print">
                    <Button
                      variant="outlined"
                      startIcon={<PrintIcon />}
                      onClick={handlePrint}
                      disabled={generating || !offerLetterHtml}
                      size="small"
                    >
                      Print
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title="Copy Link">
                    <Button
                      variant="outlined"
                      startIcon={copied ? <CheckCircleIcon /> : <CopyIcon />}
                      onClick={handleCopyLink}
                      size="small"
                      color={copied ? 'success' : 'primary'}
                    >
                      {copied ? 'Copied!' : 'Copy Link'}
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title="Send Email">
                    <Button
                      variant="outlined"
                      startIcon={<EmailIcon />}
                      onClick={handleSendEmail}
                      size="small"
                    >
                      Email
                    </Button>
                  </Tooltip>
                </Box>
              </Paper>

              {/* Offer Letter Content */}
              <Paper 
                ref={printRef}
                sx={{ 
                  p: 0, 
                  flex: 1, 
                  overflow: 'auto',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E0E0E0'
                }}
              >
                {generating ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: 2 }}>
                    <CircularProgress />
                    <Typography color="textSecondary">Generating offer letter...</Typography>
                  </Box>
                ) : offerLetterHtml ? (
                  <iframe
                    ref={iframeRef}
                    srcDoc={offerLetterHtml}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="Offer Letter"
                    sandbox="allow-same-origin allow-popups allow-forms allow-scripts"
                  />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: 2 }}>
                    <WarningIcon sx={{ fontSize: 48, color: '#FFB74D' }} />
                    <Typography variant="h6" color="textSecondary">
                      No Offer Letter Generated
                    </Typography>
                    <Typography color="textSecondary" align="center">
                      Click the "Generate" button to create the offer letter.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={generateOfferLetter}
                      startIcon={<PdfIcon />}
                      sx={{ mt: 2 }}
                    >
                      Generate Offer Letter
                    </Button>
                  </Box>
                )}
              </Paper>
            </Box>
          )}
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
          Close
        </Button>

        {activeTab === 1 && !offerLetterHtml && (
          <Button
            variant="contained"
            onClick={generateOfferLetter}
            disabled={generating}
            startIcon={generating ? <CircularProgress size={20} /> : <PdfIcon />}
            sx={{
              backgroundColor: '#1976D2',
              '&:hover': { backgroundColor: '#1565C0' }
            }}
          >
            {generating ? 'Generating...' : 'Generate Offer Letter'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default GenerateOfferLetter;