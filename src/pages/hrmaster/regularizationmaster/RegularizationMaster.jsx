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
  Typography,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Snackbar,
  Alert,
  TextField,
  TablePagination,
  Grid
} from "@mui/material";
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  CheckCircle as ApproveIcon
} from "@mui/icons-material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

import AddRegularization from "./AddRegularization";
import ViewRegularization from "./ViewRegularization";
import ApproveRegularization from "./ApproveRegularization";

const HEADER_GRADIENT =
  "linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)";

const RegularizationMaster = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openAdd, setOpenAdd] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openApprove, setOpenApprove] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    let filtered = [...records];

    if (search) {
      filtered = filtered.filter((rec) =>
        rec.RequestType?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(
        (rec) => rec.Status === statusFilter
      );
    }

    setFilteredRecords(filtered);
  }, [search, statusFilter, records]);

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${BASE_URL}/api/regularization`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setRecords(response.data.data);
        setFilteredRecords(response.data.data);
      }
    } catch (err) {
      showNotification("Failed to load requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box sx={{ p: 3 }}>

      {/* HEADER */}
      <Typography
        variant="h5"
        fontWeight={600}
        sx={{
          background: HEADER_GRADIENT,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 3
        }}
      >
        Regularization Requests
      </Typography>

      {/* FILTER & ACTION BAR */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">

          <Grid item xs={12} md={3}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search by request type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1 }} />
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              select
              size="small"
              fullWidth
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAdd(true)}
            >
              Add Request
            </Button>
          </Grid>

        </Grid>
      </Paper>

      {/* TABLE */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: HEADER_GRADIENT }}>
                <TableCell sx={{ color: "#fff" }}>Date</TableCell>
                <TableCell sx={{ color: "#fff" }}>Request Type</TableCell>
                <TableCell sx={{ color: "#fff" }}>Status</TableCell>
                <TableCell sx={{ color: "#fff" }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((record) => (
                    <TableRow key={record._id} hover>

                      <TableCell>
                        {new Date(record.Date).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        {record.RequestType}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={record.Status}
                          color={
                            record.Status === "Approved"
                              ? "success"
                              : record.Status === "Rejected"
                              ? "error"
                              : "warning"
                          }
                          size="small"
                        />
                      </TableCell>

                      <TableCell align="center">
                        <IconButton
                          onClick={(e) => {
                            setAnchorEl(e.currentTarget);
                            setSelectedRecord(record);
                          }}
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
          component="div"
          count={filteredRecords.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* ACTION MENU */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            setOpenView(true);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>

        {selectedRecord?.Status === "Pending" && (
          <MenuItem
            onClick={() => {
              setOpenApprove(true);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <ApproveIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Approve / Reject</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* MODALS */}
      <AddRegularization
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onAdd={(newRecord) => {
          setRecords([newRecord, ...records]);
          showNotification("Request submitted", "success");
        }}
      />

      {selectedRecord && (
        <ViewRegularization
          open={openView}
          onClose={() => setOpenView(false)}
          record={selectedRecord}
        />
      )}

      {selectedRecord && (
        <ApproveRegularization
          open={openApprove}
          onClose={() => setOpenApprove(false)}
          record={selectedRecord}
          onUpdate={(updatedRecord) => {
            setRecords((prev) =>
              prev.map((r) =>
                r._id === updatedRecord._id ? updatedRecord : r
              )
            );
            showNotification("Request updated", "success");
          }}
        />
      )}

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
    </Box>
  );
};

export default RegularizationMaster;