import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShieldCheck, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ExtraDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExtraDonationModal: React.FC<ExtraDonationModalProps> = ({ isOpen, onClose }) => {
  const { selectedCharity, makeExtraDonation } = useApp();
  const [selectedAmount, setSelectedAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !selectedCharity) return null;

  const presets = [10, 25, 50, 100];
  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalAmount || finalAmount <= 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      makeExtraDonation(selectedCharity.id, finalAmount);
      setIsProcessing(false);
      onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-center mb-6">
            <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
              <Heart className="w-5 h-5 fill-rose-500/30" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Direct Non-Profit Donation</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Recipient: <span className="text-slate-900 font-semibold">{selectedCharity.title}</span>
            </p>
          </div>

          <form onSubmit={handleDonate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Select Donation Amount</label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {presets.map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      selectedAmount === amt && !customAmount
                        ? 'bg-cobalt-600 text-white shadow-sm'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="number"
                  placeholder="Or enter custom amount ($)"
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-cobalt-600 focus:ring-1 focus:ring-cobalt-600 shadow-sm"
                />
                <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Tax Deductible 501(c)(3) Receipt</span>
              </div>
              <p>Charges directly to your default Stripe payment method on file.</p>
            </div>

            <button
              type="submit"
              disabled={isProcessing || !finalAmount || finalAmount <= 0}
              className="w-full py-2.5 rounded-lg btn-cobalt text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-sm"
            >
              <Heart className="w-4 h-4" />
              {isProcessing ? 'Processing Donation...' : `Confirm $${finalAmount || 0} Donation`}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
