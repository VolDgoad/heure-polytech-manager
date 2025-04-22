
import { DeclarationStatus } from '@/types';
import { cn } from '@/lib/utils';

interface DeclarationStatusBadgeProps {
  status: DeclarationStatus;
}

const DeclarationStatusBadge = ({ status }: DeclarationStatusBadgeProps) => {
  const getStatusLabel = () => {
    switch (status) {
      case 'brouillon':
        return 'Brouillon';
      case 'soumise':
        return 'Soumis';
      case 'verifiee':
        return 'Vérifié';
      case 'validee':
        return 'Validé';
      case 'approuvee':
        return 'Approuvé';
      case 'rejetee':
        return 'Rejeté';
      default:
        return 'Inconnu';
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'brouillon':
        return 'bg-gray-100 text-gray-800';
      case 'soumise':
        return 'bg-blue-100 text-blue-800';
      case 'verifiee':
        return 'bg-purple-100 text-purple-800';
      case 'validee':
      case 'approuvee':
        return 'bg-green-100 text-green-800';
      case 'rejetee':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={cn('status-badge px-2 py-1 rounded-full text-xs font-medium', getStatusClass())}>
      {getStatusLabel()}
    </span>
  );
};

export default DeclarationStatusBadge;
