/**
 * @typedef {'工具' | '开源'} CatalogKind
 * @typedef {'对话与写作' | '图像与视频' | '开发与自动化' | '模型与平台'} CatalogCategory
 * @typedef {Object} CatalogItem
 * @property {string} id Stable UI key for search results and links.
 * @property {string} name Display name of the AI resource.
 * @property {CatalogKind} kind Resource type used by section filters.
 * @property {CatalogCategory} category Reader-facing usage category.
 * @property {string} label Compact resource label displayed on the card.
 * @property {string} description Reader-oriented resource summary.
 * @property {string} metric Current heat or usage signal.
 * @property {string} accent Card accent token.
 * @property {string} url Canonical official or project destination.
 */

/** @type {CatalogItem[]} Curated starter catalogue rendered across resource sections. */
export const catalog = [
  {
    id: 'mcp-market',
    name: 'MCP Market',
    kind: '开源',
    category: '开发与自动化',
    label: 'MCP',
    description: '发现适配模型上下文协议的 MCP 服务目录，可连接模型、工具与数据源。',
    metric: '本周 +32%',
    accent: 'cyan',
    url: 'https://github.com/modelcontextprotocol/servers',
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    kind: '工具',
    category: '开发与自动化',
    label: 'CC',
    description: '在终端中理解代码库、执行任务并协助交付。',
    metric: '开发者热度 1',
    accent: 'lime',
    url: 'https://www.anthropic.com/claude-code',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    kind: '工具',
    category: '开发与自动化',
    label: 'CU',
    description: '面向真实项目上下文的 AI 代码编辑器。',
    metric: '持续上升',
    accent: 'blue',
    url: 'https://www.cursor.com/',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    kind: '工具',
    category: '模型与平台',
    label: 'DS',
    description: '国产高性能推理模型与开发者 API 平台。',
    metric: '国内关注度高',
    accent: 'violet',
    url: 'https://www.deepseek.com/',
  },
  {
    id: 'kling',
    name: '可灵 AI',
    kind: '工具',
    category: '图像与视频',
    label: 'KL',
    description: '生成视频、延展镜头并控制角色运动。',
    metric: '视频创作热门',
    accent: 'coral',
    url: 'https://klingai.kuaishou.com/',
  },
  {
    id: 'notion-ai',
    name: 'Notion AI',
    kind: '工具',
    category: '对话与写作',
    label: 'NO',
    description: '在文档、知识库和项目记录中协作写作。',
    metric: '效率工具',
    accent: 'sand',
    url: 'https://www.notion.so/product/ai',
  },
  {
    id: 'langchain',
    name: 'LangChain',
    kind: '开源',
    category: '开发与自动化',
    label: 'LC',
    description: '构建 Agent、工作流与检索增强应用的开源框架。',
    metric: 'GitHub 113k',
    accent: 'green',
    url: 'https://github.com/langchain-ai/langchain',
  },
  {
    id: 'comfyui',
    name: 'ComfyUI',
    kind: '开源',
    category: '图像与视频',
    label: 'UI',
    description: '用可视化节点工作流精细控制图像生成。',
    metric: 'GitHub 82k',
    accent: 'orange',
    url: 'https://github.com/Comfy-Org/ComfyUI',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    kind: '开源',
    category: '模型与平台',
    label: 'OL',
    description: '在本机快速运行、切换和管理开源大模型。',
    metric: 'GitHub 157k',
    accent: 'black',
    url: 'https://github.com/ollama/ollama',
  },
  {
    id: 'skills-sh',
    name: 'Skills.sh',
    kind: '开源',
    category: '开发与自动化',
    label: 'SK',
    description: '面向编码 Agent 的可发现、可复用任务技能目录。',
    metric: '本周新上榜',
    accent: 'pink',
    url: 'https://skills.sh/',
  },
  {
    id: 'chatgpt', name: 'ChatGPT', kind: '工具', category: '对话与写作', label: 'GPT',
    description: '覆盖写作、分析、研究和多模态协作的通用 AI 工作台。', metric: '通用工作流', accent: 'green', url: 'https://chatgpt.com/',
  },
  {
    id: 'gemini', name: 'Gemini', kind: '工具', category: '模型与平台', label: 'GM',
    description: 'Google 的多模态模型与个人、团队协作入口。', metric: '多模态能力', accent: 'blue', url: 'https://gemini.google.com/',
  },
  {
    id: 'perplexity', name: 'Perplexity', kind: '工具', category: '对话与写作', label: 'PX',
    description: '以来源引用为核心体验的 AI 搜索与研究工具。', metric: '研究型搜索', accent: 'cyan', url: 'https://www.perplexity.ai/',
  },
  {
    id: 'midjourney', name: 'Midjourney', kind: '工具', category: '图像与视频', label: 'MJ',
    description: '面向视觉探索、概念设计和风格图像生成的平台。', metric: '视觉创作热门', accent: 'violet', url: 'https://www.midjourney.com/',
  },
  {
    id: 'runway', name: 'Runway', kind: '工具', category: '图像与视频', label: 'RW',
    description: '围绕生成视频、镜头控制和后期制作的创作工具。', metric: '视频工作流', accent: 'coral', url: 'https://runwayml.com/',
  },
  {
    id: 'v0', name: 'v0', kind: '工具', category: '开发与自动化', label: 'V0',
    description: '从产品描述快速生成可迭代界面的前端原型工具。', metric: 'UI 原型', accent: 'black', url: 'https://v0.dev/',
  },
  {
    id: 'windsurf', name: 'Windsurf', kind: '工具', category: '开发与自动化', label: 'WS',
    description: '面向代码库上下文的 AI IDE 与连续开发 Agent。', metric: '编码协作', accent: 'blue', url: 'https://codeium.com/windsurf',
  },
  {
    id: 'lovable', name: 'Lovable', kind: '工具', category: '开发与自动化', label: 'LV',
    description: '将产品想法转成可访问 Web 应用的 AI 构建工具。', metric: '应用生成', accent: 'pink', url: 'https://lovable.dev/',
  },
  {
    id: 'manus', name: 'Manus', kind: '工具', category: '开发与自动化', label: 'MN',
    description: '可拆解长任务、使用工具并交付结果的通用 Agent。', metric: '任务执行', accent: 'lime', url: 'https://manus.im/',
  },
  {
    id: 'feishu-ai', name: '飞书智能伙伴', kind: '工具', category: '对话与写作', label: 'FS',
    description: '结合文档、知识库和协作流程的团队级 AI 助手。', metric: '团队协作', accent: 'sand', url: 'https://www.feishu.cn/product/ai',
  },
  {
    id: 'github-copilot', name: 'GitHub Copilot', kind: '工具', category: '开发与自动化', label: 'GC',
    description: '嵌入 IDE、终端和代码评审流程的编程助手。', metric: '开发者常用', accent: 'green', url: 'https://github.com/features/copilot',
  },
  {
    id: 'dify', name: 'Dify', kind: '开源', category: '开发与自动化', label: 'DF',
    description: '提供可视化工作流、RAG 与应用发布能力的 LLMOps 平台。', metric: 'GitHub 100k+', accent: 'cyan', url: 'https://github.com/langgenius/dify',
  },
  {
    id: 'n8n', name: 'n8n', kind: '开源', category: '开发与自动化', label: 'N8',
    description: '可自托管的工作流自动化平台，适合连接 AI 与业务系统。', metric: '自动化工作流', accent: 'orange', url: 'https://github.com/n8n-io/n8n',
  },
  {
    id: 'open-webui', name: 'Open WebUI', kind: '开源', category: '模型与平台', label: 'OW',
    description: '适配本地与远程大模型的自托管聊天界面。', metric: '本地模型入口', accent: 'black', url: 'https://github.com/open-webui/open-webui',
  },
  {
    id: 'litellm', name: 'LiteLLM', kind: '开源', category: '模型与平台', label: 'LL',
    description: '统一不同模型供应商调用方式的轻量代理与网关。', metric: '模型网关', accent: 'violet', url: 'https://github.com/BerriAI/litellm',
  },
  {
    id: 'ragflow', name: 'RAGFlow', kind: '开源', category: '开发与自动化', label: 'RF',
    description: '面向复杂文档解析与可引用检索增强的开源引擎。', metric: '文档 RAG', accent: 'blue', url: 'https://github.com/infiniflow/ragflow',
  },
  {
    id: 'flowise', name: 'Flowise', kind: '开源', category: '开发与自动化', label: 'FL',
    description: '用拖拽方式搭建 LLM 应用、Agent 与编排工作流。', metric: '可视化编排', accent: 'pink', url: 'https://github.com/FlowiseAI/Flowise',
  },
  {
    id: 'llama-index', name: 'LlamaIndex', kind: '开源', category: '开发与自动化', label: 'LI',
    description: '帮助 LLM 应用接入私有数据、检索与 Agent 工具。', metric: '数据框架', accent: 'green', url: 'https://github.com/run-llama/llama_index',
  },
  {
    id: 'vllm', name: 'vLLM', kind: '开源', category: '模型与平台', label: 'VL',
    description: '高吞吐的开源模型推理与服务框架。', metric: '推理部署', accent: 'coral', url: 'https://github.com/vllm-project/vllm',
  },
  {
    id: 'mistral', name: 'Mistral AI', kind: '开源', category: '模型与平台', label: 'MI',
    description: '提供开放权重模型、API 与本地部署选择的模型生态。', metric: '开放权重', accent: 'lime', url: 'https://github.com/mistralai',
  },
  {
    id: 'whisper', name: 'Whisper', kind: '开源', category: '对话与写作', label: 'WH',
    description: '将语音转录为文本的开源语音识别模型与工具集。', metric: '语音转写', accent: 'sand', url: 'https://github.com/openai/whisper',
  },
  {
    id: 'stable-diffusion', name: 'Stable Diffusion', kind: '开源', category: '图像与视频', label: 'SD',
    description: '开放图像生成生态，适合本地推理与定制化工作流。', metric: '图像模型', accent: 'violet', url: 'https://github.com/Stability-AI/stablediffusion',
  },
];

