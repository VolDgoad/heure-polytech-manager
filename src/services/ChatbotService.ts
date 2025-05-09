
import { supabase } from '@/integrations/supabase/client';
import { Declaration } from '@/types';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  loading?: boolean;
}

export interface ChatAction {
  type: string;
  details: any;
}

export class ChatbotService {
  static async sendMessage(
    message: string, 
    userRole: string | null, 
    declarations?: Declaration[]
  ): Promise<{ response: string; action?: ChatAction }> {
    try {
      // Préparer le contexte basé sur les déclarations fournies
      let context = '';
      if (declarations && declarations.length > 0) {
        context = `Vous avez ${declarations.length} déclaration(s). `;
        if (declarations.length <= 3) {
          context += declarations.map(d => 
            `Déclaration ${d.id.substring(0, 8)}: ${d.course_element_id}, statut: ${d.status}, ${d.totalHours} heures au total`
          ).join('. ');
        } else {
          context += `Les plus récentes sont: ` + 
            declarations.slice(0, 3).map(d => 
              `${d.id.substring(0, 8)} (${d.status})`
            ).join(', ');
        }
      }

      const { data, error } = await supabase.functions.invoke('chatbot-ai', {
        body: { 
          message, 
          userRole,
          context
        }
      });

      if (error) {
        console.error("Erreur lors de l'appel à la fonction chatbot-ai:", error);
        throw new Error(`Erreur lors de la communication avec l'IA: ${error.message}`);
      }

      return {
        response: data.response,
        action: data.actionType !== 'none' ? {
          type: data.actionType,
          details: data.actionDetails
        } : undefined
      };
    } catch (error) {
      console.error("Erreur dans le service chatbot:", error);
      throw new Error(`Erreur du service chatbot: ${error.message}`);
    }
  }

  static generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
