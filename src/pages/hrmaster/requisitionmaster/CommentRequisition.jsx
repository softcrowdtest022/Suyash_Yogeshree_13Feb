// import React, { useState, useEffect } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Stack,
//   Alert,
//   Box,
//   Typography,
//   IconButton,
//   Chip,
//   Divider,
//   Paper,
//   CircularProgress,
//   TextField,
//   Avatar,
//   List,
//   ListItem,
//   ListItemAvatar,
//   ListItemText,
//   InputAdornment,
//   Tooltip,
//   Badge,
//   Collapse
// } from '@mui/material';
// import {
//   Close as CloseIcon,
//   Send as SendIcon,
//   Comment as CommentIcon,
//   Assignment as AssignmentIcon,
//   Person as PersonIcon,
//   CalendarToday as CalendarIcon,
//   Info as InfoIcon,
//   CheckCircle as CheckCircleIcon,
//   Error as ErrorIcon,
//   ExpandMore as ExpandMoreIcon,
//   ExpandLess as ExpandLessIcon,
//   AccessTime as AccessTimeIcon,
//   Reply as ReplyIcon,
//   Edit as EditIcon,
//   Delete as DeleteIcon
// } from '@mui/icons-material';
// import axios from 'axios';
// import BASE_URL from '../../../config/Config';
// import { format } from 'date-fns';

// const CommentRequisition = ({ open, onClose, onCommentAdd, requisitionId }) => {
//   const [requisition, setRequisition] = useState(null);
//   const [comments, setComments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [commentText, setCommentText] = useState('');
//   const [commentError, setCommentError] = useState('');
//   const [commentSuccess, setCommentSuccess] = useState(false);
//   const [showDetails, setShowDetails] = useState(false);
//   const [replyTo, setReplyTo] = useState(null);
//   const [replyText, setReplyText] = useState('');
//   const [showReplyBox, setShowReplyBox] = useState(null);

//   useEffect(() => {
//     if (open && requisitionId) {
//       fetchRequisitionDetails();
//       fetchComments();
//     }
//   }, [open, requisitionId]);

//   useEffect(() => {
//     if (!open) {
//       // Reset state when dialog closes
//       setCommentText('');
//       setReplyTo(null);
//       setReplyText('');
//       setShowReplyBox(null);
//       setCommentError('');
//       setCommentSuccess(false);
//       setShowDetails(false);
//     }
//   }, [open]);

//   const fetchRequisitionDetails = async () => {
//     setLoading(true);
//     setError('');

//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/requisitions/${requisitionId}/comments`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.data.success) {
//         setRequisition(response.data.data);
//       } else {
//         setError(response.data.message || 'Failed to fetch requisition details');
//       }
//     } catch (err) {
//       console.error('Error fetching requisition:', err);
//       setError(err.response?.data?.message || 'Failed to fetch requisition details. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchComments = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/requisitions/${requisitionId}/comments`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.data.success) {
//         setComments(response.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error fetching comments:', err);
//       // Don't set main error for comments fetch failure
//     }
//   };

//   const handleAddComment = async () => {
//     // Validate comment
//     if (!commentText.trim()) {
//       setCommentError('Comment cannot be empty');
//       return;
//     }

//     if (commentText.trim().length < 3) {
//       setCommentError('Comment must be at least 3 characters');
//       return;
//     }

//     setSubmitting(true);
//     setCommentError('');
//     setError('');

//     try {
//       const token = localStorage.getItem('token');
//       const submitData = {
//         text: commentText.trim()
//       };

//       const response = await axios.post(`${BASE_URL}/api/requisitions/${requisitionId}/comments`, submitData, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.data.success) {
//         setSuccess(response.data.message || 'Comment added successfully');
//         setCommentSuccess(true);
        
//         // Add new comment to list
//         setComments(prev => [response.data.data, ...prev]);
        
//         // Call the onCommentAdd callback
//         onCommentAdd(response.data.data);
        
//         // Clear comment text
//         setCommentText('');
        
//         // Hide success message after delay
//         setTimeout(() => {
//           setSuccess('');
//           setCommentSuccess(false);
//         }, 3000);
//       } else {
//         setError(response.data.message || 'Failed to add comment');
//       }
//     } catch (err) {
//       console.error('Error adding comment:', err);
//       setError(err.response?.data?.message || 'Failed to add comment. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleAddReply = async (commentId) => {
//     if (!replyText.trim()) {
//       return;
//     }

