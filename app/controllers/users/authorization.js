'use strict';

/**
 * Module dependencies.
 */
var _ = require('underscore');
var async = require('async');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Room = mongoose.model('Room');
var App = mongoose.model('App');

/**
 * User middleware
 */
exports.getUserByID = function(req, res, next, id) {
	User.findOne({
		_id: id
	}).exec(function(err, user) {
		if (err) return next(err);
		if (!user) return next(new Error('Failed to load User ' + id));
		req.profile = user;
		//req.user = user;
		next();
	});
};

/**
 * Require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.status(401).send({
			message: '请先登录'
		});
	}
	next();
};
/**
 * Is root for restify
 * @param req
 * @returns {*|boolean}
 */
exports.isRootRestify = function(req) {
    return req.user && req.user.roles.indexOf('root') > -1;
};

/**
 * Is Self or Root ?
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */

exports.isSelfOrAdminOrRoot = function(req, res, next) {
	var roles = req.user.roles || [];
	if(_.contains(roles, 'root') || (_.contains(roles, 'admin')) ||(req.params.username === req.user.username)) {
		return next();
	}else{
		return res.send(403, "你没有访问权限");
	}
};

/**
 *  Is self ?
 */
exports.isSelf = function(req, res, next) {
	if(req.params.username === req.user.username) {
		return next();
	}else {
		return res.send(403, "你没有访问权限");
	}
};

exports.isRoot = function(req, res, next) {
	var roles = req.user.roles || [];
	if (_.contains(roles, 'root')) {
		return next();
	} else {
		return res.send(403, "你没有访问权限")
	}
};

exports.isRootOrAdmin = function(req, res, next){
	var roles = req.user.roles || [];
	if(_.contains(roles, 'root') || (_.contains(roles, 'admin'))){
		return next();
	}else{
		return res.send(403, "你没有访问权限")
	}
};

/**
 * control access so that password and salt won't be sent.
 * @param req
 * @returns {string}
 */
exports.userAccess = function(req) {
    if(req.method === 'GET') {
        return 'public';
    }
    else if(req.method === 'POST' || req.method === 'PUT') {
        return 'protected';
    }
    else if(req.method === 'DELETE') {
        return 'private';
    }else {
        return 'public';
    }
};

/**
 * root can see launcher password of any school.
 * admin can only see launcher password of his/her school.
 * anyone else can't see the password.
 * @param req
 * @returns {string}
 */
exports.schoolAccess = function(req) {
    var is = function (role) {
        return (req.user && req.user.roles && _.contains(req.user.roles, role));
    };
    if(is('root')) {
        return 'private';
    }
    if(is('admin')) {
        if(req.route.path === '/schools/:id') {
            var id = req.params.id;
            if(req.user.school.toString() === id) {
                return 'private';
            }else {
                return 'public';
            }
        }else {
            return 'public'
        }
    }
    else {
        return 'public';
    }
};


///**
// * User authorizations routing middleware
// */
//exports.hasAuthorization = function(roles) {
//	var _this = this;
//
//	return function(req, res, next) {
//		_this.requiresLogin(req, res, function() {
//			if (_.intersection(req.user.roles, roles).length) {
//				return next();
//			} else {
//				return res.status(403).send({
//					message: 'User is not authorized'
//				});
//			}
//		});
//	};
//};
//
//
//exports.requiresAuth = function (auth, action) {//action也是可配置的
//	return function(req, res, next) {
//		var roles;
//		if(typeof req.user == 'undefined')
//			roles = [];
//		else
//			roles = req.user.roles || [];
//		if(_.contains(roles, 'root')) {
//			return next();
//		}else if(_.contains(roles, 'teacher')){
//			return next();
//		}
//		else if((auth.length === _.intersection(auth, roles).length)){
//			return next();
//		} else {
//			return res.send(403, "你没有访问权限");
//		}
//	}
//};



