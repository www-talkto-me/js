const formatRet = (ret) =>
  ret === null
    ? "undefined"
    : Array.isArray(ret)
      ? `[${ret.map(formatRet).join(", ")}]`
      : String(ret);

const formatRetList = (ret_list) =>
  !ret_list?.length ? "void" : ret_list.map(formatRet).join(" | ");

const makeDoc = (lines, indent = "") =>
  lines.length === 1
    ? `/** ${lines[0]} */`
    : `/**\n${indent} * ${lines.join(`\n${indent} * `)}\n${indent} */`;

export default (li, file_path) => {
  let default_export = "",
    result = `import Fn from 'x/Fn.js';\n`;
  const named_exports = [],
    prefix = file_path.slice(0, -3);

  for (const [name, params, returns] of li) {
    const is_uid = params[0]?.split("=")[0].trim() === "uid",
      wrapper_params = is_uid ? params.slice(1) : params,
      doc_lines = is_uid ? ["@required signin"] : [];

    doc_lines.push(`@return ${formatRetList(returns)}`);

    const arg_list = wrapper_params.join(", "),
      call_args = wrapper_params.map((p) => p.split("=")[0].trim()).join(", "),
      func_path = name === "default" ? prefix : `${prefix}/${name}`,
      body = call_args ? `Fn('${func_path}', ${call_args})` : `Fn('${func_path}')`;

    if (name === "default") {
      default_export = `\n${makeDoc(doc_lines)}\nexport default (${arg_list}) => ${body};\n`;
    } else {
      named_exports.push(`${makeDoc(doc_lines, "  ")}\n  ${name} = (${arg_list}) => ${body}`);
    }
  }

  if (default_export) result += default_export;
  if (named_exports.length) result += `\nexport const\n  ${named_exports.join(",\n\n  ")};\n`;

  return result;
};