//     setSubmitting(true);

//     try {
//       const token = localStorage.getItem('token');
//       const submitData = {
//         text: replyText.trim(),
//         parentId: commentId
//       };

//       const response = await axios.post(`${BASE_URL}/api/requisitions/${requisitionId}/comments`, submitData, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.data.success) {
//         // Add reply to comments list
//         setComments(prev => [response.data.data, ...prev]);
        
//         // Clear reply
//         setReplyText('');
//         setShowReplyBox(null);
//         setReplyTo(null);
//       }
//     } catch (err) {
//       console.error('Error adding reply:', err);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleAddComment();
//     }
//   };

//   const handleClose = () => {
//     setRequisition(null);
//     setComments([]);
//     setError('');
//     setSuccess('');
//     setCommentSuccess(false);
//     onClose();
//   };

//   const formatDateTime = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       return format(new Date(dateString), 'dd MMM yyyy, hh:mm a');
//     } catch {
//       return 'Invalid Date';
//     }
//   };

//   const getTimeAgo = (dateString) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInSeconds = Math.floor((now - date) / 1000);
    
//     if (diffInSeconds < 60) return 'just now';
//     if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
//     if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
//     return formatDateTime(dateString);
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       draft: { bg: '#FFF3E0', color: '#E65100' },
//       pending_approval: { bg: '#FFF3E0', color: '#E65100' },
//       approved: { bg: '#E8F5E9', color: '#2E7D32' },
//       rejected: { bg: '#FFEBEE', color: '#C62828' },
//       filled: { bg: '#E3F2FD', color: '#1565C0' },
//       closed: { bg: '#F5F5F5', color: '#616161' }
//     };
//     return colors[status?.toLowerCase()] || { bg: '#F5F5F5', color: '#616161' };
//   };

//   const renderComment = (comment, isReply = false) => (
//     <Paper
//       key={comment._id}
//       sx={{
//         p: 2,
//         backgroundColor: isReply ? '#F8FAFC' : '#FFFFFF',
//         borderRadius: 2,
//         border: '1px solid #E0E0E0',
//         ml: isReply ? 4 : 0,
//         position: 'relative',
//         '&:hover': {
//           backgroundColor: isReply ? '#F5F5F5' : '#FAFAFA'
//         }
//       }}
//     >
//       <Box sx={{ display: 'flex', gap: 2 }}>
//         <Avatar
//           sx={{
//             width: 40,
//             height: 40,
//             bgcolor: '#1976D2',
//             fontSize: '16px',
//             fontWeight: 600
//           }}
//         >
//           {comment.userName?.charAt(0).toUpperCase() || 'U'}
//         </Avatar>
        
//         <Box sx={{ flex: 1 }}>
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#101010' }}>
//                 {comment.userName || 'Unknown User'}
//               </Typography>
//               <Chip
//                 label="Comment"
//                 size="small"
//                 sx={{
//                   height: 20,
//  fontSize: '10px',
//                   backgroundColor: '#E3F2FD',
//                   color: '#1976D2'
//                 }}
//               />
//             </Box>
//             <Tooltip title={formatDateTime(comment.createdAt)}>
//               <Typography variant="caption" sx={{ color: '#999', display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                 <AccessTimeIcon sx={{ fontSize: 14 }} />
//                 {getTimeAgo(comment.createdAt)}
//               </Typography>
//             </Tooltip>
//           </Box>
          
//           <Typography variant="body2" sx={{ color: '#333', whiteSpace: 'pre-wrap', mb: 1 }}>
//             {comment.text}
//           </Typography>
          
//           {!isReply && (
//             <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
//               <Button
//                 size="small"
//                 startIcon={<ReplyIcon sx={{ fontSize: 16 }} />}
//                 onClick={() => setShowReplyBox(showReplyBox === comment._id ? null : comment._id)}
//                 sx={{
//                   color: '#666',
//                   textTransform: 'none',
//                   fontSize: '12px',
//                   '&:hover': {
//                     color: '#1976D2'
//                   }
//                 }}
//               >
//                 Reply
//               </Button>
//             </Box>
//           )}
          
