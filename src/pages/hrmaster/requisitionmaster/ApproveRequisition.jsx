import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Alert,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Paper,
  CircularProgress,
  TextField,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormHelperText,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  Work as WorkIcon,
  MonetizationOn as MonetizationIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Description as DescriptionIcon,
  VerifiedUser as VerifiedUserIcon,
  Comment as CommentIcon,
  Fingerprint as FingerprintIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';
import SignaturePad from 'react-signature-canvas';

const ApproveRequisition = ({ open, onClose, onApprove, requisitionId }) => {
  const [requisition, setRequisition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [comments, setComments] = useState('');
  const [signature, setSignature] = useState(null);
  const [signaturePad, setSignaturePad] = useState(null);
  const [signatureError, setSignatureError] = useState('');
  const [commentsError, setCommentsError] = useState('');
  const [approveSuccess, setApproveSuccess] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(true);

  useEffect(() => {
    if (open && requisitionId) {
      fetchRequisitionDetails();
    }
  }, [open, requisitionId]);

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setSignature(null);
      setComments('');
      setSignatureError('');
      setCommentsError('');
      setApproveSuccess(false);
      setShowSignaturePad(true);
    }
  }, [open]);

  const fetchRequisitionDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/requisitions/${requisitionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setRequisition(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch requisition details');
      }
    } catch (err) {
      console.error('Error fetching requisition:', err);
      setError(err.response?.data?.message || 'Failed to fetch requisition details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert PNG to JPEG
  const convertPNGToJPEG = (pngDataUrl) => {
    return new Promise((resolve, reject) => {
      try {
        // Create an image element
        const img = new Image();
        img.onload = () => {
          // Create a canvas element
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw the image onto the canvas
          const ctx = canvas.getContext('2d');
          
          // Fill with white background (since JPEG doesn't support transparency)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw the signature on top of white background
          ctx.drawImage(img, 0, 0);
          
          // Convert to JPEG format with 0.9 quality (90%)
          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          resolve(jpegDataUrl);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load signature image'));
        };
        
        img.src = pngDataUrl;
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleApprove = async () => {
    // Validate signature
   if (!signaturePad || signaturePad.isEmpty()) {
      setSignatureError('Signature is required');
      return;
    }

    // Validate comments (optional but recommended)
    if (comments.trim().length < 5) {
      setCommentsError('Please provide meaningful comments (at least 5 characters)');
      return;
    }

    setApproving(true);
    setError('');
    setSignatureError('');
    setCommentsError('');

    try {
      // Get signature data URL (PNG format from SignaturePad)
      let signatureData = signature;
      let pngSignatureData = null;
      
      if (signaturePad && !signaturePad.isEmpty()) {
        pngSignatureData = signaturePad.toDataURL('image/png');
      } else if (signature) {
        pngSignatureData = signature;
      }

      // Convert PNG to JPEG if we have signature data
      let jpegSignatureData = null;
      if (pngSignatureData) {
        try {
          jpegSignatureData = await convertPNGToJPEG(pngSignatureData);
        } catch (conversionError) {
          console.error('Error converting signature to JPEG:', conversionError);
          setError('Failed to process signature. Please try again.');
          setApproving(false);
          return;
        }
      }

      const token = localStorage.getItem('token');
      const submitData = {
        signature: jpegSignatureData, // Send JPEG format
        comments: comments.trim(),
        signatureFormat: 'jpeg' // Optional: indicate format to backend
      };

      const response = await axios.post(`${BASE_URL}/api/requisitions/${requisitionId}/approve`, submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccess(response.data.message || 'Requisition approved successfully');
        setApproveSuccess(true);
        
        // Call the onApprove callback with the response data
        onApprove(response.data.data);
        
        // Close dialog after short delay to show success message
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to approve requisition');
      }
    } catch (err) {
      console.error('Error approving requisition:', err);
      setError(err.response?.data?.message || 'Failed to approve requisition. Please try again.');
    } finally {
      setApproving(false);
    }
  };

  // Alternative method if you want to compress JPEG further or adjust quality
  const convertPNGToJPEGWithOptions = async (pngDataUrl, quality = 0.85, maxWidth = 800) => {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          
          // Create canvas with calculated dimensions
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          
          // Fill with white background
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw scaled signature
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to JPEG with specified quality
          const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(jpegDataUrl);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load signature image'));
        };
        
        img.src = pngDataUrl;
      } catch (error) {
        reject(error);
      }
    });
  };

  // If you want to use the alternative method with compression, replace the convertPNGToJPEG function above with this one
  // and uncomment the line below in handleApprove

  const handleClearSignature = () => {
    if (signaturePad) {
      signaturePad.clear();
    }
    setSignature(null);
    setSignatureError('');
  };

  const handleClose = () => {
    setRequisition(null);
    setError('');
    setSuccess('');
    setApproveSuccess(false);
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#F44336',
      critical: '#9C27B0'
    };
    return colors[priority?.toLowerCase()] || '#757575';
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: { bg: '#FFF3E0', color: '#E65100' },
      pending_approval: { bg: '#FFF3E0', color: '#E65100' },
      approved: { bg: '#E8F5E9', color: '#2E7D32' },
      rejected: { bg: '#FFEBEE', color: '#C62828' },
      filled: { bg: '#E3F2FD', color: '#1565C0' },
      closed: { bg: '#F5F5F5', color: '#616161' }
    };
    return colors[status?.toLowerCase()] || { bg: '#F5F5F5', color: '#616161' };
  };

  const renderRequisitionSummary = () => (
    <Paper sx={{ 
      p: 2, 
      backgroundColor: '#F8FAFC', 
      borderRadius: 2,
      border: '1px solid #E0E0E0'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#101010', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon sx={{ color: '#1976D2', fontSize: 20 }} />
          Requisition Details
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={requisition.requisitionId}
            size="small"
            sx={{
              backgroundColor: '#E3F2FD',
              color: '#1976D2',
              fontWeight: 500
            }}
          />
          <Chip
            label={requisition.status?.toUpperCase() || 'DRAFT'}
            size="small"
            sx={{
              backgroundColor: getStatusColor(requisition.status).bg,
              color: getStatusColor(requisition.status).color,
              fontWeight: 500
            }}
          />
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <List dense disablePadding>
            <ListItem disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <BusinessIcon sx={{ color: '#666', fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography variant="caption" sx={{ color: '#666' }}>Department</Typography>}
                secondary={<Typography variant="body2" sx={{ color: '#101010', fontWeight: 500 }}>{requisition.department || 'N/A'}</Typography>}
              />
            </ListItem>
            <ListItem disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <LocationIcon sx={{ color: '#666', fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography variant="caption" sx={{ color: '#666' }}>Location</Typography>}
                secondary={<Typography variant="body2" sx={{ color: '#101010', fontWeight: 500 }}>{requisition.location || 'N/A'}</Typography>}
              />
            </ListItem>
            <ListItem disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <WorkIcon sx={{ color: '#666', fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography variant="caption" sx={{ color: '#666' }}>Position</Typography>}
                secondary={<Typography variant="body2" sx={{ color: '#101010', fontWeight: 500 }}>{requisition.positionTitle || 'N/A'}</Typography>}
              />
            </ListItem>
            <ListItem disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <PersonIcon sx={{ color: '#666', fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography variant="caption" sx={{ color: '#666' }}>Requested By</Typography>}
                secondary={<Typography variant="body2" sx={{ color: '#101010', fontWeight: 500 }}>{requisition.createdByName || 'N/A'}</Typography>}
              />
            </ListItem>
          </List>
        </Grid>
        <Grid item xs={12} sm={6}>
          <List dense disablePadding>
            <ListItem disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <MonetizationIcon sx={{ color: '#666', fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography variant="caption" sx={{ color: '#666' }}>Budget Range</Typography>}
                secondary={<Typography variant="body2" sx={{ color: '#101010', fontWeight: 500 }}>
                  ₹{requisition.budgetMin?.toLocaleString()} - ₹{requisition.budgetMax?.toLocaleString()}
                </Typography>}
              />
            </ListItem>
            <ListItem disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <SchoolIcon sx={{ color: '#666', fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography variant="caption" sx={{ color: '#666' }}>Education</Typography>}
                secondary={<Typography variant="body2" sx={{ color: '#101010', fontWeight: 500 }}>{requisition.education || 'N/A'}</Typography>}
              />
            </ListItem>
            <ListItem disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <TrendingUpIcon sx={{ color: '#666', fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography variant="caption" sx={{ color: '#666' }}>Experience</Typography>}
                secondary={<Typography variant="body2" sx={{ color: '#101010', fontWeight: 500 }}>{requisition.experienceYears || 0} years</Typography>}
              />
            </ListItem>
            <ListItem disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CalendarIcon sx={{ color: '#666', fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography variant="caption" sx={{ color: '#666' }}>Target Date</Typography>}
                secondary={<Typography variant="body2" sx={{ color: '#101010', fontWeight: 500 }}>{formatDate(requisition.targetHireDate)}</Typography>}
              />
            </ListItem>
          </List>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          label={`${requisition.noOfPositions || 0} Positions`}
          size="small"
          sx={{ backgroundColor: '#E3F2FD', color: '#1976D2' }}
        />
        <Chip
          label={requisition.employmentType || 'N/A'}
          size="small"
          sx={{ backgroundColor: '#F3E5F5', color: '#7B1FA2' }}
        />
        <Chip
          label={requisition.priority || 'MEDIUM'}
          size="small"
          sx={{
            backgroundColor: `${getPriorityColor(requisition.priority)}20`,
            color: getPriorityColor(requisition.priority),
            fontWeight: 500
          }}
        />
        <Chip
          label={requisition.reasonForHire || 'N/A'}
          size="small"
          sx={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}
        />
      </Box>

      {/* Skills */}
      {requisition.skills && requisition.skills.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
            Required Skills
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {requisition.skills.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                size="small"
                sx={{
                  backgroundColor: '#E3F2FD',
                  color: '#1976D2',
                  fontSize: '11px',
                  height: 24
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Justification Preview */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
          Justification
        </Typography>
        <Typography variant="body2" sx={{ color: '#333', fontStyle: 'italic', backgroundColor: '#FFF', p: 1, borderRadius: 1, border: '1px solid #E0E0E0' }}>
          "{requisition.justification?.substring(0, 150)}{requisition.justification?.length > 150 ? '...' : ''}"
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VerifiedUserIcon sx={{ color: '#2E7D32' }} />
          <div style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#101010',
            paddingTop: '8px'
          }}>
            Approve Requisition
          </div>
          {requisition && (
            <Chip
              label={requisition.requisitionId}
              size="small"
              sx={{
                ml: 1,
                backgroundColor: '#E3F2FD',
                color: '#1976D2',
                fontWeight: 500,
                fontSize: '12px'
              }}
            />
          )}
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#666' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#1976D2' }} />
          </Box>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 1,
              mt: 2,
              '& .MuiAlert-icon': {
                alignItems: 'center'
              }
            }}
          >
            {error}
          </Alert>
        ) : success ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: '#4CAF50', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#101010', mb: 1 }}>
              Successfully Approved!
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {success}
            </Typography>
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#F8FAFC', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#101010', mb: 1 }}>
                Approval Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#666' }}>Approved By</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{requisition?.createdByName || 'You'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#666' }}>Date</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDateTime(new Date().toISOString())}</Typography>
                </Grid>
              </Grid>
            </Box>
            <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 2 }}>
              Redirecting...
            </Typography>
          </Box>
        ) : requisition ? (
          <Stack spacing={3}>
            {/* Warning for wrong status */}
            {requisition.status !== 'pending_approval' && requisition.status !== 'draft' && (
              <Alert 
                severity="warning"
                icon={<InfoIcon />}
                sx={{ 
                  borderRadius: 1,
                  backgroundColor: '#FFF3E0',
                  '& .MuiAlert-icon': {
                    color: '#E65100'
                  }
                }}
              >
                This requisition is currently in <strong>{requisition.status?.replace('_', ' ').toUpperCase()}</strong> status. 
                Only requisitions pending approval can be approved.
              </Alert>
            )}

            {/* Info message for correct status */}
            {requisition.status === 'pending_approval' && (
              <Alert 
                severity="info"
                icon={<InfoIcon />}
                sx={{ 
                  borderRadius: 1,
                  backgroundColor: '#E3F2FD',
                  '& .MuiAlert-icon': {
                    color: '#1976D2'
                  }
                }}
              >
                This requisition is ready for approval. Please review the details and provide your signature below.
              </Alert>
            )}

            {/* Requisition Summary */}
            {renderRequisitionSummary()}

            {/* Approval Form */}
            <Paper sx={{ 
              p: 3, 
              borderRadius: 2,
              border: '1px solid #E0E0E0'
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#101010', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <VerifiedUserIcon sx={{ color: '#2E7D32' }} />
                Approval Signature
              </Typography>

              <Stack spacing={3}>
                {/* Signature Pad */}
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
                    Digital Signature <span style={{ color: '#F44336' }}>*</span>
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      border: signatureError ? '1px solid #F44336' : '1px solid #E0E0E0',
                      borderRadius: 1,
                      overflow: 'hidden',
                      backgroundColor: '#FFF'
                    }}
                  >
                    {showSignaturePad ? (
                      <SignaturePad
                        ref={(ref) => setSignaturePad(ref)}
                        canvasProps={{
                          width: 500,
                          height: 200,
                          className: 'signature-pad',
                          style: {
                            width: '100%',
                            height: '200px',
                            cursor: 'crosshair'
                          }
                        }}
                        backgroundColor="rgb(255,255,255)"
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: '200px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#F5F5F5'
                        }}
                      >
                        <Typography variant="body2" sx={{ color: '#999' }}>
                          Signature pad hidden
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <FormHelperText error={!!signatureError}>
                      {signatureError || 'Draw your signature in the box above'}
                    </FormHelperText>
                    <Box>
                      <Button
                        size="small"
                        onClick={handleClearSignature}
                        sx={{ mr: 1, color: '#666' }}
                      >
                        Clear
                      </Button>
                      <Button
                        size="small"
                        onClick={() => setShowSignaturePad(!showSignaturePad)}
                        sx={{ color: '#1976D2' }}
                      >
                        {showSignaturePad ? 'Hide' : 'Show'} Pad
                      </Button>
                    </Box>
                  </Box>
                </Box>

                {/* Comments */}
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
                    Approval Comments <span style={{ color: '#F44336' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Please provide your comments and justification for approval..."
                    value={comments}
                    onChange={(e) => {
                      setComments(e.target.value);
                      if (commentsError) setCommentsError('');
                    }}
                    error={!!commentsError}
                    helperText={commentsError || 'Minimum 5 characters'}
                    disabled={approving}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CommentIcon sx={{ color: '#999', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                      }
                    }}
                  />
                </Box>

                {/* Preview of approval */}
                {(signaturePad && !signaturePad.isEmpty() || signature) && comments.trim().length >= 5 && (
                  <Paper sx={{ 
                    p: 2, 
                    backgroundColor: '#E8F5E9', 
                    borderRadius: 2,
                    border: '1px solid #4CAF50'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CheckCircleIcon sx={{ color: '#2E7D32', fontSize: 20 }} />
                      <Typography variant="subtitle2" sx={{ color: '#2E7D32' }}>
                        Ready for Approval
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#1B5E20' }}>
                      Your signature and comments are complete. Click "Approve Requisition" to confirm.
                    </Typography>
                  </Paper>
                )}
              </Stack>
            </Paper>
          </Stack>
        ) : null}
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        pb: 3, 
        borderTop: '1px solid #E0E0E0', 
        pt: 2,
        backgroundColor: '#F8FAFC',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <Box>
          {requisition && requisition.status === 'pending_approval' && (
            <Tooltip title="Review requisition details before approving">
              <InfoIcon sx={{ color: '#1976D2', fontSize: 20, cursor: 'help' }} />
            </Tooltip>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            onClick={handleClose}
            disabled={approving || approveSuccess}
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
            onClick={handleApprove}
            disabled={
              loading || 
              approving || 
              approveSuccess || 
              (requisition && requisition.status !== 'pending_approval' && requisition.status !== 'draft') ||
              (!signature && signaturePad?.isEmpty()) ||
              comments.trim().length < 5
            }
            startIcon={approving ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
            sx={{
              borderRadius: 1,
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 500,
              backgroundColor: '#2E7D32',
              '&:hover': {
                backgroundColor: '#1B5E20'
              },
              '&.Mui-disabled': {
                backgroundColor: '#E0E0E0'
              }
            }}
          >
            {approving ? 'Approving...' : 'Approve Requisition'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ApproveRequisition;