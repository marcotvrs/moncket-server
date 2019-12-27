# moncket-server
Moncket is a DaaS developed with MongoDB and Socket.io. Aims to facilitate the implementation of mongodb-based applications by enabling full control of the database through the client side.

## Get started

````
npm install moncket-server
````
and then
````
const moncket = require("moncket-server");
````

## Project configuration

````
module.exports = {
    id: "my-project",
    name: "My Project",
    apiKey: "8dExDbsT64LcKgGH4PGsF7H76ywqrmVT",
    secretKey: "8vw6ACFV77gYJF8q",
    aws: {
        accessKeyId: "<AWS-ACCESS-KEY-ID>",
        secretAccessKey: "<AWS-SECRET-ACCESS-KEY>",
        region: "<AWS-REGION>",
        bucketName: "<AWS-BUCKET-NAME>"
    },
    mongodb: {
        uri: "mongodb://localhost:27017/myproject",
        database: "myproject"
    },
    mails: {
        resetPassword: {
            transporter: {
                service: "gmail",
                secure: false,
                auth: {
                    user: "<EMAIL-USER>",
                    pass: "<EMAIL-PASSWORD>"
                },
                tls: { rejectUnauthorized: false }
            },
            message: {
                sender: "<MESSAGE-SENDER>",
                to: "<MESSAGE-TO>",
                subject: "<MESSAGE-SUBJECT>",
                html: "<MESSAGE-HTML>"
            }
        }
    }
};
````


## Initialize

````
const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const io = require("socket.io").listen(server);
const moncket = require("moncket-server");
const projects = require("./projects");

app.use(express.json());

moncket(projects, app, io);

server.listen(process.env.PORT || 3000);
````

## Authors

* **Marco Tavares** - *Initial work* - [marcotvrs](https://github.com/marcotvrs)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
