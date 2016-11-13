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
