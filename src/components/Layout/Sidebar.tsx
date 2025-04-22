
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
  Users,
  Building2,
  Layers,
  BookOpen,
  GraduationCap,
  CalendarDays,
  LayoutGrid
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
      roles: ['enseignant', 'scolarite', 'chef_departement', 'directrice_etudes', 'admin'],
    },
    {
      title: 'Mes Déclarations',
      href: '/declarations',
      icon: ClipboardList,
      roles: ['enseignant', 'chef_departement', 'directrice_etudes', 'admin'],
    },
    {
      title: 'Nouvelle Déclaration',
      href: '/declarations/new',
      icon: FileText,
      roles: ['enseignant', 'chef_departement', 'directrice_etudes', 'admin'],
    },
    {
      title: 'Vérification',
      href: '/verification',
      icon: CheckSquare,
      roles: ['scolarite', 'admin'],
    },
    {
      title: 'Validation',
      href: '/validation',
      icon: CheckSquare,
      roles: ['chef_departement', 'directrice_etudes', 'admin'],
    },
    {
      title: 'Emploi du temps',
      href: '/schedule',
      icon: Calendar,
      roles: ['enseignant', 'scolarite', 'chef_departement', 'directrice_etudes', 'admin'],
    },
    // Section Administration
    {
      section: 'Administration',
      items: [
        {
          title: 'Utilisateurs',
          href: '/admin/users',
          icon: Users,
          roles: ['directrice_etudes', 'admin'],
        },
        {
          title: 'Départements',
          href: '/admin/departments',
          icon: Building2,
          roles: ['directrice_etudes', 'admin'],
        },
        {
          title: 'Filières',
          href: '/admin/programs',
          icon: GraduationCap,
          roles: ['directrice_etudes', 'admin'],
        },
        {
          title: 'Niveaux',
          href: '/admin/levels',
          icon: Layers,
          roles: ['directrice_etudes', 'admin'],
        },
        {
          title: 'Semestres',
          href: '/admin/semesters',
          icon: CalendarDays,
          roles: ['directrice_etudes', 'admin'],
        },
        {
          title: 'Unités d\'enseignement',
          href: '/admin/teaching-units',
          icon: BookOpen,
          roles: ['directrice_etudes', 'admin'],
        },
        {
          title: 'Éléments constitutifs',
          href: '/admin/course-elements',
          icon: LayoutGrid,
          roles: ['directrice_etudes', 'admin'],
        },
      ],
    },
    {
      title: 'Profil',
      href: '/profile',
      icon: User,
      roles: ['enseignant', 'scolarite', 'chef_departement', 'directrice_etudes', 'admin'],
    },
    {
      title: 'Paramètres',
      href: '/settings',
      icon: Settings,
      roles: ['directrice_etudes', 'admin'],
    },
  ];

  return (
    <div className="w-64 h-full bg-sidebar flex-shrink-0 hidden md:block">
      <div className="h-16 flex items-center justify-center border-b border-sidebar-border px-6">
        <h1 className="text-xl font-bold text-white">Polytech Manager</h1>
      </div>
      <nav className="py-6">
        <ul className="space-y-1 px-2">
          {navItems.map((item, index) => {
            if ('section' in item) {
              // Render a section with its items
              const sectionItems = item.items.filter(subItem => 
                subItem.roles.includes(user.role)
              );
              
              if (sectionItems.length === 0) return null;
              
              return (
                <li key={index} className="mt-6 first:mt-0">
                  <h2 className="px-3 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
                    {item.section}
                  </h2>
                  <ul className="mt-2 space-y-1">
                    {sectionItems.map((subItem, subIndex) => (
                      <li key={`${index}-${subIndex}`}>
                        <Link
                          to={subItem.href}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            location.pathname === subItem.href
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              : "text-sidebar-foreground"
                          )}
                        >
                          <subItem.icon className="h-4 w-4" />
                          {subItem.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            } else if (item.roles.includes(user.role)) {
              // Render a regular nav item
              return (
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
              );
            }
            return null;
          })}
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
