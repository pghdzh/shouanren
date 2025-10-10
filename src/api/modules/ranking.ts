import http from "../axios";

/**
 * @function 获取排行榜（分页）
 * @param {object} params - 例如：{ page: 1, pageSize: 10 }
 */
export const getRankingList = (params: any): any => {
  return http.get("/api/rankings", params);
};

/**
 * @function 新增排行榜记录
 * @param {object} data - 例如：{ nickname: "狂三", count: 5 }
 */
export const addRankingItem = (data: {
  character_key: string;
  nickname: string;
  count?: number;
}): any => {
  return http.post("/api/rankings", data);
};
