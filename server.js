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
    
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
        input: {
          video: `https://your-app-url.onrender.com/uploads/${file.filename}`,
          prompt: `Transform this video into ${style} animation style`,
          num_inference_steps: 20
        }
      })
    });
    
    const prediction = await response.json();
    console.log('🎯 AI Response:', prediction);
    
  } catch (error) {
    console.error('❌ AI Error:', error);
  }
}                                                                                                                                                                                    
  
  
  
  
  
  
  
  
  

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});                                                                                                                                                                                                                                                                                                                                                                                                                                                
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
