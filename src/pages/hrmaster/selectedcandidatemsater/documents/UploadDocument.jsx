import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  LinearProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  WorkOutline,
  BusinessOutlined
} from '@mui/icons-material';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import BASE_URL from '../../../../config/Config';
import { SchoolIcon } from 'lucide-react';

const UploadDocument = ({ open, onClose, onSubmit, candidateId = null, documentType = null }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [fetchingCandidates, setFetchingCandidates] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [documentTypeValue, setDocumentTypeValue] = useState(documentType || '');
  const [description, setDescription] = useState('');
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const steps = ['Select Candidate', 'Upload Document', 'Confirm & Submit'];

  const documentTypes = [
    { value: 'resume', label: 'Resume/CV', icon: <DescriptionIcon />, description: 'Professional resume or curriculum vitae' },
    { value: 'offer_letter', label: 'Offer Letter', icon: <AssignmentIcon />, description: 'Job offer letter' },
    { value: 'appointment_letter', label: 'Appointment Letter', icon: <AssignmentIcon />, description: 'Official appointment letter' },
    { value: 'ctc_breakdown', label: 'CTC Breakdown', icon: <BusinessOutlined />, description: 'Salary and compensation structure' },
    { value: 'aadhar', label: 'Aadhar Card', icon: <PersonIcon />, description: 'Government ID proof' },
    { value: 'pan', label: 'PAN Card', icon: <PersonIcon />, description: 'Permanent Account Number' },
    { value: 'passport', label: 'Passport', icon: <PersonIcon />, description: 'International travel document' },
    { value: 'voter_id', label: 'Voter ID', icon: <PersonIcon />, description: 'Voter identification' },
    { value: 'driving_license', label: 'Driving License', icon: <PersonIcon />, description: 'Driver\'s license' },
    { value: 'educational_certificate', label: 'Educational Certificate', icon: <SchoolIcon />, description: 'Educational qualification documents' },
    { value: 'experience_certificate', label: 'Experience Certificate', icon: <WorkOutline />, description: 'Previous employment proof' },
    { value: 'salary_slip', label: 'Salary Slip', icon: <WorkOutline />, description: 'Recent salary slips' },
    { value: 'bank_statement', label: 'Bank Statement', icon: <BusinessOutlined />, description: 'Bank account statement' },
    { value: 'photograph', label: 'Photograph', icon: <ImageIcon />, description: 'Recent passport size photo' },
    { value: 'other', label: 'Other', icon: <FileIcon />, description: 'Other documents' }
  ];

  useEffect(() => {
    if (open) fetchCandidates();
  }, [open]);

  useEffect(() => {
    if (candidateId) setSelectedCandidate({ _id: candidateId });
  }, [candidateId]);

  const fetchCandidates = async () => {
    setFetchingCandidates(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/candidates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) setCandidates(response.data.data || []);
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError('Failed to fetch candidates');
    } finally {
      setFetchingCandidates(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF, JPG, JPEG, and PNG files are allowed');
      return;
    }

    setDocumentFile(file);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    multiple: false
  });

  const handleCandidateChange = (e) => {
    const candidate = candidates.find(c => c._id === e.target.value);
    setSelectedCandidate(candidate);
  };

  const handleRemoveFile = () => setDocumentFile(null);

  const handleNext = () => {
    if (activeStep === 0 && !selectedCandidate) {
      setError('Please select a candidate');
      return;
    }
    if (activeStep === 1) {
      if (!documentFile) {
        setError('Please upload a document');
        return;
      }
      if (!documentTypeValue) {
        setError('Please select document type');
        return;
      }
    }
    setError('');
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => setActiveStep(prev => prev - 1);

  const handleReset = () => {
    setActiveStep(0);
    setSelectedCandidate(null);
    setDocumentFile(null);
    setDocumentTypeValue(documentType || '');
    setDescription('');
    setUploadedDocument(null);
    setUploadProgress(0);
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleUploadDocument = async () => {
    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('document', documentFile);
      formData.append('candidateId', selectedCandidate._id);
      formData.append('type', documentTypeValue);
      if (description) formData.append('description', description);

      const response = await axios.post(
        `${BASE_URL}/api/documents/upload`,
        formData,
        {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        }
      );

      if (response.data.success) {
        setUploadedDocument(response.data.data);
        setSuccess(response.data.message || 'Document uploaded successfully!');
        if (onSubmit) onSubmit(response.data.data);
        
        // Close the dialog after successful upload
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getFileIcon = (file) => {
    if (!file) return <FileIcon />;
    if (file.type === 'application/pdf') return <PdfIcon sx={{ color: '#F40F02' }} />;
    if (file.type.startsWith('image/')) return <ImageIcon sx={{ color: '#2196F3' }} />;
    return <FileIcon sx={{ color: '#757575' }} />;
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2">
                👤 Select Candidate
              </Typography>
              {fetchingCandidates ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <FormControl fullWidth size="small">
                  <InputLabel>Select Candidate</InputLabel>
                  <Select
                    value={selectedCandidate?._id || ''}
                    onChange={handleCandidateChange}
                    label="Select Candidate"
                  >
                    {candidates.map(cand => (
                      <MenuItem key={cand._id} value={cand._id}>
                        {cand.firstName} {cand.lastName} - {cand.candidateId || cand.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {selectedCandidate && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#F8FAFC', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Full Name</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {selectedCandidate.firstName} {selectedCandidate.lastName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Email</Typography>
                      <Typography variant="body2">{selectedCandidate.email}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">Phone</Typography>
                      <Typography variant="body2">{selectedCandidate.phone}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>
            <Paper sx={{ p: 2, bgcolor: '#E3F2FD', border: '1px solid #90CAF9' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <InfoIcon sx={{ color: '#1976D2' }} />
                <Typography variant="body2">
                  Select the candidate for whom you want to upload a document.
                </Typography>
              </Box>
            </Paper>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2">
                📄 Upload Document
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl size="small" sx={{ width: 300 }}>
                    <InputLabel>Document Type</InputLabel>
                    <Select 
                      value={documentTypeValue}
                      onChange={(e) => setDocumentTypeValue(e.target.value)}
                      label="Document Type"
                    >
                      {documentTypes.map(type => (
                        <MenuItem key={type.value} value={type.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {type.icon}
                            <Box>
                              <Typography variant="body2">{type.label}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                {type.description}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {/* File Upload Area */}
                    <Paper
                      {...getRootProps()}
                      sx={{
                        flex: 1,
                        p: 1,
                        height: 60,
                        width: 350,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `2px dashed ${isDragActive ? '#1976D2' : documentFile ? '#4CAF50' : '#BDBDBD'}`,
                        borderRadius: 2,
                        bgcolor: isDragActive ? '#E3F2FD' : documentFile ? '#E8F5E9' : '#F8FAFC',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                        '&:hover': { 
                          borderColor: '#1976D2', 
                          bgcolor: '#E3F2FD',
                          transform: 'translateY(-2px)',
                          boxShadow: 1
                        }
                      }}
                    >
                      <input {...getInputProps()} />
                      {documentFile ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getFileIcon(documentFile)}
                            <Box sx={{ textAlign: 'left' }}>
                              <Typography variant="body2" fontWeight={500}>{documentFile.name}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                {formatFileSize(documentFile.size)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ) : (
                        <Box>
                          <CloudUploadIcon sx={{ fontSize: 32, color: '#9E9E9E', mb: 0.5 }} />
                          <Typography variant="body2" fontWeight={500} gutterBottom>
                            Drag & Drop or Click to Upload
                            <br /> 
                            <span style={{ fontSize: '0.70rem', color: '#64748B', opacity: 0.8 }}>PDF, JPG, JPEG, PNG (Max: 10MB)</span>
                          </Typography>
                        </Box>
                      )}
                    </Paper>

                    {/* Remove Button - Only show when file is selected */}
                    {documentFile && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={handleRemoveFile}
                        sx={{ 
                          height: 40,
                          borderRadius: 2,
                          textTransform: 'none',
                          borderColor: '#ef5350',
                          color: '#ef5350',
                          '&:hover': {
                            borderColor: '#d32f2f',
                            backgroundColor: '#ffebee'
                          }
                        }}
                      >
                        <DeleteIcon/>
                      </Button>
                    )}
                  </Box>
                </Grid>

                {uploading && (
                  <Grid item xs={12}>
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Uploading... {uploadProgress}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={uploadProgress} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: '#E0E0E0',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, #1976D2, #64B5F6)'
                          }
                        }} 
                      />
                    </Box>
                  </Grid>
                )}

                {uploadedDocument && (
                  <Grid item xs={12}>
                    <Alert 
                      severity="success" 
                      icon={<CheckCircleIcon />} 
                      sx={{ 
                        mb: 2,
                        borderRadius: 2,
                        '& .MuiAlert-icon': { color: '#2E7D32' }
                      }}
                    >
                      Document uploaded successfully!
                    </Alert>
                    <Paper sx={{ 
                      p: 2, 
                      bgcolor: '#E8F5E9', 
                      border: '1px solid #81C784',
                      borderRadius: 2
                    }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: '#2E7D32', fontWeight: 600 }}>
                        Uploaded Document Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="textSecondary">Document ID</Typography>
                          <Typography variant="body2" fontWeight={500}>{uploadedDocument.documentId}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="textSecondary">Status</Typography>
                          <Chip 
                            label={uploadedDocument.status || 'pending'} 
                            size="small" 
                            sx={{ 
                              height: 20, 
                              fontSize: '11px',
                              fontWeight: 500,
                              backgroundColor: '#FFE0B2',
                              color: '#E65100'
                            }} 
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="textSecondary">Filename</Typography>
                          <Typography variant="body2">{uploadedDocument.filename}</Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom color="#1976D2">
                Confirm Upload
              </Typography>
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 1, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="textSecondary">Candidate</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedCandidate?.firstName} {selectedCandidate?.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="textSecondary">Document Type</Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {documentTypes.find(t => t.value === documentTypeValue)?.label || documentTypeValue}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="textSecondary">Filename</Typography>
                    <Typography variant="body2">{documentFile?.name}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="textSecondary">File Size</Typography>
                    <Typography variant="body2">{formatFileSize(documentFile?.size)}</Typography>
                  </Grid>
                  {description && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary">Description</Typography>
                      <Typography variant="body2">{description}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
              
              <Alert severity="warning" icon={<WarningIcon />}>
                <Typography variant="body2">
                  Once uploaded, documents cannot be deleted. Please ensure you have selected the correct file.
                </Typography>
              </Alert>
            </Paper>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ borderBottom: 1, borderColor: '#E0E0E0', bgcolor: '#F8FAFC', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>Upload Document</Typography>
            <Typography variant="caption" color="textSecondary">Upload candidate documents for verification</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 4, px: 4 }}>
        {(error || success) && (
          <Alert severity={error ? 'error' : 'success'} onClose={() => error ? setError('') : setSuccess('')} sx={{ mb: 3 }}>
            {error || success}
          </Alert>
        )}
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>
        <Box sx={{ minHeight: 200 }}>{getStepContent(activeStep)}</Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: '#E0E0E0', bgcolor: '#F8FAFC' }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Box>
          <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>Back</Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleUploadDocument}
              disabled={uploading}
              startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
              sx={{ minWidth: 200 }}
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>Next</Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default UploadDocument;