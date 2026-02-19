import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const HeaderTwo = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [clickedItem, setClickedItem] = useState(null);
  const masterRef = useRef(null);
  const dropdownRef = useRef(null);
  const submenuRef = useRef(null);

  const ITEMS_PER_COLUMN = 8;

  // Master dropdown items - Main categories
  const masterCategories = [
    {
      name: 'Quotation Master',
      type: 'quotation',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    },
    {
      name: 'HR Master',
      type: 'hr',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
    },
  ];

  // Quotation Master submenu items with unique icons
  const quotationMasterItems = [
    { name: 'Vendor Master', path: '/master/vendormaster', icon: 'M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M17 21v-4H7v4 M9 7h6 M9 11h6' }, // Vendor/Supplier icon
    { name: 'Item Master', path: '/master/itemmaster', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' }, // Package/Item icon
    { name: 'Company Master', path: '/master/companymaster', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' }, // Building/Company icon
    { name: 'Process Master', path: '/master/processmaster', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' }, // Process/Refresh icon
    { name: 'Costing Master', path: '/master/costingmaster', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }, // Currency/Cost icon
    { name: 'Dimension Master', path: '/master/dimentionmaster', icon: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5' }, // Dimensions/Scale icon
    { name: 'Quotation Master', path: '/master/quotationmaster', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }, // Document/Quote icon
    { name: 'Tax Master', path: '/master/taxmaster', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM7 10h3M7 14h2m5-4h3' }, // Tax/Percentage icon
    { name: 'Terms & Conditions', path: '/master/termsandconditionmaster', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z M12 2v4M12 22v-4' }, // Document with lines icon
    { name: 'Material Master', path: '/master/materialmaster', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10' }, // Cube/Material icon
    { name: 'Raw Material Master', path: '/master/rawmaterialmaster', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' }, // Raw material/Sparkles icon
  ];

  // HR Master submenu items with unique icons
  const hrMasterItems = [
    { name: 'Department Master', path: '/hrmaster/departmentmaster', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' }, // Department/Building icon
    { name: 'Designation Master', path: '/hrmaster/designationmaster', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }, // Badge/Checkmark icon
    { name: 'Employee Master', path: '/hrmaster/employeemaster', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }, // Employee/Person icon
    { name: 'Leave Type Master', path: '/hrmaster/leavetypemaster', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }, // Calendar/Leave icon
    { name: 'Shift Master', path: '/hrmaster/shiftmaster', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' }, // Clock/Shift icon
    { name: 'Medical Record Master', path: '/hrmaster/medicalmaster', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' }, // Heart/Medical icon
    { name: 'Accident Master', path: '/hrmaster/accidentmaster', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' }, // Warning/Accident icon
    { name: 'Requisition Master', path: '/hrmaster/requisitionmaster', icon: 'M15 5v2m-6 0V5m6 0a2 2 0 012 2m-8-2a2 2 0 00-2 2m0 0v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2m-6 7h6m-6 4h6m-6-8h6' }, // Clipboard/Requisition icon
    { name: 'Job Opening Master', path: '/hrmaster/jobopeningmaster', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }, // Briefcase/Job icon
    { name: 'Candidate Master', path: '/hrmaster/candidatemaster', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' }, // User plus/Candidate icon
    { name: 'Interview Master', path: '/hrmaster/interviewmaster', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' }, // Chat/Interview icon
    { name: 'Salary Master', path: '/hrmaster/salarymaster', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }, // Currency/Salary icon
    { name: 'Piece Rate Master', path: '/hrmaster/pieceratemaster', icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' }, // Calculator/Piece rate icon
    { name: 'Regularization Master', path: '/hrmaster/regularizationmaster', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' }, // Refresh/Regularization icon
    { name: 'Employee Leave Master', path: '/hrmaster/employeeleavemaster', icon: 'M16 4v1h4v16H4V5h4V4a2 2 0 014 0M8 8h8M8 12h6m-6 4h4' }, // Employee Calendar icon
    { name: 'Admin Leave Master', path: '/hrmaster/adminleavemaster', icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z M8 14h8' }, // Admin/Shield with calendar icon
  ];

  // Leave Management items with unique icons
  const role = localStorage.getItem("role");
  const leaveManagementItems = [
    { name: 'Apply Leave', path: '/leave/apply', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' }, // Plus/Apply icon
    { name: 'My Leaves', path: '/leave/my', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z M12 11v5m0 0v5m0-5h5m-5 0H7' }, // Calendar view icon
    ...(role === "HR" || role === "Admin"
      ? [{ name: 'Leave Approval', path: '/leave/approval', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }] // Checkmark/Approval icon
      : [])
  ];

  // Combine HR items with Leave items
  const allHRItems = [...hrMasterItems, ...leaveManagementItems];

  // Function to split items into columns
  const getColumns = (items) => {
    const columns = [];
    for (let i = 0; i < items.length; i += ITEMS_PER_COLUMN) {
      columns.push(items.slice(i, i + ITEMS_PER_COLUMN));
    }
    return columns;
  };

  const quotationColumns = getColumns(quotationMasterItems);
  const hrColumns = getColumns(allHRItems);

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (dropdownRef.current && dropdownRef.current.contains(event.target)) ||
        (submenuRef.current && submenuRef.current.contains(event.target))
      ) {
        return;
      }

      if (masterRef.current && !masterRef.current.contains(event.target)) {
        setActiveDropdown(null);
        setActiveSubmenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
    if (dropdown === null) {
      setActiveSubmenu(null);
    }
  };

  const handleCategoryHover = (categoryType) => {
    setActiveSubmenu(categoryType);
  };

  const handleDropdownItemClick = (path, categoryType) => {
    setClickedItem(path);

    setTimeout(() => {
      setActiveDropdown(null);
      setActiveSubmenu(null);
      setClickedItem(null);
    }, 300);
  };

  const isMasterActive = (path) => {
    return path.startsWith('/master/') || path.startsWith('/hrmaster/');
  };

  // Get current path
  const currentPath = window.location.pathname;

  return (
    <>
      {/* Add scrollbar styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          width: 0;
          background: transparent;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide:hover::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-hide:hover::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        
        .scrollbar-hide:hover::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        
        .scrollbar-hide:hover::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      <nav className="bg-gradient-to-br from-cyan-900 via-[#00B4D8] to-cyan-700 shadow-md relative z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex">
            {/* Dashboard */}
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center px-6 py-4 text-sm font-medium transition-all whitespace-nowrap ${isActive
                  ? 'text-white bg-white/20'
                  : 'text-white/90 hover:text-white hover:bg-white/15'
                }`
              }
              end
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </NavLink>

            {/* Users */}
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `flex items-center px-6 py-4 text-sm font-medium transition-all whitespace-nowrap ${isActive
                  ? 'text-white bg-white/20'
                  : 'text-white/90 hover:text-white hover:bg-white/15'
                }`
              }
              end
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 2.1a9 9 0 10-18 0" />
              </svg>
              Users
            </NavLink>

            {/* Quotation */}
            <NavLink
              to="/quotation"
              className={({ isActive }) =>
                `flex items-center px-6 py-4 text-sm font-medium transition-all whitespace-nowrap ${isActive
                  ? 'text-white bg-white/20'
                  : 'text-white/90 hover:text-white hover:bg-white/15'
                }`
              }
              end
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Quotation
            </NavLink>

            {/* Master Dropdown */}
            <div className="relative" ref={masterRef}>
              <button
                onClick={() => toggleDropdown('master')}
                onMouseEnter={() => setActiveDropdown('master')}
                className={`flex items-center px-6 py-4 text-sm font-medium transition-all whitespace-nowrap ${isMasterActive(currentPath)
                  ? 'text-white bg-white/20'
                  : 'text-white/90 hover:text-white hover:bg-white/15'
                  }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Master
                <svg className={`w-4 h-4 ml-2 transition-transform ${activeDropdown === 'master' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Master Dropdown Menu - Two Columns */}
              <div
                ref={dropdownRef}
                className={`absolute left-0 top-full mt-0 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 z-[100] transition-all duration-200 flex ${activeDropdown === 'master'
                  ? 'opacity-100 visible translate-y-0'
                  : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                  }`}
                onMouseEnter={() => setActiveDropdown('master')}
                onMouseLeave={() => {
                  if (clickedItem === null) {
                    setActiveDropdown(null);
                    setActiveSubmenu(null);
                  }
                }}
              >
                {/* Left Column - Categories Only */}
                <div className="w-48 border-r border-slate-100">
                  {masterCategories.map((category) => (
                    <div
                      key={category.type}
                      className={`relative px-4 py-3 cursor-pointer transition-all group ${activeSubmenu === category.type
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      onMouseEnter={() => handleCategoryHover(category.type)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryHover(category.type === activeSubmenu ? null : category.type);
                      }}
                    >
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-3 text-slate-500 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={category.icon} />
                        </svg>
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <svg className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-transform ${activeSubmenu === category.type ? 'rotate-90 text-blue-500' : 'text-slate-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
                </div>

                {/* Right Column - Submenu Items */}
                {activeSubmenu && (
                  <div
                    ref={submenuRef}
                    className="flex"
                  >
                    {/* Quotation Master Submenu - Multiple Columns */}
                    {activeSubmenu === 'quotation' && (
                      <>
                        {quotationColumns.map((column, index) => (
                          <div key={`quotation-col-${index}`} className={`w-64 ${index < quotationColumns.length - 1 ? 'border-r border-slate-100' : ''}`}>
                            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Quotation Masters
                              </h3>
                            </div>
                            <div className="max-h-96 overflow-y-auto scrollbar-hide">
                              {column.map((item) => (
                                <NavLink
                                  key={item.path}
                                  to={item.path}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDropdownItemClick(item.path, 'quotation');
                                  }}
                                  className={`flex items-center px-4 py-3 text-sm transition-all hover:bg-slate-50 ${currentPath === item.path ? 'text-blue-600 bg-blue-50' : 'text-slate-700'
                                    }`}
                                >
                                  <svg className="w-4 h-4 mr-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                  </svg>
                                  {item.name}
                                </NavLink>
                              ))}
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {/* HR Master Submenu - Multiple Columns */}
                    {activeSubmenu === 'hr' && (
                      <>
                        {hrColumns.map((column, index) => (
                          <div key={`hr-col-${index}`} className={`w-64 ${index < hrColumns.length - 1 ? 'border-r border-slate-100' : ''}`}>
                            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                HR Masters
                              </h3>
                            </div>
                            <div className="max-h-96 overflow-y-auto scrollbar-hide">
                              {column.map((item) => (
                                <NavLink
                                  key={item.path}
                                  to={item.path}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDropdownItemClick(item.path, 'hr');
                                  }}
                                  className={`flex items-center px-4 py-3 text-sm transition-all hover:bg-slate-50 ${currentPath === item.path ? 'text-blue-600 bg-blue-50' : 'text-slate-700'
                                    }`}
                                >
                                  <svg className="w-4 h-4 mr-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                  </svg>
                                  {item.name}
                                </NavLink>
                              ))}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Roles */}
            <NavLink
              to="/roles"
              className={({ isActive }) =>
                `flex items-center px-6 py-4 text-sm font-medium transition-all whitespace-nowrap ${isActive
                  ? 'text-white bg-white/20'
                  : 'text-white/90 hover:text-white hover:bg-white/15'
                }`
              }
              end
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
              Roles
            </NavLink>
          </div>
        </div>
      </nav>
    </>
  );
};

export default HeaderTwo;