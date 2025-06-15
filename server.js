const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable file uploads and cross-origin requests
app.use(cors());
app.use(express.static('public'));
const upload = multer({ dest: 'uploads/' });

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle video upload and processing
app.post('/api/transform', upload.single('video'), async (req, res) => {
  try {
    const { style } = req.body;
    const videoFile = req.file;
    
    console.log('Processing video:', videoFile.originalname, 'Style:', style);
    
    // Read the video file
    const videoBuffer = fs.readFileSync(videoFile.path);
    const videoBase64 = videoBuffer.toString('base64');
    const videoDataUrl = `data:${videoFile.mimetype};base64,${videoBase64}`;
    
    // Choose the right AI model based on style
    let modelVersion;
    switch(style) {
      case 'pixar':
        modelVersion = 'fofr/face-to-many:35cea9c3164d9fb7fbd48b51503eabdb39c9d04fdaef9a68f368bed8087ec5f9';
        break;
      case 'ghibli':
        modelVersion = 'fofr/face-to-many:35cea9c3164d9fb7fbd48b51503eabdb39c9d04fdaef9a68f368bed8087ec5f9';
        break;
      case 'anime':
        modelVersion = 'tencentarc/photomaker:ddfc2b08d209f9fa8c1eca692712918bd449f695dabb4a958da31802a9570fe4';
        break;
      default:
        modelVersion = 'fofr/face-to-many:35cea9c3164d9fb7fbd48b51503eabdb39c9d04fdaef9a68f368bed8087ec5f9';
    }
    
    // Call Replicate API
    const response = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: modelVersion,
        input: {
          video: videoDataUrl,
          style: style
        }
      },
      {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const predictionId = response.data.id;
    
    // Poll for results
    let result = null;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    
    while (!result && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await axios.get(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
          }
        }
      );
      
      if (statusResponse.data.status === 'succeeded') {
        result = statusResponse.data.output;
        break;
      } else if (statusResponse.data.status === 'failed') {
        throw new Error('AI processing failed');
      }
      
      attempts++;
    }
    
    if (!result) {
      throw new Error('Processing timeout');
    }
    
    // Clean up uploaded file
    fs.unlinkSync(videoFile.path);
    
    res.json({ 
      success: true,
      message: 'Video transformed successfully!',
      videoUrl: result,
      style: style
    });
    
  } catch (error) {
    console.error('Processing error:', error.message);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Processing failed: ' + error.message,
      details: 'Please try again with a shorter video or different format.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
