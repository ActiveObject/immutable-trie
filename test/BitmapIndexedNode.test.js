var util = require('util');
var chai = require('chai');
var expect = chai.expect;

var BitmapIndexedNode = require('../src/BitmapIndexedNode');
var LeafNode = require('../src/LeafNode');
var toBitmap = require('../src/common').toBitmap;

function b(str){
  return parseInt(str.split(' ').join(''), 2);
}

function p(obj, d) {
  console.log('\n');
  console.log(util.inspect(obj, {
    colors: true,
    depth: d || 5
  }));
}

function isLeaf(node) {
  return node.hasOwnProperty('key');
}

describe('BitmapIndexedNode', function () {
  describe('#assoc', function () {
    describe('- insert LeafNode in empty BitmapIndexedNode:', function() {
      before(function () {
        this.A = b('1010');
      });

      it('should create a new BitmapIndexedNode', function () {
        var leaf = new LeafNode(this.A, this.A, 1);
        var biNode = new BitmapIndexedNode(0, []);
        var newNode = biNode.assoc(0, biNode);
        expect(newNode).to.not.equals(biNode);
      });

      it('should add a new leaf at first position', function() {
        var leaf = new LeafNode(this.A, this.A, 1);
        var biNode = new BitmapIndexedNode(0, []);
        var newNode = biNode.assoc(0, leaf);
        expect(newNode.children[0]).to.equals(leaf);
      });
    });

    describe('- insert LeafNode in non-empty BitmapIndexedNode:', function() {
      before(function () {
        this.A = b('1010');
        this.B = b('1011');
      });

      it('should create a new BitmapIndexedNode', function () {
        var leafA = new LeafNode(this.A, this.A, 1);
        var leafB = new LeafNode(this.B, this.B, 2);
        var biNode = new BitmapIndexedNode(toBitmap(this.A), [leafA]);
        var newNode = biNode.assoc(0, leafB);
        expect(newNode).to.not.equals(biNode);
      });

      it('should leave the old leaf at the same position', function() {
        var leafA = new LeafNode(this.A, this.A, 1);
        var leafB = new LeafNode(this.B, this.B, 2);
        var biNode = new BitmapIndexedNode(toBitmap(this.A), [leafA]);
        var newNode = biNode.assoc(0, leafB);
        expect(newNode.children[0]).to.equals(leafA);
      });

      it('should add a new leaf at second position', function() {
        var leafA = new LeafNode(this.A, this.A, 1);
        var leafB = new LeafNode(this.B, this.B, 2);
        var biNode = new BitmapIndexedNode(toBitmap(this.A), [leafA]);
        var newNode = biNode.assoc(0, leafB);
        expect(newNode.children[1]).to.equals(leafB);
      });
    });

    describe('- insert LeafNode at position with existing LeafNode:', function() {
      before(function () {
        this.A = b('00 01010');
        this.B = b('11 01010');
      });

      it('should create a new BitmapIndexedNode', function () {
        var leafA = new LeafNode(this.A, this.A, 1);
        var leafB = new LeafNode(this.B, this.B, 2);
        var biNode = new BitmapIndexedNode(toBitmap(this.A), [leafA]);
        var newNode = biNode.assoc(0, leafB);
        expect(newNode).to.not.equals(biNode);
      });

      it('should create a new BitmapIndexedNode at the conflicted position', function () {
        var leafA = new LeafNode(this.A, this.A, 1);
        var leafB = new LeafNode(this.B, this.B, 2);
        var biNode = new BitmapIndexedNode(toBitmap(this.A), [leafA]);
        var newNode = biNode.assoc(0, leafB);
        expect(newNode.children[0]).to.be.instanceOf(BitmapIndexedNode);
      });

      it('the new BitmapIndexedNode should have the old leaf node', function () {
        var leafA = new LeafNode(this.A, this.A, 1);
        var leafB = new LeafNode(this.B, this.B, 2);
        var biNode = new BitmapIndexedNode(toBitmap(this.A), [leafA]);
        var newNode = biNode.assoc(0, leafB);
        expect(newNode.children[0].children[0]).to.equals(leafA);
      });

      it('the new BitmapIndexedNode should have the new leaf node', function () {
        var leafA = new LeafNode(this.A, this.A, 1);
        var leafB = new LeafNode(this.B, this.B, 2);
        var biNode = new BitmapIndexedNode(toBitmap(this.A), [leafA]);
        var newNode = biNode.assoc(0, leafB);
        expect(newNode.children[0].children[1]).to.equals(leafB);
      });

      it('should leave the same bitmap for top BitmapIndexedNode', function () {
        var leafA = new LeafNode(this.A, this.A, 1);
        var leafB = new LeafNode(this.B, this.B, 2);
        var biNode = new BitmapIndexedNode(toBitmap(this.A), [leafA]);
        var newNode = biNode.assoc(0, leafB);
        expect(newNode.bitmap.toString(2)).to.equals(biNode.bitmap.toString(2));
      });

      it('should set correct bitmap for the inserted BitmapIndexedNode', function () {
        var leafA = new LeafNode(this.A, this.A, 1);
        var leafB = new LeafNode(this.B, this.B, 2);
        var biNode = new BitmapIndexedNode(toBitmap(this.A), [leafA]);
        var newNode = biNode.assoc(0, leafB);
        expect(newNode.children[0].bitmap.toString(2)).to.equals('1001');
      });

    });

    describe('- add 32 items:', function () {
      before(function () {
        this.numbers = [];
        for (var i = 0; i < 32; i++) {
          this.numbers.push(i);
        }
      });

      it('should create 32 leaf nodes', function () {
        var node = this.numbers.reduce(function (acc, n) {
          return acc.assoc(0, new LeafNode(n, n, n));
        }, BitmapIndexedNode.Empty);

        expect(node.children.every(isLeaf)).to.be.true;
      });
    });

    describe('- add 33 items:', function () {
      before(function () {
        this.numbers = [];
        for (var i = 0; i < 33; i++) {
          this.numbers.push(i);
        }
      });

      it('should create 32 nodes on first level', function () {
        var node = this.numbers.reduce(function (acc, n) {
          return acc.assoc(0, new LeafNode(n, n, n));
        }, BitmapIndexedNode.Empty);

        expect(node.children).to.have.length(32);
      });

      it('should create a BitmapIndexedNode and insert it at first position', function () {
        var node = this.numbers.reduce(function (acc, n) {
          return acc.assoc(0, new LeafNode(n, n, n));
        }, BitmapIndexedNode.Empty);

        expect(node.children[0]).to.be.instanceof(BitmapIndexedNode);
      });

      it('should create a BitmapIndexedNode with two leaf nodes', function () {
        var node = this.numbers.reduce(function (acc, n) {
          return acc.assoc(0, new LeafNode(n, n, n));
        }, BitmapIndexedNode.Empty);

        expect(node.children[0].children).to.have.length(2);
        expect(isLeaf(node.children[0].children[0])).to.be.true;
        expect(isLeaf(node.children[0].children[1])).to.be.true;
      });

      it('should create a BitmapIndexedNode that share a common node', function () {
        var nodeBefore = this.numbers.slice(0, 32).reduce(function (acc, n) {
          return acc.assoc(0, new LeafNode(n, n, n));
        }, BitmapIndexedNode.Empty);

        var nodeAfter = nodeBefore.assoc(0, new LeafNode(32, 32, 32));

        expect(nodeBefore.children[0]).to.equals(nodeAfter.children[0].children[0]);
      });
    });
  });


  describe('#lookup', function () {

    it('should find existing leaf node by key', function () {
      var A = b('01010');
      var leaf = new LeafNode(A, A, 1);
      var biNode = new BitmapIndexedNode(toBitmap(A), [leaf]);
      expect(biNode.lookup(0, A, A)).to.exist.and.equals(leaf);
    });

    it('can find two deep value', function () {
      var A = b('01 00001');
      var B = b('11 00001');

      var bitmap = toBitmap(A >>> 5) | toBitmap(B >>> 5);

      var leafA = new LeafNode(A, A, 1);
      var leafB = new LeafNode(B, B, 2);

      var innerBiNode = new BitmapIndexedNode(bitmap, [leafA, leafB]);
      var outerBiNode = new BitmapIndexedNode(bitmap, [innerBiNode]);

      expect(outerBiNode.lookup(0, A, A)).to.exist.and.equals(leafA);
      expect(outerBiNode.lookup(0, B, B)).to.exist.and.equals(leafB);
    });

    it('can find three deep value', function () {
      var A = b('01 00001 10001');
      var B = b('10 00001 10001');
      var C = b('11 00001 10001');

      var leafA = new LeafNode(A, A, 1);
      var leafB = new LeafNode(B, B, 2);
      var leafC = new LeafNode(C, C, 3);

      var bitmap = toBitmap(A >>> 10) | toBitmap(B >>> 10) | toBitmap(C >>> 10);

      var innerBiNode1 = new BitmapIndexedNode(bitmap, [leafA, leafB, leafC]);
      var innerBiNode2 = new BitmapIndexedNode(toBitmap(b('00001')), [innerBiNode1]);
      var outerBiNode = new BitmapIndexedNode(toBitmap(b('10001')), [innerBiNode2]);

      expect(outerBiNode.lookup(0, A, A)).to.exist.and.equals(leafA);
      expect(outerBiNode.lookup(0, B, B)).to.exist.and.equals(leafB);
      expect(outerBiNode.lookup(0, C, C)).to.exist.and.equals(leafC);
    });
  });


  describe('#without', function () {
    describe('- remove from node which have only leaf children:', function () {
      it('should return a new BitmapIndexedNode without removed item', function () {
        var source = BitmapIndexedNode.Empty
          .assoc(0, new LeafNode(1, 1, 1))
          .assoc(0, new LeafNode(2, 2, 2))
          .assoc(0, new LeafNode(3, 3, 3))

        var removed = source.without(0, 2, 2);

        expect(removed.lookup(0, 2, 2)).to.not.exists;
        expect(removed.lookup(0, 1, 1)).to.exist.and.have.property('value').that.equals(1);
        expect(removed.lookup(0, 3, 3)).to.exist.and.have.property('value').that.equals(3);
      });

      it('should keep values in previous BitmapIndexedNode', function () {
        var source = BitmapIndexedNode.Empty
          .assoc(0, new LeafNode(1, 1, 1))
          .assoc(0, new LeafNode(2, 2, 2))
          .assoc(0, new LeafNode(3, 3, 3))

        source.without(0, 2, 2);

        expect(source.lookup(0, 2, 2)).to.exist.and.have.property('value').that.equals(2);
        expect(source.lookup(0, 1, 1)).to.exist.and.have.property('value').that.equals(1);
        expect(source.lookup(0, 3, 3)).to.exist.and.have.property('value').that.equals(3);
      });
    });

    describe('- remove deep value:', function () {
      it('should return new BitmapIndexedNode without removed value', function () {
        var A = b('1 00001');
        var source = BitmapIndexedNode.Empty
          .assoc(0, new LeafNode(1, 1, 1))
          .assoc(0, new LeafNode(2, 2, 2))
          .assoc(0, new LeafNode(A, A, A))

        var removed = source.without(0, A, A);

        expect(removed.lookup(0, A, A)).to.not.exists;
        expect(removed.lookup(0, 1, 1)).to.exist.and.have.property('value').that.equals(1);
        expect(removed.lookup(0, 2, 2)).to.exist.and.have.property('value').that.equals(2);
      });
    });

    describe('- remove deep value from BitmapIndexedNode that has only one child', function () {
      it('should reduce to the one BitmapIndexedNode', function () {
        var A = b('1 00001');
        var source = BitmapIndexedNode.Empty
          .assoc(0, new LeafNode(1, 1, 1))
          .assoc(0, new LeafNode(A, A, A))

        var removed = source.without(0, A, A);

        expect(removed.lookup(0, A, A)).to.not.exists;
        expect(removed.lookup(0, 1, 1)).to.exist.and.have.property('value').that.equals(1);
        expect(removed.children.length).to.equals(1);
        expect(removed.children[0].isLeaf).to.be.true;
      });
    });

    describe('- remove deep value from BitmapIndexedNode that has more that two children:', function () {
      it('should return new BitmapIndexedNode without removed value', function () {
        var A = b('0 00011');
        var B = b('1 00001');
        var source = BitmapIndexedNode.Empty
          .assoc(0, new LeafNode(1, 1, 1))
          .assoc(0, new LeafNode(2, 2, 2))
          .assoc(0, new LeafNode(A, A, A))
          .assoc(0, new LeafNode(B, B, B))

        var removed = source.without(B);

        expect(removed.lookup(0, B, B)).to.not.exists;
        expect(removed.lookup(0, 1, 1)).to.exist.and.have.property('value').that.equals(1);
        expect(removed.lookup(0, 2, 2)).to.exist.and.have.property('value').that.equals(2);
        expect(removed.lookup(0, A, A)).to.exist.and.have.property('value').that.equals(A);
      });
    });
  });
});

