const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));
const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/transform', upload.single('video'), async (req, res) => {
  try {
    const file = req.file;
    const style = req.body.style;
    
    console.log('🎬 Starting AI processing for:', file.originalname);
    
    // Read the uploaded video file
    const fs = require('fs');
    const videoBuffer = fs.readFileSync(file.path);
    const videoBase64 = videoBuffer.toString('base64');
    const videoDataUrl = `data:${file.mimetype};base64,${videoBase64}`;
    
    // AI Style mapping
    const stylePrompts = {
      pixar: "Transform this video into Pixar animation style with vibrant colors, smooth 3D rendering, and cartoon-like characters",
      ghibli: "Transform this video into Studio Ghibli anime style with hand-drawn animation, soft colors, and magical atmosphere",
      anime: "Transform this video into modern anime style with bold colors, dramatic lighting, and manga-inspired character design"
    };
    
    // Call Replicate AI
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117",
        input: {
          video: videoDataUrl,
          prompt: stylePrompts[style] || stylePrompts.pixar,
          num_frames: 16,
          num_inference_steps: 20
        }
      })
    });
    
    const prediction = await response.json();
    
    if (prediction.error) {
      throw new Error(prediction.error);
    }
    
    // Wait for processing to complete
    let result = prediction;
    while (result.status === 'starting' || result.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        }
      });
      
      result = await statusResponse.json();
    }
    
    if (result.status === 'succeeded' && result.output) {
      res.json({
        success: true,
        message: `🎉 Your ${style} style video transformation is complete!`,
        videoUrl: result.output,
        originalFile: file.originalname,
        style: style
      });
    } else {
      throw new Error('AI processing failed: ' + (result.error || 'Unknown error'));
    }
    
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ 
      error: 'Processing failed: ' + error.message,
      success: false 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});                                                                                                                                                                                                                                                                                                                          
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
