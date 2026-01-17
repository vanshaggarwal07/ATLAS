-- Add GSTIN column to companies table
ALTER TABLE public.companies 
ADD COLUMN gstin TEXT;