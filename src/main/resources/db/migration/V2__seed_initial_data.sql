-- V2 historically inserted demo campus data.
-- Demo data was removed from the default migration path so clones start empty
-- and operators create their own departments/users/courses.
--
-- Optional demo pack: set CAMPUSFLOW_SEED_DEMO=true (loads classpath:db/demo-seed).
-- No-op keeps Flyway version continuity for new databases.
SELECT 1;
