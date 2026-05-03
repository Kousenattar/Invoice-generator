const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  customerName: { type: String, required: true },
  address: { type: String },
  gstin: { type: String },
  state: { type: String },
  stateCode: { type: String },
  dcNo: { type: String },
  dcDate: { type: String },
  poNo: { type: String },
  poDate: { type: String },
  hsn: { type: String },
  
  items: [{
    
    desc: { type: String, required: true },
    qty: { type: Number, required: true },
    kgs: { type: String },
    rateKgs: { type: String },
    rateNos: { type: String },
    amount: { type: String, required: true }
  }],

  totals: {
    assessable: { type: String },
    cgst: { type: String },
    sgst: { type: String },
    taxAmount: { type: String },
    total: { type: String }
  },
  words: {
    assessable: { type: String },
    gst: { type: String },
    total: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);