/**
 * @typedef {Object} TrendProject
 * @property {string} name Repository or project display name.
 * @property {string} description Concise project usage statement.
 * @property {string} language Main implementation language or category.
 * @property {string} stars Reader-facing popularity metric.
 * @property {string} change Activity movement for the selected time window.
 * @property {string} url Direct project destination.
 */

/** Baseline projects reused with time-window-specific activity figures in the trend board. @type {TrendProject[]} */
const githubTrendProjects = [
  { name: 'langgenius/dify', description: '开源 LLM 应用开发平台', language: 'TypeScript', stars: '111k', change: '+2,841', url: 'https://github.com/langgenius/dify' },
  { name: 'microsoft/markitdown', description: '将各类文件转换为 Markdown', language: 'Python', stars: '65k', change: '+2,105', url: 'https://github.com/microsoft/markitdown' },
  { name: 'Comfy-Org/ComfyUI', description: '节点式图像生成工作流', language: 'Python', stars: '87k', change: '+1,922', url: 'https://github.com/Comfy-Org/ComfyUI' },
  { name: 'modelcontextprotocol/servers', description: '官方 MCP 服务参考实现', language: 'TypeScript', stars: '71k', change: '+1,688', url: 'https://github.com/modelcontextprotocol/servers' },
  { name: 'ollama/ollama', description: '本地运行与管理大模型', language: 'Go', stars: '171k', change: '+1,405', url: 'https://github.com/ollama/ollama' },
  { name: 'browser-use/browser-use', description: '网页浏览与操作 Agent', language: 'Python', stars: '68k', change: '+1,216', url: 'https://github.com/browser-use/browser-use' },
  { name: 'n8n-io/n8n', description: '可自托管的自动化工作流', language: 'TypeScript', stars: '123k', change: '+1,109', url: 'https://github.com/n8n-io/n8n' },
  { name: 'BerriAI/litellm', description: '统一大模型 API 网关', language: 'Python', stars: '31k', change: '+947', url: 'https://github.com/BerriAI/litellm' },
  { name: 'infiniflow/ragflow', description: '深度文档理解 RAG 引擎', language: 'Python', stars: '50k', change: '+833', url: 'https://github.com/infiniflow/ragflow' },
  { name: 'vllm-project/vllm', description: '高性能大模型推理服务', language: 'Python', stars: '51k', change: '+726', url: 'https://github.com/vllm-project/vllm' },
];

