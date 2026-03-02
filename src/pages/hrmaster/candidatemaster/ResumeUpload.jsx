import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Paper,
  LinearProgress,
  Chip,
  Divider,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const PRIMARY_BLUE = '#00B4D8';
const SUCCESS_COLOR = '#10B981';
const WARNING_COLOR = '#F59E0B';
const ERROR_COLOR = '#EF4444';

const ResumeUpload = ({ open, onClose, onUpload, candidateId }) => {
  const [file, setFile] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(candidateId || '');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadedCandidate, setUploadedCandidate] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);

  // Update candidateId when prop changes
  React.useEffect(() => {
    if (candidateId) {
      setSelectedCandidateId(candidateId);
    }
  }, [candidateId]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (file) => {
    // Check file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or Word document (DOC, DOCX)');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    setError('');
    setFile(file);
    setUploadProgress(0);
    setSuccess(false);
    setUploadedCandidate(null);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError('');
    setUploadProgress(0);
    setSuccess(false);
    setUploadedCandidate(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    
    // Add candidateId if provided
    if (selectedCandidateId) {
      formData.append('candidateId', selectedCandidateId);
    }

    try {
      setLoading(true);
      setError('');
      setUploadProgress(0);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${BASE_URL}/api/candidates/upload-resume`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setUploadedCandidate(response.data.data.candidate);
        setUploadProgress(100);
        
        // Show success and then close after 2 seconds
        setTimeout(() => {
          onUpload(response.data.data);
          handleClose();
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to upload resume');
      }
    } catch (err) {
      console.error('Error uploading resume:', err);
      
      if (err.response) {
        if (err.response.status === 413) {
          setError('File too large. Maximum size is 5MB.');
        } else if (err.response.status === 415) {
          setError('Unsupported file type. Please upload PDF or Word documents.');
        } else {
          setError(err.response.data?.message || 'Failed to upload resume');
        }
      } else if (err.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('Error: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFile(null);
      setSelectedCandidateId(candidateId || '');
      setError('');
      setSuccess(false);
      setUploadProgress(0);
      setUploadedCandidate(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #e2e8f0',
        bgcolor: '#f8fafc'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUploadIcon sx={{ color: PRIMARY_BLUE }} />
          <Typography variant="h6" fontWeight={600} color={PRIMARY_BLUE}>
            Upload Resume
          </Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={loading} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              onClose={() => setError('')}
              sx={{ borderRadius: 1.5 }}
            >
              {error}
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert 
              severity="success" 
              sx={{ borderRadius: 1.5 }}
              icon={<CheckCircleIcon />}
            >
              Resume uploaded successfully! Creating candidate...
            </Alert>
          )}

          {/* Upload Area */}
          {!success && (
            <>
              <Paper
                sx={{
                  p: 3,
                  border: '2px dashed',
                  borderColor: dragActive ? PRIMARY_BLUE : error ? ERROR_COLOR : '#cbd5e1',
                  bgcolor: dragActive ? alpha(PRIMARY_BLUE, 0.04) : error ? alpha(ERROR_COLOR, 0.04) : '#f8fafc',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                  position: 'relative'
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  disabled={loading}
                />

                {!file ? (
                  <Box>
                    <CloudUploadIcon sx={{ fontSize: 48, color: PRIMARY_BLUE, mb: 1 }} />
                    <Typography variant="body1" fontWeight={500} gutterBottom>
                      Click to upload or drag and drop
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      PDF, DOC, DOCX (Max 5MB)
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <FileIcon sx={{ fontSize: 32, color: PRIMARY_BLUE }} />
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="body2" fontWeight={500}>
                          {file.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatFileSize(file.size)}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      disabled={loading}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Paper>

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      Uploading...
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {uploadProgress}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress} 
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: alpha(PRIMARY_BLUE, 0.1),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: PRIMARY_BLUE,
                        borderRadius: 3
                      }
                    }}
                  />
                </Box>
              )}

              {/* Candidate ID Display - Made Read-Only */}
              {selectedCandidateId ? (
                <TextField
                  fullWidth
                  size="small"
                  label="Candidate ID"
                  value={selectedCandidateId}
                  disabled={true}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon sx={{ fontSize: 18, color: '#64748B' }} />
                      </InputAdornment>
                    ),
                    readOnly: true,
                    sx: {
                      backgroundColor: '#f5f5f5',
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: '#1976D2',
                        fontWeight: 500
                      }
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5
                    }
                  }}
                />
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  label="Candidate ID (Optional for new candidate)"
                  value=""
                  disabled={true}
                  placeholder="A new candidate will be created"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon sx={{ fontSize: 18, color: '#64748B' }} />
                      </InputAdornment>
                    ),
                    readOnly: true,
                    sx: {
                      backgroundColor: '#f5f5f5',
                      color: '#666'
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5
                    }
                  }}
                />
              )}

              {/* Info Message */}
              <Alert severity="info" sx={{ borderRadius: 1.5 }}>
                <Typography variant="caption">
                  The system will automatically parse the resume and extract candidate information.
                  {selectedCandidateId ? (
                    <strong> The resume will be added to the existing candidate.</strong>
                  ) : (
                    <strong> A new candidate will be created from the parsed information.</strong>
                  )}
                </Typography>
              </Alert>
            </>
          )}

          {/* Uploaded Candidate Preview */}
          {uploadedCandidate && success && (
            <Paper sx={{ p: 2, bgcolor: alpha(SUCCESS_COLOR, 0.04), borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom color={SUCCESS_COLOR}>
                {selectedCandidateId ? 'Candidate Updated Successfully' : 'Candidate Created Successfully'}
              </Typography>
              
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ fontSize: 16, color: '#64748B' }} />
                  <Typography variant="body2">
                    <strong>Name:</strong> {uploadedCandidate.fullName}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon sx={{ fontSize: 16, color: '#64748B' }} />
                  <Typography variant="body2">
                    <strong>Email:</strong> {uploadedCandidate.email}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon sx={{ fontSize: 16, color: '#64748B' }} />
                  <Typography variant="body2">
                    <strong>Phone:</strong> {uploadedCandidate.phone}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Box>
                  <Typography variant="caption" color="textSecondary" gutterBottom display="block">
                    Candidate ID: {uploadedCandidate.candidateId}
                  </Typography>
                  <Chip
                    label={uploadedCandidate.status}
                    size="small"
                    sx={{
                      bgcolor: alpha(PRIMARY_BLUE, 0.1),
                      color: PRIMARY_BLUE,
                      height: 20,
                      fontSize: '10px'
                    }}
                  />
                </Box>
              </Stack>
            </Paper>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ 
        p: 2, 
        borderTop: '1px solid #e2e8f0',
        bgcolor: '#f8fafc',
        gap: 1
      }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
          sx={{ 
            borderRadius: 1.5, 
            textTransform: 'none',
            color: '#64748B'
          }}
        >
          Cancel
        </Button>
        
        {!success && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!file || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              bgcolor: PRIMARY_BLUE,
              '&:hover': { bgcolor: '#0e7490' },
              minWidth: 120
            }}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ResumeUpload;