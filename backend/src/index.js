const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

// 路由
const apiRoutes = require('./routes/index')

const app = express()
const PORT = process.env.PORT || 3000

// ============================================
// 安全中间件
// ============================================

// Helmet - 安全 headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later' }
})
app.use('/api/', limiter)

// Body Parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ============================================
// API 路由
// ============================================

// 健康检查
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '3.0' })
})

// 所有 API 路由（已包含认证中间件）
app.use('/api/v1', apiRoutes)

// ============================================
// 错误处理
// ============================================

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

app.use((err, req, res, next) => {
  console.error('Server error:', err)

  if (err.message === 'Too many requests') {
    return res.status(429).json({ error: err.message })
  }

  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
  })
})

// ============================================
// 启动服务器
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 AutoParts API Server running on port ${PORT}`)
  console.log(`📡 API Base: http://localhost:${PORT}/api/v1`)
})

module.exports = app
