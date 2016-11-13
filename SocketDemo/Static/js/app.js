/*! socket-demo - v1.0.0 - 2016-11-13 */
 (function(){angular.module('sd.app', [
    'ui.router',

    'sd.templates',
    'sd.menu',

    'sd.service.request',
    'sd.fileSelector',

    'sd.home',
    'sd.request'
])
.config(['$stateProvider', function ($stateProvider) {

    $stateProvider.state({
        name: 'home',
        url: '/',
        component:'viewHome'
    });
    $stateProvider.state({
        name: 'request',
        abstract: true,
        template: '<ui-view></ui-view>'
    });
    $stateProvider.state({
        name: 'request.list',
        url: '/requests',
        component: 'requestList'
    });
    $stateProvider.state({
        name: 'request.detail',
        url: '/request/:requestId',
        component: 'requestDetail'
    });
    $stateProvider.state({
        name: 'createRequest',
        url: '/createRequest',
        component: 'requestDetail'
    });
}])
.run([function () {

}]);

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}
angular.module('sd.home', [])
    .component('viewHome', {
        templateUrl: 'App/html/views/home.html',
        controller: ['$scope', function ($scope) {
            var self = this;
        }]
    });
angular.module('sd.request.detail', [])
    .component('requestDetail', {
        templateUrl: 'App/html/views/request-detail.html',
        controller: ['$scope','$state','requestService', function ($scope,$state,requestService) {
            var self = this;

            // -- public functions
            self.$onInit = $onInit;
            self.createUpdateRequest = createUpdateRequest;
            self.addFile = addFile;
            self.removeFile = removeFile;

            // -- public props
            self.requestId = $state.params.requestId;
            self.request = null;
            self.loading = false;


            function $onInit() {
                if (self.requestId)
                    loadRequest(self.requestId);
                else
                    self.request = {};
            }
            function loadRequest(requestId) {
                if (self.loading)
                    return;

                self.loading = true;
                requestService.getRequest(requestId)
                    .then(function (data) {
                        self.request = data.data;
                    }).catch(function () {
                        alert('an error has occured');
                    }).then(function () {
                        self.loading = false;
                    });
            }
            function createUpdateRequest(useForm) {
                if (!self.request || self.loading)
                    return;

                var suffix = useForm ? 'Form' : '';

                //requestService.updateRequestForm(self.request.RequestId, self.request);
                self.loading = true;

                (self.request.RequestId ?
                    requestService['updateRequest' + suffix](self.request.RequestId, self.request) : 
                    requestService['createRequest' + suffix](self.request))
                        .then(function () {
                            $state.go('request.list');
                        }).catch(function () {
                            alert('an error has occured');
                        }).then(function () {
                            self.loading = false;
                        });
            }
            function addFile(file) {
                if (!self.request.Attachments)
                    self.request.Attachments = [];

                self.request.Attachments.push({
                    FileName: file.name,
                    handle: file
                });
//                console.log(file.name);
            }
            function removeFile(file) {
                var index = self.request.Attachments.indexOf(file);
                if (index >= 0) {
                    self.request.Attachments.splice(index, 1);
                }
            }
        }]
    });
angular.module('sd.request.list', [])
    .component('requestList', {
        templateUrl: 'App/html/views/request-list.html',
        controller: ['$scope', 'requestService', function ($scope, requestService) {
            var self = this;
            
            // -- public functions
            self.$onInit = $onInit;
            self.refresh = refresh;

            // -- public vars
            self.loading = false;
            self.requests = [];


            function $onInit() {
                refresh();
            }

            function refresh() {
                if (self.loading)
                    return;

                self.loading = true;

                requestService()
                    .then(function (data) {
                        self.requests = data.data;
                    }).catch(function () {
                        alert('error retrieving data');
                    }).then(function () {
                        self.loading = false;
                    });
            }
        }]
    });
angular.module('sd.request', [
    'sd.request.detail',
    'sd.request.list'
]);
angular.module('sd.fileSelector', [])
    .component('fileSelector', {
        templateUrl: 'App/html/controls/file-selector.html',
        bindings: {
            onFileAdded: '&'
        },
        controller: ['$scope','$element', function ($scope,$element) {
            var self = this;

            // -- public function
            self.$onInit = $onInit;
            self.$onDestroy = $onDestroy;

            // -- public members


            // -- private
            function $onInit() {
                $element.bind('dragover dragenter dragleave', preventDefault);
                $element.bind('drop', function (event) {
                    preventDefault(event);

                    event = getEvent(event);

                    $scope.$apply(function () {
                        for (var index = 0; index < event.dataTransfer.files.length; index++) {
                            var file = event.dataTransfer.files[index];

                            self.onFileAdded({ file: file });
                        }
                    });
                });
            }
            function $onDestroy() {
                $element.off()
            }

            function getEvent(event) {
                if ('originalEvent' in event) {
                    return event.originalEvent;
                }
                return event;
            };
            function preventDefault (event) {
                event = getEvent(event);
                $element.removeClass('event-dragleave');
                $element.removeClass('event-dragenter');
                $element.removeClass('event-dragover');
                $element.removeClass('event-drop');
                $element.addClass('event-' + event.type);
                event.preventDefault();
                event.stopPropagation();
            }
        }]
    });
angular.module('sd.menu', [])
.controller('menuController',['$rootScope','$transitions', function ($rootScope,$transitions) {
    var self = this;

    self.activeState = '';

    self.inRoute = function (route) {
        return route && self.activeState.startsWith(route);
    }

    $transitions.onSuccess({}, function ($transitions) {
        var toState = $transitions.$to();
        if (toState)
            self.activeState = toState.name;
        //console.log(JSON.stringify(toState.name));
    });
}]);
angular.module('sd.service.request', [])
    .factory('requestService', ['$http', '$q', function ($http, $q) {
        var service = getRequests;
        var reader = new FileReader();

        service.getRequest = getRequest;
        service.updateRequest = updateRequest;
        service.createRequest = createRequest;
        service.updateRequestForm = updateRequestForm;
        service.createRequestForm = createRequestForm;

        return service;

        function getRequests() {
            return $http.get('api/request');
        }
        function getRequest(requestId) {
            return $http.get('api/request/' + requestId);
        }
        function createRequest(request) {
            if (request.Attachments && request.Attachments.length) {
                var copy = angular.copy(request);

                return $q.all(request.Attachments.map(function (f) {
                    if (f.AttachmentId)
                        return f;
                    return parseFile(f.handle).then(function (data) {
                        return {
                            FileName: f.FileName,
                            ContentsBase64: data
                        };
                    });
                })).then(function (data) {
                    copy.Attachments = data;
                    return $http.post('api/request/', copy);
                })
            }
            else {
                return $http.post('api/request/', request);
            }

        }
        function updateRequest(requestId, request) {
            if (request.Attachments) {
                var copy = angular.copy(request);

                return $q.all(request.Attachments.map(function (f) {
                    if (f.AttachmentId)
                        return f;
                    return parseFile(f.handle).then(function (data) {
                        return {
                            FileName: f.FileName,
                            ContentsBase64: data
                        };
                    });
                })).then(function (data) {
                    copy.Attachments = data;
                    return $http.put('api/request/' + requestId, copy);
                })
            }
            else {
                return $http.put('api/request/' + requestId, request);
            }
        }

        function createRequestForm(request) {
            var deferred = $q.defer();

            try {
                var formData = new FormData();
                var files = Object.create(null);
                var clone = extractFiles(request, files);

                formData.append('$$meta$$', JSON.stringify(clone));

                for (var i in files) {
                    formData.append(i, files[i]);
                }

                $.ajax({
                    url: 'api/requestform/',
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    type: 'POST'
                }).done(function (d) {
                    deferred.resolve(d);
                }).fail(function (e) {
                    deferred.reject(e)
                });
            }
            catch (e) {
                deferred.reject(e);
            }
            finally {
                return deferred.promise;
            }
        }
        function updateRequestForm(requestId, request) {
            var deferred = $q.defer();

            try {
                var formData = new FormData();
                var files = Object.create(null);
                var clone = extractFiles(request, files);

                formData.append('$$meta$$', JSON.stringify(clone));

                for (var i in files) {
                    formData.append(i, files[i]);
                }

                $.ajax({
                    url: 'api/requestform/' + requestId,
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    type: 'PUT'
                }).done(function (d) {
                    deferred.resolve(d);
                }).fail(function (e) {
                    deferred.reject(e)
                });
            }
            catch (e) {
                deferred.reject(e);
            }
            finally {
                return deferred.promise;
            }
        }

        function parseFileChunks(file) {
            var deferred = $q.defer();
            try {
                var fileSize = file.size;
                var chunkSize = 1024 * 1024; // 1 MB
                var offset = 0;

                // -- reset reader
                reader.onload = null;


                chunkReaderBlock(offset, chunkSize, file);

                function chunkReaderBlock(_offset, length, _file) {
                    var blob = _file.slice(_offset, length + _offset);
                    reader.onload = readEventHandler;
                    reader.readAsArrayBuffer(blob);
                }

                function readEventHandler(evt) {
                    try {
                        if (evt.target.error == null) {
                            offset += evt.target.result.byteLength;
                            deferred.notify(evt.target.result);
                        } else {
                            deferred.reject(evt.target.error);
                            return;
                        }
                        if (offset >= fileSize) {
                            deferred.resolve(offset);
                            return;
                        }

                        chunkReaderBlock(offset, chunkSize, file);
                    }
                    catch (e2) {
                        deferred.reject(e2);
                    }
                }
            }
            catch (e) {
                deferred.reject(e);
            }
            finally {
                return deferred.promise;
            }
        }
        function parseFile(file) {
            var deferred = $q.defer();
            try {
                var reader = new FileReader();
                // -- reset reader
                reader.onload = null;


                reader.onload = readEventHandler;
                reader.readAsArrayBuffer(file);

                function readEventHandler(evt) {
                    try {
                        if (evt.target.error == null) {
                            deferred.resolve(_arrayBufferToBase64(evt.target.result));
                        } else {
                            deferred.reject(evt.target.error);
                            return;
                        }
                    }
                    catch (e2) {
                        deferred.reject(e2);
                    }
                }
            }
            catch (e) {
                deferred.reject(e);
            }
            finally {
                return deferred.promise;
            }
        }
        function _arrayBufferToBase64(buffer) {
            var binary = '';
            var bytes = new Uint8Array(buffer);
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        }
        function extractFiles(obj, files,clone) {
            clone = clone || angular.copy(obj);

            for (var property in obj) {
                if (obj.hasOwnProperty(property)) {
                    if (typeof obj[property] === 'object' && !(obj[property] instanceof File)) {
                        extractFiles(obj[property], files, clone[property]);
                    } else if (obj[property] instanceof File) {
                        var uid = createFileId();

                        files[uid] = obj[property]; // -- save to file dict
                        clone[property] = uid; // -- replace with id
                    }
                    else {
                        clone[property] = obj[property];
                    }
                }
            }
            return clone;
        }
        function createFileId() {
            return '$$sd-file-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    }]);
angular.module('sd.templates', []);

angular.module('sd.templates').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('App/html/controls/file-selector.html',
    "<div class=\"file-drop\">\r" +
    "\n" +
    "    <div class=\"icon\">\r" +
    "\n" +
    "        <i class=\"fa fa-file-archive-o\"></i>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "    <div class=\"title\">\r" +
    "\n" +
    "        Drag Files Here\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "</div>"
  );


  $templateCache.put('App/html/views/home.html',
    "    <!-- Jumbotron -->\r" +
    "\n" +
    "<div class=\"jumbotron\">\r" +
    "\n" +
    "    <h1>Marketing stuff!</h1>\r" +
    "\n" +
    "    <p class=\"lead\">Cras justo odio, dapibus ac facilisis in, egestas eget quam. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet.</p>\r" +
    "\n" +
    "    <p><a class=\"btn btn-lg btn-success\" href=\"#\" role=\"button\">Get started today</a></p>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "<!-- Example row of columns -->\r" +
    "\n" +
    "<div class=\"row\">\r" +
    "\n" +
    "    <div class=\"col-lg-4\">\r" +
    "\n" +
    "        <h2>Safari bug warning!</h2>\r" +
    "\n" +
    "        <p class=\"text-danger\">As of v9.1.2, Safari exhibits a bug in which resizing your browser horizontally causes rendering errors in the justified nav that are cleared upon refreshing.</p>\r" +
    "\n" +
    "        <p>Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui. </p>\r" +
    "\n" +
    "        <p><a class=\"btn btn-primary\" href=\"#\" role=\"button\">View details &raquo;</a></p>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "    <div class=\"col-lg-4\">\r" +
    "\n" +
    "        <h2>Heading</h2>\r" +
    "\n" +
    "        <p>Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui. </p>\r" +
    "\n" +
    "        <p><a class=\"btn btn-primary\" href=\"#\" role=\"button\">View details &raquo;</a></p>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "    <div class=\"col-lg-4\">\r" +
    "\n" +
    "        <h2>Heading</h2>\r" +
    "\n" +
    "        <p>Donec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Vestibulum id ligula porta felis euismod semper. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa.</p>\r" +
    "\n" +
    "        <p><a class=\"btn btn-primary\" href=\"#\" role=\"button\">View details &raquo;</a></p>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "</div>"
  );


  $templateCache.put('App/html/views/request-detail.html',
    "<div>\r" +
    "\n" +
    "    <form novalidate ng-hide=\"$ctrl.loading\">\r" +
    "\n" +
    "        <div class=\"form-control-static\" ng-show=\"$ctrl.request.RequestId\">\r" +
    "\n" +
    "            Request ID: {{$ctrl.request.RequestId}}\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "        <div class=\"form-group\">\r" +
    "\n" +
    "            <label>Subject</label>\r" +
    "\n" +
    "            <input type=\"input\" class=\"form-control\" ng-model=\"$ctrl.request.Subject\" />\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "        <div class=\"form-group\">\r" +
    "\n" +
    "            <label>CreatedBy</label>\r" +
    "\n" +
    "            <input type=\"input\" class=\"form-control\" ng-model=\"$ctrl.request.CreatedBy\" />\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "        <div class=\"\" ng-show=\"$ctrl.request.CreateDate\">\r" +
    "\n" +
    "            <em><small>Created on {{$ctrl.request.CreateDate | date : 'short'}}</small></em>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "        <div class=\"file-list\" ng-if=\"$ctrl.request.Attachments\" ng-hide=\"$ctrl.loading\">\r" +
    "\n" +
    "            <div ng-repeat=\"file in $ctrl.request.Attachments\">\r" +
    "\n" +
    "                <a href=\"api/attachment/{{file.AttachmentId}}\" ng-show=\"file.AttachmentId\">{{file.FileName}}</a>\r" +
    "\n" +
    "                <span ng-hide=\"file.AttachmentId\">{{file.FileName}}</span>\r" +
    "\n" +
    "                <button type=\"button\" ng-hide=\"$ctrl.loading\" class=\"btn btn-sm btn-danger\" ng-click=\"$ctrl.removeFile(file)\"><i class=\"fa fa-trash\"></i></button>\r" +
    "\n" +
    "            </div>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "        <file-selector on-file-added=\"$ctrl.addFile(file)\"></file-selector>\r" +
    "\n" +
    "        <button class=\"btn btn-primary\" type=\"button\" ng-click=\"$ctrl.createUpdateRequest()\"><i class=\"fa fa-floppy-o\"></i> Base64 Serialize Save</button>\r" +
    "\n" +
    "        <button class=\"btn btn-primary\" type=\"button\" ng-click=\"$ctrl.createUpdateRequest(true)\"><i class=\"fa fa-floppy-o\"></i> MultiPart FormData Save</button>\r" +
    "\n" +
    "    </form>\r" +
    "\n" +
    "    <div class=\"text-center\" ng-show=\"$ctrl.loading\">\r" +
    "\n" +
    "        Loading....\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "</div>"
  );


  $templateCache.put('App/html/views/request-list.html',
    "\r" +
    "\n" +
    "<div class=\"page-header\">\r" +
    "\n" +
    "    <div class=\"pull-right\">\r" +
    "\n" +
    "        <button type=\"button\" class=\"btn btn-default\" ng-click=\"$ctrl.refresh()\"><i class=\"fa fa-refresh\"></i> Refresh</button>\r" +
    "\n" +
    "        <a ui-sref=\"createRequest\" class=\"btn btn-primary\"><i class=\"fa fa-plus-circle\"></i> Create Request</a>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "    <h3>All Requests<small></small></h3>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "<table class=\"table table-striped table-bordered table-hover\" ng-show=\"!$ctrl.loading\">\r" +
    "\n" +
    "    <thead>\r" +
    "\n" +
    "        <tr>\r" +
    "\n" +
    "            <th>RequestID</th>\r" +
    "\n" +
    "            <th>Subject</th>\r" +
    "\n" +
    "            <th>Create Date</th>\r" +
    "\n" +
    "            <th>Created By</th>\r" +
    "\n" +
    "        </tr>\r" +
    "\n" +
    "    </thead>\r" +
    "\n" +
    "    <tbody ng-repeat=\"req in $ctrl.requests\">\r" +
    "\n" +
    "        <tr>\r" +
    "\n" +
    "            <td>{{req.RequestId}}</td>\r" +
    "\n" +
    "            <td><a ui-sref=\"request.detail({requestId : req.RequestId})\">{{req.Subject}}</a></td>\r" +
    "\n" +
    "            <td>{{req.CreateDate | date :'short'}}</td>\r" +
    "\n" +
    "            <td>{{req.CreatedBy}}</td>\r" +
    "\n" +
    "        </tr>\r" +
    "\n" +
    "    </tbody>\r" +
    "\n" +
    "</table>\r" +
    "\n" +
    "<div ng-show=\"$ctrl.loading\" class=\"text-center\">\r" +
    "\n" +
    "    Loading...\r" +
    "\n" +
    "</div>"
  );

}]);
})();