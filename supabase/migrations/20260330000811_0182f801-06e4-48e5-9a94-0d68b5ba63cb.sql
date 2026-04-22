
-- Create refill_requests table
CREATE TABLE public.refill_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT NOT NULL,
  phn TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  rx_num TEXT NOT NULL,
  medication_name TEXT NOT NULL,
  rx_qty TEXT NOT NULL,
  rx_note TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Pending',
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.refill_requests ENABLE ROW LEVEL SECURITY;

-- Allow public read access (dashboard needs to display all records)
CREATE POLICY "Allow public read access" ON public.refill_requests
  FOR SELECT USING (true);

-- Allow inserts from edge functions (service role) and anon for the API
CREATE POLICY "Allow public insert access" ON public.refill_requests
  FOR INSERT WITH CHECK (true);

-- Allow updates to status field (pharmacist changes status)
CREATE POLICY "Allow public update access" ON public.refill_requests
  FOR UPDATE USING (true);
