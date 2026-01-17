import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sanitize input to prevent injection
function sanitizeInput(input: string | undefined | null, maxLength: number = 500): string {
  if (!input) return "";
  return input
    .replace(/[<>{}[\]]/g, "")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .trim()
    .slice(0, maxLength);
}

function buildPrompt(formData: any): string {
  const concerns = formData.specificConcerns || [];
  const concernLabels: Record<string, string> = {
    gst_compliance: "GST Compliance & Filing",
    income_tax: "Income Tax Optimization",
    tds_tcs: "TDS/TCS Compliance",
    transfer_pricing: "Transfer Pricing",
    international_tax: "International Taxation",
    startup_benefits: "Startup Tax Benefits",
    legal_structure: "Legal Structure Optimization",
    audit_requirements: "Audit Requirements",
    labor_laws: "Labor Law Compliance",
    intellectual_property: "Intellectual Property Protection",
    regulatory_compliance: "Industry-specific Regulations",
    dispute_resolution: "Tax Dispute Resolution"
  };

  const selectedConcerns = concerns.map((c: string) => concernLabels[c] || c).join(", ");

  return `You are an expert tax consultant and legal advisor specializing in business taxation, compliance, and corporate structuring. Analyze the following business information and provide comprehensive tax and legal recommendations.

[BUSINESS INFORMATION START]
Business Name: ${sanitizeInput(formData.businessName)}
Country: ${sanitizeInput(formData.country)}
State/Region: ${sanitizeInput(formData.state)}
City: ${sanitizeInput(formData.city)}
Legal Structure: ${sanitizeInput(formData.legalStructure)}
Business Type: ${sanitizeInput(formData.businessType)}
Year Established: ${sanitizeInput(formData.yearEstablished)}
Annual Revenue Range: ${sanitizeInput(formData.annualRevenue)}
Employee Count: ${sanitizeInput(formData.employeeCount)}
Primary Industry: ${sanitizeInput(formData.primaryIndustry)}
International Operations: ${formData.hasInternationalOperations ? "Yes" : "No"}
${formData.hasInternationalOperations ? `International Countries: ${sanitizeInput(formData.internationalCountries)}` : ""}

CURRENT COMPLIANCE STATUS:
- GST Registration: ${formData.hasGSTRegistration ? `Yes (${sanitizeInput(formData.gstNumber)})` : "No"}
- PAN Card: ${formData.hasPANCard ? `Yes (${sanitizeInput(formData.panNumber)})` : "No"}
- TAN Number: ${formData.hasTANNumber ? `Yes (${sanitizeInput(formData.tanNumber)})` : "No"}
- Filing Frequency: ${sanitizeInput(formData.filingFrequency)}
- Last Filing Date: ${sanitizeInput(formData.lastFilingDate)}

SPECIFIC CONCERNS: ${selectedConcerns || "General tax and legal review"}

ADDITIONAL DETAILS: ${sanitizeInput(formData.additionalDetails, 1000)}
[BUSINESS INFORMATION END]

Provide a comprehensive analysis in the following JSON format. Be specific to the business location and structure mentioned. If the country is India, provide India-specific tax regimes, rates, and compliance requirements.

{
  "taxRegime": {
    "name": "Name of applicable tax regime (e.g., GST + Income Tax for India)",
    "description": "Brief description of the tax framework applicable",
    "applicableRates": [
      {"category": "Tax Type", "rate": "Rate or range"}
    ],
    "keyFeatures": ["Key feature 1", "Key feature 2"]
  },
  "jurisdictions": {
    "primary": "Primary business jurisdiction",
    "secondary": ["Other applicable jurisdictions"],
    "considerations": ["Key jurisdictional considerations"]
  },
  "complianceGaps": [
    {
      "gap": "Identified compliance gap",
      "severity": "high|medium|low",
      "recommendation": "Specific action to address"
    }
  ],
  "taxLiability": {
    "estimatedAnnual": "Estimated annual tax liability range based on revenue",
    "breakdown": [
      {"category": "Tax type", "amount": "Estimated amount", "percentage": "% of total"}
    ],
    "notes": ["Important notes about estimation"]
  },
  "deductionOpportunities": [
    {
      "category": "Deduction category",
      "potentialSavings": "Estimated savings",
      "description": "Description of opportunity",
      "requirements": ["Requirement 1", "Requirement 2"]
    }
  ],
  "optimizationRecommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed description",
      "potentialImpact": "Potential tax savings or benefit",
      "implementationSteps": ["Step 1", "Step 2"],
      "priority": "high|medium|low"
    }
  ],
  "legalStructureSuggestions": {
    "currentAnalysis": "Analysis of current legal structure",
    "recommendations": [
      {
        "structure": "Alternative structure name",
        "benefits": ["Benefit 1", "Benefit 2"],
        "considerations": ["Consideration 1"],
        "suitability": "High|Medium|Low"
      }
    ]
  },
  "nextSteps": {
    "immediate": ["Urgent actions within 1 week"],
    "shortTerm": ["Actions within 1-3 months"],
    "longTerm": ["Strategic actions for 6-12 months"]
  }
}

IMPORTANT: Respond ONLY with valid JSON, no markdown code blocks or additional text. Provide realistic and actionable recommendations based on the business profile.`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData } = await req.json();
    
    if (!formData) {
      console.error("No form data provided");
      return new Response(
        JSON.stringify({ error: "Form data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing tax & legal analysis for:", sanitizeInput(formData.businessName));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = buildPrompt(formData);
    console.log("Sending request to Lovable AI Gateway for tax & legal analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert tax consultant and legal advisor. Always respond with valid JSON only, no markdown code blocks or additional text."
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 6000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI service is busy. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service quota exceeded. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI analysis failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("Lovable AI response received");

    const textContent = data.choices?.[0]?.message?.content;
    if (!textContent) {
      console.error("No content in AI response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "No response from AI. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean and parse JSON response
    let cleanedContent = textContent.trim();
    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent.slice(7);
    }
    if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.slice(3);
    }
    if (cleanedContent.endsWith("```")) {
      cleanedContent = cleanedContent.slice(0, -3);
    }
    cleanedContent = cleanedContent.trim();

    let analysisResult;
    try {
      analysisResult = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw content:", cleanedContent.substring(0, 500));
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Tax & legal analysis completed successfully");
    
    return new Response(
      JSON.stringify(analysisResult),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ai-tax-legal function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
