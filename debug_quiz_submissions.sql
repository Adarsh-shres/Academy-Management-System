-- Run this in Supabase SQL Editor to confirm whether quiz submissions exist.
-- The first query lists every quiz and how many submissions it has.

select
  q.id as quiz_id,
  q.title,
  q.access_code,
  q.is_published,
  q.teacher_id,
  q.class_id,
  c.name as class_name,
  count(qs.id) as submission_count
from public.quizzes q
left join public.quiz_submissions qs on qs.quiz_id = q.id
left join public.classes c on c.id = q.class_id
group by q.id, q.title, q.access_code, q.is_published, q.teacher_id, q.class_id, c.name
order by q.created_at desc;

-- Recent submission rows across all quizzes. If this returns 0 rows, students
-- are not saving into quiz_submissions at all.

select
  qs.id,
  qs.quiz_id,
  q.title as quiz_title,
  q.access_code,
  qs.student_id,
  u.name as student_name,
  u.email as student_email,
  qs.score,
  qs.total_marks,
  qs.percentage,
  qs.submitted_at
from public.quiz_submissions qs
join public.quizzes q on q.id = qs.quiz_id
left join public.users u on u.id = qs.student_id
order by qs.submitted_at desc
limit 50;

-- Specific check for the quiz shown in the screenshot.

select
  q.id as quiz_id,
  q.title,
  q.access_code,
  q.is_published,
  q.teacher_id,
  q.class_id,
  count(qs.id) as submission_count
from public.quizzes q
left join public.quiz_submissions qs on qs.quiz_id = q.id
where q.access_code = 'INUTOU'
group by q.id, q.title, q.access_code, q.is_published, q.teacher_id, q.class_id;
