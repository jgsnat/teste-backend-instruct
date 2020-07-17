const http = require('http');
const app = require('./configs');
const { PORT } = require('./utils/constant');
const { sequelizeInstance } = require('./configs/database');
const { initDbStates, initDbCounties, initDbDaysOff } = require('./utils/bootstrap');
const server = http.createServer(app);

sequelizeInstance.sync({ alter: true })
    .then(async () => {
        await initDbStates();
        await initDbCounties();
        await initDbDaysOff();

        server.listen(PORT, () => 
            console.log(`Servidor rodando na porta ${PORT}`)
        );
    })
    .catch(err => console.error('Não foi possivel sincronizar a base de dados e iniciar a aplicação', err));