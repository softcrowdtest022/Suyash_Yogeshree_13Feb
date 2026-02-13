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
  Grid,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  Edit as EditIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  DateRange as DateIcon,
  MonetizationOn as MoneyIcon,
  Receipt as ReceiptIcon,
  Assignment as AssignmentIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';

const ViewQuotation = ({ open, onClose, quotation, onEdit }) => {
  if (!quotation) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': { bg: '#FEF3C7', text: '#92400E', border: '#FBBF24' },
      'Sent': { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
      'Approved': { bg: '#D1FAE5', text: '#065F46', border: '#34D399' },
      'Rejected': { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' }
    };
    return colors[status] || colors.Draft;
  };

  const statusColors = getStatusColor(quotation.Status);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
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
        pt: 3,
        px: 3
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#101010'
            }}>
              Quotation Details
            </div>
            <Typography variant="body2" color="textSecondary">
              {quotation.QuotationNo}
            </Typography>
          </Box>
          <Chip
            label={quotation.Status}
            sx={{
              bgcolor: statusColors.bg,
              color: statusColors.text,
              border: `1px solid ${statusColors.border}`,
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          />
        </Stack>
      </DialogTitle>
      
      <DialogContent sx={{ 
        pt: 4,
        px: 3,
        pb: 2,
        overflow: 'auto'
      }}>
        <Stack spacing={4}>
          {/* Header Section */}
          <Paper sx={{ p: 3, bgcolor: '#F8FAFC', borderRadius: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <BusinessIcon color="primary" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Company
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {quotation.CompanyName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        GSTIN: {quotation.CompanyGSTIN} • State: {quotation.CompanyState} ({quotation.CompanyStateCode})
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <BusinessIcon color="primary" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Vendor
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {quotation.VendorName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        GSTIN: {quotation.VendorGSTIN} • PAN: {quotation.VendorPAN}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Vendor Details */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Vendor Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PersonIcon sx={{ fontSize: 16, color: '#64748B' }} />
                    <Typography variant="caption" color="textSecondary">
                      Contact Person
                    </Typography>
                  </Stack>
                  <Typography variant="body2">
                    {quotation.VendorContactPerson}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PhoneIcon sx={{ fontSize: 16, color: '#64748B' }} />
                    <Typography variant="caption" color="textSecondary">
                      Phone
                    </Typography>
                  </Stack>
                  <Typography variant="body2">
                    {quotation.VendorPhone}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <EmailIcon sx={{ fontSize: 16, color: '#64748B' }} />
                    <Typography variant="caption" color="textSecondary">
                      Email
                    </Typography>
                  </Stack>
                  <Typography variant="body2">
                    {quotation.VendorEmail}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <LocationIcon sx={{ fontSize: 16, color: '#64748B' }} />
                    <Typography variant="caption" color="textSecondary">
                      Address
                    </Typography>
                  </Stack>
                  <Typography variant="body2">
                    {quotation.VendorAddress}, {quotation.VendorCity} - {quotation.VendorPincode}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Date Information */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Date Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <DateIcon sx={{ fontSize: 16, color: '#64748B' }} />
                    <Typography variant="caption" color="textSecondary">
                      Quotation Date
                    </Typography>
                  </Stack>
                  <Typography variant="body2" fontWeight={500}>
                    {formatDate(quotation.QuotationDate)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <DateIcon sx={{ fontSize: 16, color: '#64748B' }} />
                    <Typography variant="caption" color="textSecondary">
                      Valid Till
                    </Typography>
                  </Stack>
                  <Typography variant="body2" fontWeight={500}>
                    {formatDate(quotation.ValidTill)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ShippingIcon sx={{ fontSize: 16, color: '#64748B' }} />
                    <Typography variant="caption" color="textSecondary">
                      Vendor Type
                    </Typography>
                  </Stack>
                  <Typography variant="body2" fontWeight={500}>
                    {quotation.VendorType}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Items Table */}
          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Items ({quotation.Items?.length || 0})
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    <TableCell><Typography variant="caption" fontWeight={600}>Sr. No</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontWeight={600}>Part No</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontWeight={600}>Part Name</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontWeight={600}>Description</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontWeight={600}>HSN Code</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontWeight={600}>Unit</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontWeight={600}>Quantity</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontWeight={600}>Rate</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontWeight={600}>Amount</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quotation.Items?.map((item, index) => (
                    <TableRow key={item._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {item.PartNo}
                        </Typography>
                      </TableCell>
                      <TableCell>{item.PartName}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                          {item.Description}
                        </Typography>
                      </TableCell>
                      <TableCell>{item.HSNCode}</TableCell>
                      <TableCell>{item.Unit}</TableCell>
                      <TableCell>{item.Quantity}</TableCell>
                      <TableCell>{formatCurrency(item.FinalRate)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(item.Amount)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Amount Summary */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Amount Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Sub Total:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatCurrency(quotation.SubTotal)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">GST ({quotation.GSTPercentage}%):</Typography>
                    <Typography variant="body2" fontWeight={600} color="error.main">
                      {formatCurrency(quotation.GSTAmount)}
                    </Typography>
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body1" fontWeight={600}>Grand Total:</Typography>
                    <Typography variant="h6" fontWeight={700} color="success.main">
                      {formatCurrency(quotation.GrandTotal)}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, bgcolor: '#F0F9FF', height: '100%' }}>
                  <Typography variant="caption" color="textSecondary">
                    Amount in Words:
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                    {quotation.AmountInWords}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {/* Terms & Conditions */}
          {quotation.TermsConditions?.length > 0 && (
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Terms & Conditions
              </Typography>
              <List dense>
                {quotation.TermsConditions.map((term, index) => (
                  <ListItem key={term._id} alignItems="flex-start">
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {term.Sequence}.
                      </Typography>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight={600}>
                          {term.Title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="textSecondary">
                          {term.Description}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Remarks */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Remarks
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="caption" color="textSecondary">
                    Internal Remarks
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: '#F8FAFC', minHeight: 80 }}>
                    <Typography variant="body2">
                      {quotation.InternalRemarks || 'No internal remarks'}
                    </Typography>
                  </Paper>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="caption" color="textSecondary">
                    Vendor Remarks
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: '#F8FAFC', minHeight: 80 }}>
                    <Typography variant="body2">
                      {quotation.VendorRemarks || 'No vendor remarks'}
                    </Typography>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* System Information */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              System Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Stack spacing={1}>
                  <Typography variant="caption" color="textSecondary">
                    Created At
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(quotation.createdAt)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Stack spacing={1}>
                  <Typography variant="caption" color="textSecondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(quotation.updatedAt)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Stack spacing={1}>
                  <Typography variant="caption" color="textSecondary">
                    GST Type
                  </Typography>
                  <Typography variant="body2">
                    {quotation.GSTType}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
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
          Edit Quotation
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewQuotation;