import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
  Tooltip,
  CircularProgress,
  Alert,
  Avatar,
  Button
} from '@mui/material';
import {
  Assignment as InitiateIcon,
  Send as SendIcon,
  CheckCircle as ApproveIcon,
  Description as GenerateIcon,
  Email as EmailIcon,
  Visibility as ViewIcon,
  Check as AcceptIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Import all offer management components
import InitiateOffer from './InitiateOffer';
import SubmitForApproval from './SubmitForApproval';
import ApproveOffer from './ApproveOffer';
import GenerateOfferLetter from './GenerateOfferLetter';
import SendOfferLetter from './SendOfferLetter';
import ViewOffer from './ViewOffer';
import AcceptOffer from './AcceptOffer';
import BASE_URL from '../../../../config/Config';

const OFFER_FLOW = [
  'Pending',
  'Initiated',
  'Submitted',
  'Approved',
  'Generated',
  'Sent',
  'Viewed',
  'Accepted'
];

const getNextAllowedAction = (status) => {
  const flowMap = {
    Pending: 'initiateOffer',
    Initiated: 'submitForApproval',
    Submitted: 'approveOffer',
    Approved: 'generateOffer',
    Generated: 'sendOffer',
    Sent: 'viewOffer',
    Viewed: 'acceptOffer',
    Accepted: null,
    Rejected: 'initiateOffer'
  };

  return flowMap[status] || null;
};

const OfferManagement = () => {
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiDetails, setApiDetails] = useState({
    endpoint: `${BASE_URL}/api/candidates?status=selected`,
    lastAttempt: null
  });

  // State for dialog visibility
  const [dialogState, setDialogState] = useState({
    initiateOffer: { open: false, candidate: null },
    submitForApproval: { open: false, candidate: null },
    approveOffer: { open: false, candidate: null },
    generateOffer: { open: false, candidate: null },
    sendOffer: { open: false, candidate: null },
    viewOffer: { open: false, candidate: null },
    acceptOffer: { open: false, candidate: null }
  });

  // Get auth token from localStorage or your auth context
  const getAuthToken = () => {
    // Modify this based on where you store your token
    return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  };

  // Fetch selected candidates on component mount
  useEffect(() => {
    fetchSelectedCandidates();
  }, []);

  const fetchSelectedCandidates = async () => {
    setLoading(true);
    setError(null);
    setApiDetails(prev => ({
      ...prev,
      lastAttempt: new Date().toLocaleString()
    }));

    try {
      const token = getAuthToken();
      const apiUrl = `${BASE_URL}/api/candidates?status=selected`;
      console.log('Fetching from:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        credentials: 'omit'
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const text = await response.text();
        console.error('Response not OK. Status:', response.status, 'Body:', text);

        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Invalid content type. Expected JSON but got:', contentType);
        console.error('Response body (first 200 chars):', text.substring(0, 200));
        throw new Error('Server returned non-JSON response. Please check API endpoint.');
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (result.success) {
        // Transform the data to include required fields for offer management
        const transformedData = result.data.map(candidate => ({
          id: candidate._id,
          candidateId: candidate.candidateId,
          name: `${candidate.firstName} ${candidate.lastName}`,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          phone: candidate.phone,
          position: candidate.latestApplication?.jobId?.title || 'Not Assigned',
          jobId: candidate.latestApplication?.jobId || null,
          department: 'To be assigned',
          experience: formatExperience(candidate.experience),
          status: getOfferStatus(candidate.latestApplication?.status),
          applicationId: candidate.latestApplication?._id,
          applicationStatus: candidate.latestApplication?.status,
          education: candidate.education,
          skills: candidate.skills || [],
          address: candidate.address,
          dateOfBirth: candidate.dateOfBirth,
          gender: candidate.gender,
          offerDetails: {
            salary: null,
            joiningDate: null,
            offerLetter: null
          }
        }));
        setSelectedCandidates(transformedData);
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch candidates');
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format experience
  const formatExperience = (experience) => {
    if (!experience || experience.length === 0) return 'Fresher';

    const totalExperience = experience.reduce((total, exp) => {
      if (exp.current) {
        const startDate = new Date(exp.fromDate);
        const currentDate = new Date();
        const years = currentDate.getFullYear() - startDate.getFullYear();
        return total + years;
      } else if (exp.toDate) {
        const startDate = new Date(exp.fromDate);
        const endDate = new Date(exp.toDate);
        const years = endDate.getFullYear() - startDate.getFullYear();
        return total + years;
      }
      return total;
    }, 0);

    return `${totalExperience} ${totalExperience === 1 ? 'year' : 'years'}`;
  };

  // Helper function to determine offer status based on application status
  const getOfferStatus = (applicationStatus) => {
    const statusMap = {
      'selected': 'Initiated',
      'offered': 'Generated',
      'accepted': 'Accepted',
      'rejected': 'Rejected',
      'pending': 'Pending'
    };
    return statusMap[applicationStatus] || 'Pending';
  };

  // Color constants - EXACT SAME as header gradient
  const HEADER_GRADIENT = 'linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)';
  const TEXT_COLOR_MAIN = '#0f172a'; // slate-900

  // Status color mapping
  const getStatusColor = (status) => {
    const colors = {
      'Initiated': 'info',
      'Submitted': 'warning',
      'Approved': 'success',
      'Generated': 'primary',
      'Sent': 'secondary',
      'Viewed': 'default',
      'Accepted': 'success',
      'Rejected': 'error',
      'Pending': 'default'
    };
    return colors[status] || 'default';
  };

  // Action handlers
  const handleOpenDialog = (action, candidate) => {
    setDialogState(prev => ({
      ...prev,
      [action]: { open: true, candidate }
    }));
  };

  const handleCloseDialog = (action) => {
    setDialogState(prev => ({
      ...prev,
      [action]: { open: false, candidate: null }
    }));
  };

  const handleActionComplete = (action, updatedData) => {
    // Update candidate status based on action
    setSelectedCandidates(prevCandidates =>
      prevCandidates.map(candidate =>
        candidate.id === updatedData.id ? { ...candidate, ...updatedData } : candidate
      )
    );

    handleCloseDialog(action);
  };

  // Specific handler for SubmitForApproval completion
  const handleApprovalComplete = (updatedData) => {
    setSelectedCandidates(prevCandidates =>
      prevCandidates.map(candidate =>
        candidate.id === updatedData.id ? { ...candidate, ...updatedData } : candidate
      )
    );
    handleCloseDialog('submitForApproval');
  };

  // Check if action should be enabled based on current status
  const isActionEnabled = (action, candidate) => {

    // const status = candidate.status

    // //get only allowed actions
    // const nextAction = getNextAllowedAction(status);

    // //allow only next action in flow
    // return action ===nextAction;
  };

  // Get candidate initials for avatar
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
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
            display: 'inline-block',
          }}
        >
          Offer Management
        </Typography>
        <Typography variant="body2" color="#64748B" sx={{ mt: 0.5, mb: 2 }}>
          View and manage offers for candidates
        </Typography>
      </Box>

      {error ? (
        <Box sx={{ mb: 3 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={fetchSelectedCandidates}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </Box>
      ) : selectedCandidates.length === 0 ? (
        <Alert severity="info">No selected candidates found</Alert>
      ) : (
        <TableContainer component={Paper} elevation={3} sx={{ mt: 5 }}>
          <Table sx={{ minWidth: 650 }} aria-label="offer management table">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Candidate</strong></TableCell>
                <TableCell><strong>Contact</strong></TableCell>
                <TableCell><strong>Position</strong></TableCell>
                <TableCell><strong>Experience</strong></TableCell>
                <TableCell><strong>Skills</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedCandidates.map((candidate) => (
                <TableRow key={candidate.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {getInitials(candidate.firstName, candidate.lastName) || <PersonIcon />}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {candidate.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {candidate.candidateId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{candidate.email}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {candidate.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{candidate.position}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{candidate.experience}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {candidate.skills?.slice(0, 3).map((skill, index) => (
                        <Chip key={index} label={skill} size="small" variant="outlined" />
                      ))}
                      {candidate.skills?.length > 3 && (
                        <Chip label={`+${candidate.skills.length - 3}`} size="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={candidate.status}
                      color={getStatusColor(candidate.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      {/* Initiate Offer */}
                      <Tooltip title="Initiate Offer">
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog('initiateOffer', candidate)}
                            disabled={!isActionEnabled('initiateOffer', candidate)}
                          >
                            <InitiateIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      {/* Submit for Approval */}
                      <Tooltip title="Submit for Approval">
                        <span>
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleOpenDialog('submitForApproval', candidate)}
                            disabled={!isActionEnabled('submitForApproval', candidate)}
                          >
                            <SendIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      {/* Approve Offer */}
                      <Tooltip title="Approve Offer">
                        <span>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleOpenDialog('approveOffer', candidate)}
                            disabled={!isActionEnabled('approveOffer', candidate)}
                          >
                            <ApproveIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      {/* Generate Offer Letter */}
                      <Tooltip title="Generate Offer Letter">
                        <span>
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleOpenDialog('generateOffer', candidate)}
                            disabled={!isActionEnabled('generateOffer', candidate)}
                          >
                            <GenerateIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      {/* Send to Candidate */}
                      <Tooltip title="Send to Candidate">
                        <span>
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleOpenDialog('sendOffer', candidate)}
                            disabled={!isActionEnabled('sendOffer', candidate)}
                          >
                            <EmailIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      {/* View Offer */}
                      <Tooltip title="View Offer">
                        <span>
                          <IconButton
                            size="small"
                            color="default"
                            onClick={() => handleOpenDialog('viewOffer', candidate)}
                            disabled={!isActionEnabled('viewOffer', candidate)}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      {/* Accept Offer */}
                      <Tooltip title="Accept Offer">
                        <span>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleOpenDialog('acceptOffer', candidate)}
                            disabled={!isActionEnabled('acceptOffer', candidate)}
                          >
                            <AcceptIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Action Dialogs */}
      <InitiateOffer
        open={dialogState.initiateOffer.open}
        onClose={() => handleCloseDialog('initiateOffer')}
        candidate={dialogState.initiateOffer.candidate}
        onComplete={(updatedData) => handleActionComplete('initiateOffer', updatedData)}
      />

      <SubmitForApproval
        open={dialogState.submitForApproval.open}
        onClose={() => handleCloseDialog('submitForApproval')}
        onComplete={handleApprovalComplete}
        candidateData={dialogState.submitForApproval.candidate}
      />

      <ApproveOffer
        open={dialogState.approveOffer.open}
        onClose={() => handleCloseDialog('approveOffer')}
        candidate={dialogState.approveOffer.candidate}
        onComplete={(updatedData) => handleActionComplete('approveOffer', updatedData)}
      />

      <GenerateOfferLetter
        open={dialogState.generateOffer.open}
        onClose={() => handleCloseDialog('generateOffer')}
        candidate={dialogState.generateOffer.candidate}
        onComplete={(updatedData) => handleActionComplete('generateOffer', updatedData)}
      />

      <SendOfferLetter
        open={dialogState.sendOffer.open}
        onClose={() => handleCloseDialog('sendOffer')}
        candidate={dialogState.sendOffer.candidate}
        onComplete={(updatedData) => handleActionComplete('sendOffer', updatedData)}
      />

      <ViewOffer
        open={dialogState.viewOffer.open}
        onClose={() => handleCloseDialog('viewOffer')}
        candidate={dialogState.viewOffer.candidate}
      />

      <AcceptOffer
        open={dialogState.acceptOffer.open}
        onClose={() => handleCloseDialog('acceptOffer')}
        candidate={dialogState.acceptOffer.candidate}
        onComplete={(updatedData) => handleActionComplete('acceptOffer', updatedData)}
      />
    </Box>
  );
};

export default OfferManagement;