//           {/* Reply Box */}
//           {showReplyBox === comment._id && (
//             <Box sx={{ mt: 2 }}>
//               <TextField
//                 fullWidth
//                 size="small"
//                 placeholder="Write a reply..."
//                 value={replyText}
//                 onChange={(e) => setReplyText(e.target.value)}
//                 multiline
//                 rows={2}
//                 variant="outlined"
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: 1,
//                     backgroundColor: '#FFF'
//                   }
//                 }}
//               />
//               <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
//                 <Button
//                   size="small"
//                   onClick={() => {
//                     setShowReplyBox(null);
//                     setReplyText('');
//                   }}
//                   sx={{ color: '#666' }}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   size="small"
//                   variant="contained"
//                   onClick={() => handleAddReply(comment._id)}
//                   disabled={!replyText.trim() || submitting}
//                   sx={{
//                     backgroundColor: '#1976D2',
//                     '&:hover': {
//                       backgroundColor: '#1565C0'
//                     }
//                   }}
//                 >
//                   Reply
//                 </Button>
//               </Box>
//             </Box>
//           )}
//         </Box>
//       </Box>
//     </Paper>
//   );

//   return (
//     <Dialog 
//       open={open} 
//       onClose={handleClose} 
//       maxWidth="md" 
//       fullWidth
//       PaperProps={{
//         sx: { 
//           borderRadius: 2,
//           maxHeight: '90vh'
//         }
//       }}
//     >
//       <DialogTitle sx={{ 
//         borderBottom: '1px solid #E0E0E0', 
//         pb: 2,
//         backgroundColor: '#F8FAFC',
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center'
//       }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//           <CommentIcon sx={{ color: '#1976D2' }} />
//           <div style={{ 
//             fontSize: '20px', 
//             fontWeight: '600', 
//             color: '#101010',
//             paddingTop: '8px'
//           }}>
//             Comments
//           </div>
//           {requisition && (
//             <Chip
//               label={requisition.requisitionId}
//               size="small"
//               sx={{
//                 ml: 1,
//                 backgroundColor: '#E3F2FD',
//                 color: '#1976D2',
//                 fontWeight: 500,
//                 fontSize: '12px'
//               }}
//             />
//           )}
//         </Box>
//         <IconButton onClick={handleClose} size="small" sx={{ color: '#666' }}>
//           <CloseIcon />
//         </IconButton>
//       </DialogTitle>
      
//       <DialogContent sx={{ pt: 3, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
//         {loading ? (
//           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
//             <CircularProgress sx={{ color: '#1976D2' }} />
//           </Box>
//         ) : error ? (
//           <Alert 
//             severity="error" 
//             sx={{ 
//               borderRadius: 1,
//               '& .MuiAlert-icon': {
//                 alignItems: 'center'
//               }
//             }}
//           >
//             {error}
//           </Alert>
//         ) : (
//           <Stack spacing={3} sx={{ flex: 1 }}>
//             {/* Requisition Summary Toggle */}
//             {requisition && (
//               <Paper sx={{ 
//                 p: 2, 
//                 backgroundColor: '#F8FAFC', 
//                 borderRadius: 2,
//                 border: '1px solid #E0E0E0'
//               }}>
//                 <Box 
//                   onClick={() => setShowDetails(!showDetails)}
//                   sx={{ 
//                     display: 'flex', 
//                     alignItems: 'center', 
//                     justifyContent: 'space-between',
//                     cursor: 'pointer'
//                   }}
//                 >
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                     <AssignmentIcon sx={{ color: '#1976D2', fontSize: 20 }} />
//                     <Typography variant="subtitle2" sx={{ color: '#101010' }}>
//                       Requisition Details
//                     </Typography>
//                   </Box>
//                   <IconButton size="small">
//                     {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
//                   </IconButton>
//                 </Box>
                
