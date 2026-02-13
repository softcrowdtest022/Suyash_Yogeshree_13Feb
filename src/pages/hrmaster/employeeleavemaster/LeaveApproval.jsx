import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../../config/Config";

function LeaveApproval() {
  const [leaves, setLeaves] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/leaves/pending`);
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcess = async (id, status) => {
    try {
      await axios.put(`${BASE_URL}/api/leaves/${id}/process`, { status });
      fetchPending();
    } catch (err) {
      alert("Error processing leave");
    }
  };

  const filteredLeaves = leaves.filter((leave) =>
    leave.employeeId?.name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="p-6">

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-700">
          Leave Approval
        </h1>
        <p className="text-slate-500">
          Review and process employee leave requests
        </p>
      </div>

      {/* Top Action Bar */}
      <div className="bg-white shadow rounded-xl p-4 flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search by employee name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 w-80 focus:ring-2 focus:ring-teal-500 outline-none"
        />

        <button className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50">
          Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">

          {/* Table Header */}
          <thead className="bg-gradient-to-r from-cyan-700 to-teal-600 text-white">
            <tr>
              <th className="p-4">Employee</th>
              <th className="p-4">Leave Type</th>
              <th className="p-4">From Date</th>
              <th className="p-4">To Date</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {filteredLeaves.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-6 text-slate-500">
                  No pending leave requests
                </td>
              </tr>
            ) : (
              filteredLeaves.map((leave) => (
                <tr
                  key={leave._id}
                  className="border-b hover:bg-slate-50 transition"
                >
                  <td className="p-4 font-semibold text-slate-700">
                    {leave.employeeId?.name}
                  </td>

                  <td className="p-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {leave.leaveTypeId?.name}
                    </span>
                  </td>

                  <td className="p-4 text-slate-600">
                    {new Date(leave.fromDate).toLocaleDateString()}
                  </td>

                  <td className="p-4 text-slate-600">
                    {new Date(leave.toDate).toLocaleDateString()}
                  </td>

                  <td className="p-4 text-center space-x-2">

                    <button
                      onClick={() =>
                        handleProcess(leave._id, "Approved")
                      }
                      className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200 transition"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        handleProcess(leave._id, "Rejected")
                      }
                      className="px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200 transition"
                    >
                      Reject
                    </button>

                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
}

export default LeaveApproval;
