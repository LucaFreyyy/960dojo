import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, email, message, type } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (message.length < 10 || message.length > 5000) {
    return res.status(400).json({ error: 'Message must be between 10 and 5000 characters' });
  }

  try {
    const { data, error } = await supabase
      .from('Feedback')
      .insert({
        userId: userId || null,
        email: email || null,
        message: message.trim(),
        type: type || 'general',
      })
      .select()
      .single();

    if (error) {
      console.error('[feedback] Supabase error:', error);
      return res.status(500).json({ error: `Failed to save feedback: ${error.message}` });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (e) {
    console.error('[feedback] Error:', e);
    return res.status(500).json({ error: `Internal server error: ${e.message}` });
  }
}
