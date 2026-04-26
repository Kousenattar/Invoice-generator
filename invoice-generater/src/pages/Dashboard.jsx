import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios'; // Your axios setup from earlier

const Dashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await api.get('/invoices');
        setInvoices(response.data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/invoices/${id}`);
      setInvoices(invoices.filter(inv => inv._id !== id));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert("Failed to delete invoice");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold">Invoice History</h2>
        <Link to="/invoice/new" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 w-full sm:w-auto text-center">
          + Create New Bill
        </Link>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Invoice No</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{inv.date}</td>
                  <td className="p-3 font-semibold">{inv.invoiceNo}</td>
                  <td className="p-3 uppercase">{inv.customerName}</td>
                  <td className="p-3 font-bold text-green-700">₹ {inv.totals?.total}</td>
                  <td className="p-3 text-right space-x-3">
                    <Link to={`/invoice/edit/${inv._id}`} className="text-blue-500 hover:underline">Edit</Link>
                    <Link to={`/invoice/print/${inv._id}`} className="text-purple-600 hover:underline">Print</Link>
                    {deleteConfirmId === inv._id ? (
                      <span className="space-x-2 bg-red-50 p-1 rounded">
                        <span className="text-sm text-red-800">Sure?</span>
                        <button onClick={() => handleDelete(inv._id)} className="text-red-600 font-bold hover:underline">Yes</button>
                        <button onClick={() => setDeleteConfirmId(null)} className="text-gray-600 hover:underline">No</button>
                      </span>
                    ) : (
                      <button onClick={() => setDeleteConfirmId(inv._id)} className="text-red-500 hover:underline">Delete</button>
                    )}
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr><td colSpan="5" className="p-4 text-center text-gray-500">No invoices found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;