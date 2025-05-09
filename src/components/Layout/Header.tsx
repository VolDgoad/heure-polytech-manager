
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings, Moon, Sun } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import NotificationCenter from '../notifications/NotificationCenter';

const Header = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const initials = user ? 
    `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() :
    'ME';
    
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Don't show the header on login or register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <header className="border-b z-10 fixed top-0 left-0 right-0 bg-background h-16">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="UAM Logo" 
              className="h-10 w-auto" 
            />
            <span className="font-bold text-xl ml-2 hidden md:block">UAM</span>
          </Link>
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <NotificationCenter className="mr-2" />
            
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="mr-2"
            >
              {theme === 'dark' ? (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage 
                      src={user.photo_url || ''} 
                      alt={`${user.first_name} ${user.last_name}`} 
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div>
                    <p>{`${user.first_name} ${user.last_name}`}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to="/profile">
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                </Link>
                <Link to="/settings">
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Paramètres</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="secondary">Se connecter</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
