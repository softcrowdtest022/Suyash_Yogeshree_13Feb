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
  Grid
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Height as HeightIcon,
  WidthWide as WidthIcon, // Changed from Width to WidthWide
  Straighten as StraightenIcon,
  Scale as ScaleIcon,
  CalendarToday,
  Inventory
} from '@mui/icons-material';

const ViewDimensions = ({ open, onClose, dimension, onEdit }) => {
  if (!dimension) return null;

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

  const calculateVolume = () => {
    const thicknessM = dimension.Thickness / 1000;
    const widthM = dimension.Width / 1000;
    const lengthM = dimension.Length / 1000;
    return thicknessM * widthM * lengthM;
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
          Dimension Weight Details
        </div>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: '#4F46E5',
              fontSize: '1.5rem'
            }}>
              {getPartInitials(dimension.PartNo)}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={600} color="#101010">
                {dimension.PartNo}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                {dimension.Item && (
                  <Chip
                    label={dimension.Item.PartName}
                    size="small"
                    sx={{ 
                      fontWeight: 500,
                      bgcolor: '#E3F2FD',
                      color: '#1976D2'
                    }}
                  />
                )}
                <Chip
                  label={`Weight: ${dimension.WeightInKG} kg`}
                  size="small"
                  sx={{ 
                    fontWeight: 500,
                    bgcolor: '#E8F5E9',
                    color: '#2E7D32'
                  }}
                />
              </Stack>
            </Box>
          </Stack>
          
          <Divider />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Typography variant="subtitle1" fontWeight={600} color="#101010">
                  <StraightenIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Dimensions
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: '#F5F5F5', 
                      borderRadius: 1,
                      textAlign: 'center'
                    }}>
                      <HeightIcon sx={{ color: '#4F46E5', fontSize: 40, mb: 1 }} />
                      <Typography variant="caption" color="textSecondary">
                        Thickness
                      </Typography>
                      <Typography variant="h6" color="#101010" fontWeight={600}>
                        {dimension.Thickness} mm
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: '#F5F5F5', 
                      borderRadius: 1,
                      textAlign: 'center'
                    }}>
                      <WidthIcon sx={{ color: '#10B981', fontSize: 40, mb: 1 }} />
                      <Typography variant="caption" color="textSecondary">
                        Width
                      </Typography>
                      <Typography variant="h6" color="#101010" fontWeight={600}>
                        {dimension.Width} mm
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: '#F5F5F5', 
                      borderRadius: 1,
                      textAlign: 'center'
                    }}>
                      <StraightenIcon sx={{ color: '#F59E0B', fontSize: 40, mb: 1 }} />
                      <Typography variant="caption" color="textSecondary">
                        Length
                      </Typography>
                      <Typography variant="h6" color="#101010" fontWeight={600}>
                        {dimension.Length} mm
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Typography variant="subtitle1" fontWeight={600} color="#101010">
                  <ScaleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Material & Weight
                </Typography>
                
                <Box sx={{ 
                  p: 3, 
                  bgcolor: '#E8F5E9', 
                  borderRadius: 1,
                  border: '1px solid #C8E6C9'
                }}>
                  <Typography variant="caption" color="textSecondary">
                    Density
                  </Typography>
                  <Typography variant="h4" color="#2E7D32" fontWeight={700} gutterBottom>
                    {dimension.Density} g/cm³
                  </Typography>
                  
                  <Typography variant="caption" color="textSecondary">
                    Calculated Weight
                  </Typography>
                  <Typography variant="h3" color="#101010" fontWeight={800}>
                    {dimension.WeightInKG} kg
                  </Typography>
                  
                  <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 2 }}>
                    Volume: {calculateVolume().toFixed(8)} m³
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
          
          {dimension.Item && (
            <>
              <Divider />
              
              <Stack spacing={2}>
                <Typography variant="subtitle1" fontWeight={600} color="#101010">
                  Item Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Part Name
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {dimension.Item.PartName}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Description
                      </Typography>
                      <Typography variant="body2" color="textPrimary">
                        {dimension.Item.Description}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  {dimension.Item.MaterialID && (
                    <Grid item xs={12}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: '#F0F9FF', 
                        borderRadius: 1,
                        border: '1px solid #E0F2FE'
                      }}>
                        <Typography variant="subtitle2" fontWeight={600} color="#0C4A6E" gutterBottom>
                          Material Information
                        </Typography>
                        <Stack direction="row" spacing={3}>
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              Material Code
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {dimension.Item.MaterialID.MaterialCode}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              Material Name
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {dimension.Item.MaterialID.MaterialName}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              Material Density
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {dimension.Item.MaterialID.Density} g/cm³
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Stack>
            </>
          )}
          
          <Divider />
          
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600} color="#101010">
              <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
              System Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Created At
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(dimension.CreatedAt)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(dimension.UpdatedAt)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
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
          Edit Dimension
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewDimensions;