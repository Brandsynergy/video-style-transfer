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
    
                                                                                   
  
  
  
    // Process with AI and wait for result
const result = await processVideoWithAI(file, style);

// Send back the final result
if (result && result.success) {
  res.json({
    success: true,
    message: result.message,
    videoUrl: result.videoUrl,
    processing: false
  });
} else {
  res.json({
    success: false,
    message: "❌ Transformation failed. Please try again.",
    processing: false
  });
}

// Remove the old res.json above (lines 25-31)
    
  } catch (error) {
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

// AI Processing Function
async function processVideoWithAI(file, style) {
  try {
    console.log(`🎬 Starting REAL AI transformation for: ${file.originalname}`);
    
    // Upload file to a temporary URL for AI to access
    const fs = require('fs');
    const fileBuffer = fs.readFileSync(file.path);
    const fileBase64 = fileBuffer.toString('base64');
    
    // Real AI transformation using Replicate
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
    
    console.log('🤖 Calling REAL AI for video transformation...');
    
    const output = await replicate.run(
      "lucataco/animate-diff:beecf59c4aee8d81bf04f0381033dfa10dc16e845b83c17a580e8c17bd4c6e10",
      {
        input: {
          path: `data:video/mp4;base64,${fileBase64}`,
          motion_module: "mm_sd_v14",
          prompt: `Transform this video to ${style} animation style, high quality, detailed`,
          n_prompt: "low quality, blurry, distorted",
          steps: 25,
          guidance_scale: 7.5
        }
      }
    );

    console.log('🎉 REAL AI SUCCESS! Your video is transformed!');
    
    return {
      success: true,
      videoUrl: output,
      message: `🎉 Your video has been transformed to ${style} style!`
    };

  } catch (error) {
    console.error('❌ AI transformation failed:', error);
    return {
      success: false,
      message: "❌ Transformation failed. Please try a shorter video (under 10 seconds)."
    };
  }
}                    
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                      
                                                                                                                                                                                     
  
  
  
  
  
  
  
  
                      
                      
                      
                      
                      
                      
                                                                                                                                                                                      
  
  
  
  
  
  
  
  
  

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});                                                                                                                                                                                                                                                                                                                                                                                                                                                
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
