"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Briefcase, ExternalLink, Share2, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { fetchJobs } from "@/services/api";
import { track } from "@/lib/analytics";
import type { Job } from "@/types";

const typeLabels: Record<string, string> = {
  CONTRACT: "Contractor",
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  INTERNSHIP: "Pasantía",
};

function ShareButtons({ job }: { job: Job }) {
  const url = `https://lupyxtalent.com/busquedas/${job.slug || job.id}`;
  const text = `${job.title} en ${job.company} — Lupyx Talent`;

  return (
    <div className="flex gap-2">
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track.linkedinClick()}
        className="flex items-center gap-1.5 rounded-full bg-[#0077B5]/10 px-4 py-2 text-xs font-semibold text-[#0077B5] transition-all hover:bg-[#0077B5]/20"
      >
        <Share2 className="h-3.5 w-3.5" /> LinkedIn
      </a>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track.contactClick("whatsapp")}
        className="flex items-center gap-1.5 rounded-full bg-[#25D366]/10 px-4 py-2 text-xs font-semibold text-[#25D366] transition-all hover:bg-[#25D366]/20"
      >
        <Share2 className="h-3.5 w-3.5" /> WhatsApp
      </a>
    </div>
  );
}

export default function JobDetailClient() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, loginWithGoogle } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs()
      .then((jobs: Job[]) => {
        const found = jobs.find((j) => j.slug === slug || j.id === slug);
        if (found) {
          setJob(found);
          track.jobView(found.id, found.title);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  function handleApply() {
    track.jobApplyStart(slug);
    if (!user) {
      loginWithGoogle();
      return;
    }
    router.push(`/postular/${slug}`);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#2EC4B6]" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-28 pb-20">
        <p className="text-center text-lg text-[#1F4E79]/50">Búsqueda no encontrada.</p>
      </div>
    );
  }

  // Schema.org JobPosting
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.postedDate,
    employmentType: job.type === "FULL_TIME" ? "FULL_TIME" : job.type === "CONTRACT" ? "CONTRACTOR" : job.type,
    hiringOrganization: { "@type": "Organization", name: job.company, sameAs: "https://lupyxtalent.com" },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: job.location } },
    applicantLocationRequirements: { "@type": "Country", name: "Argentina" },
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 dark:bg-[#0a0f1a]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-3xl px-4 pb-20">
        <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-sm text-[#1F4E79]/60 hover:text-[#2EC4B6] dark:text-gray-400">
          <ArrowLeft className="h-4 w-4" /> Volver a búsquedas
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-white/10 dark:bg-white/5 sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Activa
                </span>
                <h1 className="mt-3 text-2xl font-bold text-[#0B1F3B] dark:text-white sm:text-3xl">{job.title}</h1>
                <p className="mt-1 text-lg text-[#1F4E79]/70 dark:text-gray-400">{job.company}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-[#1F4E79]/70 dark:text-gray-400">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#4FA3D1]" /> {job.location}</span>
              <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-[#4FA3D1]" /> {typeLabels[job.type] || job.type}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-[#4FA3D1]" /> {job.postedDate?.split("T")[0]}</span>
            </div>

            {job.tags && job.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#0B1F3B]/5 px-3 py-1 text-xs font-medium text-[#1F4E79] dark:bg-white/10 dark:text-gray-300">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 dark:border-white/10 dark:bg-white/5 sm:p-8">
            <h2 className="text-lg font-bold text-[#0B1F3B] dark:text-white">Descripción</h2>
            <p className="mt-3 whitespace-pre-line text-[#1F4E79]/80 leading-relaxed dark:text-gray-300">{job.description}</p>

            {job.requirements && (
              <>
                <h2 className="mt-8 text-lg font-bold text-[#0B1F3B] dark:text-white">Requisitos</h2>
                <p className="mt-3 whitespace-pre-line text-[#1F4E79]/80 leading-relaxed dark:text-gray-300">{job.requirements}</p>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <button
                onClick={handleApply}
                className="cursor-pointer rounded-full bg-[#2EC4B6] px-8 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-[#26a89c] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                {user ? "Postularme" : "Iniciar sesión para postularme"}
              </button>
              {job.linkedinUrl && (
                <a
                  href={job.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track.linkedinClick()}
                  className="flex items-center gap-2 rounded-full border border-[#1F4E79]/20 px-6 py-3 text-sm font-semibold text-[#1F4E79] transition-all hover:border-[#2EC4B6] hover:text-[#2EC4B6] dark:border-white/20 dark:text-gray-300"
                >
                  Ver en LinkedIn <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            <ShareButtons job={job} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
