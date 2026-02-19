// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   IconButton,
//   Button,
//   TextField,
//   InputAdornment,
//   Typography,
//   Snackbar,
//   TablePagination,
//   Stack,
//   Alert,
//   Menu,
//   MenuItem,
//   ListItemIcon,
//   ListItemText,
//   Chip,
//   Checkbox,
//   alpha
// } from "@mui/material";

// import {
//   Search as SearchIcon,
//   Add as AddIcon,
//   Delete as DeleteIcon,
//   Visibility as ViewIcon,
//   Edit as EditIcon,
//   MoreVert as MoreVertIcon,
// } from "@mui/icons-material";

// import axios from "axios";
// import BASE_URL from "../../../config/Config";

// import AddPieceRate from "./AddPieceRate";
// import EditPieceRate from "./EditPieceRate";
// import ViewPieceRate from "./ViewPieceRate";
// import DeletePieceRate from "./DeletePieceRate";

// /* === DESIGN CONSTANTS === */
// const HEADER_GRADIENT =
//   "linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)";
// const STRIPE_ODD = "#FFFFFF";
// const STRIPE_EVEN = "#f8fafc";
// const HOVER_COLOR = "#f1f5f9";
// const PRIMARY_BLUE = "#00B4D8";

// const PieceRateMaster = () => {
//   const [pieceRates, setPieceRates] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [totalRecords, setTotalRecords] = useState(0);

//   const [search, setSearch] = useState("");
//   const [selected, setSelected] = useState([]);
//   const [selectedRate, setSelectedRate] = useState(null);

//   const [openAdd, setOpenAdd] = useState(false);
//   const [openEdit, setOpenEdit] = useState(false);
//   const [openView, setOpenView] = useState(false);
//   const [openDelete, setOpenDelete] = useState(false);

//   const [anchorEl, setAnchorEl] = useState(null);

//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success",
//   });

//   /* ================= FETCH PIECE RATES ================= */
//   useEffect(() => {
//     fetchPieceRates();
//   }, [page, rowsPerPage]);

//   const fetchPieceRates = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");

//       const res = await axios.get(`${BASE_URL}/api/piece-rate-master`, {
//         headers: { Authorization: `Bearer ${token}` },
//         params: {
//           page: page + 1,
//           limit: rowsPerPage,
//           search: search || undefined,
//         },
//       });

//       if (res.data.success) {
//         setPieceRates(res.data.data);
//         setTotalRecords(res.data.total);
//       }
//     } catch {
//       showNotification("Failed to load piece rates", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const showNotification = (message, severity) => {
//     setSnackbar({ open: true, message, severity });
//   };

//   /* ================= CHECKBOX ================= */
//   const handleSelectAll = (event) => {
//     if (event.target.checked) {
//       setSelected(pieceRates.map((r) => r._id));
//     } else {
//       setSelected([]);
//     }
//   };

//   const handleSelectOne = (id) => {
//     setSelected((prev) =>
//       prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
//     );
//   };

//   const isSelected = (id) => selected.includes(id);

//   /* ================= MENU ================= */
//   const handleMenuOpen = (event, rate) => {
//     setAnchorEl(event.currentTarget);
//     setSelectedRate(rate);
//   };

//   const handleMenuClose = () => setAnchorEl(null);

//   /* ================= CRUD HANDLERS ================= */
//   const handleAdd = () => {
//     fetchPieceRates();
//     showNotification("Piece rate added successfully", "success");
//   };

//   const handleUpdate = () => {
//     fetchPieceRates();
//     showNotification("Piece rate updated successfully", "success");
//   };

//   const handleDelete = () => {
//     fetchPieceRates();
//     showNotification("Piece rate deleted successfully", "success");
//   };

//   const filteredRates = pieceRates.filter(
//     (r) =>
//       r.productType?.toLowerCase().includes(search.toLowerCase()) ||
//       r.operation?.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <Box sx={{ p: 3 }}>
//       {/* ===== HEADER ===== */}
//       <Box sx={{ mb: 3 }}>
//         <Typography
//           variant="h5"
//           fontWeight={600}
//           sx={{
//             background: HEADER_GRADIENT,
//             WebkitBackgroundClip: "text",
//             WebkitTextFillColor: "transparent",
//           }}
//         >
//           Piece Rate Master
//         </Typography>
//         <Typography variant="body2" color="#64748B">
//           Manage production piece rates
//         </Typography>
//       </Box>

