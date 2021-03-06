var find = require('./common').find;

function HashCollisionNode(hcode, children) {
  this.hcode = hcode;
  this.children = children;
  this.isLeaf = false;
}

HashCollisionNode.prototype.assoc = function(shift, leaf) {
  return new HashCollisionNode(this.hcode, this.children.concat(leaf));
};

HashCollisionNode.prototype.without = function(shift, hcode, key) {
  if (this.children.length === 2 && this.children[0].key === key) {
    return this.children[1];
  }

  if (this.children.length === 2 && this.children[1].key === key) {
    return this.children[0];
  }

  return new HashCollisionNode(this.hcode, this.children.filter(function(child) {
    return child.key !== key;
  }));
};

HashCollisionNode.prototype.lookup = function(shift, hcode, key) {
  return find(this.children, function(child) {
    return child.key === key;
  });
};

HashCollisionNode.prototype.reduce = function(fn, init) {
  var acc = init,
      len = this.children.length,
      i = -1;

  while(++i < len) {
    acc = fn(acc, this.children[i].value);
  }

  return acc;
};

HashCollisionNode.prototype.kvreduce = function(fn, init) {
  var acc = init,
      len = this.children.length,
      i = -1;

  while(++i < len) {
    var c = this.children[i];
    acc = fn(acc, c.key, c.value);
  }

  return acc;
};

module.exports = HashCollisionNode;