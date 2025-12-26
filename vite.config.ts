import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'https';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');

  // Prioritize API_KEY, but fallback to VITE_API_KEY if the user followed standard Vite naming conventions
  const apiKey = env.API_KEY || env.VITE_API_KEY;

  // 创建自定义 HTTPS Agent，设置更长的超时和保持连接
  const httpsAgent = new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 30000,
    timeout: 600000,
    maxSockets: Infinity,
    maxFreeSockets: 10,
    scheduling: 'lifo',
  });

  return {
    plugins: [react()],
    base: './',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      // 确保每次构建生成不同的文件名 hash
      rollupOptions: {
        output: {
          // 为 JS 文件添加 hash
          entryFileNames: 'assets/[name]-[hash].js',
          // 为代码分割的 chunk 添加 hash
          chunkFileNames: 'assets/[name]-[hash].js',
          // 为静态资源添加 hash
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      }
    },
    server: {
      // 增加服务器超时时间
      timeout: 600000,
      // 监听所有网络接口，允许外部访问
      host: '0.0.0.0',
      // 完全禁用 host 检查（允许 ngrok 等反向代理）
      strictPort: false,
      // 允许的 host（完全禁用检查，允许所有域名）
      allowedHosts: true,
      hmr: {
        clientPort: 443, // ngrok 使用 443 端口
      },
      proxy: {
        // 代理 API 请求以避免 CORS 问题
        '/api-proxy': {
          target: 'https://twob.pp.ua',
          changeOrigin: true,
          secure: false,
          followRedirects: true,
          // 增加超时时间到 10 分钟（AI 生成需要时间）
          timeout: 600000,
          proxyTimeout: 600000,
          // 使用自定义 HTTPS Agent
          agent: httpsAgent,
          rewrite: (path) => path.replace(/^\/api-proxy/, '/v1'),
          configure: (proxy, options) => {
            // 设置代理的超时时间
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // 设置入口请求的超时
              req.setTimeout(600000);
              if (req.socket) {
                req.socket.setTimeout(600000);
                req.socket.setKeepAlive(true, 30000);
                // 禁用 Nagle 算法，减少延迟
                req.socket.setNoDelay(true);
              }
              console.log('🔄 代理请求:', req.method, req.url, '→', proxyReq.path);

              // 确保保持 POST 方法
              if (req.method === 'POST') {
                proxyReq.method = 'POST';
              }

              // 设置请求超时时间为 10 分钟
              proxyReq.setTimeout(600000);

              // 设置 socket 超时和保持连接
              if (proxyReq.socket) {
                proxyReq.socket.setTimeout(600000);
                proxyReq.socket.setKeepAlive(true, 30000);
                proxyReq.socket.setNoDelay(true);

                // 监听 socket 事件，防止意外关闭
                proxyReq.socket.on('timeout', () => {
                  console.log('⚠️ Socket timeout 事件触发，重新设置超时');
                  proxyReq.socket.setTimeout(600000);
                });

                proxyReq.socket.on('error', (err) => {
                  console.error('❌ Socket 错误:', err.message);
                });
              }

              // 监听 proxyReq 的 socket 连接
              proxyReq.on('socket', (socket) => {
                socket.setTimeout(600000);
                socket.setKeepAlive(true, 30000);
                socket.setNoDelay(true);
              });

              // 保持连接活跃
              proxyReq.setHeader('Connection', 'keep-alive');
              proxyReq.setHeader('Keep-Alive', 'timeout=600');
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('✅ 代理响应:', proxyRes.statusCode, req.url);
              // 如果是重定向，记录位置
              if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400) {
                console.log('🔀 重定向到:', proxyRes.headers.location);
              }

              // 设置响应超时时间
              proxyRes.setTimeout(600000);

              // 设置响应 socket 超时
              if (proxyRes.socket) {
                proxyRes.socket.setTimeout(600000);
                proxyRes.socket.setKeepAlive(true, 30000);
                proxyRes.socket.setNoDelay(true);

                // 监听响应 socket 事件
                proxyRes.socket.on('timeout', () => {
                  console.log('⚠️ Response Socket timeout 事件触发');
                  proxyRes.socket.setTimeout(600000);
                });
              }

              // 设置响应的超时时间
              res.setTimeout(600000);
              if (res.socket) {
                res.socket.setTimeout(600000);
                res.socket.setKeepAlive(true, 30000);
              }
            });
            proxy.on('error', (err, req, res) => {
              console.error('❌ 代理错误:', err.message);
              console.error('错误详情:', {
                code: err.code,
                message: err.message,
                stack: err.stack?.split('\n')[0],
              });

              // 如果是超时错误，给出友好提示
              if (err.message.includes('timeout') || err.message.includes('hang up')) {
                console.log('💡 提示: socket hang up 通常由以下原因引起：');
                console.log('   1. 服务端主动断开长连接（超过其超时限制）');
                console.log('   2. 网络中间节点（路由器/防火墙）断开连接');
                console.log('   3. TLS/SSL 层的超时限制');
                console.log('   当前配置已设置 10 分钟超时，但某些底层限制无法覆盖');
              }

              // 尝试返回错误响应
              if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  error: {
                    message: err.message,
                    code: err.code || 'PROXY_ERROR',
                    suggestion: 'AI 生成时间较长导致代理超时，建议使用手动模式'
                  }
                }));
              }
            });
          }
        }
      }
    },
    define: {
      // Safely stringify the key. If it's missing, it will be an empty string,
      // which will be caught by the check in geminiService.ts
      'process.env.API_KEY': JSON.stringify(apiKey || '')
    }
  };
});