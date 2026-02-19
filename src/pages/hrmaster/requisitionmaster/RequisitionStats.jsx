import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Stack,
  Avatar,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Drafts as DraftsIcon,
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  MonetizationOn as MonetizationIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  Business as BusinessIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  Celebration as CelebrationIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  FilterList as FilterListIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import axios from 'axios';
import BASE_URL from '../../../config/Config';
import { format } from 'date-fns';

const RequisitionStats = ({ open, onClose }) => {
  const theme = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [selectedView, setSelectedView] = useState('overview');

  const COLORS = {
    draft: '#FF9800',
    pendingApproval: '#2196F3',
    approved: '#4CAF50',
    rejected: '#F44336',
    inProgress: '#9C27B0',
    filled: '#009688',
    total: '#1976D2'
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/requisitions/stats/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setDashboardData(response.data.data);
        setLastUpdated(new Date());
      } else {
        setError(response.data.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const formatCurrency = (value) => {
    if (!value) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value) => {
    if (!value) return '0';
    return new Intl.NumberFormat('en-IN').format(value);
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: <DraftsIcon />,
      pendingApproval: <PendingIcon />,
      approved: <CheckCircleIcon />,
      rejected: <ErrorIcon />,
      inProgress: <TrendingUpIcon />,
      filled: <CheckCircleIcon />
    };
    return icons[status] || <AssignmentIcon />;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: '#FF9800',
      pendingApproval: '#2196F3',
      approved: '#4CAF50',
      rejected: '#F44336',
      inProgress: '#9C27B0',
      filled: '#009688'
    };
    return colors[status] || '#757575';
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend, onClick }) => (
    <Card 
      sx={{ 
        borderRadius: 2,
        border: '1px solid #E0E0E0',
        boxShadow: 'none',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          cursor: onClick ? 'pointer' : 'default'
        },
        position: 'relative',
        overflow: 'visible'
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: `${color}15`,
              color: color,
              width: 56,
              height: 56,
              borderRadius: 2
            }}
          >
            {icon}
          </Avatar>
          {trend && (
            <Chip
              size="small"
              icon={trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`${trend > 0 ? '+' : ''}${trend}%`}
              sx={{
                backgroundColor: trend > 0 ? '#E8F5E9' : '#FFEBEE',
                color: trend > 0 ? '#2E7D32' : '#C62828',
                fontWeight: 500
              }}
            />
          )}
        </Box>
        
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#101010', mb: 0.5 }}>
          {value}
        </Typography>
        
        <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
          {title}
        </Typography>
        
        {subtitle && (
          <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const ProgressCard = ({ title, value, total, color, icon }) => {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    
    return (
      <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid #E0E0E0', backgroundColor: '#F8FAFC' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 32, height: 32 }}>
            {icon}
          </Avatar>
          <Typography variant="body2" sx={{ color: '#666' }}>{title}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#101010' }}>
            {formatNumber(value)}
          </Typography>
          <Typography variant="caption" sx={{ color: '#999' }}>
            of {formatNumber(total)}
          </Typography>
        </Box>
        
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: '#E0E0E0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
              borderRadius: 4
            }
          }}
        />
        
        <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 1, textAlign: 'right' }}>
          {percentage}% Complete
        </Typography>
      </Paper>
    );
  };

  const StatusDistributionChart = () => {
    if (!dashboardData?.summary) return null;

    const data = [
      { name: 'Draft', value: dashboardData.summary.draft, color: COLORS.draft },
      { name: 'Pending', value: dashboardData.summary.pendingApproval, color: COLORS.pendingApproval },
      { name: 'Approved', value: dashboardData.summary.approved, color: COLORS.approved },
      { name: 'Rejected', value: dashboardData.summary.rejected, color: COLORS.rejected },
      { name: 'In Progress', value: dashboardData.summary.inProgress, color: COLORS.inProgress },
      { name: 'Filled', value: dashboardData.summary.filled, color: COLORS.filled }
    ].filter(item => item.value > 0);

    return (
      <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #E0E0E0', height: '100%' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#101010', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DashboardIcon sx={{ color: '#1976D2' }} />
          Status Distribution
        </Typography>
        
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip 
              formatter={(value) => formatNumber(value)}
              contentStyle={{ borderRadius: 8, border: '1px solid #E0E0E0' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mt: 2 }}>
          {data.map((item) => (
            <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
              <Typography variant="caption" sx={{ color: '#666' }}>
                {item.name}: {formatNumber(item.value)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    );
  };

  const DepartmentStatsTable = () => {
    if (!dashboardData?.departmentStats || dashboardData.departmentStats.length === 0) {
      return (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, border: '1px solid #E0E0E0' }}>
          <BusinessIcon sx={{ fontSize: 48, color: '#CCC', mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#666' }}>
            No department statistics available
          </Typography>
        </Paper>
      );
    }

    return (
      <Paper sx={{ borderRadius: 2, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
        <Box sx={{ p: 2, backgroundColor: '#F8FAFC', borderBottom: '1px solid #E0E0E0' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#101010', display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon sx={{ color: '#1976D2' }} />
            Department-wise Statistics
          </Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                <TableCell sx={{ fontWeight: 600, color: '#101010' }}>Department</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#101010' }}>Total Requisitions</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#101010' }}>Total Positions</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#101010' }}>Approved</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#101010' }}>Fulfillment Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboardData.departmentStats.map((dept) => (
                <TableRow key={dept._id} sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                  <TableCell sx={{ fontWeight: 500 }}>{dept._id}</TableCell>
                  <TableCell align="right">{formatNumber(dept.count)}</TableCell>
                  <TableCell align="right">{formatNumber(dept.positions)}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={formatNumber(dept.approved)}
                      size="small"
                      sx={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={dept.positions > 0 ? (dept.approved / dept.positions) * 100 : 0}
                        sx={{
                          width: 80,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: '#E0E0E0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#4CAF50'
                          }
                        }}
                      />
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {dept.positions > 0 ? Math.round((dept.approved / dept.positions) * 100) : 0}%
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  const MonthlyTrendChart = () => {
    if (!dashboardData?.monthlyTrend || dashboardData.monthlyTrend.length === 0) return null;

    const data = dashboardData.monthlyTrend.map(item => ({
      ...item,
      month: format(new Date(item.month + '-01'), 'MMM yyyy')
    }));

    return (
      <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #E0E0E0' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#101010', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimelineIcon sx={{ color: '#1976D2' }} />
          Monthly Trend
        </Typography>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
            <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 12 }} />
            <YAxis tick={{ fill: '#666', fontSize: 12 }} />
            <ChartTooltip 
              contentStyle={{ borderRadius: 8, border: '1px solid #E0E0E0' }}
              formatter={(value) => formatNumber(value)}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="count" 
              name="Requisitions" 
              stroke="#1976D2" 
              fill="#1976D2" 
              fillOpacity={0.1} 
            />
            <Area 
              type="monotone" 
              dataKey="positions" 
              name="Positions" 
              stroke="#4CAF50" 
              fill="#4CAF50" 
              fillOpacity={0.1} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>
    );
  };

  const KPIWidgets = () => {
    const { summary } = dashboardData;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Requisitions"
            value={formatNumber(summary.total)}
            icon={<AssignmentIcon />}
            color={COLORS.total}
            subtitle={`${summary.totalPositions} total positions`}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Average Budget"
            value={formatCurrency(summary.avgBudget)}
            icon={<MonetizationIcon />}
            color="#FF9800"
            subtitle="Per position"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Fulfillment Rate"
            value={`${summary.fulfillmentRate}%`}
            icon={<TrendingUpIcon />}
            color="#4CAF50"
            subtitle={`${summary.filledPositions} filled positions`}
          />
        </Grid>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#1976D2' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 1,
            '& .MuiAlert-icon': {
              alignItems: 'center'
            }
          }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ borderRadius: 1 }}>
          No dashboard data available
        </Alert>
      </Box>
    );
  }

  const { summary } = dashboardData;

  return (
    <Box sx={{ p: 3, backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#101010', mb: 1 }}>
            Requisition Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={<DateRangeIcon />}
              label={lastUpdated ? `Last updated: ${format(lastUpdated, 'dd MMM yyyy, hh:mm a')}` : 'Not updated yet'}
              size="small"
              sx={{ backgroundColor: '#F0F0F0', color: '#666' }}
            />
            <Chip
              label="Real-time"
              size="small"
              sx={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}
            />
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              borderColor: '#E0E0E0',
              color: '#666',
              '&:hover': {
                borderColor: '#1976D2',
                backgroundColor: '#F5F5F5'
              }
            }}
          >
            Print
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              borderColor: '#E0E0E0',
              color: '#666',
              '&:hover': {
                borderColor: '#1976D2',
                backgroundColor: '#F5F5F5'
              }
            }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              backgroundColor: '#1976D2',
              '&:hover': {
                backgroundColor: '#1565C0'
              }
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <KPIWidgets />

      {/* Status Progress Cards */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={3}>
          <ProgressCard
            title="Draft Requisitions"
            value={summary.draft}
            total={summary.total}
            color={COLORS.draft}
            icon={<DraftsIcon />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <ProgressCard
            title="Pending Approval"
            value={summary.pendingApproval}
            total={summary.total}
            color={COLORS.pendingApproval}
            icon={<PendingIcon />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <ProgressCard
            title="Approved"
            value={summary.approved}
            total={summary.total}
            color={COLORS.approved}
            icon={<CheckCircleIcon />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <ProgressCard
            title="In Progress"
            value={summary.inProgress}
            total={summary.total}
            color={COLORS.inProgress}
            icon={<TrendingUpIcon />}
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={5}>
          <StatusDistributionChart />
        </Grid>
        <Grid item xs={12} md={7}>
          <MonthlyTrendChart />
        </Grid>
      </Grid>

      {/* Department Statistics */}
      <Box sx={{ mt: 3 }}>
        <DepartmentStatsTable />
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, border: '1px solid #E0E0E0' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#1976D2', mb: 1 }}>
              {summary.total}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>Total Requisitions</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, border: '1px solid #E0E0E0' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#4CAF50', mb: 1 }}>
              {summary.totalPositions}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>Total Positions</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, border: '1px solid #E0E0E0' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#FF9800', mb: 1 }}>
              {summary.approvedPositions}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>Approved Positions</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, border: '1px solid #E0E0E0' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#F44336', mb: 1 }}>
              {summary.rejected}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>Rejected Requisitions</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ mt: 3, p: 2, borderRadius: 2, border: '1px solid #E0E0E0', backgroundColor: '#F8FAFC' }}>
        <Typography variant="subtitle2" sx={{ color: '#666', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DashboardIcon sx={{ fontSize: 18 }} />
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<AssignmentIcon />}
            size="small"
            sx={{ borderRadius: 1, textTransform: 'none' }}
          >
            View All Requisitions
          </Button>
          <Button
            variant="outlined"
            startIcon={<DraftsIcon />}
            size="small"
            sx={{ borderRadius: 1, textTransform: 'none' }}
          >
            Process Drafts ({summary.draft})
          </Button>
          <Button
            variant="outlined"
            startIcon={<PendingIcon />}
            size="small"
            sx={{ borderRadius: 1, textTransform: 'none' }}
          >
            Pending Approvals ({summary.pendingApproval})
          </Button>
          <Button
            variant="outlined"
            startIcon={<TrendingUpIcon />}
            size="small"
            sx={{ borderRadius: 1, textTransform: 'none' }}
          >
            In Progress ({summary.inProgress})
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default RequisitionStats;