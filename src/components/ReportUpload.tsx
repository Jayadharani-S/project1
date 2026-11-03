import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  RefreshCw,
  FileUp,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { PatientProfile } from '../types';
import { formatFriendlyErrorMessage, is503OrUnavailableError } from '../utils/errorUtils';

interface ReportUploadProps {
  onAnalyzeFile: (fileData: string, mimeType: string, fileName: string, manualText?: string) => Promise<void>;
  onLoadDemo: () => void;
  isLoading: boolean;
  loadingStep: string;
  isRetrying?: boolean;
  retryAttempt?: number;
  onRetry?: () => void;
  error: string | null;
  patientProfile: PatientProfile;
  onOpenProfile: () => void;
}

export const ReportUpload: React.FC<ReportUploadProps> = ({
  onAnalyzeFile,
  onLoadDemo,
  isLoading,
  loadingStep,
  isRetrying = false,
  retryAttempt = 0,
  onRetry,
  error,
  patientProfile,
  onOpenProfile,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [manualText, setManualText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const maxFileSize = 15 * 1024 * 1024; // 15MB

  const handleFile = (file: File) => {
    setValidationError(null);

    if (!allowedTypes.includes(file.type)) {
      setValidationError('Please upload a PDF document or an image (PNG, JPG, JPEG).');
      return;
    }

    if (file.size > maxFileSize) {
      setValidationError('File size exceeds the 15MB limit. Please upload a smaller scan or image.');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setFileBase64(base64);
      if (file.type.startsWith('image/')) {
        setFilePreview(base64);
      } else {
        setFilePreview(null);
      }
    };
    reader.onerror = () => {
      setValidationError('Failed to read the selected file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileBase64(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !manualText.trim()) {
      setValidationError('Please select a laboratory report file or enter lab test values manually.');
      return;
    }

    if (selectedFile && fileBase64) {
      await onAnalyzeFile(fileBase64, selectedFile.type, selectedFile.name, manualText);
    } else if (manualText.trim()) {
      await onAnalyzeFile('', '', 'Manual_Entry_Report.txt', manualText);
    }
  };

  const handleTryAgain = () => {
    if (onRetry) {
      onRetry();
    } else if (selectedFile && fileBase64) {
      onAnalyzeFile(fileBase64, selectedFile.type, selectedFile.name, manualText);
    } else if (manualText.trim()) {
      onAnalyzeFile('', '', 'Manual_Entry_Report.txt', manualText);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-8" id="report-upload-container">
      {/* Title & Patient Demographics Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Upload Your Laboratory Report
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload your blood test, lipid panel, or metabolic report in PDF or image format.
          </p>
        </div>

        {/* Patient Profile Chip */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
          <div className="text-xs">
            <span className="text-slate-500 block">Analyzing for:</span>
            <span className="font-bold text-slate-800">
              {patientProfile.name || 'Anonymous Patient'} {patientProfile.age ? `(${patientProfile.age} yrs)` : ''}
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenProfile}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 shadow-2xs"
          >
            Edit Info
          </button>
        </div>
      </div>

      {/* Quick Demo Option Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-cyan-950 text-white rounded-2xl p-5 border border-teal-800/80 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Don't have a laboratory report handy?</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 max-w-xl">
            Load our clinically calibrated <strong>Demo Report</strong> with 12 real-world parameters (Hemoglobin, Glucose, HbA1c, Lipids, Creatinine, Liver, Vitamin D) to test the complete workflow instantly.
          </p>
        </div>
        <button
          type="button"
          onClick={onLoadDemo}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-colors shrink-0 disabled:opacity-50"
          id="upload-load-demo-btn"
        >
          <Sparkles className="w-4 h-4" />
          <span>Load Full Demo Report</span>
        </button>
      </div>

      {/* Main Upload Area */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all ${
            dragActive
              ? 'border-teal-500 bg-teal-50/50 scale-[1.01]'
              : selectedFile
              ? 'border-teal-300 bg-teal-50/20'
              : 'border-slate-300 bg-white hover:border-slate-400'
          }`}
          id="dropzone-area"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => e.target.files && e.target.files[0] && handleFile(e.target.files[0])}
            className="hidden"
            id="lab-report-file-input"
          />

          {!selectedFile ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200/80 shadow-xs">
                <FileUp className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-800">
                  Drag and drop your lab report here, or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-teal-600 hover:text-teal-700 underline underline-offset-2 font-semibold"
                  >
                    browse files
                  </button>
                </p>
                <p className="text-xs text-slate-500">
                  Supported formats: PDF, JPG, JPEG, PNG (scanned documents or clear smartphone photos, max 15MB)
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
                <span className="px-2.5 py-1 bg-slate-100 rounded-md">Metabolic Panels</span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-md">Complete Blood Count</span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-md">Lipid Profile</span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-md">Thyroid & Renal</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                {filePreview ? (
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-slate-300 shadow-md">
                    <img src={filePreview} alt="Report preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-xs">
                    <FileText className="w-8 h-8" />
                  </div>
                )}

                <div className="text-left space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm sm:text-base break-all">
                      {selectedFile.name}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                      Ready to Analyze
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Document'}
                  </p>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium pt-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove & replace file</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Validation or Server Errors */}
        {(validationError || error) && (
          <div
            className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3.5 shadow-xs animate-in fade-in"
            id="upload-error-banner"
          >
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-2.5 flex-1">
              <div>
                <p className="font-bold text-rose-950">
                  {is503OrUnavailableError(validationError || error)
                    ? 'Service Notice (High Demand):'
                    : 'Notice regarding report processing:'}
                </p>
                <p className="text-rose-900 mt-0.5 leading-relaxed">
                  {formatFriendlyErrorMessage(validationError || error).message}
                </p>
              </div>

              {/* Retry & Fallback Actions */}
              <div className="pt-1 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleTryAgain}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  id="upload-try-again-btn"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>

                <button
                  type="button"
                  onClick={onLoadDemo}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-rose-300 hover:bg-rose-100 text-rose-900 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                  id="upload-switch-demo-btn"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Switch to Demo Report</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Optional Manual Results Input Drawer */}
        <details className="group bg-white rounded-2xl border border-slate-200 p-4 transition-all">
          <summary className="cursor-pointer font-bold text-xs sm:text-sm text-slate-700 flex items-center justify-between list-none">
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Or Paste / Type Lab Values Manually</span>
            </span>
            <span className="text-xs text-teal-600 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="pt-3 space-y-2">
            <p className="text-xs text-slate-500">
              If your report is a printed paper that's difficult to photograph, or you want to enter specific results:
            </p>
            <textarea
              rows={4}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="e.g.&#10;Fasting Glucose: 115 mg/dL (Ref: 70-99)&#10;Total Cholesterol: 210 mg/dL (Ref: <200)&#10;Hemoglobin: 11.2 g/dL (Ref: 12-16)"
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </details>

        {/* Loading Progress State */}
        {isLoading && (
          <div className="p-6 rounded-2xl bg-teal-50/80 border border-teal-200 text-teal-950 space-y-4 animate-in fade-in" id="upload-loading-state">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-teal-600 animate-spin" />
              <div>
                <h4 className="font-bold text-sm text-teal-900">
                  {isRetrying ? 'Retrying Laboratory Report Analysis...' : 'Analyzing Laboratory Report...'}
                </h4>
                <p className="text-xs text-teal-700">{loadingStep || 'Reading document & extracting biomarkers...'}</p>
              </div>
            </div>

            {/* Friendly Retrying Notification Banner */}
            {isRetrying && (
              <div
                className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse"
                id="upload-retrying-notice"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
                  <span className="font-medium">
                    The AI service is experiencing high demand. Retrying automatically (attempt {retryAttempt || 1} of 3)...
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onLoadDemo}
                  className="text-amber-800 hover:text-amber-950 underline font-bold shrink-0 self-end sm:self-auto cursor-pointer"
                >
                  Switch to Demo Report
                </button>
              </div>
            )}

            {/* Step checklist */}
            <div className="space-y-2 pt-2 border-t border-teal-200/60 text-xs">
              <div className="flex items-center gap-2 text-teal-800">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Digitizing and OCR parameter extraction</span>
              </div>
              <div className="flex items-center gap-2 text-teal-800">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Evaluating against clinical reference ranges</span>
              </div>
              <div className="flex items-center gap-2 text-teal-700 animate-pulse">
                <Sparkles className="w-4 h-4 text-teal-500" />
                <span>Formulating health-risk awareness & recommendations</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading || (!selectedFile && !manualText.trim())}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            id="upload-submit-btn"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing Report...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Extract & Analyze Report</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
