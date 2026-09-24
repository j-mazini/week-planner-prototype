-- Script para verificar e criar service_partner para usuários SERVICE_PARTNER sem atribuição
-- Execute isso no seu PostgreSQL

-- 1. Ver usuários SERVICE_PARTNER sem service_partner_id
SELECT u.user_id, u.name, u.email, u.company_id, u.service_partner_id
FROM users u
WHERE u.user_type_id = 5  -- SERVICE_PARTNER
  AND u.service_partner_id IS NULL;

-- 2. Para cada usuário encontrado, você precisa:
--    a) Verificar se existe um service_partner para sua company
--    b) Se existir, atualizar o usuário com esse service_partner_id
--    c) Se não existir, criar um novo service_partner

-- Exemplo: Se o usuário 54 (Jonathan Santos) tem company_id = 1:
-- a) Verificar service_partner existentes para company_id 1:
SELECT * FROM service_partner WHERE company_id = 1;

-- b) Se existir um (ex: service_partner_id = 1), atualizar:
UPDATE users SET service_partner_id = 1 WHERE user_id = 54;

-- c) Se não existir nenhum, criar um novo:
INSERT INTO service_partner (company_id, partner_name, created_by, created_at, updated_at)
VALUES (1, 'Jonathan Santos Service Partner', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
RETURNING service_partner_id;

-- Depois, atualizar o usuário com o novo ID:
UPDATE users SET service_partner_id = [ID_RETORNADO] WHERE user_id = 54;

-- Verificar que ficou correto:
SELECT u.user_id, u.name, u.email, u.service_partner_id, sp.partner_name
FROM users u
LEFT JOIN service_partner sp ON u.service_partner_id = sp.service_partner_id
WHERE u.user_id = 54;
