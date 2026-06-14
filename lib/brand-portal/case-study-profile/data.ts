import type { CaseStudyProfile } from "../shared/types";

export const CASE_STUDY_PROFILES: CaseStudyProfile[] = [
  {
    brandId: "brand-life-fitness",
    projectName: "Shanghai Pudong Commercial Gym",
    city: "Shanghai",
    industry: "commercial-gym",
    year: 2025,
    summary: "Life Fitness T5 treadmills deployed across 1200sqm commercial gym facility",
    documentRef: "case-life-fitness-sh-gym",
    mode: "brand-portal",
  },
  {
    brandId: "brand-technogym",
    projectName: "Beijing CBD Hotel Fitness Center",
    city: "Beijing",
    industry: "hotel",
    year: 2025,
    summary: "Technogym Skillrun and premium cardio line for 5-star hotel wellness center",
    documentRef: "case-technogym-bj-hotel",
    mode: "brand-portal",
  },
  {
    brandId: "brand-matrix",
    projectName: "Guangzhou University Campus Gym",
    city: "Guangzhou",
    industry: "campus",
    year: 2025,
    summary: "Matrix mid-market equipment package for campus gym renovation",
    documentRef: "case-matrix-gz-campus",
    mode: "brand-portal",
  },
  {
    brandId: "brand-relax",
    projectName: "Shenzhen Community Sports Center",
    city: "Shenzhen",
    industry: "community",
    year: 2024,
    summary: "Relax commercial equipment for community fitness center build-out",
    documentRef: "case-relax-sz-community",
    mode: "brand-portal",
  },
  {
    brandId: "brand-shuhua",
    projectName: "Chengdu Community Sports Center",
    city: "Chengdu",
    industry: "community",
    year: 2025,
    summary: "Shuhua domestic equipment for government community sports procurement",
    documentRef: "case-shuhua-cd-community",
    mode: "brand-portal",
  },
  {
    brandId: "brand-precor",
    projectName: "Hangzhou Enterprise Wellness Center",
    city: "Hangzhou",
    industry: "enterprise",
    year: 2025,
    summary: "Precor premium cardio deployment for enterprise employee wellness program",
    documentRef: "case-precor-hz-enterprise",
    mode: "brand-portal",
  },
  {
    brandId: "brand-impulse",
    projectName: "Wuhan School Gymnasium",
    city: "Wuhan",
    industry: "campus",
    year: 2024,
    summary: "Impulse value strength line for school gymnasium budget project",
    documentRef: "case-impulse-wh-campus",
    mode: "brand-portal",
  },
  {
    brandId: "brand-dhz",
    projectName: "Nanjing Campus Fitness Center",
    city: "Nanjing",
    industry: "campus",
    year: 2025,
    summary: "DHZ domestic equipment for university campus fitness center",
    documentRef: "case-dhz-nj-campus",
    mode: "brand-portal",
  },
  {
    brandId: "brand-bodystrength",
    projectName: "Suzhou Community Gym",
    city: "Suzhou",
    industry: "community",
    year: 2024,
    summary: "BodyStrong functional and strength equipment for community gym",
    documentRef: "case-bodystrength-sz-community",
    mode: "brand-portal",
  },
  {
    brandId: "brand-sportsart",
    projectName: "Xi'an Hotel Fitness Upgrade",
    city: "Xi'an",
    industry: "hotel",
    year: 2025,
    summary: "SportsArt ECO-POWR cardio line for hotel fitness center upgrade",
    documentRef: "case-sportsart-xa-hotel",
    mode: "brand-portal",
  },
];

export function getAllCaseStudyProfiles(): CaseStudyProfile[] {
  return [...CASE_STUDY_PROFILES];
}

export function getCaseStudyProfilesByBrandId(brandId: string): CaseStudyProfile[] {
  return CASE_STUDY_PROFILES.filter((c) => c.brandId === brandId);
}
