// netlify/functions/chat.js
// Secure proxy — keeps your Anthropic API key server-side only.
// The browser calls /.netlify/functions/chat instead of api.anthropic.com directly.

export default async (request) => {
  // Only allow POST
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  try {
    const body = await request.json();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(),
      },
    });
  } catch (err) {
    console.error('Proxy error:', err);
    return new Response(JSON.stringify({ error: 'Proxy error', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export const config = { path: '/api/chat' };