//                 <Collapse in={showDetails}>
//                   <Divider sx={{ my: 2 }} />
//                   <Grid container spacing={2}>
//                     <Grid item xs={6}>
//                       <Typography variant="caption" sx={{ color: '#666' }}>Department</Typography>
//                       <Typography variant="body2" sx={{ fontWeight: 500 }}>{requisition.department}</Typography>
//                     </Grid>
//                     <Grid item xs={6}>
//                       <Typography variant="caption" sx={{ color: '#666' }}>Location</Typography>
//                       <Typography variant="body2" sx={{ fontWeight: 500 }}>{requisition.location}</Typography>
//                     </Grid>
//                     <Grid item xs={6}>
//                       <Typography variant="caption" sx={{ color: '#666' }}>Position</Typography>
//                       <Typography variant="body2" sx={{ fontWeight: 500 }}>{requisition.positionTitle}</Typography>
//                     </Grid>
//                     <Grid item xs={6}>
//                       <Typography variant="caption" sx={{ color: '#666' }}>Status</Typography>
//                       <Box>
//                         <Chip
//                           label={requisition.status?.toUpperCase()}
//                           size="small"
//                           sx={{
//                             backgroundColor: getStatusColor(requisition.status).bg,
//                             color: getStatusColor(requisition.status).color,
//                             fontWeight: 500,
//                             height: 24,
//                             fontSize: '12px'
//                           }}
//                         />
//                       </Box>
//                     </Grid>
//                   </Grid>
//                 </Collapse>
//               </Paper>
//             )}

//             {/* Add Comment Section */}
//             <Paper sx={{ 
//               p: 2, 
//               borderRadius: 2,
//               border: '1px solid #E0E0E0',
//               backgroundColor: '#F8FAFC'
//             }}>
//               <Typography variant="subtitle2" sx={{ color: '#101010', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <CommentIcon sx={{ color: '#1976D2', fontSize: 18 }} />
//                 Add a Comment
//               </Typography>
              
//               <TextField
//                 fullWidth
//                 multiline
//                 rows={3}
//                 placeholder="Write your comment here... Press Enter to submit, Shift+Enter for new line"
//                 value={commentText}
//                 onChange={(e) => {
//                   setCommentText(e.target.value);
//                   if (commentError) setCommentError('');
//                 }}
//                 onKeyPress={handleKeyPress}
//                 error={!!commentError}
//                 helperText={commentError}
//                 disabled={submitting}
//                 variant="outlined"
//                 sx={{
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: 1,
//                     backgroundColor: '#FFF'
//                   }
//                 }}
//               />
              
//               {success && (
//                 <Alert 
//                   severity="success" 
//                   icon={<CheckCircleIcon fontSize="inherit" />}
//                   sx={{ 
//                     mt: 2,
//                     borderRadius: 1,
//                     '& .MuiAlert-icon': {
//                       alignItems: 'center'
//                     }
//                   }}
//                 >
//                   {success}
//                 </Alert>
//               )}
              
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
//                 <Typography variant="caption" sx={{ color: '#999' }}>
//                   {commentText.length} characters • Press Enter to submit
//                 </Typography>
//                 <Button
//                   variant="contained"
//                   onClick={handleAddComment}
//                   disabled={!commentText.trim() || submitting || commentText.trim().length < 3}
//                   startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
//                   sx={{
//                     borderRadius: 1,
//                     px: 3,
//                     textTransform: 'none',
//                     backgroundColor: '#1976D2',
//                     '&:hover': {
//                       backgroundColor: '#1565C0'
//                     }
//                   }}
//                 >
//                   {submitting ? 'Posting...' : 'Post Comment'}
//                 </Button>
//               </Box>
//             </Paper>

//             {/* Comments List */}
//             <Box>
//               <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
//                 <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#101010' }}>
//                   Discussion
//                 </Typography>
//                 <Badge badgeContent={comments.length} color="primary" sx={{ '& .MuiBadge-badge': { backgroundColor: '#1976D2' } }}>
//                   <CommentIcon sx={{ color: '#666' }} />
//                 </Badge>
//               </Box>
              
//               {comments.length === 0 ? (
//                 <Paper sx={{ 
//                   p: 4, 
//                   textAlign: 'center', 
//                   borderRadius: 2, 
//                   border: '1px dashed #E0E0E0',
//                   backgroundColor: '#FAFAFA'
//                 }}>
//                   <CommentIcon sx={{ fontSize: 48, color: '#CCC', mb: 2 }} />
//                   <Typography variant="body1" sx={{ color: '#999', mb: 1 }}>
//                     No comments yet
//                   </Typography>
//                   <Typography variant="caption" sx={{ color: '#999' }}>
//                     Be the first to start the discussion
//                   </Typography>
//                 </Paper>
//               ) : (
//                 <Stack spacing={2}>
//                   {comments.map(comment => renderComment(comment))}
//                 </Stack>
//               )}
//             </Box>
//           </Stack>
//         )}
//       </DialogContent>
      
