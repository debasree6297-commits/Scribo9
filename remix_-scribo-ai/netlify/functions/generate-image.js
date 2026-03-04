exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    const TOKEN = process.env.HF_API_KEY;

    console.log('Token exists:', !!TOKEN);
    console.log('Prompt:', prompt);

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

    console.log('HF Response status:', response.status);

    if (!response.ok) {
      const errText = await response.text();
      console.log('HF Error:', errText);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: `HF Error: ${response.status}`,
          details: errText
        })
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        image: `data:image/jpeg;base64,${base64}`
      })
    };

  } catch (error) {
    console.log('Function error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
