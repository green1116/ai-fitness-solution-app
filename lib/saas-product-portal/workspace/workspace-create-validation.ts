const WORKSPACE_NAME_MIN = 2;
const WORKSPACE_NAME_MAX = 80;

export function validateWorkspaceName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return "Workspace name is required";
  }
  if (trimmed.length < WORKSPACE_NAME_MIN) {
    return `Workspace name must be at least ${WORKSPACE_NAME_MIN} characters`;
  }
  if (trimmed.length > WORKSPACE_NAME_MAX) {
    return `Workspace name must be ${WORKSPACE_NAME_MAX} characters or less`;
  }
  return null;
}

export function getWorkspaceNameConstraints() {
  return { min: WORKSPACE_NAME_MIN, max: WORKSPACE_NAME_MAX };
}
