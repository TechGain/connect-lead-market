
-- Create refund_requests table
CREATE TABLE public.refund_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  reason TEXT NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  admin_notes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lead_id, buyer_id) -- Prevent duplicate requests for the same lead by the same buyer
);

-- Enable RLS
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

-- Policy for buyers to create their own refund requests
CREATE POLICY "Buyers can create their own refund requests"
  ON public.refund_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

-- Policy for buyers to view their own refund requests
CREATE POLICY "Buyers can view their own refund requests"
  ON public.refund_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id);

-- Policy for admins to view all refund requests
CREATE POLICY "Admins can view all refund requests"
  ON public.refund_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for admins to update refund requests
CREATE POLICY "Admins can update refund requests"
  ON public.refund_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_refund_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_refund_requests_timestamp
  BEFORE UPDATE ON public.refund_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_refund_request_timestamp();
