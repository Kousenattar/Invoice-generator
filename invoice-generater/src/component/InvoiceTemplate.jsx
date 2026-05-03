import React from 'react';

const InvoiceTemplate = ({ invoiceData }) => {
  console.log(invoiceData);

  // Dummy data if no props are passed
  const rawData = invoiceData || {
    customerName: "",
    address: "",
    gstin: "",
    state: "",
    stateCode: "",
    invoiceNo: "",
    date: "",
    dcNo: "",
    dcDate: "",
    poNo: "",
    poDate: "23/04/2026",
    hsn: "9402",
    items: [
      { id: 1, desc: "ICU Bed (Motorized)", qty: 2, kgs: "-", rateKgs: "-", rateNos: "45000", amount: "90000" },
      { id: 2, desc: "Overbed Table", qty: 5, kgs: "-", rateKgs: "-", rateNos: "2500", amount: "12500" },
    ],
    totals: {
      assessable: "102500",
      cgst: "9225",
      sgst: "9225",
      taxAmount: "18450",
      total: "120950",
    },
    words: {
      assessable: "One Lakh Two Thousand Five Hundred Only",
      gst: "Eighteen Thousand Four Hundred Fifty Only",
      total: "One Lakh Twenty Thousand Nine Hundred Fifty Only"
    }
  };

  // Fallback for HSN if missing from root (old data compatibility)
  const data = {
    ...rawData,
    hsn: rawData.hsn || (rawData.items && rawData.items.length > 0 ? rawData.items[0].hsn : '')
  };

  // We want to render empty rows to make it look like the physical bill book
  const emptyRowsCount = 15 - (data.items?.length || 0);
  const emptyRows = Array.from({ length: Math.max(0, emptyRowsCount) });

  return (
    // Outer wrapper centers the A4 page on the screen and hides background when printing
    <div className="min-h-screen bg-gray-200 p-2 sm:p-8 flex sm:justify-center overflow-x-auto print:bg-white print:p-0 print:block print:overflow-visible print:w-fit">
      
      {/* A4 Page Container */}
      <div className="w-[210mm] shrink-0 bg-white border-2 border-black relative flex flex-col font-sans text-[10px] leading-tight text-black box-border">
        
        {/* --- Header Section --- */}
        <div className="flex justify-between items-start border-b-2 border-black p-1.5">
          {/* Logo Placeholder */}
          <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center font-bold text-xl tracking-tighter">
            ime
          </div>
          
          {/* Center Titles */}
          <div className="text-center flex-1 px-4">
            <h1 className="text-xl font-bold font-serif mb-1">NEW INDIMED ENTERPRISES</h1>
            <p className="text-[9px] font-semibold mb-1">Manufacturers of Hospital Furniture (MS & SS), All Kinds of Sheet Metal & Fabrication Works,<br/>Sales & Service of Hospital Equipments & Instruments.</p>
            <p className="text-[9px]">Works & Office :- Shastri Chowk, Pirjade Plot, Galli No. 1, MIRAJ - 416410.</p>
            <p className="font-bold text-xs mt-1">GST No. 27AYXPA 1269N1ZR</p>
          </div>

          {/* Right Info */}
          <div className="text-right flex flex-col justify-between h-full">
            <div>
              <p className="font-bold text-[10px]">Aslamhasan Attar</p>
              <p className="font-bold text-[10px] flex items-center justify-end gap-1">
                <span>📱</span> 09021222091
              </p>
            </div>
            <h2 className="text-lg font-bold mt-2 whitespace-nowrap">TAX INVOICE</h2>
          </div>
        </div>

        {/* --- Customer & Meta Info --- */}
        <div className="grid grid-cols-2 border-b-2 border-black">
          {/* Left Column: Customer */}
          <div className="border-r-2 border-black flex flex-col">
            <div className="flex px-1.5 py-0.5 border-b border-black">
              <span className="w-14 font-semibold">Name</span>
              <span className="mr-1">:</span>
              <span className="uppercase font-bold">{data.customerName}</span>
            </div>
            <div className="flex px-1.5 py-0.5 border-b border-black flex-1">
              <span className="w-14 font-semibold">Address</span>
              <span className="mr-1">:</span>
              <span className="uppercase">{data.address}</span>
            </div>
            <div className="flex px-1.5 py-0.5 border-b border-black">
              <span className="w-14 font-semibold">GSTIN</span>
              <span className="mr-1">:</span>
              <span className="uppercase font-bold">{data.gstin}</span>
            </div>
            <div className="flex px-1.5 py-0.5">
              <span className="w-14 font-semibold">State</span>
              <span className="mr-1">:</span>
              <span className="uppercase flex-1">Maharastra</span>
              <span className="font-semibold border-l border-black pl-2 mr-1">State Code :</span>
              <span className="px-1 font-bold">27</span>
            </div>
          </div>

          {/* Right Column: Invoice Meta */}
          <div className="grid grid-cols-2 text-[9px] sm:text-[10px]">
            <div className="border-r border-b border-black px-1.5 py-0.5"><span className="font-semibold">Invoice No. :</span> {data.invoiceNo}</div>
            <div className="border-b border-black px-1.5 py-0.5"><span className="font-semibold">Date :</span> {data.date}</div>
            <div className="border-r border-b border-black px-1.5 py-0.5"><span className="font-semibold">D.C. No. :</span> {data.dcNo}</div>
            <div className="border-b border-black px-1.5 py-0.5"><span className="font-semibold">Date :</span> {data.dcDate}</div>
            <div className="border-r border-black px-1.5 py-0.5 flex items-end"><span className="font-semibold mr-1">P.O. No.:</span> {data.poNo}</div>
            <div className="px-1.5 py-0.5 flex items-end"><span className="font-semibold mr-1">Date :</span> {data.poDate}</div>
          </div>
        </div>

        {/* --- Items Table --- */}
        <div className="border-b-2 border-black flex flex-col">
          <table className="w-full text-center border-collapse">
            <thead className="border-b-2 border-black text-[9px] sm:text-[10px]">
              <tr>
                <th rowSpan="2" className="border-r border-black font-semibold w-8">Sr.<br/>No.</th>
                <th className="border-r border-b border-black font-semibold text-left px-1.5 py-0.5 w-[42%]">HSN Code : <span className="font-bold">{data?.hsn}</span></th>
                <th rowSpan="2" className="border-r border-black font-semibold w-10">Qty.</th>
                <th rowSpan="2" className="border-r border-black font-semibold w-10">Kgs.</th>
                <th colSpan="2" className="border-r border-b border-black font-semibold w-28">Rate / Per</th>
                <th rowSpan="2" className="font-semibold w-20">Amount</th>
              </tr>
              <tr>
                <th className="border-r border-black font-semibold">Description</th>
                <th className="border-r border-black font-semibold w-14">Kgs.</th>
                <th className="border-r border-black font-semibold w-14">Nos.</th>
              </tr>
            </thead>
            <tbody className="text-[9px] sm:text-[10px]">
              {/* Actual Data Rows */}
              {(data.items || []).map((item, index) => (
                <tr key={item.id || index} className="border-b border-gray-400">
                  <td className="border-r border-black py-0.5">{index + 1}</td>
                  <td className="border-r border-black px-1.5 py-0.5 text-left leading-tight">
                    <div className="font-semibold text-[9px] text-gray-700"></div>
                    <div className="uppercase font-medium">{item.desc}</div>
                  </td>
                  <td className="border-r border-black py-0.5">{item.qty}</td>
                  <td className="border-r border-black py-0.5">{item.kgs}</td>
                  <td className="border-r border-black py-0.5">{item.rateKgs}</td>
                  <td className="border-r border-black py-0.5">{item.rateNos}</td>
                  <td className="py-0.5 font-bold">{item.amount}</td>
                </tr>
              ))}
              {/* Empty Padding Rows to fill the page */}
              {emptyRows.map((_, idx) => (
                <tr key={`empty-${idx}`} className="border-b border-gray-400 h-6">
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- Totals & Words Section --- */}
        <div className="grid grid-cols-[1fr_auto] border-b-2 border-black">
          {/* Left Column: Words */}
          <div className="border-r-2 border-black flex flex-col justify-between text-[9px] sm:text-[10px]">
            <div className="px-1.5 py-1 border-b border-black flex items-center min-h-[22px]">
              <span className="font-semibold mr-1 whitespace-nowrap">Assessable Value in words:</span>
              <span className="uppercase font-bold underline">{data.words?.assessable}</span>
            </div>
            <div className="px-1.5 py-1 border-b border-black flex items-center min-h-[22px]">
              <span className="font-semibold mr-1 whitespace-nowrap">GST Amount in words:</span>
              <span className="uppercase font-bold underline">{data.words?.gst}</span>
            </div>
            <div className="px-1.5 py-1 flex items-center min-h-[22px]">
              <span className="font-semibold mr-1 whitespace-nowrap">Total Amount after tax in words:</span>
              <span className="uppercase font-bold underline">{data.words?.total}</span>
            </div>
          </div>

          {/* Right Column: Number Totals */}
          <div className="w-52 text-[9px] sm:text-[10px]">
            <div className="grid grid-cols-[1fr_80px] border-b border-black min-h-[22px]">
              <div className="border-r border-black px-1.5 flex items-center font-semibold">Assessable Value</div>
              <div className="px-1.5 flex items-center justify-end font-bold">{data.totals?.assessable}</div>
            </div>
            <div className="grid grid-cols-[1fr_80px] border-b border-black min-h-[22px]">
              <div className="border-r border-black px-1.5 flex items-center font-semibold">Add: CGST 9%</div>
              <div className="px-1.5 flex items-center justify-end">{data.totals?.cgst}</div>
            </div>
            <div className="grid grid-cols-[1fr_80px] border-b border-black min-h-[22px]">
              <div className="border-r border-black px-1.5 flex items-center font-semibold">Add: SGST 9%</div>
              <div className="px-1.5 flex items-center justify-end">{data.totals?.sgst}</div>
            </div>
            <div className="grid grid-cols-[1fr_80px] border-b border-black min-h-[22px] bg-gray-100">
              <div className="border-r border-black px-1.5 flex items-center font-semibold">Tax Amount GST</div>
              <div className="px-1.5 flex items-center justify-end font-bold">{data.totals?.taxAmount}</div>
            </div>
            <div className="grid grid-cols-[1fr_80px] min-h-[22px] bg-gray-200">
              <div className="border-r border-black px-1.5 flex items-center font-bold">Total Amount After Tax</div>
              <div className="px-1.5 flex items-center justify-end font-bold text-[10px]">{data.totals?.total}</div>
            </div>
          </div>
        </div>

        {/* --- Footer Section --- */}
        <div className="flex h-16 text-[9px] sm:text-[10px]">
          {/* Bank Details & Terms */}
          <div className="w-[40%] flex flex-col border-r-2 border-black">
            <div className="p-1.5 border-b border-black flex-1">
              <span className="font-semibold">Bank Details:</span> Bank Account No.: 913020032886426<br/>
              AXIS BANK Branch- Miraj IFSC : UTIB0000769
            </div>
            <div className="p-1.5 font-semibold">
              Terms & Conditions:
            </div>
          </div>

          {/* Seal */}
          <div className="w-[20%] border-r-2 border-black flex items-end justify-center pb-1">
            <span className="text-[8px] text-gray-600">(Common Seal)</span>
          </div>

          {/* Signature */}
          <div className="w-[40%] flex flex-col justify-between p-1.5 text-center">
            <div>
              <p className="text-[7px]">Certified that the particulars given above are correct.</p>
              <p className="font-bold text-[9px] mt-0.5">FOR - NEW INDIMED ENTERPRISES</p>
            </div>
            <div className="mt-1">
              <p className="font-semibold text-[9px]">Proprietor</p>
              <p className="text-[7px]">(Authorised Signatory)</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InvoiceTemplate;