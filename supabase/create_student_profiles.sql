-- Normalized student detail storage.
-- Keeps public.users focused on identity while student-specific bio fields live here.

CREATE TABLE IF NOT EXISTS public.student_profiles (
    student_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    father_name TEXT DEFAULT '',
    date_of_birth DATE,
    mobile_no TEXT DEFAULT '',
    gender TEXT NOT NULL DEFAULT 'Male' CHECK (gender IN ('Male', 'Female')),
    department TEXT DEFAULT '',
    city TEXT DEFAULT '',
    address TEXT DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    date_enrolled DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.set_student_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_student_profiles_updated_at ON public.student_profiles;
CREATE TRIGGER set_student_profiles_updated_at
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_student_profiles_updated_at();

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins and owners can read student profiles" ON public.student_profiles;
CREATE POLICY "Admins and owners can read student profiles" ON public.student_profiles
    FOR SELECT
    USING (
        auth.uid() = student_id
        OR EXISTS (
            SELECT 1
            FROM public.users viewer
            WHERE viewer.id = auth.uid()
              AND viewer.role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Admins can manage student profiles" ON public.student_profiles;
CREATE POLICY "Admins can manage student profiles" ON public.student_profiles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM public.users viewer
            WHERE viewer.id = auth.uid()
              AND viewer.role IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.users viewer
            WHERE viewer.id = auth.uid()
              AND viewer.role IN ('admin', 'super_admin')
        )
    );

-- Backfill rows for existing student accounts.
-- If the account was created through the edge function, recover the stored metadata too.
INSERT INTO public.student_profiles (
    student_id,
    father_name,
    date_of_birth,
    mobile_no,
    gender,
    department,
    city,
    address
)
SELECT
    u.id,
    COALESCE(au.raw_user_meta_data -> 'profile' ->> 'father_name', ''),
    NULLIF(au.raw_user_meta_data -> 'profile' ->> 'date_of_birth', '')::DATE,
    COALESCE(au.raw_user_meta_data -> 'profile' ->> 'mobile_no', ''),
    COALESCE(NULLIF(au.raw_user_meta_data -> 'profile' ->> 'gender', ''), 'Male'),
    COALESCE(au.raw_user_meta_data -> 'profile' ->> 'department', ''),
    COALESCE(au.raw_user_meta_data -> 'profile' ->> 'city', ''),
    COALESCE(au.raw_user_meta_data -> 'profile' ->> 'address', '')
FROM public.users u
LEFT JOIN auth.users au
    ON au.id = u.id
WHERE u.role = 'student'
ON CONFLICT (student_id) DO NOTHING;
