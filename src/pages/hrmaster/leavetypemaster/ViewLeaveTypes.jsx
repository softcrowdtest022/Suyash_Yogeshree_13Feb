import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Chip,
  Divider,
  Box
} from '@mui/material';
import { Edit as EditIcon, CalendarToday, Info, CheckCircle, Cancel, CloseSharp } from '@mui/icons-material';
import { ShieldCloseIcon } from 'lucide-react';

const ViewLeaveTypes = ({ open, onClose, leaveType, onEdit }) => {
  if (!leaveType) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle
  sx={{
    borderBottom: "1px solid #E0E0E0",
    py: 1, // reduced
    backgroundColor: "#F8FAFC",
  }}
>
  <Typography fontSize={18} fontWeight={600} color="#101010">
    Leave Type Details
  </Typography>
</DialogTitle>

<DialogContent sx={{ pt: 1.5, pb: 1 }}>
  <Stack spacing={2}>
    {/* Leave Type Name */}
    {/* <Stack spacing={0.5}>
      <Typography variant="caption" color="textSecondary" fontWeight={500}>
        Leave Type Name
      </Typography>
      <Typography variant="subtitle1" fontWeight={600} color="#101010">
        {leaveType.Name}
      </Typography>
    </Stack> */}

    <Stack direction="row" spacing={20}>
      <Typography variant="caption" fontWeight={600}>
        Leave Type
      </Typography>

      <Stack  spacing={2}>
        <Box flex={1}>
          <Typography variant="subtitle1" fontWeight={600} color="#101010">
            {leaveType.Name}
          </Typography>
          
        </Box>

      </Stack>
    </Stack>

    <Divider />

    {/* Max Days & Status */}
    <Stack direction="row" spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center" flex={1}>
        <CalendarToday sx={{ color: "text.secondary", fontSize: 18 }} />
        <Box>
          <Typography variant="caption" color="textSecondary">
            Maximum Days
          </Typography>
          <Typography fontWeight={600} color="primary">
            {leaveType.MaxDaysPerYear} days
          </Typography>
        </Box>
      </Stack>

      {/* <Stack direction="row" spacing={1} alignItems="center" flex={1}>
        {leaveType.IsActive ? (
          <CheckCircle sx={{ color: "success.main", fontSize: 18 }} />
        ) : (
          <Cancel sx={{ color: "error.main", fontSize: 18 }} />
        )}
        <Box>
          <Typography variant="caption" color="textSecondary">
            Status
          </Typography>
          <Chip
            label={leaveType.IsActive ? "Active" : "Inactive"}
            size="small"
            color={leaveType.IsActive ? "success" : "default"}
            sx={{
              height: 22,
              fontSize: "0.7rem",
              "&.MuiChip-colorSuccess": {
                bgcolor: "#E8F5E9",
                color: "#2E7D32",
              },
              "&.MuiChip-colorDefault": {
                bgcolor: "#F5F5F5",
                color: "#616161",
              },
            }}
          />
        </Box>
      </Stack> */}
    </Stack>

    {/* Description */}
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <Info sx={{ color: "text.secondary", fontSize: 18, mt: 0.2 }} />
      <Box flex={1}>
        <Typography variant="caption" color="textSecondary">
          Description
        </Typography>
        <Typography
          variant="body2"
          sx={{
            backgroundColor: "#F8FAFC",
            p: 1,
            borderRadius: 1,
            minHeight: 50,
            mt: 0.5,
            lineHeight: 1.4,
          }}
        >
          {leaveType.Description || "No description provided"}
        </Typography>
      </Box>
    </Stack>

    <Divider />

    {/* System Info */}
    <Stack spacing={1}>
      <Typography variant="subtitle2" fontWeight={600}>
        System Information
      </Typography>

      <Stack direction="row" spacing={2}>
        <Box flex={1}>
          <Typography variant="caption" color="textSecondary">
            Created At
          </Typography>
          <Typography variant="body2">
            {formatDate(leaveType.CreatedAt)}
          </Typography>
        </Box>

        <Box flex={1}>
          <Typography variant="caption" color="textSecondary">
            Last Updated
          </Typography>
          <Typography variant="body2">
            {formatDate(leaveType.UpdatedAt)}
          </Typography>
        </Box>
      </Stack>
    </Stack>
  </Stack>
</DialogContent>

      
      <DialogActions sx={{ 
        px: 3, 
        pb: 3, 
        borderTop: '1px solid #E0E0E0', 
        pt: 2,
        backgroundColor: '#F8FAFC'
      }}>
        <Button 
          variant="contained"
          onClick={onClose}
          startIcon={<CloseSharp />}
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
          Close
        </Button>
        {/* <Button
          variant="contained"
          onClick={() => {
            onClose();
            onEdit();
          }}
          startIcon={<EditIcon />}
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
          Edit Leave Type
        </Button> */}
      </DialogActions>
    </Dialog>
  );
};

export default ViewLeaveTypes;