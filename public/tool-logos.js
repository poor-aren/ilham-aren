/* Daftar logo tools — dipakai bareng oleh situs (kartu proyek) dan admin (picker tag).
   Tag proyek di Supabase = `name` di sini (tidak peka huruf besar/kecil); `alias` buat tag lama.
   icon: "slug" = Simple Icons, "dev:x" = Devicon, "tb:x" = Tabler (yang tidak ada di Simple Icons). */
(function () {
  const G_EMB = 'Embedded & IoT', G_AI = 'AI & Data', G_WEB = 'Web & App', G_OPS = 'Cloud & Tools';
  const list = [
    // Embedded & IoT
    ['Arduino', 'arduino', G_EMB], ['ESP32', 'espressif', G_EMB, ['esp8266', 'espressif']],
    ['Raspberry Pi', 'raspberrypi', G_EMB], ['STM32', 'stmicroelectronics', G_EMB], ['Nordic', 'nordicsemiconductor', G_EMB],
    ['ARM', 'arm', G_EMB], ['C', 'c', G_EMB], ['C++', 'cplusplus', G_EMB], ['Rust', 'rust', G_EMB],
    ['MicroPython', 'micropython', G_EMB], ['PlatformIO', 'platformio', G_EMB], ['ESPHome', 'esphome', G_EMB],
    ['Tasmota', 'tasmota', G_EMB], ['Adafruit', 'adafruit', G_EMB], ['SparkFun', 'sparkfun', G_EMB], ['KiCad', 'kicad', G_EMB],
    ['WiFi', 'tb:wifi', G_EMB, ['wi-fi']], ['Bluetooth', 'bluetooth', G_EMB, ['ble']], ['LoRa', 'tb:antenna', G_EMB, ['lorawan']],
    ['Zigbee', 'zigbee', G_EMB], ['NFC', 'nfc', G_EMB], ['MQTT', 'mqtt', G_EMB], ['Mosquitto', 'eclipsemosquitto', G_EMB],
    ['Node-RED', 'nodered', G_EMB], ['Home Assistant', 'homeassistant', G_EMB], ['InfluxDB', 'influxdb', G_EMB],
    ['Grafana', 'grafana', G_EMB], ['Linux', 'linux', G_EMB], ['Ubuntu', 'ubuntu', G_EMB],
    // AI & Data
    ['Python', 'python', G_AI], ['TensorFlow', 'tensorflow', G_AI], ['PyTorch', 'pytorch', G_AI], ['Keras', 'keras', G_AI],
    ['scikit-learn', 'scikitlearn', G_AI, ['sklearn']], ['OpenCV', 'opencv', G_AI], ['Pandas', 'pandas', G_AI],
    ['NumPy', 'numpy', G_AI], ['SciPy', 'scipy', G_AI], ['Jupyter', 'jupyter', G_AI], ['Google Colab', 'googlecolab', G_AI, ['colab']],
    ['Kaggle', 'kaggle', G_AI], ['Hugging Face', 'huggingface', G_AI], ['OpenAI', 'openai', G_AI, ['chatgpt']],
    ['Claude', 'claude', G_AI], ['Anthropic', 'anthropic', G_AI], ['Gemini', 'googlegemini', G_AI], ['Ollama', 'ollama', G_AI],
    ['LangChain', 'langchain', G_AI], ['Roboflow', 'roboflow', G_AI], ['ONNX', 'onnx', G_AI], ['MLflow', 'mlflow', G_AI],
    ['Streamlit', 'streamlit', G_AI], ['Plotly', 'plotly', G_AI], ['R', 'r', G_AI], ['MATLAB', 'dev:matlab', G_AI],
    ['NVIDIA', 'nvidia', G_AI, ['cuda']],
    // Web & App
    ['HTML', 'html5', G_WEB, ['html5']], ['CSS', 'css3', G_WEB, ['css3']], ['JavaScript', 'javascript', G_WEB, ['js']],
    ['TypeScript', 'typescript', G_WEB, ['ts']], ['React', 'react', G_WEB, ['reactjs']], ['Next.js', 'nextdotjs', G_WEB, ['nextjs']],
    ['Vue', 'vuedotjs', G_WEB, ['vue.js', 'vuejs']], ['Nuxt', 'nuxtdotjs', G_WEB], ['Angular', 'angular', G_WEB],
    ['Svelte', 'svelte', G_WEB], ['Astro', 'astro', G_WEB], ['Tailwind CSS', 'tailwindcss', G_WEB, ['tailwind']],
    ['Bootstrap', 'bootstrap', G_WEB], ['Sass', 'sass', G_WEB, ['scss']], ['jQuery', 'jquery', G_WEB], ['Vite', 'vite', G_WEB],
    ['Node.js', 'nodedotjs', G_WEB, ['nodejs', 'node']], ['Express', 'express', G_WEB], ['Deno', 'deno', G_WEB], ['Bun', 'bun', G_WEB],
    ['PHP', 'php', G_WEB], ['Laravel', 'laravel', G_WEB], ['WordPress', 'wordpress', G_WEB], ['Django', 'django', G_WEB],
    ['Flask', 'flask', G_WEB], ['FastAPI', 'fastapi', G_WEB], ['GraphQL', 'graphql', G_WEB], ['Prisma', 'prisma', G_WEB],
    ['MySQL', 'mysql', G_WEB], ['PostgreSQL', 'postgresql', G_WEB, ['postgres']], ['SQLite', 'sqlite', G_WEB],
    ['MongoDB', 'mongodb', G_WEB], ['Redis', 'redis', G_WEB], ['Firebase', 'firebase', G_WEB], ['Supabase', 'supabase', G_WEB],
    ['Flutter', 'flutter', G_WEB], ['Dart', 'dart', G_WEB], ['Kotlin', 'kotlin', G_WEB], ['Android', 'android', G_WEB],
    ['Swift', 'swift', G_WEB], ['Java', 'dev:java', G_WEB], ['Figma', 'figma', G_WEB],
    // Cloud & Tools
    ['Git', 'git', G_OPS], ['GitHub', 'github', G_OPS], ['Docker', 'docker', G_OPS], ['Nginx', 'nginx', G_OPS],
    ['AWS', 'amazonwebservices', G_OPS, ['amazon web services']], ['Google Cloud', 'googlecloud', G_OPS, ['gcp']],
    ['Cloudflare', 'cloudflare', G_OPS], ['Vercel', 'vercel', G_OPS], ['Netlify', 'netlify', G_OPS], ['Postman', 'postman', G_OPS]
  ];

  const url = (icon) => icon.startsWith('dev:') ? `https://cdn.jsdelivr.net/npm/devicon@2/icons/${icon.slice(4)}/${icon.slice(4)}-plain.svg`
    : icon.startsWith('tb:') ? `https://cdn.jsdelivr.net/npm/@tabler/icons@3/icons/outline/${icon.slice(3)}.svg`
    : `https://cdn.jsdelivr.net/npm/simple-icons@13/icons/${icon}.svg`;

  const tools = list.map(([name, icon, group, alias]) => ({ name, group, url: url(icon), alias: alias || [] }));
  const byKey = new Map();
  tools.forEach(t => [t.name, ...t.alias].forEach(k => byKey.set(k.toLowerCase(), t)));

  window.TOOL_LOGOS = tools;
  window.TOOL_GROUPS = [G_EMB, G_AI, G_WEB, G_OPS];
  window.findToolLogo = (tag) => byKey.get(String(tag || '').trim().toLowerCase()) || null;
})();
