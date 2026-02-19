import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  Badge,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
  ContentCopy as DuplicateIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  PictureAsPdf as PdfIcon,
  GetApp as DownloadIcon,
  Add as AddIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../../../config/Config';
import { formatDistanceToNow } from 'date-fns';

/* ------------------- Status Chip Component ------------------- */
const StatusChip = ({ status }) => {
  const statusConfig = {
    draft: { color: 'default', icon: <ScheduleIcon />, label: 'Draft' },
    published: { color: 'success', icon: <CheckCircleIcon />, label: 'Published' },
    closed: { color: 'error', icon: <ErrorIcon />, label: 'Closed' },
    pending: { color: 'warning', icon: <PendingIcon />, label: 'Pending' }
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Chip
      size="small"
      icon={config.icon}
      label={config.label}
      color={config.color}
      variant="outlined"
    />
  );
};

/* ------------------- Platform Status Chip ------------------- */
const PlatformStatusChip = ({ status }) => {
  const statusConfig = {
    pending: { color: 'warning', label: 'Pending' },
    published: { color: 'success', label: 'Published' },
    failed: { color: 'error', label: 'Failed' },
    retrying: { color: 'info', label: 'Retrying' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Chip
      size="small"
      label={config.label}
      color={config.color}
      sx={{ height: 20, fontSize: '0.625rem' }}
    />
  );
};

/* ------------------- Main Component ------------------- */
const JobListings = () => {
  const navigate = useNavigate();
  
  // State for jobs data
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState('draft');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [departments, setDepartments] = useState([]);
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  
  // View drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewingJob, setViewingJob] = useState(null);

  // Fetch jobs on component mount and when filters change
  useEffect(() => {
    fetchJobs();
  }, [page, rowsPerPage, statusFilter, searchQuery, departmentFilter]);

  // Extract unique departments from jobs
  useEffect(() => {
    if (jobs.length > 0) {
      const uniqueDepts = [...new Set(jobs.map(job => job.department))];
      setDepartments(uniqueDepts);
    }
  }, [jobs]);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
        department: departmentFilter || undefined
      };
      
      // Remove undefined params
      Object.keys(params).forEach(key => 
        params[key] === undefined && delete params[key]
      );
      
      const response = await axios.get(`${BASE_URL}/api/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      if (response.data.success) {
        setJobs(response.data.data || []);
        setTotalItems(response.data.pagination?.totalItems || 0);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch job listings');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleDepartmentFilterChange = (event) => {
    setDepartmentFilter(event.target.value);
    setPage(0);
  };

  const handleMenuOpen = (event, job) => {
    setAnchorEl(event.currentTarget);
    setSelectedJob(job);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedJob(null);
  };

  const handleViewJob = (job) => {
    setViewingJob(job);
    setDrawerOpen(true);
    handleMenuClose();
  };

  const handleEditJob = () => {
    if (selectedJob) {
      navigate(`/jobs/edit/${selectedJob._id}`);
    }
    handleMenuClose();
  };

  const handlePublishJob = async () => {
    if (!selectedJob) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/api/jobs/${selectedJob._id}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchJobs(); // Refresh the list
    } catch (err) {
      setError('Failed to publish job');
    }
    handleMenuClose();
  };

  const handleDeleteJob = async () => {
    if (!selectedJob || !window.confirm('Are you sure you want to delete this job opening?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/jobs/${selectedJob._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchJobs(); // Refresh the list
    } catch (err) {
      setError('Failed to delete job');
    }
    handleMenuClose();
  };

  const handleDuplicateJob = () => {
    if (selectedJob) {
      // Navigate to add job page with pre-filled data
      navigate('/jobs/add', { state: { duplicateFrom: selectedJob } });
    }
    handleMenuClose();
  };

  const handleRefresh = () => {
    fetchJobs();
  };

  const handleAddNew = () => {
    navigate('/jobs/add');
  };

  const getPlatformIcon = (platform) => {
    switch(platform) {
      case 'linkedin':
        return <Avatar src="/linkedin-icon.png" sx={{ width: 20, height: 20 }} />;
      case 'naukri':
        return <Avatar src="/naukri-icon.png" sx={{ width: 20, height: 20 }} />;
      case 'careerPage':
        return <BusinessIcon fontSize="small" />;
      default:
        return <WorkIcon fontSize="small" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Job Openings
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            sx={{
              background: 'linear-gradient(135deg, #164e63, #00B4D8)',
              '&:hover': { opacity: 0.9 }
            }}
          >
            Add Job Opening
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: '#164e63', width: 48, height: 48 }}>
                  <WorkIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={600}>
                    {totalItems}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Jobs
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: '#2e7d32', width: 48, height: 48 }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={600}>
                    {jobs.filter(j => j.status === 'published').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Published
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: '#ed6c02', width: 48, height: 48 }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={600}>
                    {jobs.filter(j => j.status === 'draft').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Drafts
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: '#9c27b0', width: 48, height: 48 }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={600}>
                    {jobs.reduce((acc, job) => acc + (job.applicationCount || 0), 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Applications
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={departmentFilter}
                onChange={handleDepartmentFilterChange}
                label="Department"
              >
                <MenuItem value="">All</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('draft');
                setDepartmentFilter('');
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Jobs Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Job ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Requisition</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Applications</TableCell>
                <TableCell>Published On</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                    <Typography color="textSecondary">
                      No job openings found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <TableRow key={job._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {job.jobId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {job.title}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                        {job.publishTo?.map((p, idx) => (
                          <Tooltip key={idx} title={`${p.platform}: ${p.status}`}>
                            <Box sx={{ display: 'inline-flex' }}>
                              <PlatformStatusChip status={p.status} />
                            </Box>
                          </Tooltip>
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>{job.department}</TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2">{job.location}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={job.requisitionId?.requisitionId || job.requisitionNumber}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
                          {job.requisitionNumber}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={job.status} />
                    </TableCell>
                    <TableCell>
                      <Badge badgeContent={job.applicationCount || 0} color="primary">
                        <PeopleIcon color="action" />
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {job.createdAt && (
                        <Tooltip title={new Date(job.createdAt).toLocaleString()}>
                          <Typography variant="body2">
                            {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                          </Typography>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>{job.createdByName || 'N/A'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, job)}
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

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalItems}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewJob(selectedJob)}>
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditJob}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handlePublishJob}>
          <ListItemIcon><PublishIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Publish</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDuplicateJob}>
          <ListItemIcon><DuplicateIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteJob} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* View Details Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 500 } } }}
      >
        {viewingJob && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Job Details
              </Typography>
              <IconButton onClick={() => setDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Stack spacing={3}>
              {/* Header Info */}
              <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      {viewingJob.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {viewingJob.jobId}
                    </Typography>
                  </Box>
                  <StatusChip status={viewingJob.status} />
                </Stack>
              </Paper>

              {/* Key Details */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Department</Typography>
                  <Typography variant="body1" fontWeight={500}>{viewingJob.department}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Location</Typography>
                  <Typography variant="body1" fontWeight={500}>{viewingJob.location}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Experience</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {viewingJob.experienceRequired?.min} - {viewingJob.experienceRequired?.max} years
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Salary Range</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    ₹{viewingJob.salaryRange?.min?.toLocaleString()} - ₹{viewingJob.salaryRange?.max?.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Employment Type</Typography>
                  <Typography variant="body1" fontWeight={500}>{viewingJob.employmentType}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Applications</Typography>
                  <Typography variant="body1" fontWeight={500}>{viewingJob.applicationCount || 0}</Typography>
                </Grid>
              </Grid>

              <Divider />

              {/* Company Intro */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Company Introduction
                </Typography>
                <Typography variant="body2">
                  {viewingJob.companyIntro}
                </Typography>
              </Box>

              {/* Description */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Job Description
                </Typography>
                <Typography variant="body2">
                  {viewingJob.description}
                </Typography>
              </Box>

              {/* Requirements */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Requirements
                </Typography>
                <List dense>
                  {viewingJob.requirements?.map((req, idx) => (
                    <ListItem key={idx} sx={{ py: 0 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={req} />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Responsibilities */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Responsibilities
                </Typography>
                <List dense>
                  {viewingJob.responsibilities?.map((resp, idx) => (
                    <ListItem key={idx} sx={{ py: 0 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={resp} />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Skills */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Required Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {viewingJob.skills?.map((skill, idx) => (
                    <Chip key={idx} label={skill} size="small" />
                  ))}
                </Box>
              </Box>

              {/* Education */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Education
                </Typography>
                <List dense>
                  {viewingJob.education?.map((edu, idx) => (
                    <ListItem key={idx} sx={{ py: 0 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <SchoolIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={edu} />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Publishing Details */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Publishing Status
                </Typography>
                <Stack spacing={1}>
                  {viewingJob.publishTo?.map((platform, idx) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 1.5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          {getPlatformIcon(platform.platform)}
                          <Typography variant="body2" textTransform="capitalize">
                            {platform.platform}
                          </Typography>
                        </Stack>
                        <PlatformStatusChip status={platform.status} />
                      </Stack>
                      {platform.retryCount > 0 && (
                        <Typography variant="caption" color="textSecondary">
                          Retry count: {platform.retryCount}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Stack>
              </Box>

              {/* Metadata */}
              <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary" display="block">
                  Created by: {viewingJob.createdByName}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  Created on: {new Date(viewingJob.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  Last updated: {new Date(viewingJob.updatedAt).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default JobListings;