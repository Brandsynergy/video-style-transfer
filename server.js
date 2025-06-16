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
    
    // Simple response - just return the uploaded video for now
    res.json({
      success: true,
      message: `✅ Video uploaded successfully! ${style} transformation will be added soon.`,
      videoUrl: `/uploads/${file.filename}`, // Show the original video
      originalFile: file.originalname,
      style: style
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});                                                                                                                                                                                                                                                                                                                                                                                                                                                
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
