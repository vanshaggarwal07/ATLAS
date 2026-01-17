import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Download,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  Shield,
  BarChart3,
  Calendar,
  Building2,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface AuditReportProps {
  sessionId: string;
}

export function AuditReport({ sessionId }: AuditReportProps) {
  // Fetch session
  const { data: session } = useQuery({
    queryKey: ['audit-session', sessionId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('audit_sessions' as any)
        .select('*')
        .eq('id', sessionId)
        .single() as any);
      if (error) throw error;
      return data;
    },
  });

  // Fetch findings
  const { data: findings } = useQuery({
    queryKey: ['audit-findings', sessionId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('audit_findings' as any)
        .select('*')
        .eq('session_id', sessionId)
        .order('severity', { ascending: true }) as any);
      if (error) throw error;
      return data;
    },
  });

  // Fetch files
  const { data: files } = useQuery({
    queryKey: ['audit-files', sessionId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('audit_files' as any)
        .select('*')
        .eq('session_id', sessionId) as any);
      if (error) throw error;
      return data;
    },
  });

  const findingCounts = {
    high: findings?.filter(f => f.severity === 'high').length || 0,
    medium: findings?.filter(f => f.severity === 'medium').length || 0,
    low: findings?.filter(f => f.severity === 'low').length || 0,
    info: findings?.filter(f => f.severity === 'info').length || 0,
  };

  const totalImpact = findings?.reduce((sum, f) => sum + (Number(f.financial_impact) || 0), 0) || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: session?.currency || 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskLevel = () => {
    if (findingCounts.high > 3) return { level: 'Critical', color: 'text-red-500', bg: 'bg-red-500' };
    if (findingCounts.high > 0) return { level: 'High', color: 'text-red-500', bg: 'bg-red-500' };
    if (findingCounts.medium > 3) return { level: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    if (findingCounts.medium > 0) return { level: 'Low-Medium', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    return { level: 'Low', color: 'text-green-500', bg: 'bg-green-500' };
  };

  const riskLevel = getRiskLevel();

  const handleExportPDF = async () => {
    try {
      toast.loading('Generating PDF report...', { id: 'pdf-export' });
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = margin;

      // Helper function to add new page if needed
      const checkNewPage = (requiredSpace: number = 30) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // Header
      doc.setFillColor(59, 130, 246); // Primary blue
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('AI Audit Report', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(session?.title || 'Audit Session', pageWidth / 2, 32, { align: 'center' });

      yPos = 55;
      doc.setTextColor(0, 0, 0);

      // Report Info Box
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 35, 3, 3, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const infoY = yPos + 12;
      const colWidth = (pageWidth - 2 * margin) / 4;
      
      doc.text('Audit Type', margin + 5, infoY);
      doc.text('Standard', margin + colWidth + 5, infoY);
      doc.text('Financial Year', margin + colWidth * 2 + 5, infoY);
      doc.text('Report Date', margin + colWidth * 3 + 5, infoY);
      
      doc.setFont('helvetica', 'normal');
      doc.text((session?.audit_type || 'N/A').toUpperCase(), margin + 5, infoY + 10);
      doc.text((session?.accounting_standard || 'N/A').toUpperCase(), margin + colWidth + 5, infoY + 10);
      doc.text(session?.financial_year || 'Not specified', margin + colWidth * 2 + 5, infoY + 10);
      doc.text(new Date().toLocaleDateString('en-IN'), margin + colWidth * 3 + 5, infoY + 10);

      yPos += 45;

      // Executive Summary Section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text('Executive Summary', margin, yPos);
      yPos += 10;

      // Risk Assessment
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Overall Risk Assessment:', margin, yPos);
      
      const riskScore = session?.risk_score || Math.min(findingCounts.high * 25 + findingCounts.medium * 10, 100);
      
      // Set color based on risk
      if (riskLevel.level === 'Critical' || riskLevel.level === 'High') {
        doc.setTextColor(220, 38, 38); // Red
      } else if (riskLevel.level === 'Medium' || riskLevel.level === 'Low-Medium') {
        doc.setTextColor(202, 138, 4); // Yellow/amber
      } else {
        doc.setTextColor(22, 163, 74); // Green
      }
      doc.text(`${riskLevel.level} (${riskScore}%)`, margin + 55, yPos);
      
      yPos += 15;
      doc.setTextColor(0, 0, 0);

      // Findings Summary Table
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Findings Summary:', margin, yPos);
      yPos += 8;

      (doc as any).autoTable({
        startY: yPos,
        head: [['Severity', 'Count', 'Description']],
        body: [
          ['High Risk', findingCounts.high.toString(), 'Critical issues requiring immediate attention'],
          ['Medium Risk', findingCounts.medium.toString(), 'Important issues to address soon'],
          ['Low Risk', findingCounts.low.toString(), 'Minor issues for improvement'],
          ['Informational', findingCounts.info.toString(), 'Observations and notes'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        margin: { left: margin, right: margin },
        styles: { fontSize: 10 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Total Financial Impact
      doc.setFont('helvetica', 'bold');
      doc.text('Estimated Financial Impact:', margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(formatCurrency(totalImpact), margin + 55, yPos);
      yPos += 15;

      // AI Summary
      if (session?.ai_summary) {
        checkNewPage(50);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('AI Analysis Summary:', margin, yPos);
        yPos += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const splitSummary = doc.splitTextToSize(session.ai_summary, pageWidth - 2 * margin);
        doc.text(splitSummary, margin, yPos);
        yPos += splitSummary.length * 5 + 10;
      }

      // Key Findings Section
      checkNewPage(40);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text('Key Findings', margin, yPos);
      yPos += 10;
      doc.setTextColor(0, 0, 0);

      const keyFindings = findings?.filter(f => f.severity === 'high' || f.severity === 'medium') || [];
      
      if (keyFindings.length > 0) {
        const findingsData = keyFindings.map((finding, index) => [
          (index + 1).toString(),
          finding.title,
          finding.severity.toUpperCase(),
          finding.description?.substring(0, 100) + (finding.description?.length > 100 ? '...' : '') || 'N/A',
        ]);

        (doc as any).autoTable({
          startY: yPos,
          head: [['#', 'Finding', 'Severity', 'Description']],
          body: findingsData,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246], textColor: 255 },
          margin: { left: margin, right: margin },
          styles: { fontSize: 9 },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 40 },
            2: { cellWidth: 25 },
            3: { cellWidth: 'auto' },
          },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('No critical findings detected.', margin, yPos);
        yPos += 15;
      }

      // Recommendations Section
      if (session?.recommendations && Array.isArray(session.recommendations) && session.recommendations.length > 0) {
        checkNewPage(40);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246);
        doc.text('Recommendations', margin, yPos);
        yPos += 10;
        doc.setTextColor(0, 0, 0);

        const recsData = session.recommendations.map((rec: any, index: number) => [
          (index + 1).toString(),
          typeof rec === 'string' ? rec : rec.description || JSON.stringify(rec),
        ]);

        (doc as any).autoTable({
          startY: yPos,
          head: [['#', 'Recommendation']],
          body: recsData,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246], textColor: 255 },
          margin: { left: margin, right: margin },
          styles: { fontSize: 9 },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 'auto' },
          },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // Documents Reviewed Section
      if (files && files.length > 0) {
        checkNewPage(40);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246);
        doc.text('Documents Reviewed', margin, yPos);
        yPos += 10;
        doc.setTextColor(0, 0, 0);

        const filesData = files.map((file: any) => [
          file.file_name,
          file.file_category.replace('_', ' '),
          file.row_count?.toString() || 'N/A',
          file.status || 'Processed',
        ]);

        (doc as any).autoTable({
          startY: yPos,
          head: [['File Name', 'Category', 'Rows', 'Status']],
          body: filesData,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246], textColor: 255 },
          margin: { left: margin, right: margin },
          styles: { fontSize: 9 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // All Findings Detail (if there are any)
      if (findings && findings.length > 0) {
        checkNewPage(40);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246);
        doc.text('Detailed Findings', margin, yPos);
        yPos += 10;
        doc.setTextColor(0, 0, 0);

        findings.forEach((finding: any, index: number) => {
          checkNewPage(50);
          
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(`${index + 1}. ${finding.title}`, margin, yPos);
          
          // Severity badge
          const severityColor = finding.severity === 'high' ? [220, 38, 38] : 
                               finding.severity === 'medium' ? [202, 138, 4] : 
                               finding.severity === 'low' ? [59, 130, 246] : [100, 100, 100];
          doc.setFillColor(severityColor[0], severityColor[1], severityColor[2]);
          const severityText = finding.severity.toUpperCase();
          const textWidth = doc.getTextWidth(severityText) + 6;
          doc.roundedRect(pageWidth - margin - textWidth, yPos - 5, textWidth, 7, 1, 1, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.text(severityText, pageWidth - margin - textWidth + 3, yPos);
          
          doc.setTextColor(0, 0, 0);
          yPos += 8;
          
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          const splitDesc = doc.splitTextToSize(finding.description || 'No description', pageWidth - 2 * margin);
          doc.text(splitDesc, margin, yPos);
          yPos += splitDesc.length * 4 + 5;
          
          if (finding.recommendation) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(59, 130, 246);
            doc.text('Recommendation:', margin, yPos);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            yPos += 5;
            const splitRec = doc.splitTextToSize(finding.recommendation, pageWidth - 2 * margin);
            doc.text(splitRec, margin, yPos);
            yPos += splitRec.length * 4 + 5;
          }
          
          if (finding.financial_impact) {
            doc.setFont('helvetica', 'bold');
            doc.text('Financial Impact:', margin, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(formatCurrency(Number(finding.financial_impact)), margin + 35, yPos);
            yPos += 8;
          }
          
          yPos += 5;
        });
      }

      // Footer on each page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Disclaimer
        doc.setFillColor(245, 247, 250);
        doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');
        
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text(
          'Disclaimer: This AI-generated audit report is for informational purposes only and should not substitute professional audit services.',
          pageWidth / 2, pageHeight - 17, { align: 'center' }
        );
        
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Page ${i} of ${pageCount} | Generated on ${new Date().toLocaleString('en-IN')}`,
          pageWidth / 2, pageHeight - 10, { align: 'center' }
        );
      }

      // Save the PDF
      const fileName = `Audit_Report_${session?.title?.replace(/\s+/g, '_') || 'Session'}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast.success('PDF report downloaded successfully!', { id: 'pdf-export' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.', { id: 'pdf-export' });
    }
  };

  const handleExportExcel = async () => {
    try {
      toast.loading('Generating Excel report...', { id: 'excel-export' });
      
      // Dynamic import to avoid loading heavy library upfront
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      
      // Summary Sheet
      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.columns = [
        { header: 'Field', key: 'field', width: 30 },
        { header: 'Value', key: 'value', width: 50 },
      ];
      
      summarySheet.addRows([
        { field: 'Audit Title', value: session?.title || 'N/A' },
        { field: 'Audit Type', value: session?.audit_type?.toUpperCase() || 'N/A' },
        { field: 'Accounting Standard', value: session?.accounting_standard?.toUpperCase() || 'N/A' },
        { field: 'Financial Year', value: session?.financial_year || 'N/A' },
        { field: 'Report Date', value: new Date().toLocaleDateString('en-IN') },
        { field: 'Risk Level', value: riskLevel.level },
        { field: 'Risk Score', value: `${session?.risk_score || Math.min(findingCounts.high * 25 + findingCounts.medium * 10, 100)}%` },
        { field: 'Total Financial Impact', value: formatCurrency(totalImpact) },
        { field: 'High Risk Findings', value: findingCounts.high },
        { field: 'Medium Risk Findings', value: findingCounts.medium },
        { field: 'Low Risk Findings', value: findingCounts.low },
        { field: 'Informational Findings', value: findingCounts.info },
      ]);
      
      // Style header row
      summarySheet.getRow(1).font = { bold: true };
      summarySheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF3B82F6' },
      };
      summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      // Findings Sheet
      if (findings && findings.length > 0) {
        const findingsSheet = workbook.addWorksheet('Findings');
        findingsSheet.columns = [
          { header: 'Title', key: 'title', width: 30 },
          { header: 'Severity', key: 'severity', width: 15 },
          { header: 'Category', key: 'category', width: 20 },
          { header: 'Description', key: 'description', width: 50 },
          { header: 'Recommendation', key: 'recommendation', width: 50 },
          { header: 'Financial Impact', key: 'financial_impact', width: 20 },
          { header: 'AI Confidence', key: 'ai_confidence', width: 15 },
        ];
        
        findings.forEach((finding: any) => {
          findingsSheet.addRow({
            title: finding.title,
            severity: finding.severity?.toUpperCase(),
            category: finding.category || 'N/A',
            description: finding.description,
            recommendation: finding.recommendation || 'N/A',
            financial_impact: finding.financial_impact ? formatCurrency(Number(finding.financial_impact)) : 'N/A',
            ai_confidence: finding.ai_confidence ? `${Math.round(finding.ai_confidence * 100)}%` : 'N/A',
          });
        });
        
        findingsSheet.getRow(1).font = { bold: true };
        findingsSheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF3B82F6' },
        };
        findingsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      }

      // Documents Sheet
      if (files && files.length > 0) {
        const filesSheet = workbook.addWorksheet('Documents');
        filesSheet.columns = [
          { header: 'File Name', key: 'file_name', width: 40 },
          { header: 'Category', key: 'category', width: 25 },
          { header: 'Row Count', key: 'row_count', width: 15 },
          { header: 'Status', key: 'status', width: 15 },
        ];
        
        files.forEach((file: any) => {
          filesSheet.addRow({
            file_name: file.file_name,
            category: file.file_category?.replace('_', ' '),
            row_count: file.row_count || 'N/A',
            status: file.status || 'Processed',
          });
        });
        
        filesSheet.getRow(1).font = { bold: true };
        filesSheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF3B82F6' },
        };
        filesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      }

      // Generate and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Audit_Report_${session?.title?.replace(/\s+/g, '_') || 'Session'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Excel report downloaded successfully!', { id: 'excel-export' });
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast.error('Failed to generate Excel. Please try again.', { id: 'excel-export' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card className="border-2">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">AI Audit Report</CardTitle>
          <CardDescription className="text-lg">
            {session?.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Audit Type</p>
              <p className="font-semibold capitalize">{session?.audit_type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Standard</p>
              <p className="font-semibold uppercase">{session?.accounting_standard}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Financial Year</p>
              <p className="font-semibold">{session?.financial_year || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Report Date</p>
              <p className="font-semibold">{new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Risk Score */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full ${riskLevel.bg}/20 flex items-center justify-center`}>
                <Shield className={`w-8 h-8 ${riskLevel.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Risk Assessment</p>
                <p className={`text-2xl font-bold ${riskLevel.color}`}>{riskLevel.level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Risk Score</p>
              <p className={`text-3xl font-bold ${riskLevel.color}`}>
                {session?.risk_score || Math.min(findingCounts.high * 25 + findingCounts.medium * 10, 100)}%
              </p>
            </div>
          </div>

          {/* Finding Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="font-medium">High Risk</span>
              </div>
              <p className="text-3xl font-bold text-red-500">{findingCounts.high}</p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">Medium Risk</span>
              </div>
              <p className="text-3xl font-bold text-yellow-500">{findingCounts.medium}</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Low Risk</span>
              </div>
              <p className="text-3xl font-bold text-blue-500">{findingCounts.low}</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-medium">Total Impact</span>
              </div>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalImpact)}</p>
            </div>
          </div>

          {/* AI Summary */}
          {session?.ai_summary && (
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">AI Analysis Summary</h4>
              <p className="text-muted-foreground">{session.ai_summary}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Findings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Key Findings
          </CardTitle>
          <CardDescription>
            Critical issues requiring immediate attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {findings?.filter(f => f.severity === 'high' || f.severity === 'medium').slice(0, 5).map((finding, index) => (
              <div key={finding.id} className="flex gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  finding.severity === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">{finding.title}</h4>
                    <Badge variant={finding.severity === 'high' ? 'destructive' : 'secondary'}>
                      {finding.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{finding.description}</p>
                  {finding.recommendation && (
                    <p className="text-sm text-primary mt-2">
                      <strong>Recommendation:</strong> {finding.recommendation}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {(!findings || findings.filter(f => f.severity === 'high' || f.severity === 'medium').length === 0) && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-muted-foreground">No critical findings detected</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {session?.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(Array.isArray(session.recommendations) ? session.recommendations : []).map((rec: any, index: number) => (
                <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm">{typeof rec === 'string' ? rec : rec.description || JSON.stringify(rec)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents Reviewed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents Reviewed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {files?.map((file) => (
              <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.row_count} rows • {file.file_category.replace('_', ' ')}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Report
          </CardTitle>
          <CardDescription>
            Download the audit report in your preferred format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleExportPDF} className="gap-2">
              <FileText className="w-4 h-4" />
              Download PDF Report
            </Button>
            <Button variant="outline" onClick={handleExportExcel} className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Download Excel Summary
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <p className="font-medium mb-2">Disclaimer</p>
        <p>
          This AI-generated audit report is intended to assist in identifying potential issues and risks.
          It should not be considered a substitute for a formal audit conducted by qualified professionals.
          The findings and recommendations are based on the data provided and AI analysis.
          Please consult with certified auditors for official audit opinions.
        </p>
      </div>
    </div>
  );
}
