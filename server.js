const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

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

// Handle video upload (simplified for now)
app.post('/api/transform', upload.single('video'), async (req, res) => {
  try {
    console.log('Video uploaded:', req.file.originalname);
    
    // For now, just return a success message
    // Later we'll add the AI magic here
    res.json({ 
      message: 'Video received! AI processing will be added soon.',
      filename: req.file.originalname 
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
