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
  Monitor,
  Globe,
  Database,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
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
      enqueueSnackbar('Settings updated successfully', { variant: 'success' });
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
    <div className="space-y-6 text-left font-sans pb-16 max-w-xl mx-auto animate-fade-in">
      <Helmet>
        <title>Settings — Fintro</title>
      </Helmet>

      {/* Header Banner */}
      <div className="pt-2">
        <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white">Settings</h1>
        <p className="text-xs text-zinc-400 font-medium mt-0.5">
          Configure preferences, currency, theme mode, and data backups
        </p>
      </div>

      {/* Theme Preference Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">Theme Preference</h3>
          </div>
          <span className="text-xs font-semibold text-zinc-400 capitalize">{theme} Mode Active</span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => dispatch(setTheme('light'))}
            className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${theme === 'light'
                ? 'bg-[#18181B] text-white dark:bg-white dark:text-zinc-900 border-transparent shadow-md'
                : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700 hover:bg-zinc-100'
              }`}
          >
            <Sun className="w-4 h-4" /> Light
          </button>

          <button
            type="button"
            onClick={() => dispatch(setTheme('dark'))}
            className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${theme === 'dark'
                ? 'bg-[#18181B] text-white dark:bg-white dark:text-zinc-900 border-transparent shadow-md'
                : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700 hover:bg-zinc-100'
              }`}
          >
            <Moon className="w-4 h-4" /> Dark
          </button>

          <button
            type="button"
            onClick={() => dispatch(setTheme('system'))}
            className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${theme === 'system'
                ? 'bg-[#18181B] text-white dark:bg-white dark:text-zinc-900 border-transparent shadow-md'
                : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700 hover:bg-zinc-100'
              }`}
          >
            <Monitor className="w-4 h-4" /> System
          </button>
        </div>
      </div>

      {/* Core Preferences Form Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <Globe className="w-5 h-5 text-zinc-700 dark:text-zinc-200" />
          <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">Core Regional Preferences</h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans text-left">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">Currency Display</label>
              <select
                {...register('currency')}
                className="flex h-11 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">Timezone</label>
              <select
                {...register('timezone')}
                className="flex h-11 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">EST (New York)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">Language</label>
              <select
                {...register('language')}
                className="flex h-11 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
              </select>
            </div>

            <Input
              label="Global Monthly Budget (₹)"
              placeholder="50000"
              {...register('budgetLimits')}
            />
          </div>

          <div className="pt-3 flex justify-end border-t border-zinc-100 dark:border-zinc-800">
            <Button type="submit" disabled={isSubmitting} className="rounded-full font-bold bg-[#18181B] text-white">
              {isSubmitting ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </form>
      </div>

      {/* Database Backup & Restore Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <Database className="w-5 h-5 text-emerald-500" />
          <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">Data Export & Backup Dumps</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80">
            <div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Export Complete Backup</h4>
              <p className="text-[11px] text-zinc-400 font-medium">Download all tables into a JSON dump file</p>
            </div>
            <button
              type="button"
              onClick={handleExportBackup}
              className="px-3.5 py-2 rounded-full bg-[#18181B] text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export JSON
            </button>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Restore Database Backup</h4>
            <div
              {...getRootProps()}
              className={`border border-dashed rounded-2xl p-5 text-center cursor-pointer transition-colors ${isDragActive ? 'border-zinc-900 bg-zinc-100' : 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-6 h-6 text-zinc-400 mx-auto mb-1.5" />
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 block">
                Drag & drop JSON backup file here to restore
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
