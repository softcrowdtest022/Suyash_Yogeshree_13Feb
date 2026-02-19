import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

const MedicalStats = () => {
  const [upcoming, setUpcoming] = useState(0);

  useEffect(() => {
    fetchUpcoming();
  }, []);

  const fetchUpcoming = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/api/safety/medical-records/upcoming-checkups`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setUpcoming(response.data.data.length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Grid container spacing={3} mb={3}>
      <Grid item xs={12} md={3}>
        <Card sx={{ bgcolor: '#E3F2FD' }}>
          <CardContent>
            <Typography variant="subtitle2">
              Upcoming Checkups
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {upcoming}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default MedicalStats;