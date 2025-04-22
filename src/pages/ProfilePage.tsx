
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'enseignant':
        return 'Enseignant';
      case 'scolarite':
        return 'Personnel de Scolarité';
      case 'chef_departement':
        return 'Chef de Département';
      case 'directrice':
        return 'Directrice des Études';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mon Profil</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>Votre profil et vos informations</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            
            <div className="text-center">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{getRoleDisplay(user.role)}</p>
              {user.department && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 mt-2">
                  {user.department}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Détails du compte</CardTitle>
            <CardDescription>Modifiez vos informations de compte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input id="name" value={user.name} readOnly />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input id="email" type="email" value={user.email} readOnly />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Input id="role" value={getRoleDisplay(user.role)} readOnly />
            </div>
            
            {user.department && (
              <div className="space-y-2">
                <Label htmlFor="department">Département</Label>
                <Input id="department" value={user.department} readOnly />
              </div>
            )}

            <div className="pt-4">
              <Button variant="outline" className="w-full">
                Changer de mot de passe
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
