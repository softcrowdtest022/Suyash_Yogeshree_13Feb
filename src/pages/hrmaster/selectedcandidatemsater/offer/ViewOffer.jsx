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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Card,
  CardContent,
  Badge,
  LinearProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  AccessTime as AccessTimeIcon,
  Verified as VerifiedIcon,
  Link as LinkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import BASE_URL from '../../../../config/Config';

const ViewOffer = ({ open, onClose, offerToken = null, offerData = null }) => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [offerDetails, setOfferDetails] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  const steps = [
    'Offer Overview',
    'Compensation Details',
    'Terms & Benefits'
  ];

  useEffect(() => {
    if (open && (offerToken || offerData)) {
      if (offerData) {
        // If offer data is directly provided
        setOfferDetails(offerData);
        extractCandidateInfo(offerData);
      } else if (offerToken) {
        // If token is provided, fetch offer details
        fetchOfferByToken(offerToken);
      }
    }
  }, [open, offerToken, offerData]);

  useEffect(() => {
    // Calculate time remaining for token expiry
    if (tokenExpiry) {
      const interval = setInterval(() => {
        const now = new Date();
        const expiry = new Date(tokenExpiry);
        const diff = expiry - now;

        if (diff <= 0) {
          setTokenValid(false);
          setTimeRemaining('Expired');
          clearInterval(interval);
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          
          if (days > 0) {
            setTimeRemaining(`${days}d ${hours}h remaining`);
          } else if (hours > 0) {
            setTimeRemaining(`${hours}h ${minutes}m remaining`);
          } else {
            setTimeRemaining(`${minutes}m remaining`);
          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [tokenExpiry]);

  const fetchOfferByToken = async (token) => {
    setLoading(true);
    setError('');
    
    try {
      // In a real implementation, you might not need a token for this endpoint
      // or you might pass it in headers
      const response = await axios.get(`${BASE_URL}/api/offers/view/${token}`);
      
      if (response.data.success) {
        setOfferDetails(response.data.data);
        extractCandidateInfo(response.data.data);
        setTokenValid(true);
        
        // If token info is available in response
        if (response.data.tokenExpiry) {
          setTokenExpiry(response.data.tokenExpiry);
        }
      }
    } catch (err) {
      console.error('Error fetching offer:', err);
      setError(err.response?.data?.message || 'Failed to fetch offer details');
      setTokenValid(false);
    } finally {
      setLoading(false);
    }
  };

  const extractCandidateInfo = (data) => {
    // Extract candidate name from the data
    if (data.candidateName) {
      const nameParts = data.candidateName.split(' ');
      setCandidateDetails({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        fullName: data.candidateName,
        email: data.candidateEmail || 'Not available',
        phone: data.candidatePhone || 'Not available'
      });
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
  };

  const handleClose = () => {
    setActiveStep(0);
    setOfferDetails(null);
    setCandidateDetails(null);
    setError('');
    setSuccess('');
    setCopied(false);
    onClose();
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/offer/view/${offerToken || ''}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    // In a real implementation, this would trigger PDF download
    window.open(`${BASE_URL}/offers/${offer?.offerId}/pdf?token=${offerToken}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAcceptOffer = async () => {
    setAcceptLoading(true);
    setError('');
    
    try {
      // In a real implementation, this would call the accept endpoint
      const response = await axios.post(
        `${BASE_URL}/offers/${offer?.offerId}/accept`,
        { token: offerToken }
      );
      
      if (response.data.success) {
        setSuccess('Offer accepted successfully!');
        // Refresh offer details or update status
      }
    } catch (err) {
      console.error('Error accepting offer:', err);
      setError(err.response?.data?.message || 'Failed to accept offer');
    } finally {
      setAcceptLoading(false);
    }
  };

  const handleRejectOffer = async () => {
    setRejectLoading(true);
    setError('');
    
    try {
      // In a real implementation, this would call the reject endpoint
      const response = await axios.post(
        `${BASE_URL}/offers/${offer?.offerId}/reject`,
        { token: offerToken }
      );
      
      if (response.data.success) {
        setSuccess('Offer rejected');
        // Refresh offer details or update status
      }
    } catch (err) {
      console.error('Error rejecting offer:', err);
      setError(err.response?.data?.message || 'Failed to reject offer');
    } finally {
      setRejectLoading(false);
    }
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

  const calculatePercentage = (value, total) => {
    return ((value / total) * 100).toFixed(1);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            {/* Company Header Card */}
            <Paper sx={{ p: 3, bgcolor: '#003366', color: 'white' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Suyash Enterprises
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Offer of Employment
                  </Typography>
                </Box>
                <Chip 
                  label="CONFIDENTIAL" 
                  size="small" 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    fontWeight: 600,
                    border: '1px solid rgba(255,255,255,0.3)'
                  }} 
                />
              </Box>
            </Paper>

            {/* Token Validity Banner */}
            {tokenExpiry && (
              <Alert 
                severity={tokenValid ? "info" : "warning"}
                icon={tokenValid ? <AccessTimeIcon /> : <WarningIcon />}
                sx={{ 
                  bgcolor: tokenValid ? '#E3F2FD' : '#FFEBEE',
                  border: tokenValid ? '1px solid #90CAF9' : '1px solid #FFCDD2'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <Typography variant="body2">
                    {tokenValid 
                      ? `This offer link is valid. ${timeRemaining || 'Loading...'}`
                      : 'This offer link has expired. Please contact HR for assistance.'}
                  </Typography>
                  {tokenValid && (
                    <LinearProgress 
                      variant="determinate" 
                      value={75} 
                      sx={{ width: 100, ml: 2, borderRadius: 1 }}
                    />
                  )}
                </Box>
              </Alert>
            )}

            {/* Candidate Greeting Card */}
            <Paper sx={{ p: 3, bgcolor: '#F8FAFC', border: '1px solid #E0E0E0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#1976D2', width: 64, height: 64 }}>
                  {candidateDetails?.firstName?.charAt(0)}{candidateDetails?.lastName?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    Dear {candidateDetails?.fullName || 'Candidate'},
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    We are pleased to offer you the position at Suyash Enterprises
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Offer Summary Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                📋 Offer Summary
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Badge badgeContent={<VerifiedIcon sx={{ fontSize: 16, color: '#4CAF50' }} />}>
                      <WorkIcon color="primary" />
                    </Badge>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Position
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {offerDetails?.position || offerDetails?.offerDetails?.designation || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <BusinessIcon color="primary" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Department
                      </Typography>
                      <Typography variant="body1">
                        {offerDetails?.department || offerDetails?.offerDetails?.department || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <LocationIcon color="primary" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Location
                      </Typography>
                      <Typography variant="body1">
                        {offerDetails?.offerDetails?.location || 'Plant Unit A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <CalendarIcon color="primary" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Joining Date
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatDate(offerDetails?.joiningDate || offerDetails?.offerDetails?.joiningDate)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PersonIcon color="primary" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Reporting To
                      </Typography>
                      <Typography variant="body1">
                        {offerDetails?.offerDetails?.reportingTo || 'Production Manager'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <AccessTimeIcon color="primary" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Employment Type
                      </Typography>
                      <Typography variant="body1">
                        {offerDetails?.offerDetails?.employmentType || 'Permanent'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Offer ID
                      </Typography>
                      <Typography variant="body2">
                        {offerDetails?.offerId || 'N/A'}
                      </Typography>
                    </Box>
                    <Chip 
                      label="Valid Offer" 
                      color="success" 
                      size="small"
                      icon={<CheckCircleIcon />}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            {/* CTC Breakdown Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                💰 Compensation Breakdown
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
                <Table>
                  <TableBody>
                    <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>Component</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Monthly (₹)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Annual (₹)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>% of CTC</TableCell>
                    </TableRow>
                    
                    <TableRow>
                      <TableCell component="th" scope="row">Basic Salary</TableCell>
                      <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.basic)}</TableCell>
                      <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.basic * 12)}</TableCell>
                      <TableCell align="right">
                        {calculatePercentage(offerDetails?.ctcDetails?.basic * 12, offerDetails?.ctcDetails?.totalCtc)}%
                      </TableCell>
                    </TableRow>
                    
                    <TableRow>
                      <TableCell component="th" scope="row">HRA</TableCell>
                      <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.hra)}</TableCell>
                      <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.hra * 12)}</TableCell>
                      <TableCell align="right">
                        {calculatePercentage(offerDetails?.ctcDetails?.hra * 12, offerDetails?.ctcDetails?.totalCtc)}%
                      </TableCell>
                    </TableRow>
                    
                    <TableRow>
                      <TableCell component="th" scope="row">Conveyance Allowance</TableCell>
                      <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.conveyanceAllowance)}</TableCell>
                      <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.conveyanceAllowance * 12)}</TableCell>
                      <TableCell align="right">
                        {calculatePercentage(offerDetails?.ctcDetails?.conveyanceAllowance * 12, offerDetails?.ctcDetails?.totalCtc)}%
                      </TableCell>
                    </TableRow>
                    
                    <TableRow>
                      <TableCell component="th" scope="row">Medical Allowance</TableCell>
                      <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.medicalAllowance)}</TableCell>
                      <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.medicalAllowance * 12)}</TableCell>
                      <TableCell align="right">
                        {calculatePercentage(offerDetails?.ctcDetails?.medicalAllowance * 12, offerDetails?.ctcDetails?.totalCtc)}%
                      </TableCell>
                    </TableRow>
                    
                    <TableRow>
                      <TableCell component="th" scope="row">Special Allowance</TableCell>
                      <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.specialAllowance)}</TableCell>
                      <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.specialAllowance * 12)}</TableCell>
                      <TableCell align="right">
                        {calculatePercentage(offerDetails?.ctcDetails?.specialAllowance * 12, offerDetails?.ctcDetails?.totalCtc)}%
                      </TableCell>
                    </TableRow>
                    
                    <TableRow sx={{ bgcolor: '#E3F2FD' }}>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>Gross Salary</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(offerDetails?.ctcDetails?.gross)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(offerDetails?.ctcDetails?.gross * 12)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {calculatePercentage(offerDetails?.ctcDetails?.gross * 12, offerDetails?.ctcDetails?.totalCtc)}%
                      </TableCell>
                    </TableRow>
                    
                    <TableRow>
                      <TableCell component="th" scope="row">Bonus (Annual)</TableCell>
                      <TableCell align="right">-</TableCell>
                      <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.bonus)}</TableCell>
                      <TableCell align="right">
                        {calculatePercentage(offerDetails?.ctcDetails?.bonus, offerDetails?.ctcDetails?.totalCtc)}%
                      </TableCell>
                    </TableRow>
                    
                    <TableRow>
                      <TableCell component="th" scope="row">Employer PF (Annual)</TableCell>
                      <TableCell align="right">-</TableCell>
                      <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.employerPf)}</TableCell>
                      <TableCell align="right">
                        {calculatePercentage(offerDetails?.ctcDetails?.employerPf, offerDetails?.ctcDetails?.totalCtc)}%
                      </TableCell>
                    </TableRow>
                    
                    <TableRow>
                      <TableCell component="th" scope="row">Gratuity (Annual)</TableCell>
                      <TableCell align="right">-</TableCell>
                      <TableCell align="right">{formatCurrency(offerDetails?.ctcDetails?.gratuity)}</TableCell>
                      <TableCell align="right">
                        {calculatePercentage(offerDetails?.ctcDetails?.gratuity, offerDetails?.ctcDetails?.totalCtc)}%
                      </TableCell>
                    </TableRow>
                    
                    <TableRow sx={{ bgcolor: '#1976D2' }}>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 700, color: 'white' }}>TOTAL CTC</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'white' }}>-</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'white', fontSize: '1.2rem' }}>
                        {formatCurrency(offerDetails?.ctcDetails?.totalCtc)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'white' }}>100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* CTC Visualization */}
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 2 }}>
                CTC Distribution
              </Typography>
              
              <Box sx={{ display: 'flex', height: 30, borderRadius: 1, overflow: 'hidden', mb: 3 }}>
                <Box sx={{ width: '30%', bgcolor: '#1976D2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'white' }}>Basic (30%)</Typography>
                </Box>
                <Box sx={{ width: '15%', bgcolor: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'white' }}>HRA (15%)</Typography>
                </Box>
                <Box sx={{ width: '10%', bgcolor: '#FF9800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'white' }}>Allowances (10%)</Typography>
                </Box>
                <Box sx={{ width: '25%', bgcolor: '#9C27B0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'white' }}>Bonus/PF (25%)</Typography>
                </Box>
                <Box sx={{ width: '20%', bgcolor: '#F44336', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'white' }}>Other Benefits (20%)</Typography>
                </Box>
              </Box>
            </Paper>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            {/* Terms & Benefits Card */}
            <Paper sx={{ p: 3, bgcolor: '#FFFFFF' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#1976D2' }}>
                📋 Terms of Employment
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ bgcolor: '#F8FAFC' }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WorkIcon fontSize="small" color="primary" />
                        Employment Terms
                      </Typography>
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Probation Period
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {offerDetails?.offerDetails?.probationPeriod || '6'} months
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Notice Period
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {offerDetails?.offerDetails?.noticePeriod || '30'} days
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Working Hours
                        </Typography>
                        <Typography variant="body2">
                          9:00 AM - 6:00 PM (Monday to Friday)
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ bgcolor: '#F8FAFC' }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon fontSize="small" color="primary" />
                        Company Benefits
                      </Typography>
                      
                      <Box sx={{ mt: 2 }}>
                        {offerDetails?.offerDetails?.benefits?.map((benefit, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <CheckCircleIcon fontSize="small" color="success" />
                            <Typography variant="body2">{benefit}</Typography>
                          </Box>
                        ))}
                        
                        {/* Default benefits if none provided */}
                        {(!offerDetails?.offerDetails?.benefits || offerDetails.offerDetails.benefits.length === 0) && (
                          <>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <CheckCircleIcon fontSize="small" color="success" />
                              <Typography variant="body2">Medical Insurance (up to ₹5,00,000)</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <CheckCircleIcon fontSize="small" color="success" />
                              <Typography variant="body2">Annual Performance Bonus</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <CheckCircleIcon fontSize="small" color="success" />
                              <Typography variant="body2">Paid Time Off - 24 days/year</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <CheckCircleIcon fontSize="small" color="success" />
                              <Typography variant="body2">Provident Fund Contributions</Typography>
                            </Box>
                          </>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ bgcolor: '#FFF3E0', border: '1px solid #FFB74D' }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#F57C00' }}>
                        <InfoIcon fontSize="small" />
                        Important Notes
                      </Typography>
                      
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        <li>
                          <Typography variant="body2" color="textSecondary">
                            This offer is valid for 15 days from the date of issue
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="body2" color="textSecondary">
                            Please carry all original documents at the time of joining
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="body2" color="textSecondary">
                            Background verification will be conducted prior to joining
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="body2" color="textSecondary">
                            Any gaps in employment must be disclosed and explained
                          </Typography>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="textSecondary">
                        Issued On
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(new Date())}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="textSecondary">
                        Valid Until
                      </Typography>
                      <Typography variant="body2" fontWeight={500} color="primary">
                        {formatDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000))}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="textSecondary">
                        Offer ID
                      </Typography>
                      <Typography variant="body2">
                        {offerDetails?.offerId}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* HR Contact Card */}
            <Paper sx={{ p: 2, bgcolor: '#E3F2FD', border: '1px solid #90CAF9' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" color="primary" />
                For any queries, please contact:
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2">HR Department</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2">hr@suyashenterprises.com</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2">+91 98765 43210</Typography>
                  </Box>
                </Grid>
              </Grid>
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
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
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
            Offer Details
          </Typography>
          {offerDetails?.offerId && (
            <Typography variant="caption" color="textSecondary">
              Offer ID: {offerDetails.offerId}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Download PDF">
            <IconButton onClick={handleDownloadPDF} size="small">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print">
            <IconButton onClick={handlePrint} size="small">
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy Link">
            <IconButton onClick={handleCopyLink} size="small" color={copied ? 'success' : 'default'}>
              {copied ? <CheckCircleIcon /> : <LinkIcon />}
            </IconButton>
          </Tooltip>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
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
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 2
      }}>
        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button onClick={handleClose}>
            Close
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
                sx={{ mr: 1 }}
              >
                View from Start
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
        </Box>

        {/* Action Buttons for Candidate */}
        {activeStep === steps.length - 1 && tokenValid && (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={handleAcceptOffer}
              disabled={acceptLoading || rejectLoading}
              startIcon={acceptLoading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
              sx={{ minWidth: 200 }}
            >
              {acceptLoading ? 'Processing...' : 'Accept Offer'}
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              size="large"
              onClick={handleRejectOffer}
              disabled={rejectLoading || acceptLoading}
              startIcon={rejectLoading ? <CircularProgress size={20} /> : <WarningIcon />}
              sx={{ minWidth: 200 }}
            >
              {rejectLoading ? 'Processing...' : 'Decline Offer'}
            </Button>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ViewOffer;