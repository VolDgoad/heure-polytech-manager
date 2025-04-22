
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  CheckSquare, 
  ClipboardList, 
  FileText, 
  Home, 
  Settings, 
  User, 
  Users 
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = [
    {
      title: 'Tableau de bord',
      href: '/dashboard',
      icon: Home,
      roles: ['enseignant', 'scolarite', 'chef_departement', 'directrice'],
    },
    {
      title: 'Mes Déclarations',
      href: '/declarations',
      icon: ClipboardList,
      roles: ['enseignant', 'chef_departement', 'directrice'],
    },
    {
      title: 'Nouvelle Déclaration',
      href: '/declarations/new',
      icon: FileText,
      roles: ['enseignant', 'chef_departement', 'directrice'],
    },
    {
      title: 'Vérification',
      href: '/verification',
      icon: CheckSquare,
      roles: ['scolarite'],
    },
    {
      title: 'Validation',
      href: '/validation',
      icon: CheckSquare,
      roles: ['chef_departement', 'directrice'],
    },
    {
      title: 'Enseignants',
      href: '/teachers',
      icon: Users,
      roles: ['directrice'],
    },
    {
      title: 'Emploi du temps',
      href: '/schedule',
      icon: Calendar,
      roles: ['enseignant', 'scolarite', 'chef_departement', 'directrice'],
    },
    {
      title: 'Profil',
      href: '/profile',
      icon: User,
      roles: ['enseignant', 'scolarite', 'chef_departement', 'directrice'],
    },
    {
      title: 'Paramètres',
      href: '/settings',
      icon: Settings,
      roles: ['directrice'],
    },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <div className="w-64 h-full bg-sidebar flex-shrink-0 hidden md:block">
      <div className="h-16 flex items-center justify-center border-b border-sidebar-border px-6">
        <h1 className="text-xl font-bold text-white">Polytech Manager</h1>
      </div>
      <nav className="py-6">
        <ul className="space-y-1 px-2">
          {filteredNavItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  location.pathname === item.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="absolute bottom-4 left-0 right-0 px-6">
        <div className="border-t border-sidebar-border pt-4">
          <p className="text-xs text-sidebar-foreground/70 text-center">
            Polytech Diamniadio © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
