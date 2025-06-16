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
    
    // For now, let's simulate AI processing
    res.json({
      success: true,
      message: `🎉 Your ${style} style video transformation is complete!`,
      videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", // Temporary sample
      originalFile: file.originalname,
      style: style
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Processing failed: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});                                                                                                                                                                                                                                                                                                                          
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
