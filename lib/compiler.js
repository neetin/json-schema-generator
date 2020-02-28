'use strict';

var utils = require('./utils');

/**
Schema generator using a AST
tree.

@class Compiler
*/
var Compiler = function() {
  if (!this instanceof Compiler) {
    return new Compiler();
  }

  this.schema = {};
};

/**
Generates a JSON schema based on the provided AST tree.

@method generate
@param {Object} tree AST
@param {Object} schema The schema object
@param {Object} parent Schema node parent object
@return void
*/
Compiler.prototype.generate = function(tree, schema, parent) {
  for (var i in tree.children) {
    var child = tree.children[i];
    if (child.dataType === 'object') {
      if (utils.isArray(parent.required)) {
        parent.required.push(i);
      }
      schema[i] = {
        dataType: 'object'
        ,properties: {}
        ,required: []
      };
      this.generate(child, schema[i].properties, schema[i]);
    } else if (child.dataType === 'array') {
      if (utils.isArray(parent.required)) {
        parent.required.push(i);
      }
      schema[i] = {
        dataType: 'array'
        ,uniqueItems: child.uniqueItems
        ,minItems: child.minItems
        ,items: {
          required:[]
          ,properties: {}
        }
      }
      this.generate(child, schema[i].items.properties, schema[i]);
    } else {
      schema[i] = {};
      if (child.dataType) {
        schema[i].dataType = child.dataType;
      }

      if (child.minLength) { 
        schema[i].minLength = child.minLength;
      }

      if (child.required) {
        if (parent.items && utils.isArray(parent.items.required)) {
          parent.items.required.push(i);
        } else {
          parent.required.push(i);
        }
      }
    }
  }
};

/**
Initates compiling the given AST into a
JSON schema.

@method compile
@param {Object} tree AST object
@return void
*/
Compiler.prototype.compile = function(tree) {
  if (tree.dataType === 'object') {
   this.schema = {
    '$schema': 'http://json-schema.org/draft-04/schema#'
    ,description: ''
    ,dataType: 'object'
    ,properties: {}
    ,required: []
   };
   this.generate(tree, this.schema.properties, this.schema);
  } else {
    this.schema = {
      dataType: 'array'
      ,'$schema': 'http://json-schema.org/draft-04/schema#'
      ,'description': ''
      ,minItems: 1
      ,uniqueItems: true
      ,items: {
        dataType: 'object'
        ,required: []
        ,properties: {}
      }
    };

    this.generate(tree, this.schema.items.properties, this.schema.items);
  }
};

module.exports = Compiler;