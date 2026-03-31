import { parse as babel_parse } from "@babel/parser";
import traverse from "@babel/traverse";

export default (js) => {
  const ast = babel_parse(js, { sourceType: "module" }),
    results = [];

  traverse(ast, {
    ArrowFunctionExpression(path) {
      const { node, parent, parentPath } = path,
        { params } = node,
        { type } = parent,
        is_default = type === "ExportDefaultDeclaration",
        is_named =
          type === "VariableDeclarator" &&
          parentPath.parentPath?.parent?.type === "ExportNamedDeclaration";

      if (is_default || is_named) {
        const fn_name = is_default ? "default" : parent.id.name,
          parsed_params = params.map((p) => {
            const { type: p_type, name, left, right } = p;
            return p_type === "Identifier"
              ? name
              : p_type === "AssignmentPattern"
                ? `${left.name} = ${right.value}`
                : "unknown";
          }),
          parsed_returns = [];

        path.traverse({
          ReturnStatement(ret_path) {
            const { argument } = ret_path.node;
            if (!argument) {
              parsed_returns.push(undefined);
              return;
            }
            switch (argument.type) {
              case "ArrayExpression":
                parsed_returns.push(
                  argument.elements.map((e) => {
                    const { type: e_type, left, operator, right } = e;
                    return e_type === "BinaryExpression"
                      ? `${left.name} ${operator} ${right.name}`
                      : "unknown";
                  })
                );
                break;
              case "NumericLiteral":
                parsed_returns.push(argument.value);
                break;
              case "Identifier":
                parsed_returns.push(argument.name);
                break;
              default:
                parsed_returns.push("unknown");
            }
          },
        });

        if (node.body.type === "BlockStatement") {
          const body_elements = node.body.body,
            last_stmt = body_elements[body_elements.length - 1];
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
