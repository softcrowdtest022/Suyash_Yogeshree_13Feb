import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const AccidentStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
    totalCost: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/api/safety/accidents`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const accidents = response.data.data || [];

        const total = accidents.length;
        const open = accidents.filter(a => a.investigationStatus === 'Open').length;
        const closed = accidents.filter(a => a.investigationStatus === 'Closed').length;
        const totalCost = accidents.reduce((sum, a) => sum + (a.costIncurred || 0), 0);

        setStats({ total, open, closed, totalCost });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const cardStyle = (bg) => ({
    background: bg,
    borderRadius: 3,
    color: '#1e293b'
  });

  return (
    <Box mb={3}>
      <Grid container spacing={3}>

        <Grid item xs={12} md={3}>
          <Card sx={cardStyle('#E3F2FD')}>
            <CardContent>
              <Typography variant="subtitle2">Total Accidents</Typography>
              <Typography variant="h4" fontWeight={700}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={cardStyle('#FFF3E0')}>
            <CardContent>
              <Typography variant="subtitle2">Open Cases</Typography>
              <Typography variant="h4" fontWeight={700}>
                {stats.open}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={cardStyle('#E8F5E9')}>
            <CardContent>
              <Typography variant="subtitle2">Closed Cases</Typography>
              <Typography variant="h4" fontWeight={700}>
                {stats.closed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={cardStyle('#FFEBEE')}>
            <CardContent>
              <Typography variant="subtitle2">Total Cost</Typography>
              <Typography variant="h4" fontWeight={700}>
                ₹ {stats.totalCost}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default AccidentStats;