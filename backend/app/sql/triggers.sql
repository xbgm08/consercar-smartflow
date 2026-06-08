-- ============================================================
-- TRIGGER + FUNÇÃO: bloqueio de alteração em serviço finalizado
 
 

CREATE OR REPLACE FUNCTION dw.fn_bloquear_servico_finalizado()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Um serviço é considerado finalizado quando duracao_servico_dias
    -- já foi preenchido 
    IF OLD.duracao_servico_dias IS NOT NULL THEN
        RAISE EXCEPTION
            'Serviço % já finalizado (duração: % dias). Alterações não são permitidas.',
            OLD.fato_key,
            OLD.duracao_servico_dias;
    END IF;
 
    -- Serviço ainda em aberto: permite a alteração normalmente
    RETURN NEW;
END;
$$;
 
 
DROP TRIGGER IF EXISTS trg_bloquear_servico_finalizado ON dw.fato_servicos;
 
CREATE TRIGGER trg_bloquear_servico_finalizado
    BEFORE UPDATE ON dw.fato_servicos  
    FOR EACH ROW
    EXECUTE FUNCTION dw.fn_bloquear_servico_finalizado();
 
 
-- ============================================================
-- EXEMPLOS DE USO
-- ============================================================
 
-- Tentativa de alterar serviço finalizado (será bloqueada):
-- UPDATE dw.fato_servicos
-- SET valor_total_servico = 9999.00
-- WHERE fato_key = 1;
-- → ERROR: Serviço 1 já finalizado (duração: 3 dias). Alterações não são permitidas.
 
-- Alterar serviço ainda em aberto (duracao_servico_dias IS NULL) funciona normalmente:
-- UPDATE dw.fato_servicos
-- SET valor_total_servico = 1500.00
-- WHERE fato_key = 2 AND duracao_servico_dias IS NULL;


-- ─────────────────────────────────────────────────────────────
-- CASO 1: UPDATE em serviço FINALIZADO → deve ser BLOQUEADO
-- (duracao_servico_dias já preenchido = serviço encerrado)
-- ─────────────────────────────────────────────────────────────
UPDATE dw.fato_servicos
SET valor_total_servico = 9999.00
WHERE fato_key = 1;

-- Resultado esperado:
-- ERROR: Serviço 1 já finalizado (duração: X dias). Alterações não são permitidas.


-- ─────────────────────────────────────────────────────────────
-- CASO 2: UPDATE em serviço EM ABERTO → deve ser PERMITIDO
-- (duracao_servico_dias IS NULL = serviço ainda não encerrado)
-- ─────────────────────────────────────────────────────────────
UPDATE dw.fato_servicos
SET valor_total_servico = 1500.00
WHERE fato_key = 1
  AND duracao_servico_dias IS NULL;