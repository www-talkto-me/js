const formatRet = (ret) =>
    ret === null
      ? "undefined"
      : Array.isArray(ret)
        ? `[${ret.map(formatRet).join(", ")}]`
        : String(ret),
  formatRetList = (ret_list) => (!ret_list?.length ? "void" : ret_list.map(formatRet).join(" | ")),
  makeDoc = (lines, indent = "") =>
    lines.length === 1
      ? `/** ${lines[0]} */`
      : `/**\n${indent} * ${lines.join(`\n${indent} * `)}\n${indent} */`,
  paramName = (p) => (p || "").split("=")[0].trim();

export default (prefix, li) => {
  const [default_export, named_exports] = li.reduce(
    (acc, item) => {
      const [def_exp, named_exps] = acc,
        [name, params, returns] = item,
        is_uid = paramName(params[0]) === "uid",
        wrapper_params = is_uid ? params.slice(1) : params,
        doc_lines = [...(is_uid ? ["@required signin"] : []), `@return ${formatRetList(returns)}`],
        arg_list = wrapper_params.join(", "),
        call_args = wrapper_params.map(paramName).join(", "),
        func_path = `${prefix}/${name === "default" ? "" : name}`,
        body = `Fn('${func_path}'${call_args ? `, ${call_args}` : ""})`;

      return name === "default"
        ? [`\n${makeDoc(doc_lines)}\nexport default (${arg_list}) => ${body};\n`, named_exps]
        : [
            def_exp,
            [...named_exps, `${makeDoc(doc_lines, "  ")}\n  ${name} = (${arg_list}) => ${body}`],
          ];
    },
    ["", []],
  );

  return (
    `import Fn from 'x/Fn.js';\n` +
    default_export +
    (named_exports.length ? `\nexport const\n  ${named_exports.join(",\n\n  ")};\n` : "")
  );
};
