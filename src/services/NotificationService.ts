
import { supabase } from '@/integrations/supabase/client';
import { Declaration, User } from '@/types';

export class NotificationService {
  static async sendNotification(
    toUserId: string,
    subject: string,
    message: string
  ) {
    try {
      // First get the user's email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email, first_name, last_name')
        .eq('id', toUserId)
        .single();
      
      if (userError || !userData) {
        console.error('Error fetching user for notification:', userError);
        return { error: 'User not found' };
      }
      
      const recipientEmail = userData.email;
      const recipientName = `${userData.first_name} ${userData.last_name}`;
      
      // Call the edge function to send the email
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          to: recipientEmail,
          subject,
          name: recipientName,
          message
        }
      });
      
      if (error) {
        console.error('Error sending notification:', error);
        return { error };
      }
      
      return { data };
    } catch (error) {
      console.error('Error in sendNotification:', error);
      return { error };
    }
  }
  
  static async notifyStatusChange(declaration: Declaration, currentUser: User, newStatus: string) {
    try {
      let recipientId = '';
      let subject = '';
      let message = '';
      
      // Determine recipient based on status transition
      switch (newStatus) {
        case 'soumise':
          // Notify scolarité when a declaration is submitted
          const { data: scolariteUsers } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'scolarite')
            .limit(1);
            
          if (scolariteUsers && scolariteUsers.length > 0) {
            recipientId = scolariteUsers[0].id;
            subject = 'Nouvelle déclaration à vérifier';
            message = `Une nouvelle déclaration de service a été soumise par ${declaration.teacherName || 'un enseignant'} et nécessite votre vérification.`;
          }
          break;
          
        case 'verifiee':
          // Notify chef de département when a declaration is verified
          const { data: chefUsers } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'chef_departement')
            .eq('department_id', declaration.department_id)
            .limit(1);
            
          if (chefUsers && chefUsers.length > 0) {
            recipientId = chefUsers[0].id;
            subject = 'Déclaration vérifiée à valider';
            message = `Une déclaration de service de ${declaration.teacherName || 'un enseignant'} a été vérifiée par la scolarité et nécessite votre validation.`;
          }
          break;
          
        case 'validee':
          // Notify directrice des études when a declaration is validated
          const { data: directriceUsers } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'directrice_etudes')
            .limit(1);
            
          if (directriceUsers && directriceUsers.length > 0) {
            recipientId = directriceUsers[0].id;
            subject = 'Déclaration validée à approuver';
            message = `Une déclaration de service de ${declaration.teacherName || 'un enseignant'} a été validée par le chef de département et nécessite votre approbation finale.`;
          }
          break;
          
        case 'approuvee':
          // Notify teacher when their declaration is approved
          recipientId = declaration.teacher_id;
          subject = 'Votre déclaration a été approuvée';
          message = 'Votre déclaration de service a été approuvée par la directrice des études et est maintenant finalisée.';
          break;
          
        case 'rejetee':
          // Notify teacher when their declaration is rejected
          recipientId = declaration.teacher_id;
          subject = 'Votre déclaration a été rejetée';
          message = `Votre déclaration de service a été rejetée. Motif: ${declaration.rejection_reason || 'Non spécifié'}`;
          break;
      }
      
      if (recipientId) {
        return await this.sendNotification(recipientId, subject, message);
      }
      
      return { data: null };
    } catch (error) {
      console.error('Error in notifyStatusChange:', error);
      return { error };
    }
  }
}
