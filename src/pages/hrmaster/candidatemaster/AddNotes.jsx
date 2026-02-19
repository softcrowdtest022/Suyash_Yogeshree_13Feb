import React, { useState, useEffect } from 'react';
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
  IconButton,
  TextField,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Grid
} from '@mui/material';
import {
  Close as CloseIcon,
  NoteAdd as NoteAddIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Comment as CommentIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Feedback as FeedbackIcon,
  Notifications as NotificationsIcon,
  Info as InfoIcon,
  Event as EventIcon,
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const AddNotes = ({ open, onClose, onAdd, candidateId, candidateData }) => {
  const [formData, setFormData] = useState({
    text: '',
    type: 'General'
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [candidate, setCandidate] = useState(candidateData || null);
  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);

  // Note types with icons and colors - using available icons
  const noteTypes = [
    { value: 'General', label: 'General', icon: <InfoIcon />, color: '#1976D2', bg: '#E3F2FD' },
    { value: 'Interview', label: 'Interview', icon: <EventIcon />, color: '#7B1FA2', bg: '#F3E5F5' },
    { value: 'Feedback', label: 'Feedback', icon: <AssessmentIcon />, color: '#2E7D32', bg: '#E8F5E8' },
    { value: 'Follow-up', label: 'Follow-up', icon: <NotificationsIcon />, color: '#F57C00', bg: '#FFF3E0' },
    { value: 'Task', label: 'Task', icon: <AssignmentIcon />, color: '#0288D1', bg: '#E1F5FE' }
  ];

  // Fetch candidate details if not provided
  useEffect(() => {
    if (open && !candidateData && candidateId) {
      fetchCandidateDetails();
    } else if (candidateData) {
      setCandidate(candidateData);
      setNotes(candidateData.notes || []);
    }
  }, [open, candidateData, candidateId]);

  // Fetch candidate details
  const fetchCandidateDetails = async () => {
    setFetchLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/candidates/${candidateId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setCandidate(response.data.data);
        setNotes(response.data.data.notes || []);
      } else {
        setError(response.data.message || 'Failed to fetch candidate details');
      }
    } catch (err) {
      console.error('Error fetching candidate details:', err);
      setError(err.response?.data?.message || 'Failed to fetch candidate details');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.text.trim()) {
      setError('Note text is required');
      return false;
    }
    if (formData.text.trim().length < 3) {
      setError('Note must be at least 3 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/api/candidates/${candidateId}/notes`,
        {
          text: formData.text,
          type: formData.type
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess('Note added successfully!');
        // Add new note to list
        setNotes(prev => [response.data.data, ...prev]);
        // Clear form
        setFormData({
          text: '',
          type: 'General'
        });
        // Callback
        onAdd(response.data.data);
      } else {
        setError(response.data.message || 'Failed to add note');
      }
    } catch (err) {
      console.error('Error adding note:', err);
      setError(err.response?.data?.message || 'Failed to add note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setFormData({
      text: note.text,
      type: note.type || 'General'
    });
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setFormData({
      text: '',
      type: 'General'
    });
    setError('');
  };

  const resetForm = () => {
    setFormData({
      text: '',
      type: 'General'
    });
    setEditingNote(null);
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Format date
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get note type style
  const getNoteTypeStyle = (type) => {
    const noteType = noteTypes.find(nt => nt.value === type) || noteTypes[0];
    return noteType;
  };

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
            <NoteAddIcon sx={{ color: '#1976D2' }} />
            {editingNote ? 'Edit Note' : 'Add Note'}
          </div>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {fetchLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} sx={{ color: '#1976D2' }} />
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Candidate Info Card */}
            {candidate && (
              <Paper elevation={0} sx={{ p: 2, backgroundColor: '#F9F9F9', borderRadius: 2 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        bgcolor: '#E3F2FD',
                        color: '#1976D2',
                        fontSize: '20px'
                      }}
                    >
                      {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#101010' }}>
                        {candidate.fullName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {candidate.candidateId}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${notes.length} Notes`}
                      size="small"
                      sx={{
                        backgroundColor: '#E3F2FD',
                        color: '#1976D2',
                        fontWeight: 500
                      }}
                    />
                  </Box>

                  <Divider />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon sx={{ fontSize: 18, color: '#9E9E9E' }} />
                        <Box>
                          <Typography variant="caption" color="textSecondary">Email</Typography>
                          <Typography variant="body2">{candidate.email}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: 18, color: '#9E9E9E' }} />
                        <Box>
                          <Typography variant="caption" color="textSecondary">Phone</Typography>
                          <Typography variant="body2">{candidate.phone}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Stack>
              </Paper>
            )}

            {/* Add Note Form */}
            <Paper elevation={0} sx={{ p: 2, backgroundColor: '#F9F9F9', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#101010', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CommentIcon sx={{ color: '#1976D2' }} />
                {editingNote ? 'Edit Note' : 'New Note'}
              </Typography>
              
              <Stack spacing={3}>
                {/* Note Type Selection */}
                <FormControl fullWidth size="small">
                  <InputLabel>Note Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    label="Note Type"
                    disabled={loading}
                    sx={{
                      borderRadius: 1,
                      backgroundColor: 'white'
                    }}
                    renderValue={(selected) => {
                      const noteType = noteTypes.find(nt => nt.value === selected);
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {noteType?.icon}
                          <Typography>{noteType?.label}</Typography>
                        </Box>
                      );
                    }}
                  >
                    {noteTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {type.icon}
                          <Typography>{type.label}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Note Text */}
                <TextField
                  fullWidth
                  label="Note"
                  name="text"
                  value={formData.text}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  disabled={loading}
                  required
                  size="small"
                  variant="outlined"
                  placeholder="Enter your note here..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      backgroundColor: 'white'
                    }
                  }}
                />

                {/* Form Actions */}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  {editingNote && (
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
                      disabled={loading}
                      size="small"
                      sx={{
                        borderRadius: 1,
                        textTransform: 'none'
                      }}
                    >
                      Cancel Edit
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading || !formData.text.trim()}
                    startIcon={loading ? null : <NoteAddIcon />}
                    sx={{
                      borderRadius: 1,
                      px: 3,
                      textTransform: 'none',
                      fontWeight: 500,
                      backgroundColor: '#1976D2',
                      '&:hover': {
                        backgroundColor: '#1565C0'
                      }
                    }}
                  >
                    {loading ? 'Adding...' : editingNote ? 'Update Note' : 'Add Note'}
                  </Button>
                </Box>
              </Stack>
            </Paper>

            {/* Success/Error Messages */}
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
            
            {error && (
              <Alert 
                severity="error" 
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

            {/* Notes History */}
            {notes.length > 0 && (
              <Paper elevation={0} sx={{ p: 2, backgroundColor: '#F9F9F9', borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#101010', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryIcon sx={{ color: '#1976D2' }} />
                  Notes History ({notes.length})
                </Typography>
                
                <List sx={{ width: '100%', bgcolor: 'transparent' }}>
                  {notes.map((note, index) => {
                    const noteType = getNoteTypeStyle(note.type);
                    return (
                      <React.Fragment key={note._id || index}>
                        {index > 0 && <Divider variant="inset" component="li" />}
                        <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: noteType.bg, color: noteType.color }}>
                              {noteType.icon}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {noteType.label}
                                </Typography>
                                <Chip
                                  label={formatDateTime(note.createdAt)}
                                  size="small"
                                  sx={{
                                    height: '20px',
                                    fontSize: '10px',
                                    backgroundColor: '#F5F5F5'
                                  }}
                                />
                              </Box>
                            }
                            secondary={
                              <React.Fragment>
                                <Typography
                                  variant="body2"
                                  color="textPrimary"
                                  sx={{ display: 'block', mb: 0.5, whiteSpace: 'pre-wrap' }}
                                >
                                  {note.text}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                >
                                  <PersonIcon sx={{ fontSize: 14 }} />
                                  Added by: {note.createdByName || 'System'}
                                </Typography>
                              </React.Fragment>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              edge="end" 
                              size="small"
                              onClick={() => handleEditNote(note)}
                              sx={{ mr: 1, color: '#1976D2' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </React.Fragment>
                    );
                  })}
                </List>
              </Paper>
            )}

            {/* Info Alert */}
            {notes.length === 0 && (
              <Alert 
                severity="info" 
                icon={<CommentIcon />}
                sx={{ 
                  borderRadius: 1,
                  backgroundColor: '#E3F2FD',
                  '& .MuiAlert-icon': {
                    color: '#1976D2'
                  }
                }}
              >
                <Typography variant="body2">
                  No notes yet. Add your first note to track communication with this candidate.
                </Typography>
              </Alert>
            )}
          </Stack>
        )}
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
          disabled={loading || fetchLoading}
          sx={{
            borderRadius: 1,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddNotes;