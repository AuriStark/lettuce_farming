// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

const moo = require("moo");

const lexer = moo.compile({
    number: /-?(?:[0-9]|[1-9][0-9]+)(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?\b/,
    space: {match: /\s+/, lineBreaks: true},
    lparan: "(",
    rparan: ")",
    ',': ',',
    ':': ':',
    true: 'true',
    false: 'false',
    null: 'null',
    keyword: ['move', 'control', 'home', 'pick'],
    attributes: ['x', 'y', 'z', 'pin', 'state', 'tool'],
    toolName: ['seeder', 'waterin', 'soil']
});
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "main", "symbols": ["_", "statements", "_"], "postprocess": d => d[1]},
    {"name": "statements", "symbols": ["statement", "_", "statements"], "postprocess": d => [d[0], ...d[2]]},
    {"name": "statements", "symbols": ["statement"], "postprocess": d => [d[0]]},
    {"name": "statement", "symbols": [{"literal":"move"}, "_", {"literal":"("}, "_", "movePropList", "_", {"literal":")"}], "postprocess": d => ({ action: 'move', args: d[4] })},
    {"name": "statement", "symbols": [{"literal":"control"}, "_", {"literal":"("}, "_", "controlPropList", "_", {"literal":")"}], "postprocess": d => ({ action: 'control', args: d[4] })},
    {"name": "statement", "symbols": [{"literal":"home"}, "_", {"literal":"("}, "_", "homePropList", "_", {"literal":")"}], "postprocess": d => ({ action: 'home', args: d[4] })},
    {"name": "statement", "symbols": [{"literal":"pick"}, "_", {"literal":"("}, "_", "pickPropList", "_", {"literal":")"}], "postprocess": d => ({ action: 'pick', args: d[4] })},
    {"name": "movePropList", "symbols": ["moveProp", "_", {"literal":","}, "_", "movePropList"], "postprocess": d => [d[0], ...d[4]]},
    {"name": "movePropList", "symbols": ["moveProp"], "postprocess": d => [d[0]]},
    {"name": "moveProp", "symbols": ["movePropName", "_", {"literal":":"}, "_", "number"], "postprocess": d => ({ name: d[0], value: d[4] })},
    {"name": "movePropName", "symbols": [{"literal":"x"}], "postprocess": () => 'x'},
    {"name": "movePropName", "symbols": [{"literal":"y"}], "postprocess": () => 'y'},
    {"name": "movePropName", "symbols": [{"literal":"z"}], "postprocess": () => 'z'},
    {"name": "controlPropList", "symbols": ["controlProp", "_", {"literal":","}, "_", "controlPropList"], "postprocess": d => [d[0], ...d[4]]},
    {"name": "controlPropList", "symbols": ["controlProp"], "postprocess": d => [d[0]]},
    {"name": "controlProp", "symbols": [{"literal":"pin"}, "_", {"literal":":"}, "_", "number"], "postprocess": d => ({ name: d[0].value, value: d[4] })},
    {"name": "controlProp", "symbols": [{"literal":"state"}, "_", {"literal":":"}, "_", "boolean"], "postprocess": d => ({ name: d[0].value, value: d[4] })},
    {"name": "homePropList", "symbols": ["homeProp", "_", {"literal":","}, "_", "homePropList"], "postprocess": d => [d[0], ...d[4]]},
    {"name": "homePropList", "symbols": ["homeProp"], "postprocess": d => [d[0]]},
    {"name": "homeProp", "symbols": ["homePropName", "_", {"literal":":"}, "_", "boolean"], "postprocess": d => ({ name: d[0], value: d[4] })},
    {"name": "homePropName", "symbols": [{"literal":"x"}], "postprocess": () => 'x'},
    {"name": "homePropName", "symbols": [{"literal":"y"}], "postprocess": () => 'y'},
    {"name": "homePropName", "symbols": [{"literal":"z"}], "postprocess": () => 'z'},
    {"name": "pickPropList", "symbols": ["pickProp", "_", {"literal":","}, "_", "pickPropList"], "postprocess": d => [d[0], ...d[4]]},
    {"name": "pickPropList", "symbols": ["pickProp"], "postprocess": d => [d[0]]},
    {"name": "pickProp", "symbols": ["pickPropName", "_", {"literal":":"}, "_", "toolName"], "postprocess": d => ({ name: d[0], value: d[4] })},
    {"name": "pickPropName", "symbols": [{"literal":"tool"}], "postprocess": () => 'tool'},
    {"name": "toolName", "symbols": [(lexer.has("toolName") ? {type: "toolName"} : toolName)], "postprocess": d => d[0].value},
    {"name": "boolean", "symbols": [{"literal":"true"}], "postprocess": function(d) { return true; }},
    {"name": "boolean", "symbols": [{"literal":"false"}], "postprocess": function(d) { return false; }},
    {"name": "number", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": function(d) { return parseFloat(d[0].value) }},
    {"name": "_", "symbols": []},
    {"name": "_", "symbols": [(lexer.has("space") ? {type: "space"} : space)], "postprocess": function(d) { return null; }}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
