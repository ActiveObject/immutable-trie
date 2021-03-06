var util = require('util');
var chai = require('chai');
var expect = chai.expect;

var HashCollisionNode = require('../src/HashCollisionNode');
var LeafNode = require('../src/LeafNode');

function hashCode(value) {
  var hash = 0, character;

  if (typeof value === 'number') {
    return value;
  }

  if (value.length === 0) return hash;

  for (var i = 0, l = value.length; i < l; ++i) {
    character = value.charCodeAt(i);
    hash = (((hash << 5) - hash) + character) | 0; // Convert to 32bit integer
  }

  return hash;
}

describe('HashCollisionNode', function () {
  describe('#assoc', function() {
    it('should create a new HashCollisionNode instance', function() {
      var A = new LeafNode(hashCode('AaAa'), 'AaAa', 'value1');
      var B = new LeafNode(hashCode('BBBB'), 'BBBB', 'value2');
      var C = new LeafNode(hashCode('AaBB'), 'AaBB', 'value3');
      var hnode = new HashCollisionNode(hashCode('AaAa'), [A, B]);
      var newNode = hnode.assoc(0, C);

      expect(newNode).to.not.equal(hnode);
    });

    it('should append new leaf node to the children list', function() {
      var A = new LeafNode(hashCode('AaAa'), 'AaAa', 'value1');
      var B = new LeafNode(hashCode('BBBB'), 'BBBB', 'value2');
      var C = new LeafNode(hashCode('AaBB'), 'AaBB', 'value3');
      var hnode = new HashCollisionNode(hashCode('AaAa'), [A, B]);
      var newNode = hnode.assoc(0, C);

      expect(newNode.children).to.deep.include(C);
    });
  });

  describe('#without', function() {
    describe('- remove first leaf from two-item collision node', function() {
      it('should return second leaf node', function() {
        var A = new LeafNode(hashCode('AaAa'), 'AaAa', 'value1');
        var B = new LeafNode(hashCode('BBBB'), 'BBBB', 'value2');
        var hnode = new HashCollisionNode(hashCode('AaAa'), [A, B]);
        var newNode = hnode.without(0, 0, 'AaAa');

        expect(newNode).to.equal(B);
      });
    });

    describe('- remove second leaf from two-item collision node', function() {
      it('should return first leaf node', function() {
        var A = new LeafNode(hashCode('AaAa'), 'AaAa', 'value1');
        var B = new LeafNode(hashCode('BBBB'), 'BBBB', 'value2');
        var hnode = new HashCollisionNode(hashCode('AaAa'), [A, B]);
        var newNode = hnode.without(0, 0, 'BBBB');

        expect(newNode).to.equal(A);
      });
    });

    describe('- remove leaf from three-item collision node', function() {
      it('should return new collision node', function() {
        var A = new LeafNode(hashCode('AaAa'), 'AaAa', 'value1');
        var B = new LeafNode(hashCode('BBBB'), 'BBBB', 'value2');
        var C = new LeafNode(hashCode('AaBB'), 'AaBB', 'value3');
        var hnode = new HashCollisionNode(hashCode('AaAa'), [A, B, C]);
        var newNode = hnode.without(0, 0, 'AaBB');

        expect(newNode).to.be.instanceof(HashCollisionNode);
      });

      it('should have two children', function() {
        var A = new LeafNode(hashCode('AaAa'), 'AaAa', 'value1');
        var B = new LeafNode(hashCode('BBBB'), 'BBBB', 'value2');
        var C = new LeafNode(hashCode('AaBB'), 'AaBB', 'value3');
        var hnode = new HashCollisionNode(hashCode('AaAa'), [A, B, C]);
        var newNode = hnode.without(0, 0, 'AaBB');
        var children = newNode.children.map(function(x) { return x.key });

        expect(children).to.have.members(['AaAa', 'BBBB']);
      });
    });
  });

  describe('#lookup', function() {
    it('should return correct leaf on non-empty trie', function() {
      var A = new LeafNode(hashCode('AaAa'), 'AaAa', 'value1');
      var B = new LeafNode(hashCode('BBBB'), 'BBBB', 'value2');
      var hnode = new HashCollisionNode(hashCode('AaAa'), [A, B]);

      expect(hnode.lookup(0, 0, 'AaAa')).to.equal(A);
    });

    it('should return null if key is missing', function() {
      var A = new LeafNode(hashCode('AaAa'), 'AaAa', 'value1');
      var B = new LeafNode(hashCode('BBBB'), 'BBBB', 'value2');
      var hnode = new HashCollisionNode(hashCode('AaAa'), [A, B]);

      expect(hnode.lookup(0, 0, 'missing')).to.be.a('null');
    });
  });

  describe('#reduce', function() {
    it('can calculate sum of child values', function() {
      var sum = function(a, b) { return a + b; };
      var A = new LeafNode(hashCode('AaAa'), 'AaAa', 1);
      var B = new LeafNode(hashCode('BBBB'), 'BBBB', 2);
      var hnode = new HashCollisionNode(hashCode('AaAa'), [A, B]);

      expect(hnode.reduce(sum, 0)).to.equal(3);
    });
  });

  describe('#kvreduce', function() {
    it('can collect entry list', function() {
      var makeEntry = function(acc, key, value) {
        acc.push([key, value]);
        return acc;
      };

      var A = new LeafNode(hashCode('AaAa'), 'AaAa', 1);
      var B = new LeafNode(hashCode('BBBB'), 'BBBB', 2);
      var hnode = new HashCollisionNode(hashCode('AaAa'), [A, B]);

      expect(hnode.kvreduce(makeEntry, [])).to.have.deep.members([['AaAa', 1], ['BBBB', 2]]);
    });
  });
});