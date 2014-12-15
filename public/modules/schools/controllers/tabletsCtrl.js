angular.module('schools')
    .controller('tabletsRootController',
    ['tablets', 'TabletDataProvider', '$scope', '$location',
        function (tablets, TabletDataProvider, $scope, $location) {
            $scope.tablets = tablets;
            $scope.filterOptions = {
                filterText: ''
            };
            $scope.selectedTablet = [];

            _.each($scope.tablets, function(tabletItem) {
                TabletDataProvider.getTabletUser(tabletItem._id).success(function (records) {
                    if(records.length) {
                        tabletItem.userId = records[0].userId._id;
                        tabletItem.userName = records[0].userId.name;
                    }
                }).error(function(err) {
                    console.error(err);
                });
            });

            $scope.logout = function (event, row) {
                event.stopPropagation();
                swal({
                        title: "登出晓书",
                        text: "您确定要将"+row.entity.userName+"登出晓书吗?",
                        type: "warning",
                        showCancelButton: true,
                        cancelButtonText: "取消",
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "确定",
                        closeOnConfirm: false },
                    function(){
                        TabletDataProvider.logout(row.entity.userId, row.entity._id)
                            .success(function(record){
                                row.entity.userId = null;
                                row.entity.userName = null;
                                //row.entity.loginTime = null;
                                swal({title: "登出成功", type: "success", timer: 1500 });
                            })
                            .error(function(err){
                                console.error(err);
                                swal({title: "登出失败", text: "请重试", type: 'error', timer: 2000})
                            });
                    });

            };

            $scope.gridOptions =
            {
                data: 'tablets',
                multiSelect: false,
                rowTemplate: '<div  ng-mouseover="$parent.showedit=true" ng-mouseleave="$parent.showedit=false" ng-style="{\'cursor\': row.cursor, \'z-index\': col.zIndex() }" ' +
                'ng-repeat="col in renderedColumns" ng-class="col.colIndex()" ' +
                'class="ngCell {{col.cellClass}}" ng-cell></div>',
                columnDefs: [
                    {field: '_id', visible: false},
                    {field: 'machine_id', displayName: '晓书编号', width: '25%'},
                    {field: 'OS_type', displayName: '操作系统'},
                    {field: 'OS_version', displayName: '版本', width: '10%'},
                    {field: 'lastUpdate', displayName: '上次更新', width: '20%'},
                    {field: 'school.name', displayName: '所属学校'},
                    {field: 'userName', displayName: '正在使用',
                        cellTemplate:'<div class="ngCellText" ng-class="col.colIndex()" ng-show="row.entity.userName">' +
                        '<a href="/#/students/{{row.entity.userId}}">{{row.getProperty(col.field)}}</a></div>' +
                        '<div ng-hide="row.entity.userName"><span class="label label-default">暂无</span></div>'},
                    {field: 'userId', displayName: '', cellTemplate:'<button type="button" align="center" class="btn btn-inverse btn-sm" ng-click="logout($event, row)" ng-show="row.entity.userName"><span class="glyphicon glyphicon-log-out"></span> 登出</button>'}

                ],
                filterOptions: $scope.filterOptions,
                selectedItems: $scope.selectedTablet
            };

            $scope.selectTablet = function () {
                $location.path('/tablets/' + $scope.gridOptions.selectedItems[0]._id);
            };


        }]);
