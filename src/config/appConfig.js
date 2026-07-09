// =============================================================================
// App-level feature flags / environment configuration
// =============================================================================
//
// PUBLIC_LOGIN_ENABLED — controls whether the public login / sign-up flow is
// reachable. While SKatalyst AI is in private beta we want:
//
//   • LOCAL development  -> login works normally (so devs/admins can test OAuth)
//   • PRODUCTION         -> public login is blocked and visitors see the
//                           "Private Beta / Coming Soon" screen instead of being
//                           sent to the real OAuth provider.
//
// This is intentionally a SINGLE reversible flag. When you are ready to open
// the public beta, set REACT_APP_PUBLIC_LOGIN_ENABLED=true in
// `frontend/.env.production` (or your hosting env vars) and redeploy. No code
// changes required.
//
// Resolution order:
//   1. If REACT_APP_PUBLIC_LOGIN_ENABLED is explicitly set ("true"/"false"),
//      that value wins. This lets you override per-environment safely.
//   2. Otherwise we fall back to NODE_ENV: enabled in development, disabled in
//      production. This is a safe default — even if someone forgets to set the
//      env var, production stays locked down.
// =============================================================================

const rawFlag = process.env.REACT_APP_PUBLIC_LOGIN_ENABLED;

function resolvePublicLoginEnabled() {
  // Explicit override takes precedence (handles "true"/"false" as strings).
  if (typeof rawFlag === 'string' && rawFlag.trim() !== '') {
    return rawFlag.trim().toLowerCase() === 'true';
  }
  // Safe default: only enabled in local development.
  return process.env.NODE_ENV === 'development';
}

export const PUBLIC_LOGIN_ENABLED = resolvePublicLoginEnabled();

// Where to send users (and CTAs) when public login is disabled.
export const PRIVATE_BETA_ROUTE = '/coming-soon';

// Contact address surfaced on the Private Beta screen for invited testers /
// enterprise partners. Matches the address used in the public footer.
export const BETA_CONTACT_EMAIL = 'contact@skatalystai.com';

const appConfig = {
  PUBLIC_LOGIN_ENABLED,
  PRIVATE_BETA_ROUTE,
  BETA_CONTACT_EMAIL,
};

export default appConfig;
