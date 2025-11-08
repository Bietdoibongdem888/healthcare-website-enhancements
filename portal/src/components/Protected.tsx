import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function Protected({children}:{children:JSX.Element}){
  const { user } = useAuth();
  if(!user) return <Navigate to='/login' replace />;
  return children;
}
