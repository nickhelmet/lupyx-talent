import PublicLayout from "@/components/PublicLayout";

export default function PrivacidadPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 pt-28 pb-20">
        <h1 className="text-3xl font-bold text-[#0B1F3B] dark:text-white">Política de Privacidad</h1>
        <p className="mt-2 text-sm text-[#1F4E79]/50 dark:text-gray-500">Última actualización: Abril 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#1F4E79]/80 dark:text-gray-300">
          <section>
            <h2 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">1. Datos que recopilamos</h2>
            <p className="mt-2">Recopilamos los siguientes datos cuando usás nuestra plataforma:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Nombre y apellido (de tu cuenta de Google)</li>
              <li>Dirección de email</li>
              <li>Foto de perfil (de Google)</li>
              <li>Datos de postulación: teléfono, ciudad, DNI, educación, CV</li>
              <li>Datos de uso: páginas visitadas, acciones realizadas (analytics)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">2. Cómo usamos tus datos</h2>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Gestionar tu cuenta y postulaciones</li>
              <li>Compartir tu perfil con las empresas que buscan talento</li>
              <li>Comunicarnos contigo sobre el estado de tus postulaciones</li>
              <li>Mejorar nuestros servicios mediante analytics anónimos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">3. Almacenamiento</h2>
            <p className="mt-2">Tus datos se almacenan en servidores de Google Cloud (Firebase) en Sudamérica. Los CVs se almacenan en Firebase Storage con acceso restringido.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">4. Compartir datos</h2>
            <p className="mt-2">Solo compartimos tus datos con las empresas a las que te postulás. No vendemos ni compartimos datos con terceros para fines publicitarios.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">5. Cookies</h2>
            <p className="mt-2">Utilizamos cookies para: autenticación (Firebase), preferencias (tema oscuro/claro), y analytics (Google Analytics). Podés aceptar o rechazar cookies no esenciales.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">6. Tus derechos</h2>
            <p className="mt-2">Tenés derecho a:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Acceder a tus datos personales</li>
              <li>Solicitar la corrección de datos incorrectos</li>
              <li>Solicitar la eliminación de tus datos</li>
              <li>Retirar tu consentimiento en cualquier momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">7. Seguridad</h2>
            <p className="mt-2">Implementamos medidas de seguridad: encriptación SSL, autenticación Firebase, reglas de acceso en base de datos, rate limiting, y App Check para prevenir abuso.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">8. Contacto</h2>
            <p className="mt-2">Para ejercer tus derechos o consultas: <a href="mailto:jm@lupyxtalent.com" className="text-[#2EC4B6] hover:underline">jm@lupyxtalent.com</a></p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