//       {/* ===== ACTION BAR ===== */}
//       <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
//         <Stack direction="row" justifyContent="space-between">
//           <TextField
//             size="small"
//             placeholder="Search product or operation..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             sx={{ width: 300 }}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon sx={{ color: "#64748B" }} />
//                 </InputAdornment>
//               ),
//             }}
//           />

//           <Button
//             variant="contained"
//             startIcon={<AddIcon />}
//             onClick={() => setOpenAdd(true)}
//             sx={{
//               background: HEADER_GRADIENT,
//               "&:hover": { opacity: 0.9 },
//             }}
//           >
//             Add Piece Rate
//           </Button>
//         </Stack>
//       </Paper>

//       {/* ===== TABLE ===== */}
//       <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
//         <TableContainer>
//           <Table>
//             <TableHead>
//               <TableRow
//                 sx={{
//                   background: HEADER_GRADIENT,
//                   "& .MuiTableCell-root": {
//                     color: "#fff",
//                     fontWeight: 600,
//                   },
//                 }}
//               >
//                 <TableCell padding="checkbox">
//                   <Checkbox
//                     checked={
//                       pieceRates.length > 0 &&
//                       selected.length === pieceRates.length
//                     }
//                     indeterminate={
//                       selected.length > 0 &&
//                       selected.length < pieceRates.length
//                     }
//                     onChange={handleSelectAll}
//                     sx={{ color: "#fff" }}
//                   />
//                 </TableCell>
//                 <TableCell>Product</TableCell>
//                 <TableCell>Operation</TableCell>
//                 <TableCell>Rate</TableCell>
//                 <TableCell>Skill Level</TableCell>
//                 <TableCell>Status</TableCell>
//                 <TableCell align="center">Actions</TableCell>
//               </TableRow>
//             </TableHead>

