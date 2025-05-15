
import React, { useState } from 'react';
import { Lead } from '@/types/lead';
import StarRating from '@/components/StarRating';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface RatingDialogProps {
  open: boolean;
  selectedLead: Lead | null;
  userId: string | undefined;
  onOpenChange: (open: boolean) => void;
}

const RatingDialog: React.FC<RatingDialogProps> = ({ 
  open, 
  selectedLead, 
  userId, 
  onOpenChange 
}) => {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [successfullySold, setSuccessfullySold] = useState(false);
  
  const submitRating = async () => {
    if (!selectedLead || !userId) return;
    
    try {
      // Insert rating into lead_ratings table
      const { error } = await supabase.from('lead_ratings').insert({
        lead_id: selectedLead.id,
        buyer_id: userId,
        rating: rating,
        review: review,
        successful_sale: successfullySold
      });
      
      if (error) throw error;
      
      toast.success('Thank you for your feedback!');
      onOpenChange(false);
      
      // Reset form
      setRating(5);
      setReview('');
      setSuccessfullySold(false);
    } catch (error) {
      console.error('[PURCHASE PAGE] Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Rate this Lead</DialogTitle>
          <DialogDescription>
            Please rate the quality of this lead and provide feedback.
          </DialogDescription>
        </DialogHeader>
        
        {selectedLead && (
          <div className="py-4">
            <div className="border-b pb-3 mb-3">
              <h3 className="font-medium">{selectedLead.type} Lead in {selectedLead.location}</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-medium">Quality Rating</label>
                <div className="flex items-center">
                  <StarRating 
                    rating={rating} 
                    onRatingChange={setRating}
                    readOnly={false}
                    size={24} 
                  />
                  <span className="ml-2 text-sm text-gray-500">{rating} of 5 stars</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="font-medium">Your Review (Optional)</label>
                <Textarea
                  placeholder="Tell us about your experience with this lead..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="sold-lead"
                  checked={successfullySold}
                  onCheckedChange={setSuccessfullySold}
                />
                <Label htmlFor="sold-lead" className="font-medium">
                  I successfully sold this lead
                </Label>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submitRating}>
            Submit Rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RatingDialog;
