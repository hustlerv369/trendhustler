// TrendHustler — central configuration
// Tunable knobs for the trend engine live here so the "how it works" is in one place.

export const WINDOWS = {
  NOW_DAYS: 2,   // "right now" window — last 48h
  BASE_DAYS: 7,  // baseline window — the 7 days before the NOW window (days 2..9 ago)
};

// Each source belongs to a "camp":
//   dev        -> underground / early signal (where trends are born)
//   mainstream -> hype / mass-media signal (where trends go to die)
// weight = how loudly this source counts toward its camp's score.
export const SOURCES = {
  hackernews:  { camp: 'dev',        weight: 1.0, label: 'Hacker News' },
  github:      { camp: 'dev',        weight: 1.6, label: 'GitHub' },
  arxiv:       { camp: 'dev',        weight: 1.3, label: 'arXiv' },
  huggingface: { camp: 'dev',        weight: 1.3, label: 'Hugging Face' },
  devto:       { camp: 'dev',        weight: 0.6, label: 'Dev.to' },
  reddit:      { camp: 'dev',        weight: 1.1, label: 'Reddit' },
  producthunt: { camp: 'dev',        weight: 0.7, label: 'Product Hunt' },
  youtube:     { camp: 'mainstream', weight: 0.5, label: 'YouTube' },
  googlenews:  { camp: 'mainstream', weight: 1.0, label: 'Google News' },
};

// Scoring thresholds — the heart of the lifecycle classification.
export const ENGINE = {
  // Saturation = mainstream share of all chatter. 0 = pure underground, 1 = pure mass media.
  SATURATION_RISING_MAX: 0.45,   // below this + growing = still a gem
  SATURATION_PEAK_MAX:   0.68,   // between rising and this = peaking
  // anything >= SATURATION_PEAK_MAX is "mainstream / saturated"

  // Mainstream (Google News) emits far more raw items than the underground does,
  // so we damp it before comparing — otherwise everything reads "saturated".
  HYPE_SCALE: 0.18,

  // Momentum is bounded: mom = (now - base) / (now + base + SMOOTH)  ∈ (-1, 1).
  // This kills the "+999%" blowups when a baseline window is thin.
  SMOOTH: 1.2,

  EMBRYO_MAX_VOLUME: 3,          // tiny underground footprint = still embryonic
  POSTING_WINDOW_CAP: 60,        // clamp posting-window estimate to this many days

  PRICE_MIN: 12,                 // scaled "stock price" range for flavor
  PRICE_MAX: 9999,

  MAX_NEWS_TICKERS: 45,          // only check mainstream coverage for the top-N dev-surfaced tickers
  MAX_EVIDENCE_PER_TICKER: 6,    // how many real source links to attach

  EMERGING_MIN_DOCS: 4,          // a new term must appear in >= this many NOW items
  EMERGING_MIN_SOURCES: 2,       // ...across >= this many distinct sources (cross-corroboration)
  EMERGING_MAX: 15,              // cap promoted emerging tickers
};

// Broad seed queries used to pull a wide net of recent items from each dev source.
// We fetch broadly, then classify locally into tickers — far fewer requests than per-topic querying.
export const DEV_SEED_QUERIES = ['AI', 'LLM', 'agent', 'model', 'machine learning', 'neural'];

