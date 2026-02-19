import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Users from './pages/users/Users'
import Quotation from './pages/quotation/Quotation'
// import CustomerMaster from './pages/master/customermaster/CustomerMaster'
import ItemMaster from './pages/master/itemmaster/ItemMaster'
import MaterialMaster from './pages/master/materialmaster/MaterialMaster'  // Fixed: lowercase 'master'
import CompanyMaster from './pages/master/companymaster/CompanyMaster'    // Fixed: lowercase 'master'
import CostingMaster from './pages/master/costingmaster/CostingMaster'
import DimentionMaster from './pages/master/dimentionmaster/DimentionMaster'
import OperationMaster from './pages/master/operationmaster/OperationMaster'
import ProcessMaster from './pages/master/processmaster/ProcessMaster'
import QuotationMaster from './pages/master/quotationmaster/QuotationMaster'
import TaxMaster from './pages/master/taxmaster/TaxMaster'
import TermsAndConditionMaster from './pages/master/termsandconditionmaster/TermsAndConditionMaster'
import Login from './auth/Login'
import Registration from './auth/Registration'
import Roles from './pages/roles/Roles'
import DepartmentMaster from './pages/hrmaster/departmentmaster/DepartmentMaster'
import DesignationMaster from './pages/hrmaster/designationmaster/DesignationMaster'
import EmployeeMaster from './pages/hrmaster/employeemaster/EmployeeMaster'
import LeaveTypeMaster from './pages/hrmaster/leavetypemaster/LeaveTypeMaster'
import RawMaterialMaster from './pages/master/rawmaterialmaster/RawMaterialMaster'
import VendorMaster from './pages/master/vendormaster/VendorMaster'

import ApplyLeave from './pages/hrmaster/employeeleavemaster/EmployeeLeaveMaster'
import MyLeaves from './pages/hrmaster/employeeleavemaster/MyLeaves'
import LeaveApproval from './pages/hrmaster/employeeleavemaster/LeaveApproval'
import EmployeeLeaveMaster from './pages/hrmaster/employeeleavemaster/EmployeeLeaveMaster'
import AdminLeaveApproval from './pages/hrmaster/adminleavemaster/AdminLeaveApproval'
import ShiftMaster from './pages/hrmaster/shiftmaster/ShiftMaster'
import MedicalRecordMaster from './pages/hrmaster/medicalrecordmaster/MedicalRecordMaster'
import AccidentMaster from './pages/hrmaster/accidentmaster/AccidentMaster'
import RequisitionMaster from './pages/hrmaster/requisitionmaster/RequisitionMaster'
import JobOpeningMaster from './pages/hrmaster/jobopeningmaster/JobOpeningMaster'
import CandidateMaster from './pages/hrmaster/candidatemaster/CandidateMaster'
import InterviewMaster from './pages/hrmaster/interviewmaster/InterviewMaster'
import SalaryMaster from './pages/hrmaster/salarymaster/SalaryMaster'
import PieceRateMaster from './pages/hrmaster/pieceratemaster/PieceRateMaster'
import RegularizationMaster from './pages/hrmaster/regularizationmaster/RegularizationMaster'


const PrivateRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn')

  if (!isLoggedIn || isLoggedIn !== 'true') {
    return <Navigate to="/login" replace />
  }

  return children
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />

        {/* Protected Routes with Layout - Flat Structure */}
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="quotation" element={<Quotation />} />
          {/* <Route path="master/customermaster" element={<CustomerMaster />} /> */}
          <Route path="master/vendormaster" element={<VendorMaster />} />
          <Route path="master/itemmaster" element={<ItemMaster />} />
          <Route path="master/companymaster" element={<CompanyMaster />} />
          <Route path="master/costingmaster" element={<CostingMaster />} />
          <Route path="master/dimentionmaster" element={<DimentionMaster />} />
          {/* <Route path="master/operationmaster" element={<OperationMaster />} /> */}
          <Route path="master/processmaster" element={<ProcessMaster />} />
          <Route path="master/quotationmaster" element={<QuotationMaster />} />
          <Route path="master/taxmaster" element={<TaxMaster />} />
          <Route path="master/termsandconditionmaster" element={<TermsAndConditionMaster />} />
          <Route path="master/materialmaster" element={<MaterialMaster />} />
          <Route path="master/rawmaterialmaster" element={<RawMaterialMaster />} />
          <Route path="hrmaster/departmentmaster" element={<DepartmentMaster />} />
          <Route path="hrmaster/designationmaster" element={<DesignationMaster />} />
          <Route path="hrmaster/employeemaster" element={<EmployeeMaster />} />
          <Route path="hrmaster/leavetypemaster" element={<LeaveTypeMaster />} />
           <Route path="hrmaster/shiftmaster" element={<ShiftMaster />} />
            <Route path="hrmaster/medicalmaster" element={<MedicalRecordMaster />} />
             <Route path="hrmaster/accidentmaster" element={<AccidentMaster />} />
              <Route path="hrmaster/requisitionmaster" element={<RequisitionMaster />} />
              <Route path="hrmaster/jobopeningmaster" element={<JobOpeningMaster />} />
              <Route path="hrmaster/candidatemaster" element={<CandidateMaster />} />
               <Route path="hrmaster/salarymaster" element={<SalaryMaster />} />
                 <Route path="hrmaster/pieceratemaster" element={<PieceRateMaster />} />
                  <Route path="hrmaster/regularizationmaster" element={<RegularizationMaster />} />
               <Route path="hrmaster/interviewmaster" element={<InterviewMaster />} />
          <Route path="roles" element={<Roles />} />

          <Route path='hrmaster/employeeleavemaster' element={<EmployeeLeaveMaster/>} />
          <Route path='hrmaster/adminleavemaster' element={<AdminLeaveApproval/>} />

        </Route>

        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App