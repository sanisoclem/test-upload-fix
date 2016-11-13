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