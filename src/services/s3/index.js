const config = require('../config');
const AWS = require('aws-sdk');
AWS.config.accessKeyId = config.get().aws.accessKeyId;
AWS.config.secretAccessKey = config.get().aws.secretAccessKey;
AWS.config.region = config.get().aws.region;

module.exports = {
    putObject: async (_filename, _body, _path, _options) => {
        let Bucket = `${config.get().aws.bucketName}/${config.get().id}`;
        if (_path) Bucket = `${Bucket}/${_path}`;
        return new Promise((resolve, reject) => {
            try {
                let s3 = new AWS.S3();
                s3.putObject({
                    Bucket,
                    Key: _filename,
                    Body: _body,
                    ACL: 'public-read',
                    ..._options
                }, (error, data) => {
                    if (error)
                        return reject(error);
                    return resolve({
                        data,
                        downloadUrl: `http://${config.get().aws.bucketName}.s3.amazonaws.com/${config.get().id}/${_path}/${_filename}`,
                        path: `${config.get().id}/${_path}/${_filename}`
                    });
                });
            } catch (error) {
                return reject(error);
            }
        });
    },
    listObjects: async (_path) => {
        let Prefix = config.get().id;
        if (_path) Prefix = `${Prefix}/${_path}`
        return new Promise((resolve, reject) => {
            let s3 = new AWS.S3();
            s3.listObjects({
                Bucket: config.get().aws.bucketName,
                Prefix
            }, (error, data) => {
                if (error)
                    return reject(error);
                return resolve(data);
            });
        });
    },
    deleteObject: async (_path) => {
        return new Promise((resolve, reject) => {
            let s3 = new AWS.S3();
            s3.deleteObject({
                Bucket: `${config.get().aws.bucketName}`,
                Key: _path
            }, (error, data) => {
                if (error)
                    return reject(error);
                return resolve(data);
            });
        });
    }
};