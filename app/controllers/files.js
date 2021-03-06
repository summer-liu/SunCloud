'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var errorHandler = require('./errors');
var Folder = mongoose.model('Folder');
var File = mongoose.model('File');
var School = mongoose.model('School');
var _ = require('underscore');
var async = require('async');
var path = require('path');
var Q = require('q');
var fs = require('fs');
var util = require('util');
var file_path = __dirname + '/../../upload/sunpack/';
var trash_path = __dirname + '/../../upload/trash/';

var fileType = {
            image: ['tif', 'tiff', 'gif', 'jpeg', 'jpg', 'jif', 'jfif', 'jp2', 'jpx', 'j2k', 'j2c', 'fpx', 'pcd', 'png', 'svg'],
            audio : ['mp3', 'wav', 'wma', 'wv', '3gp', 'act', 'aiff', 'aac', 'amr', 'au', 'awb', 'dct', 'dss', 'dvf', 'flac', 'gsm', 'm4a', 'm4p', 'mmf', 'mpc', 'ogg', 'oga', 'opus', 'ra', 'rm', 'raw', 'sln', 'tta', 'vox'],
            video : ['mkv', 'avi', 'rm', 'rmvb', 'mp4', 'm4p', 'mpg', 'mp2', 'mpeg','mpe', 'mpv' ,'flv', 'ogv', 'drc', 'mng', 'mov', 'webm'],
            doc : ['doc', 'docx', 'ppt', 'pptx', 'ppsx','xls' , 'xlsx', 'txt' ],
            ebook : ['epub', 'pdf', 'caj', 'jar', 'mobi', 'chm'],
            application: ['apk', 'exe', 'dmg']
};

var getFileType = function(mimetype, extension) {
    var type;
    //
    //var found = false;
    //for (var key in fileType) {
    //    var arr = fileType[key];
    //    if (arr.indexOf(extension) > -1) {
    //        type = key;
    //        found = true;
    //        break;
    //    }
    //}
    //if(!found) {
    //    type = 'other';
    //}
    if (mimetype.indexOf('pdf') > -1) {
        type = 'pdf';
    }else if (mimetype.indexOf('text') > -1 || mimetype.indexOf('officedocument') > -1 || fileType.doc.indexOf(extension) > -1) {
        type = 'doc';
    }else if (mimetype.indexOf('epub') > -1 || mimetype.indexOf('mobi') > -1 || fileType.ebook.indexOf(extension) > -1) {
        type = 'ebook';
    }else if (mimetype.indexOf('video') > -1) {
        type = 'video';
    }else if (mimetype.indexOf('audio') > -1) {
        type = 'audio';
    }else if (mimetype.indexOf('image') > -1) {
        type = 'image';
    }else {
        type = 'other';
    }
    return type;
};

var saveFileToFolder = function(file, folderId, res) {
    file.type = getFileType(file.mimetype, file.extension);
    file.name = file._id.toString();
    fs.renameSync(file.path, file_path + file.name);
    Folder.findById(folderId, function(err, folder) {
        if(err) {
            console.error(err);
            res.status(500).send({message: "数据库错误，未能找到文件夹"});
        }else if(folder) {
            file.subject = folder.subject;
            file.semester = folder.semester;
            file.school = folder.school;
            file.path = file_path + file.name;
            file.save(function(err) {
                if(err) {
                    res.status(500).send({message: "数据库错误，未能保存此文件"});
                }
                folder.files = folder.files.concat(file._id);
                folder.updated_at = Date.now();
                folder.save(function(err) {
                    if(err) {
                        res.status(500).send({message: "数据库错误，未能保存文件夹"});
                    }else {
                        res.status(200).send(file);
                    }
                });
            });
        }else {
            res.status(404).send({message: "此文件夹不存在" + folderId});
        }
    });
};

