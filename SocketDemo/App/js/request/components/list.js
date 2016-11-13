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