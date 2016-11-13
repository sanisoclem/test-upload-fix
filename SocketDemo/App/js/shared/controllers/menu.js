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