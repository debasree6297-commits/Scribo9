import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import uploadRouter from './src/routes/upload';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use('/api/upload', uploadRouter);

  // API Routes
  app.post('/.netlify/functions/generate-image', async (req, res) => {
    const { prompt } = req.body;
    const token = process.env.HF_API_KEY;

    if (!token) {
      return res.status(500).json({ error: 'Missing HF API Key' });
    }

    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              num_inference_steps: 4,
              width: 1024,
              height: 1024,
              guidance_scale: 0
            },
            options: { wait_for_model: true }
          })
        }
      );

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Generation failed' });
      }

      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      
      return res.status(200).json({ 
        image: `data:image/jpeg;base64,${base64}` 
      });

    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/generate-image', async (req, res) => {
    const { model, inputs, parameters, options } = req.body;
    const token = process.env.HF_API_KEY;

    if (!token) {
      return res.status(500).json({ error: 'Missing HF API Key' });
    }

    try {
      console.log(`Proxying request to model: ${model}`);
      
      // Handle img2img binary data if present
      let body: any = JSON.stringify({ inputs, parameters, options });
      let headers: any = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // If inputs is a base64 string (for img2img), we might need to handle it differently
      // But for simplicity, we'll stick to the JSON structure unless it's raw bytes
      // The client sends JSON with inputs as prompt string for text-to-image
      // For img2img, the client was sending raw bytes. We need to support that.
      
      // Check if content-type is octet-stream for img2img
      if (req.headers['content-type'] === 'application/octet-stream') {
        headers['Content-Type'] = 'application/octet-stream';
        headers['x-use-cache'] = 'false';
        if (req.headers['x-prompt']) headers['x-prompt'] = req.headers['x-prompt'];
        if (req.headers['x-strength']) headers['x-strength'] = req.headers['x-strength'];
        
        // We need to pipe the raw body
        // Express json middleware might interfere if we don't handle raw body
        // But for now let's assume the client sends JSON for text-to-image
        // and we'll handle binary separately if needed.
        // Actually, let's just forward the request body buffer if it's binary.
      }

      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: 'POST',
          headers: headers,
          body: body,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HF API Error:', errorText);
        return res.status(response.status).send(errorText);
      }

      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();
      
      res.set('Content-Type', blob.type);
      res.send(Buffer.from(buffer));

    } catch (error: any) {
      console.error('Proxy Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Handle binary uploads for img2img
  app.post('/api/generate-image-binary', express.raw({ type: 'application/octet-stream', limit: '10mb' }), async (req, res) => {
    const { model } = req.query;
    const token = process.env.HF_API_KEY;

    if (!token) {
      return res.status(500).json({ error: 'Missing HF API Key' });
    }

    try {
      console.log(`Proxying binary request to model: ${model}`);
      
      const headers: any = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
        'x-use-cache': 'false'
      };

      if (req.headers['x-prompt']) headers['x-prompt'] = req.headers['x-prompt'];
      if (req.headers['x-strength']) headers['x-strength'] = req.headers['x-strength'];

      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: 'POST',
          headers: headers,
          body: req.body, // Raw buffer
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HF API Error (Binary):', errorText);
        return res.status(response.status).send(errorText);
      }

      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();
      
      res.set('Content-Type', blob.type);
      res.send(Buffer.from(buffer));

    } catch (error: any) {
      console.error('Proxy Error (Binary):', error);
      res.status(500).json({ error: error.message });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
