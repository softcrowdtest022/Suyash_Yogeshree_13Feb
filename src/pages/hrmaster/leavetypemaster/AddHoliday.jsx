import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Alert,
    FormControlLabel,
    Switch,
    MenuItem,
    Box
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const AddHoliday = ({ open, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        Name: '',
        Date: '',
        Type: '',
        Description: '',
        Year: new Date().getFullYear(),
        IsRecurring: false,
        IsActive: true
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Submit
    const handleSubmit = async () => {
        if (!formData.Name.trim()) {
            setError('Holiday name is required');
            return;
        }

        if (!formData.Date) {
            setError('Holiday date is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');

            const response = await axios.post(
                `${BASE_URL}/api/holidays`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                onAdd(response.data.data);
                if (onAdd) {
                    onAdd(response.data.data);
                }
                resetForm();
                onClose();
            } else {
                setError(response.data.message || 'Failed to add holiday');
            }

        } catch (err) {
            console.error('Error adding holiday:', err);
            setError(
                err.response?.data?.message ||
                'Failed to add holiday. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            Name: '',
            Date: '',
            Type: '',
            Description: '',
            Year: new Date().getFullYear(),
            IsRecurring: false,
            IsActive: true
        });
        setError('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle
                sx={{
                    borderBottom: '1px solid #E0E0E0',
                    pb: 2,
                    backgroundColor: '#F8FAFC'
                }}
            >
                <div style={{ fontSize: 20, fontWeight: 600 }}>
                    Add New Holiday
                </div>
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                <Stack spacing={3} sx={{ mt: 2 }}>

                    <TextField
                        fullWidth
                        label="Holiday Name"
                        name="Name"
                        value={formData.Name}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />

                    <TextField
                        fullWidth
                        type="date"
                        label="Holiday Date"
                        name="Date"
                        InputLabelProps={{ shrink: true }}
                        value={formData.Date}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />

                    <TextField
                        fullWidth
                        select
                        label="Holiday Type"
                        name="Type"
                        value={formData.Type}
                        onChange={handleChange}
                        disabled={loading}
                    >
                        <MenuItem value="National">National</MenuItem>
                        <MenuItem value="Festival">Festival</MenuItem>
                        <MenuItem value="Company">Company</MenuItem>
                        <MenuItem value="Optional">Optional</MenuItem>
                    </TextField>

                    <TextField
                        fullWidth
                        label="Year"
                        name="Year"
                        type="number"
                        value={formData.Year}
                        onChange={handleChange}
                        disabled={loading}
                    />

                    <TextField
                        fullWidth
                        label="Description"
                        name="Description"
                        value={formData.Description}
                        onChange={handleChange}
                        multiline
                        rows={3}
                        disabled={loading}
                    />

                    <Box
                        sx={{
                            display: "flex",
                            gap: 10,
                            alignItems: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.IsRecurring}
                                    onChange={handleChange}
                                    name="IsRecurring"
                                    disabled={loading}
                                />
                            }
                            label="Recurring Every Year"
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.IsActive}
                                    onChange={handleChange}
                                    name="IsActive"
                                    disabled={loading}
                                />
                            }
                            label="Active"
                        />
                    </Box>

                    {error && <Alert severity="error">{error}</Alert>}

                </Stack>
            </DialogContent>

            <DialogActions
                sx={{
                    px: 3,
                    pb: 3,
                    borderTop: '1px solid #E0E0E0',
                    pt: 2,
                    backgroundColor: '#F8FAFC'
                }}
            >
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading ? null : <AddIcon />}
                >
                    {loading ? 'Adding...' : 'Add Holiday'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddHoliday;