//             <TableBody>
//               {loading ? (
//                 <TableRow>
//                   <TableCell colSpan={7} align="center">
//                     Loading...
//                   </TableCell>
//                 </TableRow>
//               ) : filteredRates.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={7} align="center">
//                     No records found
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 filteredRates.map((rate, index) => (
//                   <TableRow
//                     key={rate._id}
//                     hover
//                     sx={{
//                       bgcolor:
//                         index % 2 === 0 ? STRIPE_ODD : STRIPE_EVEN,
//                       "&:hover": { bgcolor: HOVER_COLOR },
//                     }}
//                   >
//                     <TableCell padding="checkbox">
//                       <Checkbox
//                         checked={isSelected(rate._id)}
//                         onChange={() => handleSelectOne(rate._id)}
//                       />
//                     </TableCell>

//                     <TableCell sx={{ fontWeight: 600 }}>
//                       {rate.productType}
//                     </TableCell>

//                     <TableCell>{rate.operation}</TableCell>

//                     <TableCell>
//                       ₹ {rate.ratePerUnit}
//                     </TableCell>

//                     <TableCell>{rate.skillLevel}</TableCell>

//                     <TableCell>
//                       <Chip
//                         label={rate.isActive ? "Active" : "Inactive"}
//                         size="small"
//                         sx={{
//                           backgroundColor: rate.isActive
//                             ? "#dcfce7"
//                             : "#fee2e2",
//                           color: rate.isActive
//                             ? "#166534"
//                             : "#991b1b",
//                         }}
//                       />
//                     </TableCell>

//                     <TableCell align="center">
//                       <IconButton
//                         onClick={(e) =>
//                           handleMenuOpen(e, rate)
//                         }
//                         sx={{
//                           "&:hover": {
//                             bgcolor: alpha(PRIMARY_BLUE, 0.1),
//                           },
//                         }}
//                       >
//                         <MoreVertIcon />
//                       </IconButton>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>

//         <TablePagination
//           component="div"
//           count={totalRecords}
//           page={page}
//           onPageChange={(e, newPage) => setPage(newPage)}
//           rowsPerPage={rowsPerPage}
//           onRowsPerPageChange={(e) => {
//             setRowsPerPage(parseInt(e.target.value, 10));
//             setPage(0);
//           }}
//         />
//       </Paper>

//       {/* ===== ACTION MENU ===== */}
//       <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
//         <MenuItem onClick={() => { setOpenView(true); handleMenuClose(); }}>
//           <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
//           <ListItemText>View</ListItemText>
//         </MenuItem>

//         <MenuItem onClick={() => { setOpenEdit(true); handleMenuClose(); }}>
//           <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
//           <ListItemText>Edit</ListItemText>
//         </MenuItem>

//         <MenuItem onClick={() => { setOpenDelete(true); handleMenuClose(); }}>
//           <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
//           <ListItemText>Delete</ListItemText>
//         </MenuItem>
//       </Menu>

//       {/* ===== MODALS ===== */}
//       <AddPieceRate open={openAdd} onClose={() => setOpenAdd(false)} onAdd={handleAdd} />

//       {selectedRate && (
//         <>
//           <ViewPieceRate open={openView} onClose={() => setOpenView(false)} pieceRate={selectedRate} />
//           <EditPieceRate open={openEdit} onClose={() => setOpenEdit(false)} pieceRate={selectedRate} onUpdate={handleUpdate} />
//           <DeletePieceRate open={openDelete} onClose={() => setOpenDelete(false)} pieceRate={selectedRate} onDelete={handleDelete} />
//         </>
//       )}

//       {/* ===== SNACKBAR ===== */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//       >
//         <Alert severity={snackbar.severity} variant="filled">
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default PieceRateMaster;

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
  alpha,
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

import AddPieceRate from "./AddPieceRate";
import EditPieceRate from "./EditPieceRate";
import ViewPieceRate from "./ViewPieceRate";
import DeletePieceRate from "./DeletePieceRate";

/* === DESIGN CONSTANTS === */
const HEADER_GRADIENT =
  "linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)";
const STRIPE_ODD = "#FFFFFF";
const STRIPE_EVEN = "#f8fafc";
const HOVER_COLOR = "#f1f5f9";
const PRIMARY_BLUE = "#00B4D8";

const PieceRateMaster = () => {
  const [pieceRates, setPieceRates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  // 🔥 ADD THIS STATE AT TOP WITH OTHER STATES
  const [openBulkDeleteDialog, setOpenBulkDeleteDialog] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /* ================= FETCH PIECE RATES ================= */
  useEffect(() => {
    fetchPieceRates();
  }, [page, rowsPerPage]);

  const fetchPieceRates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(`${BASE_URL}/api/piece-rate-master`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: search || undefined,
        },
      });

      if (res.data.success) {
        setPieceRates(res.data.data);
        setTotalRecords(res.data.total);
      }
    } catch (error) {
      showNotification("Failed to load piece rates", "error");
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
      setSelected(pieceRates.map((r) => r._id));
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

  const handleBulkDeleteConfirm = async () => {
    if (selected.length === 0) return;

    try {
      setBulkDeleteLoading(true);
      setBulkDeleteError("");

      const token = localStorage.getItem("token");

      await Promise.all(
        selected.map((id) =>
          axios.delete(`${BASE_URL}/api/piece-rate-master/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ),
      );

      setOpenBulkDeleteDialog(false);
      setSelected([]);
      fetchPieceRates();
      showNotification("Selected piece rates deleted successfully", "success");
    } catch (error) {
      console.error("Bulk delete error:", error);
      setBulkDeleteError(
        error.response?.data?.message ||
          "Failed to delete selected piece rates",
      );
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  /* ================= MENU ================= */
  const handleMenuOpen = (event, rate) => {
    setAnchorEl(event.currentTarget);
    setSelectedRate(rate); // 🔥 ID correctly set here
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /* ================= CRUD CALLBACKS ================= */
  const handleAdd = () => {
    fetchPieceRates();
    showNotification("Piece rate added successfully", "success");
  };

  const handleUpdate = () => {
    fetchPieceRates();
    showNotification("Piece rate updated successfully", "success");
  };

  const handleDelete = () => {
    fetchPieceRates();
    showNotification("Piece rate deleted successfully", "success");
  };

  /* ================= FILTER ================= */
  const filteredRates = pieceRates.filter(
    (r) =>
      r.productType?.toLowerCase().includes(search.toLowerCase()) ||
      r.operation?.toLowerCase().includes(search.toLowerCase()),
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
          Piece Rate Master
        </Typography>
        <Typography variant="body2" color="#64748B">
          Manage production piece rates
        </Typography>
      </Box>

      {/* ===== ACTION BAR ===== */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <TextField
            size="small"
            placeholder="Search product or operation..."
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

          <Stack direction="row" spacing={2}>
            {selected.length > 0 && (
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setOpenBulkDeleteDialog(true)}
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
              Add Piece Rate
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
                    checked={
                      pieceRates.length > 0 &&
                      selected.length === pieceRates.length
                    }
                    indeterminate={
                      selected.length > 0 && selected.length < pieceRates.length
                    }
                    onChange={handleSelectAll}
                    sx={{ color: "#fff" }}
                  />
                </TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Operation</TableCell>
                <TableCell>Rate</TableCell>
                <TableCell>Skill Level</TableCell>
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
              ) : filteredRates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRates.map((rate, index) => (
                  <TableRow
                    key={rate._id}
                    hover
                    sx={{
                      bgcolor: index % 2 === 0 ? STRIPE_ODD : STRIPE_EVEN,
                      "&:hover": { bgcolor: HOVER_COLOR },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected(rate._id)}
                        onChange={() => handleSelectOne(rate._id)}
                      />
                    </TableCell>

                    <TableCell sx={{ fontWeight: 600 }}>
                      {rate.productType}
                    </TableCell>

                    <TableCell>{rate.operation}</TableCell>

                    <TableCell>
                      ₹ {Number(rate.ratePerUnit).toLocaleString("en-IN")}
                    </TableCell>

                    <TableCell>{rate.skillLevel}</TableCell>

                    <TableCell>
                      <Chip
                        label={rate.isActive ? "Active" : "Inactive"}
                        size="small"
                        sx={{
                          backgroundColor: rate.isActive
                            ? "#dcfce7"
                            : "#fee2e2",
                          color: rate.isActive ? "#166534" : "#991b1b",
                        }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, rate)}
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
      <AddPieceRate
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onAdd={handleAdd}
      />

      {selectedRate && (
        <>
          <ViewPieceRate
            open={openView}
            onClose={() => setOpenView(false)}
            pieceRate={selectedRate}
          />
          <EditPieceRate
            open={openEdit}
            onClose={() => setOpenEdit(false)}
            pieceRate={selectedRate}
            onUpdate={handleUpdate}
          />
          <DeletePieceRate
            open={openDelete}
            onClose={() => setOpenDelete(false)}
            pieceRate={selectedRate}
            onDelete={handleDelete}
          />
        </>
      )}

      {/* ===== BULK DELETE CONFIRMATION DIALOG ===== */}
      <Dialog
        open={openBulkDeleteDialog}
        onClose={() => setOpenBulkDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            borderBottom: "1px solid #E0E0E0",
            backgroundColor: "#FDEDED",
          }}
        >
          <Typography sx={{ fontSize: 20, fontWeight: 600 }}>
            Confirm Bulk Delete
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            <Typography>
              Are you sure you want to delete <strong>{selected.length}</strong>{" "}
              selected piece rate(s)?
            </Typography>

            <Typography variant="body2" color="text.secondary">
              This action cannot be undone.
            </Typography>

            {bulkDeleteError && (
              <Alert severity="error">{bulkDeleteError}</Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            borderTop: "1px solid #E0E0E0",
            pt: 2,
            backgroundColor: "#F8FAFC",
          }}
        >
          <Button
            onClick={() => setOpenBulkDeleteDialog(false)}
            disabled={bulkDeleteLoading}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleBulkDeleteConfirm}
            disabled={bulkDeleteLoading}
            startIcon={!bulkDeleteLoading && <DeleteIcon />}
          >
            {bulkDeleteLoading ? "Deleting..." : "Delete Selected"}
          </Button>
        </DialogActions>
      </Dialog>

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

export default PieceRateMaster;