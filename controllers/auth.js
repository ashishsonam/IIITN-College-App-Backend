const express = require("express");
const { collegeUser } = require("../models/user");
const jwt = require("jsonwebtoken");
const { hashPassword } = require("./hashPassword");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

exports.register = (req, res) => {
    const { user } = req.body;
    let newUser;
    collegeUser
        .findOne({ email: user.email })
        .exec(async (error, existingUser) => {
            if (error) {
                return res.status(400).json({ error });
            }
            if (existingUser) {
                return res.status(400).json({
                    error: "User with that email already exist",
                    existingUser: existingUser,
                });
            } else {
                let token = crypto.randomBytes(32).toString("hex");
                const hash = await hashPassword(token);
                if (user.role === "student") {
                    newUser = collegeUser({
                        profileName: user.profileName,
                        profilePhotoUri: user.profilePhotoUri,
                        e_card: user.e_card,
                        role: user.role,
                        email: user.email,
                        password: user.password,
                        batch: user.batch,
                        rollno: user.rollno,
                        branch: user.branch,
                        section: user.section,
                        token: hash,
                    });
                } else {
                    newUser = collegeUser({
                        profileName: user.profileName,
                        profilePhotoUri: user.profilePhotoUri,
                        role: user.role,
                        email: user.email,
                        password: user.password,
                        token: hash,
                    });
                }
            }
            newUser.save((err, newUser) => {
                if (err) {
                    res.status(400).json({
                        success: false,
                        msg: "Failed to save in Users",
                    });
                } else {
                    res.status(200).json({
                        success: true,
                        msg: "Successfully saved",
                    });
                }
            });
        });
};

exports.login = (req, res) => {
    const { user } = req.body;
    collegeUser.findOne(
        {
            email: user.email,
        },
        (err, userFound) => {
            if (err) throw err;
            if (!userFound) {
                res.status(400).send({
                    success: false,
                    msg: "Authentication Failed, User not found",
                });
            } else {
                userFound.comparePassword(user.password, (err, isMatch) => {
                    if (isMatch && !err) {
                        const accessToken = jwt.sign(
                            { user: userFound },
                            process.env.ACCESS_TOKEN_SECRET,
                            {
                                expiresIn: "600s",
                            }
                        );

                        const refreshToken = jwt.sign(
                            { user: userFound },
                            process.env.REFRESH_TOKEN_SECRET,
                            {
                                expiresIn: "1y",
                            }
                        );
                        res.status(200).json({
                            success: true,
                            accessToken: accessToken,
                            refreshToken: refreshToken,
                        });
                    } else {
                        return res.status(400).send({
                            success: false,
                            msg: "Authentication failed, wrong password",
                        });
                    }
                });
            }
        }
    );
};

exports.refresh = (req, res, next) => {
    const refreshToken = req.body.token;
    if (!refreshToken) {
        return res.json({ success: false, msg: "Refresh token not found." });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
        if (!err) {
            const accessToken = jwt.sign(
                { user: data.user },
                process.env.ACCESS_TOKEN_SECRET,
                {
                    expiresIn: "600s",
                }
            );
            return res
                .status(200)
                .json({ success: true, accessToken: accessToken });
        } else if (err.message == "jwt expired") {
            return res.status(400).json({
                success: false,
                msg: "Refresh token expired, Please Login again!",
            });
        } else {
            return res.status(400).json({
                success: false,
                msg: "invalid refresh token",
            });
        }
    });
};

exports.userInfo = (req, res) => {
    console.log(req.user);
    collegeUser.findOne({ email: req.user.email }, (err, userFound) => {
        if (err) throw err;
        if (!userFound) {
            res.status(400).send({
                success: false,
                msg: "User not found",
            });
        } else {
            res.status(200).send(userFound);
        }
    });
};

exports.editProfile = (req, res) => {
    const newValues = {
        $set: {
            profilePhotoUri: req.body.profilePhotoUri,
            profileName: req.body.profileName,
        },
    };
    collegeUser.updateOne({ email: req.user.email }, newValues, (err, res) => {
        if (err) {
            throw err;
        }
    });
    res.status(200).send({
        success: true,
        msg: "Profile Updated Successfully",
        info: {
            profileName: req.body.profileName,
            profilePhotoUri: req.body.profilePhotoUri,
        },
    });
};

