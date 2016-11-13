angular.module('sd.app', [
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