import PublicLayout from "@/components/PublicLayout";

export default function TerminosPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 pt-28 pb-20">
        <h1 className="text-3xl font-bold text-[#0B1F3B] dark:text-white">Términos y Condiciones</h1>
        <p className="mt-2 text-sm text-[#1F4E79]/50 dark:text-gray-500">Última actualización: Abril 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#1F4E79]/80 dark:text-gray-300">
          <section>
            <h2 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">1. Aceptación</h2>
            <p className="mt-2">Al utilizar lupyxtalent.com, aceptás estos términos y condiciones. Si no estás de acuerdo, por favor no utilices la plataforma.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">2. Servicios</h2>
            <p className="mt-2">Lupyx Talent es una plataforma de reclutamiento y selección que conecta empresas con candidatos. Ofrecemos publicación de búsquedas laborales, recepción de postulaciones y gestión del proceso de selección.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">3. Registro y cuenta</h2>
            <p className="mt-2">Para postularte a búsquedas, necesitás crear una cuenta mediante Google Sign-In. Sos responsable de mantener la seguridad de tu cuenta y de toda la actividad que ocurra bajo ella.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">4. Datos personales</h2>
            <p className="mt-2">Los datos que proporcionás (nombre, email, CV, etc.) son tratados conforme a nuestra Política de Privacidad. Solo se utilizan para el proceso de selección.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">5. Uso aceptable</h2>
            <p className="mt-2">No está permitido: enviar información falsa, utilizar la plataforma para fines no relacionados con el empleo, intentar acceder a datos de otros usuarios, o realizar acciones que puedan dañar el servicio.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">6. Propiedad intelectual</h2>
            <p className="mt-2">El contenido, diseño y código de lupyxtalent.com son propiedad de Lupyx Talent. Los CVs y datos de candidatos son propiedad de sus respectivos autores.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">7. Limitación de responsabilidad</h2>
            <p className="mt-2">Lupyx Talent no garantiza la obtención de empleo. Actuamos como intermediarios en el proceso de selección. Las decisiones de contratación son responsabilidad de las empresas.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0B1F3B] dark:text-white">8. Contacto</h2>
            <p className="mt-2">Para consultas sobre estos términos: <a href="mailto:jm@lupyxtalent.com" className="text-[#2EC4B6] hover:underline">jm@lupyxtalent.com</a></p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
