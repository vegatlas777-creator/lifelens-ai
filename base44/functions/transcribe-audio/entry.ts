import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { audio_url } = body || {};
    if (!audio_url) return Response.json({ error: 'audio_url is required' }, { status: 400 });

    const transcript = await base44.asServiceRole.integrations.Core.TranscribeAudio({ audio_url });
    return Response.json({ transcript });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}