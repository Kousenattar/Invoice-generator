import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InvoiceForm from './pages/InvoiceForm';
import PrintView from './pages/PrintView';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-blue-900 text-white p-4 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">New Indimed Billing</h1>
          <a href="/" className="hover:underline">Dashboard</a>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/invoice/new" element={<InvoiceForm />} />
          <Route path="/invoice/edit/:id" element={<InvoiceForm />} />
          <Route path="/invoice/print/:id" element={<PrintView />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;