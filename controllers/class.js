const express = require("express");
const { classroom } = require("../models/class");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");

exports.createClass = (req, res) =>	{
		const { clas } = req.body;
    	let newClass;
	    let enrolKey = uuidv4();
		newClass = classroom({
			enrolKey: enrolKey,
			branch:clas.branch,
			section:clas.section,
			subject:clas.subject,
			batch:clas.batch,
			createdBy:req.user._id
		});
		newClass.save((err, newClass) => {
			if (err) {
			    res.status(400).json({ error:err, success: false, msg: "Failed to create the class" });
			} else {
				res.status(200).json({ success: true, msg: "Successfully created"});
			      	}
		});
   };

exports.joinClass = (req, res) =>	{
		const enrolKey = req.body.enrolKey;
		const studentId = req.user._id;
		classroom.findOne({enrolKey:enrolKey}).exec((error, existingClass) =>{
			if (error) {
	        	 res.status(400).json({ error });
	    	}
	    	else{

	    		if(existingClass.enrollStudents.includes(studentId)){
	    			return res.status(400).json({ error: "Student Already Enrolled"});
	    		}
	    		else{
			    		existingClass.enrollStudents.push(studentId);
						existingClass.attendence.forEach((x)=>{
							if(moment(x.createdAt).format("DD-MM-YYYY") == moment().format("DD-MM-YYYY")){
								x.list.push({
									student:studentId,
									present:false,
									absent:false
								});			
							}
						});
					    existingClass.save((err, updateClass) => {
							if (err) {
							    res.status(400).json({ success: false, msg: "Failed to Enrol the student" });
							} else {
								res.status(200).json({ success: true, msg: "Student Enrol Successfully"});
							    }
						});
	    		}
	    	}
		});
   };

exports.classes = (req, res) =>	{
		console.log(req.user);
		if(req.user.role == "student"){
			const studentId = req.user._id;
			classroom.find({enrollStudents:studentId}).populate("enrollStudents").populate("createdBy").exec((error, studentClasses) => {
				if (error) {
		        	 res.status(400).json({ error });
		    	}
		    	else{
		    		res.status(200).json({ success: true, msg: "Student Classes",classes: studentClasses});
		    	}
			});
		}
		else{
			const teacherId = req.user._id;
			classroom.find({createdBy:teacherId}).populate("enrollStudents").populate("createdBy").exec((error, teacherClasses) => {
				if (error) {
		        	 res.status(400).json({ error });
		    	}
		    	else{
		    		res.status(200).json({ success: true, msg: "Teacher Classes",classes: teacherClasses});
		    	}
			});
		}
   };

exports.uploadAssignment = (req, res) =>	{

		const { assignment } = req.body;
		const classId = req.body.classId;
		classroom.findById(classId).exec((error, existingClass) =>{
			if (error) {
	        	 res.status(400).json({ error });
	    	}
	    	else{
	    		existingClass.assignments.unshift(assignment);
			    existingClass.save((err, updateClass) => {
					if (err) {
					    res.status(400).json({ success: false, msg: "Failed to upload the assignment" });
					} else {
						res.status(200).json({ success: true, msg: "Assignment Upload Successfully"});
					    }
				});
	    	}
		});
   };
exports.uploadResult = (req, res) =>	{

		const { result } = req.body;
		const classId = req.body.classId;
		classroom.findById(classId).exec((error, existingClass) =>{
			if (error) {
	        	 res.status(400).json({ error });
	    	}
	    	else{
	    		existingClass.results.unshift(result);
			    existingClass.save((err, updateClass) => {
					if (err) {
					    res.status(400).json({ success: false, msg: "Failed to upload the result" });
					} else {
						res.status(200).json({ success: true, msg: "Result Upload Successfully"});
					    }
				});
	    	}
		});
   };
exports.classInfo = (req, res) =>	{

		const classId = req.params.classId;
		classroom.findById(classId).populate("enrollStudents").populate("createdBy").exec((error, existingClass) =>{
			if (error) {
	        	 res.status(400).json({ error });
	    	}
	    	else{
				res.status(200).json({ success: true, msg: "classInfo fetch Successfully",classInfo:existingClass});
	    	}
		});
   };

exports.deleteClass = (req, res) =>	{
		const classId = req.body.classId;
		classroom.findByIdAndDelete(classId).exec((error, deleteClass) =>{
			if (error) {
	        	 res.status(400).json({ error });
	    	}
	    	else{
				res.status(200).json({ success: true, msg: "Class delete Successfully"});
	    	}
		});
   };

exports.uploadMessage = (req ,res) => {
	const message = { message : req.body.message };
	const classId = req.body.classId;
	classroom.findById(classId).exec((error, existingClass) =>{
		if (error) {
			 res.status(400).json({ error });
		}
		else{
			existingClass.messages.unshift(message);
			existingClass.save((err, updateClass) => {
				if (err) {
					res.status(400).json({ success: false, msg: "Failed to upload the message" });
				} else {
					res.status(200).json({ success: true, msg: "message Upload Successfully"});
					}
			});
		}
	});
}
exports.deleteAssignment = (req,res) => {
	const assignmentId = req.body.assignmentId;
	const classId = req.body.classId;
	classroom.findById(classId).exec((error,existingClass) => {
		if(error)
		{
			res.status(400).json({ error });
		}
		else{
			existingClass.assignments.pull({"_id":assignmentId});
			existingClass.save((err, updateClass) => {
				if (err) {
					res.status(400).json({ success: false, msg: "Failed to delete the assignment" });
				} else {
					res.status(200).json({ success: true, msg: "assignment deleted Successfully"});
					}
			})
		}
	});
}

