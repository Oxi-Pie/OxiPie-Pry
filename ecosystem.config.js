module.exports = {
  apps: [
    // 1. FRONTEND (Next.js)
    {
      name: "OxiPie-Client",
      cwd: "./client",
      script: "./node_modules/next/dist/bin/next",
      args: "start",
      env: {
        PORT: 3000,
        NODE_ENV: "production"
      }
    },
    // 2. PACIENTES
    {
      name: "Srv-Pacientes",
      cwd: "./server/patients-service",
      script: "src/index.js",
      env: { PORT: 4001 }
    },
    // 3. AGENDAMIENTO
    {
      name: "Srv-Agenda",
      cwd: "./server/scheduling-service",
      script: "src/index.js",
      env: { PORT: 4002 }
    },
    // 4. FINANZAS
    {
      name: "Srv-Finanzas",
      cwd: "./server/finance-service",
      script: "src/index.js",
      env: { PORT: 4003 }
    },
    // 5. NOTIFICACIONES (WhatsApp)
    {
      name: "Srv-WhatsApp",
      cwd: "./server/notifications-service",
      script: "src/index.js",
      env: { PORT: 4004 },
      // Esperar un poco si falla para no bloquear WhatsApp por reinicios rápidos
      exp_backoff_restart_delay: 100 
    }
  ]
};