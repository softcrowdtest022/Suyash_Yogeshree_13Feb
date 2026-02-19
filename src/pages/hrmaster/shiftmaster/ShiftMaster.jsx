import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Typography,
  Snackbar,
  TablePagination,
  Stack,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Checkbox
} from '@mui/material';

import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  FilterList,
  Sort
} from '@mui/icons-material';

import axios from 'axios';
import BASE_URL from '../../../config/Config';

import AddShifts from './AddShifts';
import EditShifts from './EditShifts';
import AssignShift from './AssignShift';
import ViewShifts from './ViewShifts';

const HEADER_GRADIENT =
  'linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)';

const ShiftMaster = () => {

  const [shifts, setShifts] = useState([]);
  const [filteredShifts, setFilteredShifts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedShift, setSelectedShift] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedShiftForAction, setSelectedShiftForAction] = useState(null);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/shifts`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setShifts(res.data.data || []);
        setFilteredShifts(res.data.data || []);
      }
    } catch {
      showNotification('Failed to load shifts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = shifts.filter(shift =>
      shift?.ShiftName?.toLowerCase().includes(value) ||
      shift?.Code?.toLowerCase().includes(value)
    );

    setFilteredShifts(filtered);
    setPage(0);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(filteredShifts.map(s => s._id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(item => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  // 🔥 ACTION MENU HANDLERS

  const handleActionMenuOpen = (event, shift) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedShiftForAction(shift);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedShiftForAction(null);
  };

  const handleView = () => {
    setSelectedShift(selectedShiftForAction);
    setOpenViewModal(true);
    handleActionMenuClose();
  };

  const handleEdit = () => {
    setSelectedShift(selectedShiftForAction);
    setOpenEditModal(true);
    handleActionMenuClose();
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${BASE_URL}/api/shifts/${selectedShiftForAction._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification('Shift deleted successfully', 'success');
      fetchShifts();
    } catch (error) {
      showNotification(
        error.response?.data?.message || 'Delete failed',
        'error'
      );
    } finally {
      handleActionMenuClose();
    }
  };

  const showNotification = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const paginatedShifts = filteredShifts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>

      <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
        Shift Master
      </Typography>

      <Typography variant="body1" sx={{ mb: 3, color: '#64748b' }}>
        Manage and organize company shifts and scheduling details
      </Typography>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">

          <Stack direction="row" spacing={2}>
            <TextField
              placeholder="Search shift..."
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
            <Button startIcon={<FilterList />} variant="outlined">
              Filter
            </Button>
            <Button startIcon={<Sort />} variant="outlined">
              Sort
            </Button>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => setOpenAssignModal(true)}
            >
              Assign Shift
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddModal(true)}
              sx={{ background: HEADER_GRADIENT }}
            >
              Add Shift
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table>

            <TableHead>
              <TableRow sx={{ background: HEADER_GRADIENT }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    sx={{ color: '#fff' }}
                    checked={
                      selected.length === filteredShifts.length &&
                      filteredShifts.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell sx={{ color: '#fff' }}>Shift</TableCell>
                <TableCell sx={{ color: '#fff' }}>Code</TableCell>
                <TableCell sx={{ color: '#fff' }}>Timing</TableCell>
                <TableCell sx={{ color: '#fff' }}>Grace</TableCell>
                <TableCell sx={{ color: '#fff' }}>Status</TableCell>
                <TableCell sx={{ color: '#fff' }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                paginatedShifts.map((shift) => (
                  <TableRow key={shift._id} hover>

                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(shift._id)}
                        onChange={() => handleSelectOne(shift._id)}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={600}>
                        {shift.ShiftName}
                      </Typography>
                    </TableCell>

                    <TableCell>{shift.Code}</TableCell>

                    <TableCell>
                      {shift.StartTime} - {shift.EndTime}
                    </TableCell>

                    <TableCell>{shift.GracePeriod} min</TableCell>

                    <TableCell>
                      <Chip
                        label={shift.IsActive ? 'Active' : 'Inactive'}
                        color={shift.IsActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>

                    <TableCell align="center">
                      <IconButton
                        onClick={(e) => handleActionMenuOpen(e, shift)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>

          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredShifts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* ACTION MENU */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1, minWidth: 180, borderRadius: 2 }
        }}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <ViewIcon fontSize="small" color="info" />
          </ListItemIcon>
          <ListItemText primary="View Details" />
        </MenuItem>

        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText primary="Edit" />
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText
            primary="Delete"
            sx={{ color: 'error.main' }}
          />
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      <AddShifts open={openAddModal} onClose={() => setOpenAddModal(false)} onAdd={fetchShifts} />
      <EditShifts open={openEditModal} onClose={() => setOpenEditModal(false)} shift={selectedShift} onUpdate={fetchShifts} />
      <AssignShift open={openAssignModal} onClose={() => setOpenAssignModal(false)} />
      <ViewShifts open={openViewModal} onClose={() => setOpenViewModal(false)} shift={selectedShift} />

    </Box>
  );
};

export default ShiftMaster;