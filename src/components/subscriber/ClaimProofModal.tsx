import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, ShieldAlert, FileText, Camera, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ClaimProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimId?: string;
  matchTier?: 3 | 4 | 5;
  prizeAmount?: number;
  drawId?: string;
  matchedNumbers?: number[];
}

export const ClaimProofModal: React.FC<ClaimProofModalProps> = ({
  isOpen,
  onClose,
  matchTier = 4,
  prizeAmount = 7495.83,
  drawId = 'draw-2026-08',
  matchedNumbers = [34, 38, 41, 36]
}) => {
  const { uploadScoreProof, submitWinnerClaim, showToast } = useApp();
  const [proofUrl, setProofUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);

  if (!isOpen) return null;

  // File upload validation constants
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      const errMsg = `Invalid file type: "${file.type || 'unknown'}". Only PNG, JPG, and PDF files are accepted.`;
      setFileError(errMsg);
      showToast(errMsg);
      e.target.value = ''; // Reset file input
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const errMsg = `File too large (${fileSizeMB}MB). Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`;
      setFileError(errMsg);
      showToast(errMsg);
      e.target.value = ''; // Reset file input
      return;
    }

    // Valid file — proceed
    setSelectedFile(file);
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProofUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !proofUrl) {
      const msg = 'Please select and upload your scorecard screenshot or PDF proof.';
      setFileError(msg);
      showToast(msg);
      return;
    }
    setIsSubmitting(true);
    try {
      if (selectedFile) {
        await uploadScoreProof(selectedFile, uploadedFileName, notes, drawId, matchTier, matchedNumbers, prizeAmount);
      } else {
        submitWinnerClaim(drawId, matchTier, matchedNumbers, prizeAmount, proofUrl, notes);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          className="relative w-full max-w-xl bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors text-xs"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-cobalt-600">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Scorecard Verification Upload</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Prize Claim: <span className="text-cobalt-600 font-semibold tabular-nums">${prizeAmount.toFixed(2)}</span> (Tier {matchTier} Match)
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2 mb-5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Target Draw:</span>
              <span className="font-semibold text-slate-900">Draw #{drawId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Matched Numbers:</span>
              <span className="tabular-nums text-cobalt-700 font-bold">[{matchedNumbers.join(', ')}]</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] pt-1.5 border-t border-slate-200">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span>Scorecards are verified against club records before payout status transitions from Pending to Paid.</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Upload Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Scorecard Screenshot or PDF
              </label>
              <div className="relative border-2 border-dashed border-slate-300 hover:border-cobalt-500 rounded-xl p-5 text-center bg-slate-50/70 transition-colors">
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-1.5">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center mx-auto text-cobalt-600 shadow-sm">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-slate-700 font-medium">
                    Drag and drop your scorecard, or <span className="text-cobalt-600 underline">browse</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    PNG, JPG, or PDF up to 5MB (USGA, Golf Genius, GHIN, or club attested card)
                  </div>
                </div>
                {/* File Validation Error */}
                {fileError && (
                  <div className="mt-2 flex items-start gap-1.5 text-rose-600 text-[11px] font-medium">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{fileError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Proof Preview Box */}
            {proofUrl && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                    <FileText className="w-3.5 h-3.5 text-cobalt-600" /> {uploadedFileName}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">READY TO SUBMIT</span>
                </div>
                <div className="h-32 rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
                  <img src={proofUrl} alt="Scorecard Proof" className="max-h-full object-contain" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Attester / Club Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Course name, marker signature, or GHIN ID..."
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-cobalt-600 shadow-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg btn-secondary text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !proofUrl}
                className="px-5 py-2 rounded-lg btn-cobalt text-xs font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmitting ? 'Uploading Proof...' : 'Submit for Verification'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
