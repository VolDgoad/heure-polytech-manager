
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@1.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailNotificationRequest {
  to: string;
  subject: string;
  name: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, name, message }: EmailNotificationRequest = await req.json();

    if (!to || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "Notifications UAM <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a365d;">${subject}</h1>
          <p>Bonjour ${name || 'utilisateur'},</p>
          <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #2563eb; background-color: #f3f4f6;">
            ${message}
          </div>
          <p style="margin-top: 30px;">Cordialement,</p>
          <p>Plateforme de gestion des fiches de service - UAM</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 0.875rem;">
            Ce message est envoyé automatiquement, veuillez ne pas y répondre.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending email:", error);
      throw error;
    }

    console.log("Email notification sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
