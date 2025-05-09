
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Récupération de la clé API d'OpenAI depuis les variables d'environnement
const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';

// En-têtes CORS pour permettre les requêtes cross-origin
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Gestion des requêtes OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { message, userRole, context } = await req.json();
    
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Un message est requis' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log("Message reçu:", message);
    console.log("Rôle utilisateur:", userRole);
    console.log("Contexte:", context);
    
    // Construction du système de prompt selon le rôle de l'utilisateur
    let systemPrompt = `Vous êtes un assistant IA pour le système de gestion des déclarations d'enseignement à Polytech Tours. 
Répondez de façon concise et précise en français. 
La date du jour est ${new Date().toLocaleDateString('fr-FR')}.
`;
    
    // Ajout de contexte spécifique au rôle
    if (userRole === 'enseignant') {
      systemPrompt += `Vous aidez un enseignant à gérer ses déclarations d'heures d'enseignement.
Les enseignants peuvent créer des brouillons, les modifier et les soumettre pour vérification.`;
    } else if (userRole === 'scolarite') {
      systemPrompt += `Vous aidez un membre de la scolarité qui vérifie les déclarations soumises par les enseignants.
La scolarité peut vérifier ou rejeter les déclarations.`;
    } else if (userRole === 'chef_departement') {
      systemPrompt += `Vous aidez un chef de département qui valide les déclarations vérifiées par la scolarité.
Les chefs de département peuvent valider ou rejeter les déclarations.`;
    } else if (userRole === 'directrice_etudes') {
      systemPrompt += `Vous aidez la directrice des études qui approuve les déclarations validées par les chefs de département.
La directrice peut approuver ou rejeter les déclarations.`;
    }

    // Ajout du contexte de l'application au prompt système
    systemPrompt += `
Le processus de validation des déclarations suit ces étapes:
1. L'enseignant crée et soumet une déclaration (statut: soumise)
2. La scolarité vérifie la déclaration (statut: vérifiée ou rejetée)
3. Le chef de département valide la déclaration (statut: validée ou rejetée)
4. La directrice des études approuve la déclaration (statut: approuvée ou rejetée)

${context ? `Voici le contexte actuel: ${context}` : ''}
`;

    // Requête à l'API OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("Erreur OpenAI:", data.error);
      return new Response(
        JSON.stringify({ error: `Erreur de l'IA: ${data.error.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Extraction de la réponse
    const aiResponse = data.choices[0].message.content;
    
    console.log("Réponse de l'IA:", aiResponse);

    // Analyse de la réponse pour détecter des actions à effectuer
    let actionType = "none";
    let actionDetails = {};
    
    // Détection d'actions dans la réponse (pour extension future)
    if (aiResponse.includes("ACTION:")) {
      const actionMatch = aiResponse.match(/ACTION: (\w+) (.+)/);
      if (actionMatch) {
        actionType = actionMatch[1];
        actionDetails = { text: actionMatch[2] };
      }
    }

    return new Response(
      JSON.stringify({
        response: aiResponse,
        actionType,
        actionDetails
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Erreur serveur:", error.message);
    return new Response(
      JSON.stringify({ error: `Erreur serveur: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
