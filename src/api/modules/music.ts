// src/api/music.ts
import http from "../axios";

/**
 * 查询音乐列表（从后端接口 /api/music/list 获取）
 * @param options 可选的查询参数，最终作为 query params 发出（后端可根据需要忽略或使用）
 * @returns Promise<any> 返回后端原始响应（建议后端返回 { ok: true, list: [...] }）
 */
export const getMusicList = (options?: Record<string, any>): Promise<any> => {
  return http.get("/api/music/list", options || {});
};

/**
 * 构造音乐文件访问 URL（相对路径）
 * 说明：
 *  - 如果前端与静态文件同域，直接使用返回值赋给 audio.src 即可，例如: audio.src = getMusicUrl(name)
 *  - 若静态文件托管在不同域名/端口，请使用完整域名或把 VITE_API_BASE_URL 改为你的域名（见注释）
 *
 * @param fileName 文件名（含扩展名，例如 "01 - song.mp3"）
 * @returns string 可直接访问的相对 URL
 */
export const getMusicUrl = (fileName: string): string => {
  if (!fileName) return "";
  // 若你希望返回完整 URL（带域名），可以改为：
  // const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  // return `${base}/music/${encodeURIComponent(fileName)}`;
  return `http://36.150.237.25:3000/music/${encodeURIComponent(fileName)}`;
};