///**
// * user restify middleware
// * @param req
// * @param res
// * @param next
// * @returns {*}
// */
//exports.restifyUser = function(req, res, next) {
//	var isLoggedin = (function () {
//		return req.isAuthenticated();
//	})();
//
//	var is = function (role) {
//		return (req.user && req.user.roles && _.contains(req.user.roles, role));
//	};
//
//	var isSelf = (function () {
//		return req.query && req.query.username && req.user && req.query.username === req.user.username;
//	})();
//
//	if(is('root')) {
//		return next();
//	}
//	if(isLoggedin) {
//		if(req.route.path === '/users') {
//			if(req.method === 'GET') {
//				return next();
//			}
//
//			// teacher and admin can only create users of the same school
//			if(req.method === 'POST') {
//				if(req.body.school.toString() === req.user.school.toString()) {
//					return next();
//				}else {
//					return res.status(403).send("Forbidden");
//				}
//			}
//		}
//		else if(req.route.path === '/users/count') {
//			return next();
//		}
//		else if(req.route.path === '/users/:id') {
//			if(req.method === 'GET') {
//				return next();
//			}else {
//				var id = req.params.id;
//				if(id.toString() === req.user._id.toString()) {
//					return next();
//				} else {
//					if(is('admin')) {
//						User.findById(id, function(err, user) {
//							if(err) {
//								return res.send(500);
//							}
//							else if(user) {
//								//console.log('---', user.school, typeof user.school);
//								//console.log('+++', req.user.school, typeof req.user.school);
//								if(user.school.toString() === req.user.school.toString()) {
//									return next();
//								}else {
//									return res.status(403).send("Forbidden");
//								}
//							}else {
//								return res.status(404).send("Not Found");
//							}
//						})
//					}else if(is('teacher')) {
//						Room.findOne({teachers: req.user._id, students: id }, function(err, room) {
//							if(err) {
//								return res.send(500);
//							}else {
//								if(room) {
//									return next();
//								}else {
//									return res.status(403).send("Forbidden");
//								}
//							}
//						})
//					}else {
//						return res.status(403).send("Forbidden");
//					}
//				}
//			}
//		}else {
//			return res.status(406).send('Path Not Acceptable');
//		}
//	}else {
//		return res.status(401).send("Unauthorized");
//	}
//};
//
//exports.restifyRoom = function(req, res, next) {
//	var isLoggedin = (function () {
//		return req.isAuthenticated();
//	})();
//
//	var is = function (role) {
//		return (req.user && req.user.roles && _.contains(req.user.roles, role));
//	};
//
//	if(is('root')) {
//		return next();
//	}
//	if(isLoggedin) {
//		if(req.route.path === '/rooms') {
//			if(req.method === 'GET') {
//				return next();
//			}
//			else if(req.method === 'POST') {
//				/**
//				 * Admins can only create rooms with same school.
//				 */
//				if(req.body.school&&req.body.name) {
//					if(is('admin')) {
//						if(req.body.school.toString() === req.user.school.toString()) {
//							return next();
//						}else {
//							return res.status(403).send("Forbidden");
//						}
//					}
//					/**
//					 * Teachers can only create rooms with same school and type must be 'teaching'.
//					 */
//					else if(is('teacher')) {
//						if(req.body.school.toString() === req.user.school.toString() && req.body.type === 'teaching') {
//							return next();
//						}else {
//							return res.status(403).send("Forbidden");
//						}
//					}
//					else {
//						return res.status(406).send("Role Not Accepted");
//					}
//				}else {
//					return res.status(406).send("POST Not Accepted");
//				}
//
//			} else {
//				return res.status(406).send("Method Not Accepted");
//			}
//		}
//		else if(req.route.path === '/rooms/count') {
//			return next();
//		}
//		else if(req.route.path === '/rooms/:roomId' || req.route.path === '/rooms/:id') {
//			var id = req.params.roomId || req.params.id;
//			Room.findById(id, function(err, room) {
//				if(err) {
//					return res.send(500);
//				}
//				else if(room) {
//					if(req.method === 'GET') {
//						return next();
//					}
//					/**
//					 * Admin and teachers can only edit classes of the same school.
//					 */
//					else if(req.method === 'PUT') {
//
//						if(room.school.toString() === req.user.school.toString()) {
//							return next();
//						}else {
//							return res.status(403).send("Forbidden");
//						}
//					}
//					/**
//					 * Admin can only delete classes of the same school.
//					 * Teacher can only delete classes of type 'teaching'.
//					 */
//					else if(req.method === 'DELETE') {
//						if(is('admin')) {
//							if(room.school.toString() === req.user.school.toString()) {
//								return next();
//							}else {
//								return res.status(403).send("Forbidden");
//							}
//						}
//						else if(is('teacher')) {
//							if(room.school.toString() === req.user.school.toString() && room.type === 'teaching') {
//								return next();
//							}else {
//								return res.status(403).send("Forbidden");
//							}
//						}
//					} else {
//						return res.status(406).send("Not Accepted");
//					}
//				}else {
//					return res.status(404).send('Not Found');
//				}
//
//			});
//		}
//		else if(req.route.path === '/assign/apps' && req.method === 'POST') {
//			/**
//			 * admin can only assign apps to rooms of the same school.
//			 * teacher can only assign apps to rooms he/she is in.
//			 */
//			var roomIds = _.map(req.body.assignments, function(assignment) {
//				return assignment.roomId;
//			});
//			async.map(roomIds, function(id, callback) {
//				Room.findById(id, function(err, room) {
//					if(err) {
//						callback(err)
//					}else {
//						callback(null, room);
//					}
//				})
//			}, function(err, rooms) {
//				var errList ;
//				if(is('admin')) {
//					errList = _.filter(rooms, function(room){
//						return room.school.toString() !== req.user.school.toString();
//					});
//					if(errList.length) {
//						return res.status(403).send('Forbidden');
//					}else {
//						return next();
//					}
//				}else if(is('teacher')) {
//					errList = _.filter(rooms, function(room) {
//						return room.teachers.indexOf(req.user._id) === -1;
//					});
//					if(errList.length) {
//						return res.status(403).send('Forbidden');
//					}else {
//						return next();
//					}
//				}else {
//					return res.status(406).send('Role Not Acceptable');
//				}
//			})
//		}
//		else if(req.route.path === '/assign/sunpack' && req.method === 'POST') {
//			/**
//			 * admin can only assign folders to rooms of the same school.
//			 * teacher can only assign apps to rooms he/she is in.
//			 */
//			var roomIdss = _.map(req.body.assignments, function(assignment) {
//				return assignment.roomId;
//			});
//			async.map(roomIdss, function(id, callback) {
//				Room.findById(id, function(err, room) {
//					if(err) {
//						callback(err)
//					}else {
//						callback(null, room);
//					}
//				})
//			}, function(err, rooms) {
//				var errList ;
//				if(is('admin')) {
//					errList = _.filter(rooms, function(room){
//						return room.school.toString() !== req.user.school.toString();
//					});
//					if(errList.length) {
//						return res.status(403).send('Forbidden');
//					}else {
//						return next();
//					}
//				}else if(is('teacher')) {
//					errList = _.filter(rooms, function(room) {
//						return room.teachers.indexOf(req.user._id) === -1;
//					});
//					if(errList.length) {
//						return res.status(403).send('Forbidden');
//					}else {
//						return next();
//					}
//				}else {
//					return res.status(406).send('Role Not Acceptable');
//				}
//			})
//		}
//		else {
//			return res.status(406).send('Path Not Acceptable');
//		}
//	}else {
//		return res.status(401).send("Unauthorized");
//	}
//
//
//};
//
//exports.restifyApp = function(req, res, next) {
//	var isLoggedin = (function () {
//		return req.isAuthenticated();
//	})();
//
//	var is = function (role) {
//		return (req.user && req.user.roles && _.contains(req.user.roles, role));
//	};
//
//	if(is('root')) {
//		return next();
//	}
//	if(isLoggedin) {
//		if(req.route.path === '/apps') {
//			if(req.method === 'GET') {
//				return next();
//			}
//			else if(req.method === 'POST') {
//				if(is('admin')) {
//					return next();
//				}
//				/**
//				 * Teacher can create app if 'canCreateApp' field is true
//				 */
//				else if(is('teacher')) {
//					if(req.user.canCreateApp) {
//						return next();
//					}else {
//						return res.status(403).send("Forbidden");
//					}
//				}
//			}
//		}
//		else if(req.route.path === '/apps/count') {
//			return next();
//		}
//		else if(req.route.path === '/apps/:id') {
//			var appid = req.params.id;
//			App.findById(appid, function(err, app) {
//				if(err) {
//					return res.send(500);
//				}
//				else if(app) {
//					if(req.method === 'GET') {
//						return next();
//					}
//					/**
//					 * Admin and teacher can't edit or delete apps created by root.
//					 * Admin can edit or delete apps created by admin or teacher.
//					 * Teacher can only edit or delete apps created by themselves.
//					 */
//					if(req.method === 'PUT' || req.method === 'DELETE') {
//						if(app.create_by === 'root') {
//							return res.status(403).send('Forbidden');
//						}else if(app.create_by === 'admin') {
//							if(is('admin')) {
//								return next();
//							}
//							else if(is('teacher')) {
//								return res.status(403).send('Forbidden');
//							}
//						}else if(app.create_by === 'teacher') {
//							if(is('admin')) {
//								return next();
//							}
//							else if(is('teacher')) {
//								if(app.teacher.toString() == req.user._id.toString()) {
//									return next();
//								}else {
//									return res.status(403).send('Forbidden');
//								}
//							}
//						}else {
//							return res.status(406).send('Path Not Acceptable');
//						}
//					}
//				}else {
//					return res.status(404).send('Not Found');
//				}
//			})
//		}
//		else if(req.route.path === '/upload/app/:appId') {
//			var id = req.params.appId;
//			App.findById(id, function(err, app) {
//				if(err) {
//					return res.send(500);
//				}
//				else if(app) {
//					if(app.create_by === 'root') {
//						return res.status(403).send('Forbidden');
//					}else if(app.create_by === 'admin') {
//						if(is('admin')) {
//							return next();
//						}
//						else if(is('teacher')) {
//							return res.status(403).send('Forbidden');
//						}
//					}else if(app.create_by === 'teacher') {
//						if(is('admin')) {
//							return next();
//						}
//						else if(is('teacher')) {
//							if(app.teacher.toString() == req.user._id.toString()) {
//								return next();
//							}else {
//								return res.status(403).send('Forbidden');
//							}
//						}
//					}else {
//						return res.status(406).send('Not Acceptable');
//					}
//				}else {
//					return res.status(404).send('App Not Found');
//				}
//			})
//		}else {
//			return res.status(406).send('Path Not Acceptable');
//		}
//	}else {
//		return res.status(401).send("Unauthorized");
//	}
//};
//
//exports.restifySchool = function(req, res, next) {
//	var is = function (role) {
//		return (req.user && req.user.roles && _.contains(req.user.roles, role));
//	};
//
//	/**
//	 * Admin can only edit launcher password of his/her school, but can't create or delete schoool.
//	 * Teacher can't create, edit, delete school.
//	 *
//	 */
//	if(is('root')) {
//		return next();
//	}else {
//		if(req.method === 'GET') {
//			return next();
//		}
//		else if(req.method === 'POST' || req.method === 'DELETE') {
//			return res.status(403).send('Forbidden');
//		}
//		else if(req.method === 'PUT') {
//			var sameSchool = (req.user.school.toString() === req.params.id.toString());
//			if(is('admin') || sameSchool ) {
//				return next();
//			}else {
//				return res.status(403).send('Forbidden');
//			}
//		}else {
//			return res.status(406).send('Path Not Acceptable');
//		}
//	}
//};
//
//exports.restifyRecord = function(req, res, next) {
//	return next();
//};
//
//exports.restifyTablet = function(req, res, next) {
//	var isLoggedin = (function () {
//		return req.isAuthenticated();
//	})();
//
//	var is = function (role) {
//		return (req.user && req.user.roles && _.contains(req.user.roles, role));
//	};
//
//	var isSelf = (function () {
//		return req.query && req.query.username && req.user && req.query.username === req.user.username;
//	})();
//
//	if(is('root')) {
//		return next();
//	}
//	if(isLoggedin) {
//		return next();
//	}else {
//		return res.status(401).send("Unauthorized");
//	}
//};
//
//
//exports.restifyFolder = function(req,res, next) {
//	next();
//};
//
//
