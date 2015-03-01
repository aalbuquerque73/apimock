var assert = require('chai').assert,
    filters = require('../../../js/api/filters');

describe('api/filters', function() {

    var filterXml = function(workflow) {
        // courtesy http://www.eslinstructor.net/pretty-data/img/pd_xml.png
        const original =
            '<a>  <b>   <c>zz  xxx zz</c>\n' +
            '<!-- comment --> <d/>\n' +
            '</b></a>';
        return filters.apply(original, workflow);
    }

    var filterJson = function(workflow) {
        // courtesy http://www.eslinstructor.net/pretty-data/img/pd_json.png
        const original =
            '{"menu":{"id": "file","value":\n[1,2,3],\n' +
            '"popup":{"menuitem":[{"value":    ["one","two"],\n' +
            '"onclick":"CreateNewDoc()"},{"value":"Close","onclick":"CloseDoc()"}]}}}';
        return filters.apply(original, workflow);
    }

    var filterCss = function(workflow) {
        // courtesy http://www.eslinstructor.net/pretty-data/img/pd_css.png
        const original =
            '.headbg{margin:0 8px;display:none; }a:link,a:focus{   color:#00c }\n' +
            '  /* comment */ a:active{    color:red }';
        return filters.apply(original, workflow);
    }

    it('xml.format should pretty-print an xml document and preserve comments', function() {
        const expected =
            '<a>\n' +
            '  <b>\n' +
            '    <c>zz  xxx zz</c>\n' +
            '    <!-- comment -->\n' +
            '    <d/>\n' +
            '  </b>\n' +
            '</a>';
        assert.equal(expected, filterXml(['xml.format']));
    });

    it('xml.whitespace should minify an xml document and preserve comments', function() {
        const expected = '<a><b><c>zz  xxx zz</c><!-- comment --><d/></b></a>';
        assert.equal(expected, filterXml(['xml.whitespace']));
    });

    it('xml.comments should pretty-print an xml document and preserve comments', function() {
        const expected =
            '<a>\n' +
            '  <b>\n' +
            '    <c>zz  xxx zz</c>\n' +
            '    <!-- comment -->\n' +
            '    <d/>\n' +
            '  </b>\n' +
            '</a>';
        assert.equal(expected, filterXml(['xml.comments']));
    });

    it('xml.all should minify an xml document and remove comments', function() {
        const expected = '<a><b><c>zz  xxx zz</c><d/></b></a>';
        assert.equal(expected, filterXml(['xml.all']));
    });

    it('json.format should pretty-print a json string', function() {
        const expected =
            '{\n' +
            '  "menu": {\n' +
            '    "id": "file",\n' +
            '    "value": [\n' +
            '      1,\n' +
            '      2,\n' +
            '      3\n' +
            '    ],\n' +
            '    "popup": {\n' +
            '      "menuitem": [\n' +
            '        {\n' +
            '          "value": [\n' +
            '            "one",\n' +
            '            "two"\n' +
            '          ],\n' +
            '          "onclick": "CreateNewDoc()"\n' +
            '        },\n' +
            '        {\n' +
            '          "value": "Close",\n' +
            '          "onclick": "CloseDoc()"\n' +
            '        }\n' +
            '      ]\n' +
            '    }\n' +
            '  }\n' +
            '}';
        assert.equal(expected, filterJson(['json.format']));
    });

    it('json.whitespace should minify a json string', function() {
        const expected =
            '{"menu":{"id":"file","value":[1,2,3],' +
            '"popup":{"menuitem":[{"value":["one","two"],' +
            '"onclick":"CreateNewDoc()"},{"value":"Close","onclick":"CloseDoc()"}]}}}';
        assert.equal(expected, filterJson(['json.whitespace']));
    });

    it('json.comments should pretty-print a json string', function() {
        const expected =
            '{\n' +
            '  "menu": {\n' +
            '    "id": "file",\n' +
            '    "value": [\n' +
            '      1,\n' +
            '      2,\n' +
            '      3\n' +
            '    ],\n' +
            '    "popup": {\n' +
            '      "menuitem": [\n' +
            '        {\n' +
            '          "value": [\n' +
            '            "one",\n' +
            '            "two"\n' +
            '          ],\n' +
            '          "onclick": "CreateNewDoc()"\n' +
            '        },\n' +
            '        {\n' +
            '          "value": "Close",\n' +
            '          "onclick": "CloseDoc()"\n' +
            '        }\n' +
            '      ]\n' +
            '    }\n' +
            '  }\n' +
            '}';
        assert.equal(expected, filterJson(['json.comments']));
    });

    it('json.all should minify a json string', function() {
        const expected =
            '{"menu":{"id":"file","value":[1,2,3],' +
            '"popup":{"menuitem":[{"value":["one","two"],' +
            '"onclick":"CreateNewDoc()"},{"value":"Close","onclick":"CloseDoc()"}]}}}';
        assert.equal(expected, filterJson(['json.all']));
    });


    it('css.format should pretty-print a css string and preserve comments', function() {
        const expected =
            '.headbg{\n' +
            '  margin:0 8px;\n' +
            '  display:none;\n' +
            '}\n' +
            'a:link,a:focus{\n' +
            '   color:#00c \n' +
            '}\n' +
            '/* comment */\n ' +
            'a:active{\n' +
            '   color:red \n' +
            '}\n';
        assert.equal(expected, filterCss(['css.format']));
    });

    it('css.whitespace should minify a css string and preserve comments', function() {
        const expected =
            '.headbg{margin:0 8px;display:none;}a:link,a:focus{color:#00c }/*comment */a:active{color:red }';
        assert.equal(expected, filterCss(['css.whitespace']));
    });

    it('css.comments should pretty-print a css string and preserve comments', function() {
        const expected =
            '.headbg{\n' +
            '  margin:0 8px;\n' +
            '  display:none;\n' +
            '}\n' +
            'a:link,a:focus{\n' +
            '   color:#00c \n' +
            '}\n' +
            '/* comment */\n ' +
            'a:active{\n' +
            '   color:red \n' +
            '}\n';

        assert.equal(expected, filterCss(['css.comments']));
    });

    it('css.all should minify a css string and remove comments', function() {
        const expected =
            '.headbg{margin:0 8px;display:none;}a:link,a:focus{color:#00c }a:active{color:red }';

        assert.equal(expected, filterCss(['css.all']));
    });

    it('should escape special characters', function() {
        const actual = 'stra$nge?name*for.a.fi*le',
            expected = 'stra\\$nge\\?name\\*for\\.a\\.fi\\*le';
        assert.equal(expected, filters.apply(actual, ['escape']));
    });

    it('regexp should revert the escape filter on the text between two \'&rx;\'', function() {
        const orig = '<auth><token>&rx;\\d+&rx;</token></auth>',
            expected = '<auth><token>\\d+</token></auth>';
        assert.equal(expected, filters.apply(orig, ['escape', 'regexp']));
    })

    it('should replace line breaks with spaces', function() {
        const orig = filterXml(['xml.format']),    // pretty-prints, i.e. creates line breaks
            expected =                            // xml remains formatted, hence the extra spaces
                '<a>   <b>     <c>zz  xxx zz</c>     <!-- comment -->     <d/>   </b> </a>';
        assert.equal(expected, filters.apply(orig, ['newline']) );
    });

    it('should be possible to apply multiple filters', function() {
        const original =            // a poorly formatted xml with an outstanding number of line breaks
            '<a>\n\n<b>\n   <c>zz  \nxxx zz</c>\n' +
            '<!-- \ncomment\n --> <d/>\n' +
            '</b></a>',
                                    // a nicely formatted output with minimum line breaks
            expected = '<a>\n  <b>\n    <c>zz   xxx zz</c>\n    <!--  comment  -->\n    <d/>\n  </b>\n</a>';
        assert.equal(expected, filters.apply(original, ['newline', 'xml.format']));
    });

    it('should respect filter ordering', function() {
        const original =            // a poorly formatted css with comments and an outstanding number of line breaks
            '.headbg{margin:0 8px;display:none; }a:link,a:focus{   color:#00c }\n' +
            '  /* comment */ a:active{    color:red }',
                                    // an one-liner without any comments
            expected = '.headbg{   margin:0 8px;   display:none; } a:link,a:focus{   color:#00c  } a:active{   color:red  } ';
        assert.equal(expected, filters.apply(original, ['css.all', 'css.format', 'newline']));
    });
});
