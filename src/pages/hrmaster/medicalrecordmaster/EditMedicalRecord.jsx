import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  Box,
  FormHelperText
} from '@mui/material';
import {
  Edit as EditIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import BASE_URL from '../../../config/Config';

// 🔥 Modern Stepper Connector with Gradient
const ColorConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient(135deg, #164e63 0%, #00B4D8 50%, #0e7490 100%)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#eaeaf0',
    borderRadius: 1,
  },
}));

const EditMedicalRecord = ({ open, onClose, record, onUpdate }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    employee: "",
    checkupDate: "",
    checkupType: "Annual",
    doctorName: "",
    clinicName: "",
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    respiratoryRate: "",
    height: "",
    weight: "",
    bmi: "",
    visionLeft: "",
    visionRight: "",
    hearingTest: "",
    respiratoryTest: "",
    musculoskeletal: "",
    neurological: "",
    bloodGroup: "",
    hemoglobin: "",
    sugarFasting: "",
    sugarPostPrandial: "",
    cholesterol: "",
    fitnessStatus: "Fit",
    restrictions: [],
    recommendations: "",
    remarks: "",
    nextCheckupDate: "",
    reportFile: null
  });

  const [employees, setEmployees] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [employeeInputValue, setEmployeeInputValue] = useState('');
  
  const [fileName, setFileName] = useState('');
  const [existingReport, setExistingReport] = useState(null);
  const [selectedEmployeeObj, setSelectedEmployeeObj] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const steps = [
    'Basic Info',
    'Vitals',
    'Clinical Tests',
    'Blood Work',
    'Fitness'
  ];

  // Updated enum values from backend
  const checkupTypeOptions = [
    'Pre-Employment',
    'Annual',
    'Periodic',
    'Post-Accident',
    'Return to Work',
    'Special'
  ];

  const fitnessStatusOptions = [
    'Fit',
    'Fit with Restrictions',
    'Unfit',
    'Temporarily Unfit'
  ];

  const restrictionOptions = [
    'No Heavy Lifting',
    'No Standing > 4hrs',
    'No Night Shift',
    'No Machine Operation',
    'Limited Mobility',
    'Other'
  ];

  const bloodGroupOptions = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ];

  const hearingTestOptions = [
    'Normal',
    'Mild Hearing Loss',
    'Moderate Hearing Loss',
    'Severe Hearing Loss',
    'Not Tested'
  ];

  const respiratoryTestOptions = [
    'Normal',
    'Mild Impairment',
    'Moderate Impairment',
    'Severe Impairment',
    'Not Tested'
  ];

  const musculoskeletalOptions = [
    'Normal',
    'Minor Issue',
    'Moderate Issue',
    'Severe Issue',
    'Requires Further Evaluation'
  ];

  const neurologicalOptions = [
    'Normal',
    'Minor Issue',
    'Moderate Issue',
    'Severe Issue',
    'Requires Further Evaluation'
  ];

  // Initialize form with record data
  useEffect(() => {
    if (record) {
      console.log("Record data:", record); // For debugging
      
      // Handle employee data - can be object, null, or string ID
      let employeeId = "";
      let employeeObj = null;
      
      // Safe check for employee object
      if (record.employee && typeof record.employee === 'object' && record.employee !== null) {
        // Employee is an object with details
        employeeId = record.employee._id || "";
        employeeObj = record.employee;
        
        // Set employee input value for display
        const firstName = record.employee.FirstName || '';
        const lastName = record.employee.LastName || '';
        const employeeIdDisplay = record.employee.EmployeeID || '';
        const displayName = `${firstName} ${lastName}`.trim();
        setEmployeeInputValue(displayName ? `${displayName} ${employeeIdDisplay ? `(${employeeIdDisplay})` : ''}` : '');
        setSelectedEmployeeObj(record.employee);
      } else if (record.employee && typeof record.employee === 'string') {
        // Employee is just an ID string
        employeeId = record.employee;
        setEmployeeInputValue('');
        setSelectedEmployeeObj(null);
      } else {
        // Employee is null or undefined
        employeeId = "";
        setEmployeeInputValue('');
        setSelectedEmployeeObj(null);
      }

      // Format dates properly
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return "";
          return date.toISOString().split('T')[0];
        } catch {
          return "";
        }
      };

      setFormData({
        employee: employeeId,
        checkupDate: formatDateForInput(record.checkupDate),
        checkupType: record.checkupType || "Annual",
        doctorName: record.doctorName || "",
        clinicName: record.clinicName || "",
        bloodPressure: record.bloodPressure || "",
        heartRate: record.heartRate?.toString() || "",
        temperature: record.temperature?.toString() || "",
        respiratoryRate: record.respiratoryRate?.toString() || "",
        height: record.height?.toString() || "",
        weight: record.weight?.toString() || "",
        bmi: record.bmi?.toString() || "",
        visionLeft: record.visionLeft || "",
        visionRight: record.visionRight || "",
        hearingTest: record.hearingTest || "",
        respiratoryTest: record.respiratoryTest || "",
        musculoskeletal: record.musculoskeletal || "",
        neurological: record.neurological || "",
        bloodGroup: record.bloodGroup || "",
        hemoglobin: record.hemoglobin?.toString() || "",
        sugarFasting: record.sugarFasting?.toString() || "",
        sugarPostPrandial: record.sugarPostPrandial?.toString() || "",
        cholesterol: record.cholesterol?.toString() || "",
        fitnessStatus: record.fitnessStatus || "Fit",
        restrictions: record.restrictions || [],
        recommendations: record.recommendations || "",
        remarks: record.remarks || "",
        nextCheckupDate: formatDateForInput(record.nextCheckupDate),
        reportFile: null
      });

      // Set existing report info if available
      if (record.reportFile) {
        setExistingReport(record.reportFile);
      }
    }
  }, [record]);

  // Fetch employees when dropdown opens
  useEffect(() => {
    if (employeeOpen) {
      fetchEmployees();
    }
  }, [employeeOpen]);

  // Calculate BMI when height and weight change
  useEffect(() => {
    if (formData.height && formData.weight) {
      const heightInMeters = parseFloat(formData.height) / 100;
      const weight = parseFloat(formData.weight);
      if (heightInMeters > 0 && weight > 0) {
        const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        setFormData(prev => ({ ...prev, bmi: bmiValue }));
      }
    }
  }, [formData.height, formData.weight]);

  const fetchEmployees = async (search = '') => {
    setEmployeeLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: search,
          limit: 50
        }
      });

      if (res.data.success) {
        setEmployees(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load employees");
    } finally {
      setEmployeeLoading(false);
    }
  };

  // Search employees with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (employeeOpen && employeeSearch) {
        fetchEmployees(employeeSearch);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [employeeSearch, employeeOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, reportFile: file }));
      setFileName(file.name);
    }
  };

  const validateStep = (step) => {
    const errors = {};

    if (step === 0) {
      if (!formData.employee) errors.employee = "Employee is required";
      if (!formData.checkupDate) errors.checkupDate = "Checkup date is required";
      if (!formData.doctorName?.trim()) errors.doctorName = "Doctor name is required";
    } else if (step === 4) {
      if (!formData.fitnessStatus) errors.fitnessStatus = "Fitness status is required";
      if (!formData.nextCheckupDate) errors.nextCheckupDate = "Next checkup date is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
      setError("");
    } else {
      setError("Please fill in all required fields in this section");
    }
  };

  const handleBack = () => {
    setError("");
    setFieldErrors({});
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      setError("Please fill in all required fields");
      return;
    }

    if (!record?._id) {
      setError("Record ID is missing");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'restrictions') {
          // Handle restrictions array
          if (Array.isArray(formData.restrictions) && formData.restrictions.length > 0) {
            formData.restrictions.forEach((item, index) => {
              if (item) {
                formDataToSend.append(`restrictions[${index}]`, item);
              }
            });
          } else {
            // Send empty array if no restrictions
            formDataToSend.append('restrictions', JSON.stringify([]));
          }
        } else if (key === 'reportFile' && formData.reportFile) {
          // Handle file upload
          formDataToSend.append('reportFile', formData.reportFile);
        } else if (key !== 'restrictions' && key !== 'reportFile') {
          // Handle all other fields
          if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      const response = await axios.put(
        `${BASE_URL}/api/safety/medical-records/${record._id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );

      if (response.data.success) {
        onUpdate(response.data.data);
        handleClose();
      } else {
        setError(response.data.message || "Failed to update record");
      }
    } catch (err) {
      console.error(err.response?.data);
      setError(
        err.response?.data?.message || "Failed to update medical record"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      employee: "",
      checkupDate: "",
      checkupType: "Annual",
      doctorName: "",
      clinicName: "",
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      respiratoryRate: "",
      height: "",
      weight: "",
      bmi: "",
      visionLeft: "",
      visionRight: "",
      hearingTest: "",
      respiratoryTest: "",
      musculoskeletal: "",
      neurological: "",
      bloodGroup: "",
      hemoglobin: "",
      sugarFasting: "",
      sugarPostPrandial: "",
      cholesterol: "",
      fitnessStatus: "Fit",
      restrictions: [],
      recommendations: "",
      remarks: "",
      nextCheckupDate: "",
      reportFile: null
    });
    setFileName('');
    setExistingReport(null);
    setError("");
    setFieldErrors({});
    setActiveStep(0);
    setEmployeeSearch('');
    setEmployeeInputValue('');
    setSelectedEmployeeObj(null);
    onClose();
  };

  const getEmployeeLabel = (employee) => {
    if (!employee) return '';
    const firstName = employee.FirstName || employee.firstName || '';
    const lastName = employee.LastName || employee.lastName || '';
    const employeeId = employee.EmployeeID || employee.employeeId || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName ? `${fullName} ${employeeId ? `(${employeeId})` : ''}` : '';
  };

  // Find the selected employee object from employees array
  const getSelectedEmployee = () => {
    if (!formData.employee) return null;
    
    // First check if we have the employee object from record
    if (selectedEmployeeObj) return selectedEmployeeObj;
    
    // Otherwise find in employees array
    return employees.find(emp => emp._id === formData.employee) || null;
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={2}>
            {/* Basic Information */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Basic Information
              </Typography>

              <Grid container spacing={1.5}>
                {/* Employee - Full Width */}
                <Grid size={{ xs: 12 }}>
                  <Autocomplete
                    size="small"
                    id="employee-autocomplete"
                    open={employeeOpen}
                    onOpen={() => setEmployeeOpen(true)}
                    onClose={() => setEmployeeOpen(false)}
                    options={employees}
                    loading={employeeLoading}
                    value={getSelectedEmployee()}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({ ...prev, employee: newValue?._id || "" }));
                      setSelectedEmployeeObj(newValue);
                      if (fieldErrors.employee) setFieldErrors(prev => ({ ...prev, employee: '' }));
                    }}
                    inputValue={employeeInputValue}
                    onInputChange={(event, newInputValue) => {
                      setEmployeeInputValue(newInputValue);
                      setEmployeeSearch(newInputValue);
                    }}
                    getOptionLabel={(option) => getEmployeeLabel(option)}
                    isOptionEqualToValue={(option, value) => option._id === value?._id}
                    fullWidth
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Employee *"
                        required
                        error={!!fieldErrors.employee}
                        helperText={fieldErrors.employee}
                        size="small"
                        placeholder="Select employee"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {employeeLoading ? <CircularProgress size={16} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <MenuItem {...props} key={option._id} sx={{ py: 0.5 }}>
                        <Typography variant="body2">{getEmployeeLabel(option)}</Typography>
                      </MenuItem>
                    )}
                  />
                </Grid>

                {/* Checkup Date and Type */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Checkup Date *"
                    name="checkupDate"
                    value={formData.checkupDate}
                    onChange={handleChange}
                    required
                    error={!!fieldErrors.checkupDate}
                    helperText={fieldErrors.checkupDate}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}>
                    <InputLabel>Checkup Type *</InputLabel>
                    <Select
                      name="checkupType"
                      value={formData.checkupType}
                      onChange={handleChange}
                      label="Checkup Type *"
                      required
                    >
                      {checkupTypeOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Doctor and Clinic */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Doctor Name *"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleChange}
                    required
                    error={!!fieldErrors.doctorName}
                    helperText={fieldErrors.doctorName}
                    placeholder="Dr. Name"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Clinic Name"
                    name="clinicName"
                    value={formData.clinicName}
                    onChange={handleChange}
                    placeholder="Clinic/Hospital"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={2}>
            {/* Vital Signs */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Vital Signs
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Blood Pressure"
                    name="bloodPressure"
                    value={formData.bloodPressure}
                    onChange={handleChange}
                    placeholder="120/80"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Heart Rate"
                    name="heartRate"
                    value={formData.heartRate}
                    onChange={handleNumberChange}
                    placeholder="72"
                    inputProps={{ min: 0 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Temperature"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleNumberChange}
                    placeholder="98.6"
                    inputProps={{ step: 0.1 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Respiratory Rate"
                    name="respiratoryRate"
                    value={formData.respiratoryRate}
                    onChange={handleNumberChange}
                    placeholder="16"
                    inputProps={{ min: 0 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Body Measurements */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Body Measurements
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Height (cm)"
                    name="height"
                    value={formData.height}
                    onChange={handleNumberChange}
                    placeholder="175"
                    inputProps={{ min: 0, step: 0.1 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Weight (kg)"
                    name="weight"
                    value={formData.weight}
                    onChange={handleNumberChange}
                    placeholder="70"
                    inputProps={{ min: 0, step: 0.1 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="BMI"
                    name="bmi"
                    value={formData.bmi}
                    InputProps={{ readOnly: true }}
                    placeholder="Auto-calculated"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 1,
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={2}>
            {/* Vision Tests */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Vision Tests
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Vision Left"
                    name="visionLeft"
                    value={formData.visionLeft}
                    onChange={handleChange}
                    placeholder="6/6"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Vision Right"
                    name="visionRight"
                    value={formData.visionRight}
                    onChange={handleChange}
                    placeholder="6/6"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Clinical Tests */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Clinical Tests
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}>
                    <InputLabel>Hearing Test</InputLabel>
                    <Select
                      name="hearingTest"
                      value={formData.hearingTest}
                      onChange={handleChange}
                      label="Hearing Test"
                    >
                      {hearingTestOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}>
                    <InputLabel>Respiratory Test</InputLabel>
                    <Select
                      name="respiratoryTest"
                      value={formData.respiratoryTest}
                      onChange={handleChange}
                      label="Respiratory Test"
                    >
                      {respiratoryTestOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}>
                    <InputLabel>Musculoskeletal</InputLabel>
                    <Select
                      name="musculoskeletal"
                      value={formData.musculoskeletal}
                      onChange={handleChange}
                      label="Musculoskeletal"
                    >
                      {musculoskeletalOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}>
                    <InputLabel>Neurological</InputLabel>
                    <Select
                      name="neurological"
                      value={formData.neurological}
                      onChange={handleChange}
                      label="Neurological"
                    >
                      {neurologicalOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={2}>
            {/* Blood Work */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Blood Work
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}>
                    <InputLabel>Blood Group</InputLabel>
                    <Select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      label="Blood Group"
                    >
                      {bloodGroupOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Hemoglobin"
                    name="hemoglobin"
                    value={formData.hemoglobin}
                    onChange={handleNumberChange}
                    placeholder="14.5"
                    inputProps={{ step: 0.1, min: 0 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Cholesterol"
                    name="cholesterol"
                    value={formData.cholesterol}
                    onChange={handleNumberChange}
                    placeholder="180"
                    inputProps={{ min: 0 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Sugar Fasting"
                    name="sugarFasting"
                    value={formData.sugarFasting}
                    onChange={handleNumberChange}
                    placeholder="95"
                    inputProps={{ min: 0 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Sugar Post Prandial"
                    name="sugarPostPrandial"
                    value={formData.sugarPostPrandial}
                    onChange={handleNumberChange}
                    placeholder="120"
                    inputProps={{ min: 0 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );

      case 4:
        return (
          <Stack spacing={2}>
            {/* Fitness Status */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Fitness Status
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}>
                    <InputLabel>Fitness Status *</InputLabel>
                    <Select
                      name="fitnessStatus"
                      value={formData.fitnessStatus}
                      onChange={handleChange}
                      label="Fitness Status *"
                      required
                      error={!!fieldErrors.fitnessStatus}
                    >
                      {fitnessStatusOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.fitnessStatus && (
                      <FormHelperText error>{fieldErrors.fitnessStatus}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Autocomplete
                    multiple
                    size="small"
                    options={restrictionOptions}
                    value={formData.restrictions || []}
                    onChange={(e, value) =>
                      setFormData((prev) => ({
                        ...prev,
                        restrictions: value,
                      }))
                    }
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        const { key, ...chipProps } = getTagProps({ index });
                        return (
                          <Chip
                            key={key}
                            {...chipProps}
                            label={option}
                            size="small"
                            sx={{
                              backgroundColor: '#E3F2FD',
                              color: '#1976D2',
                              '& .MuiChip-deleteIcon': {
                                color: '#1976D2',
                                '&:hover': { color: '#1565C0' }
                              }
                            }}
                          />
                        );
                      })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Restrictions"
                        placeholder="Select restrictions"
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Recommendations & Remarks */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Recommendations & Remarks
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    label="Recommendations"
                    name="recommendations"
                    value={formData.recommendations}
                    onChange={handleChange}
                    placeholder="Any medical recommendations..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    label="Remarks"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    placeholder="Additional remarks..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Next Checkup & Report */}
            <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', borderRadius: 1, border: '1px solid #E0E0E0' }}>
              <Typography variant="subtitle2" sx={{ color: '#1976D2', mb: 1.5, fontWeight: 600, fontSize: '0.9rem' }}>
                Follow-up & Documents
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Next Checkup *"
                    name="nextCheckupDate"
                    value={formData.nextCheckupDate}
                    onChange={handleChange}
                    required
                    error={!!fieldErrors.nextCheckupDate}
                    helperText={fieldErrors.nextCheckupDate}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      sx={{
                        height: 40,
                        borderRadius: 1,
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                        borderColor: '#cbd5e1',
                        color: '#475569'
                      }}
                      startIcon={<UploadIcon />}
                    >
                      {fileName || (existingReport ? 'Replace Report' : 'Upload Report')}
                      <input
                        type="file"
                        hidden
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </Button>
                    {existingReport && !fileName && (
                      <Chip
                        label="Existing report"
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1.5,
          maxHeight: '95vh'
        }
      }}
    >
      <DialogTitle sx={{
        borderBottom: '1px solid #E0E0E0',
        py: 1.5,
        px: 2,
        backgroundColor: '#F8FAFC'
      }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#101010', mb: 1 }}>
          Edit Medical Record
        </Typography>

        <Stepper
          activeStep={activeStep}
          alternativeLabel
          connector={<ColorConnector />}
          sx={{ mb: 1, mt: 1 }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>
                <Typography fontWeight={500} fontSize="0.85rem">{label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContent sx={{ p: 2, overflow: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{
        px: 2,
        py: 1.5,
        borderTop: '1px solid #E0E0E0',
        backgroundColor: '#F8FAFC',
        justifyContent: 'space-between'
      }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0 || loading}
          size="small"
          startIcon={<NavigateBeforeIcon />}
          sx={{ color: '#666' }}
        >
          Back
        </Button>
        <Box>
          <Button
            onClick={handleClose}
            disabled={loading}
            size="small"
            sx={{ mr: 1, color: '#666' }}
          >
            Cancel
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              size="small"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <EditIcon />}
              sx={{
                backgroundColor: '#1976D2',
                '&:hover': { backgroundColor: '#1565C0' }
              }}
            >
              {loading ? "Updating..." : "Update Record"}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              size="small"
              endIcon={<NavigateNextIcon />}
              sx={{
                backgroundColor: '#1976D2',
                '&:hover': { backgroundColor: '#1565C0' }
              }}
            >
              Next
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EditMedicalRecord;