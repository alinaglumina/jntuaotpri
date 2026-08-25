// PM2 process definition for production.
module.exports = {
  apps: [{
    name: 'jntua-api',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: { NODE_ENV: 'production' },
    max_memory_restart: '400M',
  }],
};
