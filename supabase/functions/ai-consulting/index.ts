import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DiagnosisRequest {
  type: 'diagnose' | 'scenarios' | 'execution_plan';
  companyInfo: {
    name: string;
    industry: string;
    stage: string;
    employeeCount: number;
    description?: string;
  };
  problemDomain?: string;
  problemDescription?: string;
  datasets?: {
    name: string;
    type: string;
    summary: string;
    rowCount: number;
    headers?: string[];
    sampleData?: Record<string, unknown>[];
  }[];
  selectedScenario?: {
    name: string;
    description: string;
    expectedOutcome: string;
  };
  previousDiagnosis?: any;
}

// Input sanitization function to prevent prompt injection
function sanitizeForPrompt(input: string | undefined | null, maxLength: number): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
    .replace(/[<>{}[\]]/g, '') // Remove brackets that could be used for injection
    .trim()
    .slice(0, maxLength);
}

// Validate numeric input
function sanitizeNumber(input: unknown, min: number, max: number, defaultValue: number): number {
  const num = Number(input);
  if (isNaN(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Create Supabase client and verify JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Authenticated user:", user.id);

    const body: DiagnosisRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Validate request type
    if (!['diagnose', 'scenarios', 'execution_plan'].includes(body.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields
    if (!body.companyInfo || !body.companyInfo.name) {
      return new Response(
        JSON.stringify({ error: 'Company information is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input lengths
    if (body.problemDescription && body.problemDescription.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Problem description too long (max 2000 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (body.datasets && body.datasets.length > 10) {
      return new Response(
        JSON.stringify({ error: 'Too many datasets (max 10)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize all user inputs to prevent prompt injection
    const sanitizedCompanyInfo = {
      name: sanitizeForPrompt(body.companyInfo.name, 100),
      industry: sanitizeForPrompt(body.companyInfo.industry, 50),
      stage: sanitizeForPrompt(body.companyInfo.stage, 50),
      employeeCount: sanitizeNumber(body.companyInfo.employeeCount, 1, 1000000, 1),
      description: sanitizeForPrompt(body.companyInfo.description, 500),
    };

    const sanitizedProblemDomain = sanitizeForPrompt(body.problemDomain, 100);
    const sanitizedProblemDescription = sanitizeForPrompt(body.problemDescription, 2000);

    const sanitizedDatasets = body.datasets?.slice(0, 10).map(d => ({
      name: sanitizeForPrompt(d.name, 100),
      type: sanitizeForPrompt(d.type, 50),
      summary: sanitizeForPrompt(d.summary, 500),
      rowCount: sanitizeNumber(d.rowCount, 0, 10000000, 0),
      headers: d.headers?.slice(0, 50).map(h => sanitizeForPrompt(h, 50)) || [],
      sampleData: d.sampleData?.slice(0, 50) || [],
    })) || [];

    const sanitizedSelectedScenario = body.selectedScenario ? {
      name: sanitizeForPrompt(body.selectedScenario.name, 100),
      description: sanitizeForPrompt(body.selectedScenario.description, 500),
      expectedOutcome: sanitizeForPrompt(body.selectedScenario.expectedOutcome, 200),
    } : null;

    let systemPrompt = "";
    let userPrompt = "";

    // Use sanitized values in prompts
    const companyContext = `
[USER DATA START]
Company: ${sanitizedCompanyInfo.name}
Industry: ${sanitizedCompanyInfo.industry}
Stage: ${sanitizedCompanyInfo.stage}
Team Size: ${sanitizedCompanyInfo.employeeCount} employees
${sanitizedCompanyInfo.description ? `Description: ${sanitizedCompanyInfo.description}` : ''}
[USER DATA END]
`;

    // Build detailed dataset context including actual data samples
    const datasetContext = sanitizedDatasets.length > 0
      ? sanitizedDatasets.map(d => {
          let dataDetails = `\n[DATASET: ${d.name}]\nType: ${d.type}\nTotal Records: ${d.rowCount}\nSummary: ${d.summary}`;
          
          // Include column headers if available
          if (d.headers && d.headers.length > 0) {
            dataDetails += `\nColumns: ${d.headers.join(', ')}`;
          }
          
          // Include sample data for deeper analysis
          if (d.sampleData && d.sampleData.length > 0) {
            dataDetails += `\n\nSample Data (first ${d.sampleData.length} rows):`;
            dataDetails += `\n${JSON.stringify(d.sampleData.slice(0, 20), null, 2)}`;
            
            // Calculate basic statistics for numeric columns
            if (d.headers && d.headers.length > 0) {
              const numericStats: Record<string, { min: number; max: number; avg: number; sum: number }> = {};
              
              d.headers.forEach(header => {
                const values = d.sampleData!
                  .map(row => row[header])
                  .filter(v => v !== null && v !== undefined && !isNaN(Number(v)))
                  .map(v => Number(v));
                
                if (values.length > 5) {
                  numericStats[header] = {
                    min: Math.min(...values),
                    max: Math.max(...values),
                    avg: values.reduce((a, b) => a + b, 0) / values.length,
                    sum: values.reduce((a, b) => a + b, 0),
                  };
                }
              });
              
              if (Object.keys(numericStats).length > 0) {
                dataDetails += `\n\nNumeric Column Statistics:`;
                Object.entries(numericStats).forEach(([col, stats]) => {
                  dataDetails += `\n- ${col}: min=${stats.min.toFixed(2)}, max=${stats.max.toFixed(2)}, avg=${stats.avg.toFixed(2)}, sum=${stats.sum.toFixed(2)}`;
                });
              }
            }
          }
          
          return dataDetails;
        }).join('\n\n')
      : '\nNo business data has been uploaded yet.';

    if (body.type === 'diagnose') {
      systemPrompt = `You are ATLAS, an expert AI business consultant specializing in strategic analysis and problem diagnosis. You analyze business problems with the precision of a top-tier management consultant.

IMPORTANT: When actual data samples are provided, you MUST perform deep quantitative analysis:
- Identify patterns, trends, and anomalies in the data
- Calculate and reference specific metrics from the data
- Use actual numbers and percentages from the dataset
- Highlight data points that support your findings

Your responses should be clear, actionable, and data-driven. Focus on identifying root causes and providing specific, measurable insights.

Always respond in valid JSON format with this exact structure:
{
  "rootCause": "A clear 2-3 sentence explanation of the primary root cause based on data analysis",
  "findings": [
    {"type": "critical", "text": "Critical finding with specific data references"},
    {"type": "warning", "text": "Warning level finding with metrics"},
    {"type": "insight", "text": "Positive insight or opportunity backed by data"}
  ],
  "confidence": 85,
  "keyMetrics": ["Metric 1 with actual value", "Metric 2 with benchmark", "Metric 3 to monitor"],
  "immediateActions": ["Specific action 1", "Specific action 2", "Specific action 3"],
  "dataInsights": ["Key insight derived from the actual data", "Pattern or trend identified"]
}

Include 3-5 findings with a mix of critical issues, warnings, and insights. Confidence should be higher (80-95) when real data is provided, lower (60-80) without data.`;

      userPrompt = `Analyze this business problem and provide a strategic diagnosis:

${companyContext}

[BUSINESS DATA START]
${datasetContext}
[BUSINESS DATA END]

[PROBLEM INFO START]
Problem Domain: ${sanitizedProblemDomain}
Problem Description: ${sanitizedProblemDescription}
[PROBLEM INFO END]

IMPORTANT: If actual sample data is provided above, perform deep analysis on it. Reference specific numbers, percentages, and patterns from the data in your findings. Your analysis should demonstrate that you have thoroughly examined the provided dataset.

Provide a comprehensive root cause analysis with data-backed findings.`;
    } else if (body.type === 'scenarios') {
      systemPrompt = `You are ATLAS, an expert AI business strategist. Based on the diagnosis provided, generate 3 distinct strategic scenarios for the company to consider.

Each scenario should represent a different approach with varying risk/reward profiles.

Always respond in valid JSON format with this exact structure:
{
  "scenarios": [
    {
      "id": "1",
      "name": "Scenario name",
      "description": "2-3 sentence description of the approach",
      "risk": "low|medium|high",
      "timeToImpact": "X-Y months",
      "confidence": 85,
      "expectedOutcome": "+XX% metric improvement",
      "keyActions": ["Action 1", "Action 2", "Action 3"],
      "recommended": false
    }
  ]
}

One scenario should be marked as recommended. Include varying risk levels across scenarios.`;

      userPrompt = `Based on this diagnosis, generate 3 strategic scenarios:

${companyContext}
${datasetContext}

[PROBLEM INFO START]
Problem: ${sanitizedProblemDescription}
[PROBLEM INFO END]

[PREVIOUS ANALYSIS START]
${JSON.stringify(body.previousDiagnosis, null, 2)}
[PREVIOUS ANALYSIS END]

Generate 3 distinct strategic paths with different risk/reward profiles.`;
    } else if (body.type === 'execution_plan') {
      systemPrompt = `You are ATLAS, an expert AI business consultant specializing in execution planning. Create a detailed, actionable execution plan based on the selected strategy.

Always respond in valid JSON format with this exact structure:
{
  "planTitle": "Name of the execution plan",
  "planDescription": "Overview of the plan",
  "duration": "X weeks/months",
  "milestones": [
    {
      "id": "1",
      "title": "Milestone title",
      "description": "What needs to be done",
      "week": "1-2",
      "owner": "Suggested role/title",
      "expectedOutcome": "Measurable outcome",
      "dependencies": [],
      "keyTasks": ["Task 1", "Task 2", "Task 3"]
    }
  ],
  "successMetrics": [
    {"metric": "Metric name", "target": "Target value", "timeline": "By when"}
  ],
  "risks": [
    {"risk": "Risk description", "mitigation": "How to mitigate"}
  ]
}

Include 4-6 milestones with clear timelines and ownership.`;

      userPrompt = `Create an execution plan for this selected strategy:

${companyContext}

[SELECTED STRATEGY START]
Name: ${sanitizedSelectedScenario?.name || 'N/A'}
Description: ${sanitizedSelectedScenario?.description || 'N/A'}
Expected Outcome: ${sanitizedSelectedScenario?.expectedOutcome || 'N/A'}
[SELECTED STRATEGY END]

Create a detailed, actionable execution plan with clear milestones and success metrics.`;
    }

    console.log("Calling AI gateway for type:", body.type);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Parse the JSON response
    let parsedResult;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError, content);
      return new Response(JSON.stringify({ error: "Failed to parse AI response", raw: content }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Successfully processed request for user:", user.id);

    return new Response(JSON.stringify({ result: parsedResult, type: body.type }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AI consulting error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
