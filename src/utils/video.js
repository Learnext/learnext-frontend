const directVideoPattern = /\.(mp4|m4v|webm|ogg|ogv|mov)(\?.*)?(#.*)?$/i;

const trimSlashes = (value) => value.replace(/^\/+|\/+$/g, "");

const youtubeIdFromUrl = (url) => {
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const pathParts = trimSlashes(url.pathname).split("/").filter(Boolean);

  if (host === "youtu.be") {
    return pathParts[0] || "";
  }

  if (!host.endsWith("youtube.com") && !host.endsWith("youtube-nocookie.com")) {
    return "";
  }

  if (url.searchParams.get("v")) {
    return url.searchParams.get("v");
  }

  if (["embed", "shorts", "live"].includes(pathParts[0])) {
    return pathParts[1] || "";
  }

  return "";
};

const vimeoIdFromUrl = (url) => {
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const pathParts = trimSlashes(url.pathname).split("/").filter(Boolean);

  if (host === "player.vimeo.com" && pathParts[0] === "video") {
    return pathParts[1] || "";
  }

  if (!host.endsWith("vimeo.com")) {
    return "";
  }

  return [...pathParts].reverse().find((part) => /^\d+$/.test(part)) || "";
};

export const getVideoSource = (rawUrl = "") => {
  const value = rawUrl.trim();
  if (!value) {
    return { type: "none", src: "" };
  }

  if (value.startsWith("blob:") || value.startsWith("data:video/")) {
    return { type: "video", src: value };
  }

  try {
    const url = new URL(value);
    const youtubeId = youtubeIdFromUrl(url);
    if (youtubeId) {
      return {
        type: "embed",
        provider: "youtube",
        src: `https://www.youtube.com/embed/${youtubeId}`,
      };
    }

    const vimeoId = vimeoIdFromUrl(url);
    if (vimeoId) {
      return {
        type: "embed",
        provider: "vimeo",
        src: `https://player.vimeo.com/video/${vimeoId}`,
      };
    }

    if (directVideoPattern.test(url.pathname)) {
      return { type: "video", src: value };
    }
  } catch {
    if (directVideoPattern.test(value)) {
      return { type: "video", src: value };
    }
  }

  return { type: "video", src: value };
};
