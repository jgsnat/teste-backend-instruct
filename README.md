# teste-backend-instruct
Teste técnico para a vaga remota de Backend Developer da Instruct

O projeto usa .env para poder rodar e inicializar a base com os códigos dos municipios, estados e feriados. O arquivo deve ser criado dentro do diretório raiz do projeto;

DB_HOST = host do banco de dados

DB_USER = usuario do banco de dados

DB_DATABASE = nome do banco de dados

DB_PASSWORD = senha do banco de dados

DB_PORT = porta de conexão ao banco de dados

DB_DIALECT = dialeto de conexão

HEROKU_POSTGRESQL_BRONZE_URL = url de conexão com a base de dados do heroku

Existem três arquivos .csv que são lidos para poupular as informações dos prefixos dos estados, codigos ibge dos municípios e os feriados nacionais.
