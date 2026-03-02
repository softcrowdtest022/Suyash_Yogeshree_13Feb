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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Checkbox,
  FormControl,
  Select,
  alpha,
} from "@mui/material";

import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Feedback as FeedbackIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
} from "@mui/icons-material";

import axios from "axios";
import BASE_URL from "../../../config/Config";

import AddTermination from "./AddTermination";
import ViewTermination from "./ViewTermination";
import ApproveTermination from "./ApproveTermination";
import SubmitTermination from "./SubmitTermination";
import DeleteTermination from "./DeleteTermination";
import { Delete as DeleteIcon } from "@mui/icons-material";

/* ==== STYLE ==== */
const HEADER_GRADIENT =
  "linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)";
const STRIPE_ODD = "#FFFFFF";
const STRIPE_EVEN = "#f8fafc";
const HOVER_COLOR = "#f1f5f9";
const PRIMARY_BLUE = "#00B4D8";
const TEXT_MAIN = "#0f172a";

const TerminationMaster = () => {
  const [terminations, setTerminations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("termination");
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState([]);
  const [selectedTermination, setSelectedTermination] = useState(null);

  const [openAdd, setOpenAdd] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openApprove, setOpenApprove] = useState(false);
  const [openFeedback, setOpenFeedback] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchTerminations();
  }, [page, rowsPerPage, statusFilter, typeFilter]);

  const fetchTerminations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${BASE_URL}/api/terminations`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: page + 1,
          limit: rowsPerPage,
          status: statusFilter || undefined,
          type: typeFilter || undefined,
        },
      });

      if (response.data.success) {
        setTerminations(response.data.data);
        setTotalRecords(response.data.count);
      }
    } catch {
      showNotification("Failed to load terminations", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  /* ================= CHECKBOX ================= */
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(terminations.map((t) => t._id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const isSelected = (id) => selected.includes(id);

  /* ================= MENU ================= */
  const handleMenuOpen = (event, termination) => {
    setAnchorEl(event.currentTarget);
    setSelectedTermination(termination);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "warning";
    }
  };

  const filteredData = terminations.filter((t) =>
    `${t.employeeId?.FirstName} ${t.employeeId?.LastName}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* ===== HEADER ===== */}
      <Typography
        variant="h5"
        fontWeight={600}
        sx={{
          background: HEADER_GRADIENT,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 2,
        }}
      >
        Termination Master
      </Typography>

      {/* ===== ACTION BAR ===== */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between">
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small">
              <Select
                displayEmpty
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Stack direction="row" spacing={2}>
            {selected.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  if (selected.length === 1) {
                    const termination = terminations.find(
                      (t) => t._id === selected[0],
                    );
                    setSelectedTermination(termination);
                    setOpenDelete(true);
                  }
                }}
              >
                Delete ({selected.length})
              </Button>
            )}

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAdd(true)}
              sx={{
                background: HEADER_GRADIENT,
                "&:hover": { opacity: 0.9 },
              }}
            >
              Add Termination
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* ===== TABLE ===== */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background: HEADER_GRADIENT,
                  "& .MuiTableCell-root": {
                    color: "#fff",
                    fontWeight: 600,
                  },
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    sx={{
                      color: "#fff",
                      "&.Mui-checked": { color: "#fff" },
                    }}
                    checked={
                      terminations.length > 0 &&
                      selected.length === terminations.length
                    }
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < terminations.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Termination ID</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Last Working Day</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((t, index) => (
                  <TableRow
                    key={t._id}
                    hover
                    sx={{
                      bgcolor: index % 2 === 0 ? STRIPE_ODD : STRIPE_EVEN,
                      "&:hover": { bgcolor: HOVER_COLOR },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected(t._id)}
                        onChange={() => handleSelectOne(t._id)}
                      />
                    </TableCell>

                    <TableCell>{t.terminationId}</TableCell>
                    <TableCell>
                      {t.employeeId?.FirstName} {t.employeeId?.LastName}
                    </TableCell>
                    <TableCell>{t.terminationType}</TableCell>
                    <TableCell>
                      {new Date(t.lastWorkingDay).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t.status}
                        color={getStatusColor(t.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={(e) => handleMenuOpen(e, t)}>
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
          count={totalRecords}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
        {/* ===== ACTION MENU ===== */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              setOpenView(true);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View</ListItemText>
          </MenuItem>

          {selectedTermination?.status === "pending" && (
            <MenuItem
              onClick={() => {
                setOpenApprove(true);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <ApproveIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Approve</ListItemText>
            </MenuItem>
          )}

          {selectedTermination?.status === "approved" &&
            !selectedTermination.feedback?.submitted && (
              <MenuItem
                onClick={() => {
                  setOpenFeedback(true);
                  handleMenuClose();
                }}
              >
                <ListItemIcon>
                  <FeedbackIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Submit Feedback</ListItemText>
              </MenuItem>
            )}
          <MenuItem
            onClick={() => {
              setOpenDelete(true);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            Delete
          </MenuItem>
        </Menu>
      </Paper>

      {/* ===== MODALS ===== */}
      <AddTermination
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onAdd={() => {
          fetchTerminations();
          showNotification("Termination added", "success");
        }}
      />

      {selectedTermination && (
        <>
          <ViewTermination
            open={openView}
            onClose={() => setOpenView(false)}
            termination={selectedTermination}
          />

          <ApproveTermination
            open={openApprove}
            onClose={() => setOpenApprove(false)}
            termination={selectedTermination}
            onApprove={(updated) => {
              setTerminations((prev) =>
                prev.map((t) => (t._id === updated._id ? updated : t)),
              );
              showNotification("Termination approved", "success");
            }}
          />

          <SubmitTermination
            open={openFeedback}
            onClose={() => setOpenFeedback(false)}
            termination={selectedTermination}
            onSubmitFeedback={(updated) => {
              setTerminations((prev) =>
                prev.map((t) => (t._id === updated._id ? updated : t)),
              );
              showNotification("Feedback submitted", "success");
            }}
          />
          <DeleteTermination
            open={openDelete}
            onClose={() => setOpenDelete(false)}
            termination={selectedTermination}
            onDelete={(deletedId) => {
              setTerminations((prev) =>
                prev.filter((t) => t.terminationId !== deletedId),
              );

              setSelected([]);
              setSelectedTermination(null);
              setOpenDelete(false);

              showNotification("Termination deleted successfully", "success");
            }}
          />
        </>
      )}

      {/* ===== SNACKBAR ===== */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TerminationMaster;
