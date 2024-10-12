/*! @license
The MIT License (MIT)

Copyright (c) 2024 dfordp

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
"use strict";Object.defineProperty(exports,"__esModule",{value:true});function _export(target,all){for(var name in all)Object.defineProperty(target,name,{enumerable:true,get:all[name]})}_export(exports,{default:function(){return transform},parser:function(){return parser}});function transform(file,api,options){const j=api.jscodeshift;const root=j(file.source);let dirtyFlag=false;let pluginVarName=null;root.find(j.VariableDeclarator,{init:{callee:{name:"require"},arguments:[{value:"mini-css-extract-plugin"}]}}).forEach(path=>{path.node.init.arguments[0].value="@rspack/core";pluginVarName=path.node.id.name;path.node.id.name="rspack";dirtyFlag=true});root.find(j.ImportDeclaration,{source:{value:"mini-css-extract-plugin"}}).forEach(path=>{path.node.source.value="@rspack/core";if(path.node.specifiers.length>0){pluginVarName=path.node.specifiers[0].local.name;path.node.specifiers[0].local.name="rspack"}dirtyFlag=true});root.find(j.NewExpression,{callee:{name:"CssExtractWebpackPlugin"}}).forEach(path=>{path.node.callee=j.memberExpression(j.identifier("rspack"),j.identifier("CssExtractRspackPlugin"));dirtyFlag=true});root.find(j.ObjectExpression).forEach(path=>{path.node.properties.forEach(prop=>{if(j.ObjectProperty.check(prop)&&j.Identifier.check(prop.key)&&prop.key.name==="use"&&j.ArrayExpression.check(prop.value)){prop.value.elements.forEach((element,index)=>{if(j.MemberExpression.check(element)&&j.Identifier.check(element.object)&&element.object.name===pluginVarName&&j.Identifier.check(element.property)&&element.property.name==="loader"){prop.value.elements[index]=j.memberExpression(j.memberExpression(j.identifier("rspack"),j.identifier("CssExtractRspackPlugin")),j.identifier("loader"));dirtyFlag=true}})}})});root.find(j.AssignmentExpression,{left:{object:{name:"module"},property:{name:"exports"}}}).forEach(path=>{if(j.ObjectExpression.check(path.node.right)){const moduleExports=path.node.right;const moduleProperty=moduleExports.properties.find(prop=>j.ObjectProperty.check(prop)&&j.Identifier.check(prop.key)&&prop.key.name==="module");if(moduleProperty&&j.ObjectExpression.check(moduleProperty.value)){const moduleObject=moduleProperty.value;const rulesProperty=moduleObject.properties.find(prop=>j.ObjectProperty.check(prop)&&j.Identifier.check(prop.key)&&prop.key.name==="rules");if(rulesProperty&&j.ArrayExpression.check(rulesProperty.value)){const rulesArray=rulesProperty.value;rulesArray.elements.forEach(rule=>{if(j.ObjectExpression.check(rule)){const testProperty=rule.properties.find(prop=>j.ObjectProperty.check(prop)&&j.Identifier.check(prop.key)&&prop.key.name==="test"&&j.RegExpLiteral.check(prop.value)&&prop.value.pattern==="\\.css$"&&prop.value.flags==="i");if(testProperty){const typePropertyExists=rule.properties.some(prop=>j.ObjectProperty.check(prop)&&j.Identifier.check(prop.key)&&prop.key.name==="type");if(!typePropertyExists){rule.properties.push(j.objectProperty(j.identifier("type"),j.stringLiteral("javascript/auto")));dirtyFlag=true}}}})}}}});return dirtyFlag?root.toSource():undefined}const parser="tsx";