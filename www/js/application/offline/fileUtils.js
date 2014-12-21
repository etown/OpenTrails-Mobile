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
        console.log("got main dir +"+dir.toURL());
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
        alert(totalSize + ':'+urls.length);
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
    console.log("fname:"+fname);
    dir.getFile(fname,{create:true,exclusive: false},function(file){
        console.log("got the file: "+ file.toURL());
        var fileTransfer = new FileTransfer();
        fileTransfer.download(url, file.toURL(), 
            function(theFile) { 
                if(!tileRoot)
                    theFile.getParent(function(parent) {
                        console.log("got the parent: "+ parent.toURL());
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

return {
    'rmDir': rmDir,
    'bulkDownload': bulkDownload
};

}();