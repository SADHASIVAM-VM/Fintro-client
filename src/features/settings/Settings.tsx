import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSnackbar } from 'notistack';
import { useDropzone } from 'react-dropzone';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  User,
  Shield,
  Bell,
  Sun,
  Moon,
  Globe,
  Database,
} from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { setTheme } from '@/store/themeSlice';
import { Helmet } from 'react-helmet-async';

const settingsFormSchema = z.object({
  currency: z.string().min(1, 'Currency is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  language: z.string().min(1, 'Language is required'),
  budgetLimits: z.string().optional(),
});

type SettingsFormSchema = z.infer<typeof settingsFormSchema>;

export const Settings: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);
  
  // Queries
  const { data: settings, updateSettings, restoreBackup, triggerBackupDownload, isLoading } = useSettings();

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SettingsFormSchema>({
    values: {
      currency: settings?.currency || 'INR',
      timezone: settings?.timezone || 'Asia/Kolkata',
      language: settings?.language || 'en',
      budgetLimits: settings?.budgetLimits ? String(settings?.budgetLimits) : '',
    },
  });

  // Dropzone for JSON file restore
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (!json.version || !json.exportedAt) {
          enqueueSnackbar('Invalid backup file format', { variant: 'error' });
          return;
        }
        if (confirm('Importing this backup will overwrite all current financial records. Proceed?')) {
          await restoreBackup(json);
          enqueueSnackbar('Backup successfully imported! All tables reloaded.', { variant: 'success' });
        }
      } catch {
        enqueueSnackbar('Failed to parse backup JSON file', { variant: 'error' });
      }
    };
    reader.readAsText(file);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'application/json': ['.json'] },
    maxFiles: 1,
  });

  const onSubmit = async (data: SettingsFormSchema) => {
    try {
      await updateSettings({
        currency: data.currency,
        timezone: data.timezone,
        language: data.language,
        budgetLimits: data.budgetLimits ? Number(data.budgetLimits) : undefined,
      });
      enqueueSnackbar('Settings updated', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to save settings', { variant: 'error' });
    }
  };

  const handleExportBackup = async () => {
    try {
      enqueueSnackbar('Compiling database tables...', { variant: 'info' });
      await triggerBackupDownload();
      enqueueSnackbar('Backup JSON downloaded successfully', { variant: 'success' });
    } catch {
      enqueueSnackbar('Backup export failed', { variant: 'error' });
    }
  };

  return (
    <div className="space-y-6 text-left">
      <Helmet>
        <title>Settings | Fintro</title>
      </Helmet>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm font-sans mt-0.5">
          Configure currency displays, notification flags, theme toggles, and database JSON backups.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Core preferences form */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-1.5 text-lg">
                  <Globe className="h-5 w-5 text-primary" /> Core Preferences
                </CardTitle>
                <CardDescription className="font-sans">
                  Define language, timezone, and global monthly budget indicators.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-medium leading-none">Currency Display</label>
                    <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none" {...register('currency')}>
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-medium leading-none">Timezone</label>
                    <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none" {...register('timezone')}>
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">EST (New York)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-medium leading-none">Language</label>
                    <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none" {...register('language')}>
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                  <Input label="Global Monthly Budget limit" placeholder="0.00" {...register('budgetLimits')} />
                </div>

                <div className="flex justify-end pt-4 border-t mt-6">
                  <Button type="submit" disabled={isSubmitting}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Theme card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5 text-lg">
                {theme === 'dark' ? <Moon className="h-5 w-5 text-indigo-400" /> : <Sun className="h-5 w-5 text-yellow-500" />} Theme Selector
              </CardTitle>
              <CardDescription className="font-sans">Toggle light or dark styling mode.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <span className="font-semibold block text-sm">Theme Mode</span>
                <span className="text-xs text-muted-foreground font-sans block mt-0.5">Currently active styling layout</span>
              </div>
              <Button variant="outline" onClick={() => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))} className="font-sans text-xs">
                Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Database backup card */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5 text-lg">
                <Database className="h-5 w-5 text-green-500" /> Database Backup & Restore
              </CardTitle>
              <CardDescription className="font-sans">
                Export files or restore database dumps in JSON format.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Backup */}
              <div className="space-y-2">
                <span className="font-semibold text-sm block">Export Backup</span>
                <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                  Downloads all expenses, incomes, room details, and loan records into a JSON dump.
                </p>
                <Button onClick={handleExportBackup} variant="outline" className="w-full gap-1.5 font-sans text-xs">
                  <Download className="h-4 w-4" /> Download Backup JSON
                </Button>
              </div>

              {/* Restore */}
              <div className="space-y-2 border-t pt-4">
                <span className="font-semibold text-sm block">Restore Backup</span>
                <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                  Upload a previously exported backup file to restore records. This overrides current database contents.
                </p>
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed border-input hover:bg-accent/30 rounded-lg p-6 text-center cursor-pointer transition-colors"
                >
                  <input {...getInputProps()} />
                  <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <span className="text-xs font-semibold block text-muted-foreground">
                    Drag backup file here
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default Settings;
