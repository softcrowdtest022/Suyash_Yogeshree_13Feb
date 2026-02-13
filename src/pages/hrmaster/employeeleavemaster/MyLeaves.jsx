import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../../config/Config";

function MyLeaves() {
  const employeeId = localStorage.getItem("employeeId");

  useEffect(() => {
    if (employeeId) {
      fetchLeaves();
    }
  }, [employeeId]);

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

const fetchLeaves = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/api/leaves/employee/${employeeId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    setLeaves(res.data);
  } catch (err) {
    console.error(err);
  }
};




  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>My Leaves</h2>
        </div>

        {loading ? (
          <p style={styles.loading}>Loading...</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Leave Type</th>
                  <th style={styles.th}>From</th>
                  <th style={styles.th}>To</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={styles.noData}>
                      No leave records found
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td style={styles.td}>
                        {leave.leaveTypeId?.name}
                      </td>
                      <td style={styles.td}>
                        {new Date(leave.fromDate).toLocaleDateString()}
                      </td>
                      <td style={styles.td}>
                        {new Date(leave.toDate).toLocaleDateString()}
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor:
                              leave.status === "Approved"
                                ? "#d4edda"
                                : leave.status === "Rejected"
                                  ? "#f8d7da"
                                  : "#fff3cd",
                            color:
                              leave.status === "Approved"
                                ? "#155724"
                                : leave.status === "Rejected"
                                  ? "#721c24"
                                  : "#856404",
                          }}
                        >
                          {leave.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {leave.status === "Pending" && (
                          <button
                            style={styles.cancelBtn}
                            onClick={() => handleCancel(leave._id)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyLeaves;

/* ===================== STYLES ===================== */

const styles = {
  page: {
    padding: "30px",
    backgroundColor: "#f4f6f9",
    minHeight: "100vh",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  header: {
    marginBottom: "20px",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  title: {
    margin: 0,
    color: "#333",
  },
  loading: {
    textAlign: "center",
    padding: "20px",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    backgroundColor: "#f8f9fa",
    padding: "12px",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "14px",
    borderBottom: "1px solid #ddd",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #eee",
    fontSize: "14px",
  },
  noData: {
    textAlign: "center",
    padding: "20px",
    color: "#999",
  },
  statusBadge: {
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  cancelBtn: {
    padding: "6px 12px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    backgroundColor: "#dc3545",
    color: "white",
  },
};
