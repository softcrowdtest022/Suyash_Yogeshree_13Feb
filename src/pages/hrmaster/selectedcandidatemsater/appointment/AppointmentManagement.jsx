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
  Avatar,
  Tooltip
} from "@mui/material";

import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Sort as SortIcon,
  Description as DescriptionIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Download as DownloadIcon
} from "@mui/icons-material";

import axios from "axios";
import BASE_URL from "../../../../config/Config";

/* COMPONENTS */
import GenerateAppointmentLetter from "./Generate";
import SendAppointmentLetter from "./SendEmail";
import AcceptAppointmentLetter from "./Accept";

const HEADER_GRADIENT =
  "linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)";
const PRIMARY_BLUE = "#00B4D8";

// Status color mapping
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'generated':
      return { bg: '#fef3c7', color: '#92400e', label: 'Generated' };
    case 'sent':
      return { bg: '#e3f2fd', color: '#1976d2', label: 'Sent' };
    case 'accepted':
      return { bg: '#d1fae5', color: '#065f46', label: 'Accepted' };
    case 'pending':
      return { bg: '#f1f5f9', color: '#475569', label: 'Pending' };
    default:
      return { bg: '#f1f5f9', color: '#475569', label: status || 'Pending' };
  }
};

const AppointmentManagement = () => {
  const [dataList, setDataList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [actionAnchor, setActionAnchor] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Modal states
  const [openGenerate, setOpenGenerate] = useState(false);
  const [openSend, setOpenSend] = useState(false);
  const [openAccept, setOpenAccept] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  /* SNACKBAR STATE */
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const [sortOrder, setSortOrder] = useState("asc");
  const [sortField, setSortField] = useState("candidateName");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch all appointment letters
      const lettersResponse = await axios.get(`${BASE_URL}/api/appointment-letter/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (lettersResponse.data.success) {
        const letters = lettersResponse.data.data || [];
        
        // Transform the data to match the table structure
        const transformedData = letters.map(letter => {
          // Extract candidate details from the nested candidateId object
          const candidateInfo = letter.candidateId || {};
          
          return {
            _id: letter._id,
            documentId: letter.documentId || letter._id,
            firstName: candidateInfo.firstName || '',
            lastName: candidateInfo.lastName || '',
            fullName: candidateInfo.fullName || `${candidateInfo.firstName || ''} ${candidateInfo.lastName || ''}`.trim(),
            email: candidateInfo.email || '',
            phone: '', // Phone number not available in the response
            candidateId: candidateInfo._id || candidateInfo.id || 'N/A',
            letterStatus: letter.status || 'pending',
            appointmentLetter: letter,
            fileUrl: letter.fileUrl,
            generatedAt: letter.generatedAt || letter.createdAt,
            joiningDate: '', // Not available in response
            offerDesignation: letter.offerId?.offerDetails?.designation || 'N/A',
            sentAt: letter.sentAt,
            acceptedAt: letter.acceptedAt
          };
        });

        console.log('Transformed data:', transformedData); // For debugging
        setDataList(transformedData);
        setFilteredList(transformedData);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      showNotification("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  /* Snackbar helper */
  const showNotification = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  /* SEARCH */
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = dataList.filter((item) =>
      item.firstName?.toLowerCase().includes(value) ||
      item.lastName?.toLowerCase().includes(value) ||
      item.fullName?.toLowerCase().includes(value) ||
      item.email?.toLowerCase().includes(value) ||
      item.candidateId?.toLowerCase().includes(value) ||
      item.letterStatus?.toLowerCase().includes(value) ||
      item.documentId?.toLowerCase().includes(value)
    );

    setFilteredList(filtered);
    setPage(0);
  };

  /* SORT */
  const handleSort = (field) => {
    const sorted = [...filteredList].sort((a, b) => {
      let aValue, bValue;
      
      if (field === 'candidateName') {
        aValue = a.fullName || `${a.firstName || ''} ${a.lastName || ''}`.trim();
        bValue = b.fullName || `${b.firstName || ''} ${b.lastName || ''}`.trim();
      } else if (field === 'status') {
        aValue = a.letterStatus || '';
        bValue = b.letterStatus || '';
      } else {
        aValue = a[field] || '';
        bValue = b[field] || '';
      }

      const comparison = aValue.localeCompare(bValue);
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredList(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setSortField(field);
  };

  /* FILTER BY STATUS */
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    
    if (status === '') {
      setFilteredList(dataList);
    } else {
      const filtered = dataList.filter(item => 
        item.letterStatus?.toLowerCase() === status.toLowerCase()
      );
      setFilteredList(filtered);
    }
    
    setPage(0);
    handleFilterClose();
  };

  /* RESET FILTER */
  const handleResetFilter = () => {
    setFilteredList(dataList);
    setSearchTerm("");
    setStatusFilter('');
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

  /* REFRESH DATA */
  const handleRefresh = () => {
    fetchData();
    showNotification("Data refreshed successfully", "success");
  };

  /* MODAL HANDLERS */
  const handleGenerateOpen = () => {
    setOpenGenerate(true);
    handleActionClose();
  };

  const handleSendOpen = () => {
    setOpenSend(true);
    handleActionClose();
  };

  const handleAcceptOpen = () => {
    setOpenAccept(true);
    handleActionClose();
  };

  const handleGenerateClose = (success) => {
    setOpenGenerate(false);
    if (success) {
      fetchData();
      showNotification("Appointment letter generated successfully");
    }
    setSelectedItem(null);
  };

  const handleSendClose = (success) => {
    setOpenSend(false);
    if (success) {
      fetchData();
      showNotification("Appointment letter sent successfully");
    }
    setSelectedItem(null);
  };

  const handleAcceptClose = (success) => {
    setOpenAccept(false);
    if (success) {
      fetchData();
      showNotification("Appointment letter accepted successfully");
    }
    setSelectedItem(null);
  };

  /* FORMAT DATE */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get display name
  const getDisplayName = (item) => {
    if (item.fullName) return item.fullName;
    if (item.firstName || item.lastName) return `${item.firstName || ''} ${item.lastName || ''}`.trim();
    return 'N/A';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
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
        Appointment Management
      </Typography>
      <Typography variant="body2" color="#64748B" sx={{ mb: 3 }}>
        Generate, send and manage appointment letters for selected candidates
      </Typography>

      {/* ACTION BAR */}
      <Paper sx={{ p: 1.5, mb: 3 }}>
        <Stack direction="row" spacing={2} justifyContent="space-between" flexWrap="wrap">
          <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
            <TextField
              placeholder="Search by name, email, document ID..."
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

            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleFilterClick}
              endIcon={statusFilter && <Chip label={statusFilter} size="small" sx={{ ml: 1 }} />}
            >
              Filter
            </Button>

            <Button
              variant="outlined"
              startIcon={<SortIcon />}
              onClick={() => handleSort('candidateName')}
            >
              Sort Name {sortField === 'candidateName' && (sortOrder === "asc" ? "↑" : "↓")}
            </Button>

            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            {(searchTerm || statusFilter) && (
              <Button variant="text" onClick={handleResetFilter}>
                Clear Filters
              </Button>
            )}
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenGenerate(true)}
              sx={{ background: HEADER_GRADIENT }}
            >
              Generate Letter
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* FILTER MENU */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <MenuItem onClick={() => handleStatusFilter('')}>
          <ListItemText>All Status</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleStatusFilter('pending')}>
          <ListItemIcon>
            <DescriptionIcon fontSize="small" sx={{ color: '#475569' }} />
          </ListItemIcon>
          <ListItemText>Pending</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusFilter('generated')}>
          <ListItemIcon>
            <DescriptionIcon fontSize="small" sx={{ color: '#92400e' }} />
          </ListItemIcon>
          <ListItemText>Generated</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusFilter('sent')}>
          <ListItemIcon>
            <SendIcon fontSize="small" sx={{ color: '#1976d2' }} />
          </ListItemIcon>
          <ListItemText>Sent</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusFilter('accepted')}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" sx={{ color: '#2e7d32' }} />
          </ListItemIcon>
          <ListItemText>Accepted</ListItemText>
        </MenuItem>
      </Menu>

      {/* TABLE */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: HEADER_GRADIENT }}>
                <TableCell sx={{ color: "white" }}>Candidate</TableCell>
                <TableCell sx={{ color: "white" }}>Document ID</TableCell>
                <TableCell sx={{ color: "white" }}>Contact</TableCell>
                <TableCell sx={{ color: "white" }}>Letter Status</TableCell>
                <TableCell sx={{ color: "white" }}>Generated On</TableCell>
                <TableCell sx={{ color: "white" }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginated.length > 0 ? (
                paginated.map((item) => {
                  const statusStyle = getStatusColor(item.letterStatus);
                  const displayName = getDisplayName(item);
                  
                  return (
                    <TableRow key={item._id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, bgcolor: PRIMARY_BLUE }}>
                            {displayName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {displayName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              ID: {item.candidateId}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {item.documentId}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Stack spacing={0.5}>
                          {item.email ? (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <EmailIcon sx={{ fontSize: 14, color: '#64748B' }} />
                              <Typography variant="caption">{item.email}</Typography>
                            </Stack>
                          ) : (
                            <Typography variant="caption" color="textSecondary">No email</Typography>
                          )}
                          {item.phone ? (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <PhoneIcon sx={{ fontSize: 14, color: '#64748B' }} />
                              <Typography variant="caption">{item.phone}</Typography>
                            </Stack>
                          ) : (
                            <Typography variant="caption" color="textSecondary">No phone</Typography>
                          )}
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={statusStyle.label}
                          size="small"
                          sx={{
                            bgcolor: statusStyle.bg,
                            color: statusStyle.color,
                            fontWeight: 500,
                            minWidth: 80
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        {item.generatedAt 
                          ? formatDate(item.generatedAt)
                          : '-'
                        }
                      </TableCell>

                      <TableCell align="center">
                        <IconButton onClick={(e) => handleActionOpen(e, item)}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    No appointment letters found
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
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* ACTION MENU */}
      <Menu anchorEl={actionAnchor} open={Boolean(actionAnchor)} onClose={handleActionClose}>
        {/* Generate Letter - Show if status is pending */}
        {selectedItem?.letterStatus === 'pending' && (
          <MenuItem onClick={handleGenerateOpen}>
            <ListItemIcon>
              <DescriptionIcon fontSize="small" sx={{ color: PRIMARY_BLUE }} />
            </ListItemIcon>
            <ListItemText>Generate Letter</ListItemText>
          </MenuItem>
        )}

        {/* Send Letter - Show if status is generated */}
        {selectedItem?.letterStatus === 'generated' && (
          <MenuItem onClick={handleSendOpen}>
            <ListItemIcon>
              <SendIcon fontSize="small" sx={{ color: '#1976d2' }} />
            </ListItemIcon>
            <ListItemText>Send Letter</ListItemText>
          </MenuItem>
        )}

        {/* Accept Letter - Show if status is sent */}
        {selectedItem?.letterStatus === 'sent' && (
          <MenuItem onClick={handleAcceptOpen}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" sx={{ color: '#2e7d32' }} />
            </ListItemIcon>
            <ListItemText>Accept Letter</ListItemText>
          </MenuItem>
        )}

        {/* Download option for all letters with fileUrl */}
        {selectedItem?.fileUrl && (
          <MenuItem onClick={() => window.open(selectedItem.fileUrl, '_blank')}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" sx={{ color: PRIMARY_BLUE }} />
            </ListItemIcon>
            <ListItemText>Download Letter</ListItemText>
          </MenuItem>
        )}

        {/* If no actions available */}
        {selectedItem?.letterStatus === 'accepted' && (
          <MenuItem disabled>
            <ListItemText secondary="Letter already accepted" />
          </MenuItem>
        )}
      </Menu>

      {/* MODALS */}
      <GenerateAppointmentLetter
        open={openGenerate}
        onClose={handleGenerateClose}
        onSubmit={(data) => {
          if (data) {
            fetchData();
            showNotification("Appointment letter generated successfully");
          }
        }}
      />

      <SendAppointmentLetter
        open={openSend}
        onClose={handleSendClose}
        onSubmit={(data) => {
          if (data) {
            fetchData();
            showNotification("Appointment letter sent successfully");
          }
        }}
        documentData={selectedItem?.appointmentLetter}
        documentId={selectedItem?.documentId}
      />

      <AcceptAppointmentLetter
        open={openAccept}
        onClose={handleAcceptClose}
        onSubmit={(data) => {
          if (data) {
            fetchData();
            showNotification("Appointment letter accepted successfully");
          }
        }}
        documentData={selectedItem?.appointmentLetter}
        documentId={selectedItem?.documentId}
      />

      {/* SNACKBAR */}
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

export default AppointmentManagement;