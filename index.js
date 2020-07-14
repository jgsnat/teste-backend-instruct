const http = require('http');
const app = require('./configs');
const { APPLICATION_PORT } = require('./utils/constant');
const { sequelizeInstance } = require('./configs/database');
const server = http.createServer(app);

sequelizeInstance.sync({ force: true })
    .then(() => {
        server.listen(APPLICATION_PORT, () => 
            console.log(`Servidor rodando na porta ${APPLICATION_PORT}`)
        );
    })
    .catch(error => console.error('Não foi possivel sincronizar a base de dados e iniciar a aplicação', error));