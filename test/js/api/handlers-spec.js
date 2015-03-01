var assert = require('chai').assert,
    handlers = require('../../../js/api/handlers');

util = require('util')
describe('api/handlers', function() {

    // poorly formatted input with outstanding line breaks

    const xml =
        '<a>\n\n  <b>   <c>zz   xxx zz</c>\n' +
        '<!-- \ncomment\n\n\n\n --> <d/>\n' +
        '</b>\n</a>';

    const json =
        '{"menu":{\n"id": "file",\n"value":\n[1,2,3],\n' +
        '"popup":{"menuitem":[{"value":    ["one","two"],\n' +
        '"onclick":"CreateNewDoc()"},\n\n{"value":"Close","onclick":"CloseDoc()"}]}}}';

    const css =
        '.headbg{margin:  0 8px  \n\n; display:none; }a:link,a:focus{   color:#00c }\n' +
        '  /* comment\n\n */ a:active{  \n  color:red }';

    it('text/xml should pretty-print an xml document', function() {
        const expected =    // beware, outstanding line breaks are replaced by spaces (see the comment tag below)
            '<a>\n' +
            '  <b>\n' +
            '    <c>zz   xxx zz</c>\n' +
            '    <!--  comment     -->\n' +
            '    <d/>\n' +
            '  </b>\n' +
            '</a>';
        assert.equal(expected, handlers.apply('text/xml', xml));
    });

    it('application/json should pretty-print a json string', function() {
        const expected =
            '{\n  ' +
            '"menu": {\n' +
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
        assert.equal(expected, handlers.apply('application/json', json));
    });

    it('text/css should pretty-print a css string', function() {
        const expected =    // note the extra line break at the end
            '.headbg{\n' +
            '  margin: 0 8px ;\n' +
            '   display:none;\n' +
            '}\n' +
            'a:link,a:focus{\n' +
            '   color:#00c \n' +
            '}\n' +
            '/* comment */\n' +
            ' a:active{\n' +
            '   color:red \n' +
            '}\n';
        assert.equal(expected, handlers.apply('text/css', css));
    });

    it('should check if the handler module supports the provided mime type', function() {
        assert.isTrue(handlers.has('text/xml'));
        assert.isTrue(handlers.has('application/json'));
        assert.isTrue(handlers.has('text/css'));
        assert.isFalse(handlers.has('text/csv'));
    });
});
