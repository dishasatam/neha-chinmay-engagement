import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server environment missing SUPABASE_SERVICE_ROLE_KEY' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();
    const { browserId, firstName, surname, sessionId, isNewSession } = body;

    // Validate inputs
    if (!firstName || !surname || !browserId) {
      return new Response(
        JSON.stringify({ error: 'Missing mandatory fields: browserId, firstName, surname' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trimmedFirst = firstName.trim();
    const trimmedSurname = surname.trim();

    if (trimmedFirst.length < 2 || trimmedSurname.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Name must be at least 2 characters long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call atomic SQL procedure
    const { data, error } = await supabaseAdmin.rpc('record_guest_visit', {
      p_browser_id: browserId,
      p_first_name: trimmedFirst,
      p_surname: trimmedSurname,
      p_session_id: sessionId || null,
      p_is_new_session: Boolean(isNewSession),
    });

    if (error) {
      console.error('RPC Error in track-visitor:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal Edge Function Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
