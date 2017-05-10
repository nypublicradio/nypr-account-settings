export const setCookie = (
  name,
  value,
  days = 2,
  path = "/",
  domain = location.hostname
) => {
  const expires = new Date(Date.now() + days * 864e5).toGMTString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=${path}; domain=${domain}`;
};

export const getCookie = name => {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, "");
};

export const deleteCookie = (name, path) => {
  setCookie(name, "", -1, path);
};
