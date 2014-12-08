'use strict';

// Setting up route
angular.module('manage').config(['$stateProvider',
    function($stateProvider) {
        var __templates = '/modules/manage/views/';

        $stateProvider.
            state('deviceManage', {
                url: '/manage',
                controller: 'manageNavController',
                templateUrl: __templates + 'manageNav.html'
            }).
            state('myDevice', {
                url: '/mydevice',
                parent: 'deviceManage',
                controller: 'myDeviceController',
                templateUrl: __templates + 'myDevice.html',
                resolve: {
                    myDevice: ['UserDataProvider', 'AuthService',
                        function(UserDataProvider, AuthService) {
                            return UserDataProvider.getTablet(AuthService.me._id);
                        }]
                }
            }).
            state('appsManage', {
                url: '/apps',
                parent: 'deviceManage',
                controller: 'appsManageController',
                templateUrl: __templates + 'appsManage.html',
                resolve: {
                    apps: ['AppDataProvider', 'AuthService',
                        function(AppDataProvider, AuthService) {
                            return AppDataProvider.getAppsByTeacher(AuthService.me._id,AuthService.me.school);
                        }],
                    myRooms: ['RoomDataProvider', 'AuthService',
                        function(RoomDataProvider, AuthService) {
                            return RoomDataProvider.getRoomsByTeacher(AuthService.me._id)
                        }
                    ]
                }
            }).
            state('lockView', {
                url: '/lockview',
                parent: 'deviceManage',
                controller: 'lockViewController',
                templateUrl: __templates + 'lockView.html'
            }).
            state('mySetting', {
                url: '/setting',
                parent: 'deviceManage',
                controller: 'mySettingController',
                templateUrl: __templates + 'mySetting.html'
            });
    }
]);
