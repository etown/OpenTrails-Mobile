fileUtils = function() {

    var PROGRESSBAR_HTML = '<div class="progress progress-striped active">'
        + '<div class="bar" style="width: 0%;"></div>'
        + '</div>';

    function rmDir(fileSystem, dirName, callback) {
        fileSystem.root.getDirectory(dirName, {create: true},
            function(dir) { //success
               dir.removeRecursively(
                    function() { callback(); }, 
                    function(){ alert("Error deleting!"); }
                );
            }, 
            function() { alert("Error deleting directory"); } //fail
        );
    }

    var numTiles;
    var totalSize = 0;
    var tileRoot;

    function bulkDownload(urls, targetDir, progressModal, callback) {
      /*
       * Bulk download of urls to the targetDir (relative path from root) 
       */
          window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
            //show progress modal
            progressModal.modal('show');
            //add progress bar
            progressModal.find('.modal-body').append(PROGRESSBAR_HTML);
            var progressBar = progressModal.find(".bar");
            
            downloadFile(urls, 0, dir, progressModal, progressBar, callback);
        });
    }

    function downloadFile(urls, index, dir, progressModal, progressBar, callback) {
        /*
         * Helper function for bulkDownload 
         */
        
        if (index >= urls.length) { //callback if done
            //clear and hide modal
            progressModal.find('.modal-body').html("");
            progressModal.modal('hide');
            alert('downloaded ' + urls.length + ' tiles.  ' + bytesToSize(totalSize));
            callback(tileRoot); 
            return; 
        } 
        
        //update modal progress
        progressBar.css('width', (index * 100.0 / urls.length) + '%');
        
        var url = urls[index];
        
        //NOTE: THIS IS SUPER HARD-CODED
        //all urls start with: http://api.tiles.mapbox.com/v3/ - length 31
        var tail = url.slice(31); //something like ex.map-1234saf/15/8580/12610.png
        var fname = tail.split('?')[0].split('/').join('.');   
        dir.getFile(fname,{create:true,exclusive: false},function(file){
            var fileTransfer = new FileTransfer();
            fileTransfer.download(url, file.toURL(), 
                function(theFile) { 
                    if(!tileRoot)
                        theFile.getParent(function(parent) {
                            tileRoot = parent.toURL();
                        });
                    downloadFile(urls, index+1, dir, progressModal, progressBar, callback);
                    theFile.file(function(file){
                        totalSize = totalSize+file.size;
                    });
                },
                function(error) { 
                    alert("download error code: " + error.code); 
                }
            );    
        });
    }

    function bytesToSize(bytes) {
        if(bytes == 0) 
            return '0 Byte';
        var k = 1000;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    }

    return {
        'rmDir': rmDir,
        'bulkDownload': bulkDownload
    };

}();