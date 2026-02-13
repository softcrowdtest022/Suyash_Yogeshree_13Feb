//employee can see list of all holidays

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  TablePagination
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Event as EventIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const ViewHoliday = ({ open, onClose }) => {
  const [holidays, setHolidays] = useState([]);
  const [filteredHolidays, setFilteredHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    if (open) {
      fetchHolidays();
    }
  }, [open]);

  useEffect(() => {
    // Filter holidays based on search term
    const filtered = holidays.filter(holiday => 
      holiday.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      holiday.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      holiday.Description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredHolidays(filtered);
    setPage(0);
  }, [searchTerm, holidays]);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${BASE_URL}/api/holidays`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Sort holidays by date (upcoming first)
        const sortedHolidays = (response.data.data || []).sort((a, b) => {
          return new Date(a.Date) - new Date(b.Date);
        });
        setHolidays(sortedHolidays);
        setFilteredHolidays(sortedHolidays);
      } else {
        setError('Failed to load holidays');
      }
    } catch (err) {
      console.error('Error fetching holidays:', err);
      setError('Failed to load holidays. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const isUpcoming = (dateString) => {
    const holidayDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return holidayDate >= today;
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get paginated data
  const paginatedHolidays = filteredHolidays.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '60vh',
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarIcon />
          <Typography variant="h6">Holiday Calendar</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Search Bar */}
        <Box sx={{ mb: 3, mt: 1 }}>
          <TextField
            fullWidth
            placeholder="Search holidays by name or description..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#64748B' }} />
                </InputAdornment>
              ),
              sx: { bgcolor: '#f8fafc' }
            }}
          />
        </Box>

        {/* Holiday Stats */}
        {!loading && !error && holidays.length > 0 && (
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Chip 
              icon={<EventIcon />} 
              label={`Total Holidays: ${holidays.length}`}
              variant="outlined"
              sx={{ bgcolor: '#f0f9ff' }}
            />
            <Chip 
              icon={<EventIcon />} 
              label={`Upcoming: ${holidays.filter(h => isUpcoming(h.Date)).length}`}
              color="success"
              variant="outlined"
            />
          </Stack>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Empty State */}
        {!loading && !error && filteredHolidays.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CalendarIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No Holidays Found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {searchTerm ? 'Try adjusting your search term' : 'There are no holidays scheduled'}
            </Typography>
          </Box>
        )}

        {/* Holidays Table */}
        {!loading && !error && filteredHolidays.length > 0 && (
          <>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Holiday Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Day</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedHolidays.map((holiday) => {
                    const holidayDate = new Date(holiday.Date);
                    const upcoming = isUpcoming(holiday.Date);
                    
                    return (
                      <TableRow 
                        key={holiday._id}
                        hover
                        sx={{
                          '&:hover': { bgcolor: '#f1f5f9' },
                          ...(upcoming && {
                            bgcolor: '#f0fdf4'
                          })
                        }}
                      >
                        <TableCell>
                          <Typography fontWeight={500}>
                            {holiday.Title || holiday.Name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography>
                            {formatDate(holiday.Date)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={holidayDate.toLocaleDateString('en-US', { weekday: 'long' })}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              bgcolor: '#f1f5f9',
                              color: '#334155'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {holiday.Description || 'No description'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={upcoming ? 'Upcoming' : 'Past'}
                            size="small"
                            color={upcoming ? 'success' : 'default'}
                            sx={{ 
                              ...(!upcoming && {
                                bgcolor: '#e2e8f0',
                                color: '#475569'
                              })
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <TablePagination
                component="div"
                count={filteredHolidays.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
        <Button 
          onClick={onClose}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0e7490 0%, #00B4D8 50%, #164e63 100%)'
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewHoliday;