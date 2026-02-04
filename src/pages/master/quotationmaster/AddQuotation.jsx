import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  Grid,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Autocomplete
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, AddCircle as AddCircleIcon } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const AddQuotation = ({ open, onClose, onAdd }) => {
  const [vendorType, setVendorType] = useState('Existing');
  const [formData, setFormData] = useState({
    VendorType: 'Existing',
    VendorID: '',
    ValidTill: '',
    InternalRemarks: '',
    CustomerRemarks: '',
    Items: []
  });
  
  const [newVendor, setNewVendor] = useState({
    VendorName: '',
    GSTIN: '',
    State: '',
    StateCode: '',
    Address: '',
    City: '',
    Pincode: '',
    ContactPerson: '',
    Phone: '',
    Email: '',
    PAN: ''
  });
  
  const [itemInput, setItemInput] = useState({
    PartNo: '',
    Quantity: '',
    PartName: '' // Store part name for display
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State for fetched data
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  // Fetch vendors and items when modal opens
  useEffect(() => {
    if (open) {
      fetchVendors();
      fetchItems();
    }
  }, [open]);

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/vendors`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setVendors(response.data.data || []);
      } else {
        console.error('Failed to fetch vendors:', response.data.message);
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Failed to load vendors. Please try again.');
    }
  };

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        const itemsData = response.data.data || [];
        setItems(itemsData);
        setFilteredItems(itemsData);
      } else {
        console.error('Failed to fetch items:', response.data.message);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load items. Please try again.');
    }
  };

  const handleVendorTypeChange = (event) => {
    const type = event.target.value;
    setVendorType(type);
    setFormData(prev => ({ ...prev, VendorType: type }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewVendorChange = (e) => {
    const { name, value } = e.target;
    setNewVendor(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemInputChange = (e) => {
    const { name, value } = e.target;
    setItemInput(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle autocomplete selection for Part No
  const handlePartNoChange = (event, value) => {
    if (value) {
      const selectedItem = items.find(item => item.PartNo === value);
      setItemInput(prev => ({
        ...prev,
        PartNo: value,
        PartName: selectedItem ? selectedItem.PartName : ''
      }));
    } else {
      setItemInput(prev => ({
        ...prev,
        PartNo: '',
        PartName: ''
      }));
    }
  };

  const handleAddItem = () => {
    if (!itemInput.PartNo.trim() || !itemInput.Quantity || parseInt(itemInput.Quantity) <= 0) {
      setError('Please enter valid Part No and Quantity');
      return;
    }

    // Find the item details
    const selectedItem = items.find(item => item.PartNo === itemInput.PartNo);
    if (!selectedItem) {
      setError('Selected Part No not found in items list');
      return;
    }

    const newItem = {
      PartNo: itemInput.PartNo,
      Quantity: parseInt(itemInput.Quantity),
      PartName: selectedItem.PartName || '',
      Unit: selectedItem.Unit || '',
      HSNCode: selectedItem.HSNCode || ''
    };

    setFormData(prev => ({
      ...prev,
      Items: [...prev.Items, newItem]
    }));

    setItemInput({ PartNo: '', Quantity: '', PartName: '' });
    setError('');
  };

  const handleRemoveItem = (index) => {
    const updatedItems = formData.Items.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      Items: updatedItems
    }));
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const validateForm = () => {
    if (!formData.ValidTill) {
      setError('Valid Till date is required');
      return false;
    }

    if (vendorType === 'Existing' && !formData.VendorID) {
      setError('Please select a vendor');
      return false;
    }

    if (vendorType === 'New') {
      const requiredFields = ['VendorName', 'GSTIN', 'State', 'Address', 'ContactPerson', 'Phone', 'Email'];
      for (const field of requiredFields) {
        if (!newVendor[field]?.trim()) {
          setError(`Please fill in all required vendor fields`);
          return false;
        }
      }
    }

    if (formData.Items.length === 0) {
      setError('Please add at least one item');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    const payload = {
      VendorType: vendorType,
      ValidTill: formData.ValidTill,
      Items: formData.Items.map(item => ({
        PartNo: item.PartNo,
        Quantity: item.Quantity
      })),
      InternalRemarks: formData.InternalRemarks,
      CustomerRemarks: formData.CustomerRemarks
    };

    if (vendorType === 'Existing') {
      payload.VendorID = formData.VendorID;
    } else {
      payload.NewVendor = newVendor;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/api/quotations`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        onAdd(response.data.data);
        resetForm();
        onClose();
      } else {
        setError(response.data.message || 'Failed to add quotation');
      }
    } catch (err) {
      console.error('Error adding quotation:', err);
      setError(err.response?.data?.message || 'Failed to add quotation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setVendorType('Existing');
    setFormData({
      VendorType: 'Existing',
      VendorID: '',
      ValidTill: '',
      InternalRemarks: '',
      CustomerRemarks: '',
      Items: []
    });
    setNewVendor({
      VendorName: '',
      GSTIN: '',
      State: '',
      StateCode: '',
      Address: '',
      City: '',
      Pincode: '',
      ContactPerson: '',
      Phone: '',
      Email: '',
      PAN: ''
    });
    setItemInput({ PartNo: '', Quantity: '', PartName: '' });
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Get unique part numbers from items
  const partNoOptions = items.map(item => item.PartNo).filter(Boolean);

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
        pt: 3,
        px: 3
      }}>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#101010'
        }}>
          Add New Quotation
        </div>
      </DialogTitle>
      
      <DialogContent sx={{ 
        pt: 4,
        px: 3,
        pb: 2,
        overflow: 'auto'
      }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 1,
              mb: 3,
              '& .MuiAlert-icon': {
                alignItems: 'center'
              }
            }}
          >
            {error}
          </Alert>
        )}

        <Stack spacing={4}>
          {/* Vendor Type Selection */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Vendor Type
            </Typography>
            <RadioGroup
              row
              value={vendorType}
              onChange={handleVendorTypeChange}
            >
              <FormControlLabel value="Existing" control={<Radio />} label="Existing Vendor" />
              <FormControlLabel value="New" control={<Radio />} label="New Vendor" />
            </RadioGroup>
          </Box>

          {/* Vendor Details */}
          {vendorType === 'Existing' ? (
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Select Vendor
              </Typography>
              <FormControl fullWidth>
                <InputLabel id="vendor-label">Select Vendor *</InputLabel>
                <Select
                  labelId="vendor-label"
                  name="VendorID"
                  value={formData.VendorID}
                  onChange={handleFormChange}
                  disabled={loading || vendors.length === 0}
                  label="Select Vendor *"
                >
                  <MenuItem value="">
                    <em>Select a vendor</em>
                  </MenuItem>
                  {vendors.map((vendor) => (
                    <MenuItem key={vendor._id} value={vendor._id}>
                      {vendor.VendorName} ({vendor.GSTIN})
                    </MenuItem>
                  ))}
                </Select>
                {vendors.length === 0 && (
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                    No vendors found. Please add vendors first.
                  </Typography>
                )}
              </FormControl>
            </Box>
          ) : (
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                New Vendor Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Vendor Name *"
                    name="VendorName"
                    value={newVendor.VendorName}
                    onChange={handleNewVendorChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="GSTIN *"
                    name="GSTIN"
                    value={newVendor.GSTIN}
                    onChange={handleNewVendorChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="State *"
                    name="State"
                    value={newVendor.State}
                    onChange={handleNewVendorChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="State Code"
                    name="StateCode"
                    value={newVendor.StateCode}
                    onChange={handleNewVendorChange}
                    type="number"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address *"
                    name="Address"
                    value={newVendor.Address}
                    onChange={handleNewVendorChange}
                    required
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="City"
                    value={newVendor.City}
                    onChange={handleNewVendorChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pincode"
                    name="Pincode"
                    value={newVendor.Pincode}
                    onChange={handleNewVendorChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Person *"
                    name="ContactPerson"
                    value={newVendor.ContactPerson}
                    onChange={handleNewVendorChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone *"
                    name="Phone"
                    value={newVendor.Phone}
                    onChange={handleNewVendorChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email *"
                    name="Email"
                    value={newVendor.Email}
                    onChange={handleNewVendorChange}
                    required
                    type="email"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="PAN"
                    name="PAN"
                    value={newVendor.PAN}
                    onChange={handleNewVendorChange}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Valid Till Date */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Quotation Validity
            </Typography>
            <TextField
              fullWidth
              label="Valid Till *"
              name="ValidTill"
              type="date"
              value={formData.ValidTill}
              onChange={handleFormChange}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: getTodayDate()
              }}
            />
          </Box>

          {/* Items Section */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Items
            </Typography>
            
            {/* Add Item Form */}
            <Paper sx={{ p: 2, mb: 2, bgcolor: '#F8FAFC' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    freeSolo
                    options={partNoOptions}
                    value={itemInput.PartNo}
                    onChange={handlePartNoChange}
                    onInputChange={(event, newInputValue) => {
                      setItemInput(prev => ({ ...prev, PartNo: newInputValue }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Part No *"
                        placeholder="Search or select part number"
                      />
                    )}
                    renderOption={(props, option) => {
                      const item = items.find(i => i.PartNo === option);
                      return (
                        <li {...props}>
                          <Box>
                            <Typography variant="body2">{option}</Typography>
                            {item && (
                              <Typography variant="caption" color="textSecondary">
                                {item.PartName} • {item.Unit || 'No unit'}
                              </Typography>
                            )}
                          </Box>
                        </li>
                      );
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Quantity *"
                    name="Quantity"
                    value={itemInput.Quantity}
                    onChange={handleItemInputChange}
                    type="number"
                    placeholder="Enter quantity"
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleAddItem}
                    startIcon={<AddCircleIcon />}
                    disabled={!itemInput.PartNo || !itemInput.Quantity}
                  >
                    Add
                  </Button>
                </Grid>
                {itemInput.PartName && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">
                      Selected: {itemInput.PartName}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Items Table */}
            {formData.Items.length > 0 ? (
              <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sr. No</TableCell>
                      <TableCell>Part No</TableCell>
                      <TableCell>Part Name</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.Items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.PartNo}</TableCell>
                        <TableCell>{item.PartName}</TableCell>
                        <TableCell>{item.Quantity}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveItem(index)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 1 }}>
                No items added yet. Please add items to create quotation.
              </Alert>
            )}
            
            {formData.Items.length > 0 && (
              <Chip
                label={`${formData.Items.length} item(s) added`}
                color="primary"
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          {/* Remarks */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Remarks
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Internal Remarks"
                  name="InternalRemarks"
                  value={formData.InternalRemarks}
                  onChange={handleFormChange}
                  multiline
                  rows={2}
                  placeholder="Internal notes or instructions..."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Customer Remarks"
                  name="CustomerRemarks"
                  value={formData.CustomerRemarks}
                  onChange={handleFormChange}
                  multiline
                  rows={2}
                  placeholder="Message for the customer..."
                />
              </Grid>
            </Grid>
          </Box>
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
          onClick={handleClose} 
          disabled={loading}
          sx={{
            borderRadius: 1,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? null : <AddIcon />}
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
          {loading ? 'Creating...' : 'Create Quotation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddQuotation;