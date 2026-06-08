-- ================================================================
--  ETL COMPLETO: BD_CONSERCAR (DDL v3) → Data Warehouse
--  Banco: PostgreSQL | Ferramenta: pgAdmin Query Tool
--
--  NOVIDADE v3: valor_pecas, custo_mao_obra e duracao_servico_dias
--  agora existem diretamente na NotaFiscal e são carregados direto.
--
--  ORDEM DE EXECUÇÃO:
--    BLOCO 1 → Criar schema e tabelas DW  (só na 1ª vez)
--    BLOCO 2 → Carga das Dimensões
--    BLOCO 3 → Carga da Fato
--
--  Para recarregar o DW: execute apenas BLOCO 2 + BLOCO 3
-- ================================================================

-- ================================================================
-- BLOCO 1 — ESTRUTURA DO DW
-- Execute apenas na primeira vez!
-- ================================================================

CREATE SCHEMA IF NOT EXISTS dw;

-- Para recriar tudo do zero, descomente abaixo:
-- DROP TABLE IF EXISTS dw.Fato_Servicos    CASCADE;
-- DROP TABLE IF EXISTS dw.Dim_Tempo        CASCADE;
-- DROP TABLE IF EXISTS dw.Dim_Cliente      CASCADE;
-- DROP TABLE IF EXISTS dw.Dim_Veiculo      CASCADE;
-- DROP TABLE IF EXISTS dw.Dim_Seguradora   CASCADE;
-- DROP TABLE IF EXISTS dw.Dim_Servico      CASCADE;
-- DROP TABLE IF EXISTS dw.Dim_Funcionario  CASCADE;

CREATE TABLE IF NOT EXISTS dw.Dim_Cliente (
    cliente_key SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    cpf VARCHAR(11) UNIQUE,
    email VARCHAR(100),
    telefone VARCHAR(20),
    rua VARCHAR(150),
    numero VARCHAR(10),
    bairro VARCHAR(100),
    cep VARCHAR(8),
    municipio VARCHAR(100),
    uf CHAR(2)
);

