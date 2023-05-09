const mongoose = require("mongoose");
const assignmentSchema = mongoose.Schema(
	{
	   	title: {
	      type: String,
	      trim: true,
	    },
	    uri: {
	      type: String,
	      trim: true,
	    },
	   	submissionDate: {
	      type: String,
	      trim: true,
	    },
	},
	 { timestamps: true }
);
const resultSchema = mongoose.Schema(
	{
	    title: {
	      type: String,
	      trim: true,
	    },
	    uri: {
	      type: String,
	      trim: true,
	    },

	},
	 { timestamps: true }
);

const messageSchema = mongoose.Schema(
	{
		message:{
			type :String,
			trim:true
		},
	},
	{ timestamps : true}
);
const attendenceListSchema = mongoose.Schema(
	{
	   	list:[
	   		{
			   	student:{
			    	type: mongoose.Schema.Types.ObjectId,
		        ref: "collegeUser",
			    },
			    absent: {
			      type: Boolean,
			      default: false
			    },
			   	present: {
			      type: Boolean,
			      default: false
			    },
	   		},
	   		{ timestamps: true }
	    ],
	},
	 { timestamps: true }
);

attendenceListSchema.path('createdAt').immutable(true);

const classSchema = mongoose.Schema(
	{
	    enrolKey: {
	      type: String,
	      trim: true,
	      unique: 1
	    },
	   	branch: {
	      type: String,
	      trim: true,
	    },
			messages:[messageSchema],
	    assignments:[assignmentSchema],
	    results:[resultSchema],
	    attendence:[attendenceListSchema],
	    enrollStudents:[{
	    	type: mongoose.Schema.Types.ObjectId,
        ref: "collegeUser",
	    }],

	    subject: {
	      type: String,
	      trim: true,
	    },
	    batch: {
	      type: String,
	      trim: true,
	    },
	   	section: {
	      type: String,
	      trim: true,
	    },
	   	createdBy: {
	    	type: mongoose.Schema.Types.ObjectId,
        ref: "collegeUser",
	    },

	},
	 { timestamps: true }
);

const classroom = mongoose.model("classroom", classSchema, "Classes");

module.exports = {
  classroom  : classroom 
};