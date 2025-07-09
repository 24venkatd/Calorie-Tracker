# Calorie Tracker App

A full-stack MVP for a daily calorie tracking mobile app built with Next.js, Supabase, and AI-powered food recognition.

## Features

- **User Authentication**: Secure login/registration via Supabase Auth
- **Food Photo Capture**: Take photos or upload images from gallery
- **AI Food Recognition**: Automatic food identification and calorie estimation using OpenAI GPT-4 Vision
- **Calorie Confirmation**: Edit and confirm AI-estimated calories before saving
- **Daily Summary**: Track daily calorie intake with progress visualization
- **History View**: View calorie history for the past 30 days
- **Mobile-First Design**: Responsive UI optimized for mobile devices

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase
- **AI Recognition**: OpenAI GPT-4 Vision
- **Image Storage**: Supabase Storage
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd calorie-tracker
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create the following database table:

```sql
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
```

4. Create a storage bucket for food images:
   - Go to Storage in your Supabase dashboard
   - Create a new bucket called `food-images`
   - Set it to public
   - Add the following storage policy:

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'food-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to view images
CREATE POLICY "Authenticated users can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'food-images' AND auth.role() = 'authenticated');
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI API Key for food recognition
OPENAI_API_KEY=your_openai_api_key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Usage

1. **Sign Up/Login**: Use the authentication form to create an account or sign in
2. **Add Food**: Click "Add Food" to take a photo or upload an image
3. **AI Recognition**: The app will automatically identify the food and estimate calories
4. **Confirm/Edit**: Review and edit the food name and calorie count if needed
5. **Save**: Save the entry to your daily log
6. **Track Progress**: View your daily summary and progress toward your calorie goal
7. **View History**: Access your calorie history for the past 30 days

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to add all environment variables in your Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

## API Endpoints

- `POST /api/recognize-food`: Analyzes food images using OpenAI GPT-4 Vision

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── recognize-food/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Auth.tsx
│   ├── Dashboard.tsx
│   ├── DailySummaryCard.tsx
│   ├── FoodLogForm.tsx
│   └── HistoryView.tsx
├── lib/
│   └── supabase.ts
└── types/
    └── database.ts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
