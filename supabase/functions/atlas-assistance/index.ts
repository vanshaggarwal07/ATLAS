import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  message: string;
  conversationHistory: ConversationMessage[];
  context: {
    sessionId: string | null;
    milestones: Array<{
      title: string;
      description: string | null;
      status: string;
      due_date: string | null;
      owner_name: string | null;
    }>;
    executionPlan: any;
    problemDescription: string | null;
    problemDomain: string | null;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: RequestBody = await req.json();
    const { message, conversationHistory, context } = body;

    // Get Lovable API key for AI gateway
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(context);

    // Build messages array for the AI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];

    console.log('Calling AI gateway with message:', message.substring(0, 100));

    // Call AI API with LOVABLE_API_KEY
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableApiKey}`
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages,
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const aiResponse = aiData.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response.';

    console.log('AI response received successfully');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in atlas-assistance:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildSystemPrompt(context: RequestBody['context']): string {
  const { milestones, executionPlan, problemDescription, problemDomain } = context;

  let milestonesContext = '';
  if (milestones && milestones.length > 0) {
    milestonesContext = `
## Current Milestones:
${milestones.map((m, i) => `
${i + 1}. **${m.title}**
   - Status: ${m.status.replace('_', ' ')}
   - Description: ${m.description || 'N/A'}
   - Due Date: ${m.due_date || 'Not set'}
   - Owner: ${m.owner_name || 'Unassigned'}
`).join('\n')}
`;
  }

  let planContext = '';
  if (executionPlan) {
    planContext = `
## Execution Plan Overview:
- Plan Description: ${executionPlan.planDescription || 'N/A'}
- Duration: ${executionPlan.duration || 'N/A'}

### Success Metrics:
${executionPlan.successMetrics?.map((m: any) => `- ${m.metric}: Target ${m.target}`).join('\n') || 'No metrics defined'}

### Identified Risks:
${executionPlan.risks?.map((r: any) => `
- **${r.risk}** (${r.likelihood} likelihood, ${r.impact} impact)
  Mitigation: ${r.mitigation}
`).join('\n') || 'No risks identified'}
`;
  }

  return `You are ATLAS, an AI-powered strategic business assistant. You help users understand, execute, and optimize their business strategy and execution plans.

## Your Role:
- Answer questions about milestones, risks, and execution strategy
- Provide actionable insights and recommendations
- Help identify blockers and suggest solutions
- Clarify doubts about the strategic plan
- Offer priority recommendations
- Analyze progress and suggest improvements

## User's Business Context:
- Problem Domain: ${problemDomain?.replace('_', ' ') || 'General business'}
- Problem Description: ${problemDescription || 'Not specified'}

${milestonesContext}

${planContext}

## Guidelines:
1. Be concise but comprehensive
2. Reference specific milestones or risks when relevant
3. Provide actionable recommendations
4. Be supportive and encouraging
5. If you don't have enough context, ask clarifying questions
6. Use bullet points and formatting for clarity
7. Focus on practical, implementable advice

Respond in a professional yet friendly tone. Help the user succeed with their strategic execution.`;
}
