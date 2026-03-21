export const hasAnyRole = (
  authorizedRoles: string[],
  context: { auth?: { token: { roles?: string[] } } }
) => {
  if (!context.auth || !context.auth.token.roles) return false;
  const userRoles = context.auth.token.roles;
  const authorization = authorizedRoles.reduce(
    (authorized: boolean, role: string) => {
      if (userRoles.includes(role)) return true;
      else return authorized;
    },
    false
  );
  return authorization;
};
