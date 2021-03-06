angular.module('sunpack')
    .controller('subjectController',
    ['AuthService', '$scope', 'SubjectDataProvider', 'FolderDataProvider', 'SemesterDataProvider','$stateParams', 'subject', 'folders', '$state', '$rootScope',
        function (AuthService, $scope, SubjectDataProvider, FolderDataProvider, SemesterDataProvider, $stateParams, subject, folders,$state, $rootScope) {
            $scope.subject = subject;
            $scope.folders = folders;
            $scope.newFolder = {};
            $scope.temp = {};
            var me = AuthService.me;
            $scope.filterOptions = {filterText: ''};

            $scope.theDate = new Date();

            SemesterDataProvider.getAllSemesters().then(function(semesters) {
                $scope.semesters = semesters;
            });
            $rootScope.$on('addFile', function(event, data) {
                var theFolder = _.find($scope.folders, function(folder) {
                    return folder._id === data.folderId;
                });
                theFolder.files.length += 1;
                theFolder.updated_at = Date.now();
            });

            $rootScope.$on('deleteFile', function(event, data) {
                var theFolder = _.find($scope.folders, function(folder) {
                    return folder._id === data.folderId;
                });
                theFolder.files.length -= 1;
                theFolder.updated_at = Date.now();
            });


            $scope.createFolder = function() {
                var info = {};
                info.name = $scope.newFolder.name;
                info.semester = $scope.newFolder.semester._id;
                info.owner = me._id;
                info.subject = subject._id;
                info.school = me.school;
                FolderDataProvider.createFolder(info)
                    .success(function(folder) {
                        console.log(folder);
                        folder.semester = $scope.newFolder.semester;
                        $scope.folders = $scope.folders.concat(folder);
                        $scope.newFolder = undefined;
                        swal({title: '创建文件夹成功', type: 'success', timer: 1500});
                        $('#createFolderDialog').modal('hide');
                        $rootScope.$broadcast('createFolder', {subjectId: subject._id});

                    })
                    .error(function(err) {
                        console.error(err);
                        swal({title: '创建文件夹失败', text: '请重试', type: 'error', timer: 2000});

                    })
            };

            $scope.showEditFolderDialog = function(event, row) {
                event.stopPropagation();
                $('#editFolderDialog').modal('show');
                $scope.row = row;
                $scope.temp.newName = row.entity.name;
                console.log(row.entity.semester);
                $scope.temp.newSemester = _.find($scope.semesters, function(semester) {
                    return semester._id === row.entity.semester._id
                });
            };
            $scope.editFolder = function(row) {
                var info = {};
                info._id = row.entity._id;
                info.name = $scope.temp.newName;
                info.semester = $scope.temp.newSemester._id;

                if (row.entity.semester._id.toString() === info.semester.toString()) {
                    FolderDataProvider.editFolderName(info)
                        .success(function(editedFolder) {
                            $scope.row.entity.name = editedFolder.name;
                            $scope.row.entity.updated_at = editedFolder.updated_at;
                            $('#editFolderDialog').modal('hide');
                            swal({title: "修改成功", type: "success", timer: 1000 });
                        })
                        .error(function(err) {
                            console.error(err);
                            $scope.error = true;
                            swal({title: "修改失败", text: "请重试", type: "error", timer: 2000 });
                        })
                }else {
                    FolderDataProvider.editFolderNameAndSemester(info)
                        .success(function(editedFolder) {
                            $scope.row.entity.name = editedFolder.name;
                            $scope.row.entity.semester = $scope.temp.newSemester;
                            $scope.row.entity.updated_at = editedFolder.updated_at;
                            $('#editFolderDialog').modal('hide');
                            swal({title: "修改成功", type: "success", timer: 1000 });
                        })
                        .error(function(err) {
                            console.error(err);
                            $scope.error = true;
                            swal({title: "修改失败", text: err, type: "error", timer: 2000 });
                        })
                }
            };


            $scope.deleteFolder = function (event, row) {
                event.stopPropagation();
                swal({
                        title: "您确定要删除"+row.entity.name+"吗?",
                        text: "删除之后，文件夹内所有文件也会一起删除",
                        type: "warning",
                        showCancelButton: true,
                        cancelButtonText: "取消",
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "删除",
                        closeOnConfirm: false },
                    function(){
                        FolderDataProvider.deleteFolder(row.entity._id)
                            .success(function(folder){
                                swal({title: "删除成功", type: "success", timer: 1000 });
                                $scope.folders.splice($scope.folders.indexOf(row.entity),1);
                                $rootScope.$broadcast('deleteFolder', {subjectId: subject._id});
                            })
                            .error(function(err){
                                console.error(err);
                                swal({title: "删除失败", text: "请重试", type: 'error'})

                            })
                    });
            };




            $scope.gridOptions =
            {
                data: 'folders',
                multiSelect: false,
                enableColumnResize: true,
                rowTemplate: '<div  ng-mouseover="$parent.showedit=true" ng-mouseleave="$parent.showedit=false" ng-style="{\'cursor\': row.cursor, \'z-index\': col.zIndex() }" ' +
                'ng-repeat="col in renderedColumns" ng-class="col.colIndex()" ' +
                'class="ngCell {{col.cellClass}}" ng-cell></div>',
                columnDefs: [
                    {field: '_id', visible: false},
                    {field: 'name', displayName: '文件夹名', cellTemplate: '<div><a>{{row.entity.name}}</a></div>'},
                    {field: 'files.length', displayName: '文件个数', width: '10%'},
                    {field: 'semester.name', displayName: '年级'},
                    {field: 'created_at', displayName: '创建时间', cellTemplate: '<span class="label label-success" am-time-ago="row.entity.created_at"></span>'},
                    {field: 'updated_at', displayName: '更新时间', cellTemplate: '<span class="label label-success" am-time-ago="row.entity.updated_at"></span>'},
                    {field: 'rooms', displayName: '分配班级'},
                    {field: '', displayName: '编辑', width: '10%',cellTemplate:
                    '<div class="ngCellText" ng-class="col.colIndex()" ng-show="showedit">' +
                    '<a class="fui-new text-success" ng-click="showEditFolderDialog($event, row)"></a> &nbsp;&nbsp;' +
                    '<a class="fui-cross text-danger" ng-click="deleteFolder($event,row)"></a></div>'}
                ],
                selectedItems: [],
                filterOptions: $scope.filterOptions
            };

            //$.fn.timeago(new Date());
            //$.fn.timeago.defaults = {
            //    selector: 'time.timeago',
            //    attr: 'datetime',
            //    dir: 'up',
            //    suffix: 'ago'
            //};


            $scope.selectFolder = function () {
                $state.go('sunpack.subject.folder', {folderId: $scope.gridOptions.selectedItems[0]._id});
                //$location.path('/rooms/' + $scope.gridOptions.selectedItems[0]._id);
            };
            $('[data-toggle="tooltip"]').tooltip();
            $('[data-toggle="popover"]').popover();

            $('[data-toggle="checkbox"]').radiocheck();


            // Focus state for append/prepend inputs
            $('.input-group').on('focus', '.form-control', function () {
                $(this).closest('.input-group, .form-group').addClass('focus');
            }).on('blur', '.form-control', function () {
                $(this).closest('.input-group, .form-group').removeClass('focus');
            });

        }
    ]
);