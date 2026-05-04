import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const numberToWords = (num) => {
  if (num === 0) return "Zero Only";
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  
  const convert = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + convert(n % 10000000) : "");
  };
  
  return convert(Math.round(num)) + " Only";
};

const AutocompleteInput = ({ value, onChange, options, placeholder, className, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    if (value) {
      setFilteredOptions(options.filter(opt => opt.toLowerCase().includes(value.toLowerCase())));
    } else {
      setFilteredOptions(options);
    }
  }, [value, options]);

  return (
    <div className="relative flex-1">
      <input
        type="text"
        placeholder={placeholder}
        required={required}
        className={className}
        value={value}
        onChange={e => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto mt-1 text-left">
          {filteredOptions.map((opt, i) => (
            <li
              key={i}
              className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm"
              onMouseDown={(e) => {
                e.preventDefault(); 
                onChange(opt);
                setIsOpen(false);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const InvoiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    invoiceNo: '', date: '', customerName: '', address: '', gstin: '', hsn: '',
    dcNo: [''], dcDate: [''], poNo: '', poDate: '',
    items: [{ desc: '', qty: 1, kgs: '', rateNos: 0, rateKgs: '', amount: 0 }],
    totals: { assessable: 0, cgst: 0, sgst: 0, taxAmount: 0, total: 0 },
    words: { assessable: '', gst: '', total: '' }
  });

  const [previousInvoices, setPreviousInvoices] = useState([]);

  useEffect(() => {
    // Fetch all invoices to build suggestions for fast typing
    api.get('/invoices')
      .then(res => setPreviousInvoices(res.data))
      .catch(err => console.error("Could not fetch invoices for suggestions", err));
  }, []);

  // Compute unique customers and products for datalists
  const customerDetailsMap = previousInvoices.reduce((acc, inv) => {
    if (inv.customerName && !acc[inv.customerName]) {
      acc[inv.customerName] = { address: inv.address || '', gstin: inv.gstin || '' };
    }
    return acc;
  }, {});
  const uniqueCustomers = Object.keys(customerDetailsMap);

  const productDetailsMap = previousInvoices.reduce((acc, inv) => {
    if (inv.items) {
      inv.items.forEach(item => {
        if (item.desc && !acc[item.desc]) {
          acc[item.desc] = { 
            rateNos: item.rateNos || 0, 
            rateKgs: item.rateKgs || ''
          };
        }
      });
    }
    return acc;
  }, {});
  const uniqueProducts = Object.keys(productDetailsMap);

  useEffect(() => {
    if (isEdit) {
      api.get(`/invoices/${id}`).then(res => {
        const data = res.data;
        // Fallback for old data where hsn was inside items
        const hsn = data.hsn || (data.items && data.items.length > 0 ? data.items[0].hsn : '');
        // Ensure dcNo and dcDate are arrays
        const dcNo = Array.isArray(data.dcNo) ? data.dcNo : [data.dcNo || ''];
        const dcDate = Array.isArray(data.dcDate) ? data.dcDate : [data.dcDate || ''];
        setFormData({ ...data, hsn, dcNo, dcDate });
      });
    }
  }, [id, isEdit]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Auto-calculate amount for the row
    if (['qty', 'rateNos', 'kgs', 'rateKgs'].includes(field)) {
      const qty = Number(newItems[index].qty) || 0;
      const rateNos = Number(newItems[index].rateNos) || 0;
      const kgs = Number(newItems[index].kgs) || 0;
      const rateKgs = Number(newItems[index].rateKgs) || 0;
      newItems[index].amount = (qty * rateNos) + (kgs * rateKgs);
    }
    
    setFormData({ ...formData, items: newItems });
    calculateTotals(newItems);
  };

  const calculateTotals = (items) => {
    const assessable = items.reduce((sum, item) => sum + Number(item.amount), 0);
    const cgst = Number((assessable * 0.09).toFixed(2)); // Assuming 9% CGST
    const sgst = Number((assessable * 0.09).toFixed(2)); // Assuming 9% SGST
    const taxAmount = Number((cgst + sgst).toFixed(2));
    
    const rawTotal = assessable + taxAmount;
    const total = Math.round(rawTotal); // Round figure feature
    
    setFormData(prev => ({
      ...prev,
      totals: {
        assessable,
        cgst,
        sgst,
        taxAmount,
        total
      },
      words: {
        assessable: numberToWords(assessable),
        gst: numberToWords(taxAmount),
        total: numberToWords(total)
      }
    }));
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { desc: '', qty: 1, kgs: '', rateNos: 0, rateKgs: '', amount: 0 }]
    });
  };

  const removeItem = (indexToRemove) => {
    const newItems = formData.items.filter((_, index) => index !== indexToRemove);
    setFormData({ ...formData, items: newItems });
    calculateTotals(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };

      if (isEdit) {
        await api.put(`/invoices/${id}`, payload);
      } else {
        await api.post('/invoices', payload);
      }
      navigate('/'); // Go back to dashboard on success
    } catch (error) {
      console.error("Error saving invoice", error);
      const errorMsg = error.response?.data?.error || error.message;
      alert("Failed to save invoice: " + errorMsg);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded shadow max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{isEdit ? 'Edit Invoice' : 'Create Invoice'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input type="text" placeholder="Invoice No" required className="border p-2 rounded" 
            value={formData.invoiceNo} onChange={e => setFormData({...formData, invoiceNo: e.target.value})} />
          <input type="date" required className="border p-2 rounded"
            value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          <AutocompleteInput 
            placeholder="Customer Name" 
            required 
            className="border p-2 rounded w-full"
            options={uniqueCustomers}
            value={formData.customerName} 
            onChange={val => {
              const autoFill = customerDetailsMap[val];
              if (autoFill) {
                setFormData({...formData, customerName: val, address: autoFill.address, gstin: autoFill.gstin});
              } else {
                setFormData({...formData, customerName: val});
              }
            }}
          />
          <input type="text" placeholder="Address" className="border p-2 rounded"
            value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          <input type="text" placeholder="GSTIN" className="border p-2 rounded"
            value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} />
          <input type="text" placeholder="HSN Code (applies to all items)" className="border p-2 rounded"
            value={formData.hsn} onChange={e => setFormData({...formData, hsn: e.target.value})} />
          <input type="text" placeholder="P.O. No" className="border p-2 rounded"
            value={formData.poNo} onChange={e => setFormData({...formData, poNo: e.target.value})} />
          <input type="date" className="border p-2 rounded"
            value={formData.poDate} onChange={e => setFormData({...formData, poDate: e.target.value})} />
        </div>

        {/* DC Numbers and Dates */}
        <div className="bg-blue-50 p-4 rounded-lg border">
          <h3 className="font-semibold mb-3 border-b border-blue-200 pb-1 text-blue-800">Delivery Challan (D.C.) Details</h3>
          {formData.dcNo.map((no, index) => (
            <div key={index} className="flex gap-4 mb-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">D.C. No</label>
                <input 
                  type="text" 
                  placeholder="D.C. No" 
                  className="border p-2 rounded w-full bg-white"
                  value={no} 
                  onChange={e => {
                    const newDcNo = [...formData.dcNo];
                    newDcNo[index] = e.target.value;
                    setFormData({...formData, dcNo: newDcNo});
                  }} 
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">D.C. Date</label>
                <input 
                  type="date" 
                  className="border p-2 rounded w-full bg-white"
                  value={formData.dcDate[index] || ''} 
                  onChange={e => {
                    const newDcDate = [...formData.dcDate];
                    newDcDate[index] = e.target.value;
                    setFormData({...formData, dcDate: newDcDate});
                  }} 
                />
              </div>
              <button 
                type="button" 
                onClick={() => {
                  if (formData.dcNo.length > 1) {
                    const newDcNo = formData.dcNo.filter((_, i) => i !== index);
                    const newDcDate = formData.dcDate.filter((_, i) => i !== index);
                    setFormData({...formData, dcNo: newDcNo, dcDate: newDcDate});
                  }
                }}
                disabled={formData.dcNo.length === 1}
                className="bg-red-100 text-red-600 px-3 py-2 rounded hover:bg-red-200 disabled:opacity-30 h-10"
              >
                ✕
              </button>
            </div>
          ))}
          <button 
            type="button" 
            onClick={() => setFormData({...formData, dcNo: [...formData.dcNo, ''], dcDate: [...formData.dcDate, '']})}
            className="text-blue-700 text-sm font-bold hover:underline"
          >
            + Add Another DC
          </button>
        </div>

        {/* Dynamic Items */}
        <div className="overflow-x-auto bg-gray-50 p-2 sm:p-4 rounded-lg border mb-4">
          <h3 className="font-semibold mb-4 border-b pb-2">Products / Services</h3>
          
          <div className="min-w-[800px]">
            {/* Column Names */}
            <div className="flex gap-2 mb-2 text-xs font-bold text-gray-600 px-1">
              <div className="flex-1">Description</div>
              <div className="w-16 text-center">Qty</div>
              <div className="w-16 text-center">Kgs</div>
              <div className="w-24 text-center">Rate/Nos</div>
              <div className="w-24 text-center">Rate/Kgs</div>
              <div className="w-28 text-right">Amount</div>
              <div className="w-8"></div> {/* Delete column */}
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <AutocompleteInput 
                  placeholder="Description" 
                  required 
                  className="border p-2 w-full bg-white"
                  options={uniqueProducts}
                  value={item.desc} 
                  onChange={val => {
                    const autoFill = productDetailsMap[val];
                    if (autoFill) {
                      const newItems = [...formData.items];
                      newItems[index] = {
                        ...newItems[index],
                        desc: val,
                        rateNos: autoFill.rateNos,
                        rateKgs: autoFill.rateKgs,
                      };
                      const qty = Number(newItems[index].qty) || 0;
                      const rateNos = Number(autoFill.rateNos) || 0;
                      const kgs = Number(newItems[index].kgs) || 0;
                      const rateKgs = Number(autoFill.rateKgs) || 0;
                      newItems[index].amount = (qty * rateNos) + (kgs * rateKgs);

                      setFormData({ ...formData, items: newItems });
                      calculateTotals(newItems);
                    } else {
                      handleItemChange(index, 'desc', val);
                    }
                  }} 
                />
                <input type="number" placeholder="Qty" className="border p-2 w-16 bg-white" value={item.qty} onChange={e => handleItemChange(index, 'qty', e.target.value)} />
                <input type="number" placeholder="Kgs" className="border p-2 w-16 bg-white" value={item.kgs} onChange={e => handleItemChange(index, 'kgs', e.target.value)} />
                <input type="number" placeholder="Rate/Nos" className="border p-2 w-24 bg-white" value={item.rateNos} onChange={e => handleItemChange(index, 'rateNos', e.target.value)} />
                <input type="number" placeholder="Rate/Kgs" className="border p-2 w-24 bg-white" value={item.rateKgs} onChange={e => handleItemChange(index, 'rateKgs', e.target.value)} />
                <div className="p-2 w-28 bg-white border text-right font-bold rounded">₹ {item.amount}</div>
                <button 
                  type="button" 
                  onClick={() => removeItem(index)} 
                  disabled={formData.items.length === 1}
                  className="w-8 h-10 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed bg-white border"
                  title="Remove Item"
                >
                  ✕
                </button>
              </div>
            ))}
            <button type="button" onClick={addItem} className="text-blue-600 mt-2 hover:underline font-semibold bg-white px-3 py-1 border rounded shadow-sm">+ Add Item</button>
          </div>
        </div>

        {/* Totals Readout */}
        <div className="bg-gray-50 p-4 text-right rounded">
          <p>Assessable: ₹ {formData.totals.assessable}</p>
          <p>CGST (9%): ₹ {formData.totals.cgst}</p>
          <p>SGST (9%): ₹ {formData.totals.sgst}</p>
          <p className="text-xl font-bold mt-2 border-t pt-2">Total: ₹ {formData.totals.total}</p>
        </div>

        <button type="submit" className="w-full bg-green-600 text-white p-3 rounded font-bold hover:bg-green-700">
          {isEdit ? 'Update Invoice' : 'Save Invoice'}
        </button>
      </form>
    </div>
  );
};

export default InvoiceForm;