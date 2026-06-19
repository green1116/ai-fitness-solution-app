export function isValidOrganizationName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 120;
}
