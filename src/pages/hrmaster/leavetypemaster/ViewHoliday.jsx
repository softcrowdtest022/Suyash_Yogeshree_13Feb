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
import {
  Edit as EditIcon,
  CalendarToday,
  Info,
  CheckCircle,
  Cancel,
  Repeat
} from '@mui/icons-material';

const ViewHoliday = ({ open, onClose, holiday, onEdit }) => {
  if (!holiday) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          borderBottom: '1px solid #E0E0E0',
          backgroundColor: '#F8FAFC',
          fontSize: '20px',
          fontWeight: 600
        }}
      >
        Holiday Details
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3} mt={1}>
          {/* Holiday Name */}
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              Holiday Name
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {holiday.Name}
            </Typography>
          </Stack>

          <Divider />

          {/* Basic Info */}
          <Stack spacing={2}>
            <Stack direction="row" spacing={3}>
              {/* Date */}
              <Stack spacing={1} flex={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CalendarToday fontSize="small" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(holiday.Date)}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>

              {/* Type */}
              <Stack spacing={1} flex={1}>
                <Typography variant="caption" color="text.secondary">
                  Type
                </Typography>
                <Chip
                  label={holiday.Type || 'N/A'}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Stack>
            </Stack>

            {/* Year */}
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary">
                Year
              </Typography>
              <Typography variant="body1">
                {holiday.Year || 'N/A'}
              </Typography>
            </Stack>

            {/* Recurring */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Repeat fontSize="small" />
              <Typography variant="caption" color="text.secondary">
                Recurring
              </Typography>
              <Chip
                label={holiday.IsRecurring ? 'Yes' : 'No'}
                size="small"
                color={holiday.IsRecurring ? 'success' : 'default'}
              />
            </Stack>

            {/* Status */}
            <Stack direction="row" spacing={1} alignItems="center">
              {holiday.IsActive ? (
                <CheckCircle color="success" fontSize="small" />
              ) : (
                <Cancel color="error" fontSize="small" />
              )}
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
              <Chip
                label={holiday.IsActive ? 'Active' : 'Inactive'}
                size="small"
                color={holiday.IsActive ? 'success' : 'default'}
              />
            </Stack>

            {/* Description */}
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Info fontSize="small" />
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Description
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      backgroundColor: '#F8FAFC',
                      p: 2,
                      borderRadius: 1,
                      mt: 0.5
                    }}
                  >
                    {holiday.Description || 'No description provided'}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Stack>

          <Divider />

          {/* System Info */}
          <Stack spacing={1}>
            <Typography variant="subtitle2" fontWeight={600}>
              System Information
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Created At
            </Typography>
            <Typography variant="body2">
              {formatDateTime(holiday.CreatedAt || holiday.createdAt)}
            </Typography>

            <Typography variant="caption" color="text.secondary" mt={1}>
              Last Updated
            </Typography>
            <Typography variant="body2">
              {formatDateTime(holiday.UpdatedAt || holiday.updatedAt)}
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          borderTop: '1px solid #E0E0E0',
          backgroundColor: '#F8FAFC'
        }}
      >
        <Button onClick={onClose}>Close</Button>

        <Button
          variant="contained"
          onClick={() => {
            onClose();
            onEdit();
          }}
          startIcon={<EditIcon />}
        >
          Edit Holiday
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewHoliday;
