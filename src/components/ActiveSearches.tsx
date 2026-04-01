"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Briefcase,
  ExternalLink,
  Clock,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { fetchJobs } from "@/services/api";
import type { Job } from "@/types";

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  tags: string[];
  linkedinUrl: string;
  description: string;
}

function mapJob(job: Job): JobListing {
  return {
    id: job.slug || job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    type: job.type === "CONTRACT" ? "Contractor" : job.type,
    tags: job.tags || [],
    linkedinUrl: job.linkedinUrl || "https://www.linkedin.com/company/lupyx-talent/jobs/",
    description: job.description,
  };
}

const fallbackJobs: JobListing[] = [
  {
    id: "senior-backend-java",
    title: "Senior Backend Engineer",
    company: "Empresa confidencial",
    location: "Buenos Aires / Santa Fe, Argentina",
    type: "Contractor",
    tags: ["Java 21", "Backend", "+4.5 años exp."],
    linkedinUrl: "https://www.linkedin.com/company/lupyx-talent/jobs/",
    description: "Buscamos un Senior Backend Engineer con experiencia sólida en Java 21.",
  },
  {
    id: "senior-marketing-designer",
    title: "Senior Marketing Designer",
    company: "Startup AI en crecimiento",
    location: "100% Remoto — LATAM",
    type: "Contractor",
    tags: ["Figma", "Webflow", "After Effects", "Inglés avanzado"],
    linkedinUrl: "https://www.linkedin.com/company/lupyx-talent/jobs/",
    description: "Sumate a una startup de IA en pleno crecimiento como Senior Marketing Designer.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ActiveSearches() {
  const { user, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<JobListing[]>(fallbackJobs);

  useEffect(() => {
    fetchJobs()
      .then((data: Job[]) => {
        if (data.length > 0) setJobs(data.map(mapJob));
      })
      .catch(() => {}); // Keep fallback on error
  }, []);

  function handleApply(jobId: string) {
    if (!user) {
      loginWithGoogle();
      return;
    }
    router.push(`/postular/${jobId}`);
  }

  return (
    <section id="busquedas" className="bg-[#f8fafb] py-20 dark:bg-[#0d1520] sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-block rounded-full bg-[#2EC4B6]/10 px-4 py-1 text-sm font-semibold text-[#2EC4B6]">
            Oportunidades
          </span>
          <h2 className="mt-4 text-3xl font-bold text-[#0B1F3B] dark:text-white sm:text-4xl">
            Búsquedas activas
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#1F4E79]/70 dark:text-gray-400">
            Explorá las posiciones que estamos buscando actualmente. Todas
            nuestras búsquedas ofrecen compensación en USD.
          </p>
        </motion.div>

        {/* Job cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-12 grid gap-6 md:grid-cols-2"
        >
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              variants={item}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-[#2EC4B6]/5 dark:border-white/10 dark:bg-white/5 sm:p-8"
            >
              {/* Active badge */}
              <div className="absolute top-4 right-4">
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Activa
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#0B1F3B] dark:text-white sm:text-2xl">
                {job.title}
              </h3>
              <p className="mt-1 text-sm font-medium text-[#1F4E79]/60">
                {job.company}
              </p>

              <p className="mt-4 text-[#1F4E79]/80 dark:text-gray-300">{job.description}</p>

              {/* Details */}
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#1F4E79]/70 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[#4FA3D1]" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-[#4FA3D1]" />
                  {job.type}
                </span>
              </div>

              {/* Tags */}
              <div className="mt-5 flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#0B1F3B]/5 px-3 py-1 text-xs font-medium text-[#1F4E79] dark:bg-white/10 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={job.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2EC4B6] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#26a89c] hover:shadow-md"
                >
                  Ver en LinkedIn
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={() => handleApply(job.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1F4E79]/20 px-6 py-2.5 text-sm font-semibold text-[#1F4E79] transition-all hover:border-[#2EC4B6] hover:text-[#2EC4B6] dark:border-white/20 dark:text-gray-300"
                >
                  <Clock className="h-3.5 w-3.5" />
                  {user ? "Postularme" : "Iniciar sesión para postularme"}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
