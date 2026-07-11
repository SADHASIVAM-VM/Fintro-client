import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, FileText, BarChart2 } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { axiosInstance } from '@/lib/axios';
import { Helmet } from 'react-helmet-async';

export const Reports: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  const handleDownloadCSV = async () => {
    try {
      enqueueSnackbar('Compiling report data...', { variant: 'info' });
      const response = await axiosInstance.get('/reports/expenses/csv', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'expenses-report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      enqueueSnackbar('Expenses CSV report downloaded successfully', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to download CSV report', { variant: 'error' });
    }
  };

  return (
    <div className="space-y-6 text-left">
      <Helmet>
        <title>Reports | Fintro</title>
      </Helmet>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground text-sm font-sans mt-0.5">
          Generate financial summary reports and export tables to CSV spreadsheet formats.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-lg">
              <FileText className="h-5 w-5 text-primary" /> CSV Data Export
            </CardTitle>
            <CardDescription className="font-sans">
              Download your complete financial entries log list.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm font-sans text-muted-foreground leading-relaxed">
              Export all registered expenses, transactions details, categories, payment methods, tags, and notes directly into a standard CSV file compatible with Excel, Google Sheets, or Numbers.
            </p>
            <Button onClick={handleDownloadCSV} variant="primary" className="w-full gap-1.5 font-sans">
              <Download className="h-4.5 w-4.5" /> Export Expenses CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-lg">
              <BarChart2 className="h-5 w-5 text-indigo-500" /> Printable PDF & Excel Reports
            </CardTitle>
            <CardDescription className="font-sans">
              Export analytics summaries to PDF files.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm font-sans text-muted-foreground leading-relaxed">
              Generates high-fidelity summaries of category spending patterns, outstanding debt settlements, and room electricity unit allocations ideal for printouts or screen reviews.
            </p>
            <Button variant="outline" className="w-full gap-1.5 font-sans" onClick={() => window.print()}>
              <FileText className="h-4.5 w-4.5" /> Print Overview / PDF
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default Reports;
