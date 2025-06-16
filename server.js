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
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Video transformation magic
app.post('/api/transform', upload.single('video'), async (req, res) => {
  try {
    const file = req.file;
    const style = req.body.style;
    
    console.log('🎬 Starting video transformation:', file.originalname, 'to', style);
    
    // Prepare video for AI
    const videoBuffer = fs.readFileSync(file.path);
    const videoBase64 = videoBuffer.toString('base64');
    const videoDataUrl = `data:${file.mimetype};base64,${videoBase64}`;
    
    // Choose the right AI model based on style
    let modelVersion;
    let inputParams;
    
    switch(style) {
      case 'pixar':
        modelVersion = "fofr/live-portrait:3f8c47b6e3f8e2b7e1b7b1b1b1b1b1b1b1b1b1b1";
        inputParams = {
          source_image: videoDataUrl,
          driving_video: videoDataUrl,
          live_portrait_dsize: 512,
          live_portrait_scale: 2.3
        };
        break;
      case 'ghibli':
        modelVersion = "lucataco/animate-diff:beecf59c4aee8d81bf04f0381033dfa10dc16e845b83c17a6b83a7a6b83a7a6b";
        inputParams = {
          path: videoDataUrl,
          motion_module: "mm_sd_v15_v2.ckpt",
          seed: 42
        };
        break;
      case 'anime':
        modelVersion = "cjwbw/damo-text-to-video:1e205ea73084bd17a0a3b43396e49ba0d6bc2e754e9283b2df49fad2dcf95755";
        inputParams = {
          fps: 8,
          prompt: "anime style transformation",
          video_length: 16,
          video: videoDataUrl
        };
        break;
      default:
        modelVersion = "fofr/live-portrait:3f8c47b6e3f8e2b7e1b7b1b1b1b1b1b1b1b1b1b1";
        inputParams = {
          source_image: videoDataUrl,
          driving_video: videoDataUrl
        };
    }
    
    console.log('🤖 Calling AI service...');
    
    // Call the AI
    const aiResponse = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: modelVersion,
        input: inputParams
      },
      {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const predictionId = aiResponse.data.id;
    console.log('🔄 AI started, prediction ID:', predictionId);
    
    // Wait for the magic to happen
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
      
      console.log('🔄 Status:', statusResponse.data.status);
      
      if (statusResponse.data.status === 'succeeded') {
        result = statusResponse.data.output;
        console.log('✅ Success! Result:', result);
        break;
      } else if (statusResponse.data.status === 'failed') {
        throw new Error('AI processing failed: ' + statusResponse.data.error);
      }
      
      attempts++;
    }
    
    if (!result) {
      throw new Error('Processing took too long (over 5 minutes)');
    }
    
    // Clean up uploaded file
    fs.unlinkSync(file.path);
    
    // Send the transformed video back
    res.json({
      success: true,
      message: `🎉 Your ${style} style video is ready!`,
      videoUrl: Array.isArray(result) ? result[0] : result,
      originalFile: file.originalname,
      style: style
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Clean up if file exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      error: 'Video transformation failed: ' + error.message,
      suggestion: 'Try a shorter video (under 30 seconds) or different format (MP4)'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Video transformation app running on port ${PORT}`);
});                                                                                                                                                                                                                                                                                                                               
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
