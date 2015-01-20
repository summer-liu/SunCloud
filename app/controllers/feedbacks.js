/**
 * Created by solomon on 14-6-28.
 */
'use strict';

var mongoose = require('mongoose');
require('../models/feedback');
var Feedback = mongoose.model('Feedback');
var _ = require('underscore');
//var smtp = require('../services/smtp');
var smtp = require('sendmail')();
var os = require("os");
var School = mongoose.model('School');

var htmlifyFeedbackContent = function (content) {
    var ret = '';
    content = JSON.parse(JSON.stringify(content));

    for (var key in content) {
        if(key!='_id' && key!='__v' && key!='time'){
            if (typeof content[key] == 'object') {
                for (var k in content[key]) {
                    if(k!='have_profile' && k!='q'){
                        if (k == 'url') {
                            ret += '来自页面：<a href=\"'+content[key][k]+'\">' + content[key][k] + '</a>';
                        } else {
                            ret += '<p>' + k + ' : ' + content[key][k] + '</p>';
                        }
                    }
                }
            } else {
                ret += '<p>' + key + ' : ' + content[key] + '</p>';
            }
        }
    }
    return ret;
};

exports.sendFeedbackMail = function (res, result, done) {
    if (result != null && result != undefined) {
        var mail = {};
        var subjectSchema = 'From ';
        mail.from = 'no-reply@sunshine-library.org';
        mail.to = 'taoliu8+tvt1k0ovj4w4cs3lldlc@boards.trello.com';
        //if (result.user.usergroup == 'student') {
        //    mail.subject = subjectSchema + result.user.username + ' School: ' + result.user.school
        //} else {
        //    mail.subject = subjectSchema + result.user.username + ' School: ' + result.user.school;
        //}

        School.findById(result.user.school, function(err, school) {
            if(err) {
                console.error(err);
            }
            mail.subject = subjectSchema + result.user.username + ' school: ' + result.user.school;
            result.user.school = school? school.name: result.user.school;
            mail.type = 'text/html';
            mail.content = htmlifyFeedbackContent(result);
            smtp(mail, function (mailRes) {
//            if ((mailRes.message) && (mailRes.message === 'error')) {
//                console.error("Something is wrong while sending feedback e-mail ----->" + mailRes.errors);
//                Feedback.findByIdAndUpdate(result._id,{$set:{"sendFail.isFail":true,"sendFail.reason":mailRes.errors}},function(doc){
//
//                });
//            }else{
//                console.log("mail have been successfully sent");
//            }
            });
            res.send(200, {message: "mail have been successfully sent"});
        });

    }
};