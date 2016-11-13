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