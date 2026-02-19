import React, { useState, useCallback } from 'react';
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
  LinearProgress,
  IconButton
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const ResumeUpload = ({ open, onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadedData, setUploadedData] = useState(null);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      // Check file type
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF or DOC file only');
        return;
      }

      // Check file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }

      setFile(selectedFile);
      setError('');
      setSuccess('');
      setUploadedData(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  // Remove selected file
  const handleRemoveFile = () => {
    setFile(null);
    setError('');
    setSuccess('');
    setUploadedData(null);
    setUploadProgress(0);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/api/candidates/upload-resume`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data.success) {
        setSuccess('Resume uploaded and parsed successfully!');
        setUploadedData(response.data.data);
        
        // Call onUpload callback after short delay to show success message
        setTimeout(() => {
          onUpload(response.data.data);
          handleClose();
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to upload resume');
      }
    } catch (err) {
      console.error('Error uploading resume:', err);
      setError(err.response?.data?.message || 'Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Reset and close
  const handleClose = () => {
    setFile(null);
    setError('');
    setSuccess('');
    setUploadedData(null);
    setUploadProgress(0);
    onClose();
  };

  // Format file size
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
        borderBottom: '1px solid #E0E0E0', 
        pb: 2,
        backgroundColor: '#F8FAFC',
        position: 'sticky',
        top: 0,
        zIndex: 1
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
            <CloudUploadIcon sx={{ color: '#1976D2' }} />
            Upload Resume
          </div>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {/* Dropzone Area */}
          <Paper
            {...getRootProps()}
            elevation={0}
            sx={{
              p: 4,
              backgroundColor: '#F9F9F9',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: isDragActive ? '#1976D2' : error ? '#f44336' : '#E0E0E0',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#1976D2',
                backgroundColor: '#F5F5F5'
              },
              textAlign: 'center'
            }}
          >
            <input {...getInputProps()} />
            
            {!file ? (
              <Stack spacing={2} alignItems="center">
                <CloudUploadIcon sx={{ fontSize: 48, color: '#9E9E9E' }} />
                <Typography variant="h6" sx={{ color: '#424242', fontWeight: 500 }}>
                  {isDragActive ? 'Drop the file here' : 'Drag & drop resume here'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  or click to browse
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                  Supports: PDF, DOC, DOCX (Max 5MB)
                </Typography>
              </Stack>
            ) : (
              <Box sx={{ position: 'relative' }}>
                <Stack spacing={2} alignItems="center">
                  <DescriptionIcon sx={{ fontSize: 40, color: '#1976D2' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#101010' }}>
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {formatFileSize(file.size)}
                  </Typography>
                  
                  {!uploading && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      sx={{ mt: 1, textTransform: 'none' }}
                    >
                      Remove File
                    </Button>
                  )}
                </Stack>
              </Box>
            )}
          </Paper>

          {/* Upload Progress */}
          {uploading && (
            <Box sx={{ width: '100%' }}>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#E3F2FD',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#1976D2'
                  }
                }}
              />
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                Uploading... {uploadProgress}%
              </Typography>
            </Box>
          )}

          {/* Uploaded Data Preview */}
          {uploadedData && (
            <Paper elevation={0} sx={{ p: 2, backgroundColor: '#F5F5F5', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#101010', mb: 1 }}>
                Parsed Information:
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Name:</strong> {uploadedData.candidate.fullName}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {uploadedData.candidate.email}
                </Typography>
                <Typography variant="body2">
                  <strong>Phone:</strong> {uploadedData.candidate.phone}
                </Typography>
                <Typography variant="body2">
                  <strong>Skills:</strong> {uploadedData.candidate.skills.length || 'Not detected'}
                </Typography>
              </Stack>
            </Paper>
          )}

          {/* Error Message */}
          {error && (
            <Alert 
              severity="error" 
              icon={<ErrorIcon />}
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

          {/* Success Message */}
          {success && (
            <Alert 
              severity="success" 
              icon={<CheckCircleIcon />}
              sx={{ 
                borderRadius: 1,
                '& .MuiAlert-icon': {
                  alignItems: 'center'
                }
              }}
            >
              {success}
            </Alert>
          )}

          {/* File Requirements Info */}
          <Paper elevation={0} sx={{ p: 2, backgroundColor: '#F5F5F5', borderRadius: 2 }}>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
              <strong>File Requirements:</strong>
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
              • Supported formats: PDF, DOC, DOCX
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
              • Maximum file size: 5MB
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
              • Resume will be parsed to extract candidate information
            </Typography>
          </Paper>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        pb: 3, 
        borderTop: '1px solid #E0E0E0', 
        pt: 2,
        backgroundColor: '#F8FAFC',
        position: 'sticky',
        bottom: 0,
        zIndex: 1
      }}>
        <Button 
          onClick={handleClose} 
          disabled={uploading}
          sx={{
            borderRadius: 1,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || uploading}
          startIcon={uploading ? null : <CloudUploadIcon />}
          sx={{
            borderRadius: 1,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500,
            backgroundColor: '#1976D2',
            '&:hover': {
              backgroundColor: '#1565C0'
            }
          }}
        >
          {uploading ? 'Uploading...' : 'Upload & Parse'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResumeUpload;