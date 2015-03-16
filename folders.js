var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    MQ = require('./message-queue');

function Folders() {
    this.base = './data';
    this.get = 'get';
    this.post = 'post';
    
    this.path = 'null';
    
    MQ.publish('main:folder', function(folder) {
        console.log('main folder:', folder);
        this.path = path.join(folder, this.base);
        this.get = path.join(this.path, this.get);
        this.post = path.join(this.path, this.post);
        
        if (!fs.existsSync(this.get)) {
            mkdirp(this.get);
        }
        if (!fs.existsSync(this.post)) {
            mkdirp(this.post);
        }
    }.bind(this));
}

module.exports = Folders;