import React, { useState, useRef } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LoadingSteps } from "@/components/LoadingSteps";
import { 
  FileSpreadsheet, 
  Upload, 
  X, 
  Download, 
  CheckCircle2, 
  FileText,
  Sparkles,
  Presentation,
  Loader2,
  Database,
  Search,
  Clock,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";

const LOADING_STEPS = [
  {
    title: "Parsing Queries from Excel",
    description: "Reading and extracting queries from spreadsheet",
  },
  {
    title: "Validating Query Syntax",
    description: "Checking query structure and format",
  },
  {
    title: "Executing Queries",
    description: "Running queries against data sources",
  },
  {
    title: "Processing Query Results",
    description: "Analyzing and organizing retrieved data",
  },
  {
    title: "Generating Visualizations",
    description: "Building charts and graphs from query results",
  },
  {
    title: "Creating Presentation Slides",
    description: "Designing slides and applying branding",
  },
  {
    title: "Finalizing PPT",
    description: "Compiling presentation and optimizing format",
  },
];

export default function PPTGeneratorPage() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const fileInputRef = useRef(null);
  const startTimeRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate Excel file
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      const validExtensions = ['.xls', '.xlsx', '.csv'];
      
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      const isValidType = validTypes.includes(file.type) || validExtensions.includes(fileExtension);
      
      if (isValidType) {
        setUploadedFile({
          id: Date.now().toString(),
          name: file.name,
          size: file.size,
          file: file
        });
        setIsComplete(false);
        setRemainingTime(6900000); // Initialize to 1 hour 55 minutes
      } else {
        alert('Please upload a valid Excel file (.xls, .xlsx, or .csv)');
      }
    }
    // Reset input
    e.target.value = '';
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setIsComplete(false);
    setLoadingProgress(0);
    setCurrentStep(0);
    setCompletedSteps([]);
    setRemainingTime(0);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      const validExtensions = ['.xls', '.xlsx', '.csv'];
      
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      const isValidType = validTypes.includes(file.type) || validExtensions.includes(fileExtension);
      
      if (isValidType) {
        setUploadedFile({
          id: Date.now().toString(),
          name: file.name,
          size: file.size,
          file: file
        });
        setIsComplete(false);
        setRemainingTime(6900000); // Initialize to 1 hour 55 minutes
      } else {
        alert('Please upload a valid Excel file (.xls, .xlsx, or .csv)');
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatRemainingTime = (milliseconds) => {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}hr ${minutes}min${minutes !== 1 ? 's' : ''}`;
    }
    return `${minutes}min${minutes !== 1 ? 's' : ''}`;
  };

  const handleGeneratePPT = async () => {
    if (!uploadedFile) return;

    setIsGenerating(true);
    setLoadingProgress(0);
    setCurrentStep(0);
    setCompletedSteps([]);
    setIsComplete(false);

    // Total duration: 1 hour 55 minutes (115 minutes = 6900 seconds)
    const totalDuration = 6900000; // 1 hour 55 minutes in milliseconds
    const progressInterval = 100; // Update progress every 100ms
    const stepInterval = totalDuration / LOADING_STEPS.length; // Time per step
    startTimeRef.current = Date.now();

    // Remaining time calculation
    const timeUpdateInterval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, totalDuration - elapsed);
      setRemainingTime(remaining);
    }, 100);

    // Progress bar animation
    const progressTimer = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        // Smooth progress increment
        return prev + (100 / (totalDuration / progressInterval));
      });
    }, progressInterval);

    // Step progression
    let stepIndex = 0;
    const stepTimer = setInterval(() => {
      if (stepIndex < LOADING_STEPS.length) {
        setCurrentStep(stepIndex);
        if (stepIndex > 0) {
          setCompletedSteps((prev) => [...prev, stepIndex - 1]);
        }
        stepIndex++;
      } else {
        clearInterval(stepTimer);
        clearInterval(progressTimer);
        clearInterval(timeUpdateInterval);
        setLoadingProgress(100);
        setRemainingTime(0);
        setCompletedSteps(Array.from({ length: LOADING_STEPS.length }, (_, i) => i));
        setIsGenerating(false);
        setIsComplete(true);
      }
    }, stepInterval);

    // Cleanup function in case component unmounts
    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
      clearInterval(timeUpdateInterval);
    };
  };

  const handleDownloadPPT = () => {
    // TODO: Implement actual PPT download
    alert('PPT download functionality will be implemented soon!');
  };

  const handleStartOver = () => {
    setUploadedFile(null);
    setIsGenerating(false);
    setLoadingProgress(0);
    setCurrentStep(0);
    setCompletedSteps([]);
    setIsComplete(false);
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#3551F3] to-[#4B6AF5] flex items-center justify-center shadow-lg">
              <Presentation className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PPT Generator</h1>
              <p className="text-gray-500 mt-1">Upload queries in Excel format to generate presentations</p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        {!isGenerating && !isComplete && (
          <Card className="mb-6 border-blue-100 bg-gradient-to-br from-blue-50/50 to-white">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-lg bg-[#3551F3]/10 flex items-center justify-center flex-shrink-0">
                  <Database className="h-5 w-5 text-[#3551F3]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Excel File Format
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Your Excel file should contain queries in a structured format. Each row represents a query that will be executed against your data sources. The system will process these queries, retrieve the results, and generate slides with visualizations based on the query outcomes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Section */}
        {!isGenerating && !isComplete && (
          <Card className="border-2 border-dashed border-gray-200 hover:border-[#3551F3] transition-all duration-300">
            <CardContent className="p-8">
              {!uploadedFile ? (
                <div
                  className="text-center py-12"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#3551F3]/10 to-[#4B6AF5]/10 flex items-center justify-center">
                      <Upload className="h-10 w-10 text-[#3551F3]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Upload Excel File with Queries
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Drag and drop your Excel file containing queries, or click to browse
                      </p>
                      <p className="text-sm text-gray-400">
                        Supports .xls, .xlsx, and .csv files with query data
                      </p>
                    </div>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-[#3551F3] hover:bg-[#2B41D9] text-white gap-2 mt-4"
                      size="lg"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Select File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* File Preview */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="h-12 w-12 rounded-lg bg-[#3551F3]/10 flex items-center justify-center flex-shrink-0">
                      <FileSpreadsheet className="h-6 w-6 text-[#3551F3]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(uploadedFile.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Estimated Time & Email Notification */}
                  {remainingTime > 0 && (
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <Clock className="h-5 w-5 text-[#3551F3] flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Estimated Processing Time: <span className="text-[#3551F3]">{formatRemainingTime(remainingTime)}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4 text-[#3551F3]" />
                          <span>The PPT will be shared on your email ID once generated</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Generate Button */}
                  <Button
                    onClick={handleGeneratePPT}
                    className="w-full bg-[#3551F3] hover:bg-[#2B41D9] text-white gap-2 h-12 text-base font-medium"
                    size="lg"
                  >
                    <Sparkles className="h-5 w-5" />
                    Generate PPT
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Loading Section */}
        {isGenerating && (
          <Card className="border-gray-200 shadow-lg">
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Header with Icon */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#3551F3] to-[#4B6AF5] flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Processing Queries & Generating Presentation
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Running queries and creating slides from results...
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#3551F3]">
                      {Math.round(loadingProgress)}%
                    </div>
                    <div className="text-xs text-gray-500">Complete</div>
                  </div>
                </div>

                {/* Remaining Time */}
                {remainingTime > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <Clock className="h-4 w-4 text-[#3551F3] flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      Estimated time remaining: <span className="font-semibold text-[#3551F3]">{formatRemainingTime(remainingTime)}</span>
                    </span>
                  </div>
                )}

                {/* Email Notification */}
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <Mail className="h-5 w-5 text-[#3551F3] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Email Notification
                    </p>
                    <p className="text-sm text-gray-600">
                      Your PPT will be automatically shared to your email ID once the generation is complete.
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <Progress 
                    value={loadingProgress} 
                    className="h-2.5"
                  />
                </div>

                {/* Loading Steps */}
                <div className="pt-4 border-t border-gray-100">
                  <LoadingSteps 
                    steps={LOADING_STEPS} 
                    currentStep={currentStep}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Section */}
        {isComplete && !isGenerating && (
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white shadow-lg">
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Success Header */}
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      Presentation Generated Successfully!
                    </h3>
                    <p className="text-gray-600">
                      Your PowerPoint presentation is ready to download
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handleDownloadPPT}
                    className="flex-1 bg-[#3551F3] hover:bg-[#2B41D9] text-white gap-2 h-12 text-base font-medium"
                    size="lg"
                  >
                    <Download className="h-5 w-5" />
                    Download PPT
                  </Button>
                  <Button
                    onClick={handleStartOver}
                    variant="outline"
                    className="flex-1 h-12 text-base font-medium"
                    size="lg"
                  >
                    Generate Another
                  </Button>
                </div>

                {/* Preview Info */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>
                      Generated from queries in: <span className="font-medium text-gray-900">{uploadedFile?.name}</span>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
