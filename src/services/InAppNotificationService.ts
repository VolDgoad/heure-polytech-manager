
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export class InAppNotificationService {
  /**
   * Create an in-app notification for a user
   */
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: string = 'info',
    data: any = null
  ) {
    try {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          read: false,
          data
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating notification:', error);
        return { error };
      }
      
      return { data: notification };
    } catch (error) {
      console.error('Error in createNotification:', error);
      return { error };
    }
  }

  /**
   * Create notifications for all users with a specific role
   */
  static async notifyUsersByRole(
    role: string,
    title: string,
    message: string,
    type: string = 'info',
    data: any = null
  ) {
    try {
      // First, get all users with the specified role
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', role);
      
      if (usersError || !users) {
        console.error('Error fetching users by role:', usersError);
        return { error: usersError };
      }
      
      // Create notifications for each user
      if (users.length === 0) {
        return { data: [] };
      }
      
      const notifications = users.map(user => ({
        user_id: user.id,
        title,
        message,
        type,
        read: false,
        data
      }));
      
      const { data: createdNotifications, error } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();
      
      if (error) {
        console.error('Error creating notifications for users by role:', error);
        return { error };
      }
      
      return { data: createdNotifications };
    } catch (error) {
      console.error('Error in notifyUsersByRole:', error);
      return { error };
    }
  }

  /**
   * Create notifications for all users in a department
   */
  static async notifyUsersByDepartment(
    departmentId: string,
    title: string,
    message: string,
    type: string = 'info',
    data: any = null
  ) {
    try {
      // First, get all users in the specified department
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id')
        .eq('department_id', departmentId);
      
      if (usersError || !users) {
        console.error('Error fetching users by department:', usersError);
        return { error: usersError };
      }
      
      // Create notifications for each user
      if (users.length === 0) {
        return { data: [] };
      }
      
      const notifications = users.map(user => ({
        user_id: user.id,
        title,
        message,
        type,
        read: false,
        data
      }));
      
      const { data: createdNotifications, error } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();
      
      if (error) {
        console.error('Error creating notifications for users by department:', error);
        return { error };
      }
      
      return { data: createdNotifications };
    } catch (error) {
      console.error('Error in notifyUsersByDepartment:', error);
      return { error };
    }
  }

  /**
   * Notify about declaration status changes
   */
  static async notifyDeclarationStatusChange(declarationId: string, userId: string, status: string) {
    try {
      let title = '';
      let message = '';
      let type = 'info';
      
      // Set different messages based on status
      switch (status) {
        case 'soumise':
          title = 'Déclaration soumise';
          message = 'Votre déclaration a été soumise avec succès et est en attente de vérification.';
          break;
        case 'verifiee':
          title = 'Déclaration vérifiée';
          message = 'Votre déclaration a été vérifiée et est en attente de validation.';
          break;
        case 'validee':
          title = 'Déclaration validée';
          message = 'Votre déclaration a été validée et est en attente d\'approbation finale.';
          break;
        case 'approuvee':
          title = 'Déclaration approuvée';
          message = 'Votre déclaration a été approuvée. Le processus est terminé.';
          type = 'success';
          break;
        case 'rejetee':
          title = 'Déclaration rejetée';
          message = 'Votre déclaration a été rejetée. Veuillez consulter les détails pour plus d\'informations.';
          type = 'error';
          break;
        default:
          title = 'Mise à jour de la déclaration';
          message = `Votre déclaration est maintenant "${status}".`;
      }
      
      return await this.createNotification(
        userId,
        title,
        message,
        type,
        { declarationId, status }
      );
    } catch (error) {
      console.error('Error in notifyDeclarationStatusChange:', error);
      return { error };
    }
  }
}
