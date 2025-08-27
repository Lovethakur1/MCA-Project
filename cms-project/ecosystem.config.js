module.exports = {
  apps: [{
    name: 'mca-cms',
    script: 'app.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      MONGODB_URI: 'mongodb://cms_user:cms_password@localhost:27017/mca-cms',
      SESSION_SECRET: 'your-super-secret-session-key-palindrome#9943',
      ADMIN_EMAIL: 'admin@palindrome.com',
      ADMIN_PASSWORD: 'palindrome#9943'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
