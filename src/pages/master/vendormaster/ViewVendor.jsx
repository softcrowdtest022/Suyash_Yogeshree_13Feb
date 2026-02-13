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
  Grid
} from '@mui/material';
import { Edit as EditIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon } from '@mui/icons-material';

const ViewVendor = ({ open, onClose, vendor, onEdit }) => {
  if (!vendor) return null;

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
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #E0E0E0', 
        pb: 2,
        backgroundColor: '#F8FAFC'
      }}>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#101010',
          paddingTop: '8px'
        }}>
          Vendor Details
        </div>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1}>
                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                  Vendor Code
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ fontSize: '1rem' }}>
                  {vendor.VendorCode}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1}>
                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                  Status
                </Typography>
                {vendor.IsActive ? (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Active"
                    size="small"
                    sx={{
                      bgcolor: '#dcfce7',
                      color: '#166534',
                      border: '1px solid #86efac',
                      fontWeight: 500,
                      width: 'fit-content',
                      '& .MuiChip-icon': {
                        color: '#166534',
                        fontSize: 14
                      }
                    }}
                  />
                ) : (
                  <Chip
                    icon={<CancelIcon />}
                    label="Inactive"
                    size="small"
                    sx={{
                      bgcolor: '#fee2e2',
                      color: '#991b1b',
                      border: '1px solid #fca5a5',
                      fontWeight: 500,
                      width: 'fit-content',
                      '& .MuiChip-icon': {
                        color: '#991b1b',
                        fontSize: 14
                      }
                    }}
                  />
                )}
              </Stack>
            </Grid>
          </Grid>

          <Divider />

          <Stack spacing={2}>
            <Stack spacing={1}>
              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                Vendor Name
              </Typography>
              <Typography variant="body1" fontWeight={500} sx={{ fontSize: '1rem' }}>
                {vendor.VendorName}
              </Typography>
            </Stack>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                    Contact Person
                  </Typography>
                  <Typography variant="body1" color="textPrimary" sx={{ fontSize: '0.875rem' }}>
                    {vendor.ContactPerson}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                    Phone
                  </Typography>
                  <Typography variant="body1" color="textPrimary" sx={{ fontSize: '0.875rem' }}>
                    {vendor.Phone}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>

            <Stack spacing={1}>
              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                Email
              </Typography>
              <Typography variant="body1" color="textPrimary" sx={{ fontSize: '0.875rem' }}>
                {vendor.Email || 'Not provided'}
              </Typography>
            </Stack>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Typography variant="subtitle2" fontWeight={600} color="textPrimary">
              GST & State Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                    GSTIN
                  </Typography>
                  <Typography variant="body1" color="textPrimary" sx={{ fontSize: '0.875rem' }}>
                    {vendor.GSTIN || 'Not provided'}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                    State
                  </Typography>
                  <Typography variant="body1" color="textPrimary" sx={{ fontSize: '0.875rem' }}>
                    {vendor.State || 'Not specified'}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>

            <Stack spacing={1}>
              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                State Code
              </Typography>
              <Typography variant="body1" color="textPrimary" sx={{ fontSize: '0.875rem' }}>
                {vendor.StateCode || 'Not specified'}
              </Typography>
            </Stack>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Typography variant="subtitle2" fontWeight={600} color="textPrimary">
              Address Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                    Billing Address
                  </Typography>
                  <Typography variant="body1" color="textPrimary" sx={{ 
                    fontSize: '0.875rem',
                    backgroundColor: '#F8FAFC',
                    p: 2,
                    borderRadius: 1,
                    minHeight: '80px'
                  }}>
                    {vendor.BillingAddress || 'Not provided'}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                    Shipping Address
                  </Typography>
                  <Typography variant="body1" color="textPrimary" sx={{ 
                    fontSize: '0.875rem',
                    backgroundColor: '#F8FAFC',
                    p: 2,
                    borderRadius: 1,
                    minHeight: '80px'
                  }}>
                    {vendor.ShippingAddress || 'Not provided'}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Stack spacing={1}>
              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                Payment Terms
              </Typography>
              <Typography variant="body1" color="textPrimary" sx={{ fontSize: '0.875rem' }}>
                {vendor.PaymentTerms || 'Not specified'}
              </Typography>
            </Stack>

            <Stack spacing={1}>
              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                Created At
              </Typography>
              <Typography variant="body2" color="textPrimary" sx={{ fontSize: '0.875rem' }}>
                {formatDate(vendor.CreatedAt)}
              </Typography>
            </Stack>
            
            <Stack spacing={1}>
              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                Last Updated
              </Typography>
              <Typography variant="body2" color="textPrimary" sx={{ fontSize: '0.875rem' }}>
                {formatDate(vendor.UpdatedAt)}
              </Typography>
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
          Edit Vendor
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewVendor;