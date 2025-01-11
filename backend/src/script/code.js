const nearley = require("nearley");
const grammar = require("./grammar.js");
const { move, control, home, pick } = require("./actions.js");

async function analyzeCode(code) {
  console.log("Received code: " + code);
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar), {
    keepHistory: true,
  });

  // parse the code
  try {
    parser.feed(code);
  } catch (parseError) {
    console.log("Parse Error " + parseError);

    let token = parseError.token;
    let message = parseError.message;

    // Extract line and column of the error
    const errorLocation = message.match(/line (\d+) col (\d+)/);
    const line = parseInt(errorLocation[1]);
    const col = parseInt(errorLocation[2]);

    // Extract the list of expected tokens
    let expected = message
      .match(/(?<=A ).*(?= based on:)/g)
      .map((s) => s.replace(/\s+token/i, ""));

    return {
      successful: false,
      parseError: {
        token,
        message,
        line,
        col,
        expected,
        date: new Date().toISOString(),
      },
    };
  }

  return { successful: true };
}

async function runCode(code, botController) {
  console.log("Running code: " + code);
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

  // parse the code
  try {
    parser.feed(code);
    let results = parser.results;

    if (results.length == 0) return false;

    console.log("-----> results : ", JSON.stringify(results, undefined, 2));
    results[0].forEach((action) => {
      matchAcction(action, botController);
    });
  } catch (parseError) {
    console.log("Parse Error " + parseError);
    console.log("Error at character " + parseError.offset); // "Error at character 9"
    return { successful: false, parseError };
  }

  return { successful: true };
}

function matchAcction(action, botController) {
  let props = generateProps(action.args);
  console.log(".............. props : ", action.args, props)

  switch (action.action) {
    case "move":
      move(props, botController);
      break;
    case "control":
      control(props, botController);
      break;
    case "home":
      home(props, botController);
      break;
    case "pick":
      pick(props, botController);
      break;
    default:
      break;
  }
}

function generateProps(propList) {
  let props = {};

  propList.forEach((prop) => {
    props[prop.name] = prop.value;
  });
  return props;
}

module.exports = {
  analyzeCode,
  runCode,
};
