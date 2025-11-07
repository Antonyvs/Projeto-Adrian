// ==============================================
// SERVIDOR NODE.JS COM PROMETHEUS E 4 MÉTRICAS
// ==============================================

const express = require('express');
const client = require('prom-client');
const os = require('os');

const app = express();

// ======================
// CONFIGURAÇÃO BÁSICA DO PROMETHEUS
// ======================
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics(); // coleta métricas padrão (CPU, heap, event loop etc.)

// ======================
// MÉTRICA 1: TOTAL DE REQUISIÇÕES
// ======================
const requestCount = new client.Counter({
  name: 'app_request_total',
  help: 'Contador total de requisições HTTP recebidas'
});

// ======================
// MÉTRICA 2: TEMPO DE RESPOSTA DAS REQUISIÇÕES
// ======================
const responseTime = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Tempo de resposta das requisições HTTP em segundos',
  buckets: [0.1, 0.3, 0.5, 1, 2, 5] // intervalos de latência
});

// Middleware para medir tempo de resposta
app.use((req, res, next) => {
  const end = responseTime.startTimer();
  res.on('finish', () => {
    end(); // encerra o cronômetro quando a resposta termina
  });
  next();
});

// ======================
// MÉTRICA 3: USO DE CPU (em %)
// ======================
const cpuGauge = new client.Gauge({
  name: 'app_cpu_usage_percent',
  help: 'Uso atual de CPU do sistema em porcentagem'
});

// Função para calcular média de uso de CPU
function getCPUUsage() {
  const cpus = os.cpus();
  let user = 0;
  let nice = 0;
  let sys = 0;
  let idle = 0;
  let irq = 0;
  for (let cpu of cpus) {
    user += cpu.times.user;
    nice += cpu.times.nice;
    sys += cpu.times.sys;
    idle += cpu.times.idle;
    irq += cpu.times.irq;
  }
  const total = user + nice + sys + idle + irq;
  const usage = ((total - idle) / total) * 100;
  return usage;
}

// Atualiza a métrica de CPU a cada 5 segundos
setInterval(() => {
  const cpu = getCPUUsage();
  cpuGauge.set(cpu);
}, 5000);

// ======================
// MÉTRICA 4: USO DE MEMÓRIA (em bytes)
// ======================
const memoryGauge = new client.Gauge({
  name: 'app_memory_usage_bytes',
  help: 'Uso atual de memória em bytes'
});

// Atualiza a métrica de memória a cada 5 segundos
setInterval(() => {
  const memoryUsage = process.memoryUsage().heapUsed;
  memoryGauge.set(memoryUsage);
}, 5000);

// ======================
// ROTAS PRINCIPAIS
// ======================

// Rota principal — incrementa o contador e responde
app.get('/', (req, res) => {
  requestCount.inc(); // incrementa a métrica de requisições
  res.send('Prometheus + Grafana + Kubernetes + Node.js 💪');
});

// Rota de métricas — expõe todas as métricas Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// ======================
// INICIALIZAÇÃO DO SERVIDOR
// ======================
app.listen(3123, () => {
  console.log('🚀 Servidor rodando na porta 3123 e exportando métricas em /metrics');
});
