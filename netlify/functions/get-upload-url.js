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

    if (!fileName) {
        return { statusCode: 400, body: 'fileName is required' }
    }

    // Prefix with timestamp to avoid collisions while keeping the original name readable
    const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._\-]/g, '_')}`

    const resp = await fetch(
        `${process.env.SUPABASE_URL}/storage/v1/object/sign/upload/uploads/${safeName}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
            }
        }
    )

    if (!resp.ok) {
        console.error('Supabase sign error:', await resp.text())
        return { statusCode: 500, body: 'Failed to create upload URL' }
    }

    const data = await resp.json()
    // data.url = /storage/v1/object/upload/sign/uploads/<name>?token=...
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            signedUrl: `${process.env.SUPABASE_URL}${data.url}`,
            path: safeName
        })
    }
}
