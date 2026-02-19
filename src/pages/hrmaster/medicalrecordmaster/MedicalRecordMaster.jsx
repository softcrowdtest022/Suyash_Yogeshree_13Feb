import React, { useEffect, useState } from "react";
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
  Checkbox,
  CircularProgress
} from "@mui/material";
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList,
  Sort,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

import AddMedicalRecord from "./AddMedicalRecord";
import EditMedicalRecord from "./EditMedicalRecord";
import DeleteMedicalRecord from "./DeleteMedicalRecord";
import ViewMedicalRecord from "./ViewMedicalRecord";

const HEADER_GRADIENT =
  "linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)";

const MedicalRecordMaster = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedRecordForAction, setSelectedRecordForAction] = useState(null);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    if (records.length > 0) {
      const filtered = records.filter((record) => {
        const employeeName = getEmployeeName(record.employee).toLowerCase();
        return employeeName.includes(searchTerm.toLowerCase());
      });
      setFilteredRecords(filtered);
      setPage(0);
    } else {
      setFilteredRecords([]);
    }
  }, [searchTerm, records]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/safety/medical-records`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data && response.data.success) {
        const recordsData = response.data.data || [];
        setRecords(recordsData);
        setFilteredRecords(recordsData);
      } else {
        setRecords([]);
        setFilteredRecords([]);
      }
      
    } catch (err) {
      console.error("Error fetching records:", err);
      showNotification("Failed to load records", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(filteredRecords.map(r => r._id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else {
      newSelected = selected.filter(item => item !== id);
    }
    
    setSelected(newSelected);
  };

  const handleActionMenuOpen = (event, record) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedRecordForAction(record);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedRecordForAction(null);
  };

  const handleView = () => {
    setSelectedRecord(selectedRecordForAction);
    setOpenViewModal(true);
    handleActionMenuClose();
  };

  const handleEdit = () => {
    setSelectedRecord(selectedRecordForAction);
    setOpenEditModal(true);
    handleActionMenuClose();
  };

  const handleDelete = () => {
    setSelectedRecord(selectedRecordForAction);
    setOpenDeleteModal(true);
    handleActionMenuClose();
  };

  const handleUpdateRecord = async (updatedRecord) => {
    // Refresh all records to get properly populated data
    await fetchRecords();
    showNotification("Medical record updated successfully", "success");
  };

  const handleDeleteRecord = async (deletedId) => {
    // Refresh all records after delete
    await fetchRecords();
    showNotification("Medical record deleted successfully", "success");
  };

  const handleAddRecord = async () => {
    // Refresh all records after add
    await fetchRecords();
    showNotification("Medical record added successfully", "success");
  };

  const showNotification = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleRefresh = () => {
    fetchRecords();
    showNotification("Data refreshed", "info");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Fit":
        return "success";
      case "Unfit":
        return "error";
      case "Temporarily Unfit":
        return "warning";
      case "Fit with Restrictions":
        return "info";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "-";
    }
  };

  const getEmployeeName = (employee) => {
    if (!employee) return "Unknown Employee";
    
    if (typeof employee === 'object' && employee !== null) {
      const firstName = employee.FirstName || '';
      const lastName = employee.LastName || '';
      const employeeId = employee.EmployeeID || '';
      
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
      if (employeeId) {
        return `Employee ${employeeId}`;
      }
    }
    
    return "Unknown Employee";
  };

  const getEmployeeId = (employee) => {
    if (!employee) return "-";
    if (typeof employee === 'object' && employee !== null) {
      return employee.EmployeeID || employee._id?.substring(0, 8) || "-";
    }
    return "-";
  };

  const paginatedRecords = filteredRecords.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
        Medical Records Management
      </Typography>

      <Typography variant="body1" sx={{ mb: 3, color: '#64748b' }}>
        Manage and track employee medical checkups and fitness records
      </Typography>

      {/* Action Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2}>
            <TextField
              placeholder="Search by employee name..."
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
            <Button 
              startIcon={<RefreshIcon />} 
              variant="outlined"
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </Stack>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddModal(true)}
            sx={{ background: HEADER_GRADIENT }}
          >
            Add Medical Record
          </Button>
        </Stack>
      </Paper>

      {/* Table */}
      <Paper sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: HEADER_GRADIENT }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    sx={{ color: '#fff' }}
                    checked={
                      selected.length === filteredRecords.length &&
                      filteredRecords.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell sx={{ color: '#fff' }}>Employee</TableCell>
                <TableCell sx={{ color: '#fff' }}>Employee ID</TableCell>
                <TableCell sx={{ color: '#fff' }}>Checkup Date</TableCell>
                <TableCell sx={{ color: '#fff' }}>Fitness Status</TableCell>
                <TableCell sx={{ color: '#fff' }}>Next Checkup</TableCell>
                <TableCell sx={{ color: '#fff' }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : paginatedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    {searchTerm ? "No records match your search" : "No medical records found"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRecords.map((record) => (
                  <TableRow key={record._id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(record._id)}
                        onChange={() => handleSelectOne(record._id)}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={600}>
                        {getEmployeeName(record.employee)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {getEmployeeId(record.employee)}
                    </TableCell>

                    <TableCell>
                      {formatDate(record.checkupDate)}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={record.fitnessStatus || "Unknown"}
                        color={getStatusColor(record.fitnessStatus)}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>

                    <TableCell>
                      {formatDate(record.nextCheckupDate)}
                    </TableCell>

                    <TableCell align="center">
                      <IconButton
                        onClick={(e) => handleActionMenuOpen(e, record)}
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

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRecords.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Action Menu */}
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
          
          <ListItemText primary="View Details" />
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>

      {/* Snackbar */}
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

      {/* Modals */}
      <AddMedicalRecord
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onAdd={handleAddRecord}
      />

      {selectedRecord && (
        <EditMedicalRecord
          open={openEditModal}
          onClose={() => {
            setOpenEditModal(false);
            setSelectedRecord(null);
          }}
          record={selectedRecord}
          onUpdate={handleUpdateRecord}
        />
      )}

      {selectedRecord && (
        <DeleteMedicalRecord
          open={openDeleteModal}
          onClose={() => {
            setOpenDeleteModal(false);
            setSelectedRecord(null);
          }}
          record={selectedRecord}
          onDelete={handleDeleteRecord}
        />
      )}

      {selectedRecord && (
        <ViewMedicalRecord
          open={openViewModal}
          onClose={() => {
            setOpenViewModal(false);
            setSelectedRecord(null);
          }}
          record={selectedRecord}
        />
      )}
    </Box>
  );
};

export default MedicalRecordMaster;