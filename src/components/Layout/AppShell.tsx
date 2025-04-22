
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';

const AppShell = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-gray-50 p-4">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
