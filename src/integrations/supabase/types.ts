export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_consulting_sessions: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          datasets_used: string[] | null
          diagnosis: Json | null
          execution_plan: Json | null
          id: string
          problem_description: string | null
          problem_domain: string | null
          scenarios: Json | null
          selected_scenario_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          datasets_used?: string[] | null
          diagnosis?: Json | null
          execution_plan?: Json | null
          id?: string
          problem_description?: string | null
          problem_domain?: string | null
          scenarios?: Json | null
          selected_scenario_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          datasets_used?: string[] | null
          diagnosis?: Json | null
          execution_plan?: Json | null
          id?: string
          problem_description?: string | null
          problem_domain?: string | null
          scenarios?: Json | null
          selected_scenario_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_consulting_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_files: {
        Row: {
          created_at: string
          file_category: string
          file_name: string
          file_size: number | null
          file_type: string
          headers: string[] | null
          id: string
          parsed_data: Json | null
          raw_data: Json | null
          row_count: number | null
          session_id: string
          status: Database["public"]["Enums"]["audit_file_status"]
          storage_path: string | null
          validation_errors: Json | null
        }
        Insert: {
          created_at?: string
          file_category: string
          file_name: string
          file_size?: number | null
          file_type: string
          headers?: string[] | null
          id?: string
          parsed_data?: Json | null
          raw_data?: Json | null
          row_count?: number | null
          session_id: string
          status?: Database["public"]["Enums"]["audit_file_status"]
          storage_path?: string | null
          validation_errors?: Json | null
        }
        Update: {
          created_at?: string
          file_category?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          headers?: string[] | null
          id?: string
          parsed_data?: Json | null
          raw_data?: Json | null
          row_count?: number | null
          session_id?: string
          status?: Database["public"]["Enums"]["audit_file_status"]
          storage_path?: string | null
          validation_errors?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_files_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "audit_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_findings: {
        Row: {
          ai_confidence: number | null
          category: string | null
          created_at: string
          description: string
          evidence: Json | null
          financial_impact: number | null
          finding_type: string
          id: string
          recommendation: string | null
          session_id: string
          severity: Database["public"]["Enums"]["finding_severity"]
          status: string | null
          title: string
        }
        Insert: {
          ai_confidence?: number | null
          category?: string | null
          created_at?: string
          description: string
          evidence?: Json | null
          financial_impact?: number | null
          finding_type: string
          id?: string
          recommendation?: string | null
          session_id: string
          severity?: Database["public"]["Enums"]["finding_severity"]
          status?: string | null
          title: string
        }
        Update: {
          ai_confidence?: number | null
          category?: string | null
          created_at?: string
          description?: string
          evidence?: Json | null
          financial_impact?: number | null
          finding_type?: string
          id?: string
          recommendation?: string | null
          session_id?: string
          severity?: Database["public"]["Enums"]["finding_severity"]
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_findings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "audit_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_questions: {
        Row: {
          answer: string | null
          context: string | null
          created_at: string
          id: string
          is_answered: boolean | null
          priority: number | null
          question: string
          session_id: string
        }
        Insert: {
          answer?: string | null
          context?: string | null
          created_at?: string
          id?: string
          is_answered?: boolean | null
          priority?: number | null
          question: string
          session_id: string
        }
        Update: {
          answer?: string | null
          context?: string | null
          created_at?: string
          id?: string
          is_answered?: boolean | null
          priority?: number | null
          question?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "audit_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_sessions: {
        Row: {
          accounting_standard: Database["public"]["Enums"]["accounting_standard"]
          ai_summary: string | null
          audit_type: Database["public"]["Enums"]["audit_type"]
          company_id: string
          compliance_status: string | null
          created_at: string
          created_by: string
          currency: string | null
          current_step: number | null
          financial_year: string | null
          id: string
          industry: string | null
          recommendations: Json | null
          risk_score: number | null
          status: Database["public"]["Enums"]["audit_session_status"]
          title: string
          updated_at: string
        }
        Insert: {
          accounting_standard?: Database["public"]["Enums"]["accounting_standard"]
          ai_summary?: string | null
          audit_type?: Database["public"]["Enums"]["audit_type"]
          company_id: string
          compliance_status?: string | null
          created_at?: string
          created_by: string
          currency?: string | null
          current_step?: number | null
          financial_year?: string | null
          id?: string
          industry?: string | null
          recommendations?: Json | null
          risk_score?: number | null
          status?: Database["public"]["Enums"]["audit_session_status"]
          title: string
          updated_at?: string
        }
        Update: {
          accounting_standard?: Database["public"]["Enums"]["accounting_standard"]
          ai_summary?: string | null
          audit_type?: Database["public"]["Enums"]["audit_type"]
          company_id?: string
          compliance_status?: string | null
          created_at?: string
          created_by?: string
          currency?: string | null
          current_step?: number | null
          financial_year?: string | null
          id?: string
          industry?: string | null
          recommendations?: Json | null
          risk_score?: number | null
          status?: Database["public"]["Enums"]["audit_session_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      business_datasets: {
        Row: {
          company_id: string
          created_at: string
          dataset_type: string
          file_path: string | null
          id: string
          name: string
          processed_data: Json | null
          raw_data: Json | null
          row_count: number | null
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          company_id: string
          created_at?: string
          dataset_type: string
          file_path?: string | null
          id?: string
          name: string
          processed_data?: Json | null
          raw_data?: Json | null
          row_count?: number | null
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          company_id?: string
          created_at?: string
          dataset_type?: string
          file_path?: string | null
          id?: string
          name?: string
          processed_data?: Json | null
          raw_data?: Json | null
          row_count?: number | null
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_datasets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      business_metrics: {
        Row: {
          arr: number | null
          burn_rate: number | null
          cac: number | null
          churn_rate: number | null
          company_id: string
          created_at: string
          customer_count: number | null
          gross_margin: number | null
          growth_rate: number | null
          id: string
          ltv: number | null
          metric_date: string
          mrr: number | null
          retention_rate: number | null
          revenue: number | null
        }
        Insert: {
          arr?: number | null
          burn_rate?: number | null
          cac?: number | null
          churn_rate?: number | null
          company_id: string
          created_at?: string
          customer_count?: number | null
          gross_margin?: number | null
          growth_rate?: number | null
          id?: string
          ltv?: number | null
          metric_date: string
          mrr?: number | null
          retention_rate?: number | null
          revenue?: number | null
        }
        Update: {
          arr?: number | null
          burn_rate?: number | null
          cac?: number | null
          churn_rate?: number | null
          company_id?: string
          created_at?: string
          customer_count?: number | null
          gross_margin?: number | null
          growth_rate?: number | null
          id?: string
          ltv?: number | null
          metric_date?: string
          mrr?: number | null
          retention_rate?: number | null
          revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_metrics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          annual_revenue: number | null
          created_at: string
          description: string | null
          employee_count: number | null
          founded_year: number | null
          gstin: string | null
          id: string
          industry: Database["public"]["Enums"]["industry_type"]
          name: string
          stage: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          annual_revenue?: number | null
          created_at?: string
          description?: string | null
          employee_count?: number | null
          founded_year?: number | null
          gstin?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"]
          name: string
          stage?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          annual_revenue?: number | null
          created_at?: string
          description?: string | null
          employee_count?: number | null
          founded_year?: number | null
          gstin?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"]
          name?: string
          stage?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      consulting_sessions: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          diagnosis: Json | null
          execution_plan: Json | null
          id: string
          problem_description: string
          problem_domain: Database["public"]["Enums"]["problem_domain"]
          recommended_strategy: string | null
          scenarios: Json | null
          status: Database["public"]["Enums"]["session_status"]
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          diagnosis?: Json | null
          execution_plan?: Json | null
          id?: string
          problem_description: string
          problem_domain: Database["public"]["Enums"]["problem_domain"]
          recommended_strategy?: string | null
          scenarios?: Json | null
          status?: Database["public"]["Enums"]["session_status"]
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          diagnosis?: Json | null
          execution_plan?: Json | null
          id?: string
          problem_description?: string
          problem_domain?: Database["public"]["Enums"]["problem_domain"]
          recommended_strategy?: string | null
          scenarios?: Json | null
          status?: Database["public"]["Enums"]["session_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consulting_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_milestones: {
        Row: {
          actual_outcome: string | null
          blockers: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          expected_outcome: string | null
          id: string
          order_index: number | null
          owner_name: string | null
          session_id: string
          status: Database["public"]["Enums"]["execution_status"] | null
          title: string
        }
        Insert: {
          actual_outcome?: string | null
          blockers?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          expected_outcome?: string | null
          id?: string
          order_index?: number | null
          owner_name?: string | null
          session_id: string
          status?: Database["public"]["Enums"]["execution_status"] | null
          title: string
        }
        Update: {
          actual_outcome?: string | null
          blockers?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          expected_outcome?: string | null
          id?: string
          order_index?: number | null
          owner_name?: string | null
          session_id?: string
          status?: Database["public"]["Enums"]["execution_status"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "execution_milestones_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_consulting_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      health_indicators: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          indicator_type: string
          is_active: boolean | null
          name: string
          recommendation: string | null
          resolved_at: string | null
          severity: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          indicator_type: string
          is_active?: boolean | null
          name: string
          recommendation?: string | null
          resolved_at?: string | null
          severity?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          indicator_type?: string
          is_active?: boolean | null
          name?: string
          recommendation?: string | null
          resolved_at?: string | null
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_indicators_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding: {
        Row: {
          company_id: string | null
          completed_at: string | null
          created_at: string
          current_step: number | null
          id: string
          primary_challenge:
            | Database["public"]["Enums"]["problem_domain"]
            | null
          user_id: string
        }
        Insert: {
          company_id?: string | null
          completed_at?: string | null
          created_at?: string
          current_step?: number | null
          id?: string
          primary_challenge?:
            | Database["public"]["Enums"]["problem_domain"]
            | null
          user_id: string
        }
        Update: {
          company_id?: string | null
          completed_at?: string | null
          created_at?: string
          current_step?: number | null
          id?: string
          primary_challenge?:
            | Database["public"]["Enums"]["problem_domain"]
            | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      playbooks: {
        Row: {
          content: Json
          created_at: string
          description: string | null
          id: string
          industry: Database["public"]["Enums"]["industry_type"] | null
          is_featured: boolean | null
          problem_domain: Database["public"]["Enums"]["problem_domain"] | null
          stage: string | null
          title: string
        }
        Insert: {
          content: Json
          created_at?: string
          description?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"] | null
          is_featured?: boolean | null
          problem_domain?: Database["public"]["Enums"]["problem_domain"] | null
          stage?: string | null
          title: string
        }
        Update: {
          content?: Json
          created_at?: string
          description?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"] | null
          is_featured?: boolean | null
          problem_domain?: Database["public"]["Enums"]["problem_domain"] | null
          stage?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      risk_agent_conversations: {
        Row: {
          company_id: string
          context_data: Json | null
          context_module: string
          created_at: string
          id: string
          messages: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          context_data?: Json | null
          context_module?: string
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          context_data?: Json | null
          context_module?: string
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_agent_conversations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_alert_history: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          category: Database["public"]["Enums"]["risk_category"]
          company_id: string
          created_at: string
          id: string
          message: string
          risk_id: string | null
          score_at_time: number | null
          severity: Database["public"]["Enums"]["risk_severity"]
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          category: Database["public"]["Enums"]["risk_category"]
          company_id: string
          created_at?: string
          id?: string
          message: string
          risk_id?: string | null
          score_at_time?: number | null
          severity: Database["public"]["Enums"]["risk_severity"]
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          category?: Database["public"]["Enums"]["risk_category"]
          company_id?: string
          created_at?: string
          id?: string
          message?: string
          risk_id?: string | null
          score_at_time?: number | null
          severity?: Database["public"]["Enums"]["risk_severity"]
        }
        Relationships: [
          {
            foreignKeyName: "risk_alert_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_alert_history_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "risk_register"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_alerts: {
        Row: {
          category: Database["public"]["Enums"]["risk_category"]
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          last_triggered_at: string | null
          threshold: number
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["risk_category"]
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          threshold?: number
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["risk_category"]
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          threshold?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_alerts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_mitigations: {
        Row: {
          ai_reasoning: string | null
          company_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          estimated_impact: number | null
          execution_milestone_id: string | null
          id: string
          priority: number
          risk_id: string
          status: Database["public"]["Enums"]["risk_status"]
          title: string
          updated_at: string
        }
        Insert: {
          ai_reasoning?: string | null
          company_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          estimated_impact?: number | null
          execution_milestone_id?: string | null
          id?: string
          priority?: number
          risk_id: string
          status?: Database["public"]["Enums"]["risk_status"]
          title: string
          updated_at?: string
        }
        Update: {
          ai_reasoning?: string | null
          company_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          estimated_impact?: number | null
          execution_milestone_id?: string | null
          id?: string
          priority?: number
          risk_id?: string
          status?: Database["public"]["Enums"]["risk_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_mitigations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_mitigations_execution_milestone_id_fkey"
            columns: ["execution_milestone_id"]
            isOneToOne: false
            referencedRelation: "execution_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_mitigations_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "risk_register"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_register: {
        Row: {
          ai_confidence: number | null
          ai_reasoning: string | null
          category: Database["public"]["Enums"]["risk_category"]
          company_id: string
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          impact: number
          likelihood: number
          mitigation_plan: string | null
          owner_name: string | null
          resolved_at: string | null
          risk_score: number | null
          severity: Database["public"]["Enums"]["risk_severity"]
          source: string | null
          status: Database["public"]["Enums"]["risk_status"]
          title: string
          updated_at: string
        }
        Insert: {
          ai_confidence?: number | null
          ai_reasoning?: string | null
          category: Database["public"]["Enums"]["risk_category"]
          company_id: string
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          impact?: number
          likelihood?: number
          mitigation_plan?: string | null
          owner_name?: string | null
          resolved_at?: string | null
          risk_score?: number | null
          severity?: Database["public"]["Enums"]["risk_severity"]
          source?: string | null
          status?: Database["public"]["Enums"]["risk_status"]
          title: string
          updated_at?: string
        }
        Update: {
          ai_confidence?: number | null
          ai_reasoning?: string | null
          category?: Database["public"]["Enums"]["risk_category"]
          company_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          impact?: number
          likelihood?: number
          mitigation_plan?: string | null
          owner_name?: string | null
          resolved_at?: string | null
          risk_score?: number | null
          severity?: Database["public"]["Enums"]["risk_severity"]
          source?: string | null
          status?: Database["public"]["Enums"]["risk_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_register_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_score_history: {
        Row: {
          category: Database["public"]["Enums"]["risk_category"]
          company_id: string
          confidence: number | null
          created_at: string
          id: string
          score: number
          snapshot_date: string
        }
        Insert: {
          category: Database["public"]["Enums"]["risk_category"]
          company_id: string
          confidence?: number | null
          created_at?: string
          id?: string
          score: number
          snapshot_date?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["risk_category"]
          company_id?: string
          confidence?: number | null
          created_at?: string
          id?: string
          score?: number
          snapshot_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_score_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_scenarios: {
        Row: {
          assumptions: Json | null
          confidence_score: number | null
          created_at: string
          description: string | null
          expected_outcome: Json | null
          id: string
          is_recommended: boolean | null
          name: string
          risk_level: string | null
          session_id: string
          time_to_impact: string | null
        }
        Insert: {
          assumptions?: Json | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          expected_outcome?: Json | null
          id?: string
          is_recommended?: boolean | null
          name: string
          risk_level?: string | null
          session_id: string
          time_to_impact?: string | null
        }
        Update: {
          assumptions?: Json | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          expected_outcome?: Json | null
          id?: string
          is_recommended?: boolean | null
          name?: string
          risk_level?: string | null
          session_id?: string
          time_to_impact?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategy_scenarios_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "consulting_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_company_with_owner: {
        Args: {
          p_annual_revenue?: number
          p_description?: string
          p_employee_count?: number
          p_founded_year?: number
          p_gstin?: string
          p_industry?: Database["public"]["Enums"]["industry_type"]
          p_name: string
          p_stage?: string
          p_website?: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_company_member: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      is_company_owner: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      accounting_standard: "ifrs" | "gaap" | "local" | "custom"
      app_role: "admin" | "member" | "viewer"
      audit_file_status: "pending" | "processing" | "processed" | "error"
      audit_session_status:
        | "setup"
        | "upload"
        | "analyzing"
        | "review"
        | "complete"
      audit_type: "financial" | "internal" | "compliance" | "tax" | "custom"
      execution_status: "not_started" | "in_progress" | "blocked" | "complete"
      finding_severity: "high" | "medium" | "low" | "info"
      industry_type:
        | "technology"
        | "healthcare"
        | "finance"
        | "retail"
        | "manufacturing"
        | "education"
        | "real_estate"
        | "hospitality"
        | "consulting"
        | "other"
      problem_domain:
        | "growth"
        | "pricing"
        | "operations"
        | "fundraising"
        | "hiring"
        | "product_strategy"
      risk_category:
        | "cyber"
        | "financial_fraud"
        | "regulatory"
        | "operational"
        | "strategic"
        | "reputational"
      risk_severity: "low" | "medium" | "high" | "critical"
      risk_status:
        | "identified"
        | "assessed"
        | "mitigating"
        | "resolved"
        | "accepted"
      session_status:
        | "intake"
        | "diagnosing"
        | "simulating"
        | "planning"
        | "complete"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      accounting_standard: ["ifrs", "gaap", "local", "custom"],
      app_role: ["admin", "member", "viewer"],
      audit_file_status: ["pending", "processing", "processed", "error"],
      audit_session_status: [
        "setup",
        "upload",
        "analyzing",
        "review",
        "complete",
      ],
      audit_type: ["financial", "internal", "compliance", "tax", "custom"],
      execution_status: ["not_started", "in_progress", "blocked", "complete"],
      finding_severity: ["high", "medium", "low", "info"],
      industry_type: [
        "technology",
        "healthcare",
        "finance",
        "retail",
        "manufacturing",
        "education",
        "real_estate",
        "hospitality",
        "consulting",
        "other",
      ],
      problem_domain: [
        "growth",
        "pricing",
        "operations",
        "fundraising",
        "hiring",
        "product_strategy",
      ],
      risk_category: [
        "cyber",
        "financial_fraud",
        "regulatory",
        "operational",
        "strategic",
        "reputational",
      ],
      risk_severity: ["low", "medium", "high", "critical"],
      risk_status: [
        "identified",
        "assessed",
        "mitigating",
        "resolved",
        "accepted",
      ],
      session_status: [
        "intake",
        "diagnosing",
        "simulating",
        "planning",
        "complete",
      ],
    },
  },
} as const
