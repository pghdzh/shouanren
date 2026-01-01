import http from "../axios";

/**
 * 获取词条列表（分页 + 搜索）
 * @param params { page?: number, pageSize?: number, search?: string, character_key?: string }
 */
export const getWikiList = (params: any = {}) => {
  const safeParams = {
    ...params,
    // 如果没有传 character_key（undefined 或 空串也算未传），默认取 'shou'
    character_key: "shou",
  };
  return http.get("/api/wiki", safeParams);
};

/**
 * 新建词条
 * @param data { title: string, slug?: string, author?: string, content: string, character_key?: string }
 */
export const createWiki = (data: any) => {
  const safeData = {
    ...data,
    // 不传或传空串则默认 'shou'
    character_key: "shou",
  };
  return http.post("/api/wiki", safeData);
};

/**
 * 编辑词条
 * @param id 词条 ID
 * @param data { title?: string, slug?: string, author?: string, content?: string, character_key?: string }
 */
export const updateWiki = (id: string | number, data: any) => {
  // 如果明确传了 character_key（可能为空串），把空串替换为默认 'shou'
  // 如果没有传 character_key，则不在这里强制填充（后端会保留原值或补默认）
  const safeData = {
    ...data,
  };

  if (data.character_key !== undefined) {
    safeData.character_key = "shou";
  }

  return http.put(`/api/wiki/${id}`, safeData);
};

/**
 * 删除词条
 * @param id 词条 ID
 */
export const deleteWiki = (id: string | number) => {
  return http.delete(`/api/wiki/${id}`);
};

/**
 * 点赞词条
 * @param id 词条 ID
 * @param action 'like' | 'unlike' | 'toggle' 默认 toggle
 */
export const likeWiki = (
  id: string | number,
  action: "like" | "unlike" | "toggle" = "toggle"
) => {
  return http.post(`/api/wiki/${id}/like`, { action });
};
