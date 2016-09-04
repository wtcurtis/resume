var jade = require('jade');
var _ = require('lodash');
var path = require('path');
var utils = require('jsonresume-themeutils');

var mapSocial = function(r) {
    return _(r.social)
        .map(function(s) {
            if(!s.network) return false;
            return s.network && [s.network.toLowerCase(), s];
        })
        .filter()
        .fromPairs()
        .value();
};

var getContactValues = function(r) {
    r.sMap = mapSocial(r);

    return _(contactMap)
        .map(pair => {
            var value = _.get(r, pair[0]);
            var icon = pair[1];

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

/**
 * Wrap first letter of each word in a span with a particular
 * class, rest of words with another
 * @returns {string}
 */
var splitFirstEach = function(phrase, letterClass, wordClass) {
    letterClass = letterClass || 'large';
    wordClass = wordClass || 'small';

    var spanify = (w, className) =>
        '<span class="' + className + '">' + w + '</span>';

    return _(phrase.trim().split(/( |\.)/))
        // Collect pairs, (word, capture)
        .reduce((arr, el) => {
            var last = arr.length-1;
            if(arr[last].length < 2) arr[last].push(el);
            else arr.push([el]);

            return arr;
        }, [[]])
        .map(capture => {
            var w = capture[0];
            var split = capture[1];
            if(split) w += split;

            return spanify(w.substring(0, 1), letterClass) +
                spanify(w.substring(1), wordClass)
        })
        .join('');
};

/**
 * Split name into [all but last,  last] components
 * @param name string
 * @returns string[]
 */
var getSplitName = name => {
    var split = _(name.split(' '))
        .map(n => n.trim())
        .filter(n => n.length > 0)
        .value();

    if(split.length === 1) return ['', name];

    return [
        split.slice(0, -1).join(' ') + ' ',
        split.slice(-1)[0]
    ];
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
        titleSep: ' - ',
        sectionClass: '',
        sectionLeftClass: '',
        getDateSummary: getDateSummary,
        splitFirstEach: splitFirstEach,
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
            .map(f => _.get(el, f, ''))
            .flatten()
            .filter(v => v.trim().length > 0)
            .value()
            .join(sep || ' ');
    };

    conf.sectionEls = els;
    conf.sectionHeader = header;
    return jade.renderFile(path.join(__dirname, 'section.jade'), conf);
};

function renderHeader(r) {
    var conf = {
        buildLocationEls: buildLocationEls,
        getContactValues: getContactValues,
        getSplitName: getSplitName,
        r: r,
        _: _
    };

    return jade.renderFile(path.join(__dirname, 'header.jade'), conf);
}

function render(r) {
    var data = {
        r: r,
        _: _,
        renderSection: renderSection,
        renderHeader: renderHeader
    };

    return jade.renderFile(path.join(__dirname, 'body.jade'), data);
}

module.exports = {
    render: render
};
