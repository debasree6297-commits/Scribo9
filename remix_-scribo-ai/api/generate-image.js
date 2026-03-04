export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { prompt } = req.body;
  const TOKEN = process.env.HF_API_KEY;

  const response = await fetch(
    'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
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
        options: {
          wait_for_model: true,
          use_cache: false
        }
      })
    }
  );

  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  
  res.status(200).json({
    image: `data:image/jpeg;base64,${base64}`
  });
}
