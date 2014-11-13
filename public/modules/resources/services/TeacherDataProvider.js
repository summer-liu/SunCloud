angular.module('schoolManage')
    .factory('TeacherDataProvider', ['$http', '$q', '$route',function ($http, $q, $route) {
        var getTeachersBySchool = function(schoolId, callBack) {
            var defered = $q.defer();
            var teachersBySchoolPromise = defered.promise;
            $http({
                method: "GET",
                url: "/users?roles=teacher&school=" + schoolId
            }).success(function(teachers) {
                defered.resolve(teachers);
                if(callBack) {
                    callBack(teachers);
                }
            }).error(function (err) {
                console.error(err);
            });
            return teachersBySchoolPromise;
        };

        var getCountsOfTeachersBySchool = function(schoolId, callBack){
            $http({
                method: "GET",
                url: "/users/count?roles=teacher&school=" + schoolId
            }).success(function(counts){
                callBack(counts);
            }).error(function(err){
                console.error(err);
            });
        };

        var createTeacher = function (info) {
            $http({
                method: "POST",
                url: "/users",
                data: {
                    "name": info.name,
                    "username": info.username,
                    "roles": ["teacher"],
                    "school": info.school,
                    "password": "xiaoshu"
                }
            }).success(function (teacher) {
                info.callBack(undefined, teacher);
            }).error(function (err) {
                info.callBack('Username already exists');
            });
        };
        var getTeacher = function (teacherId, callBack) {
            var defered = $q.defer();
            var teacherPromise = defered.promise;
            $http({
                method: "GET",
                url: "/users/" + teacherId + "?populate=school"
            }).success(function (teacher) {
                defered.resolve(teacher);
                if(callBack) {
                    callBack(teacher);
                }
            }).error(function (err) {
                ohNo(err);
            });
            return teacherPromise;
        };
        var editTeacher = function (teacher, callBack) {
            $http({
                method: "PUT",
                url: "/users/" + teacher._id,
                data: teacher
            }).success(function (teacher) {
                callBack(undefined,teacher);
            }).error(function (err) {
                callBack(err);
            });
        };
        var removeTeacher = function (teacherId, callBack) {
            $http({
                method: "DELETE",
                url: "/users/" + teacherId
            }).success(function (teacher) {
                callBack(undefined, teacher);
            }).error(function (err) {
                callBack(err);
            });
        };

        var getTeacherRooms = function (teacherId, callBack) {
            $http({
                method: "GET",
                url: "/rooms?teachers.teacher=" + teacherId
            }).success(function(rooms){
                callBack(rooms)
            }).error(function(err){
                console.error(err);
            })
        };
        return {
            getTeachersBySchool: getTeachersBySchool,
            getCountsOfTeachersBySchool: getCountsOfTeachersBySchool,
            createTeacher: createTeacher,
            getTeacher: getTeacher,
            editTeacher: editTeacher,
            removeTeacher: removeTeacher,
            getTeacherRooms: getTeacherRooms
        };
    }]);