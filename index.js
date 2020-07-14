const http = require('http');
const app = require('./configs');
const { APPLICATION_PORT } = require('./utils/constant');
const { sequelizeInstance } = require('./configs/database');
const { initDbStates, initDbCounties } = require('./utils/bootstrap');
const server = http.createServer(app);

sequelizeInstance.sync({ alter: true })
    .then(async () => {
        await initDbStates();
        await initDbCounties();

        server.listen(APPLICATION_PORT, () => 
            console.log(`Servidor rodando na porta ${APPLICATION_PORT}`)
        );
    })
    .catch(error => console.error('Não foi possivel sincronizar a base de dados e iniciar a aplicação', error));