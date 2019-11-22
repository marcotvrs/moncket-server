const md5 = require("md5");
const mongodb = require("../services/mongodb.services");
const jwt = require("../services/jwt.services");
const mailer = require("../services/mailer.services");
const resolvers = require("../services/resolvers.services");

module.exports = (_projects, _socket) => {
    _socket.on("moncket/auth/signIn", async (_body, _callback) => {
        try {
            const { projectId } = _socket.handshake.query;
            const { client, database } = mongodb.client(_projects, projectId);
            client.connect(async error => {
                try {
                    if (error) throw error;
                    const db = client.db(database);
                    let [user] = await db
                        .collection("users")
                        .aggregate([
                            {
                                $match: {
                                    email: _body.email,
                                    password: md5(_body.password)
                                }
                            },
                            {
                                $lookup: {
                                    from: "userGroups",
                                    localField: "userGroups_id",
                                    foreignField: "_id",
                                    as: "userGroups"
                                }
                            },
                            { $unwind: "$userGroups" }
                        ])
                        .toArray();
                    if (!user) throw new Error("Invalid e-mail or password.");
                    client.close(() =>
                        _callback(
                            resolvers.success({
                                user,
                                token: jwt.sign(
                                    _projects,
                                    _socket.handshake.query.projectId,
                                    user,
                                    user.userGroups.expiresIn
                                )
                            })
                        )
                    );
                } catch (error) {
                    client.close(() =>
                        _callback(
                            resolvers.error("moncket/auth/signIn/error", error)
                        )
                    );
                }
            });
        } catch (error) {
            _callback(resolvers.error("moncket/auth/signIn/error", error));
        }
    });

    _socket.on(
        "moncket/auth/sendPasswordResetEmail",
        async (_body, _callback) => {
            try {
                if (!_body.email)
                    throw new Error("E-mail is required for password reset.");
                const { projectId } = _socket.handshake.query;
                const { client, database } = mongodb.client(
                    _projects,
                    projectId
                );
                client.connect(async error => {
                    try {
                        if (error) throw error;
                        const db = client.db(database);
                        const user = await db
                            .collection("users")
                            .findOne({ email: _body.email });
                        if (!user)
                            throw new Error(
                                "This email does not match a valid account."
                            );
                        let verificationCode = "";
                        for (let i = 0; i < 6; i++)
                            verificationCode += Math.round(Math.random() * 9);
                        await db.collection("users").updateOne(
                            { _id: user._id },
                            {
                                $set: {
                                    verificationCode: md5(verificationCode)
                                }
                            }
                        );
                        client.close(() => {
                            const { transporter, message } = _projects[
                                projectId
                            ].mails.resetPassword;
                            message.to = _body.email;
                            message.html = message.html.replace(
                                "{{VERIFICATION_CODE}}",
                                verificationCode
                            );
                            mailer.send(transporter, message);
                            _callback(resolvers.success({ success: true }));
                        });
                    } catch (error) {
                        client.close(() =>
                            _callback(
                                resolvers.error(
                                    "moncket/auth/sendPasswordResetEmail/error",
                                    error
                                )
                            )
                        );
                    }
                });
            } catch (error) {
                _callback(
                    resolvers.error(
                        "moncket/auth/sendPasswordResetEmail/error",
                        error
                    )
                );
            }
        }
    );

    _socket.on("moncket/auth/resetPassword", async (_body, _callback) => {
        try {
            if (!_body.email || !_body.password || !_body.verificationCode)
                throw new Error(
                    "All attributes are required for password reset."
                );
            const { projectId } = _socket.handshake.query;
            const { client, database } = mongodb.client(_projects, projectId);
            client.connect(async error => {
                try {
                    if (error) throw error;
                    const db = client.db(database);
                    const user = await db
                        .collection("users")
                        .findOne({ email: _body.email });
                    if (user.verificationCode !== md5(_body.verificationCode))
                        throw new Error("Invalid verification code.");
                    await db
                        .collection("users")
                        .updateOne(
                            { _id: user._id },
                            { $set: { password: md5(_body.password) } }
                        );
                    await db
                        .collection("users")
                        .updateOne(
                            { _id: user._id },
                            { $unset: { verificationCode: 1 } }
                        );
                    client.close(() =>
                        _callback(resolvers.success({ success: true }))
                    );
                } catch (error) {
                    client.close(() =>
                        _callback(
                            resolvers.error(
                                "moncket/auth/resetPassword/error",
                                error
                            )
                        )
                    );
                }
            });
        } catch (error) {
            _callback(resolvers.error("moncket/auth/resetPassword", error));
        }
    });
};
