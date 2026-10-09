import type { MetadataRoute } from "next";
import { applications } from "@/data/applications";
import { SITE_URL } from "@/lib/site";

const PAGES = [
  { chemin: "/", priorite: 1 },
  { chemin: "/applications", priorite: 0.9 },
  { chemin: "/documentation", priorite: 0.7 },
  { chemin: "/tarifs", priorite: 0.6 },
  { chemin: "/contact", priorite: 0.6 },
  { chemin: "/a-propos", priorite: 0.5 },
  { chemin: "/mentions-legales", priorite: 0.2 },
  { chemin: "/cgv", priorite: 0.2 },
  { chemin: "/confidentialite", priorite: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES.map((p) => ({ url: `${SITE_URL}${p.chemin}`, priority: p.priorite })),
    ...applications.map((a) => ({ url: `${SITE_URL}/applications/${a.slug}`, priority: 0.8 })),
    ...applications
      .filter((a) => a.appUrl)
      .map((a) => ({ url: `${SITE_URL}${a.appUrl}`, priority: 0.8 })),
  ];
}
