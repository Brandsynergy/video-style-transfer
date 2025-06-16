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
    
    console.log('🎬 Starting AI transformation for:', file.originalname);
    
    // Show processing message first
    res.json({
      success: true,
      message: `🎨 AI is transforming your video to ${style} style... This may take 2-3 minutes.`,
      processing: true,
      originalFile: file.originalname,
      style: style
    });
    
    // Start AI processing in background
    processVideoWithAI(file, style);
    
  } catch (error) {
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

// AI Processing Function
async function processVideoWithAI(file, style) {
  try {
    console.log('🤖 Calling Replicate AI...');

// First, we need to make the video file publicly accessible
const fs = require('fs');
const videoBuffer = fs.readFileSync(file.path);
const videoBase64 = videoBuffer.toString('base64');
const videoDataUrl = `data:${file.mimetype};base64,${videoBase64}`;

// Style-specific prompts
const stylePrompts = {
  pixar: "Transform this video into Pixar 3D animation style with vibrant colors, smooth rendering, cartoon characters, and Disney-like magical atmosphere",
  ghibli: "Transform this video into Studio Ghibli anime style with hand-drawn animation, soft watercolor textures, magical forest atmosphere, and Miyazaki-inspired character design",
  anime: "Transform this video into modern anime style with bold colors, dramatic lighting, manga-inspired character design, and Japanese animation aesthetics"
};

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
    console.log('🎯 AI Started:', prediction.id);
    
    // Wait for completion
    let result = prediction;
    while (result.status === 'starting' || result.status === 'processing') {
      console.log('⏳ AI Status:', result.status);
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        }
      });
      
      result = await statusResponse.json();
    }
    
    if (result.status === 'succeeded') {
      console.log('🎉 AI SUCCESS! Video URL:', result.output);
    } else {
      console.log('❌ AI FAILED:', result.error);
    }
    
  } catch (error) {
    console.error('❌ AI Error:', error);
  }
}                    
                      
                      
                      
                      
                      
                      
                                                                                                                                                                                      
  
  
  
  
  
  
  
  
  

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});                                                                                                                                                                                                                                                                                                                                                                                                                                                
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
