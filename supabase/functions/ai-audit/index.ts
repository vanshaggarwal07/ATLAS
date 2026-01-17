import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sanitize input to prevent prompt injection
function sanitizeInput(input: string): string {
  if (!input) return "";
  return input
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
    .replace(/[<>{}[\]]/g, "") // Remove injection-prone characters
    .replace(/\n{3,}/g, "\n\n") // Limit consecutive newlines
    .trim()
    .slice(0, 10000); // Limit length
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { sessionId, session, files } = await req.json();

    if (!sessionId || !session || !files) {
      return new Response(JSON.stringify({ error: "Missing required data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build context for AI analysis
    const auditContext = buildAuditContext(session, files);

    // Call Lovable AI for analysis
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are an expert financial auditor AI assistant. Your role is to analyze financial data and provide professional audit findings.

You must:
1. Analyze the provided financial documents thoroughly
2. Identify errors, inconsistencies, risks, and non-compliance issues
3. Classify findings by severity (high, medium, low, info)
4. Provide specific evidence with file and data references
5. Estimate financial impact where possible
6. Give actionable recommendations
7. Cite specific data points from the provided files
8. Be conservative and flag uncertainty when data is incomplete

Accounting Standard: ${session.accounting_standard?.toUpperCase() || 'IFRS'}
Audit Type: ${session.audit_type || 'Financial'}
Industry: ${session.industry || 'General'}
Currency: ${session.currency || 'INR'}

IMPORTANT: You must respond with a valid JSON object containing:
- summary: A brief executive summary of the audit (2-3 sentences)
- risk_score: Overall risk score from 0-100
- compliance_status: One of "compliant", "partial", "non_compliant"
- findings: Array of finding objects with:
  - finding_type: Category (e.g., "arithmetic_error", "duplicate_transaction", "missing_data", "compliance_issue")
  - title: Short descriptive title
  - description: Detailed explanation
  - severity: "high", "medium", "low", or "info"
  - category: Grouping category
  - evidence: Object with file_name, row_references, data_points
  - financial_impact: Estimated impact in ${session.currency || 'INR'} or null
  - recommendation: Specific action to take
  - ai_confidence: Confidence level 0-1
- questions: Array of follow-up questions if data gaps exist:
  - question: The question text
  - context: Why this question is being asked
  - priority: 1 (high) to 5 (low)
- recommendations: Array of general recommendations for improvement`;

    const userPrompt = `[AUDIT DATA START]
${auditContext}
[AUDIT DATA END]

Perform a comprehensive audit analysis on the above financial data. Check for:
1. Arithmetic accuracy (totals, calculations, debit/credit balance)
2. Duplicate transactions or entries
3. Missing required data or incomplete records
4. Unusual transactions or anomalies
5. Compliance with ${session.accounting_standard?.toUpperCase() || 'IFRS'} standards
6. Bank reconciliation issues (if bank statements provided)
7. Revenue recognition concerns
8. Expense categorization issues

Respond with a structured JSON audit report.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from AI");
    }

    // Parse AI response
    let auditResult;
    try {
      // Extract JSON from response (may be wrapped in markdown)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      const jsonStr = jsonMatch[1] || content;
      auditResult = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Create a basic response if parsing fails
      auditResult = {
        summary: "AI analysis completed but response format was unexpected. Please review manually.",
        risk_score: 50,
        compliance_status: "partial",
        findings: [],
        questions: [{
          question: "Could you provide more context about your financial records?",
          context: "AI was unable to fully parse the provided data",
          priority: 1
        }],
        recommendations: ["Consider organizing data in standard formats for better analysis"]
      };
    }

    // Save findings to database
    if (auditResult.findings && auditResult.findings.length > 0) {
      const findingsToInsert = auditResult.findings.map((f: any) => ({
        session_id: sessionId,
        finding_type: sanitizeInput(f.finding_type || 'general'),
        title: sanitizeInput(f.title || 'Untitled Finding'),
        description: sanitizeInput(f.description || ''),
        severity: ['high', 'medium', 'low', 'info'].includes(f.severity) ? f.severity : 'info',
        category: sanitizeInput(f.category || 'general'),
        evidence: f.evidence || {},
        financial_impact: typeof f.financial_impact === 'number' ? f.financial_impact : null,
        recommendation: sanitizeInput(f.recommendation || ''),
        ai_confidence: typeof f.ai_confidence === 'number' ? f.ai_confidence : 0.7,
        status: 'open',
      }));

      const { error: findingsError } = await supabase
        .from('audit_findings')
        .insert(findingsToInsert);

      if (findingsError) {
        console.error("Error saving findings:", findingsError);
      }
    }

    // Save follow-up questions
    if (auditResult.questions && auditResult.questions.length > 0) {
      const questionsToInsert = auditResult.questions.map((q: any) => ({
        session_id: sessionId,
        question: sanitizeInput(q.question || ''),
        context: sanitizeInput(q.context || ''),
        priority: typeof q.priority === 'number' ? q.priority : 1,
        is_answered: false,
      }));

      const { error: questionsError } = await supabase
        .from('audit_questions')
        .insert(questionsToInsert);

      if (questionsError) {
        console.error("Error saving questions:", questionsError);
      }
    }

    // Update session with summary
    const { error: updateError } = await supabase
      .from('audit_sessions')
      .update({
        ai_summary: sanitizeInput(auditResult.summary || ''),
        risk_score: typeof auditResult.risk_score === 'number' ? auditResult.risk_score : null,
        compliance_status: sanitizeInput(auditResult.compliance_status || 'partial'),
        recommendations: auditResult.recommendations || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error("Error updating session:", updateError);
    }

    return new Response(JSON.stringify({
      success: true,
      summary: auditResult.summary,
      findings_count: auditResult.findings?.length || 0,
      questions_count: auditResult.questions?.length || 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Audit analysis error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildAuditContext(session: any, files: any[]): string {
  let context = `AUDIT CONFIGURATION:
- Title: ${session.title || 'Untitled Audit'}
- Type: ${session.audit_type || 'financial'}
- Standard: ${session.accounting_standard?.toUpperCase() || 'IFRS'}
- Industry: ${session.industry || 'Not specified'}
- Financial Year: ${session.financial_year || 'Not specified'}
- Currency: ${session.currency || 'INR'}

UPLOADED FILES ANALYSIS:\n\n`;

  for (const file of files) {
    context += `FILE: ${file.name}
Category: ${file.category}
Columns: ${file.headers?.join(', ') || 'Unknown'}
Row Count: ${file.rowCount || 'Unknown'}

Sample Data (first 20 rows):
`;

    if (file.data && Array.isArray(file.data)) {
      const sampleData = file.data.slice(0, 20);
      for (let i = 0; i < sampleData.length; i++) {
        const row = sampleData[i];
        const rowStr = Object.entries(row)
          .map(([key, value]) => `${key}: ${value}`)
          .join(' | ');
        context += `Row ${i + 1}: ${rowStr}\n`;
      }
    }

    context += '\n---\n\n';
  }

  return sanitizeInput(context);
}
