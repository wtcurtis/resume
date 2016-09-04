var template = require('./index.js');

function writeResume(resume, path) {
    var fs = require('fs');
    var rendered = template.render(resume);

    fs.writeFile(path, rendered, function(err) {
        if(err) {
            return console.error(err);
        }
    });
}

module.exports = {
    writeResume: writeResume
};