exports.deleteResult = (req,res) => {
	const resultId = req.body.resultId;
	const classId = req.body.classId;
	classroom.findById(classId).exec((error,existingClass) => {
		if(error)
		{
			res.status(400).json({ error });
		}
		else{
			existingClass.results.pull({"_id":resultId});
			existingClass.save((err, updateClass) => {
				if (err) {
					res.status(400).json({ success: false, msg: "Failed to delete the message" });
				} else {
					res.status(200).json({ success: true, msg: "message deleted Successfully"});
					}
			})
		}
	});
}

exports.deleteMessage = (req,res) => {
	const msgId = req.body.msgId;
	const classId = req.body.classId;
	classroom.findById(classId).exec((error,existingClass) => {
		if(error)
		{
			res.status(400).json({ error });
		}
		else{
			existingClass.messages.pull({"_id":msgId});
			existingClass.save((err, updateClass) => {
				if (err) {
					res.status(400).json({ success: false, msg: "Failed to delete the message" });
				} else {
					res.status(200).json({ success: true, msg: "message deleted Successfully"});
					}
			})
		}
	});
}

exports.getStudentAttendence = (req,res) => {
	const classId = req.params.classId;
	classroom.findById(classId).populate({  
		path: 'attendence',
	    populate: {
	       path: 'list',
	       populate:{
	       	path:'student'
	       }
	     } 
     }).exec((error, existingClass) =>{
		if (error) {
			 res.status(400).json({ error });
		}
		else{
			if(req.user.role == "teacher"){
				res.status(400).json({ success: false, msg: "student do not exist"});
			}
			else{
				var attendenceList = [];
				existingClass.attendence.forEach((x)=>{
						x.list.forEach((y)=>{
							if(y.student.rollno == req.user.rollno){
								attendenceList.push({
									"date":x.createdAt,
									"absent":y.absent,
									"present":y.present
								});
								return;
							}
						})
				});
				res.status(200).json({ success: true, msg: "student attendence fetch Successfully",attendence:attendenceList});
			}
		}
	});
}

exports.getAttendence = (req,res) => {
	const classId = req.params.classId;
	const date = req.params.date;
	classroom.findById(classId).populate({  
		path: 'attendence',
	    populate: {
	       path: 'list',
	       populate:{
	       	path:'student'
	       }
	     } 
     }).exec((error, existingClass) =>{
		if (error) {
			 res.status(400).json({ error });
		}
		else{
			var exist = false;
			console.log(existingClass);
			existingClass.attendence.forEach((x)=>{
				if(moment(x.createdAt).format("DD-MM-YYYY") == date){
					exist = true;
					return res.status(200).json({ success: true, msg: "attendence fetch Successfully",attendence:x.list});
					
				}
			});

			if(exist == false){
				const newAttendence = [];
				existingClass.enrollStudents.forEach((x)=>{
					newAttendence.push({
							student:x,
							present:false,
							absent:false
						});
					});
				existingClass.attendence.push({list:newAttendence,createdAt:new Date(moment(date,"DD-MM-YYYY").format("YYYY-MM-DD"))});
				console.log(existingClass.attendence)
				existingClass.save((err, updateClass) => {
					if (err) {
						res.status(400).json({ success: false, msg: "Failed to add the attendence" });
					} else {
							classroom.populate(updateClass, {  
								path: 'attendence',
							    populate: {
							       path: 'list',
							       populate:{
							       	path:'student'
							       }
							     } 
						     }, function(err, updateClass) {
						     		var newList = [];
									updateClass.attendence.forEach((x)=>{
										if(moment(x.createdAt).format("DD-MM-YYYY") == date){
											newList = x.list;
											return;
											
										}
									});
									return res.status(200).json({ success: true, msg: "attendence add and fetch Successfully",attendence:newList});
						     });
						}
					});
			}
		}
	});
}

exports.updateAttendence = (req,res) => {
	const attendenceList = req.body.list;
	const classId = req.body.classId;
	const date = req.body.date;
	classroom.findById(classId).exec((error, existingClass) =>{
		if (error) {
			 res.status(400).json({ error });
		}
		else{
			existingClass.attendence.forEach((x)=>{
				if(moment(x.createdAt).format("DD-MM-YYYY") == date){
					x.list = attendenceList;
					existingClass.save((err, updateClass) => {
						if (err) {
							return res.status(400).json({ success: false, msg: "Failed to add the attendence" });
						} else {
							return res.status(200).json({ success: true, msg: "attendence Update Successfully",attendence:attendenceList});
							}
					});
					
				}
			});
		}
	});
}