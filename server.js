const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

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
app.post('/api/transform', upload.single('video'), async (req, res) => {
  try {
    const file = req.file;
    const style = req.body.style;
    
    // Just tell us what we received
    res.json({
      success: true,
      message: `✅ Got your file! Name: ${file.originalname}, Size: ${Math.round(file.size/1024)}KB, Style: ${style}`,
      filename: file.originalname,
      size: file.size,
      style: style
    });
    
    // Clean up the file
    fs.unlinkSync(file.path);
    
  } catch (error) {
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
