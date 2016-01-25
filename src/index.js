var jade = require('jade');
var _ = require('lodash');
var path = require('path');
var utils = require('jsonresume-themeutils');

var mapSocial = function(r) {
    var val =  _(r.social)
        .map(function(s) {
            if(!s.network) return false;
            return s.network && [s.network.toLowerCase(), s];
        })
        .filter()
        .fromPairs()
        .value();

    console.log(val);
    return val;
};

var getContactValues = function(r) {
    r.sMap = mapSocial(r);

    return _(contactMap)
        .map(pair => {
            var value = _.get(r, pair[0]);
            var icon = pair[1];

            console.log(value, icon);

            if(!value || !icon) return false;

            return [value, icon];
        })
        .filter()
        .value();
};

var contactMap = {
    phone: ['contact.phone', 'fa-phone'],
    email: ['contact.email', 'fa-envelope'],
    website: ['contact.website', 'fa-home'],
    github: ['sMap.github.user', 'fa-github'],
    linkedin: ['sMap.linkedin.user', 'fa-linkedin'],
    youtube: ['sMap.youtube.user', 'fa-youtube']
};

var buildLocationEls = function(r) {
    return _(['address', 'city', 'region', 'code'])
        .map(f => r.location && r.location[f])
        .filter()
        .value();
};

var getSplitName = name => {
    var split = _(name.split(' '))
        .map(n => n.trim())
        .filter(n => n.length > 0)
        .value();

    if(split.length === 1) return ['', name];

    var val = [
        split.slice(0, -1).join(' ') + ' ',
        split.slice(-1)[0]];

    console.log(val);

    return val;
};

var getDateSummary = function(start, end) {
    if(!start) return '';
    start = utils.getFormattedDate(start, 'MMM YYYY');
    end = end
        ? utils.getFormattedDate(end, 'MMM YYYY')
        : 'PRESENT';

    return start + ' - ' + end;
};

var renderSection = function(resume, elPath, header, conf) {
    var defaults = {
        headerField: 'institution',
        titleField: 'title',
        notesField: 'highlights',
        locationField: 'location',
        getDateSummary: getDateSummary,
        _: _
    };

    conf =_.defaults(conf || {}, defaults);

    var els = _.get(resume, elPath);
    if(!els.length) return '';

    _.each(els, el => {
        var notes = _.get(el, conf.notesField);
        if(!notes) el.notes = [];

        else if(typeof notes === 'string') el.notes = [notes];
        else el.notes = notes;
    });

    conf.extract = function(el, field, sep) {
        if(!field) return '';
        if(typeof field === 'string') return _.get(el, field);

        return _(field)
            .map(f => _.get(el, f, '').trim())
            .filter(v => v.length > 0)
            .value()
            .join(sep || ' ');
    };

    conf.sectionEls = els;
    conf.sectionHeader = header;
    return jade.renderFile(path.join(__dirname, 'section.jade'), conf);
};

function render(r) {
    console.log('render');
    var data = {
        r: r,
        _: _,
        renderSection: renderSection,
        buildLocationEls: buildLocationEls,
        getContactValues: getContactValues,
        getSplitName: getSplitName
    };

    return jade.renderFile(path.join(__dirname, 'body.jade'), data);
}

module.exports = {
    render: render
};
