const http = require('http');
const app = require('./configs');
const { APPLICATION_PORT } = require('./utils/constantes');
const server = http.createServer(app);

server.listen(APPLICATION_PORT, () => 
    console.log(`Servidor rodando na porta ${APPLICATION_PORT}`)
);