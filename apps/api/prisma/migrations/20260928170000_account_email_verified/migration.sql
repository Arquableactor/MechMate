-- accounts.email_verified: refleja el claim email_verified de Auth0. Solo un
-- email verificado puede reclamar invitaciones a talleres (evita que alguien se
-- registre con el email de otra persona sin confirmarlo y tome su invitación).
ALTER TABLE "accounts" ADD COLUMN "email_verified" BOOLEAN NOT NULL DEFAULT false;
