import * as express from 'express';
const app = express();
const port = process.env.PORT || 3000;

//var routes = require('./api/routes/todoListRoutes'); //importing route
//routes(app); //register the route
app.use(express.json());
app.listen(port);

const router = express.Router();

app.use(router);
