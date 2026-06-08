# Identificação dos alunos

| Nome Completo | RA |
|---------------|----|
|Felipe Lima de Oliveira|2041382511017|
|Gabriel Martins Braulino|2041382511013|
|Glauber Thierry Torres|2041382511019|
|Nicolas Silva Azevedo|2041382511006|
|Thiago Barreto Lemos|2041382511024|

CONSERCAR SmartFlow, um sistema que automatiza o controle de insumos, a previsão de demanda e o gerenciamento de clientes e veículos 
da oficina CONSERCAR. A solução busca centralizar informações operacionais, facilitar o acesso ao histórico de serviços, melhorar 
o controle de estoque. Com isso, pretende reduzir erros manuais, evitar desperdícios, prevenir a falta de materiais essenciais
e proporcionar maior eficiência operacional e previsibilidade financeira para a empresa.

# CONSERCAR SmartFlow — Stored Procedure & Trigger

**Projeto:** CONSERCAR SmartFlow — Gestão Inteligente de Oficina Mecânica  
**Banco de Dados:** `CONSERCAR`  
**Schema Analítico:** `dw` (Arquitetura Data Warehouse — Constelação de Fatos / Star Schema)

---

## 1. Stored Procedure com Cursor Não Vinculado

### Arquivo
`stored_procedure.sql`

### Estatísticas calculadas

A procedure `dw.calcular_estatisticas_servicos` percorre a tabela de fatos `dw.fato_servicos` agrupada por **ano e trimestre** e calcula, para cada período:

| Estatística | Descrição |
|---|---|
| `total_servicos` | Contagem de ordens de serviço no período |
| `receita_total` | Soma dos valores totais dos serviços (R$) |
| `ticket_medio` | Média do valor por serviço — mede o preço médio cobrado |
| `custo_medio_mao_obra` | Média do custo de mão de obra — revela eficiência operacional |
| `pct_cobertura_seguro` | **Proporção** (%) de serviços que envolveram seguradora |
| `duracao_media_dias` | Média de dias de duração por serviço — mede throughput da oficina |

### Por que essa informação é relevante?

A oficina CONSERCAR precisa acompanhar **tendências de receita e eficiência** ao longo do tempo. Com essas estatísticas trimestrais é possível:

- Identificar sazonalidade na demanda por serviços
- Detectar quedas ou crescimentos atípicos de receita
- Monitorar se a proporção de sinistros cobertos por seguro está aumentando (o que impacta o fluxo de caixa e os prazos de pagamento)
- Avaliar se a oficina está se tornando mais rápida ou mais lenta na conclusão dos serviços

### Tabelas e colunas usadas pelo cursor

| Tabela | Colunas |
|---|---|
| `dw.fato_servicos` | `fato_key`, `valor_total_servico`, `custo_mao_obra`, `duracao_servico_dias`, `seguradora_key`, `tempo_key` |
| `dw.dim_tempo` | `tempo_key`, `ano`, `trimestre` |

### Como o cursor não vinculado é usado

O cursor é declarado como `REFCURSOR` (sem query fixa) e recebe a query montada dinamicamente com `FORMAT` + `OPEN ... FOR EXECUTE`. Isso permite filtrar por intervalo de anos em tempo de execução, sem recompilar a procedure. Os resultados são exibidos diretamente via `RAISE NOTICE` a cada linha processada:

```sql
OPEN cur_servicos FOR EXECUTE v_sql;   -- query dinâmica
LOOP
    FETCH cur_servicos INTO v_ano, v_trimestre, ...;
    EXIT WHEN NOT FOUND;
    -- processa linha...
END LOOP;
CLOSE cur_servicos;
```

### Exemplos de uso

```sql
-- Todos os períodos:
CALL dw.calcular_estatisticas_servicos();

-- Somente 2024:
CALL dw.calcular_estatisticas_servicos(2024, 2024);

-- A partir de 2023:
CALL dw.calcular_estatisticas_servicos(2023, NULL);
```

---

## 2. Trigger de Bloqueio de Serviço Finalizado

### Arquivo
`trigger.sql`

### Em que situação o trigger é disparado?

O trigger `trg_bloquear_servico_finalizado` é acionado **BEFORE UPDATE** na tabela `dw.fato_servicos`, ou seja, ele é executado **antes** de qualquer tentativa de alteração em um registro de serviço. Ele dispara para cada linha que sofrer um `UPDATE`, independentemente de qual coluna esteja sendo modificada.

### Qual ação é tomada automaticamente?

A função `dw.fn_bloquear_servico_finalizado()` verifica se o registro já possui `duracao_servico_dias` preenchido — o que indica que o serviço foi concluído. Se sim, ela lança uma exceção com `RAISE EXCEPTION`, **cancelando completamente o UPDATE** antes que ele seja gravado no banco:

```sql
-- Tentativa bloqueada automaticamente:
UPDATE dw.fato_servicos SET valor_total_servico = 9999.00 WHERE fato_key = 1;
→ ERROR: Serviço 1 já finalizado (duração: 3 dias). Alterações não são permitidas.
```

Se o serviço ainda estiver em aberto (`duracao_servico_dias IS NULL`), o trigger retorna `NEW` e a alteração prossegue normalmente.

### Qual o benefício dessa automação?

| Benefício | Detalhe |
|---|---|
| **Imutabilidade dos fatos concluídos** | Garante que dados históricos do DW não sejam alterados acidentalmente ou intencionalmente após o fechamento do serviço |
| **Integridade da análise** | Relatórios e estatísticas geradas a partir de serviços finalizados permanecem consistentes ao longo do tempo |
| **Proteção contra erros humanos** | Um `UPDATE` errado na tabela errada é bloqueado antes de causar dano |
| **Sem impacto no código da aplicação** | A regra vive no banco — qualquer sistema que tente alterar o registro recebe o erro automaticamente |

---

## Estrutura dos arquivos

```
consercar_dw/
├── stored_procedure.sql   -- procedure com cursor não vinculado (saída via RAISE NOTICE)
├── trigger.sql            -- função + trigger de bloqueio de serviço finalizado
└── README.md              -- este arquivo
```

## Ordem de execução recomendada

```sql
-- 1. Restaurar o backup original (se necessário):
--    pg_restore -d CONSERCAR CONSERCAR_DW

-- 2. Criar a procedure:
\i stored_procedure.sql

-- 3. Criar a função e o trigger:
\i trigger.sql

-- 4. Executar a procedure (resultados exibidos via RAISE NOTICE):
CALL dw.calcular_estatisticas_servicos();
```
