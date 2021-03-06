angular.module('common')
    .factory('RootDataProvider', ['$http', '$q', function ($http, $q) {

        var getAllSchools = function () {
            var defered = $q.defer();
            var schoolsPromise = defered.promise;
            $http({
                method: "GET",
                url: "/schools"
            }).success(function (schools) {
                defered.resolve(schools);
            }).error(function (err) {
                console.error(err);
            });
            return schoolsPromise;
        };

        var getAllSchoolsCount = function (callBack) {
            var defered = $q.defer();
            var countPromise = defered.promise;
            $http({
                method: "GET",
                url: "/schools/count"
            }).success(function (count) {
                defered.resolve(count);
                if (callBack) {
                    callBack(count);
                }
            }).error(function (err) {
                console.error(err);
            });
            return countPromise;
        };

        var getAllStudents = function (callBack) {
            var defered = $q.defer();
            var studentsPromise = defered.promise;
            $http({
                method: "GET",
                url: "/users?populate=school&roles=student&sort=username"
            }).success(function (students) {
                defered.resolve(students);
                if (callBack) {
                    callBack(students);
                }
            }).error(function (err) {
                console.error(err);
            });
            return studentsPromise;
        };

        var getAllStudentsCount = function (callBack) {
            var defered = $q.defer();
            var countPromise = defered.promise;
            $http({
                method: "GET",
                url: "/users/count?roles=student"
            }).success(function (count) {
                defered.resolve(count);
                if (callBack) {
                    callBack(count);
                }
            }).error(function (err) {
                console.error(err);
            });
            return countPromise;
        };

        var getAllTeachers = function (callBack) {
            var defered = $q.defer();
            var teachersPromise = defered.promise;
            $http({
                method: "GET",
                url: "/users?populate=school&roles=[teacher,admin]"
            }).success(function (teachers) {
                defered.resolve(teachers);
                if (callBack) {
                    callBack(teachers);
                }
            }).error(function (err) {
                console.error(err);
            });
            return teachersPromise;
        };

        var getAllTeachersMin = function (callBack) {
            var defered = $q.defer();
            var teachersPromise = defered.promise;
            $http({
                method: "GET",
                url: "/users?roles=[teacher,admin,root]"
            }).success(function (teachers) {
                defered.resolve(teachers);
                if (callBack) {
                    callBack(teachers);
                }
            }).error(function (err) {
                console.error(err);
            });
            return teachersPromise;
        };

        var getAllTeachersCount = function (callBack) {
            var defered = $q.defer();
            var countPromise = defered.promise;
            $http({
                method: "GET",
                url: "/users/count?roles=teacher"
            }).success(function (count) {
                defered.resolve(count);
                if (callBack) {
                    callBack(count);
                }
            }).error(function (err) {
                console.error(err);
            });
            return countPromise;
        };

        var getAllTablets = function (callBack) {
            var defered = $q.defer();
            var teachersPromise = defered.promise;
            $http({
                method: "GET",
                url: "/tablets?populate=school"
            }).success(function (tablets) {
                defered.resolve(tablets);
                if (callBack) {
                    callBack(tablets);
                }
            }).error(function (err) {
                console.error(err);
            });
            return teachersPromise;
        };

        var getAllTabletsCount = function (callBack) {
            var defered = $q.defer();
            var countPromise = defered.promise;
            $http({
                method: "GET",
                url: "/tablets/count"
            }).success(function (count) {
                defered.resolve(count);
                if (callBack) {
                    callBack(count);
                }
            }).error(function (err) {
                console.error(err);
            });
            return countPromise;
        };


        var getAllRooms = function (callBack) {
            var defered = $q.defer();
            var teachersPromise = defered.promise;
            $http({
                method: "GET",
                url: "/rooms?populate=school"
            }).success(function (rooms) {
                defered.resolve(rooms);
                if (callBack) {
                    callBack(rooms);
                }
            }).error(function (err) {
                console.error(err);
            });
            return teachersPromise;
        };

        var getAllRoomsCount = function (callBack) {
            var defered = $q.defer();
            var countPromise = defered.promise;
            $http({
                method: "GET",
                url: "/rooms/count"
            }).success(function (count) {
                defered.resolve(count);
                if (callBack) {
                    callBack(count);
                }
            }).error(function (err) {
                console.error(err);
            });
            return countPromise;
        };


        var getAllApps = function (callBack) {
            var defered = $q.defer();
            var appsPromise = defered.promise;
            $http({
                method: "GET",
                url: "/apps?populate=school,owner"
            }).success(function (apps) {
                defered.resolve(apps);
                if(callBack){
                    callBack(apps);
                }
            }).error(function (err) {
                defered.reject(err);
                console.log(err);
            });
            return appsPromise;
        };




        return {
            getAllSchools: getAllSchools,
            getAllSchoolsCount: getAllSchoolsCount,
            getAllStudents: getAllStudents,
            getAllStudentsCount: getAllStudentsCount,
            getAllTeachers: getAllTeachers,
            getAllTeachersMin: getAllTeachersMin,
            getAllTeachersCount: getAllTeachersCount,
            getAllTablets: getAllTablets,
            getAllTabletsCount: getAllTabletsCount,
            getAllRooms: getAllRooms,
            getAllRoomsCount: getAllRoomsCount,
            getAllApps: getAllApps
        };
    }]);
