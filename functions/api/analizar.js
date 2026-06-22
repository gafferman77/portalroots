// functions/api/analizar.js
// Cloudflare Pages Function — proxy seguro entre el monitor y Claude.
// La API key vive en una variable de entorno (ANTHROPIC_API_KEY), NUNCA en el frontend.

export async function onRequestPost({ request, env }) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    if (!env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: 'Falta ANTHROPIC_API_KEY en variables de entorno' }), { status: 500, headers: cors });
    }

    const m = await request.json();

    const prompt = `Sos Génesis, el asistente de trading de Sr. M (Mario Farías, Buenos Aires).
Operás en 15m, máximo 5% de riesgo por trade, ratio mínimo 1:2 riesgo/beneficio, SIN apalancamiento (spot).

Estos son DATOS REALES en vivo de Bybit (no inventes nada, basate solo en esto):

- Par: ${m.pair}   Timeframe: ${m.tf}   Hora: ${m.hora} (UTC-3)
- Precio actual: ${m.precio}   Cambio última vela: ${m.cambio_pct}%
- RSI(14): ${m.rsi}
- MACD: ${m.macd ? `línea ${m.macd.macd} / señal ${m.macd.signal} / histograma ${m.macd.hist}` : 'n/d'}
- Resistencia (máx 60 velas): ${m.resistencia}
- Soporte (mín 60 velas): ${m.soporte}
- Patrón detectado en la última vela: ${m.patron_ultima_vela}

Últimas 12 velas (O=apertura H=máx L=mín C=cierre V=volumen):
${m.ultimas_velas}

Dame un análisis CORTO y directo, en español, con esta estructura exacta usando **negrita** en los títulos:

**Tendencia** — alcista / bajista / lateral, en una frase con el porqué.
**Niveles** — soporte y resistencia que importan ahora.
**Señales** — qué dicen RSI y MACD juntos (¿confirman o se contradicen?).
**Patrón** — qué implica la vela detectada en este contexto.
**Acción para Sr. M** — decisión concreta: ENTRAR / ESPERAR CONFIRMACIÓN / EVITAR. Si sugerís entrada, dá entrada, stop y objetivo aproximados respetando 1:2. Si los datos no son claros, decí "esperar" — no fuerces un trade.

Sé honesto: si el mercado está lateral o confuso, decilo. No inventes confianza.`;

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await r.json();
    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), { status: 502, headers: cors });
    }

    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
    return new Response(JSON.stringify({ text }), { status: 200, headers: cors });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
  }
}

// Responder preflight CORS
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
