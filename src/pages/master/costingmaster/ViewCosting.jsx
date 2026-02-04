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
  CardContent,
  LinearProgress
} from '@mui/material';
import { 
  Edit as EditIcon, 
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Percent as PercentIcon,
  Inventory as InventoryIcon,
  CalendarToday,
  CheckCircle,
  Cancel
} from '@mui/icons-material';

const ViewCosting = ({ open, onClose, costing, onEdit }) => {
  if (!costing) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPartInitials = (partNo) => {
    if (!partNo) return 'PN';
    return partNo.substring(0, 2).toUpperCase();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Calculate cost breakdown percentages
  const calculateBreakdown = () => {
    const total = costing.FinalRate;
    return {
      rmPercentage: ((costing.RMCost / total) * 100).toFixed(1),
      processPercentage: ((costing.ProcessCost / total) * 100).toFixed(1),
      finishingPercentage: ((costing.FinishingCost / total) * 100).toFixed(1),
      packingPercentage: ((costing.PackingCost / total) * 100).toFixed(1),
      overheadPercentage: ((costing.OverheadCost / total) * 100).toFixed(1),
      marginPercentage: ((costing.MarginCost / total) * 100).toFixed(1)
    };
  };

  const breakdown = calculateBreakdown();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
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
          Costing Details
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
              {getPartInitials(costing.PartNo)}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={600} color="#101010">
                {costing.PartNo}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                {costing.ItemID && (
                  <Chip
                    label={costing.ItemID.PartName}
                    size="small"
                    sx={{ 
                      fontWeight: 500,
                      bgcolor: '#E3F2FD',
                      color: '#1976D2'
                    }}
                  />
                )}
                <Chip
                  label={costing.IsActive ? 'Active' : 'Inactive'}
                  size="small"
                  color={costing.IsActive ? 'success' : 'default'}
                  icon={costing.IsActive ? <CheckCircle /> : <Cancel />}
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
              </Stack>
            </Box>
          </Stack>
          
          <Divider />
          
          {/* Final Rate Card */}
          <Card sx={{ 
            bgcolor: '#1E40AF',
            color: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent>
              <Typography variant="caption" color="rgba(255, 255, 255, 0.8)" gutterBottom>
                FINAL RATE
              </Typography>
              <Typography variant="h2" fontWeight={800} sx={{ mb: 1 }}>
                {formatCurrency(costing.FinalRate)}
              </Typography>
              <Typography variant="caption" color="rgba(255, 255, 255, 0.8)">
                Selling Price per {costing.ItemID?.Unit || 'Unit'}
              </Typography>
            </CardContent>
          </Card>
          
          {/* Cost Breakdown */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Typography variant="subtitle1" fontWeight={600} color="#101010">
                  <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Cost Components
                </Typography>
                
                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="textSecondary">
                            Raw Material Cost
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(costing.RMCost)} ({breakdown.rmPercentage}%)
                          </Typography>
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={parseFloat(breakdown.rmPercentage)} 
                          sx={{ 
                            mt: 1,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: '#FEE2E2',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#EF4444'
                            }
                          }}
                        />
                      </Box>
                      
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="textSecondary">
                            Process Cost
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(costing.ProcessCost)} ({breakdown.processPercentage}%)
                          </Typography>
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={parseFloat(breakdown.processPercentage)} 
                          sx={{ 
                            mt: 1,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: '#FEF3C7',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#D97706'
                            }
                          }}
                        />
                      </Box>
                      
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="textSecondary">
                            Finishing Cost
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(costing.FinishingCost)} ({breakdown.finishingPercentage}%)
                          </Typography>
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={parseFloat(breakdown.finishingPercentage)} 
                          sx={{ 
                            mt: 1,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: '#DBEAFE',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#3B82F6'
                            }
                          }}
                        />
                      </Box>
                      
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="textSecondary">
                            Packing Cost
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(costing.PackingCost)} ({breakdown.packingPercentage}%)
                          </Typography>
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={parseFloat(breakdown.packingPercentage)} 
                          sx={{ 
                            mt: 1,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: '#E0E7FF',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#8B5CF6'
                            }
                          }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Typography variant="subtitle1" fontWeight={600} color="#101010">
                  <PercentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Margin & Overhead
                </Typography>
                
                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="textSecondary">
                            Sub Total (Direct Costs)
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(costing.SubCost)}
                          </Typography>
                        </Stack>
                      </Box>
                      
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="textSecondary">
                            Overhead ({costing.OverheadPercentage}%)
                          </Typography>
                          <Typography variant="body2" fontWeight={600} color="#7C3AED">
                            + {formatCurrency(costing.OverheadCost)} ({breakdown.overheadPercentage}%)
                          </Typography>
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={parseFloat(breakdown.overheadPercentage)} 
                          sx={{ 
                            mt: 1,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: '#F3E8FF',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#7C3AED'
                            }
                          }}
                        />
                      </Box>
                      
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="textSecondary">
                            Margin ({costing.MarginPercentage}%)
                          </Typography>
                          <Typography variant="body2" fontWeight={600} color="#059669">
                            + {formatCurrency(costing.MarginCost)} ({breakdown.marginPercentage}%)
                          </Typography>
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={parseFloat(breakdown.marginPercentage)} 
                          sx={{ 
                            mt: 1,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: '#DCFCE7',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#059669'
                            }
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ 
                        pt: 2, 
                        borderTop: '2px solid #E5E7EB',
                        mt: 1
                      }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body1" fontWeight={700} color="#101010">
                            Final Rate
                          </Typography>
                          <Typography variant="h5" fontWeight={800} color="#059669">
                            {formatCurrency(costing.FinalRate)}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
          
          {/* Item Information */}
          {costing.ItemID && (
            <>
              <Divider />
              
              <Stack spacing={2}>
                <Typography variant="subtitle1" fontWeight={600} color="#101010">
                  <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Item Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="caption" color="textSecondary">
                          Part Details
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {costing.ItemID.PartName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Unit: {costing.ItemID.Unit}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {costing.ItemID.MaterialID && (
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="textSecondary">
                            Material Information
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {costing.ItemID.MaterialID.MaterialName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Code: {costing.ItemID.MaterialID.MaterialCode} • Density: {costing.ItemID.MaterialID.Density} g/cm³
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </Stack>
            </>
          )}
          
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
                      {formatDate(costing.CreatedAt)}
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
                      {formatDate(costing.UpdatedAt)}
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
          Edit Costing
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewCosting;