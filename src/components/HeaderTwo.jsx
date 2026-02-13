import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const HeaderTwo = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [clickedItem, setClickedItem] = useState(null);
  const masterRef = useRef(null);
  const dropdownRef = useRef(null);
  const submenuRef = useRef(null);

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

  // Quotation Master submenu items
  const quotationMasterItems = [
    { name: 'Vendor Master', path: '/master/vendormaster', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 2.1a9 9 0 10-18 0' },
    { name: 'Item Master', path: '/master/itemmaster', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { name: 'Company Master', path: '/master/companymaster', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { name: 'Process Master', path: '/master/processmaster', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { name: 'Costing Master', path: '/master/costingmaster', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { name: 'Dimension Master', path: '/master/dimentionmaster', icon: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5' },
    // { name: 'Operation Master', path: '/master/operationmaster', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { name: 'Quotation Master', path: '/master/quotationmaster', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { name: 'Tax Master', path: '/master/taxmaster', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Terms & Conditions', path: '/master/termsandconditionmaster', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Material Master', path: '/master/materialmaster', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { name: 'Raw Material Master', path: '/master/rawmaterialmaster', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  ];

  // HR Master submenu items
  const hrMasterItems = [
    { name: 'Department Master', path: '/hrmaster/departmentmaster', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { name: 'Designation Master', path: '/hrmaster/designationmaster', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Employee Master', path: '/hrmaster/employeemaster', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 2.1a9 9 0 10-18 0' },
    { name: 'Leave Type Master', path: '/hrmaster/leavetypemaster', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 01118 0z' },
    { name: 'Employee Leave Master', path: '/hrmaster/employeeleavemaster', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'},
    { name: 'Admin Leave Master', path: '/hrmaster/adminleavemaster', icon: 'M9 12h6m-6 4h6m5-2l-3 3-1.5-1.5M7 3h5l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z' }
  ];

  
  // Leave Management items
  const role = localStorage.getItem("role");
  const leaveManagementItems = [
    { name: 'Apply Leave', path: '/leave/apply', icon: 'M12 4v16m8-8H4' },
    { name: 'My Leaves', path: '/leave/my', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Leave Approval', path: '/leave/approval', icon: 'M9 12l2 2 4-4' },
      ...(role === "HR" || role === "Admin"
    ? [{ name: 'Leave Approval', path: '/leave/approval', icon: '...' }]
    : [])
  ];

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking inside dropdown or submenu
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
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        
        /* Show scrollbar on hover */
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

                {/* Right Column - Submenu Items (Only shows when a category is hovered) */}
                {activeSubmenu && (
                  <div
                    ref={submenuRef}
                    className="w-64 max-h-96 overflow-y-auto scrollbar-hide"
                  >
                    {/* Quotation Master Submenu */}
                    <div className={`${activeSubmenu === 'quotation' ? 'block' : 'hidden'}`}>
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quotation Masters</h3>
                      </div>
                      {quotationMasterItems.map((item) => (
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
                    {/* HR Master Submenu */}
                    <div className={`${activeSubmenu === 'hr' ? 'block' : 'hidden'}`}>

                      {/* HR Masters Section */}
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          HR Masters
                        </h3>
                      </div>

                      {hrMasterItems.map((item) => (
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

                      {/* 🔥 Leave Management Section */}
                      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 mt-2">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Leave Management
                        </h3>
                      </div>

                      {leaveManagementItems.map((item) => (
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