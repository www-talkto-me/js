import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

const paramStr = (p) => {
  const { type, name, left, right } = p;
  switch (type) {
    case "Identifier":
      return name;
    case "AssignmentPattern":
      return `${left.name} = ${right.value}`;
    default:
      return "";
  }
};

const retNodeStr = (node) => {
  if (!node) return undefined;
  const { type, elements, value, name, left, operator, right } = node;
  switch (type) {
    case "ArrayExpression":
      return elements.map(retNodeStr);
    case "BinaryExpression":
      return `${retNodeStr(left)} ${operator} ${retNodeStr(right)}`;
    case "NumericLiteral":
      return value;
    case "StringLiteral":
      return `"${value}"`;
    case "Identifier":
      return name;
    default:
      return "";
  }
};

const exportedFnName = (node, parent, parent_path) => {
  const { type } = parent;
  switch (type) {
    case "ExportDefaultDeclaration":
      return "default";
    case "VariableDeclarator":
      return parent_path.parentPath?.parent?.type === "ExportNamedDeclaration"
        ? parent.id.name
        : undefined;
    case "ExportNamedDeclaration":
      return node.id?.name;
    default:
      return undefined;
  }
};

export default (js) => {
  const ast = parse(js, { sourceType: "module" }),
    results = [];

  traverse(ast, {
    "ArrowFunctionExpression|FunctionExpression|FunctionDeclaration": (path) => {
      const { node, parent, parentPath: parent_path } = path,
        fn_name = exportedFnName(node, parent, parent_path);

      if (fn_name) {
        const { params, body } = node,
          parsed_params = params.map(paramStr),
          parsed_returns = [];

        path.traverse({
          ReturnStatement: (ret_path) => {
            parsed_returns.push(retNodeStr(ret_path.node.argument));
          },
        });

        if (body.type === "BlockStatement") {
          const { body: stmts } = body,
            last_stmt = stmts[stmts.length - 1];
          if (last_stmt?.type !== "ReturnStatement") {
            parsed_returns.push(undefined);
          }
        }

        results.push([fn_name, parsed_params, [...new Set(parsed_returns)]]);
      }
    },
  });

  return results;
};
