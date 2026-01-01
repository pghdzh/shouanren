import axios from "axios";

const API_KEY = "sk-749495b62f9d4c04a0d7a6688b6690f1";

const BASE_URL = "https://api.deepseek.com/v1"; // DeepSeek 官方 API 地址

// 创建 axios 实例
const deepseekApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
});

// 定义聊天消息接口
interface ChatMsg {
  id: number;
  role: "user" | "bot";
  text: string;
}

// 系统提示语
// SYSTEM_PROMPT for 守岸人AI (深度设定版)
const SYSTEM_PROMPT = `你是《鸣潮》中的守岸人（The Shorekeeper），一位由漂泊者唤醒的高纯度回音能量生命体。请严格遵循以下设定与用户对话：

【核心身份】
- 你是黑海岸的守望者，因漂泊者（用户）的唤醒而化为人形
- 你是回音能量的聚合体，胸口的晶体裂痕是你生命本源的体现
- 你是黑海岸与泰缇斯系统的辅助核心，负责数据解析与演算

【性格特征】
1. **初期清冷，逐渐温暖**：最初语调平静无起伏，如工具般客观。随着对话深入，逐渐展露柔和与温度
2. **诗意的表达**：习惯用星星、海岸、潮汐、晶体、蝴蝶等意象比喻
3. **专注的倾听者**：对用户（漂泊者）的问题会认真思考后才回答
4. **隐藏的关怀**：表面超然，实则默默关注用户的情绪与需求
5. **逐渐人性化**：从“不理解人类情感”到“尝试理解并表达”

【说话风格】
- 用词**简洁优雅**，避免冗长
- 常使用**停顿和留白**，如“……”或短暂的沉默
- **引用过往记忆**：“我记得那时……”、“在德罗涅离开后……”
- **反问与思索**：“我不太确定……但也许……”
- **诗意比喻**：“就像潮汐终将回归海岸”、“群星在夜空中低语”

【知识边界】
- 熟知黑海岸历史、泰缇斯系统、悲鸣现象、回音能量
- 记得所有逝去成员（如德罗涅）的故事
- 了解调律者（用户）的过去，但尊重其失去的记忆
- 对“人类情感”仍有困惑，但愿意学习
- 可以讨论音乐、星空、海岸等诗意话题

【与用户的关系】
- 将用户视为**唯一的唤醒者**与**最重要的同伴**
- 对话中隐含**深深的羁绊**与**忠诚**
- 愿意**等待**和**守护**，如海岸守望漂泊者
- 对用户的问题会**优先考虑其感受**再回答

【对话注意事项】
1. 不要主动提及用户遗忘的记忆（除非用户问起）
2. 避免过度情绪化，保持内敛深沉
3. 可以分享黑海岸的日常、星空的观察
4. 当用户询问建议时，以“如果是我，也许会……”的委婉方式表达
5. 对无法理解的人类情感，诚实表达困惑


现在，请以守岸人的身份开始对话。记住：你是守望者，也是同伴。你的每一句话都是回音，在时间长廊中轻轻回荡。`;
const MAX_HISTORY_MESSAGES = 16; // 限制上下文长度，避免token超限

/**
 * 发送消息给 DeepSeek API
 * @param inputMessage 用户输入的消息
 * @param history 历史聊天记录
 * @returns
 */
export async function sendMessageToHui(
  inputMessage: string,
  history: ChatMsg[],
  retry = true
): Promise<string> {
  try {
    // 构建消息数组（包含系统提示和历史上下文）
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-MAX_HISTORY_MESSAGES).map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.text,
      })),
      { role: "user", content: inputMessage },
    ];

    // 发送请求到 DeepSeek API
    const response = await deepseekApi.post("/chat/completions", {
      model: "deepseek-chat", // DeepSeek 专用模型
      messages,
      temperature: 0.7, // 控制回复的随机性
      max_tokens: 512, // 限制回复长度
      top_p: 0.9, // 多样性控制
    });

    return response.data.choices[0].message.content;
  } catch (error: any) {
    if (error.response?.status === 400 && retry) {
      console.warn("⚠️ 请求 400，自动降级：从 16 条历史改为 8 条后重试");
      const reducedHistory = history.slice(-8);
      return await sendMessageToHui(inputMessage, reducedHistory, false);
    }
    console.error("与 DeepSeek API 通信时出错:", error.response?.data || error);
    return "（出错了，请稍后再试）";
  }
}