var saveFile = function(file, res) {
    file.name = file._id.toString();
    file.path = file_path + file.name;
    file.save(function(err) {
        if(err) {
            res.status(500).send({message: "数据库错误，未能保存此文件"});
        }else {
            School.findById(file.school, function(err, school) {
                if(err) {
                    console.error(err);
                }else {
                    //var thefile = {originalname: file.originalname, school:school, size: file.size};
                    //var thefile = {type:file.type, originalname:};
                    //thefile.hi = school;
                    //console.log(thefile,'~~',thefile.hi);
                    res.status(200).send({file: file, school:school});
                }
            });
        }
    });
};


exports.setContentType = function(req, res, next) {
    res.set('X-Frame-Options', 'SAMEORIGIN');
    res.set('content-type', req.file.mimetype);
    next();
};
exports.getFileById = function (req, res, next, fileId) {
    File.findById(fileId, function(err, file) {
        if(err) {
            return next(err);
        }
        if(!file) {
            return next(new Error('未能找到该文件夹' + fileId));
        }
        req.file = file;
        next();
    });
};

exports.uploadFiles = function(req, res) {
    var folderId = req.params.folderId;
    var file = new File(req.files.file);
    file.description = req.body.description;
    file.owner = req.user._id;
    file.created_at = Date.now();
    saveFileToFolder(file, folderId, res);
};

exports.uploadRepo = function(req, res) {
    var file = new File(req.files.file);
    file.description = req.body.description;
    file.owner = req.user._id;
    file.created_at = Date.now();
    file.createBy = req.body.createBy;
    file.shared = true;
    file.type = getFileType(file.mimetype, file.extension);
    file.subject = req.body.subject;
    file.semester = req.body.semester;
    file.school = req.user.school;
    console.log(req.user.school,file.school,'>>>>');
    fs.renameSync(file.path, file_path + file._id.toString());
    saveFile(file, res);
    //file.name = file._id.toString();
    //file.path = file_path + file.name;
    //file.save(function(err) {
    //    if(err) {
    //        res.status(500).send({message: "数据库错误，未能保存此文件"});
    //    }else {
    //        School.findById(file.school, function(err, school) {
    //            if(err) {
    //                console.error(err);
    //            }else {
    //                //var thefile = {originalname: file.originalname, school:school, size: file.size};
    //                //var thefile = {type:file.type, originalname:};
    //                //thefile.hi = school;
    //                //console.log(thefile,'~~',thefile.hi);
    //                console.log(file,'~~');
    //                res.status(200).send({file: file, school:school});
    //            }
    //        });
    //    }
    //});
};

exports.editFile = function(req, res) {
    var fileId = req.body.fileId;
    console.log(fileId);
    var newFile = req.files.file;
    File.findById(fileId, function(err, file) {
        if(err) {
            console.error(err);
            res.status(500).send({message: "数据库错误， 未能找到该文件"});
        }
        if(file) {
            newFile.name = file._id.toString();
            fs.renameSync(file.path, trash_path + file.name); // move the old file to trash
            fs.renameSync(newFile.path, file_path + newFile.name); // move the new file to sunpack
            file.type = getFileType(newFile.mimetype, newFile.extension);
            file.originalname = newFile.extension? req.body.originalname + '.'+ newFile.extension : req.body.originalname ;
            file.description = req.body.description;
            file.name = newFile.name;
            file.path = file_path + newFile.name;
            file.size = newFile.size;
            file.extension = newFile.extension;
            file.mimetype = newFile.mimetype;
            file.updated_at = Date.now();
            file.save(function(err) {
                if(err) {
                    res.status(500).send({message: "数据库错误，未能保存此文件"});
                }else {
                    res.status(200).send({message: "修改成功", originalname: file.originalname, description: file.description, size: file.size, mimetype: file.mimetype});
                }
            });
        }else {
            res.status(404).send({message: "此文件不存在" + fileId});
        }
    })
};


