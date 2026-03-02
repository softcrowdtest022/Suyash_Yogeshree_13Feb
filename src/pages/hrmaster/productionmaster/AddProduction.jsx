import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  MenuItem,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  styled,
  StepConnector,
  Divider,
} from "@mui/material";

import { Add as AddIcon } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";

import axios from "axios";
import BASE_URL from "../../../config/Config";

/* ================= Stepper Styling ================= */

const ColorConnector = styled(StepConnector)(() => ({
  "& .MuiStepConnector-line": {
    height: 4,
    border: 0,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
  },
  "&.Mui-active .MuiStepConnector-line, &.Mui-completed .MuiStepConnector-line":
    {
      background: "linear-gradient(90deg, #164e63, #00B4D8)",
    },
}));

const steps = ["Basic Details", "Production Details"];

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Making request to:", config.url);
    console.log("Request data:", config.data);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log("Response received:", response.data);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error("Request timeout");
    } else if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response error:", error.response.data);
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request setup error:", error.message);
    }
    return Promise.reject(error);
  }
);

const AddProduction = ({ open, onClose, onAdd }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [rateMaster, setRateMaster] = useState([]);

  const [loading, setLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [rateMasterLoading, setRateMasterLoading] = useState(false);
  const [error, setError] = useState("");
  const [networkError, setNetworkError] = useState("");

  const initialState = {
    employeeId: "",
    date: new Date(),
    rateMasterId: "",
    goodUnits: "",
    rejectedUnits: "",
    reworkUnits: "",
    qualityBonus: "",
    efficiencyBonus: "",
    startTime: new Date(),
    endTime: new Date(),
    machineId: "",
    batchNumber: "",
    orderNumber: "",
    remarks: "",
  };

  const [formData, setFormData] = useState(initialState);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData(initialState);
      setActiveStep(0);
      setError("");
      setNetworkError("");
    }
  }, [open]);

  // Fetch data when dialog opens
  useEffect(() => {
    if (open) {
      fetchEmployees();
      fetchRateMaster();
    }
  }, [open]);

  const fetchEmployees = async () => {
    try {
      setEmployeeLoading(true);
      setNetworkError("");

      const token = localStorage.getItem("token");

      const res = await api.get("/api/employees", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) setEmployees(res.data.data || []);
    } catch (err) {
      console.error("Employee fetch error:", err);
      if (err.code === 'ECONNABORTED') {
        setNetworkError("Request timeout. Please check your connection.");
      } else if (!err.response) {
        setNetworkError("Network error. Please check if the server is running.");
      } else {
        setError("Failed to load employees");
      }
    } finally {
      setEmployeeLoading(false);
    }
  };

  const fetchRateMaster = async () => {
    try {
      setRateMasterLoading(true);
      setNetworkError("");

      const token = localStorage.getItem("token");

      const res = await api.get("/api/piece-rate-master", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setRateMaster(res.data.data || []);
        console.log("Rate master data:", res.data.data);
      }
    } catch (err) {
      console.error("Rate master fetch error:", err);
      if (err.code === 'ECONNABORTED') {
        setNetworkError("Request timeout. Please check your connection.");
      } else if (!err.response) {
        setNetworkError("Network error. Please check if the server is running.");
      } else {
        setError("Failed to load rate master");
      }
    } finally {
      setRateMasterLoading(false);
    }
  };

  const handleChange = (e) => {
    setError("");
    setNetworkError("");
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const totalUnits = useMemo(() => {
    return (
      Number(formData.goodUnits || 0) +
      Number(formData.rejectedUnits || 0) +
      Number(formData.reworkUnits || 0)
    );
  }, [formData.goodUnits, formData.rejectedUnits, formData.reworkUnits]);

  const selectedRate = useMemo(() => {
    return rateMaster.find((rate) => rate._id === formData.rateMasterId);
  }, [formData.rateMasterId, rateMaster]);

  const handleSubmit = async () => {
    // Validation
    if (!formData.employeeId) return setError("Employee is required");
    if (!formData.date) return setError("Production date is required");
    if (!formData.rateMasterId) return setError("Please select Product & Operation");
    if (!formData.goodUnits) return setError("Good Units required");
    if (Number(formData.goodUnits) <= 0) return setError("Good Units must be greater than 0");
    if (!formData.startTime) return setError("Start time required");
    if (!formData.endTime) return setError("End time required");

    // Find the selected rate again to ensure we have the latest data
    const selectedRateData = rateMaster.find((rate) => rate._id === formData.rateMasterId);
    
    if (!selectedRateData) {
      return setError("Invalid rate master selected. Please select again.");
    }

    // Handle both productName and productType fields
    const productName = selectedRateData.productName || selectedRateData.productType;
    const operation = selectedRateData.operation;

    if (!productName) {
      console.error("Selected rate data:", selectedRateData);
      return setError("Selected rate master is missing product name");
    }

    if (!operation) {
      console.error("Selected rate data:", selectedRateData);
      return setError("Selected rate master is missing operation");
    }

    setLoading(true);
    setError("");
    setNetworkError("");

    try {
      const token = localStorage.getItem("token");

      // Calculate total units
      const calculatedTotalUnits = totalUnits;

      // Prepare payload according to the API schema
      const payload = {
        employeeId: formData.employeeId,
        date: formData.date.toISOString(),
        productName: productName,
        operation: operation,
        totalUnits: calculatedTotalUnits,
        goodUnits: Number(formData.goodUnits),
        rejectedUnits: Number(formData.rejectedUnits || 0),
        reworkUnits: Number(formData.reworkUnits || 0),
        qualityBonus: Number(formData.qualityBonus || 0),
        efficiencyBonus: Number(formData.efficiencyBonus || 0),
        startTime: formData.startTime.toISOString(),
        endTime: formData.endTime.toISOString(),
        machineId: formData.machineId || "",
        batchNumber: formData.batchNumber || "",
        orderNumber: formData.orderNumber || "",
        remarks: formData.remarks || "",
      };

      console.log("Sending payload to:", `${BASE_URL}/api/production/record`);
      console.log("Payload:", payload);

      const res = await api.post("/api/production/record", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.data.success) {
        // Format the response data
        const responseData = res.data.data;
        const productionData = {
          id: responseData._id || responseData.id,
          _id: responseData._id,
          employeeId: responseData.EmployeeID?._id || formData.employeeId,
          employeeName: responseData.employeeName || 
            (responseData.EmployeeID ? 
              `${responseData.EmployeeID.FirstName || ''} ${responseData.EmployeeID.LastName || ''}`.trim() : 
              ''),
          date: responseData.Date || responseData.date,
          productName: responseData.ProductName || responseData.productName,
          operation: responseData.Operation || responseData.operation,
          totalUnits: responseData.TotalUnits || responseData.totalUnits,
          goodUnits: responseData.GoodUnits || responseData.goodUnits,
          rejectedUnits: responseData.RejectedUnits || responseData.rejectedUnits,
          reworkUnits: responseData.ReworkUnits || responseData.reworkUnits,
          qualityBonus: responseData.QualityBonus || responseData.qualityBonus,
          efficiencyBonus: responseData.EfficiencyBonus || responseData.efficiencyBonus,
          ratePerUnit: responseData.RatePerUnit,
          earnings: responseData.DailyEarning || responseData.TotalAmount || responseData.earnings,
          totalAmount: responseData.TotalAmount,
          status: responseData.Status || responseData.status,
          qualityPercentage: responseData.QualityPercentage,
          efficiencyPercentage: responseData.EfficiencyPercentage,
          totalHours: responseData.TotalHours,
          rejectionRate: responseData.rejectionRate,
          netUnits: responseData.netUnits,
          startTime: responseData.StartTime || responseData.startTime,
          endTime: responseData.EndTime || responseData.endTime,
          machineId: responseData.MachineID || responseData.machineId,
          batchNumber: responseData.BatchNumber || responseData.batchNumber,
          orderNumber: responseData.OrderNumber || responseData.orderNumber,
          remarks: responseData.Remarks || responseData.remarks,
          salaryProcessed: responseData.SalaryProcessed,
          createdAt: responseData.createdAt,
          updatedAt: responseData.updatedAt,
        };
        
        onAdd(productionData);
        onClose();
      }
    } catch (err) {
      console.error("Full error object:", err);
      
      if (err.code === 'ECONNABORTED') {
        setNetworkError("Request timeout. Please try again.");
      } else if (!err.response) {
        setNetworkError(`Network error: Could not connect to server. Please check:
          • Server is running
          • URL is correct: ${BASE_URL}
          • CORS is configured
          • Network connection`);
      } else if (err.response.status === 401) {
        setError("Unauthorized. Please login again.");
      } else if (err.response.status === 403) {
        setError("You don't have permission to perform this action.");
      } else if (err.response.status === 404) {
        setError(`API endpoint not found: ${BASE_URL}/api/production/record`);
      } else if (err.response.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(err.response?.data?.message || "Failed to record production");
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to test API connection
  const testConnection = async () => {
    try {
      setNetworkError("");
      const token = localStorage.getItem("token");
      console.log("Testing connection to:", BASE_URL);
      
      const res = await api.get("/api/test", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      }).catch(() => ({ data: { success: false } }));
      
      if (res.data?.success) {
        alert("Connection successful!");
      } else {
        alert("Connected but test endpoint not available");
      }
    } catch (err) {
      console.error("Connection test failed:", err);
      alert(`Connection failed: ${err.message}`);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #164e63, #00B4D8)",
          color: "#fff",
        }}
      >
        Add Production Entry
      </DialogTitle>

      <DialogContent sx={{ pt: 4 }}>
        {/* Network Error Display */}
        {networkError && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={testConnection}>
                Test Connection
              </Button>
            }
          >
            {networkError}
          </Alert>
        )}

        <Stepper 
          activeStep={activeStep} 
          alternativeLabel 
          connector={<ColorConnector />} 
          sx={{ mb: 4, margin: 2 }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack spacing={3}>
            {activeStep === 0 && (
              <>
                <TextField
                  select
                  label="Employee *"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!formData.employeeId && error.includes("Employee")}
                >
                  {employeeLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={18} />
                    </MenuItem>
                  ) : employees.length === 0 ? (
                    <MenuItem disabled>No employees found</MenuItem>
                  ) : (
                    employees.map((emp) => (
                      <MenuItem key={emp._id} value={emp._id}>
                        {emp.FullName || `${emp.FirstName || ''} ${emp.LastName || ''}`.trim()} 
                        {emp.EmployeeID && ` (${emp.EmployeeID})`}
                      </MenuItem>
                    ))
                  )}
                </TextField>

                <DatePicker
                  label="Production Date *"
                  value={formData.date}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, date: value }))
                  }
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      required: true,
                      error: !formData.date && error.includes("date")
                    } 
                  }}
                />
              </>
            )}

            {activeStep === 1 && (
              <>
                <TextField
                  select
                  label="Select Product & Operation *"
                  name="rateMasterId"
                  value={formData.rateMasterId}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!formData.rateMasterId && error.includes("Product")}
                >
                  {rateMasterLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={18} />
                    </MenuItem>
                  ) : rateMaster.length === 0 ? (
                    <MenuItem disabled>No rate master data found</MenuItem>
                  ) : (
                    rateMaster.map((rate) => (
                      <MenuItem key={rate._id} value={rate._id}>
                        {rate.productName || rate.productType} - {rate.operation} (₹{rate.ratePerUnit} per unit)
                      </MenuItem>
                    ))
                  )}
                </TextField>

                {selectedRate && (
                  <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                    <Typography variant="body2">
                      <strong>Selected:</strong> {selectedRate.productName || selectedRate.productType} - {selectedRate.operation}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Rate per unit:</strong> ₹{selectedRate.ratePerUnit}
                    </Typography>
                  </Box>
                )}

                <TextField
                  type="number"
                  label="Good Units *"
                  name="goodUnits"
                  value={formData.goodUnits}
                  onChange={handleChange}
                  fullWidth
                  required
                  inputProps={{ min: 1 }}
                  error={!formData.goodUnits && error.includes("Good Units")}
                  helperText="Units that passed quality check"
                />

                <TextField
                  type="number"
                  label="Rejected Units"
                  name="rejectedUnits"
                  value={formData.rejectedUnits}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ min: 0 }}
                  helperText="Units that failed quality check"
                />

                <TextField
                  type="number"
                  label="Rework Units"
                  name="reworkUnits"
                  value={formData.reworkUnits}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ min: 0 }}
                  helperText="Units that need rework"
                />

                <TextField
                  type="number"
                  label="Quality Bonus"
                  name="qualityBonus"
                  value={formData.qualityBonus}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ min: 0 }}
                />

                <TextField
                  type="number"
                  label="Efficiency Bonus"
                  name="efficiencyBonus"
                  value={formData.efficiencyBonus}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ min: 0 }}
                />

                <TimePicker
                  label="Start Time *"
                  value={formData.startTime}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, startTime: value }))
                  }
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      required: true,
                      error: !formData.startTime && error.includes("Start")
                    } 
                  }}
                />

                <TimePicker
                  label="End Time *"
                  value={formData.endTime}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, endTime: value }))
                  }
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      required: true,
                      error: !formData.endTime && error.includes("End")
                    } 
                  }}
                />

                <TextField
                  label="Machine ID"
                  name="machineId"
                  value={formData.machineId}
                  onChange={handleChange}
                  fullWidth
                />

                <TextField
                  label="Batch Number"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleChange}
                  fullWidth
                />

                <TextField
                  label="Order Number"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleChange}
                  fullWidth
                />

                <TextField
                  label="Remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={2}
                />

                <Divider />

                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="subtitle1">
                    Total Units (Auto-calculated):
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {totalUnits}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#e3f2fd', 
                  borderRadius: 1,
                  mt: 1
                }}>
                  <Typography variant="caption" color="textSecondary">
                    Total Units = Good Units + Rejected Units + Rework Units
                  </Typography>
                </Box>
              </>
            )}

            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        
        {activeStep > 0 && (
          <Button onClick={() => setActiveStep((prev) => prev - 1)} disabled={loading}>
            Back
          </Button>
        )}

        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={() => setActiveStep((prev) => prev + 1)}
            disabled={loading}
            sx={{ background: "linear-gradient(135deg, #164e63, #00B4D8)" }}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
            sx={{ background: "linear-gradient(135deg, #164e63, #00B4D8)" }}
          >
            {loading ? "Saving..." : "Add Production"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddProduction;