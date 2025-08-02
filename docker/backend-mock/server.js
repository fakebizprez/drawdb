const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.API_RATE_LIMIT) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Middleware
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'drawdb-backend',
    version: '1.0.0'
  });
});

// Mock API Routes

// Email API
app.post('/api/email/send', async (req, res) => {
  try {
    const { subject, message, attachments } = req.body;
    
    console.log('Email send request:', { subject, message, attachments: attachments?.length || 0 });
    
    // Mock email sending logic
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    
    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
});

// GitHub Gists API
app.post('/api/gists', async (req, res) => {
  try {
    const { public: isPublic, filename, description, content } = req.body;
    
    console.log('Gist create request:', { public: isPublic, filename, description, contentLength: content?.length || 0 });
    
    // Mock gist creation
    const mockGistId = `mock-gist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    res.status(201).json({
      success: true,
      data: {
        id: mockGistId,
        html_url: `https://gist.github.com/mock-user/${mockGistId}`,
        files: {
          [filename]: {
            content: content
          }
        },
        public: isPublic,
        description: description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Gist create error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create gist',
      error: error.message
    });
  }
});

app.patch('/api/gists/:gistId', async (req, res) => {
  try {
    const { gistId } = req.params;
    const { filename, content } = req.body;
    
    console.log('Gist update request:', { gistId, filename, contentLength: content?.length || 0 });
    
    res.status(200).json({
      success: true,
      data: {
        id: gistId,
        html_url: `https://gist.github.com/mock-user/${gistId}`,
        files: {
          [filename]: {
            content: content
          }
        },
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Gist update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update gist',
      error: error.message
    });
  }
});

app.delete('/api/gists/:gistId', async (req, res) => {
  try {
    const { gistId } = req.params;
    
    console.log('Gist delete request:', { gistId });
    
    res.status(204).send();
  } catch (error) {
    console.error('Gist delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete gist',
      error: error.message
    });
  }
});

app.get('/api/gists/:gistId', async (req, res) => {
  try {
    const { gistId } = req.params;
    
    console.log('Gist get request:', { gistId });
    
    res.status(200).json({
      id: gistId,
      html_url: `https://gist.github.com/mock-user/${gistId}`,
      files: {
        'share.json': {
          content: '{"tables":[],"relationships":[],"notes":[],"areas":[]}'
        }
      },
      public: false,
      description: 'drawDB diagram',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Gist get error:', error);
    res.status(404).json({
      success: false,
      message: 'Gist not found',
      error: error.message
    });
  }
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 DrawDB Backend Mock Server running on port ${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
});

module.exports = app;