/**
 * Creates a ranked window from baseline projects without duplicating project metadata.
 * @param {number} multiplier Window-specific activity multiplier.
 * @param {number} offset Rotation offset that gives each time window an independent ordering.
 * @returns {TrendProject[]} Ten direct-link rank entries.
 */
function createTrendWindow(multiplier, offset) {
  return githubTrendProjects.map((project, index) => {
    const orderedProject = githubTrendProjects[(index + offset) % githubTrendProjects.length];
    const rawChange = Number(project.change.replace(/[^0-9]/g, ''));
    return { ...orderedProject, change: `+${Math.round(rawChange * multiplier).toLocaleString('en-US')}` };
  });
}

/** Multi-source open-source leaderboard data for daily, weekly, and monthly browsing. */
export const trendingBoards = {
  GitHub: { daily: createTrendWindow(1, 0), weekly: createTrendWindow(4.6, 3), monthly: createTrendWindow(15.2, 6) },
  'Hugging Face': { daily: createTrendWindow(.72, 2), weekly: createTrendWindow(3.2, 5), monthly: createTrendWindow(11.1, 8) },
  ModelScope: { daily: createTrendWindow(.48, 4), weekly: createTrendWindow(2.5, 7), monthly: createTrendWindow(8.6, 1) },
};

