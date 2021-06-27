if (process.argv[2] == '-h') {
    console.log('\nПример запуска программы:\n\nnode rpn.mjs -infixToPostfix/-postfixToInfix "1+5"\n\nЗамечание: если в выражении присутствуют операнды более одного разряда, нужно каждый операнд и операцию (в том числе скобки) разделять пробелами. Пример: ( 10 + 3 ) / 2\n');
    process.exit(0);
}

function isNumber(i) {
    return (i >= '0' && i <= '9');
}
function isLetter(i) {
    return (i >= 'a' && i <= 'z') || (i >= 'A' && i <= 'Z');
}
function doesIncludeAnyOperator(str) {
    for (const operator of operatorsWithoutBrackets)
        if (str.includes(operator)) return true;
    return false;
}

let input = process.argv[3];
let operators = ['^', '*', '/', '+', '-', '(', ')'];
let operatorsWithoutBrackets = ['^', '*', '/', '+', '-'];
let operatorPriorities = {
    '(': 0,
    ')': 0,
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '^': 3
};
let bracketsFindingState = {
    Default: 0,
    NotFound: 1,
    Found: 2
}

if (process.argv[2] == '-infixToPostfix') {
    let stack = [];
    let out = '';
    let isCloseBracketFound = bracketsFindingState.Default;
    let wereSpaces = false;
    if (input.indexOf(' ') > -1) {
        input = input.split(' ');
        wereSpaces = true;
    }
    for (let i = 0; i < input.length; ++i) {
        if (isNumber(input[i]) || isLetter(input[i])) {
            if (i == 0 || !wereSpaces) out += input[i];
            else if (wereSpaces) out = out + ' ' + input[i];
        }
        else if (operators.indexOf(input[i]) != -1) {
            if (i > 0 && operators.includes(input[i - 1])) {
                console.log('Ошибка: для бинарной операции найдено менее 2-ух операндов');
                process.exit(4);
            }
            if (input[i] != ')') {
                if (input[i] == '(') {
                    stack.push(input[i]);
                    isCloseBracketFound = bracketsFindingState.NotFound;
                }
                else if (input[i] == '^') {
                    while (operatorsWithoutBrackets.indexOf(stack[stack.length - 1]) != -1 &&
                        operatorPriorities[input[i]] < operatorPriorities[stack[stack.length - 1]]) {
                            if (i == 0 || !wereSpaces) out = out + stack.pop();
                            else if (wereSpaces) out = out + ' ' + stack.pop();
                        }
                    stack.push(input[i]);
                }
                else {
                    while (operatorsWithoutBrackets.indexOf(stack[stack.length - 1]) != -1 &&
                        operatorPriorities[input[i]] <= operatorPriorities[stack[stack.length - 1]]) {
                            if (i == 0 || !wereSpaces) out = out + stack.pop();
                            else if (wereSpaces) out = out + ' ' + stack.pop();
                        }
                    stack.push(input[i]);
                }
            }
            else {
                isCloseBracketFound = bracketsFindingState.Found;
                while (stack[stack.length - 1] != '(') {
                    if (stack.length > 0 && stack[stack.length - 1] != ')') {
                        if (i == 0 || !wereSpaces) out = out + stack.pop();
                        else if (wereSpaces) out = out + ' ' + stack.pop();
                    }
                    else {
                        console.log('Ошибка: не найдена открывающая скобка');
                        process.exit(1);
                    }
                }
                stack.pop();
            }
        }
        else {
            console.log('Ошибка: неизвестный оператор');
            process.exit(3);
        }
    }
    if (isCloseBracketFound == bracketsFindingState.NotFound) {
        console.log('Ошибка: не найдена закрывающая скобка');
        process.exit(2);
    }
    while (stack.length > 0) {
        if (!wereSpaces) out = out + stack.pop();
        else out = out + ' ' + stack.pop();
    }
    console.log(out);
}
else if (process.argv[2] == '-postfixToInfix') {
    let stack = [];
    let wereSpaces = false;
    if (input.indexOf(' ') > -1) {
        input = input.split(' ');
        wereSpaces = true;
    }
    for (let i = 0; i < input.length; ++i) {
        if (isNumber(input[i]) || isLetter(input[i])) stack.push(input[i]);
        else if (stack.length > 1) {
            let operand2 = stack.pop();
            let operand1 = stack.pop();
            if (operatorsWithoutBrackets.includes(input[i]) && operatorsWithoutBrackets.includes(input[i - 1])) {
                if (operatorPriorities[input[i]] >= operatorPriorities[input[i - 1]] && input[i] != input[i - 1]) {
                    if (doesIncludeAnyOperator(operand1) && operand1[0] != '(') {
                        if (wereSpaces) operand1 = '( ' + operand1 + ' )';
                        else operand1 = '(' + operand1 + ')';
                    }
                    if (doesIncludeAnyOperator(operand2) && operand2[0] != '(') {
                        if (wereSpaces) operand2 = '( ' + operand2 + ' )';
                        else operand2 = '(' + operand2 + ')';
                    }
                }
            }
            let newOperand;
            if (wereSpaces) newOperand = operand1 + ' ' + input[i] + ' ' + operand2;
            else newOperand = operand1 + input[i] + operand2;
            stack.push(newOperand);
        }
        else {
            console.log('Ошибка: для бинарной операции найдено менее 2-ух операндов');
            process.exit(4);
        }
    }
    console.log(stack.pop());
}
else {
    console.log('Ошибка: неизвестная комманда');
    process.exit(5);
}