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