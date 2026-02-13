import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Quotation from './pages/Quotation/Quotation'
// import CustomerMaster from './pages/Master/CustomerMaster/CustomerMaster'
import ItemMaster from './pages/Master/ItemMaster/ItemMaster'
import MaterialMaster from './pages/Master/MaterialMaster/MaterialMaster'
import CompanyMaster from './pages/Master/CompanyMaster/CompanyMaster'
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
import LeaveApproval from './pages/hrmaster/employeeleavemaster/LEaveApproval'
import EmployeeLeaveMaster from './pages/hrmaster/employeeleavemaster/EmployeeLeaveMaster'
import AdminLeaveApproval from './pages/hrmaster/adminleavemaster/AdminLeaveApproval'


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