"use strict";
if (typeof Handlebars !== 'undefined') {
  //Usage (default format string, master copy):
  //{{cfsFormattedSize}} (with FS.File as current context)
  //Usage (default format string, another copy):
  //{{cfsFormattedSize "copyName"}} (with FS.File as current context)
  //Usage (any format string supported by numeral.format):
  //{{cfsFormattedSize formatString=formatString}} (with FS.File as current context)
  Handlebars.registerHelper('cfsFormattedSize', function(copyName, opts) {
    var self = this;

    if (!opts) {
      opts = copyName;
      copyName = null;
    }

    if (!(self instanceof FS.File)) {
      throw new Error("cfsFileUrl helper must be used with a FS.File context");
    }

    var hash, formatString, size, copy;

    if (typeof copyName === "string") {
      copy = (self.copies || {})[copyName] || {};
    } else {
      copy = self.master || {};
    }

    size = copy.size || 0;
    hash = opts.hash || {};
    formatString = hash.formatString || '0.00 b';
    return numeral(size).format(formatString);
  });

  //Usage: {{cfsFileUrl}} (with FS.File as current context)
  Handlebars.registerHelper('cfsFileUrl', function(copyName) {
    var self = this;

    if (!(self instanceof FS.File)) {
      throw new Error("cfsFileUrl helper must be used with a FS.File context");
    }

    if (typeof copyName === "string") {
      return self.url(copyName);
    } else {
      return self.url();
    }
  });

  //Usage: {{cfsIsImage}} (with FS.File as current context)
  Handlebars.registerHelper('cfsIsImage', function() {
    return this.isImage();
  });

  //Usage: {{cfsIsUploading}} (with FS.File as current context or not for overall)
  Handlebars.registerHelper('cfsIsUploading', function() {
    if (this instanceof FS.File) {
      return FS.uploadQueue.isUploadingFile(this);
    } else {
      return FS.uploadQueue.isRunning();
    }
  });

  //Usage: {{cfsIsDownloading}} (with FS.File as current context or not for overall)
  //Usage: {{cfsIsDownloading copy="copyName"}}
  Handlebars.registerHelper('cfsIsDownloading', function(opts) {
    var hash = opts.hash || {};
    if (this instanceof FS.File) {
      return FS.downloadQueue.isDownloadingFile(this, hash.copy);
    } else {
      return FS.downloadQueue.isRunning();
    }
  });

  //Usage: {{cfsUploadsArePaused}}
  Handlebars.registerHelper('cfsUploadsArePaused', function() {
    return FS.uploadQueue.isPaused();
  });

  //Usage: {{cfsDownloadsArePaused}}
  Handlebars.registerHelper('cfsDownloadsArePaused', function() {
    return FS.downloadQueue.isPaused();
  });

  //Usage: {{cfsDownloadProgress}} (with FS.File as current context or not for overall)
  //Usage: {{cfsDownloadProgress copy="copyName"}}
  Handlebars.registerHelper('cfsDownloadProgress', function(opts) {
    var hash = opts.hash || {};
    if (this instanceof FS.File) {
      return FS.downloadQueue.progress(this, hash.copy);
    } else {
      return FS.downloadQueue.progress();
    }
  });

  //Usage: {{cfsDownloadProgressBar attribute=value}} (with FS.File as current context or not for overall)
  Handlebars.registerHelper('cfsDownloadProgressBar', function(opts) {
    var hash = opts.hash || {};
    return new Handlebars.SafeString(Template._cfsDownloadProgressBar({
      fsFile: this,
      copyName: hash.copy,
      attributes: objToAttributes(hash)
    }));
  });

  //Usage: {{cfsUploadProgress}} (with FS.File as current context or not for overall)
  Handlebars.registerHelper('cfsUploadProgress', function() {
    if (this instanceof FS.File) {
      return FS.uploadQueue.progress(this);
    } else {
      return FS.uploadQueue.progress();
    }
  });

  //Usage: {{cfsUploadProgressBar attribute=value}} (with FS.File as current context or not for overall)
  Handlebars.registerHelper('cfsUploadProgressBar', function(opts) {
    var hash = opts.hash || {};
    return new Handlebars.SafeString(Template._cfsUploadProgressBar({
      fsFile: this,
      attributes: objToAttributes(hash)
    }));
  });

  //Usage: {{cfsDeleteButton}} (with FS.File as current context)
  //Supported Options: content, any attribute
  Handlebars.registerHelper('cfsDeleteButton', function(opts) {
    var hash = opts.hash || {};
    hash["class"] = hash["class"] ? hash["class"] + ' cfsDeleteButton' : 'cfsDeleteButton';
    var content = hash.content || "Delete";
    if ("content" in hash)
      delete hash.content;
    return new Handlebars.SafeString(Template._cfsDeleteButton({
      fsFile: this,
      content: content,
      attributes: objToAttributes(hash)
    }));
  });

  Template._cfsDeleteButton.events({
    'click .cfsDeleteButton': function(event, template) {
      var fsFile = template.data.fsFile;
      if (!fsFile) {
        return false;
      }
      fsFile.remove();
      return false;
    }
  });

  Template._cfsDownloadProgressBar.preserve(['progress']);
  Template._cfsUploadProgressBar.preserve(['progress']);
  Template._cfsDeleteButton.preserve(['button']);
  Template._cfsDownloadButton.preserve(['button']);

  ////Usage:
  //{{cfsDownloadButton}} (with FS.File as current context)
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
      fsFile: this,
      copyName: copyName,
      content: content,
      attributes: objToAttributes(hash)
    }));
  });

  Template._cfsDownloadButton.events({
    'click .cfsDownloadButton': function(event, template) {
      var fsFile = template.data.fsFile;
      var copyName = template.data.copyName;
      if (!fsFile) {
        return false;
      }

      // Kick off download of current copy, and when it's done, tell the browser
      // to save the file in the downloads folder.
      fsFile.get(copyName);

      return false;
    }
  });

  Template._cfsFileInput.events({
    'change .cfsFileInput': function(event, template) {
      var self = this;
      var files = event.target.files, fsCollection = template.data.fsCollection;

      if (!files)
        throw new Error("cfsFileInput Helper: no files");

      if (!fsCollection)
        throw new Error("cfsFileInput Helper: no bound FS.Collection");

      _(files).each(function(file) {
        var fsFile = new FS.File(file);
        if (!_.isEmpty(self.metadata)) {
          fsFile.metadata = {};
          _(self.metadata).each(function(value, key) {
            fsFile.metadata[key] = value;
          });
        }
        fsCollection.insert(fsFile, function (err) {
          if (err) throw err;
        });
      });

      event.target.parentElement.reset();
    }
  });

  //Usage: {{cfsFileInput fsCollection attribute=value}}
  Handlebars.registerHelper('cfsFileInput', function(fsCollection, metadata, options) {
    var hash;

    if(!fsCollection instanceof FS.Collection){
      throw new Error("cfsFileInput helper requires an instance of FS.Collection as its first parameter");
    }

    if (metadata.hash) {
      options = metadata;
      metadata = {};
    }

    hash = options.hash;

    hash = hash || {};
    hash["class"] = hash["class"] ? hash["class"] + ' cfsFileInput' : 'cfsFileInput';

    metadata = _(metadata).isObject() ? metadata : {};

    return new Handlebars.SafeString(Template._cfsFileInput({
      fsCollection: fsCollection,
      attributes: objToAttributes(hash),
      metadata: metadata
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
