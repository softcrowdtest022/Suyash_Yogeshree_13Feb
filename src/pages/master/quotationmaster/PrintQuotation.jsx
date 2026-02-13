import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Box
} from "@mui/material";
import { Print, Close } from "@mui/icons-material";
import axios from "axios";
import html2pdf from "html2pdf.js";

import BASE_URL from "../../../config/Config";

const PrintQuotation = ({ open, onClose, quotation }) => {
  const printRef = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (open && quotation?._id) fetchQuotation();
  }, [open, quotation]);

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${BASE_URL}/api/quotations/${quotation._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(res.data.data);
    } catch (err) {
      setError("Failed to load quotation");
      console.error("Error fetching quotation:", err);
    } finally {
      setLoading(false);
    }
  };

const handlePrint = async () => {
  if (!printRef.current) return;
  
  try {
    setPdfLoading(true);
    
    // Get the print container HTML
    const printContainer = printRef.current.querySelector('.print-container');
    if (!printContainer) {
      throw new Error('Print container not found');
    }
    
    // Create complete HTML document with proper A4 styling
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quotation - ${data?.QuotationNo || 'Quotation'}</title>
        <style>
          /* Reset and base styles */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body {
            font-family: "Courier New", monospace !important;
            font-size: 12px !important;
            line-height: 1.3 !important;
            color: #000 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: white !important;
          }
          
          .print-container {
            width: 210mm !important;
            min-height: 297mm !important;
            padding: 15mm 15mm !important; /* Reduced padding slightly */
            margin: 0 auto !important;
            background: white !important;
            box-sizing: border-box !important;
          }
          
          /* Table Styles */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-bottom: 6px !important; /* Reduced margin */
            table-layout: fixed !important;
          }
          
          th, td {
            padding: 3px 4px !important;
            border: 1px solid #000 !important;
            vertical-align: top !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            word-wrap: break-word !important;
          }
          
          /* Header Table */
          .header-table {
            border: none !important;
            margin-bottom: 10px !important; /* Reduced margin */
          }
          
          .header-table td {
            border: none !important;
            padding: 2px 4px !important;
            vertical-align: middle !important;
          }
          
          /* Text Alignment */
          .text-right { text-align: right !important; }
          .text-center { text-align: center !important; }
          .text-left { text-align: left !important; }
          .text-bold { font-weight: bold !important; }
          
          /* Section Titles - FIXED MARGINS */
          .section-title {
            font-weight: bold !important;
            margin: 4px 0 2px 0 !important; /* Reduced top margin to 4px, bottom to 2px */
            border-bottom: 1px solid #000 !important;
            padding-bottom: 2px !important;
            font-size: 13px !important;
          }
          
          /* Divider */
          .divider {
            border-top: 1px solid #666 !important;
            margin: 2px 0 !important; /* Reduced margin */
          }
          
          /* Price Table */
          .price-table th, .price-table td {
            padding: 2px 3px !important;
            font-size: 11px !important;
          }
          
          /* Notes Section */
          .notes-section {
            margin: 8px 0 !important; /* Reduced margin */
            font-size: 11px !important;
            padding: 4px !important; /* Reduced padding */
            border: 1px dashed #ccc !important;
            background-color: #f9f9f9 !important;
          }
          
          /* Signature Table */
          .signature-table {
            width: 100% !important;
            margin-top: 15px !important; /* Reduced margin */
            border: none !important;
          }
          
          .signature-table td {
            border: none !important;
            padding-top: 30px !important; /* Reduced padding */
            border-top: 1px solid #000 !important;
            text-align: center !important;
            font-size: 11px !important;
          }
          
          /* Declaration */
          .declaration {
            font-size: 10px !important;
            text-align: justify !important;
            margin: 6px 0 !important; /* Reduced margin */
            line-height: 1.2 !important;
          }
          
          /* Logo Containers */
          .logo-container {
            text-align: left !important;
            padding-right: 10px !important;
          }
          
          .title-container {
            text-align: center !important;
            padding: 0 5px !important;
          }
          
          /* Customer Details Grid - REDUCED GAPS */
          .customer-details-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 2px !important; /* Reduced gap from 4px to 2px */
            margin-bottom: 6px !important; /* Reduced margin */
          }
          
          .detail-item {
            display: flex !important;
            margin-bottom: 2px !important; /* Reduced margin */
            min-height: 16px !important; /* Reduced min-height */
          }
          
          .detail-label {
            font-weight: bold !important;
            min-width: 40% !important;
            padding-right: 5px !important;
          }
          
          .detail-value {
            flex: 1 !important;
          }
          
          .full-width {
            grid-column: 1 / -1 !important;
          }
          
          /* SPECIFIC FIX: Reduce space between sections */
          .customer-details-grid + .section-title {
            margin-top: 8px !important; /* Add specific margin after details grid */
          }
          
          .section-title + .customer-details-grid {
            margin-top: 0 !important;
          }
          
          /* Page settings for print */
          @page {
            size: A4 portrait;
            margin: 15mm; /* Reduced margin */
          }
          
          @media print {
            body {
              width: 210mm !important;
              height: 297mm !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            .print-container {
              padding: 15mm !important; /* Match reduced padding */
              margin: 0 auto !important;
              width: 210mm !important;
              min-height: 297mm !important;
              box-shadow: none !important;
            }
          }
          
          /* Prevent page breaks inside important elements */
          .print-container {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          /* Ensure images load */
          img {
            max-width: 100%;
            height: auto;
          }
          
          /* ADDED: Remove extra space specifically between quotation and vendor sections */
          #quotation-details-section {
            margin-bottom: 4px !important;
          }
          
          #vendor-details-section {
            margin-top: 2px !important;
          }
        </style>
      </head>
      <body>
        ${printContainer.innerHTML}
        
        <script>
          // Add IDs to sections for better targeting
          document.addEventListener('DOMContentLoaded', function() {
            const sections = document.querySelectorAll('.section-title');
            sections.forEach((section, index) => {
              if (section.textContent.includes('Quotation Details')) {
                section.id = 'quotation-details-section';
              }
              if (section.textContent.includes('Vendor Details')) {
                section.id = 'vendor-details-section';
              }
            });
          });
        </script>
      </body>
      </html>
    `;
    
    // Open in new tab
    const newWindow = window.open('', '_blank');
    if (!newWindow) {
      throw new Error('Popup blocked! Please allow popups for this site.');
    }
    
    // Write content to new window
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    
    // Wait for content to load
    newWindow.onload = async () => {
      try {
        // Options for html2pdf
        const opt = {
          margin: 8, // Reduced margin (was 10)
          filename: `Quotation_${data?.QuotationNo || 'Quotation'}.pdf`,
          image: { 
            type: 'jpeg', 
            quality: 1.0,
            useCORS: true
          },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            letterRendering: true,
            backgroundColor: '#FFFFFF',
            logging: false,
            windowWidth: 794,
            windowHeight: 1123,
            width: 794,
            height: 1123,
            x: 0,
            y: 0,
            scrollX: 0,
            scrollY: 0
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true
          }
        };
        
        // Generate PDF
        const pdfBlob = await html2pdf()
          .set(opt)
          .from(newWindow.document.body)
          .toPdf()
          .output('blob');
        
        // Create blob URL
        const blobUrl = URL.createObjectURL(pdfBlob);
        
        // Replace window content with PDF
        newWindow.location.href = blobUrl;
        
        // Clean up blob URL after window closes
        newWindow.onbeforeunload = () => {
          URL.revokeObjectURL(blobUrl);
        };
        
      } catch (error) {
        console.error('Error in PDF generation:', error);
        newWindow.document.write(`
          <h3>Error generating PDF</h3>
          <p>${error.message}</p>
          <button onclick="window.print()">Try Browser Print</button>
        `);
      }
    };
    
  } catch (error) {
    console.error('Error opening print window:', error);
    
    // Fallback: Simple print dialog
    const fallbackWindow = window.open('', '_blank');
    if (fallbackWindow) {
      fallbackWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Quotation - ${data?.QuotationNo || 'Quotation'}</title>
          <style>
            /* Add the same spacing fixes to fallback */
            .section-title {
              margin: 4px 0 2px !important;
            }
            .customer-details-grid {
              gap: 2px !important;
              margin-bottom: 6px !important;
            }
            .detail-item {
              margin-bottom: 2px !important;
              min-height: 16px !important;
            }
            body {
              font-family: "Courier New", monospace;
              font-size: 12px;
              line-height: 1.3;
              color: #000;
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              padding: 15mm;
              box-sizing: border-box;
            }
            
            @media print {
              @page {
                size: A4;
                margin: 15mm;
              }
              body {
                margin: 0;
                padding: 0;
                width: 210mm;
                min-height: 297mm;
              }
            }
          </style>
        </head>
        <body>
          ${printRef.current.querySelector('.print-container').innerHTML}
          <script>
            // Auto-print and close
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            };
          </script>
        </body>
        </html>
      `);
      fallbackWindow.document.close();
    } else {
      // Last resort: Direct browser print
      window.print();
    }
    
  } finally {
    setPdfLoading(false);
  }
};

  const formatDate = (d) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "0.00";
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Calculate GST components based on GST type
  const calculateGST = (amount, rate = 18, gstType = "IGST") => {
    if (rate === 0) return { taxable: amount, igst: 0, cgst: 0, sgst: 0, gstAmount: 0 };
    
    const taxable = (amount * 100) / (100 + rate);
    const gstAmount = amount - taxable;
    
    if (gstType === "IGST") {
      return { taxable, igst: gstAmount, cgst: 0, sgst: 0, gstAmount };
    } else {
      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;
      return { taxable, igst: 0, cgst, sgst, gstAmount };
    }
  };

  if (!data && !loading && error) {
    return (
      <Dialog open={open} maxWidth="md" fullWidth>
        <DialogContent>
          <Alert severity="error">{error}</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const companyInfo = data?.CompanyID || {};
  const vendorInfo = data?.VendorID || {};
  const items = data?.Items || [];
  const termsConditions = data?.TermsConditions || [];
  const calculations = data?.Calculations || {};
  
  const subTotal = data?.SubTotal || calculations?.subTotal || 0;
  const gstAmount = data?.GSTAmount || calculations?.gstAmount || 0;
  const grandTotal = data?.GrandTotal || calculations?.grandTotal || 0;
  const gstPercentage = data?.GSTPercentage || calculations?.gstPercentage || 0;
  const gstType = data?.GSTType || "IGST";

  return (
    <Dialog 
      open={open} 
      maxWidth="lg" 
      fullWidth 
      onClose={onClose}
      PaperProps={{
        sx: {
          maxWidth: '210mm',
          width: '100%',
          margin: '0 auto',
          height: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Print Quotation - {data?.QuotationNo || "Loading..."}</span>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent 
        style={{ 
          background: "#f5f5f5", 
          padding: 0, 
          overflow: "auto",
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" width="100%">
            <CircularProgress />
          </Box>
        ) : (
          <div 
            ref={printRef}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            {/* CSS Styles */}
            <style>{`
              /* Base styles for preview */
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: "Courier New", monospace;
                font-size: 12px;
                line-height: 1.3;
                color: #000;
              }
              
              /* For Screen Preview - Exactly matches A4 */
              .preview-mode {
                width: 100%;
                display: flex;
                justify-content: center;
              }
              
              .print-container {
                background-color: white;
                width: 210mm;
                min-height: 297mm;
                padding: 20mm;
                box-sizing: border-box;
                margin: 0 auto;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
              }
              
              /* Table Styles */
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 8px;
                table-layout: fixed;
              }
              
              th, td {
                padding: 3px 4px;
                border: 1px solid #000;
                vertical-align: top;
                overflow: hidden;
                text-overflow: ellipsis;
                word-wrap: break-word;
              }
              
              /* Header Table */
              .header-table {
                border: none;
                margin-bottom: 15px;
              }
              
              .header-table td {
                border: none;
                padding: 2px 4px;
                vertical-align: middle;
              }
              
              /* Text Alignment */
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .text-left { text-align: left; }
              .text-bold { font-weight: bold; }
              
              /* Section Titles */
              .section-title {
                font-weight: bold;
                margin: 8px 0 4px 0;
                border-bottom: 1px solid #000;
                padding-bottom: 2px;
                font-size: 13px;
              }
              
              /* Divider */
              .divider {
                border-top: 1px solid #666;
                margin: 4px 0;
              }
              
              /* Price Table */
              .price-table th, .price-table td {
                padding: 2px 3px;
                font-size: 11px;
              }
              
              /* Notes Section */
              .notes-section {
                margin: 10px 0;
                font-size: 11px;
                padding: 5px;
                border: 1px dashed #ccc;
                background-color: #f9f9f9;
              }
              
              /* Signature Table */
              .signature-table {
                width: 100%;
                margin-top: 20px;
                border: none;
              }
              
              .signature-table td {
                border: none;
                padding-top: 40px;
                border-top: 1px solid #000;
                text-align: center;
                font-size: 11px;
              }
              
              /* Declaration */
              .declaration {
                font-size: 10px;
                text-align: justify;
                margin: 8px 0;
                line-height: 1.2;
              }
              
              /* Logo Containers */
              .logo-container {
                text-align: left;
                padding-right: 10px;
              }
              
              .title-container {
                text-align: center;
                padding: 0 5px;
              }
              
              /* Customer Details Grid */
              .customer-details-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 4px;
                margin-bottom: 10px;
              }
              
              .detail-item {
                display: flex;
                margin-bottom: 3px;
                min-height: 18px;
              }
              
              .detail-label {
                font-weight: bold;
                min-width: 40%;
                padding-right: 5px;
              }
              
              .detail-value {
                flex: 1;
              }
              
              .full-width {
                grid-column: 1 / -1;
              }
              
              /* Print specific styles */
              @media print {
                body {
                  margin: 0 !important;
                  padding: 0 !important;
                  width: 210mm !important;
                  min-height: 297mm !important;
                }
                
                .print-container {
                  padding: 20mm !important;
                  margin: 0 auto !important;
                  width: 210mm !important;
                  min-height: 297mm !important;
                  box-shadow: none !important;
                }
                
                .no-print {
                  display: none !important;
                }
              }
              
              @page {
                size: A4 portrait;
                margin: 20mm;
              }
            `}</style>

            <div className="print-container">
              {/* Header Section */}
              <table className="header-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <tr>
                  {/* Logo */}
                  <td width="40%" className="logo-container" style={{ verticalAlign: "top" }}>
                    <img
                      src="/se.png"
                      alt="Suyash Enterprises"
                      style={{
                        height: "55px",
                        marginBottom: "4px",
                        display: "block"
                      }}
                    />
                  </td>

                  {/* Title */}
                  <td
                    width="40%"
                    className="title-container"
                    style={{
                      textAlign: "center",
                      verticalAlign: "top",
                      paddingTop: "18px"  
                    }}
                  >
                    <b style={{ fontSize: "16px" }}>
                      <u>QUOTATION</u>
                    </b>
                  </td>

                  {/* Address / Company Info – RIGHT SIDE */}
                  <td width="30%" style={{ fontSize: "10px", textAlign: "right", verticalAlign: "top" }}>
                    {companyInfo.Address || "Nashik, Maharashtra"}<br />
                    <b>GSTIN:</b> {data?.CompanyGSTIN || companyInfo.GSTIN || "27ABCDE1234F1Z5"}<br />
                    <b>State:</b> {data?.CompanyState || companyInfo.State || "Maharashtra"} (
                    {data?.CompanyStateCode || companyInfo.StateCode || "27"})<br />
                    <b>📞</b> {companyInfo.Phone || "+91 9XXXXXXXXX"}<br/>
                    <b>✉</b> {companyInfo.Email || "info@company.com"}
                  </td>
                </tr>
              </table>

              {/* Quotation & Company Details */}
              <div className="section-title">Quotation Details</div>
              <div className="customer-details-grid">
                <div className="detail-item">
                  <div className="detail-label">Quotation No.:</div>
                  <div className="detail-value">{data?.QuotationNo || "N/A"}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">Date:</div>
                  <div className="detail-value">{formatDate(data?.QuotationDate)}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">Valid Till:</div>
                  <div className="detail-value">{formatDate(data?.ValidTill)}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">Prepared By:</div>
                  <div className="detail-value">{data?.PreparedBy || "Sales Department"}</div>
                </div>
              </div>

              {/* Vendor Details */}
              <div className="section-title">Vendor Details</div>
              <div className="customer-details-grid">
                <div className="detail-item">
                  <div className="detail-label">Vendor Name:</div>
                  <div className="detail-value">{data?.VendorName || vendorInfo.VendorName || "N/A"}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">Vendor Code:</div>
                  <div className="detail-value">{vendorInfo.VendorCode || "N/A"}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">Vendor GSTIN:</div>
                  <div className="detail-value">{data?.VendorGSTIN || vendorInfo.GSTIN || "N/A"}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">Vendor PAN:</div>
                  <div className="detail-value">{data?.VendorPAN || "N/A"}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">Vendor Address:</div>
                  <div className="detail-value">{data?.VendorAddress || "N/A"}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">State:</div>
                  <div className="detail-value">{data?.VendorState || vendorInfo.State || "N/A"} ({data?.VendorStateCode || vendorInfo.StateCode || "N/A"})</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">City:</div>
                  <div className="detail-value">{data?.VendorCity || "N/A"}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">Pincode:</div>
                  <div className="detail-value">{data?.VendorPincode || "N/A"}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">Contact Person:</div>
                  <div className="detail-value">{data?.VendorContactPerson || "N/A"}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">Mobile No:</div>
                  <div className="detail-value">{data?.VendorPhone || vendorInfo.Phone || "N/A"}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">Email:</div>
                  <div className="detail-value">{data?.VendorEmail || vendorInfo.Email || "N/A"}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">Vendor Type:</div>
                  <div className="detail-value">{data?.VendorType || "N/A"}</div>
                </div>
              </div>

              {/* Items Table */}
              <div className="section-title">Items Details</div>
              <table className="price-table">
                <thead>
                  <tr>
                    <th width="5%">S.No</th>
                    <th width="12%">Part No</th>
                    <th width="20%">Description</th>
                    <th width="10%">HSN Code</th>
                    <th width="8%">Qty</th>
                    <th width="8%">Unit</th>
                    <th width="12%">Rate (₹)</th>
                    <th width="15%">Amount (₹)</th>
                    <th width="10%">GST</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const gst = calculateGST(item.Amount, gstPercentage, gstType);
                    return (
                      <tr key={item._id || index}>
                        <td className="text-center">{index + 1}</td>
                        <td>{item.PartNo || "N/A"}</td>
                        <td>
                          {item.PartName || "N/A"}
                          {item.Description && (
                            <div style={{ fontSize: "9px", color: "#666" }}>
                              {item.Description}
                            </div>
                          )}
                          {item.ItemDetails?.DrawingNo && (
                            <div style={{ fontSize: "9px", color: "#666" }}>
                              Drawing: {item.ItemDetails.DrawingNo} (Rev: {item.ItemDetails.RevisionNo || "A"})
                            </div>
                          )}
                        </td>
                        <td className="text-center">{item.HSNCode || item.ItemDetails?.HSNCode || "N/A"}</td>
                        <td className="text-center">{item.Quantity || 0}</td>
                        <td className="text-center">{item.Unit || item.ItemDetails?.Unit || "PCS"}</td>
                        <td className="text-right">{formatCurrency(item.FinalRate)}</td>
                        <td className="text-right">{formatCurrency(item.Amount)}</td>
                        <td className="text-center">{gstPercentage}%</td>
                      </tr>
                    );
                  })}
                  
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="9" className="text-center" style={{ padding: "10px" }}>
                        No items added to this quotation
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Price Calculation */}
              <div>
                <table className="header-table">
                  <tr>
                    <td width="80%" className="text-right"><b>Sub Total</b></td>
                    <td width="20%" className="text-right">
                      <b>{formatCurrency(subTotal)}</b>
                    </td>
                  </tr>
                </table>
                <div className="divider"></div>
                
                {gstPercentage > 0 && (
                  <>
                    <table className="header-table">
                      <tr>
                        <td>
                          GST @ {gstPercentage}% 
                          <span style={{ marginLeft: "10px", fontSize: "10px" }}>
                            ({gstType === "IGST" ? "Integrated GST" : "CGST + SGST"})
                          </span>
                        </td>
                        <td className="text-right">{formatCurrency(gstAmount)}</td>
                      </tr>
                    </table>
                    <div className="divider"></div>
                  </>
                )}
                
                <table className="header-table">
                  <tr>
                    <td width="80%" className="text-right"><b>Grand Total</b></td>
                    <td width="20%" className="text-right">
                      <b>{formatCurrency(grandTotal)}</b>
                    </td>
                  </tr>
                </table>
              </div>

              {/* Amount in Words */}
              <div style={{ margin: "10px 0", fontSize: "11px" }}>
                <b>Amount in Words:</b> {data?.AmountInWords || `Rupees ${formatCurrency(grandTotal)} Only`}
              </div>

              {/* Terms & Conditions from API */}
              {termsConditions.length > 0 && (
                <div>
                  <div className="section-title">Terms & Conditions</div>
                  <div className="declaration">
                    <ol style={{ paddingLeft: "18px", margin: "8px 0" }}>
                      {termsConditions
                        .sort((a, b) => a.Sequence - b.Sequence)
                        .map((term, index) => (
                          <li key={term._id || index}>
                            <b>{term.Title}:</b> {term.Description}
                          </li>
                        ))
                      }
                    </ol>
                  </div>
                </div>
              )}

              {/* Internal Remarks & Customer Remarks */}
              {(data?.InternalRemarks || data?.CustomerRemarks) && (
                <div className="notes-section">
                  {data?.InternalRemarks && (
                    <div>
                      <b>Internal Remarks:</b> {data.InternalRemarks}
                    </div>
                  )}
                  {data?.CustomerRemarks && (
                    <div style={{ marginTop: data?.InternalRemarks ? "5px" : "0" }}>
                      <b>Customer Remarks:</b> {data.CustomerRemarks}
                    </div>
                  )}
                </div>
              )}

              {/* Prepared By Information */}
              <div style={{ fontSize: "10px", margin: "10px 0", color: "#666" }}>
                <b>Prepared By:</b> {data?.PreparedBy || "Sales Department"} | 
                <b> Created:</b> {formatDate(data?.createdAt)} | 
                <b> Last Updated:</b> {formatDate(data?.updatedAt)}
              </div>

              {/* Signatures */}
              <table className="signature-table">
                <tr>
                  <td width="25%">Vendor's Signature</td>
                  <td width="25%">Prepared By</td>
                  <td width="25%">Manager</td>
                  <td width="25%">For {data?.CompanyName || companyInfo.CompanyName || "Suyash Enterprises"}</td>
                </tr>
                <tr>
                  <td style={{ borderTop: "none", paddingTop: "20px", fontSize: "10px" }}>
                    <i>Name, Stamp & Date</i>
                  </td>
                  <td style={{ borderTop: "none", paddingTop: "20px", fontSize: "10px" }}>
                    <i>{data?.PreparedBy || "Sales Department"}</i>
                  </td>
                  <td style={{ borderTop: "none", paddingTop: "20px", fontSize: "10px" }}>
                    <i>Authorized Signatory</i>
                  </td>
                  <td style={{ borderTop: "none", paddingTop: "20px", fontSize: "10px" }}>
                    <i>Proprietor/Partner</i>
                  </td>
                </tr>
              </table>

              {/* Footer Note */}
              <div style={{ textAlign: "center", fontSize: "10px", color: "#666", marginTop: "40px" }}>
                <div className="divider"></div>
                This is a computer-generated quotation and does not require a physical signature.
                <br/>
                Email: {companyInfo.Email || "info@suyashenterprises.com"} | 
                Phone: {companyInfo.Phone || "+91 9XXXXXXXXX"} | 
                GSTIN: {data?.CompanyGSTIN || companyInfo.GSTIN || "27ABCDE1234F1Z5"}
                {data?.PDFPath && (
                  <div style={{ marginTop: "5px" }}>
                    <i>PDF Version available at: {data.PDFPath}</i>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>

      <DialogActions className="no-print" style={{ padding: "16px 24px" }}>
        <Button 
          variant="contained" 
          startIcon={pdfLoading ? <CircularProgress size={20} color="inherit" /> : <Print />}
          onClick={handlePrint}
          disabled={loading || !data || pdfLoading}
          sx={{ minWidth: "120px" }}
        >
          {pdfLoading ? "Generating..." : "Generate PDF"}
        </Button>
        <Button onClick={onClose} variant="outlined" sx={{ minWidth: "100px" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrintQuotation;