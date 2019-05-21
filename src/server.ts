import "reflect-metadata";
import * as express from "express";
import * as compression from "compression";
import * as bodyParser from "body-parser";
import * as morgan from "morgan";
import * as errorHandler from "errorhandler";
import * as path from "path";
import * as winston from "winston";
import expressValidator = require("express-validator");
import { useExpressServer, useContainer } from "routing-controllers";
import * as cors from "cors";
import { Container } from "typedi";

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set("port", process.env.PORT || 7000);
app.set('view engine', 'pug');

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Morgan logging Config
 */
morgan.token("body", (req) => {
    return JSON.stringify(req.body);
});

app.use(morgan("combined", {
    immediate: false
}));

app.use(morgan("REQUEST: :body", {
    immediate: false
}));

/**
 * Winston Config
 */
winston.default.transports.console.level = (process.env.NODE_ENV == "PROD" ? "warn" : "debug");

app.use(errorHandler());
/**
 * Create Express server.
 */
useContainer(Container);
useExpressServer(app, {
    controllers: [__dirname + "/controllers/*.js"]
});


/**
 * Start Express server.
 */
app.listen(app.get("port"), () => {
    console.log("App is running at http://localhost:%d", app.get("port"));
});

module.exports = app;