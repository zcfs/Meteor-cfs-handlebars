"use strict";
if (typeof Handlebars !== 'undefined') {
  //Usage (default format string):
  //{{cfsFormattedSize}} (with FileObject as current context)
  //Usage (any format string supported by numeral.format):
  //{{cfsFormattedSize formatString=formatString}} (with FileObject as current context)
  Handlebars.registerHelper('cfsFormattedSize', function(opts) {
    var self = this;
    var size = self.size || 0;
    var hash, formatString;
    hash = opts.hash || {};
    formatString = hash.formatString || '0.00 b';
    return numeral(size).format(formatString);
  });

  //Usage: {{cfsFileUrl}} (with FileObject as current context)
  Handlebars.registerHelper('cfsFileUrl', function(copyName) {
    if (typeof copyName === "string") {
      return this.url(copyName);
    } else {
      return this.url();
    }
  });

  //Usage: {{cfsIsImage}} (with FileObject as current context)
  Handlebars.registerHelper('cfsIsImage', function() {
    return this.isImage();
  });

  //Usage: {{cfsIsUploading}} (with FileObject as current context or not for overall)
  Handlebars.registerHelper('cfsIsUploading', function() {
    if (this instanceof FileObject) {
      return CollectionFS.uploadQueue.isUploadingFile(this);
    } else {
      return CollectionFS.uploadQueue.isRunning();
    }
  });

  //Usage: {{cfsIsDownloading}} (with FileObject as current context or not for overall)
  //Usage: {{cfsIsDownloading copy="copyName"}}
  Handlebars.registerHelper('cfsIsDownloading', function(opts) {
    var hash = opts.hash || {};
    if (this instanceof FileObject) {
      return CollectionFS.downloadQueue.isDownloadingFile(this, hash.copy);
    } else {
      return CollectionFS.downloadQueue.isRunning();
    }
  });

  //Usage: {{cfsDownloadProgress}} (with FileObject as current context or not for overall)
  //Usage: {{cfsDownloadProgress copy="copyName"}}
  Handlebars.registerHelper('cfsDownloadProgress', function(opts) {
    var hash = opts.hash || {};
    if (this instanceof FileObject) {
      return CollectionFS.downloadQueue.progress(this, hash.copy);
    } else {
      return CollectionFS.downloadQueue.progress();
    }
  });

  //Usage: {{cfsDownloadProgressBar attribute=value}} (with FileObject as current context or not for overall)
  Handlebars.registerHelper('cfsDownloadProgressBar', function(opts) {
    var hash = opts.hash || {};
    return new Handlebars.SafeString(Template._cfsDownloadProgressBar({
      fileObject: this,
      copyName: hash.copy,
      attributes: objToAttributes(hash)
    }));
  });
  
  //Usage: {{cfsUploadProgress}} (with FileObject as current context or not for overall)
  Handlebars.registerHelper('cfsUploadProgress', function() {
    if (this instanceof FileObject) {
      return CollectionFS.uploadQueue.progress(this);
    } else {
      return CollectionFS.uploadQueue.progress();
    }
  });

  //Usage: {{cfsUploadProgressBar attribute=value}} (with FileObject as current context or not for overall)
  Handlebars.registerHelper('cfsUploadProgressBar', function(opts) {
    var hash = opts.hash || {};
    return new Handlebars.SafeString(Template._cfsUploadProgressBar({
      fileObject: this,
      attributes: objToAttributes(hash)
    }));
  });

  //Usage: {{cfsDeleteButton}} (with FileObject as current context)
  //Supported Options: content, any attribute
  Handlebars.registerHelper('cfsDeleteButton', function(opts) {
    var hash = opts.hash || {};
    hash["class"] = hash["class"] ? hash["class"] + ' cfsDeleteButton' : 'cfsDeleteButton';
    var content = hash.content || "Delete";
    if ("content" in hash)
      delete hash.content;
    return new Handlebars.SafeString(Template._cfsDeleteButton({
      fileObject: this,
      content: content,
      attributes: objToAttributes(hash)
    }));
  });

  Template._cfsDeleteButton.events({
    'click .cfsDeleteButton': function(event, template) {
      var fileObject = template.data.fileObject;
      if (!fileObject) {
        return false;
      }
      fileObject.remove();
      return false;
    }
  });

  ////Usage:
  //{{cfsDownloadButton}} (with FileObject as current context)
  //Supported Options: copy, content, any attribute
  Handlebars.registerHelper('cfsDownloadButton', function(opts) {
    var hash = opts.hash || {};
    hash["class"] = hash["class"] ? hash["class"] + ' cfsDownloadButton' : 'cfsDownloadButton';
    var content = hash.content || "Download";
    if ("content" in hash)
      delete hash.content;
    var copyName = hash.copy || null;
    if ("copy" in hash)
      delete hash.copy;
    return new Handlebars.SafeString(Template._cfsDownloadButton({
      fileObject: this,
      copyName: copyName,
      content: content,
      attributes: objToAttributes(hash)
    }));
  });

  Template._cfsDownloadButton.events({
    'click .cfsDownloadButton': function(event, template) {
      var fileObject = template.data.fileObject;
      var copyName = template.data.copyName;
      if (!fileObject) {
        return false;
      }

      // Kick off download of current copy, and when it's done, tell the browser
      // to save the file in the downloads folder.
      fileObject.get(copyName);

      return false;
    }
  });

  Template._cfsFileInput.events({
    'change .cfsFileInput': function(event, template) {
      var self = this;
      var files = event.target.files, collectionFS = template.data.collectionFS, fileObj;

      if (!files)
        throw new Error("cfsFileInput Helper: no files");

      if (!collectionFS)
        throw new Error("cfsFileInput Helper: no bound CollectionFS");

      _(files).each(function(file) {

        fileObj = new FileObject(file);
        fileObj.metadata = {};
        _(self.metadata).each(function(value, key) {
          fileObj.metadata[key] = value;
        });

        collectionFS.insert(fileObj);

      });

      event.target.parentElement.reset();
    }
  });

  //Usage: {{cfsFileInput collectionFS attribute=value}}
  Handlebars.registerHelper('cfsFileInput', function(collectionFS, metadata, options) {
    var hash;


    if(metadata.hash){
      options = metadata;
      metadata = {};
    }

    hash = options.hash;

    hash = hash || {};
    hash["class"] = hash["class"] ? hash["class"] + ' cfsFileInput' : 'cfsFileInput';

    metadata = _(metadata).isObject() ? metadata : {};
    
    return new Handlebars.SafeString(Template._cfsFileInput({
      collectionFS: collectionFS,
      attributes: objToAttributes(hash),
      metadata:metadata
    }));
  });

} else {
  throw new Error("add the handlebars package");
}

var objToAttributes = function(obj) {
  if (!obj) {
    return "";
  }
  var a = "";
  _.each(obj, function(value, key) {
    a += ' ' + key + '="' + value + '"';
  });
  return a;
};