//       <DialogActions sx={{ 
//         px: 3, 
//         py: 2, 
//         borderTop: '1px solid #E0E0E0', 
//         backgroundColor: '#F8FAFC',
//         display: 'flex',
//         justifyContent: 'flex-end'
//       }}>
//         <Button 
//           onClick={handleClose}
//           sx={{
//             borderRadius: 1,
//             px: 3,
//             py: 1,
//             textTransform: 'none',
//             fontWeight: 500
//           }}
//         >
//           Close
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default CommentRequisition;

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
  Avatar,
  InputAdornment
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  Comment as CommentIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const CommentRequisition = ({ open, onClose, onCommentAdd, requisitionId, requisitionData }) => {
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setCommentText('');
      setError('');
      setSuccess('');
      setSubmitting(false);
    }
  }, [open]);

  const handleAddComment = async () => {
    // Validate comment
    if (!commentText.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (commentText.trim().length < 3) {
      setError('Comment must be at least 3 characters');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const submitData = {
        text: commentText.trim()
      };

      console.log('Posting comment to:', `${BASE_URL}/api/requisitions/${requisitionId}/comments`);
      
      const response = await axios.post(`${BASE_URL}/api/requisitions/${requisitionId}/comments`, submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccess(response.data.message || 'Comment added successfully');
        
        // Call the onCommentAdd callback with the new comment
        if (onCommentAdd) {
          onCommentAdd(response.data.data);
        }
        
        // Clear comment text
        setCommentText('');
        
        // Close dialog after short delay
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to add comment');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err.response?.data?.message || 'Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleClose = () => {
    setCommentText('');
    setError('');
    setSuccess('');
    setSubmitting(false);
    onClose();
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
          <CommentIcon sx={{ color: '#1976D2' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#101010' }}>
            Add Comment
          </Typography>
          {requisitionData?.requisitionId && (
            <Chip
              label={requisitionData.requisitionId}
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
      
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {/* Requisition Summary */}
          {requisitionData && (
            <Paper sx={{ 
              p: 2, 
              backgroundColor: '#F8FAFC', 
              borderRadius: 2,
              border: '1px solid #E0E0E0'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AssignmentIcon sx={{ color: '#1976D2', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ color: '#101010', fontWeight: 600 }}>
                  {requisitionData.positionTitle || 'Requisition'}
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                    Department
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {requisitionData.department || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                    Location
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {requisitionData.location || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Add Comment Section */}
          <Paper sx={{ 
            p: 2, 
            borderRadius: 2,
            border: '1px solid #E0E0E0',
            backgroundColor: '#FFFFFF'
          }}>
            <Typography variant="subtitle2" sx={{ color: '#101010', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CommentIcon sx={{ color: '#1976D2', fontSize: 18 }} />
              Your Comment
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Write your comment here... Press Enter to submit, Shift+Enter for new line"
              value={commentText}
              onChange={(e) => {
                setCommentText(e.target.value);
                if (error) setError('');
              }}
              onKeyPress={handleKeyPress}
              error={!!error}
              helperText={error}
              disabled={submitting}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  backgroundColor: '#FFF'
                }
              }}
            />
            
            {success && (
              <Alert 
                severity="success" 
                icon={<CheckCircleIcon fontSize="inherit" />}
                sx={{ 
                  mt: 2,
                  borderRadius: 1,
                }}
              >
                {success}
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Typography variant="caption" sx={{ color: '#999' }}>
                {commentText.length} characters • Press Enter to submit
              </Typography>
              <Button
                variant="contained"
                onClick={handleAddComment}
                disabled={!commentText.trim() || submitting || commentText.trim().length < 3}
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                sx={{
                  borderRadius: 1,
                  px: 3,
                  textTransform: 'none',
                  backgroundColor: '#1976D2',
                  '&:hover': {
                    backgroundColor: '#1565C0'
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#E0E0E0'
                  }
                }}
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </Box>
          </Paper>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        py: 2, 
        borderTop: '1px solid #E0E0E0', 
        backgroundColor: '#F8FAFC',
      }}>
        <Button 
          onClick={handleClose}
          sx={{
            borderRadius: 1,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500,
            color: '#666'
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommentRequisition;