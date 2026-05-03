const mongoose = require('mongoose');
require('dotenv').config();
const Invoice = require('../models/Invoice');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for migration...');

    const invoices = await Invoice.find({ hsn: { $exists: false } });
    console.log(`Found ${invoices.length} invoices to check for migration.`);

    let updatedCount = 0;

    for (const invoice of invoices) {
      if (invoice.items && invoice.items.length > 0) {
        // Try to find HSN in items if it was stored there
        // Note: Some items might have hsn, some might not if it was inconsistent
        // We take from the first item as a reasonable default
        const oldHsn = invoice.items[0]._doc.hsn || invoice.items.find(i => i._doc.hsn)?._doc.hsn;

        if (oldHsn) {
          invoice.hsn = oldHsn;
          // Optional: Remove hsn from items to clean up
          invoice.items.forEach(item => {
            if (item._doc.hsn) delete item._doc.hsn;
          });
          
          await invoice.save();
          updatedCount++;
        }
      }
    }

    console.log(`Migration completed. Updated ${updatedCount} invoices.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
