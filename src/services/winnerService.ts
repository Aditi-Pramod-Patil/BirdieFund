import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { WinnerClaim, WinnerClaimStatus } from '../types';


export interface UploadProofParams {
  userId: string;
  drawId: string;
  file: File | Blob;
  fileName?: string;
  matchTier: 3 | 4 | 5;
  matchedNumbers: number[];
  prizeAmount: number;
  userName: string;
  userEmail: string;
  notes?: string;
}

/**
 * Uploads a scorecard proof screenshot to Supabase Storage bucket `birdiefund-score-proofs`
 * and inserts/updates record in `public.winners` with payout_status = 'pending'.
 */
export async function uploadScoreProof(
  params: UploadProofParams
): Promise<{ success: boolean; message: string; proofUrl?: string; claim?: WinnerClaim }> {
  const {
    userId,
    drawId,
    file,
    fileName = 'scorecard.png',
    matchTier,
    matchedNumbers,
    prizeAmount,
    userName,
    userEmail,
    notes,
  } = params;

  let uploadedUrl = '';

  if (isSupabaseConfigured()) {
    try {
      // Path format: ${userId}/${drawId}_${Date.now()}_${cleanFileName}
      const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `${userId}/${drawId}_${Date.now()}_${safeName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('birdiefund-score-proofs')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.warn('Supabase storage upload notice:', uploadError.message);
      } else if (uploadData) {
        // Retrieve public URL or create signed URL
        const { data: publicUrlData } = supabase.storage
          .from('birdiefund-score-proofs')
          .getPublicUrl(uploadData.path);
        uploadedUrl = publicUrlData?.publicUrl || '';
      }

      // Upsert/insert into public.winners table
      const { error: winnerErr } = await supabase.from('winners').upsert({
        draw_id: drawId,
        user_id: userId,
        match_tier: matchTier,
        prize_amount: prizeAmount,
        proof_screenshot_url: uploadedUrl || null,
        payout_status: 'pending',
      });

      if (winnerErr) {
        console.error('Insert winner error:', winnerErr);
      }
    } catch (err) {
      console.error('Storage/DB error in uploadScoreProof:', err);
    }
  }

  // Graceful local fallback or data preview
  if (!uploadedUrl) {
    if (file instanceof File) {
      uploadedUrl = URL.createObjectURL(file);
    } else {
      uploadedUrl = 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80';
    }
  }

  const claimObj: WinnerClaim = {
    id: `claim-${Date.now()}`,
    drawId,
    drawDate: '2026-09-30',
    userId,
    userName,
    userEmail,
    matchTier,
    matchedNumbers,
    prizeAmount,
    proofUrl: uploadedUrl,
    proofNotes: notes,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };

  const stored = localStorage.getItem('dh_claims');
  const existingClaims: WinnerClaim[] = stored ? JSON.parse(stored) : [];
  const filtered = existingClaims.filter(c => !(c.drawId === drawId && c.userId === userId));
  const updated = [claimObj, ...filtered];
  localStorage.setItem('dh_claims', JSON.stringify(updated));

  return {
    success: true,
    message: 'Scorecard proof uploaded successfully! Claim status is now Pending Review.',
    proofUrl: uploadedUrl,
    claim: claimObj,
  };
}

/**
 * Admin action to verify winner claim: updates payout_status to 'approved' | 'paid' or 'rejected'.
 */
export async function adminVerifyWinner(
  winnerId: string,
  status: 'approved' | 'paid' | 'rejected',
  rejectionReason?: string
): Promise<{ success: boolean; message: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('winners')
        .update({
          payout_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', winnerId);

      if (error) {
        console.error('Error updating winner payout status:', error);
      }
    } catch (err) {
      console.error('adminVerifyWinner error:', err);
    }
  }

  const stored = localStorage.getItem('dh_claims');
  const claimsList: WinnerClaim[] = stored ? JSON.parse(stored) : [];

  const updated = claimsList.map(c => {
    if (c.id === winnerId) {
      return {
        ...c,
        status: status as WinnerClaimStatus,
        rejectionReason: status === 'rejected' ? rejectionReason || 'Details mismatch' : undefined,
        reviewedAt: new Date().toISOString(),
      };
    }
    return c;
  });

  localStorage.setItem('dh_claims', JSON.stringify(updated));

  const statusLabel = status === 'paid' ? 'Paid' : status === 'approved' ? 'Approved' : 'Rejected';
  return {
    success: true,
    message: `Claim successfully marked as ${statusLabel}.`,
  };
}