// Curated ticker dictionary. symbol -> { label, aliases }
// aliases are lowercase substrings; matching is word-ish (see extract.mjs).
// The emerging n-gram detector catches hot topics that aren't in this list.
export const TICKERS = {
  MCP:           { label: 'Model Context Protocol', aliases: ['model context protocol', 'mcp server', 'mcp '] },
  AGENTS:        { label: 'AI Agents',               aliases: ['ai agent', 'agentic', 'autonomous agent', 'agent framework'] },
  MULTIAGENT:    { label: 'Multi-Agent Systems',     aliases: ['multi-agent', 'multi agent', 'autogen', 'crewai', 'agent swarm'] },
  COMPUTERUSE:   { label: 'Computer Use / Browser Agents', aliases: ['computer use', 'computer-use', 'browser agent', 'browser-use'] },
  RAG:           { label: 'Retrieval-Augmented Gen', aliases: ['retrieval augmented', 'retrieval-augmented', ' rag ', 'rag pipeline'] },
  GRAPHRAG:      { label: 'GraphRAG',                aliases: ['graphrag', 'graph rag'] },
  VOICE:         { label: 'Voice AI',                aliases: ['voice agent', 'voice ai', 'speech to speech', 'realtime voice', 'speech-to-speech'] },
  REASONING:     { label: 'Reasoning Models',        aliases: ['reasoning model', 'chain of thought', 'test-time compute', 'reasoning llm', 'inference-time'] },
  DIFFUSIONLLM:  { label: 'Diffusion LLMs',          aliases: ['diffusion llm', 'diffusion language model', 'text diffusion'] },
  MAMBA:         { label: 'State Space / Mamba',     aliases: ['mamba', 'state space model', 'state-space', ' ssm '] },
  MOE:           { label: 'Mixture of Experts',      aliases: ['mixture of experts', ' moe ', 'mixture-of-experts'] },
  MULTIMODAL:    { label: 'Multimodal / VLM',        aliases: ['multimodal', 'vision language', 'vision-language', ' vlm '] },
  FINETUNE:      { label: 'Fine-tuning / LoRA',      aliases: ['fine-tuning', 'fine tuning', 'lora', 'qlora', 'peft'] },
  QUANT:         { label: 'Quantization',            aliases: ['quantization', 'gguf', '4-bit', 'gptq', ' awq'] },
  LOCALLLM:      { label: 'Local / On-device LLMs',  aliases: ['local llm', 'on-device', 'llama.cpp', 'ollama', 'lm studio'] },
  OPENWEIGHTS:   { label: 'Open-Weight Models',      aliases: ['open weights', 'open-weight', 'open-source model', 'open model', 'open source llm'] },
  SLM:           { label: 'Small Language Models',   aliases: ['small language model', ' slm ', 'tiny model', 'small model'] },
  DISTILL:       { label: 'Distillation',            aliases: ['distillation', 'distilled model', 'model distillation'] },
  CONTEXT:       { label: 'Long Context',            aliases: ['context window', 'long context', 'million token', 'long-context'] },
  EMBEDDINGS:    { label: 'Embeddings',              aliases: ['embedding model', 'embeddings', 'text embedding'] },
  VECTORDB:      { label: 'Vector Databases',        aliases: ['vector database', 'pinecone', 'weaviate', 'qdrant', 'pgvector', 'vector store'] },
  CODEGEN:       { label: 'AI Coding / SWE Agents',  aliases: ['code generation', 'coding agent', 'code assistant', 'swe-bench', 'copilot', 'cursor ide', 'vibe coding'] },
  PROMPTENG:     { label: 'Prompt Engineering',      aliases: ['prompt engineering', 'prompting', 'system prompt'] },
  TOOLCALL:      { label: 'Tool / Function Calling', aliases: ['tool calling', 'function calling', 'tool-use', 'tool use'] },
  MEMORY:        { label: 'Agent Memory',            aliases: ['agent memory', 'long-term memory', 'ai memory', 'persistent memory'] },
  EVALS:         { label: 'Evals & Benchmarks',      aliases: ['eval', 'benchmark', 'leaderboard', 'evaluation harness'] },
  SAFETY:        { label: 'AI Safety / Alignment',   aliases: ['ai safety', 'alignment', 'interpretability', 'red team'] },
  SYNTHDATA:     { label: 'Synthetic Data',          aliases: ['synthetic data', 'synthetic dataset'] },
  ROBOTICS:      { label: 'Robotics / Embodied AI',  aliases: ['robotics', 'humanoid', 'embodied ai', 'embodied agent'] },
  WORLDMODEL:    { label: 'World Models',            aliases: ['world model', 'world models'] },
  AGI:           { label: 'AGI / Superintelligence', aliases: [' agi ', 'superintelligence', 'artificial general'] },
  SORA:          { label: 'AI Video Generation',     aliases: ['text to video', 'text-to-video', 'video generation', 'sora', 'video model'] },
  IMAGEGEN:      { label: 'AI Image Generation',     aliases: ['image generation', 'text to image', 'text-to-image', 'flux model', 'stable diffusion', 'midjourney'] },
  SPECDECODE:    { label: 'Speculative Decoding',    aliases: ['speculative decoding', 'speculative sampling'] },
  KVCACHE:       { label: 'KV-Cache Optimization',   aliases: ['kv cache', 'kv-cache', 'paged attention', 'flashattention', 'flash attention'] },
  LLAMA:         { label: 'Llama',                   aliases: ['llama 3', 'llama 4', 'llama3', 'llama4', 'meta llama'] },
  QWEN:          { label: 'Qwen',                    aliases: ['qwen'] },
  DEEPSEEK:      { label: 'DeepSeek',                aliases: ['deepseek'] },
  MISTRAL:       { label: 'Mistral',                 aliases: ['mistral', 'mixtral'] },
  GEMINI:        { label: 'Gemini',                  aliases: ['gemini'] },
  CLAUDE:        { label: 'Claude / Anthropic',      aliases: ['claude ', 'anthropic'] },
  GPT:           { label: 'GPT / OpenAI',            aliases: ['gpt-4', 'gpt-5', 'gpt4', 'gpt5', 'openai o1', 'openai o3', 'chatgpt'] },
  GROK:          { label: 'Grok / xAI',              aliases: ['grok', 'xai '] },
  N8N:           { label: 'AI Workflow Automation',  aliases: ['n8n', 'workflow automation', 'ai workflow', 'zapier ai'] },
  RL:            { label: 'RL / RLHF',               aliases: ['rlhf', 'reinforcement learning from human', ' grpo ', ' ppo ', 'reward model'] },
};

