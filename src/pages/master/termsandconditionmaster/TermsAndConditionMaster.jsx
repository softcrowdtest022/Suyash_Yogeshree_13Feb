import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Divider,
  InputAdornment,
  Snackbar,
  Alert,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
} from "@mui/material";

import {
  Search,
  FilterList,
  Sort,
  Add,
  MoreVert,
  Visibility,
  Edit,
  Delete,
} from "@mui/icons-material";

import axios from "axios";
import BASE_URL from "../../../config/Config";

import AddTermAndCondition from "./AddTermsConditions";
import ViewTermsAndConditions from "./ViewTermsConditions";
import EditTermsAndConditions from "./EditTermsConditions";
import DeleteTermsAndCondition from "./DeleteTermsCondition";

const TermsAndConditionMaster = () => {
  const [termsData, setTermsData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [searchText, setSearchText] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  /* ================= FETCH DATA ================= */

  const fetchTerms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${BASE_URL}/api/terms-conditions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setTermsData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching terms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  /* ================= FILTER ================= */

  const filteredData = termsData.filter(
    (term) =>
      term.Title?.toLowerCase().includes(searchText.toLowerCase()) ||
      term.Description?.toLowerCase().includes(searchText.toLowerCase()),
  );

  /* ================= SELECTION ================= */

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = filteredData.map((term) => term._id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleRowSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  /* ================= BULK DELETE ================= */

  const handleBulkDelete = async () => {
    try {
      const token = localStorage.getItem("token");

      await Promise.all(
        selectedIds.map((id) =>
          axios.delete(`${BASE_URL}/api/terms-conditions/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ),
      );

      setSelectedIds([]);
      fetchTerms();
      showSnackbar("Selected terms deleted successfully!");
    } catch (error) {
      console.error("Bulk delete error:", error);
    }
  };

  /* ================= MENU ================= */

  const handleMenuOpen = (event, row) => {
    setMenuAnchor(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => setMenuAnchor(null);

  /* ================= SNACKBAR ================= */

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  /* ================= CRUD SUCCESS ================= */

  const handleAddSuccess = () => {
    fetchTerms();
    showSnackbar("Term added successfully!");
  };

  const handleUpdateSuccess = () => {
    fetchTerms();
    showSnackbar("Term updated successfully!");
  };

  const handleDeleteSuccess = () => {
    fetchTerms();
    showSnackbar("Term deleted successfully!");
  };

  return (
    <Box sx={{ p: 3 }}>

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          component="h1"
          fontWeight="600"
          sx={{
            background:
              "linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            display: "inline-block",
          }}
        >
          Terms & Conditions Master
        </Typography>

        <Typography variant="body2" sx={{ mt: 0.5, color: "#64748B" }}>
          Manage and organize terms & conditions
        </Typography>
      </Box>

    
      <Paper
        sx={{
          p: 2,
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search by title, description..."
            sx={{ width: 350 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          <Button variant="outlined" startIcon={<FilterList />}>
            Filter
          </Button>

          <Button variant="outlined" startIcon={<Sort />}>
            Sort
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          {selectedIds.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleBulkDelete}
            >
              Delete ({selectedIds.length})
            </Button>
          )}

          <Button variant="outlined">Export</Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenAdd(true)}
            sx={{
              background: "linear-gradient(90deg,#0f766e,#0ea5e9)",
              textTransform: "none",
            }}
          >
            Add Terms
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box p={4} textAlign="center">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background: "linear-gradient(90deg,#0f766e,#0ea5e9)",
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={
                          filteredData.length > 0 &&
                          selectedIds.length === filteredData.length
                        }
                        onChange={handleSelectAll}
                        sx={{ color: "white" }}
                      />
                    </TableCell>

                    <TableCell sx={{ color: "white", fontWeight: 600 }}>
                      Title
                    </TableCell>

                    <TableCell sx={{ color: "white", fontWeight: 600 }}>
                      Description
                    </TableCell>

                    <TableCell sx={{ color: "white", fontWeight: 600 }}>
                      Sequence
                    </TableCell>

                    <TableCell sx={{ color: "white", fontWeight: 600 }}>
                      Status
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{ color: "white", fontWeight: 600 }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((term) => (
                      <TableRow key={term._id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedIds.includes(term._id)}
                            onChange={() => handleRowSelect(term._id)}
                          />
                        </TableCell>

                        <TableCell sx={{ fontWeight: 600 }}>
                          {term.Title}
                        </TableCell>

                        <TableCell>{term.Description}</TableCell>

                        <TableCell>#{term.Sequence}</TableCell>

                        <TableCell>
                          <Chip
                            label="Active"
                            size="small"
                            sx={{
                              bgcolor: "#D1FAE5",
                              color: "#065F46",
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>

                        <TableCell align="center">
                          <IconButton onClick={(e) => handleMenuOpen(e, term)}>
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredData.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </Paper>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            setOpenView(true);
            handleMenuClose();
          }}
        >
          <Visibility sx={{ mr: 1 }} /> View
        </MenuItem>

        <MenuItem
          onClick={() => {
            setOpenEdit(true);
            handleMenuClose();
          }}
        >
          <Edit sx={{ mr: 1 }} /> Edit
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => {
            setOpenDelete(true);
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <AddTermAndCondition
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={handleAddSuccess}
      />

      <ViewTermsAndConditions
        open={openView}
        onClose={() => setOpenView(false)}
        term={selectedRow}
      />

      <EditTermsAndConditions
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        term={selectedRow}
        onUpdate={handleUpdateSuccess}
      />

      <DeleteTermsAndCondition
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        term={selectedRow}
        onDelete={handleDeleteSuccess}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TermsAndConditionMaster;