/**
 * V62 P11 — Pilot documentation metadata
 */

export type PilotDoc = {
  id: string;
  title: string;
  category: "guide" | "feedback" | "issue" | "support" | "launch";
  summary: string;
  path?: string;
};

export function getPilotDocumentation(): PilotDoc[] {
  return [
    {
      id: "pilot_guide",
      title: "Pilot Program Guide",
      category: "guide",
      summary: "Enroll organizations, track pilot users/projects, monitor health dashboard",
      path: "/pilot/program",
    },
    {
      id: "feedback_guide",
      title: "Feedback Guide",
      category: "feedback",
      summary: "Submit UX/Data/Quote/PDF/Delivery/Intelligence/Launch feedback with status tracking",
      path: "/pilot/feedback",
    },
    {
      id: "issue_guide",
      title: "Issue Triage Guide",
      category: "issue",
      summary: "Report blocker/high/medium/low issues; triage workflow new→closed",
      path: "/pilot/issues",
    },
    {
      id: "support_guide",
      title: "Support Guide",
      category: "support",
      summary: "Known issues, retry guidance, troubleshooting hints for pilot users",
      path: "/pilot/support",
    },
    {
      id: "launch_note",
      title: "Post-Launch Pilot Note",
      category: "launch",
      summary: "V61 commercial launch frozen; V62 validates real user adoption before scale",
      path: "/launch",
    },
  ];
}
