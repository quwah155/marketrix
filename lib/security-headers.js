const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

function applySecurityHeaders(response) {
  for (const { key, value } of SECURITY_HEADERS) {
    response.headers.set(key, value);
  }

  return response;
}

module.exports = {
  SECURITY_HEADERS,
  applySecurityHeaders,
};
