export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;
  let pluginVarName = null;

  // Handle CommonJS require
  root.find(j.VariableDeclarator, {
    init: {
      callee: { name: 'require' },
      arguments: [{ value: 'mini-css-extract-plugin' }],
    },
  }).forEach((path) => {
    path.node.init.arguments[0].value = '@rspack/core';
    pluginVarName = path.node.id.name;
    path.node.id.name = 'rspack';
    dirtyFlag = true;
  });

  // Handle ES6 import
  root.find(j.ImportDeclaration, {
    source: { value: 'mini-css-extract-plugin' },
  }).forEach((path) => {
    path.node.source.value = '@rspack/core';
    if (path.node.specifiers.length > 0) {
      pluginVarName = path.node.specifiers[0].local.name;
      path.node.specifiers[0].local.name = 'rspack';
    }
    dirtyFlag = true;
  });

  // Replace new CssExtractWebpackPlugin with new rspack.CssExtractRspackPlugin
  root.find(j.NewExpression, {
    callee: { name: 'CssExtractWebpackPlugin' },
  }).forEach((path) => {
    path.node.callee = j.memberExpression(
      j.identifier('rspack'),
      j.identifier('CssExtractRspackPlugin'),
    );
    dirtyFlag = true;
  });

  // Replace use: [CssExtractWebpackPlugin.loader, 'css-loader'] with use: [rspack.CssExtractRspackPlugin.loader, 'css-loader']
  root.find(j.ObjectExpression).forEach((path) => {
    path.node.properties.forEach((prop) => {
      if (
        j.ObjectProperty.check(prop) &&
        j.Identifier.check(prop.key) &&
        prop.key.name === 'use' &&
        j.ArrayExpression.check(prop.value)
      ) {
        prop.value.elements.forEach((element, index) => {
          if (
            j.MemberExpression.check(element) &&
            j.Identifier.check(element.object) &&
            element.object.name === pluginVarName &&
            j.Identifier.check(element.property) &&
            element.property.name === 'loader'
          ) {
            prop.value.elements[index] = j.memberExpression(
              j.memberExpression(
                j.identifier('rspack'),
                j.identifier('CssExtractRspackPlugin'),
              ),
              j.identifier('loader'),
            );
            dirtyFlag = true;
          }
        });
      }
    });
  });

  // Replace CssExtractWebpackPlugin.loader with rspack.CssExtractRspackPlugin.loader
  root.find(j.AssignmentExpression, {
    left: {
      object: { name: 'module' },
      property: { name: 'exports' },
    },
  }).forEach((path) => {
    if (j.ObjectExpression.check(path.node.right)) {
      const moduleExports = path.node.right;

      const moduleProperty = moduleExports.properties.find(
        (prop) =>
        j.ObjectProperty.check(prop) &&
        j.Identifier.check(prop.key) &&
        prop.key.name === 'module',
      );

      if (
        moduleProperty &&
        j.ObjectExpression.check(moduleProperty.value)
      ) {
        const moduleObject = moduleProperty.value;

        const rulesProperty = moduleObject.properties.find(
          (prop) =>
          j.ObjectProperty.check(prop) &&
          j.Identifier.check(prop.key) &&
          prop.key.name === 'rules',
        );

        if (
          rulesProperty &&
          j.ArrayExpression.check(rulesProperty.value)
        ) {
          const rulesArray = rulesProperty.value;

          rulesArray.elements.forEach((rule) => {
            if (j.ObjectExpression.check(rule)) {
              const testProperty = rule.properties.find(
                (prop) =>
                j.ObjectProperty.check(prop) &&
                j.Identifier.check(prop.key) &&
                prop.key.name === 'test' &&
                j.RegExpLiteral.check(prop.value) &&
                prop.value.pattern === '\\.css$' &&
                prop.value.flags === 'i',
              );

              if (testProperty) {
                const typePropertyExists = rule.properties.some(
                  (prop) =>
                  j.ObjectProperty.check(prop) &&
                  j.Identifier.check(prop.key) &&
                  prop.key.name === 'type',
                );

                if (!typePropertyExists) {
                  rule.properties.push(
                    j.objectProperty(
                      j.identifier('type'),
                      j.stringLiteral('javascript/auto'),
                    ),
                  );
                  dirtyFlag = true;
                }
              }
            }
          });
        }
      }
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}

export const parser = 'tsx';