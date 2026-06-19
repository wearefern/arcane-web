import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ScannerLayout } from './layouts/ScannerLayout';
import { LoadingBlock } from './components/ui/Feedback';
import { CosmicAtmosphereProvider } from './components/layout/CosmicAtmosphereProvider';

/* Public */
const Home = lazy(() => import('./pages/public/Home'));
const Events = lazy(() => import('./pages/public/Events'));
const EventDetail = lazy(() => import('./pages/public/EventDetail'));
const Checkout = lazy(() => import('./pages/public/Checkout'));
const PaymentPending = lazy(() => import('./pages/public/PaymentPending'));
const PaymentSuccess = lazy(() => import('./pages/public/PaymentSuccess'));
const PaymentFailed = lazy(() => import('./pages/public/PaymentFailed'));
const MyTickets = lazy(() => import('./pages/public/MyTickets'));
const TicketView = lazy(() => import('./pages/public/TicketView'));

/* Admin */
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const EventsManagement = lazy(() => import('./pages/admin/EventsManagement'));
const EventForm = lazy(() => import('./pages/admin/EventForm'));
const TicketTypes = lazy(() => import('./pages/admin/TicketTypes'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const OrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const Tickets = lazy(() => import('./pages/admin/Tickets'));
const ScanLogs = lazy(() => import('./pages/admin/ScanLogs'));
const ExportPage = lazy(() => import('./pages/admin/Export'));
const Settings = lazy(() => import('./pages/admin/Settings'));

/* Scanner */
const ScannerLogin = lazy(() => import('./pages/scanner/ScannerLogin'));
const EventSelect = lazy(() => import('./pages/scanner/EventSelect'));
const QRScanner = lazy(() => import('./pages/scanner/QRScanner'));
const SyncStatus = lazy(() => import('./pages/scanner/SyncStatus'));

const NotFound = lazy(() => import('./pages/NotFound'));

function Fallback() {
  return (
    <div className="container section" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
      <LoadingBlock />
    </div>
  );
}

export default function App() {
  return (
    <CosmicAtmosphereProvider>
    <ToastProvider>
      <BrowserRouter>
        <Suspense fallback={<Fallback />}>
          <Routes>
            {/* ---- Public buyer site ---- */}
            <Route element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="events" element={<Events />} />
              <Route path="events/:slug" element={<EventDetail />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="payment/pending" element={<PaymentPending />} />
              <Route path="payment/success" element={<PaymentSuccess />} />
              <Route path="payment/failed" element={<PaymentFailed />} />
              <Route path="tickets" element={<MyTickets />} />
              <Route path="ticket/:id" element={<TicketView />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* ---- Admin ---- */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="events" element={<EventsManagement />} />
              <Route path="events/new" element={<EventForm />} />
              <Route path="events/:id/edit" element={<EventForm />} />
              <Route path="ticket-types" element={<TicketTypes />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="tickets" element={<Tickets />} />
              <Route path="scan-logs" element={<ScanLogs />} />
              <Route path="export" element={<ExportPage />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* ---- Gate scanner ---- */}
            <Route path="/scanner/login" element={<ScannerLogin />} />
            <Route path="/scanner" element={<ScannerLayout />}>
              <Route index element={<QRScanner />} />
              <Route path="events" element={<EventSelect />} />
              <Route path="sync" element={<SyncStatus />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ToastProvider>
    </CosmicAtmosphereProvider>
  );
}
