const express = require("express");
const { reset } = require("nodemon");
const {
    login,
    register,
    refresh,
    userInfo,
    editProfile,
    changePassword,
    resetPassword,
    resetPasswordForm,
    requestResetPassword,
} = require("../controllers/auth");
const { requireSignin, upload } = require("../middlewares/auth");
const {
    validateLoginRequest,
    isRequestValidated,
    validateRegisterRequest,
} = require("../validators/auth");
const router = express.Router();

router.post("/login", validateLoginRequest, isRequestValidated, login);

router.post("/register", validateRegisterRequest, isRequestValidated, register);

router.post("/refresh", refresh);

router.get("/userInfo", requireSignin, isRequestValidated, userInfo);

router.post("/editprofile", requireSignin, isRequestValidated, editProfile);

router.post("/changepassword", requireSignin, changePassword);

router.post("/requestResetPassword", requestResetPassword);

router.get("/resetPassword/:id/:token", resetPasswordForm);

router.post("/resetPassword/:id/:token", resetPassword);

// router.post("/resetPassword", resetPassword);

module.exports = router;
