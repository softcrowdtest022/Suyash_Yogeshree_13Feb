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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  alpha,
} from "@mui/material";

import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Payment as PaymentIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

import axios from "axios";
import BASE_URL from "../../../config/Config";
import AddProduction from "./AddProduction";
import ViewProduction from "./ViewProduction";

/* ===== DESIGN CONSTANTS ===== */
const HEADER_GRADIENT =
  "linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)";
const PRIMARY_BLUE = "#00B4D8";

const ProductionMaster = () => {
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selected, setSelected] = useState([]);
  const [selectedProduction, setSelectedProduction] = useState(null);

  const [openAdd, setOpenAdd] = useState(false);
  const [openMarkPaidDialog, setOpenMarkPaidDialog] = useState(false);
  const [markPaidLoading, setMarkPaidLoading] = useState(false);
  const [markPaidError, setMarkPaidError] = useState("");
  const [openView, setOpenView] = useState(false); // ✅ ADD THIS
  
  const [anchorEl, setAnchorEl] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /* ================= FETCH PRODUCTIONS ================= */
  useEffect(() => {
    fetchProductions();
  }, [page, rowsPerPage, search, fromDate, toDate]);

  const fetchProductions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // 🔥 FIXED: Using the correct endpoint based on your working code
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };

      if (search) params.search = search;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      // Using the pending endpoint from your working code
      const res = await axios.get(`${BASE_URL}/api/production/pending`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      console.log("API Response:", res.data);

      if (res.data.success) {
        setProductions(res.data.data || []);
        setTotalRecords(res.data.data?.length || 0);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      showNotification("Failed to load production records", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  /* ================= APPROVE / REJECT ================= */
  const handleApproveReject = async (id, status) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${BASE_URL}/api/production/${id}/approve`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      showNotification(`Production ${status} successfully`, "success");
      fetchProductions();
      setSelected([]);
    } catch {
      showNotification("Action failed", "error");
    }
  };

  /* ================= MARK AS PAID ================= */
  const handleMarkPaid = async () => {
  if (selected.length === 0) {
    setMarkPaidError("No records selected");
    return;
  }

  try {
    setMarkPaidLoading(true);
    setMarkPaidError("");

    const token = localStorage.getItem("token");

    const payload = {
      productionIds: selected
      // ❌ REMOVE salaryId completely
    };

    const res = await axios.post(
      `${BASE_URL}/api/production/mark-paid`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (res.data.success) {
      setOpenMarkPaidDialog(false);
      setSelected([]);
      fetchProductions();

      showNotification(
        `${res.data.modifiedCount || 0} record(s) marked as paid`,
        "success"
      );
    }
  } catch (error) {
    setMarkPaidError(
      error.response?.data?.message || "Failed to mark records as paid"
    );
  } finally {
    setMarkPaidLoading(false);
  }
};

  /* ================= CHECKBOX ================= */
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(productions.map((p) => p._id));
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

  /* ================= FILTER HANDLERS ================= */
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
    setPage(0);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
    setPage(0);
  };

  const clearFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  /* ================= GET EMPLOYEE NAME ================= */
  const getEmployeeName = (prod) => {
    if (prod.employeeName) return prod.employeeName;
    if (prod.EmployeeID) {
      if (prod.EmployeeID.FullName) return prod.EmployeeID.FullName;
      return `${prod.EmployeeID.FirstName || ""} ${prod.EmployeeID.LastName || ""}`.trim();
    }
    return "N/A";
  };

  /* ================= GET STATUS COLOR ================= */
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return { bg: "#e8f5e8", color: "#1b5e20" };
      case "rejected":
        return { bg: "#ffebee", color: "#b71c1c" };
      case "pending":
        return { bg: "#fff3e0", color: "#e65100" };
      case "paid":
        return { bg: "#e3f2fd", color: "#01579b" };
      default:
        return { bg: "#f5f5f5", color: "#616161" };
    }
  };

  // Filter productions based on search and date
  const filteredProductions = productions.filter((prod) => {
    const matchesSearch =
      search === "" ||
      getEmployeeName(prod).toLowerCase().includes(search.toLowerCase()) ||
      (prod.ProductName || prod.productName || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (prod.Operation || prod.operation || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const prodDate = new Date(prod.Date || prod.date);
    const matchesFromDate = !fromDate || prodDate >= new Date(fromDate);
    const matchesToDate = !toDate || prodDate <= new Date(toDate);

    return matchesSearch && matchesFromDate && matchesToDate;
  });

  // Calculate summary statistics
  const summary = {
    totalRecords: filteredProductions.length,
    totalUnits: filteredProductions.reduce(
      (sum, p) => sum + (p.totalUnits || 0),
      0,
    ),
    totalGoodUnits: filteredProductions.reduce(
      (sum, p) => sum + (p.goodUnits || p.GoodUnits || 0),
      0,
    ),
    totalRejectedUnits: filteredProductions.reduce(
      (sum, p) => sum + (p.rejectedUnits || p.RejectedUnits || 0),
      0,
    ),
    totalAmount: filteredProductions.reduce(
      (sum, p) => sum + (p.TotalAmount || p.DailyEarning || p.earnings || 0),
      0,
    ),
    avgQuality:
      filteredProductions.reduce(
        (sum, p) => sum + (p.qualityPercentage || 0),
        0,
      ) / (filteredProductions.length || 1),
  };

  // Paginate
  const paginatedProductions = filteredProductions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
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
          Production Master
        </Typography>
        <Typography variant="body2" color="#64748B">
          Manage piece-rate production records
        </Typography>
      </Box>

      {/* ===== SUMMARY CARDS ===== */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: "#e3f2fd", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                Total Records
              </Typography>
              <Typography variant="h6">{summary.totalRecords}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: "#e8f5e8", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                Total Units
              </Typography>
              <Typography variant="h6">{summary.totalUnits}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: "#fff3e0", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                Good Units
              </Typography>
              <Typography variant="h6">{summary.totalGoodUnits}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: "#ffebee", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                Rejected Units
              </Typography>
              <Typography variant="h6">{summary.totalRejectedUnits}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: "#e0f2f1", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                Total Amount
              </Typography>
              <Typography variant="h6">
                ₹{summary.totalAmount.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: "#f3e5f5", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                Avg Quality
              </Typography>
              <Typography variant="h6">
                {summary.avgQuality.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ===== FILTERS AND ACTIONS ===== */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
          >
            <TextField
              size="small"
              placeholder="Search employee, product..."
              value={search}
              onChange={handleSearch}
              sx={{ width: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#64748B" }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              size="small"
              type="date"
              label="From Date"
              value={fromDate}
              onChange={handleFromDateChange}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 150 }}
            />

            <TextField
              size="small"
              type="date"
              label="To Date"
              value={toDate}
              onChange={handleToDateChange}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 150 }}
            />

            {(search || fromDate || toDate) && (
              <Button size="small" onClick={clearFilters} variant="outlined">
                Clear
              </Button>
            )}
          </Stack>

          <Stack direction="row" spacing={2}>
            {selected.length > 0 && (
              <Button
                variant="contained"
                color="success"
                startIcon={<PaymentIcon />}
                onClick={() => setOpenMarkPaidDialog(true)}
              >
                Mark Paid ({selected.length})
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
              Add Production
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* ===== TABLE ===== */}
      <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
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
                    sx={{ color: "#fff" }}
                    checked={
                      paginatedProductions.length > 0 &&
                      selected.length === productions.length
                    }
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < productions.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Operation</TableCell>
                <TableCell>Good Units</TableCell>
                <TableCell>Rejected</TableCell>
                <TableCell>Earnings</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedProductions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProductions.map((prod) => {
                  const prodId = prod._id;
                  const statusColor = getStatusColor(
                    prod.Status || prod.status,
                  );
                  const isPaid =
                    prod.Status?.toLowerCase() === "paid" ||
                    prod.status?.toLowerCase() === "paid";

                  return (
                    <TableRow key={prodId} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected(prodId)}
                          onChange={() => handleSelectOne(prodId)}
                          disabled={isPaid}
                        />
                      </TableCell>

                      <TableCell sx={{ fontWeight: 600 }}>
                        {getEmployeeName(prod)}
                      </TableCell>
                      <TableCell>
                        {new Date(prod.Date || prod.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {prod.ProductName || prod.productName}
                      </TableCell>
                      <TableCell>{prod.Operation || prod.operation}</TableCell>
                      <TableCell>{prod.GoodUnits || prod.goodUnits}</TableCell>
                      <TableCell>
                        {prod.RejectedUnits || prod.rejectedUnits || 0}
                      </TableCell>
                      <TableCell>
                        ₹
                        {(
                          prod.TotalAmount ||
                          prod.DailyEarning ||
                          prod.earnings ||
                          0
                        ).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={prod.Status || prod.status || "Pending"}
                          size="small"
                          sx={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.color,
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <IconButton
                          onClick={(e) => {
                            setAnchorEl(e.currentTarget);
                            setSelectedProduction(prod);
                          }}
                          size="small"
                          disabled={isPaid}
                          sx={{
                            "&:hover": {
                              bgcolor: alpha(PRIMARY_BLUE, 0.1),
                            },
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredProductions.length}
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
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            setOpenView(true);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleApproveReject(selectedProduction?._id, "Approved");
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <ApproveIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>Approve</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleApproveReject(selectedProduction?._id, "Rejected");
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <RejectIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Reject</ListItemText>
        </MenuItem>
      </Menu>

      {/* ===== MARK AS PAID DIALOG ===== */}
      <Dialog
        open={openMarkPaidDialog}
        onClose={() => !markPaidLoading && setOpenMarkPaidDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            borderBottom: "1px solid #E0E0E0",
            backgroundColor: "#E8F5E9",
          }}
        >
          <Typography sx={{ fontSize: 20, fontWeight: 600, color: "#1b5e20" }}>
            Mark as Paid
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            <Typography>
              You are about to mark <strong>{selected.length}</strong>{" "}
              production record(s) as paid.
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              This action will update the status of selected records to "Paid".
            </Alert>

            {markPaidError && <Alert severity="error">{markPaidError}</Alert>}
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            borderTop: "1px solid #E0E0E0",
            pt: 2,
          }}
        >
          <Button
            onClick={() => setOpenMarkPaidDialog(false)}
            disabled={markPaidLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleMarkPaid}
            disabled={markPaidLoading}
            startIcon={
              markPaidLoading ? <CircularProgress size={20} /> : <PaymentIcon />
            }
          >
            {markPaidLoading ? "Processing..." : "Confirm Payment"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== ADD MODAL ===== */}
      <AddProduction
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onAdd={() => {
          fetchProductions();
          showNotification("Production added successfully", "success");
        }}
      />
      <ViewProduction
        open={openView}
        onClose={() => setOpenView(false)}
        production={selectedProduction}
      />

      {/* ===== SNACKBAR ===== */}
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

export default ProductionMaster;
