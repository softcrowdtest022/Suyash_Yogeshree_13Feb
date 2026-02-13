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
  Typography,
  Stack,
  TextField,
  InputAdornment,
  Button,
  TablePagination,
  Chip,
  MenuItem,
  Select,
  FormControl,
  Snackbar,
  Alert
} from "@mui/material";
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Sort as SortIcon
} from "@mui/icons-material";
import axios from "axios";
import BASE_URL from "../../../config/Config";

const HEADER_GRADIENT =
  "linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)";

const AdminLeaveApproval = () => {
  const token = localStorage.getItem("token");

  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("desc");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    fetchAllLeaves();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, sortOrder, leaves]);

  const fetchAllLeaves = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/leaves/report`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLeaves(res.data.data || res.data);
    } catch (err) {
      showSnackbar("Failed to load leaves", "error");
    }
  };

  const applyFilters = () => {
    let data = [...leaves];

    // Search
    if (searchTerm) {
      data = data.filter(
        (leave) =>
          leave.employeeId?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          leave.leaveTypeId?.Name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          leave.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "All") {
      data = data.filter((leave) => leave.status === statusFilter);
    }

    // Sort
    data.sort((a, b) =>
      sortOrder === "asc"
        ? new Date(a.fromDate) - new Date(b.fromDate)
        : new Date(b.fromDate) - new Date(a.fromDate)
    );

    setFilteredLeaves(data);
  };

  const handleProcess = async (id, status) => {
    try {
      await axios.put(
        `${BASE_URL}/api/leaves/${id}/process`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showSnackbar(`Leave ${status} successfully`, "success");
      fetchAllLeaves();
    } catch {
      showSnackbar("Error processing leave", "error");
    }
  };

  const exportCSV = () => {
    const csv = [
      ["Employee", "Leave Type", "From", "To", "Status"],
      ...filteredLeaves.map((l) => [
        l.employeeId?.name,
        l.leaveTypeId?.Name,
        l.fromDate,
        l.toDate,
        l.status
      ])
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "admin_leave_report.csv";
    link.click();
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const paginatedData = filteredLeaves.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography
        variant="h5"
        fontWeight={600}
        sx={{
          background: HEADER_GRADIENT,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}
      >
        Admin Leave Master
      </Typography>

      <Typography variant="body2" color="#64748B" sx={{ mb: 3 }}>
        Manage, approve and review employee leave applications
      </Typography>

      {/* Action Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              placeholder="Search employee, leave type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />

            <FormControl size="small">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<SortIcon />}
              onClick={() =>
                setSortOrder(sortOrder === "asc" ? "desc" : "asc")
              }
            >
              Sort
            </Button>
          </Stack>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportCSV}
          >
            Export
          </Button>
        </Stack>
      </Paper>

      {/* Table */}
      <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: HEADER_GRADIENT }}>
                {[
                  "Employee",
                  "Leave Type",
                  "From",
                  "To",
                  "Status",
                  "Action"
                ].map((head) => (
                  <TableCell
                    key={head}
                    sx={{ color: "#fff", fontWeight: 600 }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedData.map((leave) => (
                <TableRow key={leave._id} hover>
                  <TableCell>{leave.employeeId?.name}</TableCell>
                  <TableCell>{leave.leaveTypeId?.Name}</TableCell>
                  <TableCell>{leave.fromDate?.substring(0, 10)}</TableCell>
                  <TableCell>{leave.toDate?.substring(0, 10)}</TableCell>
                  <TableCell>
                    <Chip
                      label={leave.status}
                      size="small"
                      sx={{
                        backgroundColor:
                          leave.status === "Approved"
                            ? "#dcfce7"
                            : leave.status === "Rejected"
                            ? "#fee2e2"
                            : leave.status === "Pending"
                            ? "#fef9c3"
                            : "#e2e8f0"
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    {leave.status === "Pending" && (
                      <>
                        <Button
                          size="small"
                          color="success"
                          onClick={() =>
                            handleProcess(leave._id, "Approved")
                          }
                        >
                          Approve
                        </Button>

                        <Button
                          size="small"
                          color="error"
                          onClick={() =>
                            handleProcess(leave._id, "Rejected")
                          }
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredLeaves.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) =>
            setRowsPerPage(parseInt(e.target.value, 10))
          }
        />
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminLeaveApproval;
