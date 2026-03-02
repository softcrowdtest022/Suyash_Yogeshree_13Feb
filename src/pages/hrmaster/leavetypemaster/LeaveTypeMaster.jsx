// LeaveTypeMaster.jsx
import React, { useState, useEffect } from "react";
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
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";

import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Sort as SortIcon
} from "@mui/icons-material";

import axios from "axios";
import BASE_URL from "../../../config/Config";

/* COMPONENTS */
import AddLeaveTypes from "./AddLeaveTypes";
import EditLeaveTypes from "./EditLeaveTypes";
import ViewLeaveTypes from "./ViewLeaveTypes";
import DeleteLeaveTypes from "./DeleteLeaveTypes";

import AddHoliday from "./AddHoliday";
import EditHoliday from "./EditHoliday";
import ViewHoliday from "./ViewHoliday";
import DeleteHoliday from "./DeleteHoliday";

const HEADER_GRADIENT =
  "linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)";

const LeaveTypeMaster = () => {
  const [mode, setMode] = useState("leave");
  const [dataList, setDataList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [actionAnchor, setActionAnchor] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  /* ✅ SNACKBAR STATE (same pattern as SalaryMaster) */
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetchData();
  }, [mode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const endpoint =
        mode === "leave"
          ? `${BASE_URL}/api/leavetypes`
          : `${BASE_URL}/api/holidays`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setDataList(response.data.data || []);
        setFilteredList(response.data.data || []);
      }
    } catch (err) {
      showNotification("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ✅ Snackbar helper */
  const showNotification = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  /* SEARCH */
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = dataList.filter((item) =>
      mode === "leave"
        ? item.Name?.toLowerCase().includes(value)
        : (item.Title || item.Name)?.toLowerCase().includes(value)
    );

    setFilteredList(filtered);
    setPage(0);
  };

  /* SORT */
  const handleSort = () => {
    const sorted = [...filteredList].sort((a, b) => {
      const field = mode === "leave" ? "Name" : "Title";
      const aValue = field === "Title" ? (a.Title || a.Name || "") : (a[field] || "");
      const bValue = field === "Title" ? (b.Title || b.Name || "") : (b[field] || "");

      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    setFilteredList(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  /* FILTER ACTIVE */
  const handleFilterActive = () => {
    const filtered = dataList.filter((item) => item.IsActive);
    setFilteredList(filtered);
    setPage(0);
  };

  /* RESET FILTER */
  const handleResetFilter = () => {
    setFilteredList(dataList);
    setSearchTerm("");
    setPage(0);
  };

  /* PAGINATION */
  const paginated = filteredList.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  /* ACTION MENU */
  const handleActionOpen = (e, item) => {
    setActionAnchor(e.currentTarget);
    setSelectedItem(item);
  };

  const handleActionClose = () => {
    setActionAnchor(null);
  };

  /* CLOSE HANDLERS WITH SNACKBAR */
  const handleAddClose = (success) => {
    setOpenAdd(false);
    if (success) {
      fetchData();
      showNotification(
        `${mode === "leave" ? "Leave Type" : "Holiday"} added successfully`
      );
    }
  };

  const handleEditClose = (success) => {
    setOpenEdit(false);
    if (success) {
      fetchData();
      showNotification(
        `${mode === "leave" ? "Leave Type" : "Holiday"} updated successfully`
      );
    }
  };

  const handleDeleteClose = (success) => {
    setOpenDelete(false);
    if (success) {
      fetchData();
      showNotification(
        `${mode === "leave" ? "Leave Type" : "Holiday"} deleted successfully`,
        "success"
      );
    }
  };

  const handleViewClose = () => {
    setOpenView(false);
    setSelectedItem(null);
  };

  return (
    <Box>
      {/* TOGGLE */}
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={(e, val) => val && setMode(val)}
        sx={{ mb: 1 }}
      >
        <ToggleButton
          value="leave"
          sx={{
            "&.Mui-selected": {
              background: HEADER_GRADIENT,
              color: "#fff",
            },
            "&.Mui-selected:hover": {
              background: HEADER_GRADIENT,
            },
          }}
        >
          Leave Types
        </ToggleButton>

        <ToggleButton
          value="holiday"
          sx={{
            "&.Mui-selected": {
              background: HEADER_GRADIENT,
              color: "#fff",
            },
            "&.Mui-selected:hover": {
              background: HEADER_GRADIENT,
            },
          }}
        >
          Holidays
        </ToggleButton>
      </ToggleButtonGroup>

      <Typography
        variant="h5"
        fontWeight={600}
        sx={{
          background: HEADER_GRADIENT,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 1
        }}
      >
        {mode === "leave" ? "Leave Type Master" : "Holiday Master"}
      </Typography>
      <Typography variant="body2" color="#64748B">
                Manage leave types and holiday schedules
      </Typography>

      {/* ACTION BAR */}
      <Paper sx={{ p: 1.5, mb: 3 }}>
        <Stack direction="row" spacing={2} justifyContent="space-between" flexWrap="wrap">
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <TextField
              placeholder="Search..."
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ width: 300 }}
            />

            {/* <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleFilterActive}
            >
              Active Only
            </Button> */}

            {/* <Button
              variant="outlined"
              startIcon={<SortIcon />}
              onClick={handleSort}
            >
              Sort {sortOrder === "asc" ? "A-Z" : "Z-A"}
            </Button> */}

            {(searchTerm || filteredList.length !== dataList.length) && (
              <Button variant="text" onClick={handleResetFilter}>
                Clear Filters
              </Button>
            )}
          </Stack>

          <Stack direction="row" spacing={2}>
            {/* <Button variant="outlined" startIcon={<DownloadIcon />}>
              Export
            </Button> */}

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAdd(true)}
              sx={{ background: HEADER_GRADIENT }}
            >
              Add {mode === "leave" ? "Leave Type" : "Holiday"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* TABLE */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: HEADER_GRADIENT }}>
                <TableCell sx={{ color: "white" }}>
                  {mode === "leave" ? "Leave Name" : "Holiday Title"}
                </TableCell>
                <TableCell sx={{ color: "white" }}>
                  {mode === "leave" ? "Max Days" : "Date"}
                </TableCell>
                <TableCell sx={{ color: "white" }}>Created At</TableCell>
                <TableCell sx={{ color: "white" }}>Updated At</TableCell>
                {/* <TableCell sx={{ color: "white" }}>Status</TableCell> */}
                <TableCell sx={{ color: "white" }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      {mode === "leave"
                        ? item.Name
                        : item.Title || item.Name}
                    </TableCell>

                    <TableCell>
                      {mode === "leave"
                        ? item.MaxDaysPerYear
                        : item.Date
                          ? new Date(item.Date).toLocaleDateString()
                          : "-"}
                    </TableCell>

                    <TableCell>
                      {item.CreatedAt
                        ? new Date(item.CreatedAt).toLocaleDateString()
                        : "-"}
                    </TableCell>

                    <TableCell>
                      {item.UpdatedAt
                        ? new Date(item.UpdatedAt).toLocaleDateString()
                        : "-"}
                    </TableCell>

                    {/* <TableCell>
                      <Chip
                        label={item.IsActive ? "Active" : "Inactive"}
                        color={item.IsActive ? "success" : "default"}
                        size="small"
                      />
                    </TableCell> */}

                    <TableCell align="center">
                      <IconButton onClick={(e) => handleActionOpen(e, item)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    No {mode === "leave" ? "leave types" : "holidays"} found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredList.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) =>
            setRowsPerPage(parseInt(e.target.value, 10))
          }
        />
      </Paper>

      {/* ACTION MENU */}
      <Menu anchorEl={actionAnchor} open={Boolean(actionAnchor)} onClose={handleActionClose}>
        <MenuItem onClick={() => { setOpenView(true); handleActionClose(); }}>
          <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => { setOpenEdit(true); handleActionClose(); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={() => { setOpenDelete(true); handleActionClose(); }}>
          <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
          <ListItemText sx={{ color: "error.main" }}>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* MODALS */}
      {mode === "leave" && (
        <>
          <AddLeaveTypes open={openAdd} onClose={handleAddClose} />
          <EditLeaveTypes open={openEdit} leaveType={selectedItem} onClose={handleEditClose} />
          <ViewLeaveTypes open={openView} leaveType={selectedItem} onClose={handleViewClose} />
          <DeleteLeaveTypes open={openDelete} leaveType={selectedItem} onClose={handleDeleteClose} />
        </>
      )}

      {mode === "holiday" && (
        <>
          <AddHoliday open={openAdd} onClose={handleAddClose} />
          <EditHoliday open={openEdit} holiday={selectedItem} onClose={handleEditClose} />
          <ViewHoliday open={openView} holiday={selectedItem} onClose={handleViewClose} />
          <DeleteHoliday open={openDelete} holiday={selectedItem} onClose={handleDeleteClose} />
        </>
      )}

      {/*  SNACKBAR (Same as SalaryMaster) */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LeaveTypeMaster;
