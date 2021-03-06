'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SemesterSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
        //enum: ['初一上学期', '初一下学期', '初二上学期', '初二下学期', '初三上学期', '初三下学期',
        //    '高一上学期', '高一下学期', '高二上学期', '高二下学期', '高三上学期', '高三下学期']
    }
});

mongoose.model('Semester', SemesterSchema);