// Words too generic to ever be an "emerging" ticker on their own.
export const STOPWORDS = new Set([
  'the','a','an','and','or','but','for','with','to','of','in','on','at','by','from','as','is','are','be','was','were','this','that','these','those',
  'how','why','what','when','where','who','which','your','you','i','we','they','it','its','our','my','me','using','use','used','new','best','top',
  'guide','tutorial','intro','introduction','show','hn','ask','tell','built','build','building','make','making','first','open','source','data',
  'model','models','ai','llm','llms','gpt','machine','learning','deep','neural','network','networks','system','systems','app','apps','tool','tools',
  'paper','papers','research','project','code','python','javascript','rust','release','released','version','update','blog','post','article','via',
  // common English / generic-tech words that slipped through as junk tickers
  'company','companies','business','startup','startups','cost','costs','cloud','week','weekly','today','tomorrow','yesterday','news','time','times',
  'year','years','day','days','month','world','people','person','work','working','works','thing','things','way','ways','need','needs','want','wants',
  'just','about','after','before','into','onto','over','under','more','less','most','much','many','some','any','all','every','also','here','there',
  'then','than','now','get','got','getting','gets','made','really','very','even','still','back','going','goes','good','great','better','big','small',
  'free','full','real','true','false','high','low','fast','slow','easy','hard','simple','complex','help','helps','helping','find','finds','create',
  'created','creating','run','running','runs','start','started','starts','stop','stops','introducing','announcing','announces','meet','million',
  'billion','money','market','markets','future','power','powered','based','done','doing','does','dont','cant','wont','will','would','could','should',
  'one','two','three','first','second','next','last','part','set','sets','live','case','study','example','examples','review','reviews','idea','ideas',
  'team','teams','user','users','day','line','lines','file','files','page','pages','site','sites','web','app','game','games','story','stories',
]);
