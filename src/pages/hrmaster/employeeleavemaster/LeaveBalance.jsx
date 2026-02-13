import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../../config/Config";
import { Box, Paper, Typography } from "@mui/material";

function LeaveBalance() {
  const employeeId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const [balance, setBalance] = useState([]);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    const res = await axios.get(
      `${BASE_URL}/api/leaves/employee/${employeeId}/balance`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setBalance(res.data);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3}>
        Leave Balance
      </Typography>

      {balance.map((item) => (
        <Paper key={item._id} sx={{ p: 2, mb: 2 }}>
          <Typography>
            {item.leaveTypeId?.Name}
          </Typography>
          <Typography>Total: {item.totalLeaves}</Typography>
          <Typography>Used: {item.usedLeaves}</Typography>
          <Typography>Remaining: {item.remainingLeaves}</Typography>
        </Paper>
      ))}
    </Box>
  );
}

export default LeaveBalance;
