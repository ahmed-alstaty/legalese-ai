-- Create user profiles for existing users who don't have one
INSERT INTO public.user_profiles (id, full_name, subscription_tier, subscription_status, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
  'free' as subscription_tier,
  'active' as subscription_status,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- Verify all users now have profiles
SELECT 
  au.id,
  au.email,
  up.id as profile_id,
  up.full_name,
  up.subscription_tier
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id;