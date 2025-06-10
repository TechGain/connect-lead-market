
-- Create user notification preferences table
CREATE TABLE public.user_notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferred_lead_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_locations TEXT[] DEFAULT ARRAY[]::TEXT[],
  email_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on the new table
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user notification preferences
CREATE POLICY "Users can view their own notification preferences"
  ON public.user_notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON public.user_notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON public.user_notification_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification preferences"
  ON public.user_notification_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_notification_preferences_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_notification_preferences_timestamp
  BEFORE UPDATE ON public.user_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notification_preferences_timestamp();

-- Insert default preferences for existing buyers
INSERT INTO public.user_notification_preferences (user_id, preferred_lead_types, preferred_locations, email_notifications_enabled)
SELECT 
  p.id,
  ARRAY[]::TEXT[], -- Empty array means all types (we'll handle this in the application logic)
  ARRAY[]::TEXT[], -- Empty array means all locations (we'll handle this in the application logic)
  COALESCE(p.email_notifications_enabled, true)
FROM public.profiles p
WHERE p.role = 'buyer'
AND NOT EXISTS (
  SELECT 1 FROM public.user_notification_preferences unp WHERE unp.user_id = p.id
);
