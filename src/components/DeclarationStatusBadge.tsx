
import { DeclarationStatus } from '@/types';
import { cn } from '@/lib/utils';

interface DeclarationStatusBadgeProps {
  status: DeclarationStatus;
}

const DeclarationStatusBadge = ({ status }: DeclarationStatusBadgeProps) => {
  const getStatusLabel = () => {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'submitted':
        return 'Soumis';
      case 'verified':
        return 'Vérifié';
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      default:
        return 'Inconnu';
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'verified':
        return 'bg-purple-100 text-purple-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={cn('status-badge', getStatusClass())}>
      {getStatusLabel()}
    </span>
  );
};

export default DeclarationStatusBadge;
