'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var errorHandler = require('./errors');
var Q = require('q');
var _ = require('underscore');
var Room = mongoose.model('Room');

exports.getMyClasses = function(req, res){
    console.log('The teacher is: ' + req.query.teacher);
    Room.find({teachers:{$elemMatch:{teacher: req.query.teacher}}},function(err, rooms){
        if(err){
            console.error(err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }else{
            return res.status(200).send(rooms)
        }
    })
};

exports.getRoomById = function (req, res, next, roomId) {
    Room.findOne(
        {"_id": roomId},
        function (err, room) {
            if (err)return next(err);
            if (!room) return next(new Error('Failed to load Room' + roomId));
            room = JSON.parse(JSON.stringify(room));
            req.room = room;
            next();
        }
    );
};

exports.createRoom = function (req, res) {


    Room.createRoom(req.body, function (err, room) {
        if (err) {
            console.error(err);
            return res.json(500, err);}
        return res.json(room);
    });
};

exports.removeRoom = function (req, res) {
    Room.removeRoom({"_id": req.room._id}, function (err, room) {
        if (err) return res.json(500, err);
        return res.json({"_id": req.room._id});
    });
};

exports.getCountBySchool = function (req, res) {
    Room.aggregate({
        $group: {
            _id: "$school",
            count: {
                $sum: 1
            }
        }
    }, function (err, result) {
        if (err) return res.json(500, err);
        return res.json(result);
    })
};

var assignAppToRoom = function(appId, roomId) {
    var deferred = Q.defer();
    Room.findById(roomId, function(err, room) {
        if(err) {
            deferred.reject(err);
        }else {
            if(room.apps.indexOf(appId) === -1) {
                room.apps.push(appId);
                room.save(function(err) {
                    if(err) {
                        deferred.reject(err);
                    }else {
                        deferred.resolve(room);
                    }
                })
            }
            deferred.resolve(room);
        }
    });
    return deferred.promise;
};

var removeAppFromRoom = function(appId, roomId) {
    var deferred = Q.defer();
    Room.findById(roomId, function(err, room) {
        if(err) {
            deferred.reject(err);
        }else {
            var index = room.apps.indexOf(appId);
            if(index > -1) {
                room.apps.splice(index, 1);
                room.save(function(err) {
                    if(err) {
                        deferred.reject(err);
                    }else {
                        deferred.resolve(room);
                    }
                })
            }
            deferred.resolve(room);
        }
    });
    return deferred.promise;
};

exports.assignApp = function(req, res) {
    //console.log(req.body.assignments);
    //console.log(req.body.appId);
    var assignments = req.body.assignments;
    var appId = req.body.appId;
    var promises = [];
    _.each(assignments, function(assignment) {
        if(assignment.assigned) {
            promises.push(assignAppToRoom(appId, assignment.roomId));
        }else {
            promises.push(removeAppFromRoom(appId, assignment.roomId));
        }
    });

    console.log(promises);
    Q.all(promises).then(function(data) {
        console.log(data);
        res.status(200).send(data);
    }, function(err) {
        console.error(err);
        res.status(500).send({message: ""})
    })
};



var assignFolderToRoom = function(folderId, roomId) {
    var deferred = Q.defer();
    Room.findById(roomId, function(err, room) {
        if(err) {
            deferred.reject(err);
        }else {
            if(room.sunpack.indexOf(folderId) === -1) {
                room.sunpack.push(folderId);
                room.save(function(err) {
                    if(err) {
                        deferred.reject(err);
                    }else {
                        deferred.resolve(room);
                    }
                })
            }
            deferred.resolve(room);
        }
    });
    return deferred.promise;
};

var removeFolderFromRoom = function(folderId, roomId) {
    var deferred = Q.defer();
    Room.findById(roomId, function(err, room) {
        if(err) {
            deferred.reject(err);
        }else {
            var index = room.sunpack.indexOf(folderId);
            if(index > -1) {
                room.sunpack.splice(index, 1);
                room.save(function(err) {
                    if(err) {
                        deferred.reject(err);
                    }else {
                        deferred.resolve(room);
                    }
                })
            }
            deferred.resolve(room);
        }
    });
    return deferred.promise;
};


exports.assignSunpack = function(req, res) {
    var assignments = req.body.assignments;
    var folderId = req.body.folderId;
    var promises = [];
    _.each(assignments, function(assignment) {
        if(assignment.assigned) {
            promises.push(assignFolderToRoom(folderId, assignment.roomId));
        }else {
            promises.push(removeFolderFromRoom(folderId, assignment.roomId));
        }
    });
    console.log(promises);
    Q.all(promises).then(function(data) {
        console.log(data);
        res.status(200).send(data);
    }, function(err) {
        console.error(err);
        res.status(500).send({message: ""})
    })

};