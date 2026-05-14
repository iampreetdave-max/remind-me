exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' }
    }

    let fileName, contentType
    try {
        ;({ fileName, contentType } = JSON.parse(event.body))
    } catch {
        return { statusCode: 400, body: 'Invalid JSON' }
    }

    if (!fileName) return { statusCode: 400, body: 'fileName is required' }

    const supaUrl = process.env.SUPABASE_URL
    const srvKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
    const headers = {
        'Content-Type':  'application/json',
        'apikey':        srvKey,
        'Authorization': `Bearer ${srvKey}`
    }

    // Auto-create bucket on first upload (idempotent — 409 = already exists, that's fine)
    await fetch(`${supaUrl}/storage/v1/bucket`, {
        method: 'POST', headers,
        body: JSON.stringify({ id: 'uploads', name: 'uploads', public: false })
    })

    const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._\-]/g, '_')}`

    const resp = await fetch(
        `${supaUrl}/storage/v1/object/sign/upload/uploads/${safeName}`,
        { method: 'POST', headers }
    )

    if (!resp.ok) {
        console.error('Supabase sign error:', await resp.text())
        return { statusCode: 500, body: 'Failed to create upload URL' }
    }

    const data = await resp.json()
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            signedUrl: `${supaUrl}${data.url}`,
            path: safeName
        })
    }
}
