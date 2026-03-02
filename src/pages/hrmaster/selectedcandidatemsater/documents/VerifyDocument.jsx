import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  TextField,
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
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Checkbox,
  Tooltip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Rating
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  VerifiedUser as VerifiedUserIcon,
  Security as SecurityIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Flag as FlagIcon,
  Comment as CommentIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../../config/Config';

const VerifyDocument = ({ open, onClose, onSubmit, documentId = null, documentData = null }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [documentDetails, setDocumentDetails] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [decision, setDecision] = useState(''); // 'approve' or 'reject'
  const [verified, setVerified] = useState(true);
  const [comments, setComments] = useState('');
  const [rejectionReasons, setRejectionReasons] = useState([]);
  const [verificationScore, setVerificationScore] = useState(5);
  const [confirmAction, setConfirmAction] = useState(false);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [loadingDocument, setLoadingDocument] = useState(false);

  const steps = [
    'Review Document',
    'Verification',
    'Confirm Decision'
  ];

  const rejectionOptions = [
    'Document is blurry or illegible',
    'Document appears to be forged',
    'Information mismatch with records',
    'Document expired',
    'Incomplete document',
    'Wrong document type uploaded',
    'Duplicate document',
    'Other'
  ];

  const verificationChecks = [
    { id: 'clarity', label: 'Document Clarity', description: 'Document is clear and readable' },
    { id: 'authenticity', label: 'Document Authenticity', description: 'Document appears genuine' },
    { id: 'information', label: 'Information Match', description: 'Details match candidate records' },
    { id: 'expiry', label: 'Expiry Date', description: 'Document is valid/not expired' },
    { id: 'completeness', label: 'Completeness', description: 'All required information present' }
  ];

  useEffect(() => {
    if (open && documentId) {
      fetchDocumentDetails(documentId);
    } else if (open && documentData) {
      setDocumentDetails(documentData);
      if (documentData.candidateId) {
        fetchCandidateDetails(documentData.candidateId);
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

  const handleViewDocument = async () => {
    if (!documentDetails?.fileUrl) return;
    
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
    if (!documentDetails?.fileUrl) return;
    
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
      const link = document.createElement('a');
      link.href = url;
      link.download = documentDetails.filename || `document-${documentDetails.documentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Failed to download document');
    }
  };

  const handleNext = () => {
    if (activeStep === 1 && !decision) {
      setError('Please select a decision');
      return;
    }
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setDecision('');
    setVerified(true);
    setComments('');
    setRejectionReasons([]);
    setVerificationScore(5);
    setConfirmAction(false);
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    handleReset();
    setDocumentDetails(null);
    setCandidateDetails(null);
    if (documentUrl) {
      window.URL.revokeObjectURL(documentUrl);
    }
    onClose();
  };

  const handleDecisionChange = (event) => {
    const value = event.target.value === 'approve';
    setVerified(value);
    setDecision(value ? 'approve' : 'reject');
    setConfirmAction(false);
    setError('');
  };

  const handleRejectionReasonToggle = (reason) => {
    setRejectionReasons(prev => 
      prev.includes(reason)
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  const handleSubmitVerification = async () => {
    if (!decision) {
      setError('Please select a decision');
      return;
    }

    if (!verified && rejectionReasons.length === 0) {
      setError('Please select at least one rejection reason');
      return;
    }

    if (!confirmAction) {
      setError('Please confirm your decision');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${BASE_URL}/api/documents/${documentDetails._id}/verify`,
        {
          verified,
          comments: comments || (verified ? 'Document verified successfully' : rejectionReasons.join(', '))
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess(response.data.message || `Document ${verified ? 'verified' : 'rejected'} successfully!`);
        
        if (onSubmit) {
          onSubmit(response.data.data);
        }
        
        // Auto close after success
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Error verifying document:', err);
      setError(err.response?.data?.message || 'Failed to verify document');
    } finally {
      setSubmitting(false);
    }
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
        return { bg: '#d1fae5', color: '#065f46', label: 'Verified' };
      case 'pending':
        return { bg: '#fef3c7', color: '#92400e', label: 'Pending' };
      case 'rejected':
        return { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' };
      default:
        return { bg: '#f1f5f9', color: '#475569', label: status || 'Unknown' };
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            {/* Document Preview Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                📄 Document Review
              </Typography>

              {fetching ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {/* Document Info */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Box sx={{ p: 2, bgcolor: '#F5F5F5', borderRadius: 2 }}>
                        {getFileIcon(documentDetails?.fileType)}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">
                          {documentDetails?.filename || 'Document'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Document ID: {documentDetails?.documentId || 'N/A'} • 
                          Size: {formatFileSize(documentDetails?.fileSize)} • 
                          Uploaded: {formatDate(documentDetails?.uploadedAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Document Details */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DescriptionIcon fontSize="small" color="primary" />
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Document Type
                        </Typography>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {documentDetails?.type || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon fontSize="small" color="primary" />
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Status
                        </Typography>
                        <Box>
                          <Chip
                            size="small"
                            label={getStatusColor(documentDetails?.status).label}
                            sx={{ 
                              bgcolor: getStatusColor(documentDetails?.status).bg,
                              color: getStatusColor(documentDetails?.status).color,
                              fontWeight: 500
                            }}
                          />
                        </Box>
                      </Box>
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
                        View Document
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadDocument}
                        fullWidth
                      >
                        Download
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              )}
            </Paper>

            {/* Candidate Info Card */}
            {candidateDetails && (
              <Paper sx={{ p: 3, bgcolor: '#F8FAFC' }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                  👤 Candidate Information
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#1976D2', width: 48, height: 48 }}>
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

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="textSecondary">
                      Candidate ID
                    </Typography>
                    <Typography variant="body2">{candidateDetails.candidateId}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="textSecondary">
                      Date of Birth
                    </Typography>
                    <Typography variant="body2">{formatDate(candidateDetails.dateOfBirth)}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            {/* Verification Decision Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                ✅ Verification Decision
              </Typography>

              <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 500 }}>
                  Select Decision
                </FormLabel>
                <RadioGroup
                  value={verified ? 'approve' : 'reject'}
                  onChange={handleDecisionChange}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Paper
                        sx={{
                          p: 2,
                          border: verified ? '2px solid #2E7D32' : '1px solid #E0E0E0',
                          borderRadius: 2,
                          cursor: 'pointer',
                          bgcolor: verified ? '#E8F5E9' : '#FFFFFF',
                          '&:hover': {
                            borderColor: '#2E7D32',
                            bgcolor: '#F1F8E9'
                          }
                        }}
                        onClick={() => setVerified(true)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ 
                            p: 1, 
                            borderRadius: '50%', 
                            bgcolor: verified ? '#2E7D32' : '#F5F5F5',
                            color: verified ? '#FFFFFF' : '#757575'
                          }}>
                            <ThumbUpIcon />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              Verify Document
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Document is authentic and matches records
                            </Typography>
                          </Box>
                          <Radio 
                            value="approve" 
                            checked={verified}
                            sx={{ color: '#2E7D32' }}
                          />
                        </Box>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Paper
                        sx={{
                          p: 2,
                          border: !verified ? '2px solid #D32F2F' : '1px solid #E0E0E0',
                          borderRadius: 2,
                          cursor: 'pointer',
                          bgcolor: !verified ? '#FFEBEE' : '#FFFFFF',
                          '&:hover': {
                            borderColor: '#D32F2F',
                            bgcolor: '#FFEBEE'
                          }
                        }}
                        onClick={() => setVerified(false)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ 
                            p: 1, 
                            borderRadius: '50%', 
                            bgcolor: !verified ? '#D32F2F' : '#F5F5F5',
                            color: !verified ? '#FFFFFF' : '#757575'
                          }}>
                            <ThumbDownIcon />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              Reject Document
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Document has issues or discrepancies
                            </Typography>
                          </Box>
                          <Radio 
                            value="reject" 
                            checked={!verified}
                            sx={{ color: '#D32F2F' }}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </RadioGroup>
              </FormControl>

              {verified && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Verification Quality Score
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Rating
                      value={verificationScore}
                      onChange={(event, newValue) => setVerificationScore(newValue)}
                      size="large"
                    />
                    <Typography variant="body2" color="textSecondary">
                      ({verificationScore}/5)
                    </Typography>
                  </Box>
                </Box>
              )}

              {!verified && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Rejection Reasons *
                  </Typography>
                  <Grid container spacing={1}>
                    {rejectionOptions.map((reason) => (
                      <Grid item xs={12} md={6} key={reason}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={rejectionReasons.includes(reason)}
                              onChange={() => handleRejectionReasonToggle(reason)}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2">{reason}</Typography>
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Comments */}
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                Verification Comments
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder={verified 
                  ? "Add any additional notes about the verification..." 
                  : "Provide detailed reason for rejection..."
                }
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                sx={{ mb: 3 }}
              />

              {/* Verification Checklist */}
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Verification Checklist
              </Typography>
              
              <List>
                {verificationChecks.map((check) => (
                  <ListItem key={check.id}>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={verified}
                        disabled={!verified}
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary={check.label}
                      secondary={check.description}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            {/* Confirmation Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                ⚖️ Confirm Decision
              </Typography>

              {/* Summary Box */}
              <Box sx={{ p: 3, bgcolor: '#F8FAFC', borderRadius: 2, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="textSecondary">
                      Document
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {documentDetails?.filename}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="textSecondary">
                      Document ID
                    </Typography>
                    <Typography variant="body1">
                      {documentDetails?.documentId}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="textSecondary">
                      Decision
                    </Typography>
                    <Chip
                      icon={verified ? <CheckCircleIcon /> : <CancelIcon />}
                      label={verified ? 'VERIFY' : 'REJECT'}
                      color={verified ? 'success' : 'error'}
                      sx={{ fontWeight: 600, mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="textSecondary">
                      Candidate
                    </Typography>
                    <Typography variant="body1">
                      {candidateDetails?.firstName} {candidateDetails?.lastName}
                    </Typography>
                  </Grid>
                  {!verified && rejectionReasons.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary">
                        Rejection Reasons
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {rejectionReasons.map((reason, index) => (
                          <Chip
                            key={index}
                            label={reason}
                            size="small"
                            color="error"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Grid>
                  )}
                  {comments && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary">
                        Comments
                      </Typography>
                      <Typography variant="body2" sx={{ p: 1, bgcolor: '#FFFFFF', borderRadius: 1 }}>
                        {comments}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>

              {/* Warning Message */}
              <Box sx={{ 
                p: 2, 
                bgcolor: verified ? '#E8F5E9' : '#FFEBEE',
                borderRadius: 1,
                border: verified ? '1px solid #81C784' : '1px solid #E57373',
                mb: 3
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {verified ? (
                    <InfoIcon sx={{ color: '#388E3C' }} />
                  ) : (
                    <WarningIcon sx={{ color: '#D32F2F' }} />
                  )}
                  <Typography variant="subtitle2" sx={{ color: verified ? '#388E3C' : '#D32F2F' }}>
                    {verified ? 'Verification Confirmation' : 'Rejection Warning'}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {verified 
                    ? 'Once verified, this document will be marked as authentic and can be used for further processing.'
                    : 'Rejecting this document will flag it as invalid. The candidate may need to upload a new document.'}
                </Typography>
              </Box>

              {/* Confirmation Checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={confirmAction}
                    onChange={(e) => setConfirmAction(e.target.checked)}
                    color={verified ? 'success' : 'error'}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    I confirm that I have reviewed the document and my decision is accurate
                  </Typography>
                }
              />
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
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, minHeight: '80vh' } }}
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
            Verify Document
          </Typography>
          {documentDetails?.documentId && (
            <Typography variant="caption" color="textSecondary">
              Document ID: {documentDetails.documentId} • Type: {documentDetails.type}
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
              onClick={handleSubmitVerification}
              disabled={submitting || !decision || (!verified && rejectionReasons.length === 0) || !confirmAction}
              startIcon={submitting ? <CircularProgress size={20} /> : (verified ? <CheckCircleIcon /> : <CancelIcon />)}
              sx={{
                backgroundColor: verified ? '#2E7D32' : '#D32F2F',
                '&:hover': { 
                  backgroundColor: verified ? '#1B5E20' : '#C62828' 
                },
                minWidth: 200
              }}
            >
              {submitting ? 'Processing...' : `${verified ? 'Verify' : 'Reject'} Document`}
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

export default VerifyDocument;