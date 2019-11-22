const nodemailer = require('nodemailer');

module.exports = {
    send: async (_transporter, _message) => {
        return new Promise((resolve, reject) => {
            try {
                let transporter = nodemailer.createTransport(_transporter);
                transporter.sendMail(_message, (err, info) => {
                    if (err)
                        return reject(err);
                    return resolve(info);
                });
            } catch (error) {
                reject(error);
            }
        });
    }
};