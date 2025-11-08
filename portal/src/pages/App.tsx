import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Layout from '../components/Layout';
import Protected from '../components/Protected';
import Login from './Login';
import Register from './Register';
import Forgot from './Forgot';
import Reset from './Reset';
import Doctors from './Doctors';
import Booking from './Booking';
import Profile from './Profile';
import AdminDoctors from './AdminDoctors';
import AdminPatients from './AdminPatients';
import AdminAvailability from './AdminAvailability';

function Home(){
return (
<div className="card">
<h2>HealthCare Portal</h2>
<p>Welcome! Use the navigation above.</p>
<p>API Docs: <a href="http://localhost:3000/api-docs" target="_blank">/api-docs</a></p>
</div>
);
}

export default function App(){
return (
<AuthProvider>
<BrowserRouter>
<Layout>
<Routes>
<Route path="/" element={<Home />} />
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
<Route path="/forgot" element={<Forgot />} />
<Route path="/reset" element={<Reset />} />
<Route path="/doctors" element={<Doctors />} />
<Route path="/booking" element={<Booking />} />
<Route path="/profile" element={<Protected><Profile /></Protected>} />
<Route path="/admin/doctors" element={<Protected><AdminDoctors /></Protected>} />
<Route path="/admin/patients" element={<Protected><AdminPatients /></Protected>} />
<Route path="/admin/availability" element={<Protected><AdminAvailability /></Protected>} />
</Routes>
</Layout>
</BrowserRouter>
</AuthProvider>
);
}
