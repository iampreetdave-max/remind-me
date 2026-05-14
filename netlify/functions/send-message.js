exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' }
    }

    let name, message, file_name, file_path
    try {
        ;({ name, message, file_name, file_path } = JSON.parse(event.body))
    } catch {
        return { statusCode: 400, body: 'Invalid JSON' }
    }

    if (!message || !message.trim()) {
        return { statusCode: 400, body: 'Message is required' }
    }

    const resp = await fetch(`${process.env.SUPABASE_URL}/rest/v1/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
            name:      name      || null,
            message:   message.trim(),
            file_name: file_name || null,
            file_path: file_path || null
        })
    })

    if (!resp.ok) {
        console.error('Supabase error:', await resp.text())
        return { statusCode: 500, body: 'Failed to save message' }
    }

    return { statusCode: 200, body: 'OK' }
}
