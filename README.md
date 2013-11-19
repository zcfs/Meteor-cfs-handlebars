cfs-handlebars
=========================

NOTE: This branch is under active development right now (2013-11-18). It has
bugs and the API may continue to change. Please help test it and fix bugs,
but don't use in production yet.

A Meteor package that adds handlebars helpers for [CollectionFS](https://github.com/CollectionFS/Meteor-CollectionFS).

## Installation

Install using Meteorite. When in a Meteorite-managed app directory, enter:

```bash
$ mrt add cfs-handlebars
```

## General FileObject Helpers

### cfsFileUrl

Returns the HTTP file URL for the current FileObject. Requires that the `useHTTP` option
be set to `true` for the corresponding CollectionFS instance.

Use with a `FileObject` as the current context.

```
{{cfsFileUrl}}
```

### cfsIsImage

Returns true if the current FileObject has a content type that begins with
`image/`.

Use with a `FileObject` as the current context.

```
{{#if cfsIsImage}}
{{/if}}
```

### cfsFormattedSize

Formats the file size of the current FileObject using any format string supported by
numeral.js. If you don't specify formatString, a default format string
`0.00 b` is used.

Use with a `FileObject` as the current context.

```
{{cfsFormattedSize}}
```

--OR--

```
{{cfsFormattedSize formatString=formatString}}
```

## Upload Helpers

### cfsIsUploading

When used with a `FileObject` as the current context, returns true if
the current FileObject is being uploaded from this client. When used
outside of a `FileObject` context, returns true if **any** files are being
uploaded from this client.

```
{{#if cfsIsUploading}}
{{/if}}
```

### cfsUploadProgress

Returns an integer indicating the percentage progress of the upload.

When used with a `FileObject` as the current context, returns the progress
for that `FileObject`. When used outside of a `FileObject` context,
returns total progress for all files that are being uploaded from this client.

```
{{#if cfsIsUploading}}
Upload Progress: {{cfsUploadProgress}}%
{{/if}}
```

### cfsUploadProgressBar

Outputs an HTML5 `<progress>` element that shows the progress of the upload.

When used with a `FileObject` as the current context, shows the progress
for that `FileObject`. When used outside of a `FileObject` context,
shows total progress for all files that are being uploaded from this client.

```
{{#if cfsIsUploading}}
{{cfsUploadProgressBar}} Uploading...
{{/if}}
```

## Download Helpers

### cfsIsDownloading

When used with a `FileObject` as the current context, returns true if
the current FileObject is being downloaded from this client. When used
outside of a `FileObject` context, returns true if **any** files are being
downloaded from this client.

```
{{#if cfsIsDownloading}}
{{/if}}
```

### cfsDownloadProgress

Returns an integer indicating the percentage progress of the download.

When used with a `FileObject` as the current context, returns the progress
for that `FileObject`. When used outside of a `FileObject` context,
returns total progress for all files that are being downloaded from this client.

```
{{#if cfsIsDownloading}}
Download Progress: {{cfsDownloadProgress}}%
{{/if}}
```

### cfsDownloadProgressBar

Outputs an HTML5 `<progress>` element that shows the progress of the download.

When used with a `FileObject` as the current context, shows the progress
for that `FileObject`. When used outside of a `FileObject` context,
shows total progress for all files that are being downloaded from this client.

```
{{#if cfsIsDownloading}}
{{cfsDownloadProgressBar}} Downloading...
{{/if}}
```

## User Interface Element Helpers

### cfsDeleteButton

Creates an HTML `<button>` element for the current `FileObject` which, when clicked,
deletes the file from its CollectionFS, thereby deleting its data and the data
for any copies from their respective stores.

Specify a `content` attribute to set the button element content. If you don't
specify content, the button will say "Delete".

Any other attributes you specify on the helper (for example, "class") will be
transferred to attributes on the resulting `<button>` element.

```
{{cfsDeleteButton}}
{{cfsDeleteButton class="btn"}}
{{cfsDeleteButton content="Delete This Image" class="btn"}}
```

### cfsDownloadButton

Creates an HTML `<button>` element for the current `FileObject` which, when clicked,
initiates downloading of the file by the browser. This uses a FileSaver
shim which should support most modern browsers.

Specify a `content` attribute to set the button element content. If you don't
specify content, the button will say "Download".

Specify a `copy` attribute to indicate the name of the copy you want to
download. If you don't specify a copy name, it will download the file from the
master store.

Any other attributes you specify on the helper (for example, "class") will be
transferred to attributes on the resulting `<button>` element.

Examples:

```
{{cfsDownloadButton}}
{{cfsDownloadButton class="btn"}}
{{cfsDownloadButton content="Download This Image" class="btn"}}
{{cfsDownloadButton copy="thumbnail" class="btn"}}
```

### cfsFileInput

Creates an HTML file input element that uploads to the given CollectionFS as
soon as the user selects a file (or files).

As the first positional argument, specify the CollectionFS instance to use.

Any other attributes you specify on the helper (for example, "class") will be
transferred to attributes on the resulting `<input>` element.

**app.html:**

```
{{cfsFileInput myImageFiles}}
{{cfsFileInput myImageFiles multiple="multiple"}}
```

**client.js:**

```js
var Images = new CollectionFS(/* ... */);
Template.images.myImageFiles = function() {
  return Images;
};
```