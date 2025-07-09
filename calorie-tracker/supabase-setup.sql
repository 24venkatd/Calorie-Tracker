-- Calorie Tracker Database Setup for Supabase

-- Create calorie_entries table
CREATE TABLE calorie_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE calorie_entries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own entries
CREATE POLICY "Users can view own entries" ON calorie_entries
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own entries
CREATE POLICY "Users can insert own entries" ON calorie_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own entries
CREATE POLICY "Users can update own entries" ON calorie_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own entries
CREATE POLICY "Users can delete own entries" ON calorie_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for food images (run this in Supabase dashboard)
-- 1. Go to Storage in your Supabase dashboard
-- 2. Create a new bucket called 'food-images'
-- 3. Set it to public
-- 4. Add the following storage policies:

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'food-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to view images
CREATE POLICY "Authenticated users can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'food-images' AND auth.role() = 'authenticated');

-- Optional: Create an index for better query performance
CREATE INDEX idx_calorie_entries_user_date ON calorie_entries(user_id, created_at); 