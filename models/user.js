const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { hashPassword } = require("../controllers/hashPassword");
const userSchema = mongoose.Schema(
    {
        email: {
            type: String,
            trim: true,
            unique: 1,
        },
        password: {
            type: String,
            trim: true,
        },
        profileName: {
            type: String,
            trim: true,
        },
        profilePhotoUri: {
            type: String,
            trim: true,
        },
        e_card: {
            type: String,
            trim: true,
        },
        role: {
            type: String,
            trim: true,
        },
        rollno: {
            type: String,
            trim: true,
        },
        branch: {
            type: String,
            trim: true,
        },
        section: {
            type: String,
            trim: true,
        },
        batch: {
            type: String,
            trim: true,
        },
        token: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    const user = this;
    if (this.isModified("password") || this.isNew) {
        const hash = await hashPassword(user.password);
        user.password = hash;
        next();
    } else {
        return next();
    }
});

userSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

const collegeUser = mongoose.model("collegeUser", userSchema, "Users");

module.exports = {
    collegeUser: collegeUser,
};
