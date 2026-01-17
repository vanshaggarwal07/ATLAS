import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BrandingFormData {
  businessName: string;
  industry: string;
  businessDescription: string;
  businessStage: string;
  yearFounded: string;
  teamSize: string;
  currentRevenue: string;
  brandTone: string[];
  existingBranding: boolean;
  brandColors: string;
  brandValues: string;
  competitors: string;
  uniqueSellingPoint: string;
  targetAgeGroups: string[];
  targetGender: string;
  targetLocation: string;
  targetIncome: string;
  targetPainPoints: string;
  customerPersona: string;
  digitalGoals: string[];
  budget: string;
  timeline: string;
  hasWebsite: boolean;
  hasSocialMedia: boolean;
  currentChallenges: string;
}

function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/[<>{}[\]]/g, '')
    .slice(0, 2000);
}

function buildPrompt(formData: BrandingFormData): string {
  const sanitizedData = {
    businessName: sanitizeInput(formData.businessName),
    industry: sanitizeInput(formData.industry),
    businessDescription: sanitizeInput(formData.businessDescription),
    businessStage: sanitizeInput(formData.businessStage),
    teamSize: sanitizeInput(formData.teamSize),
    currentRevenue: sanitizeInput(formData.currentRevenue),
    brandTone: formData.brandTone.map(sanitizeInput).join(', '),
    existingBranding: formData.existingBranding,
    brandColors: sanitizeInput(formData.brandColors),
    brandValues: sanitizeInput(formData.brandValues),
    competitors: sanitizeInput(formData.competitors),
    uniqueSellingPoint: sanitizeInput(formData.uniqueSellingPoint),
    targetAgeGroups: formData.targetAgeGroups.join(', '),
    targetGender: sanitizeInput(formData.targetGender),
    targetLocation: sanitizeInput(formData.targetLocation),
    targetIncome: sanitizeInput(formData.targetIncome),
    targetPainPoints: sanitizeInput(formData.targetPainPoints),
    customerPersona: sanitizeInput(formData.customerPersona),
    digitalGoals: formData.digitalGoals.join(', '),
    budget: sanitizeInput(formData.budget),
    timeline: sanitizeInput(formData.timeline),
    hasWebsite: formData.hasWebsite,
    hasSocialMedia: formData.hasSocialMedia,
    currentChallenges: sanitizeInput(formData.currentChallenges),
  };

  return `You are an expert brand strategist and design consultant specializing in MSME and Startup branding in India. Generate a comprehensive branding strategy based on the following business information.

[BUSINESS INFORMATION START]
Business Name: ${sanitizedData.businessName}
Industry: ${sanitizedData.industry}
Description: ${sanitizedData.businessDescription}
Stage: ${sanitizedData.businessStage}
Team Size: ${sanitizedData.teamSize}
Current Revenue: ${sanitizedData.currentRevenue}

Brand Tone: ${sanitizedData.brandTone}
Has Existing Branding: ${sanitizedData.existingBranding}
Current Brand Colors: ${sanitizedData.brandColors || 'None'}
Brand Values: ${sanitizedData.brandValues}
Competitors: ${sanitizedData.competitors}
Unique Selling Point: ${sanitizedData.uniqueSellingPoint}

Target Age Groups: ${sanitizedData.targetAgeGroups}
Target Gender: ${sanitizedData.targetGender}
Target Location: ${sanitizedData.targetLocation}
Target Income: ${sanitizedData.targetIncome}
Customer Pain Points: ${sanitizedData.targetPainPoints}
Customer Persona: ${sanitizedData.customerPersona}

Digital Goals: ${sanitizedData.digitalGoals}
Budget: ${sanitizedData.budget}
Timeline: ${sanitizedData.timeline}
Has Website: ${sanitizedData.hasWebsite}
Has Social Media: ${sanitizedData.hasSocialMedia}
Current Challenges: ${sanitizedData.currentChallenges}
[BUSINESS INFORMATION END]

Generate a detailed JSON response with the following structure. Ensure all cost estimates are in INR (Indian Rupees) and relevant to the Indian market:

{
  "brandStrategy": {
    "summary": "A 2-3 sentence executive summary of the brand strategy",
    "missionStatement": "A compelling mission statement for the business",
    "visionStatement": "An aspirational vision statement",
    "coreValues": ["Value 1", "Value 2", "Value 3", "Value 4", "Value 5"]
  },
  "visualIdentity": {
    "colorPalette": [
      { "name": "Primary", "hex": "#hexcode", "usage": "Main brand color for headers, CTAs" },
      { "name": "Secondary", "hex": "#hexcode", "usage": "Supporting color for backgrounds" },
      { "name": "Accent", "hex": "#hexcode", "usage": "Highlights and interactive elements" },
      { "name": "Neutral", "hex": "#hexcode", "usage": "Text and backgrounds" }
    ],
    "typography": {
      "primary": "Font name for headings (with reasoning)",
      "secondary": "Font name for body text",
      "accent": "Font for special elements"
    },
    "logoGuidelines": [
      "Guideline 1 for logo design",
      "Guideline 2",
      "Guideline 3"
    ],
    "visualStyle": "Description of overall visual aesthetic"
  },
  "websiteStructure": {
    "pages": [
      {
        "name": "Home",
        "purpose": "Purpose of this page",
        "keyElements": ["Hero section", "Value proposition", "CTA"]
      }
    ],
    "recommendedFeatures": ["Feature 1", "Feature 2"],
    "techStack": ["Technology 1", "Technology 2"]
  },
  "brandKit": {
    "essentialAssets": ["Logo variations", "Business cards", "Letterhead"],
    "socialMediaTemplates": ["Instagram post", "LinkedIn banner"],
    "marketingCollateral": ["Brochure", "Presentation deck"]
  },
  "costEstimate": {
    "logoDesign": { "low": 15000, "high": 50000 },
    "websiteDevelopment": { "low": 50000, "high": 300000 },
    "brandCollateral": { "low": 20000, "high": 80000 },
    "digitalMarketing": { "low": 25000, "high": 100000 },
    "total": { "low": 110000, "high": 530000 }
  },
  "actionPlan": [
    {
      "phase": "Phase 1: Foundation",
      "duration": "2-4 weeks",
      "tasks": ["Task 1", "Task 2", "Task 3"],
      "priority": "High"
    }
  ],
  "tips": [
    "Actionable tip 1 specific to their business",
    "Tip 2",
    "Tip 3",
    "Tip 4",
    "Tip 5"
  ]
}

Important guidelines:
1. Make recommendations specific to the ${sanitizedData.industry} industry in India
2. Consider the ${sanitizedData.budget} budget range when suggesting costs
3. Align the brand tone with the selected preferences: ${sanitizedData.brandTone}
4. Target audience consideration: ${sanitizedData.targetAgeGroups} in ${sanitizedData.targetLocation}
5. Provide realistic cost estimates for the Indian market (MSME-friendly)
6. Include practical, actionable tips for startups/MSMEs
7. Ensure color palette is harmonious and accessible
8. Website structure should align with their digital goals: ${sanitizedData.digitalGoals}

IMPORTANT: Return ONLY valid JSON, no markdown formatting or code blocks.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData } = await req.json();
    
    if (!formData || !formData.businessName) {
      return new Response(
        JSON.stringify({ error: "Business name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = buildPrompt(formData);
    console.log("Sending request to Lovable AI Gateway for branding analysis...");

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
            content: "You are an expert brand strategist and design consultant. Always respond with valid JSON only, no markdown code blocks or additional text."
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
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

    // Parse the JSON response
    let result;
    try {
      // Remove any markdown code blocks if present
      const cleanedContent = textContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      result = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, "Content:", textContent);
      
      // Return a fallback structure if parsing fails
      result = generateFallbackResult(formData);
    }

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Branding analysis error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateFallbackResult(formData: BrandingFormData) {
  return {
    brandStrategy: {
      summary: `A strategic brand positioning for ${formData.businessName} in the ${formData.industry} industry, focused on building trust and recognition with your target audience.`,
      missionStatement: `To deliver exceptional ${formData.industry} solutions that empower our customers and create lasting value.`,
      visionStatement: `To become a leading name in ${formData.industry}, known for innovation and customer-centric approach.`,
      coreValues: ["Quality", "Innovation", "Customer Focus", "Integrity", "Growth"]
    },
    visualIdentity: {
      colorPalette: [
        { name: "Primary", hex: "#2563EB", usage: "Main brand color for headers, CTAs" },
        { name: "Secondary", hex: "#7C3AED", usage: "Supporting color for accents" },
        { name: "Accent", hex: "#10B981", usage: "Success states and highlights" },
        { name: "Neutral", hex: "#1F2937", usage: "Text and backgrounds" }
      ],
      typography: {
        primary: "Inter - Modern and professional for headings",
        secondary: "Open Sans - Clean and readable for body text",
        accent: "Poppins - Contemporary for special elements"
      },
      logoGuidelines: [
        "Keep the logo simple and memorable",
        "Ensure it works in both color and monochrome",
        "Maintain clear space around the logo",
        "Use vector formats for scalability"
      ],
      visualStyle: "Modern, clean, and professional with a focus on clarity and trust"
    },
    websiteStructure: {
      pages: [
        { name: "Home", purpose: "First impression and value proposition", keyElements: ["Hero section", "Key benefits", "Social proof", "CTA"] },
        { name: "About", purpose: "Build trust and tell your story", keyElements: ["Company story", "Team", "Mission/Vision", "Values"] },
        { name: "Services/Products", purpose: "Showcase offerings", keyElements: ["Service cards", "Pricing", "Features", "Comparison"] },
        { name: "Contact", purpose: "Convert visitors to leads", keyElements: ["Contact form", "Location", "Phone/Email", "Business hours"] }
      ],
      recommendedFeatures: ["Mobile responsive design", "Fast loading speed", "SEO optimization", "Analytics integration", "Contact forms"],
      techStack: ["React/Next.js", "Tailwind CSS", "Node.js", "PostgreSQL"]
    },
    brandKit: {
      essentialAssets: ["Primary logo", "Logo variations", "Favicon", "Business cards", "Email signature"],
      socialMediaTemplates: ["Instagram post templates", "LinkedIn banner", "Facebook cover", "Story templates"],
      marketingCollateral: ["Company brochure", "Presentation deck", "Product catalog", "Flyers"]
    },
    costEstimate: {
      logoDesign: { low: 15000, high: 50000 },
      websiteDevelopment: { low: 75000, high: 250000 },
      brandCollateral: { low: 25000, high: 75000 },
      digitalMarketing: { low: 30000, high: 100000 },
      total: { low: 145000, high: 475000 }
    },
    actionPlan: [
      { phase: "Phase 1: Brand Foundation", duration: "2-3 weeks", tasks: ["Finalize brand strategy", "Design logo", "Create brand guidelines", "Choose color palette"], priority: "High" },
      { phase: "Phase 2: Digital Presence", duration: "4-6 weeks", tasks: ["Design website", "Develop website", "Set up social media profiles", "Create content calendar"], priority: "High" },
      { phase: "Phase 3: Marketing Launch", duration: "2-4 weeks", tasks: ["Create marketing collateral", "Launch social media", "Set up analytics", "Begin content marketing"], priority: "Medium" },
      { phase: "Phase 4: Growth & Optimization", duration: "Ongoing", tasks: ["Monitor analytics", "A/B testing", "Customer feedback", "Iterate and improve"], priority: "Medium" }
    ],
    tips: [
      "Start with a simple, memorable logo that scales well across all platforms",
      "Maintain consistency across all touchpoints - use the same colors, fonts, and tone",
      "Focus on mobile-first design as majority of your audience will access via smartphones",
      "Build your social media presence before launching your website for initial traction",
      "Collect customer testimonials early and use them in your marketing materials"
    ]
  };
}