/**
 * @typedef {Object} Story
 * @property {string} type Editorial content type.
 * @property {string} title Article headline.
 * @property {string} summary Brief story context.
 * @property {string} source Publication or source label.
 * @property {string} time Relative update time.
 * @property {string} theme Visual story treatment.
 */

/** @type {Story[]} Editorial news shown in the homepage lead rail. */
export const featuredStories = [
  {
    type: '深度观察',
    title: 'AI Agent 开始进入真实的生产流程',
    summary: '从独立问答走向连接工具、拆解任务与持续执行，开发者工作流正在重新排列。',
    source: 'AI Radar 编辑部',
    time: '18 分钟前',
    theme: 'signal',
  },
  {
    type: '产品动态',
    title: '视频生成工具的控制能力，正在成为分水岭',
    summary: '镜头、角色和节奏的可控性，开始取代单次生成的惊艳感。',
    source: '量子位',
    time: '43 分钟前',
    theme: 'frame',
  },
  {
    type: '开源速递',
    title: '本周 GitHub 上值得留意的 8 个 AI 项目',
    summary: '从 Agent 工具调用到本地模型运行，整理真正能上手的项目。',
    source: 'GitHub Trending',
    time: '今天 09:20',
    theme: 'grid',
  },
];

/** Full editorial stream used by the dedicated news route. */
export const newsStories = [
  {
    id: 'agent-production',
    type: '深度观察',
    title: 'AI Agent 开始进入真实的生产流程',
    summary: '从独立问答走向连接工具、拆解任务与持续执行，开发者工作流正在重新排列。',
    source: 'AI Radar 编辑部',
    time: '18 分钟前',
    theme: 'signal',
  },
  {
    id: 'model-context',
    type: '模型与 API',
    title: '长上下文竞争进入可用性阶段，开发者开始关注稳定调用',
    summary: '模型厂商持续扩大上下文窗口，但工具调用、成本控制与复杂任务稳定性成为新一轮比较重点。',
    source: '机器之心',
    time: '32 分钟前',
    theme: 'model',
  },
  {
    id: 'mcp-guidance',
    type: '开发工具',
    title: 'MCP 服务目录持续扩展，团队开始整理可复用的工具组合',
    summary: '从文件系统到数据库与内部知识库，模型连接外部工具的边界正在变得更明确。',
    source: 'GitHub Trending',
    time: '47 分钟前',
    theme: 'protocol',
  },
  {
    id: 'openai-workflow',
    type: '官方更新',
    title: 'OpenAI 更新开发者工作流指南，强调评估与可观测性',
    summary: '新指南将重点放在任务边界、工具失败处理和离线评估，帮助团队从原型走向可维护的应用。',
    source: 'OpenAI Developers',
    time: '1 小时前',
    theme: 'official',
  },
  {
    id: 'video-control',
    type: '产品动态',
    title: '视频生成工具的控制能力，正在成为分水岭',
    summary: '镜头、角色和节奏的可控性，开始取代单次生成的惊艳感。',
    source: '量子位',
    time: '1 小时前',
    theme: 'frame',
  },
  {
    id: 'open-source-week',
    type: '开源速递',
    title: '本周 GitHub 上值得留意的 8 个 AI 项目',
    summary: '从 Agent 工具调用到本地模型运行，整理真正能上手的项目。',
    source: 'GitHub Trending',
    time: '今天 09:20',
    theme: 'grid',
  },
  {
    id: 'local-inference',
    type: '开源速递',
    title: '本地推理框架开始把焦点放到显存与多模型调度',
    summary: '桌面端模型使用不再只追求跑起来，工作流编排、缓存和硬件适配成为新的体验差异。',
    source: 'Hugging Face',
    time: '今天 08:46',
    theme: 'local',
  },
  {
    id: 'enterprise-rag',
    type: '行业观察',
    title: '企业检索增强正在回到数据治理与权限边界',
    summary: '把知识库接给模型之后，内容时效、访问权限和回答引用逐渐成为真正需要投入的基础能力。',
    source: '36Kr',
    time: '今天 08:15',
    theme: 'enterprise',
  },
  {
    id: 'coding-agents',
    type: '开发工具',
    title: '编码 Agent 进入代码审查环节，协作方式开始变化',
    summary: '除了生成实现，团队更关心 Agent 如何解释修改范围、验证结果与潜在风险。',
    source: 'The Pragmatic Engineer',
    time: '昨天 22:48',
    theme: 'coding',
  },
  {
    id: 'multimodal-data',
    type: '模型与 API',
    title: '多模态模型的文档理解能力正在走向标准化接口',
    summary: '图表、扫描件与复杂版式的解析需求增加，开发者希望模型输出更结构化且容易复核。',
    source: 'InfoQ',
    time: '昨天 20:12',
    theme: 'document',
  },
  {
    id: 'ai-search',
    type: '产品动态',
    title: 'AI 搜索产品开始把引用来源与阅读路径作为核心体验',
    summary: '快速得到答案之外，读者仍需要理解信息来自哪里，并能够回到上下文完成判断。',
    source: '少数派',
    time: '昨天 18:36',
    theme: 'search',
  },
  {
    id: 'safety-evals',
    type: '行业观察',
    title: '模型评测开始从单项分数转向真实任务成功率',
    summary: '开发团队更重视长任务中的中断、回退和人工接管，这些指标决定模型是否适合进入业务流程。',
    source: 'MIT Technology Review',
    time: '昨天 16:04',
    theme: 'evaluation',
  },
  {
    id: 'agent-memory',
    type: '开发工具',
    title: 'Agent 记忆设计开始从“保存更多”转向“检索更准”',
    summary: '长期任务中的关键不再是堆积上下文，而是让模型在正确时机取回可验证、可过期的工作信息。',
    source: 'LangChain Blog',
    time: '昨天 14:28',
    theme: 'memory',
  },
  {
    id: 'voice-interface',
    type: '产品动态',
    title: '实时语音交互开始进入客服与销售的实际验证阶段',
    summary: '低延迟打断、语气控制和人工转接正在成为语音 Agent 是否可交付的基本门槛。',
    source: 'TechCrunch',
    time: '昨天 12:40',
    theme: 'voice',
  },
  {
    id: 'open-model-license',
    type: '模型与 API',
    title: '开源模型的商用边界成为团队选型时的第一道检查项',
    summary: '参数规模和基准成绩之外，许可证、权重获取方式与部署限制直接影响模型能否进入正式产品。',
    source: 'Hugging Face',
    time: '昨天 11:16',
    theme: 'license',
  },
  {
    id: 'mcp-security',
    type: '安全与治理',
    title: 'MCP 工具接入增加后，权限最小化成为新的工程基线',
    summary: '模型拥有工具调用能力后，服务身份、可执行范围和敏感信息脱敏需要在接入阶段就被明确。',
    source: 'Snyk',
    time: '昨天 10:02',
    theme: 'security',
  },
  {
    id: 'image-workflow',
    type: '创作与多模态',
    title: '图像生成工作流逐步从单提示词转向可复用的节点模板',
    summary: '创作者开始把构图、角色一致性和后期处理拆成可复用模块，以降低反复试错的成本。',
    source: 'ComfyUI Community',
    time: '周二 20:31',
    theme: 'creative',
  },
  {
    id: 'small-models',
    type: '模型与 API',
    title: '小参数模型在边缘设备场景中重新获得关注',
    summary: '端侧推理的部署速度、私有数据边界与成本优势，让“小而够用”的模型拥有了清晰位置。',
    source: 'VentureBeat',
    time: '周二 18:18',
    theme: 'edge',
  },
  {
    id: 'ai-design-system',
    type: '产品动态',
    title: '设计团队开始把 AI 输出接入设计系统，而非单独使用生成工具',
    summary: '组件约束、品牌变量和审核链路被提前嵌入，让生成结果更接近可被产品团队采用的资产。',
    source: 'Figma Blog',
    time: '周二 16:06',
    theme: 'design',
  },
  {
    id: 'rag-observability',
    type: '行业观察',
    title: 'RAG 上线后，答案引用与检索命中率成为日常运营指标',
    summary: '团队开始用可观测性定位知识缺口与召回偏差，而不是只在用户反馈出现后被动修复。',
    source: 'LlamaIndex',
    time: '周二 14:52',
    theme: 'observability',
  },
  {
    id: 'ai-education',
    type: '行业观察',
    title: '教育产品探索 AI 助教时，开始重新设计反馈而不是题目生成',
    summary: '即时提示、过程追问和能力诊断比一次性给出答案更能影响学习体验的真实价值。',
    source: 'EdSurge',
    time: '周二 11:34',
    theme: 'education',
  },
  {
    id: 'agent-benchmark',
    type: '开发工具',
    title: 'Agent 基准测试开始增加真实仓库与多轮任务场景',
    summary: '脱离单文件示例后，代码理解、环境约束与中间失败恢复能力更容易暴露真实差距。',
    source: 'SWE-bench',
    time: '周二 09:18',
    theme: 'benchmark',
  },
  {
    id: 'video-rights',
    type: '安全与治理',
    title: '生成视频进入商业使用后，素材来源与授权追溯被重新讨论',
    summary: '团队需要在创作效率之外，建立可追溯的素材记录与发布前审核机制。',
    source: 'Wired',
    time: '周一 21:07',
    theme: 'rights',
  },
  {
    id: 'ai-infrastructure',
    type: '开源速递',
    title: '推理基础设施项目把批处理、缓存与观测能力打包进默认工作流',
    summary: '开源部署工具的竞争正在从单纯吞吐量扩展到实际运行成本与维护体验。',
    source: 'GitHub Trending',
    time: '周一 18:25',
    theme: 'infrastructure',
  },
];