exports.changePassword = (req, res) => {
    collegeUser.findOne(
        {
            email: req.user.email,
        },
        (err, userFound) => {
            if (err) {
                console.log(err);
                return res
                    .status(500)
                    .json({ success: true, msg: err.message });
            }
            if (!userFound) {
                res.status(400).send({
                    success: false,
                    msg: "Authentication Failed, User not found",
                });
            } else {
                userFound.comparePassword(
                    req.body.oldPassword,
                    async (err, isMatch) => {
                        if (isMatch && !err) {
                            const hashed = await hashPassword(
                                req.body.newPassword
                            );
                            const newValues = {
                                $set: {
                                    password: hashed,
                                },
                            };
                            collegeUser.updateOne(
                                { email: req.user.email },
                                newValues,
                                (err, res) => {
                                    if (err) {
                                        throw err;
                                    }
                                }
                            );
                            res.send({
                                success: true,
                                msg: "password changed",
                            });
                        } else {
                            return res.status(400).send({
                                success: false,
                                msg: "Old password you entered is wrong",
                            });
                        }
                    }
                );
            }
        }
    );
};

exports.requestResetPassword = (req, res) => {
    let _email = req.body.email;
    console.log(req.body);
    collegeUser.findOne(
        {
            email: _email,
        },
        async (err, userFound) => {
            if (err) {
                console.log(err);
                return res
                    .status(500)
                    .json({ success: true, msg: err.message });
            }
            if (!userFound) {
                res.status(400).send({
                    success: false,
                    msg: "User not found",
                });
            } else {
                let newValues = {
                    $set: {
                        token: "",
                    },
                };

                if (userFound.token) {
                    collegeUser.updateOne(
                        { email: _email },
                        newValues,
                        (err, res) => {
                            if (err) {
                                throw err;
                            }
                        }
                    );
                }
                let token = crypto.randomBytes(32).toString("hex");
                const hash = await hashPassword(token);

                newValues = {
                    $set: {
                        token: hash,
                    },
                };

                collegeUser.updateOne(
                    { email: _email },
                    newValues,
                    (err, res) => {
                        if (err) {
                            throw err;
                        }
                    }
                );
                const id = userFound._id;
                let link = `http://localhost:5000/api/resetPassword/${id}/${token}`;
                let transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: "blazecommunity001@gmail.com",
                        pass: "Fuckme123@@@",
                    },
                });
                let mailOptions = {
                    from: "blazecommunity001@gmail.com",
                    to: _email,
                    subject: "Password Reset - IIITN",
                    text: `Here's the link to reset your password - ${link}`,
                };
                transporter.sendMail(mailOptions, function (err, data) {
                    if (err) {
                        console.log("Error : " + err);
                    } else {
                        console.log("Email sent successfully");
                    }
                });
                res.send({
                    success: true,
                    msg: "email sent successfully",
                });
            }
        }
    );
};

exports.resetPasswordForm = (req, res) => {
    res.send(`<!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="UTF-8" />
                        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        <title>Document</title>
                    </head>
                    <body>
                        <form
                            action="http://localhost:5000/api/resetPassword/${req.params.id}/${req.params.token}"
                            method="POST"
                        >
                            <input name="newPassword" type="text" placeholder="new password" />
                            <input
                                name="reenterNewPassword"
                                type="text"
                                placeholder="re-enter new password"
                            />
                            <button type="submit">submit</button>
                        </form>
                    </body>
                </html>
                `);
};

exports.resetPassword = (req, res) => {
    collegeUser.findOne(
        {
            _id: req.params.id,
        },
        async (err, userFound) => {
            if (err) {
                console.log(err);
                return res
                    .status(500)
                    .json({ success: false, msg: err.message });
            }
            if (!userFound) {
                res.status(400).send({
                    success: false,
                    msg: "User not found",
                });
            } else {
                console.log(req.params.token);
                console.log(userFound.token);
                const isValid = await bcrypt.compare(
                    req.params.token,
                    userFound.token
                );
                if (!isValid) {
                    throw new Error("Invalid or expired password reset token");
                }
                if (req.body.reenterNewPassword != req.body.newPassword) {
                    return res.status(400).json({
                        success: false,
                        msg: "re-entered password does not match",
                    });
                } else {
                    const hashed = await hashPassword(req.body.newPassword);
                    const newValues = {
                        $set: {
                            password: hashed,
                        },
                    };
                    collegeUser.updateOne(
                        { _id: req.params.id },
                        newValues,
                        (err, res) => {
                            if (err) {
                                throw err;
                            }
                        }
                    );
                    return res.send({
                        success: true,
                        msg: "password reset successful",
                    });
                }
            }
        }
    );
};
