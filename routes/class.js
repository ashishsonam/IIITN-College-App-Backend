const express = require('express');
const { createClass,joinClass,classes,uploadAssignment,uploadResult,classInfo,deleteClass, uploadMessage ,deleteMessage ,deleteAssignment ,deleteResult ,getAttendence,updateAttendence,getStudentAttendence} = require('../controllers/class');
const { validateLoginRequest, isRequestValidated, validateRegisterRequest } = require('../validators/auth');
const { requireSignin } = require("../middlewares/auth");
const router = express.Router();

router.post("/createClass",isRequestValidated, requireSignin ,createClass);
router.post("/joinClass",isRequestValidated, requireSignin ,joinClass);
router.get("/classes",isRequestValidated, requireSignin ,classes);
router.post("/uploadAssignment",isRequestValidated, requireSignin , uploadAssignment);
router.post("/uploadResult",isRequestValidated, requireSignin ,uploadResult);
router.get("/classInfo/:classId",isRequestValidated, requireSignin ,classInfo);
router.delete("/deleteClass",isRequestValidated, requireSignin ,deleteClass);
router.post("/uploadMessage",isRequestValidated, requireSignin,uploadMessage);
router.delete("/deleteMessage",isRequestValidated, requireSignin, deleteMessage);
router.delete("/deleteAssignment",isRequestValidated, requireSignin,deleteAssignment);
router.delete("/deleteResult",isRequestValidated, requireSignin,deleteResult);
router.get("/getAttendence/:classId/:date",isRequestValidated, requireSignin,getAttendence);
router.get("/getStudentAttendence/:classId",isRequestValidated, requireSignin,getStudentAttendence);
router.post("/updateAttendence",isRequestValidated, requireSignin,updateAttendence);

module.exports = router;