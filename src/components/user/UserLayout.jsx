import { Outlet, Link } from 'react-router-dom'
import Healthclub from '../../assets/healthclub.jpeg';




export default function UserLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-3">
            <img 
  src={Healthclub} 
  alt="Mental Health Platform Logo" 
  className="h-12 w-auto"
/>
            </Link>
            <Link 
              to="/admin" 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

