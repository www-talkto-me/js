const formatRet = ret =>
  ret === null ? 'undefined' : Array.isArray(ret) ? `[${ret.map(formatRet).join(', ')}]` : String(ret)

const formatRetList = retList =>
  !retList || !retList.length ? 'void' : retList.map(formatRet).join(' | ')

export default li => {
  let defaultExport = '';
  const namedExports = [];

  for (const [name, params, returns] of li) {
    let requiresSignin = false;
    const wrapperParams = [...params];

    if (wrapperParams.length > 0 && wrapperParams[0].split('=')[0].trim() === 'uid') {
      requiresSignin = true;
      wrapperParams.shift();
    }

    const rawArgs = wrapperParams.map(p => p.split('=')[0].trim()),
      argList = wrapperParams.join(', '),
      callArgs = rawArgs.join(', '),
      retText = formatRetList(returns);

    const docLines = [];
    if (requiresSignin) docLines.push('@required signin');
    docLines.push(`@return ${retText}`);

    const jsdocStr = docLines.length === 1 
      ? `/** ${docLines[0]} */` 
      : `/**\n   * ${docLines.join('\n   * ')}\n   */`;
    
    // adjust jsdoc indentation for default vs named
    const jsdocDefault = docLines.length === 1 
      ? `/** ${docLines[0]} */` 
      : `/**\n * ${docLines.join('\n * ')}\n */`;

    const body = `Fn(${callArgs})`;

    if (name === 'default') {
      defaultExport = `\n${jsdocDefault}\nexport default (${argList}) => ${body};\n`;
    } else {
      namedExports.push(`${jsdocStr}\n  ${name} = (${argList}) => ${body}`);
    }
  }

  let result = `import Fn from 'x/Fn.js';\n`;
  if (defaultExport) result += defaultExport;
  if (namedExports.length > 0) result += `\nexport const\n  ${namedExports.join(',\n\n  ')};\n`;

  return result;
}
