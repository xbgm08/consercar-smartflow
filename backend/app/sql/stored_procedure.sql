-- ============================================================
-- STORED PROCEDURE: calcular_estatisticas_servicos
-- Banco: CONSERCAR (Data Warehouse)
-- Descrição: Usa cursor não vinculado com query dinâmica para
--            percorrer fato_servicos e calcular estatísticas
--            de desempenho por ano/trimestre.
-- ============================================================

-- STORED PROCEDURE 
CREATE OR REPLACE PROCEDURE dw.calcular_estatisticas_servicos(
    p_ano_inicio INTEGER DEFAULT NULL,
    p_ano_fim    INTEGER DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    -- Cursor não vinculado (unbound): receberá a query dinâmica
    cur_servicos    REFCURSOR;

    -- Variáveis para cada linha retornada pelo cursor
    v_ano           INTEGER;
    v_trimestre     INTEGER;
    v_total         INTEGER;
    v_receita       NUMERIC(15,2);
    v_ticket_medio  NUMERIC(15,2);
    v_custo_mao     NUMERIC(15,2);
    v_pct_seguro    NUMERIC(5,2);
    v_duracao_media NUMERIC(8,2);

    -- Variáveis para construção da query dinâmica
    v_sql           TEXT;
    v_where         TEXT := '';
    v_periodo       VARCHAR(20);

BEGIN
   
    IF p_ano_inicio IS NOT NULL AND p_ano_fim IS NOT NULL THEN
        v_where := FORMAT(' WHERE t.ano BETWEEN %s AND %s ', p_ano_inicio, p_ano_fim);
    ELSIF p_ano_inicio IS NOT NULL THEN
        v_where := FORMAT(' WHERE t.ano >= %s ', p_ano_inicio);
    ELSIF p_ano_fim IS NOT NULL THEN
        v_where := FORMAT(' WHERE t.ano <= %s ', p_ano_fim);
    END IF;

   
    v_sql := '
        SELECT
            t.ano,
            t.trimestre,
            COUNT(fs.fato_key)                              AS total_servicos,
            SUM(fs.valor_total_servico)                     AS receita_total,
            AVG(fs.valor_total_servico)                     AS ticket_medio,
            AVG(fs.custo_mao_obra)                          AS custo_medio_mao_obra,
            ROUND(
                100.0 * COUNT(fs.seguradora_key)
                      / NULLIF(COUNT(fs.fato_key), 0), 2
            )                                               AS pct_cobertura_seguro,
            AVG(fs.duracao_servico_dias)                    AS duracao_media_dias
        FROM dw.fato_servicos fs
        JOIN dw.dim_tempo t ON t.tempo_key = fs.tempo_key
    ' || v_where || '
        GROUP BY t.ano, t.trimestre
        ORDER BY t.ano, t.trimestre
    ';

    OPEN cur_servicos FOR EXECUTE v_sql;

    RAISE NOTICE '>>> Iniciando cálculo de estatísticas. Filtro aplicado: %',
        CASE WHEN v_where = '' THEN 'nenhum (todos os períodos)' ELSE v_where END;


    LOOP
        FETCH cur_servicos INTO
            v_ano, v_trimestre,
            v_total, v_receita, v_ticket_medio,
            v_custo_mao, v_pct_seguro, v_duracao_media;

        EXIT WHEN NOT FOUND;   

        v_periodo := v_ano::TEXT || '-T' || v_trimestre::TEXT;

        RAISE NOTICE 'Período: % | Serviços: % | Receita: R$ % | Ticket médio: R$ % | %% seguro: %%% | Duração média: % dias',
            v_periodo, v_total,
            TO_CHAR(v_receita,       'FM999G999G990D00'),
            TO_CHAR(v_ticket_medio,  'FM999G999G990D00'),
            v_pct_seguro,
            ROUND(v_duracao_media, 1);

    END LOOP;


    CLOSE cur_servicos;

    RAISE NOTICE '>>> Cálculo de estatísticas concluído.';

END;
$$;


-- ============================================================
-- EXEMPLOS DE USO
-- ============================================================

-- Todos os períodos disponíveis:
-- CALL dw.calcular_estatisticas_servicos();

-- Apenas o ano de 2024:
-- CALL dw.calcular_estatisticas_servicos(2024, 2024);

-- A partir de 2023:
-- CALL dw.calcular_estatisticas_servicos(2023, NULL);