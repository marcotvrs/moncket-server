let AWS = require("aws-sdk");

const configureAWS = (_projects, _projectId) => {
    AWS.config.accessKeyId = _projects[_projectId].aws.accessKeyId;
    AWS.config.secretAccessKey = _projects[_projectId].aws.secretAccessKey;
    AWS.config.region = _projects[_projectId].aws.region;
};

module.exports = {
    putObject: async (
        _projects,
        _projectId,
        _filename,
        _body,
        _path,
        _options
    ) => {
        configureAWS(_projectId);
        let Bucket = `${_projects[_projectId].aws.bucketName}/${_projects[_projectId].id}`;
        if (_path) Bucket = `${Bucket}/${_path}`;
        return new Promise((resolve, reject) => {
            try {
                let s3 = new AWS.S3();
                s3.putObject(
                    {
                        Bucket,
                        Key: _filename,
                        Body: _body,
                        ACL: "public-read",
                        ..._options
                    },
                    (error, data) => {
                        if (error) return reject(error);
                        return resolve({
                            data,
                            downloadUrl: `http://${_projects[_projectId].aws.bucketName}.s3.amazonaws.com/${_projects[_projectId].id}/${_path}/${_filename}`,
                            path: `${_projects[_projectId].id}/${_path}/${_filename}`
                        });
                    }
                );
            } catch (error) {
                return reject(error);
            }
        });
    },
    listObjects: async (_projects, _projectId, _path) => {
        configureAWS(_projects, _projectId);
        let Prefix = _projects[_projectId].id;
        if (_path) Prefix = `${Prefix}/${_path}`;
        return new Promise((resolve, reject) => {
            let s3 = new AWS.S3();
            s3.listObjects(
                {
                    Bucket: _projects[_projectId].aws.bucketName,
                    Prefix
                },
                (error, data) => {
                    if (error) return reject(error);
                    return resolve(data);
                }
            );
        });
    },
    deleteObject: async (_projectId, _path) => {
        configureAWS(_projectId);
        return new Promise((resolve, reject) => {
            let s3 = new AWS.S3();
            s3.deleteObject(
                {
                    Bucket: `${_projects[_projectId].aws.bucketName}`,
                    Key: _path
                },
                (error, data) => {
                    if (error) return reject(error);
                    return resolve(data);
                }
            );
        });
    }
};
