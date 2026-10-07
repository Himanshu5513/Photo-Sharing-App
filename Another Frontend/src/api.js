const API_ROOT = "/api/auth";

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_ROOT}${path}`, {
      credentials: "include",
      ...options,
    });
  } catch {
    throw new Error(
      "Could not reach the backend. Check that it is running and try again.",
    );
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      data.msg || "Something went wrong. Please try again.",
    );
    error.status = response.status;
    throw error;
  }
  return data;
}

function sendJson(path, values) {
  return request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}

export function register(values) {
  return sendJson("/register", values);
}
export function login(values) {
  return sendJson("/login", values);
}
export function getFeed() {
  return request("/feed");
}
export function createPost(formData) {
  return request("/post", { method: "POST", body: formData });
}
