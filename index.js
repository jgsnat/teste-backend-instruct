const http = require('http');
const app = require('./configs');
const server = http.createServer(app);

server.listen(3000, () => console.log('Servidor rodando na porta 3000'));