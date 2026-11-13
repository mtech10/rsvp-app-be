const TOKEN_COOKIE_NAME = "auth_token";
const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const getAuthCookieOptions = () => {
  const configuredSameSite = process.env.COOKIE_SAME_SITE?.toLowerCase();
  const sameSite = ["lax", "strict", "none"].includes(configuredSameSite)
    ? configuredSameSite
    : "lax";

  // SameSite=None is only accepted by browsers for HTTPS cookies.
  const secure =
    sameSite === "none" ||
    process.env.COOKIE_SECURE === "true" ||
    process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: TOKEN_MAX_AGE_MS,
    path: "/",
  };
};

export const setAuthCookie = (res, token) =>
  res.cookie(TOKEN_COOKIE_NAME, token, getAuthCookieOptions());

export const clearAuthCookie = (res) => {
  const { maxAge, ...clearOptions } = getAuthCookieOptions();
  return res.clearCookie(TOKEN_COOKIE_NAME, clearOptions);
};

export const getAuthToken = (req) => {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const cookie = cookieHeader
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${TOKEN_COOKIE_NAME}=`));

  if (!cookie) {
    return null;
  }

  try {
    return decodeURIComponent(cookie.slice(TOKEN_COOKIE_NAME.length + 1));
  } catch {
    return null;
  }
};

export { TOKEN_COOKIE_NAME };
