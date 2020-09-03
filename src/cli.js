var template = require('./index.js');

function writeResume(resume, path, done) {
    var fs = require('fs');
    var rendered = template.render(resume);

    fs.writeFile(path, rendered, function(err) {
        if(err) {
            return console.error(err);
        }
        done()
    });
}

module.exports = {
    writeResume: writeResume
};