/**
 * Filters editorial stories by a reader-entered Chinese or English keyword.
 * @param {string} query Free-form global search input from the site header.
 * @returns {Story[]} Matching stories, or the full editorial rail for an empty query.
 */
export function searchStories(query) {
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN');

  if (!normalizedQuery) return featuredStories;

  return featuredStories.filter((story) => [
    story.type,
    story.title,
    story.summary,
    story.source,
  ].join(' ').toLocaleLowerCase('zh-CN').includes(normalizedQuery));
}

/**
 * Filters the complete editorial stream by a reader-entered Chinese or English keyword.
 * @param {string} query Free-form news search input.
 * @returns {Story[]} Matching news stories, or the complete stream for an empty query.
 */
export function searchNews(query) {
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN');

  if (!normalizedQuery) return newsStories;

  return newsStories.filter((story) => [
    story.type,
    story.title,
    story.summary,
    story.source,
  ].join(' ').toLocaleLowerCase('zh-CN').includes(normalizedQuery));
}

/**
 * Filters the catalogue by a reader-entered Chinese or English keyword.
 * @param {string} query Free-form search input from the site header.
 * @returns {CatalogItem[]} Matching items, or the whole catalogue for an empty query.
 */
export function searchCatalog(query) {
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN');

  if (!normalizedQuery) return catalog;

  return catalog.filter((item) => [
    item.name,
    item.kind,
    item.category,
    item.label,
    item.description,
    item.metric,
  ].join(' ').toLocaleLowerCase('zh-CN').includes(normalizedQuery));
}
