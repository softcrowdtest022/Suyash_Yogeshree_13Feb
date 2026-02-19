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
  alpha
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

import AddSalary from "./AddSalary";
import EditSalary from "./EditSalary";
import ViewSalary from "./ViewSalary";
import DeleteSalary from "./DeleteSalary";

/* === SAME STYLE CONSTANTS AS EMPLOYEE MASTER === */
const HEADER_GRADIENT =
  "linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)";
const STRIPE_ODD = "#FFFFFF";
const STRIPE_EVEN = "#f8fafc";
const HOVER_COLOR = "#f1f5f9";
const PRIMARY_BLUE = "#00B4D8";
const TEXT_MAIN = "#0f172a";

const SalaryMaster = () => {
  /* ================= EXISTING STATE (UNCHANGED) ================= */
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");

  const [selected, setSelected] = useState([]);
  const [selectedSalary, setSelectedSalary] = useState(null);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /* ================= FETCH EMPLOYEES ================= */
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setEmployees(response.data.data);
      }
    } catch {}
  };

  /* ================= FETCH SALARIES ================= */
  useEffect(() => {
    fetchSalaries();
  }, [page, rowsPerPage, employeeFilter]);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${BASE_URL}/api/salaries`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: page + 1,
          limit: rowsPerPage,
          employeeId: employeeFilter || undefined,
        },
      });

      if (response.data.success) {
        setSalaries(response.data.data);
        setTotalRecords(response.data.total);
      }
    } catch {
      showNotification("Failed to load salaries", "error");
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
      setSelected(salaries.map((s) => s._id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isSelected = (id) => selected.includes(id);

  /* ================= ACTION MENU ================= */
  const handleMenuOpen = (event, salary) => {
    setAnchorEl(event.currentTarget);
    setSelectedSalary(salary);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /* ================= CRUD HANDLERS ================= */
  const handleAdd = () => {
    fetchSalaries();
    showNotification("Salary added successfully", "success");
  };

  const handleUpdate = () => {
    fetchSalaries();
    showNotification("Salary updated successfully", "success");
  };

  const handleDelete = () => {
    fetchSalaries();
    showNotification("Salary deleted successfully", "success");
  };

  const formatCurrency = (amount) =>
    `₹ ${Number(amount || 0).toLocaleString("en-IN")}`;

  const filteredSalaries = salaries.filter((s) =>
    s.employeeName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>

      {/* ===== HEADER ===== */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          fontWeight={600}
          sx={{
            background: HEADER_GRADIENT,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Salary Master
        </Typography>
        <Typography variant="body2" color="#64748B">
          Manage employee payroll and salary records
        </Typography>
      </Box>

      {/* ===== ACTION BAR ===== */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: "1px solid #e2e8f0",
        }}
      >
        <Stack direction="row" justifyContent="space-between">

          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#64748B" }} />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                displayEmpty
                value={employeeFilter}
                onChange={(e) => {
                  setEmployeeFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All Employees</MenuItem>
                {employees.map((emp) => (
                  <MenuItem key={emp._id} value={emp._id}>
                    {emp.FirstName} {emp.LastName}
                  </MenuItem>
                ))}
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
                    const salary = salaries.find(
                      (s) => s._id === selected[0]
                    );
                    setSelectedSalary(salary);
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
              Add Salary
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* ===== TABLE ===== */}
      <Paper
        sx={{
          borderRadius: 2,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table>

            <TableHead>
              <TableRow
                sx={{
                  background: HEADER_GRADIENT,
                  "& .MuiTableCell-root": {
                    color: "#fff",
                    fontWeight: 600,
                    borderBottom: "none",
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
                      salaries.length > 0 &&
                      selected.length === salaries.length
                    }
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < salaries.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Gross</TableCell>
                <TableCell>Net Pay</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredSalaries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No salaries found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSalaries.map((salary, index) => (
                  <TableRow
                    key={salary._id}
                    hover
                    sx={{
                      bgcolor:
                        index % 2 === 0 ? STRIPE_ODD : STRIPE_EVEN,
                      "&:hover": { bgcolor: HOVER_COLOR },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected(salary._id)}
                        onChange={() =>
                          handleSelectOne(salary._id)
                        }
                        sx={{
                          color: PRIMARY_BLUE,
                          "&.Mui-checked": {
                            color: PRIMARY_BLUE,
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {salary.employeeName}
                    </TableCell>
                    <TableCell>{salary.periodDisplay}</TableCell>
                    <TableCell>{salary.employmentType}</TableCell>
                    <TableCell>
                      {formatCurrency(salary.grossSalary)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {formatCurrency(salary.netPay)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={salary.paymentStatus}
                        size="small"
                        sx={{
                          backgroundColor:
                            salary.paymentStatus === "PROCESSED"
                              ? "#dcfce7"
                              : "#fef3c7",
                          color:
                            salary.paymentStatus === "PROCESSED"
                              ? "#166534"
                              : "#92400e",
                          border: "1px solid #e2e8f0",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={(e) =>
                          handleMenuOpen(e, salary)
                        }
                        sx={{
                          "&:hover": {
                            bgcolor: alpha(
                              PRIMARY_BLUE,
                              0.1
                            ),
                          },
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
          count={totalRecords}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

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

        <MenuItem
          onClick={() => {
            setOpenEdit(true);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            setOpenDelete(true);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* ===== MODALS ===== */}
      <AddSalary open={openAdd} onClose={() => setOpenAdd(false)} onAdd={handleAdd} />

      {selectedSalary && (
        <>
          <ViewSalary open={openView} onClose={() => setOpenView(false)} salary={selectedSalary} />
          <EditSalary open={openEdit} onClose={() => setOpenEdit(false)} salary={selectedSalary} onUpdate={handleUpdate} />
          <DeleteSalary open={openDelete} onClose={() => setOpenDelete(false)} salary={selectedSalary} onDelete={handleDelete} />
        </>
      )}

      {/* ===== SNACKBAR ===== */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        onClose={() =>
          setSnackbar({ ...snackbar, open: false })
        }
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SalaryMaster;