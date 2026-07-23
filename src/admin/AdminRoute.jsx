import { Navigate } from 'react-router-dom'

export default function AdminRoute({ children }) {
  const authed = sessionStorage.getItem('kk_admin_auth') === 'true'
  if (!authed) return <Navigate to="/admin/login" replace />
  return children
}
