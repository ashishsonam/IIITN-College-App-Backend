const bcrypt = require("bcrypt");

exports.hashPassword = async (password) => {
    return await new Promise((resolve, reject) => {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                resolve(hash);
            });
        });
    });
};
