const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));
const upload = multer({ dest: 'uploads/' });

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Test file upload
// AI Processing Upload Handler
app.post('/api/transform', upload.single('video'), async (req, res) => {
  try {
    const file = req.file;
    const style = req.body.style;
    
    console.log('🎨 Starting AI processing for:', file.originalname);
    
    // Prepare file for AI
    const fileBuffer = fs.readFileSync(file.path);
    const fileBase64 = fileBuffer.toString('base64');
    const fileDataUrl = `data:${file.mimetype};base64,${fileBase64}`;
    
    // Call AI service
    const aiResponse = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: "fofr/face-to-many:35cea9c3164d9fb7fbd48b51503eabdb39c9d04fdaef9a68f368bed8087ec5f9",
        input: {
          image: fileDataUrl,
          style: "Pixar style"
        }
      },
      {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('🤖 AI started, waiting for result...');
    
    // Wait for AI to finish
    let result = null;
    let attempts = 0;
    
    while (attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const statusCheck = await axios.get(
        `https://api.replicate.com/v1/predictions/${aiResponse.data.id}`,
        {
          headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` }
        }
      );
      
      console.log('🔄 AI Status:', statusCheck.data.status);
      
      if (statusCheck.data.status === 'succeeded') {
        result = statusCheck.data.output;
        break;
      }
      
      if (statusCheck.data.status === 'failed') {
        throw new Error('AI processing failed');
      }
      
      attempts++;
    }
    
    // Send result
    if (result) {
      console.log('✅ AI Success! Result:', result);
      res.json({
        success: true,
        message: '🎉 AI transformation complete!',
        videoUrl: result,
        originalFile: file.originalname
      });
    } else {
      throw new Error('AI took too long (over 2.5 minutes)');
    }
    
    // Clean up
    fs.unlinkSync(file.path);
    
  } catch (error) {
    console.error('❌ AI Error:', error.message);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'AI processing failed: ' + error.message,
      suggestion: 'Try a smaller image file (JPG/PNG under 5MB)'
    });
  }
});
