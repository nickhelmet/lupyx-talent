import { Resend } from "resend";

const FROM_EMAIL = "Lupyx Talent <notifications@lupyxtalent.com>";
const FROM_EMAIL_FALLBACK = "Lupyx Talent <onboarding@resend.dev>";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function getFrom(): string {
  // Use custom domain if verified, otherwise Resend's onboarding address
  return process.env.RESEND_DOMAIN_VERIFIED === "true" ? FROM_EMAIL : FROM_EMAIL_FALLBACK;
}

export async function sendApplicationConfirmation(
  to: string,
  candidateName: string,
  jobTitle: string,
  jobCompany: string,
) {
  const resend = getResend();
  if (!resend) { console.log(`[Email stub] Application confirmation to ${to}`); return; }

  await resend.emails.send({
    from: getFrom(),
    to,
    subject: `Recibimos tu postulación — ${jobTitle}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0B1F3B; padding: 24px; text-align: center;">
          <h1 style="color: #2EC4B6; margin: 0; font-size: 24px;">Lupyx Talent</h1>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #0B1F3B; margin-top: 0;">¡Hola ${candidateName}!</h2>
          <p style="color: #1F4E79; line-height: 1.6;">
            Recibimos tu postulación para <strong>${jobTitle}</strong> en <strong>${jobCompany}</strong>.
          </p>
          <p style="color: #1F4E79; line-height: 1.6;">
            Nuestro equipo revisará tu perfil y te contactaremos con novedades sobre el proceso.
          </p>
          <div style="background: #f8fafb; border-radius: 12px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #1F4E79; font-size: 14px;"><strong>Puesto:</strong> ${jobTitle}</p>
            <p style="margin: 4px 0 0; color: #1F4E79; font-size: 14px;"><strong>Empresa:</strong> ${jobCompany}</p>
          </div>
          <p style="color: #1F4E79; line-height: 1.6;">
            Gracias por confiar en Lupyx Talent.
          </p>
        </div>
        <div style="background: #f8fafb; padding: 16px 24px; text-align: center; font-size: 12px; color: #999;">
          Lupyx Talent — Conectando talento con oportunidades
        </div>
      </div>
    `,
  });
}

export async function sendStatusChangeNotification(
  to: string,
  candidateName: string,
  jobTitle: string,
  newStatus: string,
) {
  const resend = getResend();
  if (!resend) { console.log(`[Email stub] Status change to ${to}: ${newStatus}`); return; }

  const statusMessages: Record<string, string> = {
    REVIEWING: "Estamos revisando tu perfil.",
    INTERVIEW: "¡Queremos conocerte! Te contactaremos para coordinar una entrevista.",
    ACCEPTED: "¡Felicitaciones! Tu postulación ha sido aceptada.",
    REJECTED: "Lamentablemente, en esta oportunidad no avanzaremos con tu postulación.",
    HIRED: "¡Bienvenido/a al equipo! Nos contactaremos para los próximos pasos.",
  };

  await resend.emails.send({
    from: getFrom(),
    to,
    subject: `Actualización sobre tu postulación — ${jobTitle}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0B1F3B; padding: 24px; text-align: center;">
          <h1 style="color: #2EC4B6; margin: 0; font-size: 24px;">Lupyx Talent</h1>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #0B1F3B; margin-top: 0;">Hola ${candidateName},</h2>
          <p style="color: #1F4E79; line-height: 1.6;">
            Hay una actualización sobre tu postulación a <strong>${jobTitle}</strong>.
          </p>
          <div style="background: #f8fafb; border-radius: 12px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #1F4E79;">${statusMessages[newStatus] || `Estado: ${newStatus}`}</p>
          </div>
          <p style="color: #1F4E79; line-height: 1.6; font-size: 14px;">
            Si tenés consultas, respondé a este email o contactanos por LinkedIn.
          </p>
        </div>
        <div style="background: #f8fafb; padding: 16px 24px; text-align: center; font-size: 12px; color: #999;">
          Lupyx Talent — Conectando talento con oportunidades
        </div>
      </div>
    `,
  });
}

export async function sendNewApplicationAlert(
  adminEmails: string[],
  candidateName: string,
  candidateEmail: string,
  jobTitle: string,
) {
  const resend = getResend();
  if (!resend) { console.log(`[Email stub] New application alert to admins`); return; }

  for (const to of adminEmails) {
    await resend.emails.send({
      from: getFrom(),
      to,
      subject: `Nueva postulación: ${candidateName} → ${jobTitle}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0B1F3B; padding: 24px; text-align: center;">
            <h1 style="color: #2EC4B6; margin: 0; font-size: 24px;">Lupyx Talent — Admin</h1>
          </div>
          <div style="padding: 32px 24px;">
            <h2 style="color: #0B1F3B; margin-top: 0;">Nueva postulación</h2>
            <div style="background: #f8fafb; border-radius: 12px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0; color: #1F4E79;"><strong>Candidato:</strong> ${candidateName}</p>
              <p style="margin: 4px 0 0; color: #1F4E79;"><strong>Email:</strong> ${candidateEmail}</p>
              <p style="margin: 4px 0 0; color: #1F4E79;"><strong>Puesto:</strong> ${jobTitle}</p>
            </div>
            <a href="https://lupyxtalent.com/admin/applications" style="display: inline-block; background: #2EC4B6; color: white; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-weight: 600; margin-top: 16px;">
              Ver en admin
            </a>
          </div>
        </div>
      `,
    });
  }
}
