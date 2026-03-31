import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

const paramStr = (p) => {
  const { type, name, left, right } = p;
  return type === "Identifier"
    ? name
    : type === "AssignmentPattern"
      ? `${left.name} = ${right.value}`
      : "unknown";
};

const retNodeStr = (node) => {
  if (!node) return undefined;
  const { type, elements, value, name } = node;
  return type === "ArrayExpression"
    ? elements.map((e) => {
        const { type: e_type, left, operator, right } = e;
        return e_type === "BinaryExpression" ? `${left.name} ${operator} ${right.name}` : "unknown";
      })
    : type === "NumericLiteral"
      ? value
      : type === "Identifier"
        ? name
        : "unknown";
};

export default (js) => {
  const ast = parse(js, { sourceType: "module" }),
    results = [];

  traverse(ast, {
    ArrowFunctionExpression: (path) => {
      const { node, parent, parentPath } = path,
        params = node.params,
        body = node.body,
        type = parent.type,
        is_default = type === "ExportDefaultDeclaration",
        is_named =
          type === "VariableDeclarator" &&
          parentPath.parentPath?.parent?.type === "ExportNamedDeclaration";

      if (is_default || is_named) {
        const fn_name = is_default ? "default" : parent.id.name,
          parsed_params = params.map(paramStr),
          parsed_returns = [];

        path.traverse({
          ReturnStatement: (ret_path) => {
            parsed_returns.push(retNodeStr(ret_path.node.argument));
          },
        });

        if (body.type === "BlockStatement") {
          const last_stmt = body.body[body.body.length - 1];
          if (!last_stmt || last_stmt.type !== "ReturnStatement") {
            parsed_returns.push(undefined);
          }
        }

        results.push([fn_name, parsed_params, [...new Set(parsed_returns)]]);
      }
    },
  });

  return results;
};
