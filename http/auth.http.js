const md5 = require("md5");
const mongodb = require("../services/mongodb.services");
const jwt = require("../services/jwt.services");
const mailer = require("../services/mailer.services");
const resolvers = require("../services/resolvers.services");

module.exports = (projects, app) => {
    app.post("/moncket/auth/signIn", async (req, res) => {
        try {
            const { projectid } = req.headers;
            const { email, password, expiresIn } = req.body;
            const { client, database } = mongodb.client(projects, projectid);
            client.connect(async error => {
                try {
                    if (error) throw error;
                    const db = client.db(database);
                    let [user] = await db
                        .collection("users")
                        .aggregate([
                            {
                                $match: {
                                    email,
                                    password: md5(password)
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
                            {
                                $unwind: {
                                    path: "$userGroups",
                                    preserveNullAndEmptyArrays: true
                                }
                            }
                        ])
                        .toArray();
                    if (!user) throw new Error("Invalid e-mail or password.");
                    client.close(() =>
                        res.json(
                            resolvers.success({
                                user,
                                token: jwt.sign(
                                    projects,
                                    projectid,
                                    user,
                                    expiresIn
                                )
                            })
                        )
                    );
                } catch (error) {
                    client.close(() =>
                        res.json(
                            resolvers.error("/moncket/auth/signIn/error", error)
                        )
                    );
                }
            });
        } catch (error) {
            res.json(resolvers.error("/moncket/auth/signIn/error", error));
        }
    });

    app.post("/moncket/auth/sendPasswordResetEmail", async (req, res) => {
        try {
            const { email } = req.body;
            if (!email)
                throw new Error("E-mail is required for password reset.");
            const { projectid } = req.headers;
            const { client, database } = mongodb.client(projects, projectid);
            client.connect(async error => {
                try {
                    if (error) throw error;
                    const db = client.db(database);
                    const user = await db
                        .collection("users")
                        .findOne({ email });
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
                        const { transporter, message } = projects[
                            projectid
                        ].mails.resetPassword;
                        message.to = email;
                        message.html = message.html.replace(
                            "{{VERIFICATION_CODE}}",
                            verificationCode
                        );
                        mailer.send(transporter, message);
                        res.json(resolvers.success({ success: true }));
                    });
                } catch (error) {
                    client.close(() =>
                        res.json(
                            resolvers.error(
                                "/moncket/auth/sendPasswordResetEmail/error",
                                error
                            )
                        )
                    );
                }
            });
        } catch (error) {
            res.json(
                resolvers.error(
                    "/moncket/auth/sendPasswordResetEmail/error",
                    error
                )
            );
        }
    });

    app.post("/moncket/auth/resetPassword", async (req, res) => {
        try {
            const { email, password, verificationCode } = req.body;
            if (!email || !password || !verificationCode)
                throw new Error(
                    "All attributes are required for password reset."
                );
            const { projectid } = req.headers;
            const { client, database } = mongodb.client(projects, projectid);
            client.connect(async error => {
                try {
                    if (error) throw error;
                    const db = client.db(database);
                    const user = await db
                        .collection("users")
                        .findOne({ email });
                    if (user.verificationCode !== md5(verificationCode))
                        throw new Error("Invalid verification code.");
                    await db
                        .collection("users")
                        .updateOne(
                            { _id: user._id },
                            { $set: { password: md5(password) } }
                        );
                    await db
                        .collection("users")
                        .updateOne(
                            { _id: user._id },
                            { $unset: { verificationCode: 1 } }
                        );
                    client.close(() =>
                        res.json(resolvers.success({ success: true }))
                    );
                } catch (error) {
                    client.close(() =>
                        res.json(
                            resolvers.error(
                                "moncket/auth/resetPassword/error",
                                error
                            )
                        )
                    );
                }
            });
        } catch (error) {
            res.json(resolvers.error("/moncket/auth/resetPassword", error));
        }
    });
};