exports.viewFile = function(req, res) {
    var fileId = req.params.fileId;
    var file = req.file;
    console.log(file.path);

    var options = {
        root: file_path,
        dotfiles: 'ignore',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true,
            'X-Frame-Options': 'SAMEORIGIN'
        }
    };

    res.sendFile(file.name, options, function (err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        }
        else {
            console.log('Sent:', file.path);
        }
    });
};

//var deleteFile = function(file, folderId, res) {
//    File.findByIdAndUpdate(file._id, {deleted_at: Date.now()},function(err) {
//        if(err) {
//            res.status(500).send({message: '数据库错误，未能删除文件'})
//        }else {
//            //fs.renameSync(file.path, trash_path + file.name); // move the old file to trash
//            Folder.findById(folderId, function(err, folder) {
//                if(err) {
//                    res.status(500).send({message: '数据库错误，未能找到文件所在的文件夹'});
//                }else if(!folder) {
//                    res.status(200).send({message: '删除成功'});
//                }else {
//                    folder.files.splice(folder.files.indexOf(file._id), 1);
//                    folder.updated_at = Date.now();
//                    folder.save(function(err) {
//                        if(err) {
//                            res.status(500).send({message: '数据库错误，未能删除文件引用'})
//                        }else {
//                            res.status(200).send({message: '删除成功'});
//                        }
//                    })
//                }
//            })
//        }
//    });
//};


/**
 * @param req
 * @param res
 */
exports.deleteFile = function(req, res) {
    var file = req.file;
    File.findByIdAndUpdate(file._id, {deleted_at: Date.now(), shared: false},function(err) {
        if(err) {
            res.status(500).send({message: '数据库错误，未能删除文件'})
        }else {
            if(req.query.folderId) {
                var folderId = req.query.folderId;
                //fs.renameSync(file.path, trash_path + file.name); // move the old file to trash
                Folder.findById(folderId, function(err, folder) {
                    if(err) {
                        res.status(500).send({message: '数据库错误，未能找到文件所在的文件夹'});
                    }else if(!folder) {
                        res.status(200).send(file);
                    }else {
                        folder.files.splice(folder.files.indexOf(file._id), 1);
                        folder.updated_at = Date.now();
                        folder.save(function(err) {
                            if(err) {
                                res.status(500).send({message: '数据库错误，未能删除文件引用'})
                            }else {
                                res.status(200).send(file);
                            }
                        })
                    }
                })
            }else {
                Folder.find({files: file._id}, function(err, folders) {
                    if(err) {
                        res.status(500).send({message: '数据库错误，未能找到文件所在的文件夹'});
                    }else if(!folders.length) {
                        res.status(200).send(file);
                    }else {
                        console.log('~~',folders);
                        async.each(folders, function(folder, callback) {
                            folder.files.splice(folder.files.indexOf(file._id), 1);
                            folder.updated_at = Date.now();
                            folder.save(callback)
                        }, function(err) {
                            if(err) {
                                res.status(500).send({message: '数据库错误，未能删除文件引用'})
                            }else {
                                res.status(200).send(file);
                            }
                        })
                    }
                });
            }

        }
    });
};
exports.destroyFile = function(req, res) {
    var file = req.file;
    File.findByIdAndRemove(file._id,function(err) {
        if(err) {
            res.status(500).send({message: '数据库错误，未能删除文件'})
        }else {
            res.send(200);
        }
    });
};


exports.downloadFile = function(req, res) {
    var fileId = req.params.fileId;
    console.log(fileId);
    File.findById(fileId, function(err, file) {
        if(err) {
            console.error(err);
            res.status(500).send({message: "数据库错误，请重试"});
        }else {
            console.log(file.originalname);
            res.set('X-Frame-Options', 'SAMEORIGIN');
            res.download(file_path + file.name, file.originalname, function(err) {
                if(err) {
                    console.error(err);
                }else {
                    console.info('download file success');
                }
            })
        }
    })

};
