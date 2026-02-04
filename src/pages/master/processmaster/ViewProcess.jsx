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
  Box,
  Avatar,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { 
  Edit as EditIcon, 
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  Factory as FactoryIcon,
  Business as BusinessIcon,
  CalendarToday,
  CheckCircle,
  Cancel,
  Description as DescriptionIcon
} from '@mui/icons-material';

const ViewProcess = ({ open, onClose, process, onEdit }) => {
  if (!process) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProcessInitials = (processName) => {
    if (!processName) return 'P';
    
    const words = processName.split(' ');
    if (words.length >= 2) {
      return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
    }
    
    return processName.substring(0, 2).toUpperCase();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Get rate type chip color
  const getRateTypeChip = (rateType) => {
    const colors = {
      'Per Nos': { bg: '#F3E8FF', color: '#7C3AED', border: '#D8B4FE' },
      'Per Kg': { bg: '#DCFCE7', color: '#059669', border: '#86EFAC' },
      'Per Hour': { bg: '#F0F9FF', color: '#0C4A6E', border: '#BAE6FD' },
      'Fixed': { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' }
    };
    
    const color = colors[rateType] || { bg: '#F5F5F5', color: '#616161', border: '#E0E0E0' };
    
    return (
      <Chip
        label={rateType}
        sx={{
          bgcolor: color.bg,
          color: color.color,
          border: '1px solid',
          borderColor: color.border,
          fontWeight: 600,
          fontSize: '0.875rem',
          height: 32
        }}
      />
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          overflow: 'visible'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #E0E0E0', 
        pb: 2,
        backgroundColor: '#F8FAFC',
        pt: 3,
        px: 3
      }}>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#101010'
        }}>
          Process Details
        </div>
      </DialogTitle>
      
      <DialogContent sx={{ 
        pt: 4,
        px: 3,
        pb: 2
      }}>
        <Stack spacing={3}>
          {/* Header Section */}
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: '#4F46E5',
              fontSize: '1.5rem'
            }}>
              {getProcessInitials(process.ProcessName)}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={600} color="#101010">
                {process.ProcessName}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                <Chip
                  label={process.IsActive ? 'Active' : 'Inactive'}
                  color={process.IsActive ? 'success' : 'default'}
                  icon={process.IsActive ? <CheckCircle /> : <Cancel />}
                  sx={{ 
                    fontWeight: 500,
                    '&.MuiChip-colorSuccess': {
                      bgcolor: '#E8F5E9',
                      color: '#2E7D32'
                    },
                    '&.MuiChip-colorDefault': {
                      bgcolor: '#F5F5F5',
                      color: '#616161'
                    }
                  }}
                />
                <Chip
                  label={process.VendorOrInhouse}
                  icon={process.VendorOrInhouse === 'Vendor' ? <BusinessIcon /> : <FactoryIcon />}
                  sx={{ 
                    fontWeight: 500,
                    bgcolor: process.VendorOrInhouse === 'Vendor' ? '#FEF3C7' : '#DBEAFE',
                    color: process.VendorOrInhouse === 'Vendor' ? '#92400E' : '#1E40AF',
                    border: '1px solid',
                    borderColor: process.VendorOrInhouse === 'Vendor' ? '#FCD34D' : '#93C5FD'
                  }}
                />
              </Stack>
            </Box>
          </Stack>
          
          <Divider />
          
          {/* Rate Information Card */}
          <Card sx={{ 
            bgcolor: '#1E40AF',
            color: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent>
              <Typography variant="caption" color="rgba(255, 255, 255, 0.8)" gutterBottom>
                PROCESS RATE
              </Typography>
              <Typography variant="h2" fontWeight={800} sx={{ mb: 1 }}>
                {formatCurrency(process.Rate)}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <ScheduleIcon sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                <Typography variant="body1" color="rgba(255, 255, 255, 0.9)">
                  Per {process.RateType.toLowerCase().replace('per ', '')}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
          
          {/* Details Grid */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={600} color="#101010" gutterBottom>
                    <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Rate Information
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Rate Type
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {getRateTypeChip(process.RateType)}
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Calculated As
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatCurrency(process.Rate)} for each {process.RateType.toLowerCase().replace('per ', '')}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Process Type
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {process.VendorOrInhouse === 'Vendor' ? 'External Vendor Process' : 'In-house Manufacturing'}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={600} color="#101010" gutterBottom>
                    <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Description
                  </Typography>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: '#F9FAFB', 
                    borderRadius: 1,
                    minHeight: '120px'
                  }}>
                    <Typography variant="body2" color="textPrimary">
                      {process.Description || 'No description available for this process.'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Divider />
          
          {/* System Information */}
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600} color="#101010">
              <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
              System Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="textSecondary">
                      Created At
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(process.CreatedAt)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="textSecondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(process.UpdatedAt)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Stack>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        pb: 3, 
        pt: 2,
        borderTop: '1px solid #E0E0E0',
        backgroundColor: '#F8FAFC'
      }}>
        <Button 
          onClick={onClose}
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
        <Button
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
          Edit Process
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewProcess;