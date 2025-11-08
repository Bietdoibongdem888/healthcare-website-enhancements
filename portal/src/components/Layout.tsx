import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles.css';

export default function Layout({children}:{children:React.ReactNode}){
  const { user, logout } = useAuth();
  return <>
    <div className='nav'>
      <Link to='/'>Portal</Link>
      <Link to='/doctors'>Doctors</Link>
      <Link to='/booking'>Booking</Link>
      {user ? (
        <>
          <Link to='/profile'>Profile</Link>
          {user?.role === 'admin' && (
            <>
              <Link to='/admin/doctors'>Admin Doctors</Link>
              <Link to='/admin/patients'>Admin Patients</Link>
              <Link to='/admin/availability'>Availability</Link>
            </>
          )}
          <button onClick={() => logout()} style={{ marginLeft: 'auto' }}>Logout</button>
        </>
      ) : (
        <>
        <Link to='/login' style={{marginLeft:'auto'}}>Login</Link>
        <Link to='/register'>Register</Link>
      </>)}
    </div>
    <div className='container'>
      {children}
    </div>
  </>
}

