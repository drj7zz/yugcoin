const { createProxyMiddleware } = require('http-proxy-middleware');

// Dev-only proxy: the Render backend's CORS whitelist only allows the Vercel
// production origin, so in development we proxy /api and socket.io through the
// CRA dev server (same-origin => no CORS at all).
module.exports = function (app) {
  const target = (process.env.REACT_APP_PROXY_TARGET || 'https://yugcoin-backend.onrender.com') + '/api';

  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      secure: true,
    })
  );

  app.use(
    '/socket.io',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      ws: true,
      secure: true,
    })
  );
};