CREATE TABLE IF NOT EXISTS dw.Dim_Veiculo (
    veiculo_key SERIAL PRIMARY KEY,
    placa VARCHAR(10) UNIQUE,
    chassi VARCHAR(17),
    marca VARCHAR(50),
    modelo VARCHAR(50),
    ano INTEGER,
    tipo_veiculo VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS dw.Dim_Servico (
    servico_key SERIAL PRIMARY KEY,
    descricao_servico VARCHAR(200),
    categoria VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS dw.Dim_Seguradora (
    seguradora_key SERIAL PRIMARY KEY,
    razao_social VARCHAR(100),
    cnpj VARCHAR(14) UNIQUE,
    contato VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS dw.Dim_Funcionario (
    funcionario_key SERIAL PRIMARY KEY,
    nome_tecnico VARCHAR(100),
    cargo VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS dw.Dim_Tempo (
    tempo_key SERIAL PRIMARY KEY,
    data DATE NOT NULL,
    dia_semana VARCHAR(20),
    mes VARCHAR(20),
    trimestre INTEGER,
    ano INTEGER
);

CREATE TABLE IF NOT EXISTS dw.Dim_Insumo (
    insumo_key SERIAL PRIMARY KEY,
    codigo_sku VARCHAR(50) UNIQUE,
    nome_insumo VARCHAR(150),
    categoria VARCHAR(50),
    unidade_medida VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS dw.Dim_Fornecedor (
    fornecedor_key SERIAL PRIMARY KEY,
    razao_social VARCHAR(100),
    cnpj VARCHAR(14) UNIQUE,
    tempo_entrega_dias INTEGER
);

CREATE TABLE IF NOT EXISTS dw.Fato_Servicos (
    fato_key SERIAL PRIMARY KEY,
    cliente_key INTEGER REFERENCES dw.Dim_Cliente (cliente_key),
    veiculo_key INTEGER REFERENCES dw.Dim_Veiculo (veiculo_key),
    servico_key INTEGER REFERENCES dw.Dim_Servico (servico_key),
    seguradora_key INTEGER REFERENCES dw.Dim_Seguradora (seguradora_key),
    funcionario_key INTEGER REFERENCES dw.Dim_Funcionario (funcionario_key),
    tempo_key INTEGER REFERENCES dw.Dim_Tempo (tempo_key),
    valor_total_servico NUMERIC(15, 2),
    valor_pecas NUMERIC(10, 2),
    custo_mao_obra NUMERIC(10, 2),
    duracao_servico_dias INTEGER
);

CREATE TABLE IF NOT EXISTS dw.Fato_Consumo_Insumo (
    fato_consumo_key SERIAL PRIMARY KEY,
    tempo_key INTEGER REFERENCES dw.Dim_Tempo (tempo_key),
    servico_key INTEGER REFERENCES dw.Dim_Servico (servico_key),
    veiculo_key INTEGER REFERENCES dw.Dim_Veiculo (veiculo_key),
    insumo_key INTEGER REFERENCES dw.Dim_Insumo (insumo_key),
    fornecedor_key INTEGER REFERENCES dw.Dim_Fornecedor (fornecedor_key),
    funcionario_key INTEGER REFERENCES dw.Dim_Funcionario (funcionario_key),
    quantidade_prevista NUMERIC(10, 2),
    quantidade_real NUMERIC(10, 2),
    desperdicio NUMERIC(10, 2),
    custo_unitario NUMERIC(10, 2),
    custo_total_insumo NUMERIC(15, 2)
);

CREATE TABLE IF NOT EXISTS dw.Fato_Alerta_Estoque (
    alerta_key SERIAL PRIMARY KEY,
    tempo_key INTEGER REFERENCES dw.Dim_Tempo (tempo_key),
    insumo_key INTEGER REFERENCES dw.Dim_Insumo (insumo_key),
    quantidade_atual NUMERIC(10, 2),
    status_alerta VARCHAR(50),
    sugestao_compra NUMERIC(10, 2)
);

-- ================================================================
-- BLOCO 2 — CARGA DAS DIMENSÕES
-- Sempre carregar ANTES da tabela fato!
-- ================================================================

-- ----------------------------------------------------------------
-- 2.1 Dim_Cliente
-- ----------------------------------------------------------------
TRUNCATE TABLE dw.Dim_Cliente RESTART IDENTITY CASCADE;

INSERT INTO
    dw.Dim_Cliente (
        cpf,
        nome,
        email,
        telefone,
        rua,
        numero,
        bairro,
        cep,
        municipio,
        uf
    )
SELECT
    c.cpf,
    INITCAP(TRIM(c.nome)) AS nome,
    TRIM(c.email) AS email,
    COALESCE(
        (
            SELECT TRIM(t.ddd) || ' ' || TRIM(t.numero)
            FROM Cliente_Telefone t
            WHERE
                t.cpf_cliente = c.cpf
            LIMIT 1
        ),
        'Não informado'
    ) AS telefone,
    TRIM(c.rua) AS rua,
    TRIM(c.numeroCasa) AS numero,
    INITCAP(TRIM(c.bairro)) AS bairro,
    TRIM(c.cep) AS cep,
    INITCAP(TRIM(c.municipio)) AS municipio,
    UPPER(TRIM(c.uf)) AS uf
FROM Cliente c;

-- ----------------------------------------------------------------
-- 2.2 Dim_Veiculo
-- ----------------------------------------------------------------
TRUNCATE TABLE dw.Dim_Veiculo RESTART IDENTITY CASCADE;

INSERT INTO
    dw.Dim_Veiculo (
        placa,
        chassi,
        marca,
        modelo,
        ano,
        tipo_veiculo
    )
SELECT
    UPPER(TRIM(v.placa)) AS placa,
    NULL AS chassi,
    INITCAP(TRIM(v.marca)) AS marca,
    INITCAP(TRIM(v.modelo)) AS modelo,
    v.ano,
    COALESCE(
        INITCAP(TRIM(v.tipo)),
        'Não informado'
    ) AS tipo_veiculo
FROM Veiculo v;

-- ----------------------------------------------------------------
-- 2.3 Dim_Seguradora
-- ----------------------------------------------------------------
TRUNCATE TABLE dw.Dim_Seguradora RESTART IDENTITY CASCADE;

INSERT INTO
    dw.Dim_Seguradora (razao_social, cnpj, contato)
SELECT
    INITCAP(TRIM(s.razaoSocial)) AS razao_social,
    TRIM(s.cnpj) AS cnpj,
    TRIM(s.email) AS contato
FROM Seguradora s;

-- ----------------------------------------------------------------
-- 2.4 Dim_Servico
-- ----------------------------------------------------------------
TRUNCATE TABLE dw.Dim_Servico RESTART IDENTITY CASCADE;

INSERT INTO
    dw.Dim_Servico (descricao_servico, categoria)
SELECT DISTINCT
    TRIM(nf.descricaoServico) AS descricao_servico,
    NULL AS categoria
FROM NotaFiscal nf
WHERE
    nf.descricaoServico IS NOT NULL;

-- ----------------------------------------------------------------
-- 2.5 Dim_Funcionario
-- ----------------------------------------------------------------
TRUNCATE TABLE dw.Dim_Funcionario RESTART IDENTITY CASCADE;

INSERT INTO
    dw.Dim_Funcionario (nome_tecnico, cargo)
SELECT INITCAP(TRIM(p.nome)) AS nome_tecnico, NULL AS cargo
FROM PrestadorServico p;

-- ----------------------------------------------------------------
-- 2.6 Dim_Tempo
-- ----------------------------------------------------------------
TRUNCATE TABLE dw.Dim_Tempo RESTART IDENTITY CASCADE;

INSERT INTO
    dw.Dim_Tempo (
        tempo_key,
        data,
        dia_semana,
        mes,
        trimestre,
        ano
    )
SELECT DISTINCT
    TO_CHAR(
        nf.dataInicio::DATE,
        'YYYYMMDD'
    )::INTEGER AS tempo_key,
    nf.dataInicio::DATE AS data,
    TO_CHAR(nf.dataInicio::DATE, 'Day') AS dia_semana,
    TO_CHAR(nf.dataInicio::DATE, 'Month') AS mes,
    EXTRACT(
        QUARTER
        FROM nf.dataInicio::DATE
    )::INTEGER AS trimestre,
    EXTRACT(
        YEAR
        FROM nf.dataInicio::DATE
    )::INTEGER AS ano
FROM NotaFiscal nf
WHERE
    nf.dataInicio IS NOT NULL;

-- ----------------------------------------------------------------
-- 2.7 Dim_Insumo (Carga de 50 insumos fictícios)
-- ----------------------------------------------------------------
TRUNCATE TABLE dw.Dim_Insumo RESTART IDENTITY CASCADE;

INSERT INTO
    dw.Dim_Insumo (
        codigo_sku,
        nome_insumo,
        categoria,
        unidade_medida
    )
VALUES (
        'TIN-001',
        'Tinta PU Branco Básico',
        'Tinta',
        'Litros'
    ),
    (
        'TIN-002',
        'Tinta Poliéster Prata Metálico',
        'Tinta',
        'Litros'
    ),
    (
        'TIN-003',
        'Tinta Poliéster Preto Ninja',
        'Tinta',
        'Litros'
    ),
    (
        'TIN-004',
        'Tinta PU Vermelho Flash',
        'Tinta',
        'Litros'
    ),
    (
        'TIN-005',
        'Tinta Base D''água Azul Perolizado',
        'Tinta',
        'Litros'
    ),
    (
        'TIN-006',
        'Tinta Poliéster Cinza Titanium',
        'Tinta',
        'Litros'
    ),
    (
        'TIN-007',
        'Tinta PU Amarelo Táxi',
        'Tinta',
        'Litros'
    ),
    (
        'TIN-008',
        'Tinta Poliéster Branco Pérola',
        'Tinta',
        'Litros'
    ),
    (
        'TIN-009',
        'Tinta Preto Fosco Vinílico',
        'Tinta',
        'Litros'
    ),
    (
        'TIN-010',
        'Verniz PU Alto Sólido 8937',
        'Verniz',
        'Litros'
    ),
    (
        'TIN-011',
        'Verniz Bicomponente Rápido',
        'Verniz',
        'Litros'
    ),
    (
        'TIN-012',
        'Verniz Fosco Acetinado',
        'Verniz',
        'Litros'
    ),
    (
        'TIN-013',
        'Verniz Base D''água Eco',
        'Verniz',
        'Litros'
    ),
    (
        'CMP-001',
        'Primer PU Cinza Alto Preenchimento',
        'Complemento',
        'Litros'
    ),
    (
        'CMP-002',
        'Primer Epóxi Anticorrosivo',
        'Complemento',
        'Litros'
    ),
    (
        'CMP-003',
        'Massa Poliéster Ultralight',
        'Complemento',
        'Kg'
    ),
    (
        'CMP-004',
        'Massa Plástica Iberê',
        'Complemento',
        'Kg'
    ),
    (
        'CMP-005',
        'Massa Rápida para Pequenos Retoques',
        'Complemento',
        'Kg'
    ),
    (
        'CMP-006',
        'Solvente PU / Diluente',
        'Complemento',
        'Litros'
    ),
    (
        'CMP-007',
        'Thinner Limpeza',
        'Complemento',
        'Litros'
    ),
    (
        'CMP-008',
        'Desengraxante Automotivo',
        'Complemento',
        'Litros'
    ),
    (
        'CMP-009',
        'Catalisador para Verniz Alto Sólido',
        'Complemento',
        'Litros'
    ),
    (
        'CMP-010',
        'Catalisador para Primer PU',
        'Complemento',
        'Litros'
    ),
    (
        'ABR-001',
        'Lixa Seca Grão 150',
        'Abrasivo',
        'Unidade'
    ),
    (
        'ABR-002',
        'Lixa Seca Grão 320',
        'Abrasivo',
        'Unidade'
    ),
    (
        'ABR-003',
        'Lixa Seca Grão 600',
        'Abrasivo',
        'Unidade'
    ),
    (
        'ABR-004',
        'Lixa D''água Grão 1200',
        'Abrasivo',
        'Unidade'
    ),
    (
        'ABR-005',
        'Lixa D''água Grão 2000',
        'Abrasivo',
        'Unidade'
    ),
    (
        'ABR-006',
        'Disco de Lixa Roto-orbital 320',
        'Abrasivo',
        'Unidade'
    ),
    (
        'ABR-007',
        'Disco de Lixa Roto-orbital 500',
        'Abrasivo',
        'Unidade'
    ),
    (
        'POL-001',
        'Massa de Polir Nº 2',
        'Estética',
        'Kg'
    ),
    (
        'POL-002',
        'Líquido Polidor Refino',
        'Estética',
        'Litros'
    ),
    (
        'POL-003',
        'Líquido Lustrador Alto Brilho',
        'Estética',
        'Litros'
    ),
    (
        'POL-004',
        'Cera Cristalizadora de Carnaúba',
        'Estética',
        'Kg'
    ),
    (
        'POL-005',
        'Boina de Lã Branca Agressiva',
        'Estética',
        'Unidade'
    ),
    (
        'POL-006',
        'Boina de Espuma Macia',
        'Estética',
        'Unidade'
    ),
    (
        'MASC-001',
        'Fita Crepe Automotiva Verde 18mm',
        'Mascaramento',
        'Unidade'
    ),
    (
        'MASC-002',
        'Fita Crepe Automotiva Verde 48mm',
        'Mascaramento',
        'Unidade'
    ),
    (
        'MASC-003',
        'Bobina de Papel Kraft Mascaramento 45cm',
        'Mascaramento',
        'Metro'
    ),
    (
        'MASC-004',
        'Bobina de Papel Kraft Mascaramento 90cm',
        'Mascaramento',
        'Metro'
    ),
    (
        'MASC-005',
        'Plástico com Fita para Mascaramento Rápido',
        'Mascaramento',
        'Metro'
    ),
    (
        'PEC-001',
        'Para-choque Dianteiro Genérico Hatch',
        'Peça de Funilaria',
        'Unidade'
    ),
    (
        'PEC-002',
        'Para-choque Traseiro Genérico Sedan',
        'Peça de Funilaria',
        'Unidade'
    ),
    (
        'PEC-003',
        'Para-lama Direito Padrão',
        'Peça de Funilaria',
        'Unidade'
    ),
    (
        'PEC-004',
        'Para-lama Esquerdo Padrão',
        'Peça de Funilaria',
        'Unidade'
    ),
    (
        'PEC-005',
        'Capô Dianteiro Liso',
        'Peça de Funilaria',
        'Unidade'
    ),
    (
        'PEC-006',
        'Farol Direito Máscara Negra',
        'Peça de Funilaria',
        'Unidade'
    ),
    (
        'PEC-007',
        'Farol Esquerdo Padrão',
        'Peça de Funilaria',
        'Unidade'
    ),
    (
        'PEC-008',
        'Lanterna Traseira LED',
        'Peça de Funilaria',
        'Unidade'
    ),
    (
        'PEC-009',
        'Presilhas Plásticas Mistas (Kit)',
        'Peça de Funilaria',
        'Unidade'
    );

-- ----------------------------------------------------------------
-- 2.8 Dim_Fornecedor (Carga de 30 fornecedores fictícios)
-- ----------------------------------------------------------------
TRUNCATE TABLE dw.Dim_Fornecedor RESTART IDENTITY CASCADE;

INSERT INTO
    dw.Dim_Fornecedor (
        razao_social,
        cnpj,
        tempo_entrega_dias
    )
VALUES (
        'Tintas Automotivas Brasil',
        '11111111000101',
        2
    ),
    (
        'Auto Peças São Paulo',
        '22222222000102',
        1
    ),
    (
        'Distribuidora de Abrasivos XYZ',
        '33333333000103',
        4
    ),
    (
        'Funilaria Express Fornecimento',
        '44444444000104',
        3
    ),
    (
        'Vernizes e Complementos S/A',
        '55555555000105',
        5
    ),
    (
        'Latarias Importadas Sul',
        '66666666000106',
        15
    ),
    (
        'Cia das Peças Automotivas',
        '77777777000107',
        2
    ),
    (
        'Química Automotiva Nacional',
        '88888888000108',
        3
    ),
    (
        'Ferramentas e Lixas Master',
        '99999999000109',
        2
    ),
    (
        'Global Peças e Acessórios',
        '10101010000110',
        7
    ),
    (
        'Tintas Premium SP',
        '11112222000111',
        1
    ),
    (
        'Borrachas e Acabamentos Ltda',
        '12121212000112',
        4
    ),
    (
        'Auto Vidros Distribuidora',
        '13131313000113',
        2
    ),
    (
        'Fitas e Mascaramentos Pro',
        '14141414000114',
        3
    ),
    (
        'Central das Latarias',
        '15151515000115',
        5
    ),
    (
        'Solventes e Químicos ABC',
        '16161616000116',
        2
    ),
    (
        'Polimentos e Ceras VIP',
        '17171717000117',
        4
    ),
    (
        'Peças Originais VW/Fiat',
        '18181818000118',
        3
    ),
    (
        'Atacadão do Funileiro',
        '19191919000119',
        2
    ),
    (
        'Tintas Importadas ColorMatch',
        '20202020000120',
        10
    ),
    (
        'Para-choques e Grades SP',
        '21212121000121',
        3
    ),
    (
        'Estética Automotiva Suprimentos',
        '22223333000122',
        2
    ),
    (
        'Equipamentos de Pintura Arprex',
        '23232323000123',
        5
    ),
    (
        'Massas e Primers Rápidos',
        '24242424000124',
        1
    ),
    (
        'Faróis e Lanternas Distribuição',
        '25252525000125',
        3
    ),
    (
        'Retoques e Micro-pinturas',
        '26262626000126',
        4
    ),
    (
        'Peças Genéricas Automotivas',
        '27272727000127',
        2
    ),
    (
        'Lixas e Polidores 3M',
        '28282828000128',
        1
    ),
    (
        'Acessórios de Cabine Sul',
        '29292929000129',
        5
    ),
    (
        'Tintas Base D''Água Eco',
        '30303030000130',
        7
    );

-- ================================================================
-- BLOCO 3 — CARGA DA FATO
-- Execute SOMENTE após carregar todas as dimensões!
-- ================================================================

-- ----------------------------------------------------------------
-- 3.1 Fato_Servicos
-- NOVIDADE v3: valor_pecas, custo_mao_obra e duracao_servico_dias
-- agora são lidos diretamente da NotaFiscal — sem cálculo, sem NULL.
-- ----------------------------------------------------------------
TRUNCATE TABLE dw.Fato_Servicos RESTART IDENTITY CASCADE;

INSERT INTO
    dw.Fato_Servicos (
        cliente_key,
        veiculo_key,
        servico_key,
        seguradora_key,
        funcionario_key,
        tempo_key,
        valor_total_servico,
        valor_pecas,
        custo_mao_obra,
        duracao_servico_dias
    )
SELECT dc.cliente_key, dv.veiculo_key, ds.servico_key, dseg.seguradora_key, df.funcionario_key, TO_CHAR(
        nf.dataInicio::DATE, 'YYYYMMDD'
    )::INTEGER AS tempo_key,

-- Métricas agora todas vindas diretamente da NotaFiscal
nf.valorTotal AS valor_total_servico,
nf.valor_pecas AS valor_pecas,
nf.custo_mao_obra AS custo_mao_obra,
nf.duracao_servico_dias AS duracao_servico_dias
FROM NotaFiscal nf

-- Resolve Dim_Cliente
JOIN dw.Dim_Cliente dc ON dc.cpf = nf.cpfCliente

-- Resolve Dim_Veiculo (primeiro veículo do cliente)
LEFT JOIN LATERAL (
    SELECT dv2.veiculo_key
    FROM Veiculo v2
        JOIN dw.Dim_Veiculo dv2 ON dv2.placa = UPPER(TRIM(v2.placa))
    WHERE
        v2.cpf_cliente = nf.cpfCliente
    LIMIT 1
) dv ON true

-- Resolve Dim_Servico
LEFT JOIN dw.Dim_Servico ds ON TRIM(ds.descricao_servico) = TRIM(nf.descricaoServico)

-- Resolve Dim_Seguradora
LEFT JOIN dw.Dim_Seguradora dseg ON dseg.cnpj = TRIM(nf.cnpjSeguradora)

-- Resolve Dim_Funcionario via PrestadorServico
LEFT JOIN LATERAL (
    SELECT df2.funcionario_key
    FROM PrestadorServico p
        JOIN dw.Dim_Funcionario df2 ON df2.nome_tecnico = INITCAP(TRIM(p.nome))
    WHERE
        TRIM(p.cnpj) = TRIM(nf.cnpjPrestadorServico)
    LIMIT 1
) df ON true
WHERE
    nf.dataInicio IS NOT NULL
    AND nf.cpfCliente IS NOT NULL;

-- ----------------------------------------------------------------
-- 3.2 Fato_Consumo_Insumo (Mock Data com Variância para IA)
-- Usa uma subquery simples para gerar dados aleatórios corretos
-- ----------------------------------------------------------------
TRUNCATE TABLE dw.Fato_Consumo_Insumo RESTART IDENTITY CASCADE;

INSERT INTO dw.Fato_Consumo_Insumo (
    tempo_key, 
    servico_key, 
    veiculo_key, 
    insumo_key, 
    fornecedor_key, 
    funcionario_key,
    quantidade_prevista, 
    quantidade_real, 
    desperdicio, 
    custo_unitario, 
    custo_total_insumo
)
SELECT 
    tempo_key,
    servico_key,
    veiculo_key,
    insumo_key,
    fornecedor_key,
    funcionario_key,
    quantidade_prevista,
    quantidade_real,
    (quantidade_real - quantidade_prevista) AS desperdicio,
    custo_unitario,
    (quantidade_real * custo_unitario) AS custo_total_insumo

FROM (
    SELECT 
        fs.tempo_key,
        fs.servico_key,
        fs.veiculo_key,
        (SELECT insumo_key FROM dw.Dim_Insumo ORDER BY RANDOM() LIMIT 1) AS insumo_key,
        (SELECT fornecedor_key FROM dw.Dim_Fornecedor ORDER BY RANDOM() LIMIT 1) AS fornecedor_key,
        fs.funcionario_key,
        
        ROUND(CAST(RANDOM() * 3 + 1 AS NUMERIC), 2) AS quantidade_prevista,
        ROUND(CAST(RANDOM() * 4 + 1 AS NUMERIC), 2) AS quantidade_real,
        ROUND(CAST(RANDOM() * 80 + 20 AS NUMERIC), 2) AS custo_unitario        
    FROM dw.Fato_Servicos fs
) AS dados_sorteados
WHERE quantidade_real >= quantidade_prevista;

-- ================================================================
-- VERIFICAÇÃO FINAL
-- ================================================================

SELECT 'Dim_Cliente' AS tabela, COUNT(*) AS registros
FROM dw.Dim_Cliente
UNION ALL
SELECT 'Dim_Veiculo', COUNT(*)
FROM dw.Dim_Veiculo
UNION ALL
SELECT 'Dim_Servico', COUNT(*)
FROM dw.Dim_Servico
UNION ALL
SELECT 'Dim_Seguradora', COUNT(*)
FROM dw.Dim_Seguradora
UNION ALL
SELECT 'Dim_Funcionario', COUNT(*)
FROM dw.Dim_Funcionario
UNION ALL
SELECT 'Dim_Tempo', COUNT(*)
FROM dw.Dim_Tempo
UNION ALL
SELECT 'Fato_Servicos', COUNT(*)
FROM dw.Fato_Servicos
SELECT 'Fato_Consumo_Insumo', COUNT(*)              
FROM dw.Fato_Consumo_Insumo  
ORDER BY tabela;