import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import api from '../api/axios';
import InvoiceTemplate from '../component/InvoiceTemplate'; // The file from the previous step

const PrintView = () => {
  const { id } = useParams();
  const [invoiceData, setInvoiceData] = useState(null);
  
  // Reference for the print library
  const componentRef = useRef();
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Invoice_${invoiceData?.invoiceNo || 'Document'}`
  });

  useEffect(() => {
    api.get(`/invoices/${id}`).then(res => setInvoiceData(res.data));
  }, [id]);

  if (!invoiceData) return <div className="p-10 text-center">Loading PDF Data...</div>;

  return (
    <div>
      {/* Non-printing UI controls */}
      <div className="print:hidden flex flex-col sm:flex-row gap-4 justify-between items-center mb-4 bg-gray-200 p-4 rounded">
        <Link to="/" className="text-blue-600 hover:underline w-full sm:w-auto text-center sm:text-left">← Back to Dashboard</Link>
        <button onClick={handlePrint} className="bg-purple-600 text-white px-6 py-2 rounded shadow font-bold hover:bg-purple-700 w-full sm:w-auto">
          Print / Save as PDF
        </button>
      </div>

      {/* The Printable Component */}
      <div ref={componentRef}>
        <InvoiceTemplate invoiceData={invoiceData} />
      </div>
    </div>
  );
};

export default PrintView;