@{%
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
%}

# Pass your lexer object using the @lexer option:
@lexer lexer

main -> _ statements _ {% d => d[1] %}

statements -> statement _ statements {% d => [d[0], ...d[2]] %}
    | statement {% d => [d[0]] %}

statement -> "move" _ "(" _ movePropList _ ")" {% d => ({ action: 'move', args: d[4] }) %}
    | "control" _ "(" _ controlPropList _ ")" {% d => ({ action: 'control', args: d[4] }) %}
    | "home" _ "(" _ homePropList _ ")" {% d => ({ action: 'home', args: d[4] }) %}
    | "pick" _ "(" _ pickPropList _ ")" {% d => ({ action: 'pick', args: d[4] }) %}

# move
# ==========
movePropList -> moveProp _ "," _ movePropList {% d => [d[0], ...d[4]] %}
          | moveProp {% d => [d[0]] %}

moveProp -> movePropName _ ":" _ number {% d => ({ name: d[0], value: d[4] }) %}

movePropName -> "x" {% () => 'x' %}
          | "y" {% () => 'y' %}
          | "z" {% () => 'z' %}

# control
# ==========
controlPropList -> controlProp _ "," _ controlPropList {% d => [d[0], ...d[4]] %}
          | controlProp {% d => [d[0]] %}

controlProp -> "pin" _ ":" _ number {% d => ({ name: d[0].value, value: d[4] }) %}
          | "state" _ ":" _ boolean {% d => ({ name: d[0].value, value: d[4] }) %}

# home
# ==========
homePropList -> homeProp _ "," _ homePropList {% d => [d[0], ...d[4]] %}
          | homeProp {% d => [d[0]] %}

homeProp -> homePropName _ ":" _ boolean {% d => ({ name: d[0], value: d[4] }) %}

homePropName -> "x" {% () => 'x' %}
          | "y" {% () => 'y' %}
          | "z" {% () => 'z' %}

# pick
# ==========
pickPropList -> pickProp _ "," _ pickPropList {% d => [d[0], ...d[4]] %}
          | pickProp {% d => [d[0]] %}

pickProp -> pickPropName _ ":" _ toolName {% d => ({ name: d[0], value: d[4] }) %}

pickPropName -> "tool" {% () => 'tool' %}

toolName -> %toolName {% d => d[0].value %}

# Basic
# ==========
boolean -> "true" {% function(d) { return true; } %}
    | "false" {% function(d) { return false; } %}

number -> %number {% function(d) { return parseFloat(d[0].value) } %}
_ -> null | %space {% function(d) { return null; } %}
