import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
  Stack,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Rating,
  Card,
  CardContent,
  Button
} from "@mui/material";

import {
  MoreVert,
  Visibility,
  Edit,
  Delete,
  Lock,
  AttachFile,
  Add
} from "@mui/icons-material";

import axios from "axios";
import BASE_URL from "../../../config/Config";

// ✅ IMPORT MODALS
import AddEmployeeBehavior from "./AddEmployeeBehavior";
import ViewEmployeeBehavior from "./ViewEmployeeBehavior";
import EditEmployeeBehavior from "./EditEmployeeBehavior";
import DeleteEmployeeBehavior from "./DeleteEmployeeBehavior";

const HEADER_GRADIENT =
  "linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)";

const PRIMARY_BLUE = "#00B4D8";
const TEXT_COLOR_MAIN = "#0f172a";

const EmployeeBehaviorMaster = () => {
  const [behaviors, setBehaviors] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  // ✅ MODAL STATES
  const [openAdd, setOpenAdd] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  // ================= FETCH =================
  const fetchBehaviors = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${BASE_URL}/api/employee-behavior/all?page=${page + 1}&limit=${rowsPerPage}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setBehaviors(res.data.data.behaviors);
        setStatistics(res.data.data.statistics);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchBehaviors();
  }, [fetchBehaviors]);

  // ================= HELPERS =================
  const getStatusStyle = status => {
    switch (status) {
      case "Resolved":
        return { bg: "#dcfce7", color: "#166534", border: "#86efac" };
      case "Escalated":
        return { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" };
      case "Open":
        return { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" };
      default:
        return { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
    }
  };

  const getTypeStyle = type => {
    switch (type) {
      case "Positive":
        return { bg: "#dcfce7", color: "#166534" };
      case "Negative":
        return { bg: "#fee2e2", color: "#991b1b" };
      default:
        return { bg: "#f1f5f9", color: "#475569" };
    }
  };

  const formatDate = date =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric"
        })
      : "-";

  const getInitials = (f, l) =>
    `${f?.[0] || ""}${l?.[0] || ""}`.toUpperCase();

  // ================= ACTION HANDLERS =================
  const handleActionClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // ================= UI =================
  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER + ADD BUTTON */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            background: HEADER_GRADIENT,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          Employee Behavior Master
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenAdd(true)}
          sx={{
            background: HEADER_GRADIENT,
            textTransform: "none",
            borderRadius: 2
          }}
        >
          Add Behavior
        </Button>
      </Stack>

      {/* SUMMARY CARDS */}
      <Stack direction="row" spacing={2} mt={3} mb={3} flexWrap="wrap">
        {[
          { label: "Total Records", value: statistics?.totalRecords },
          { label: "Positive", value: statistics?.positiveCount },
          { label: "Negative", value: statistics?.negativeCount },
          { label: "Resolved", value: statistics?.resolvedCount },
          { label: "Escalated", value: statistics?.escalatedCount }
        ].map((item, index) => (
          <Card key={index} sx={{ minWidth: 160 }}>
            <CardContent>
              <Typography variant="caption">{item.label}</Typography>
              <Typography variant="h6" fontWeight={600}>
                {item.value || 0}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* TABLE */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: HEADER_GRADIENT }}>
                {[
                  "Employee",
                  "Category",
                  "Rating",
                  "Type",
                  "Status",
                  "Review Date",
                  "Attachments",
                  "Created",
                  "Actions"
                ].map(head => (
                  <TableCell key={head} sx={{ color: "#fff" }}>
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : behaviors.map(row => {
                  const statusStyle = getStatusStyle(row.status);
                  const typeStyle = getTypeStyle(row.type);

                  return (
                    <TableRow key={row._id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={2}>
                          <Avatar sx={{ bgcolor: PRIMARY_BLUE }}>
                            {getInitials(
                              row.employeeId?.FirstName,
                              row.employeeId?.LastName
                            )}
                          </Avatar>
                          <Box>
                            <Typography fontWeight={600}>
                              {row.employeeId?.FirstName}{" "}
                              {row.employeeId?.LastName}
                            </Typography>
                            <Typography variant="caption">
                              {row.employeeId?.EmployeeID}
                            </Typography>
                          </Box>
                          {row.isConfidential && (
                            <Lock fontSize="small" color="error" />
                          )}
                        </Stack>
                      </TableCell>

                      <TableCell>{row.category}</TableCell>
                      <TableCell>
                        <Rating value={row.rating} readOnly size="small" />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={row.type}
                          size="small"
                          sx={{
                            backgroundColor: typeStyle.bg,
                            color: typeStyle.color
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          sx={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            border: `1px solid ${statusStyle.border}`
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        {formatDate(row.reviewDate)}
                      </TableCell>

                      <TableCell>
                        {row.attachments?.length || 0}
                      </TableCell>

                      <TableCell>
                        {formatDate(row.createdAt)}
                      </TableCell>

                      <TableCell>
                        <IconButton
                          onClick={e => handleActionClick(e, row)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={pagination?.totalItems || 0}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e =>
            setRowsPerPage(parseInt(e.target.value, 10))
          }
        />
      </Paper>

      {/* ACTION MENU */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() => {
            setOpenView(true);
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            setOpenEdit(true);
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => {
            setOpenDelete(true);
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: "error.main" }}>
            Delete
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* MODALS */}
      <AddEmployeeBehavior
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={fetchBehaviors}
      />

      <ViewEmployeeBehavior
        open={openView}
        onClose={() => setOpenView(false)}
        behaviorId={selectedRow?._id}
      />

      <EditEmployeeBehavior
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        behaviorId={selectedRow?._id}
        onSuccess={fetchBehaviors}
      />

      <DeleteEmployeeBehavior
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        behaviorId={selectedRow?._id}
        onSuccess={fetchBehaviors}
      />
    </Box>
  );
};

export default EmployeeBehaviorMaster;