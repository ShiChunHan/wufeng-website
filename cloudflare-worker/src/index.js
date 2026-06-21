const MODEL = '@cf/meta/llama-3.1-8b-instruct-fast';
const MAX_MESSAGE_LENGTH = 1200;
const MAX_SYSTEM_LENGTH = 1800;
const MAX_OUTPUT_TOKENS = 260;
const SERVER_STYLE_GUARD =
    '請始終使用繁體中文。回答採溫厚、豁達且帶山水意象的文人遊記口吻，' +
    '但要讓現代遊客讀得懂。只根據使用者提供內容與網站脈絡回答；' +
    '資料不足時不得自行編造街名、年代、區域、店家、活動或歷史細節。';

function corsHeaders(request, env) {
    const origin = request.headers.get('Origin') || '';
    const configured = (env.ALLOWED_ORIGINS || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    const allowOrigin = configured.length === 0
        ? origin || '*'
        : configured.includes(origin) ? origin : '';

    return {
        'Access-Control-Allow-Origin': allowOrigin || 'https://invalid.example',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        Vary: 'Origin'
    };
}

function jsonResponse(request, env, body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...corsHeaders(request, env)
        }
    });
}

function extractText(result) {
    if (!result) return '';
    if (typeof result.response === 'string') return result.response.trim();
    if (typeof result.result === 'string') return result.result.trim();
    if (typeof result.text === 'string') return result.text.trim();
    if (Array.isArray(result.choices) && result.choices[0]?.message?.content) {
        return String(result.choices[0].message.content).trim();
    }
    return '';
}

export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders(request, env) });
        }

        const url = new URL(request.url);
        if (request.method !== 'POST' || url.pathname !== '/api/chat') {
            return jsonResponse(request, env, { error: 'Not found' }, 404);
        }

        let payload;
        try {
            payload = await request.json();
        } catch (_error) {
            return jsonResponse(request, env, { error: 'Invalid JSON body' }, 400);
        }

        const message = String(payload.message || payload.prompt || '')
            .trim()
            .slice(0, MAX_MESSAGE_LENGTH);
        const systemPrompt = String(payload.systemPrompt || '')
            .trim()
            .slice(0, MAX_SYSTEM_LENGTH);
        const maxTokens = Math.min(Number(payload.maxTokens) || 220, MAX_OUTPUT_TOKENS);

        if (!message) {
            return jsonResponse(request, env, { error: 'Message is required' }, 400);
        }

        const messages = [
            {
                role: 'system',
                content: SERVER_STYLE_GUARD +
                    (systemPrompt ? '\n\n網站前端補充指令：' + systemPrompt : '')
            },
            { role: 'user', content: message }
        ];

        try {
            const result = await env.AI.run(MODEL, {
                messages,
                max_tokens: maxTokens
            });
            const text = extractText(result);
            if (!text) {
                return jsonResponse(request, env, { error: 'AI returned no text' }, 502);
            }
            return jsonResponse(request, env, { text });
        } catch (error) {
            console.error('Workers AI request failed', error);
            return jsonResponse(request, env, { error: 'AI service request failed' }, 502);
        }
    }
};
