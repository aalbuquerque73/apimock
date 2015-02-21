var assert = require('chai').assert,
    parser = require('../../../js/api/parser');

describe('api/parser', function() {

    it('text/xml should return the original input', function() {
        const original =
            '<a>\n' +
            '  <b>\n' +
            '    <c>zz xxx zz</c>\n' +
            '    <!--  comment  -->\n' +
            '    <d/>\n' +
            '  </b>\n' +
            '</a>';
        assert.equal(original, parser.apply('text/xml', original));
    });

    it('application/json should parse the input string', function() {
        const original =
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
        assert.deepEqual(JSON.parse(original), parser.apply('application/json', original));
    });

    it('text/css should return the original input', function() {
        const original =
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
            '}';
        assert.equal(original, parser.apply('text/css', original));
    });

});
