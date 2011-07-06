// stolen from jsdom.


/*
 ServerJS Javascript DOM Level 1
 */
var core = {
    
mapper: function(parent, filter, recursive) {
    return function() {
        return core.mapDOMNodes(parent, recursive !== false, filter);
    };
},
    
    // Returns Array
    mapDOMNodes : function(parent, recursive, callback) {
        function visit(parent, result) {
            return parent.childNodes.toArray().reduce(reducer, result);
        }
        
        function reducer(array, child) {
            if (callback(child)) {
                array.push(child);
            }
            if (recursive && child._childNodes) {
                visit(child, array);
            }
            return array;
        }
        
        return visit(parent, []);
    },
    
visitTree: function(root, callback) {
    var cur = root; // TODO: Unroll this.
    
    function visit(el) {
        if (el) {
            callback(el);
            if (el._childNodes) {
                var i        = 0,
                children = el._childNodes,
                l        = children.length;
                
                for (i; i<l; i++) {
                    visit(children[i]);
                }
            }
        }
    }
    visit(root);
},
    
markTreeReadonly: function(node) {
    function markLevel(el) {
        el._readonly = true;
        // also mark attributes and their children read-only
        if (el.attributes) {
            var attributes = el.attributes, l = attributes.length, i=0;
            attributes._readonly = true;
            
            for (i; i<l; i++) {
                core.visitTree(attributes[i], markLevel);
            }
        }
    }
    
    core.visitTree(node, markLevel);
}
};

// ExceptionCode
var INDEX_SIZE_ERR              = core.INDEX_SIZE_ERR              = 1,
DOMSTRING_SIZE_ERR          = core.DOMSTRING_SIZE_ERR          = 2,
HIERARCHY_REQUEST_ERR       = core.HIERARCHY_REQUEST_ERR       = 3,
WRONG_DOCUMENT_ERR          = core.WRONG_DOCUMENT_ERR          = 4,
INVALID_CHARACTER_ERR       = core.INVALID_CHARACTER_ERR       = 5,
NO_DATA_ALLOWED_ERR         = core.NO_DATA_ALLOWED_ERR         = 6,
NO_MODIFICATION_ALLOWED_ERR = core.NO_MODIFICATION_ALLOWED_ERR = 7,
NOT_FOUND_ERR               = core.NOT_FOUND_ERR               = 8,
NOT_SUPPORTED_ERR           = core.NOT_SUPPORTED_ERR           = 9,
INUSE_ATTRIBUTE_ERR         = core.INUSE_ATTRIBUTE_ERR         = 10,

// Node Types
ELEMENT_NODE                = 1,
ATTRIBUTE_NODE              = 2,
TEXT_NODE                   = 3,
CDATA_SECTION_NODE          = 4,
ENTITY_REFERENCE_NODE       = 5,
ENTITY_NODE                 = 6,
PROCESSING_INSTRUCTION_NODE = 7,
COMMENT_NODE                = 8,
DOCUMENT_NODE               = 9,
DOCUMENT_TYPE_NODE          = 10,
DOCUMENT_FRAGMENT_NODE      = 11,
NOTATION_NODE               = 12;

var messages = core.exceptionMessages = { };
messages[INDEX_SIZE_ERR]              = "Index size error";
messages[DOMSTRING_SIZE_ERR]          = "DOMString size error";
messages[HIERARCHY_REQUEST_ERR]       = "Hierarchy request error";
messages[WRONG_DOCUMENT_ERR]          = "Wrong document";
messages[INVALID_CHARACTER_ERR]       = "Invalid character";
messages[NO_DATA_ALLOWED_ERR]         = "No data allowed";
messages[NO_MODIFICATION_ALLOWED_ERR] = "No modification allowed";
messages[NOT_FOUND_ERR]               = "Not found";
messages[NOT_SUPPORTED_ERR]           = "Not supported";
messages[INUSE_ATTRIBUTE_ERR]         = "Attribute in use";

core.DOMException = function(code, message) {
    this.code = code;
    Error.call(this, core.exceptionMessages[code]);
    this.message = core.exceptionMessages[code];
    if(message) this.message = this.message + ": " + message;
    if(Error.captureStackTrace) Error.captureStackTrace(this, core.DOMException);
};

core.DOMException.INDEX_SIZE_ERR              = INDEX_SIZE_ERR;
core.DOMException.DOMSTRING_SIZE_ERR          = DOMSTRING_SIZE_ERR;
core.DOMException.HIERARCHY_REQUEST_ERR       = HIERARCHY_REQUEST_ERR;
core.DOMException.WRONG_DOCUMENT_ERR          = WRONG_DOCUMENT_ERR;
core.DOMException.INVALID_CHARACTER_ERR       = INVALID_CHARACTER_ERR;
core.DOMException.NO_DATA_ALLOWED_ERR         = NO_DATA_ALLOWED_ERR;
core.DOMException.NO_MODIFICATION_ALLOWED_ERR = NO_MODIFICATION_ALLOWED_ERR;
core.DOMException.NOT_FOUND_ERR               = NOT_FOUND_ERR;
core.DOMException.NOT_SUPPORTED_ERR           = NOT_SUPPORTED_ERR;
core.DOMException.INUSE_ATTRIBUTE_ERR         = INUSE_ATTRIBUTE_ERR;

core.DOMException.prototype = {
    INDEX_SIZE_ERR              : INDEX_SIZE_ERR,
    DOMSTRING_SIZE_ERR          : DOMSTRING_SIZE_ERR,
    HIERARCHY_REQUEST_ERR       : HIERARCHY_REQUEST_ERR,
    WRONG_DOCUMENT_ERR          : WRONG_DOCUMENT_ERR,
    INVALID_CHARACTER_ERR       : INVALID_CHARACTER_ERR,
    NO_DATA_ALLOWED_ERR         : NO_DATA_ALLOWED_ERR,
    NO_MODIFICATION_ALLOWED_ERR : NO_MODIFICATION_ALLOWED_ERR,
    NOT_FOUND_ERR               : NOT_FOUND_ERR,
    NOT_SUPPORTED_ERR           : NOT_SUPPORTED_ERR,
    INUSE_ATTRIBUTE_ERR         : INUSE_ATTRIBUTE_ERR
};

core.DOMException.prototype.__proto__ = Error.prototype;

core.NodeList = function NodeList(element, query) {
    this._element = element;
    this._query = query;
    this._version = -1;
    this.update();
};
core.NodeList.prototype = {
update: function() {
    if (this._version < this._element._version) {
        for (var i = 0; i < this._length; i++) {
            this[i] = undefined;
        }
        var nodes = this._snapshot = this._query();
        this._length = nodes.length;
        for (var i = 0; i < nodes.length; i++) {
            this[i] = nodes[i];
        }
        this._version = this._element._version;
    }
    return this._snapshot;
},
toArray: function() {
    return this.update();
},
    get length() {
        this.update();
        return this._length;
    },
item: function(index) {
    this.update();
    return this[index] || null;
},
toString: function() {
    return '[ jsdom NodeList ]: contains ' + this.length + ' items';
},
indexOf: function(node) {
    var len = this.update().length;
    
    for (var i = 0; i < len; i++) {
        if (this[i] == node) {
            return i;
        }
    }
    
    return -1; // not found
}
};

core.DOMImplementation = function DOMImplementation(document, /* Object */ features) {
    this._ownerDocument = document;
    this._features = {};
    
    if (features) {
        for (var feature in features) {
            if (features.hasOwnProperty(feature)) {
                this.addFeature(feature.toLowerCase(), features[feature]);
            }
        }
    }
};

core.DOMImplementation.prototype = {
    get ownerDocument() { return this._ownerDocument },
    removeFeature : function(feature, version) {
        feature = feature.toLowerCase();
        if (this._features[feature]) {
            if (version) {
                var j        = 0,
                versions = this._features[feature],
                l        = versions.length;
                
                for (j; j<l; j++) {
                    if (versions[j] === version) {
                        versions.splice(j,1);
                        return;
                    }
                }
            } else {
                delete this._features[feature];
            }
        }
    },
    
addFeature: function(feature, version) {
    feature = feature.toLowerCase();
    
    if (version) {
        
        if (!this._features[feature]) {
            this._features[feature] = [];
        }
        
        if (version instanceof Array) {
            Array.prototype.push.apply(this._features[feature], version);
        } else {
            this._features[feature].push(version);
        }
    }
},
    
hasFeature: function(/* string */ feature, /* string */ version) {
    feature = (feature) ? feature.toLowerCase() : '';
    var versions = (this._features[feature]) ?
    this._features[feature]  :
    false;
    
    if (!version && versions.length && versions.length > 0) {
        return true;
    } else if (typeof versions === 'string') {
        return versions === version;
    } else if (versions.indexOf && versions.length > 0) {
        return versions.indexOf(version) !== -1;
    } else {
        return false;
    }
}
};


var attrCopy = function(src, dest, fn) {
    if (src.attributes) {
        var attrs = src.attributes, i, l = attrs.length, attr, copied;
        for (i=0;i<l;i++) {
            attr = attrs[i];
            // skip over default attributes
            if (!attr.specified) {
                continue;
            }
            // TODO: consider duplicating this code and moving it into level2/core
            if (attr.namespaceURI) {
                dest.setAttributeNS(attr.namespaceURI,
                                    attr.nodeName,
                                    attr.nodeValue);
                var localName = attr.nodeName.split(':').pop();
                copied = dest.getAttributeNodeNS(attr.namespaceURI, localName);
            } else {
                dest.setAttribute(attr.nodeName, attr.nodeValue);
                copied = dest.getAttributeNode(attr.nodeName);
            }
            if (typeof fn == "function") {
                fn(attr, copied);
            }
            
        }
    }
    return dest;
};

core.Node = function Node(ownerDocument) {
    var self = this;
    
    this._childNodes = [];
    this._ownerDocument = ownerDocument;
    this._attributes = new core.AttrNodeMap(ownerDocument, this);
    
    this._childrenList = new core.NodeList(this, function() {
                                           return self._childNodes.filter(function(node) {
                                                                          return node.tagName;
                                                                          });
                                           });
    
    this._childNodesList = new core.NodeList(this, function() {
                                             return self._childNodes;
                                             });
    
    this._version = 0;
    this._nodeValue = null;
    this._parentNode = null;
    this._nodeName = null;
    this._readonly = false;
};

core.Node.ELEMENT_NODE                = ELEMENT_NODE;
core.Node.ATTRIBUTE_NODE              = ATTRIBUTE_NODE;
core.Node.TEXT_NODE                   = TEXT_NODE;
core.Node.CDATA_SECTION_NODE          = CDATA_SECTION_NODE;
core.Node.ENTITY_REFERENCE_NODE       = ENTITY_REFERENCE_NODE;
core.Node.ENTITY_NODE                 = ENTITY_NODE;
core.Node.PROCESSING_INSTRUCTION_NODE = PROCESSING_INSTRUCTION_NODE;
core.Node.COMMENT_NODE                = COMMENT_NODE;
core.Node.DOCUMENT_NODE               = DOCUMENT_NODE;
core.Node.DOCUMENT_TYPE_NODE          = DOCUMENT_TYPE_NODE;
core.Node.DOCUMENT_FRAGMENT_NODE      = DOCUMENT_FRAGMENT_NODE;
core.Node.NOTATION_NODE               = NOTATION_NODE;

core.Node.prototype = {
_attributes: null,
_childNodes: null,
_childNodesList: null,
_childrenList: null,
_version: 0,
_nodeValue: null,
_parentNode: null,
_ownerDocument: null,
_attributes: null,
_nodeName: null,
_readonly: false,
style: null,
    ELEMENT_NODE                : ELEMENT_NODE,
    ATTRIBUTE_NODE              : ATTRIBUTE_NODE,
    TEXT_NODE                   : TEXT_NODE,
    CDATA_SECTION_NODE          : CDATA_SECTION_NODE,
    ENTITY_REFERENCE_NODE       : ENTITY_REFERENCE_NODE,
    ENTITY_NODE                 : ENTITY_NODE,
    PROCESSING_INSTRUCTION_NODE : PROCESSING_INSTRUCTION_NODE,
    COMMENT_NODE                : COMMENT_NODE,
    DOCUMENT_NODE               : DOCUMENT_NODE,
    DOCUMENT_TYPE_NODE          : DOCUMENT_TYPE_NODE,
    DOCUMENT_FRAGMENT_NODE      : DOCUMENT_FRAGMENT_NODE,
    NOTATION_NODE               : NOTATION_NODE,
    
    get children() {
        return this._childrenList;
    },
    get nodeValue() {
        return this._nodeValue;
    },
    set nodeValue(value) {
        // readonly
        if (this._readonly === true) {
            throw new core.DOMException(NO_MODIFICATION_ALLOWED_ERR, 'Attempting to modify a read-only node');
        }
        
        this._nodeValue = value;
    },
    get parentNode() { return this._parentNode;},
    
    get nodeName() {
        var name = this._nodeName || this._tagName;
        if (this.nodeType === ELEMENT_NODE &&
            this._ownerDocument                  &&
            this._ownerDocument._doctype          &&
            this._ownerDocument._doctype.name.toLowerCase().indexOf("html") !== -1)
        {
            return name.toUpperCase();
        }
        return name;
    },
    set nodeName() { throw new core.DOMException();},
    get attributes() { return this._attributes;},
    get firstChild() {
        return this._childNodes.length > 0 ? this._childNodes[0] : null;
    },
    set firstChild() { throw new core.DOMException();},
    get ownerDocument() { return this._ownerDocument;},
    get readonly() { return this._readonly;},
    
    get lastChild() {
        var len = this._childNodes.length;
        return len > 0 ? this._childNodes[len -1] : null;
    },
    set lastChild() { throw new core.DOMException();},
    
    get childNodes() {
        return this._childNodesList;
    },
    set childNodes() { throw new core.DOMException();},
    
_indexOf: function(/*Node*/ child) {
    if (!this._childNodes ||
        !this._childNodes.length) {
        return -1;
    }
    
    var currentNode, index = 0, children = this._childNodes;
    
    while ((currentNode = children[index])) {
        if (currentNode == child) {
            break;
        }
        index++;
    }
    
    if (currentNode == child) {
        return index;
    }
    return -1;
},
    
    get nextSibling() {
        // find this node's index in the parentNode, add one and call it a day
        if (!this._parentNode || !this._parentNode._indexOf) {
            return null;
        }
        
        var index = this._parentNode._indexOf(this);
        
        if (index == -1 || index+1 >= this._parentNode._childNodes.length) {
            return null;
        }
        
        return this._parentNode._childNodes[index+1] || null;
    },
    set nextSibling() { throw new core.DOMException();},
    
    get previousSibling() {
        if (!this._parentNode || !this._parentNode._indexOf) {
            return null;
        }
        
        var index = this._parentNode._indexOf(this);
        
        if (index == -1 || index-1 < 0) {
            return null;
        }
        
        return this._parentNode._childNodes[index-1] || null;
    },
    set previousSibling() { throw new core.DOMException();},
    
    /* returns Node */
    insertBefore :  function(/* Node */ newChild, /* Node*/ refChild) {
        if (this._readonly === true) {
            throw new core.DOMException(NO_MODIFICATION_ALLOWED_ERR, 'Attempting to modify a read-only node');
        }
        
        // Adopt unowned children, for weird nodes like DocumentType
        if (!newChild._ownerDocument) newChild._ownerDocument = this._ownerDocument;
        
        // TODO - if (!newChild) then?
        if (newChild._ownerDocument !== this._ownerDocument) {
            throw new core.DOMException(WRONG_DOCUMENT_ERR);
        }
        
        if (newChild.nodeType && newChild.nodeType === ATTRIBUTE_NODE) {
            throw new core.DOMException(HIERARCHY_REQUEST_ERR);
        }
        
        // search for parents matching the newChild
        var current = this;
        do {
            if (current === newChild) {
                throw new core.DOMException(HIERARCHY_REQUEST_ERR);
            }
        } while((current = current._parentNode));
        
        // fragments are merged into the element
        if (newChild.nodeType === DOCUMENT_FRAGMENT_NODE) {
            var tmpNode;
            while (newChild._childNodes.length > 0) {
                tmpNode = newChild.removeChild(newChild.firstChild);
                this.insertBefore(tmpNode, refChild);
            }
        } else {
            // if the newChild is already in the tree elsewhere, remove it first
            if (newChild._parentNode) {
                newChild._parentNode.removeChild(newChild);
            }
            
            if (refChild == null) {
                var refChildIndex = this._childNodes.length;
            } else {
                var refChildIndex = this._indexOf(refChild);
                if (refChildIndex == -1) {
                    throw new core.DOMException(NOT_FOUND_ERR);
                }
            }
            
            this._childNodes.splice(refChildIndex, 0, newChild);
            newChild._parentNode = this;
            if (newChild._addIds) {
                newChild._addIds();
            }
            
            this._modified();
        }
        
        return newChild;
    }, // raises(DOMException);
    
_modified: function() {
    this._version++;
    if (this._ownerDocument) {
        this._ownerDocument._version++;
    }
    
    this._childrenList.update();
    this._childNodesList.update();
},
    
    /* returns Node */
    replaceChild : function(/* Node */ newChild, /* Node */ oldChild){
        this.insertBefore(newChild, oldChild);
        return this.removeChild(oldChild);
    }, //raises(DOMException);
    
    /* returns void */
    _addIds : function(){
        if (this.id) {
            if (this._ownerDocument._ids) {
                this._ownerDocument._ids[this.id] = this;
            }
        }
        for (var i=0;i<this._childNodes.length;i++) {
            if (this._childNodes[i]._addIds) {
                this._childNodes[i]._addIds();
            }
        }
    },
    /* returns void */
    _removeIds : function(){
        if (this.id) {
            if (this._ownerDocument._ids) {
                this._ownerDocument._ids[this.id] = null;
                delete this._ownerDocument._ids[this.id];
            }
        }
        for (var i=0;i<this._childNodes.length;i++) {
            this._childNodes[i]._removeIds();
        }
    },
    
    /* returns Node */
    removeChild : function(/* Node */ oldChild){
        if (this._readonly === true) {
            throw new core.DOMException(NO_MODIFICATION_ALLOWED_ERR);
        }
        
        // TODO - if (!oldChild) then?
        var oldChildIndex = this._indexOf(oldChild);
        if (oldChildIndex == -1) {
            throw new core.DOMException(NOT_FOUND_ERR);
        }
        
        this._childNodes.splice(oldChildIndex, 1);
        oldChild._parentNode = null;
        this._modified();
        oldChild._removeIds();
        return oldChild;
    }, // raises(DOMException);
    
    /* returns Node */
    appendChild : function(/* Node */ newChild) {
        return this.insertBefore(newChild, null);
    }, // raises(DOMException);
    
    /* returns boolean */
    hasChildNodes : function() {
        return this._childNodes.length > 0;
    },
    
    /* returns Node */
    cloneNode : function(/* bool */ deep, fn) {
        
        var object = null;
        switch (this.nodeType) {
                
            case this.ELEMENT_NODE:
                object = attrCopy(this,this._ownerDocument.createElement(this.tagName), fn);
                break;
                
            case this.TEXT_NODE:
                object = attrCopy(this,this._ownerDocument.createTextNode(this.tagName));
                object.nodeValue = this.nodeValue;
                break;
            case this.CDATA_SECTION_NODE:
                object = this._ownerDocument.createCDATASection(this.tagName);
                object.nodeValue = this.nodeValue;
                break;
            case this.ENTITY_REFERENCE_NODE:
                var name = (this._entity) ? this._entity.name : this._entityName,
                ref  = this._ownerDocument.createEntityReference(name);
                
                object = attrCopy(this, ref);
                object.nodeValue = this.nodeValue;
                break;
            case this.ATTRIBUTE_NODE:
                object = this._ownerDocument.createAttribute(this.name);
                break;
            case this.ENTITY_NODE:
                var entity = this._ownerDocument.createEntityNode(this.name);
                object = attrCopy(this, entity);
                object.nodeValue = this.nodeValue;
                object._publicId = this._publicId;
                object._systemId = this._systemId;
                object._notationName = this.notationName;
                break;
            case this.PROCESSING_INSTRUCTION_NODE:
                var pi = this._ownerDocument.createProcessingInstruction(this._target,
                                                                         this._data);
                object = attrCopy(this, pi);
                object.nodeValue = this.nodeValue;
                break;
            case this.COMMENT_NODE:
                object = this._ownerDocument.createComment(this.tagName);
                object.nodeValue = this.nodeValue;
                break;
            case this.DOCUMENT_NODE:
                object = attrCopy(this, new core.Document());
                // TODO: clone the doctype/entities/notations/etc?
                break;
            case this.DOCUMENT_TYPE_NODE:
                object = attrCopy(this, new core.DocumentType());
                object.nodeValue = this.nodeValue;
                break;
            case this.DOCUMENT_FRAGMENT_NODE:
                object = this._ownerDocument.createDocumentFragment();
                break;
            case this.NOTATION_NODE:
                object = this._ownerDocument.createNotationNode(this._name,
                                                                this._publicId,
                                                                this._systemId);
                object = attrCopy(this,object);
                object.nodeValue = this.nodeValue;
                break;
            default:
                throw new core.DOMException(NOT_FOUND_ERR);
                break;
        }
        
        if (typeof fn === "function") {
            fn(this, object);
        }
        
        if (deep || this.nodeType === ATTRIBUTE_NODE) {
            var clone = null;
            for (var i=0,len=this._childNodes.length;i<len;i++)
            {
                clone = this._childNodes[i].cloneNode(true);
                if (clone.nodeType === ATTRIBUTE_NODE) {
                    object.setAttributeNode(clone);
                } else {
                    var readonly = object._readonly;
                    object._readonly = false;
                    object.appendChild(clone);
                    object._readonly = readonly;
                }
            }
        }
        
        return object;
    },
    
    /* returns void */
normalize: function() {
    var prevChild, child, attr,i;
    
    if (this._attributes && this._attributes.length) {
        for (i=0;i<this._attributes.length;i++)
        {
            if (this._attributes.item(i)) {
                attr = this._attributes.item(i).normalize();
            }
        }
    }
    
    for (i=0;i<this._childNodes.length;i++)
    {
        child = this._childNodes[i];
        
        if (child.normalize) {
            child.normalize();
        }
        
        // Level2/core clean off empty nodes
        if (child.value === "") {
            this.removeChild(child);
            i--;
            continue;
        }
        
        if (i>0) {
            prevChild = this._childNodes[i-1];
            
            if (child.nodeType === TEXT_NODE &&
                prevChild.nodeType === TEXT_NODE)
            {
                
                // remove the child and decrement i
                prevChild.appendData(child.value);
                
                this.removeChild(child);
                i--;
            }
        }
    }
},
toString: function() {
    var id = '';
    if (this.id) {
        id = '#' + this.id;
    }
    if (this.className) {
        var classes = this.className.split(/\s+/);
        for (var i = 0, len = classes.length; i < len; i++) {
            id += '.' + classes[i];
        }
    }
    return '[ ' + this.tagName + id + ' ]';
},
trigger: function(type, message, data) {
    var text = type + ": " + message;
    if (data) text += " - More:\n" + data;
    console.log(text);
}
};


core.NamedNodeMap = function NamedNodeMap(document) {
    this._nodes = {};
    this._nsStore = {};
    this.length = 0;
    this._ownerDocument = document;
    this._readonly = false;
};
core.NamedNodeMap.prototype = {
    get readonly() { return this._readonly;},
    get ownerDocument() { this._ownerDocument;},
    
    exists : function(name) {
        return (this._nodes[name] || this._nodes[name] === null) ? true : false;
    },
    
    /* returns Node */
getNamedItem: function(/* string */ name) {
    return this._nodes[name] || null;
},
    
    /* returns Node */
setNamedItem: function(/* Node */ arg) {
    
    // readonly
    if (this._readonly === true) {
        throw new core.DOMException(NO_MODIFICATION_ALLOWED_ERR);
    }
    
    // arg is from a different document
    if (arg && arg._ownerDocument !== this._ownerDocument) {
        throw new core.DOMException(WRONG_DOCUMENT_ERR);
    }
    
    // if this argument is already in use..
    if (arg && arg._parentNode) {
        throw new core.DOMException(INUSE_ATTRIBUTE_ERR);
    }
    
    var ret;
    if (!this._nodes[arg.name] || this._nodes[arg.name] === null) {
        this.length++;
        ret = null;
    } else {
        ret = this._nodes[arg.name];
    }
    arg._specified = true;
    this._nodes[arg.name] = arg;
    return ret;
}, // raises: function(DOMException) {},
    
    /* returns Node */
removeNamedItem: function(/* string */ name) {
    
    // readonly
    if (this._readonly === true) {
        throw new core.DOMException(NO_MODIFICATION_ALLOWED_ERR);
    }
    
    if (!this._nodes.hasOwnProperty(name)) {
        throw new core.DOMException(NOT_FOUND_ERR);
    }
    
    var prev = this._nodes[name] || null;
    this._nodes[name] = null;
    delete this._nodes[name];
    
    this.length--;
    return prev;
}, // raises: function(DOMException) {},
    
    /* returns Node */
item: function(/* int */ index) {
    var current = 0;
    for (var member in this._nodes) {
        if (this._nodes.hasOwnProperty(member)) {
            if (current === index && this._nodes[member]) {
                return this._nodes[member];
            }
            current++;
        }
    }
    return null;
}
};

core.AttrNodeMap = function AttrNodeMap(document, parentNode) {
    core.NamedNodeMap.call(this, document);
    this._parentNode = parentNode;
};
core.AttrNodeMap.prototype = {
    get parentNode() { return this._parentNode;},
    
    /* returns Node */
setNamedItem: function(/* Node */ arg) {
    var prev = core.NamedNodeMap.prototype.setNamedItem.call(this, arg);
    
    arg._parentNode = this._parentNode;
    this._parentNode._modified();
    return prev;
},
    
    /* returns Node */
removeNamedItem: function(/* string */ name) {
    
    var prev = core.NamedNodeMap.prototype.removeNamedItem.call(this, name);
    prev._parentNode = null;
    this._parentNode._modified();
    
    var doc = this._ownerDocument;
    
    // set default value if available
    if (doc && doc._doctype && doc._doctype.name.toLowerCase() !== "html") {
        var defaultValue = false,
        elem         = doc._doctype._attributes
        .getNamedItem(this._parentNode.nodeName);
        
        if (elem) {
            var defaultValue = elem.attributes.getNamedItem(name);
            
            if (defaultValue) {
                var attr = doc.createAttribute(name);
                attr.value = defaultValue.value;
                attr._specified = false;
                this._nodes[name] = attr;
                this.length++;
            }
        }
    }
    return prev;
}, // raises: function(DOMException) {},
};
core.AttrNodeMap.prototype.__proto__ = core.NamedNodeMap.prototype;

core.NotationNodeMap = function NotationNodeMap(document) {
    core.NamedNodeMap.call(this, document);
    this._readonly = false;
    for (var i=1;i<arguments.length;i++) {
        this.setNamedItem(arguments[i]);
    }
    this._readonly = true;
};
core.NotationNodeMap.prototype = {};
core.NotationNodeMap.prototype.__proto__ = core.NamedNodeMap.prototype;

core.EntityNodeMap = function EntityNodeMap(document) {
    core.NamedNodeMap.call(this,document);
    this._readonly = false;
    var i = 1, l = arguments.length;
    
    for (i=1; i<l; i++) {
        this.setNamedItem(arguments[i]);
    }
    core.markTreeReadonly(this);
};
core.EntityNodeMap.prototype = {};
core.EntityNodeMap.prototype.__proto__ = core.NamedNodeMap.prototype;


core.Element = function Element(document, tagName) {
    this._ownerDocument = document;
    core.Node.call(this, document);
    this._nodeName = tagName;
    this._tagName = tagName;
};

core.Element.prototype = {
    
    get nodeValue() { return null;},
    set nodeValue(value) { /* do nothing */ },
    get tagName() {
        if (this.nodeType === ELEMENT_NODE &&
            this._ownerDocument                  &&
            this._ownerDocument._doctype          &&
            this._ownerDocument._doctype.name.toLowerCase().indexOf("html") !== -1)
        {
            return this.nodeName.toUpperCase();
        }
        return this.nodeName;
    },
    nodeType : ELEMENT_NODE,
    get attributes() {
        for(var i=0; i<this._attributes.length; i++) {
            this._attributes[i] = this._attributes.item(i);
        }
        return this._attributes;
    },
    
    get name() { return this.nodeName;},
    /* returns string */
getAttribute: function(/* string */ name) {
    var attribute = this._attributes.getNamedItem(name);
    if (attribute) {
        return attribute.value;
    }
    return "";
},
    
    /* returns string */
setAttribute: function(/* string */ name, /* string */ value) {
    if (this._ownerDocument) {
        var attr = this._ownerDocument.createAttribute(name);
        attr.value = value;
        attr._ownerElement = this;
        
        this._attributes.setNamedItem(attr);
    }
    
    if (name === 'id') {
        if (this._addIds) {
            this._addIds();
        }
    }
}, //raises: function(DOMException) {},
    
    /* returns string */
removeAttribute: function(/* string */ name) {
    if (!this._attributes.exists(name)) {
        return;
    }
    
    this._attributes.removeNamedItem(name);
}, // raises: function(DOMException) {},
    
    /* returns Attr */
getAttributeNode: function(/* string */ name) {
    return this._attributes.getNamedItem(name);
},
    
    /* returns Attr */
setAttributeNode: function(/* Attr */ newAttr) {
    var prevNode = this._attributes.getNamedItem(newAttr.name);
    if (prevNode) {
        prevNode._parentNode = null;
    }
    
    this._attributes.setNamedItem(newAttr);
    
    return (prevNode && prevNode.specified) ? prevNode : null;
}, //  raises: function(DOMException) {},
    
    /* returns Attr */
removeAttributeNode: function(/* Attr */ oldAttr) {
    var existingAttr = this._attributes.getNamedItem(oldAttr.name);
    
    if (this._attributes && existingAttr === oldAttr) {
        this._attributes.removeNamedItem(oldAttr.name);
        return oldAttr;
    }
    
    throw new core.DOMException(NOT_FOUND_ERR);
}, //raises: function(DOMException) {},
    
    /* returns NodeList */
getElementsByTagName: function(/* string */ name) {
    name = name.toLowerCase();
    
    function filterByTagName(child) {
        child = (child.nodeType === ENTITY_REFERENCE_NODE) ?
        child._entity                             :
        child;
        
        if (child.nodeName && child.nodeType === ELEMENT_NODE) {
            return name === "*" || (child.nodeName.toLowerCase() === name);
        }
        
        return false;
    }
    return new core.NodeList(this._ownerDocument || this, core.mapper(this, filterByTagName, true));
},
};
core.Element.prototype.__proto__ = core.Node.prototype;

core.DocumentFragment = function DocumentFragment(document) {
    core.Node.call(this, document);
    this._nodeName = this._tagName = "#document-fragment";
};
core.DocumentFragment.prototype = {
    nodeType : DOCUMENT_FRAGMENT_NODE,
    get nodeValue() { return null;},
    set nodeValue() { /* do nothing */ },
    get attributes() { return null;}
};
core.DocumentFragment.prototype.__proto__ = core.Node.prototype;

core.ProcessingInstruction = function ProcessingInstruction(document, target, data) {
    this._ownerDocument = document;
    core.Node.call(this, document);
    this._nodeName = target;
    this._tagName = target;
    this._target = target;
    this._nodeValue = data;
}
core.ProcessingInstruction.prototype = {
    nodeType : PROCESSING_INSTRUCTION_NODE,
    get target() { return this._target;},
    set target(value) { throw new core.DOMException(1);},
    get nodeValue() { return this._nodeValue;},
    set nodeValue(value) { this._nodeValue = value},
    get data()   { return this._nodeValue;},
    set data()   { throw new core.DOMException(NO_MODIFICATION_ALLOWED_ERR);},
    get attributes() { return null;}
    
};
core.ProcessingInstruction.prototype.__proto__ = core.Node.prototype;

core.Document = function Document(options) {
    if (!options) {
        options = {};
    }
    else if (typeof options == 'string') {
        options = {
        name: options
        };
    }
    core.Node.call(this, "#document");
    this._nodeName = this._tagName = "#document";
    this._contentType = options.contentType || "text/xml";
    this._doctype = options._doctype;
    this._implementation = options.implementation || new (core.DOMImplementation)();
    this._documentElement = this.createElement('html');
    this._ids = {};
    this._ownerDocument = this;
    this._readonly = false;
};


var tagRegEx = /[^\w:\d_\.-]+/i;
var entRegEx = /[^\w\d_\-&;]+/;
var invalidAttrRegEx = /[^\w:\d_\.-]+/;

core.Document.prototype = {
    nodeType : DOCUMENT_NODE,
    _elementBuilders : {
        canvas : function(document, tagName) {
            var element = new core.Element(document, tagName),
            canvas;
            
            // require node-canvas and catch the error if it blows up
            try {
                canvas = new (require('canvas'))(0,0);
                for (attr in element) {
                    if (!canvas[attr]) {
                        canvas[attr] = element[attr];
                    }
                }
                return canvas;
            } catch (e) {
                return element;
            }
        }
    },
_defaultElementBuilder: function(document, tagName) {
    return new core.Element(document, tagName);
},
    get contentType() { return this._contentType;},
    get doctype() { return this._doctype || null;},
    set doctype(doctype) { this._doctype = doctype;},
    get documentElement() {
        if (this._documentElement) {
            return this._documentElement;
        } else {
            var children = this._childNodes, len = this._childNodes.length, i=0;
            for (i;i<len;i++) {
                if (children[i].nodeType === ELEMENT_NODE) {
                    this._documentElement = children[i];
                    return children[i];
                }
            }
            return null;
        }
    },
    
    get implementation() { return this._implementation;},
    set implementation(implementation) { this._implementation = implementation;},
    get nodeName() { return '#document'; },
    get tagName() {
        return null;
    },
    get nodeValue() { return null; },
    set nodeValue() { /* noop */ },
    get attributes() { return null;},
    get ownerDocument() { return null;},
    get readonly() { return this._readonly;},
    /* returns Element */
createElement: function(/* string */ tagName) {
    var c = [], lower = tagName.toLowerCase(), element;
    
    if (!tagName || !tagName.match || (c = tagName.match(tagRegEx))) {
        throw new core.DOMException(INVALID_CHARACTER_ERR, 'Invalid character in tag name: ' + c.pop());
    }
    
    element = (this._elementBuilders[lower] || this._defaultElementBuilder)(this, tagName);
    
    // Check for and introduce default elements
    if (this._doctype && this._doctype._attributes && this._doctype.name.toLowerCase() !== "html") {
        var attrElement = this._doctype._attributes.getNamedItem(tagName);
        if (attrElement && attrElement._childNodes) {
            
            attrs = attrElement.attributes;
            var attr, len = attrs.length, defaultAttr;
            for (var i = 0; i < len; i++) {
                defaultAttr = attrs.item(i);
                if (defaultAttr) {
                    attr = this.createAttribute(defaultAttr.name);
                    attr.value = defaultAttr.value;
                    element.setAttributeNode(attr);
                    attr._specified = false;
                }
            }
        }
    }
    
    element._created = true;
    return element;
}, //raises: function(DOMException) {},
    
    /* returns DocumentFragment */
createDocumentFragment: function() {
    return new core.DocumentFragment(this);
},
    
    /* returns Text */
createTextNode: function(/* string */ data) {
    return new core.Text(this,data);
},
    
    /* returns Comment */
createComment: function(/* string */ data) {
    return new core.Comment(this,data);
},
    
    /* returns CDATASection */
createCDATASection: function(/* string */ data) {
    if (this._doctype && this._doctype.name === "html") {
        throw new core.DOMException(NOT_SUPPORTED_ERR);
    }
    
    return new core.CDATASection(this,data);
}, // raises: function(DOMException) {},
    
    /* returns ProcessingInstruction */
createProcessingInstruction: function(/* string */ target,/* string */ data) {
    
    if (this._doctype && this._doctype.name === "html") {
        throw new core.DOMException(NOT_SUPPORTED_ERR);
    }
    
    if (target.match(tagRegEx) || !target || !target.length) {
        throw new core.DOMException(INVALID_CHARACTER_ERR);
    }
    
    return new core.ProcessingInstruction(this, target, data);
}, // raises: function(DOMException) {},
    
    /* returns Attr */
createAttribute: function(/* string */ name) {
    if (!name || !name.length || name.match(invalidAttrRegEx) ) {
        throw new core.DOMException(INVALID_CHARACTER_ERR, "attribute name: " + name);
    }
    return new core.Attr(this, name,false);
}, // raises: function(DOMException) {},
    
    /* returns EntityReference */
createEntityReference: function(/* string */ name) {
    
    if (this._doctype && this._doctype.name === "html") {
        throw new core.DOMException(NOT_SUPPORTED_ERR);
    }
    
    name = name.replace(/[&;]/g,"");
    if (!name || !name.length) {
        throw new core.DOMException(INVALID_CHARACTER_ERR);
    }
    
    if (name.match(tagRegEx)) {
        throw new core.DOMException(INVALID_CHARACTER_ERR);
    }
    
    var entity;
    if (this._doctype && this._doctype.entities) {
        entity = this._doctype.entities.getNamedItem(name);
    } else {
        entity = null;
    }
    
    var ref    = new core.EntityReference(this, entity);
    
    ref._entityName = name;
    
    return ref;
}, //raises: function(DOMException) {},
    
    /* returns Entity */
    createEntityNode : function(/* string */ name)
    {
        
        if (name.match(entRegEx) || !name || !name.length) {
            throw new core.DOMException(INVALID_CHARACTER_ERR);
        }
        
        var ret = new core.Entity(this, name);
        ret._readonly = false;// TODO: fix me please.
        
        for (var i=1;i<arguments.length;i++)
        {
            ret.appendChild(arguments[i]);
        }
        
        core.markTreeReadonly(ret);
        
        return ret;
    },
    
    /* returns Notation */
    createNotationNode : function(/* string */ name,/* string */ publicId,/* string */ systemId)
    {
        
        if (name.match(entRegEx) || !name || !name.length) {
            throw new core.DOMException(INVALID_CHARACTER_ERR);
        }
        
        var ret = new core.Notation(this, name, publicId, systemId);
        ret._readonly = false;// TODO: fix me please.
        
        for (var i=3;i<arguments.length;i++)
        {
            ret.appendChild(arguments[i]);
        }
        
        core.markTreeReadonly(ret);
        
        return ret;
    },
    
    appendChild : function(/* Node */ arg) {
        if (this.documentElement && arg.nodeType == ELEMENT_NODE) {
            throw new core.DOMException(HIERARCHY_REQUEST_ERR);
        }
        return core.Node.prototype.appendChild.call(this, arg);
    },
    
    removeChild : function(/* Node */ arg) {
        var ret = core.Node.prototype.removeChild.call(this, arg);
        if (arg == this._documentElement) {
            this._documentElement = null;// force a recalculation
        }
        return ret;
    },
    
    /* returns NodeList */
getElementsByTagName: function(/* string */ name) {
    function filterByTagName(child) {
        if (child.nodeType && child.nodeType === ENTITY_REFERENCE_NODE)
        {
            child = child._entity;
        }
        
        if (child.nodeName && child.nodeType === ELEMENT_NODE)
        {
            if (name === "*") {
                return true;
                
                // case insensitivity for html
            } else if (child._ownerDocument && child._ownerDocument._doctype &&
                       //child._ownerDocument._doctype.name === "html" &&
                       child.nodeName.toLowerCase() === name.toLowerCase())
            {
                return true;
            } else if (child.nodeName.toLowerCase() === name.toLowerCase()) {
                return true;
            }
        }
        return false;
    }
    return new core.NodeList(this.documentElement || this, core.mapper(this, filterByTagName, true));
}
};
core.Document.prototype.__proto__ = core.Node.prototype;

core.CharacterData = function CharacterData(document, value) {
    core.Node.call(this, document);
    
    this._nodeValue = (value) ? value + "" : "";
};
core.CharacterData.prototype = {
    
    get data() { return this._nodeValue;},
    set data(data) {
        
        // readonly
        if (this._readonly === true) {
            throw new core.DOMException(NO_MODIFICATION_ALLOWED_ERR);
        }
        
        this._nodeValue = data;
    },
    
    /* returns int */
    get length() { return this._nodeValue.length || 0;},
    
    /* returns string */
substringData: function(/* int */ offset, /* int */ count) {
    
    if (count < 0 || offset < 0 || offset > this._nodeValue.length) {
        throw new core.DOMException(INDEX_SIZE_ERR);
    }
    
    return (this._nodeValue.length < offset + count) ?
    this._nodeValue.substring(offset) :
    this._nodeValue.substring(offset, offset+count);
    
}, // raises: function(DOMException) {},
    
    /* returns string */
appendData: function(/* string */ arg) {
    
    // readonly
    if (this._readonly === true) {
        throw new core.DOMException(NO_MODIFICATION_ALLOWED_ERR);
    }
    
    this._nodeValue+=arg;
    return this._nodeValue;
}, // raises: function(DOMException) {},
    
    /* returns string */
insertData: function(/* int */ offset, /* string */ arg) {
    
    // readonly
    if (this._readonly === true) {
        throw new core.DOMException(NO_MODIFICATION_ALLOWED_ERR);
    }
    
    if (offset < 0 || offset > this._nodeValue.length) {
        throw new core.DOMException(INDEX_SIZE_ERR);
    }
    
    var start = this._nodeValue.substring(0,offset);
    var end = this._nodeValue.substring(offset);
    
    this._nodeValue = start + arg + end;
    
}, //raises: function(DOMException) {},
    
    /* returns void */
deleteData: function(/* int */ offset, /* int */ count) {
    
    // readonly
    if (this._readonly === true) {
        throw new core.DOMException(NO_MODIFICATION_ALLOWED_ERR);
    }
    
    if (offset       < 0                     ||
        offset       > this._nodeValue.length ||
        count        < 0)
    {
        throw new core.DOMException(INDEX_SIZE_ERR);
    }
    
    var start = this._nodeValue.substring(0,offset);
    
    this._nodeValue = (offset+count<this._nodeValue.length) ?
    start + this._nodeValue.substring(offset+count) :
    start;
}, // raises: function(DOMException) {},
    
    /* returns void */
replaceData: function(/* int */ offset, /* int */ count, /* string */ arg) {
    
    // readonly
    if (this._readonly === true) {
        throw new core.DOMException(NO_MODIFICATION_ALLOWED_ERR);
    }
    
    count = (offset+count > this._nodeValue.length) ?
    this.nodeValue.length-offset           :
    count;
    
    if (offset       < 0                     ||
        offset       > this._nodeValue.length ||
        count        < 0                     /*||
                                              offset+count > this._nodeValue.length*/)
    {
        throw new core.DOMException(INDEX_SIZE_ERR);
    }
    
    var start = this._nodeValue.substring(0,offset);
    var end = this._nodeValue.substring(offset+count);
    
    this._nodeValue = start + arg + end;
} // raises: function(DOMException) {},
};
core.CharacterData.prototype.__proto__ = core.Node.prototype;


core.Attr = function Attr(document, name, value) {
    core.Node.call(this, document);
    this._nodeValue = value;
    this._name = name;
    this._specified = (value) ? true : false;
    this._tagName   = name;
    this._nodeName  = name;
};
core.Attr.prototype =  {
    nodeType : ATTRIBUTE_NODE,
    get nodeValue() {
        var val = '';
        for (var i=0,len=this._childNodes.length;i<len;i++) {
            var child = this._childNodes[i];
            if (child.nodeType === ENTITY_REFERENCE_NODE) {
                val += child.childNodes.toArray().reduce(function(prev, c) {
                                                         return prev += (c.nodeValue || c);
                                                         }, '');
            } else {
                val += child.nodeValue;
            }
        }
        return val;
    },
    set nodeValue(value) {
        // readonly
        if (this._readonly) {
            throw new core.DOMException(NO_MODIFICATION_ALLOWED_ERR);
        }
        
        this._childNodes.length = 0;
        this._childNodes.push(this._ownerDocument.createTextNode(value));
        this._modified();
        this._specified = true;
        this._nodeValue = value;
    },
    get name() { return this._name;},
    get specified() { return this._specified },
    get value() {
        return this.nodeValue;
    },
    set value(value) {
        this.nodeValue = value;
    },
    get parentNode() { return null;},
    get attributes() { return null;},
    
    insertBefore : function(/* Node */ newChild, /* Node*/ refChild){
        if (newChild.nodeType === CDATA_SECTION_NODE ||
            newChild.nodeType === ELEMENT_NODE)
        {
            throw new core.DOMException(HIERARCHY_REQUEST_ERR);
        }
        
        return core.Node.prototype.insertBefore.call(this, newChild, refChild);
    },
    
    appendChild : function(/* Node */ arg) {
        
        if (arg.nodeType === CDATA_SECTION_NODE ||
            arg.nodeType === ELEMENT_NODE)
        {
            throw new core.DOMException(HIERARCHY_REQUEST_ERR);
        }
        
        return core.Node.prototype.appendChild.call(this, arg);
    }
    
};
core.Attr.prototype.__proto__ = core.Node.prototype;

core.Text = function Text(document, text, readonly) {
    core.CharacterData.call(this, document, text);
    this._nodeName = "#text";
    this._readonly = readonly ? true : false
};
core.Text.prototype = {
    nodeType : TEXT_NODE,
    get attributes() { return null;},
    get value() { return this._nodeValue;},
    set value(value) { this.nodeValue = value;},
    
    /* returns Text */
splitText: function(offset) {
    
    // readonly
    if (this._readonly) {
        throw new core.DOMException(NO_MODIFICATION_ALLOWED_ERR);
    }
    
    if (offset < 0 || offset > this._nodeValue.length) {
        throw new core.DOMException(INDEX_SIZE_ERR);
    }
    
    var newText = this._nodeValue.substring(offset);
    this._nodeValue = this._nodeValue.substring(0, offset);
    var newNode = this._ownerDocument.createTextNode(newText);
    
    if(this._parentNode.lastChild === this) {
        this._parentNode.appendChild(newNode);
    } else {
        this._parentNode.insertBefore(newNode, this.nextSibling);
    }
    
    return newNode;
}, //raises: function(DOMException) {},
toString: function() {
    return this.nodeName;
}
};
core.Text.prototype.__proto__ = core.CharacterData.prototype


core.Comment = function Comment(document, text) {
    core.Text.call(this, document, text);
    this._nodeName = "#comment";
    this._tagName  = "#comment";
};
core.Comment.prototype = {
    nodeType : COMMENT_NODE
};
core.Comment.prototype.__proto__ = core.Text.prototype


core.CDATASection = function CDATASection(document, value) {
    core.Text.call(this, document, value);
    this._nodeName = "#cdata-section";
};
core.CDATASection.prototype = {
    nodeType : CDATA_SECTION_NODE
};
core.CDATASection.prototype.__proto__ = core.Text.prototype

core.DocumentType = function DocumentType(document, name, entities, notations, attributes) {
    core.Node.call(this, document);
    this._name = name;
    this._tagName = name;
    this._nodeName = name;
    this._entities = entities || new core.EntityNodeMap(document);
    this._notations = notations || new core.NotationNodeMap(document);
    
    core.markTreeReadonly(this._notations);
    
    this._attributes = attributes || new core.AttrNodeMap(document);
};
core.DocumentType.prototype = {
    nodeType : DOCUMENT_TYPE_NODE,
    get nodeValue() { return null;},
    set nodeValue() { /* do nothing */ },
    get name() { return this._name;},
    get entities() { return this._entities;},
    get notations() { return this._notations;},
    get attributes() { return null;}
};
core.DocumentType.prototype.__proto__ = core.Node.prototype;


core.Notation = function Notation(document, name, publicId, systemId){
    core.Node.call(this, document);
    this._name = name;
    this._nodeName = name;
    this._publicId = publicId || null;
    this._systemId = systemId || null;
    this._nodeValue = null;
};
core.Notation.prototype = {
    nodeType : NOTATION_NODE,
    get publicId() { return this._publicId;},
    get systemId() { return this._systemId;},
    get name() { return this._name || this._nodeName;},
    get attributes() { /* as per spec */ return null;},
    set nodeValue() { /* intentionally left blank */ },
    get nodeValue() { return this._nodeValue;},
};
core.Notation.prototype.__proto__ = core.Node.prototype;


core.Entity = function Entity(document, name) {
    core.Node.call(this, document);
    this._name = name;
    this._nodeName = name;
    this._tagName = name;
    this._publicId = null;
    this._systemId = null;
    this._notationName = null;
    this._readonly = true;
};
core.Entity.prototype = {
    nodeType : ENTITY_NODE,
    get nodeValue() { return null;},
    set nodeValue() {
        // readonly
        if (this._readonly === true) {
            // TODO: is this needed?
            // throw new DOMException(NO_MODIFICATION_ALLOWED_ERR);
        }
        /* do nothing */
    },
    get name() { return this._name },
    get publicId() { return this._publicId;},
    get systemId() { return this._systemId;},
    
    set publicId(publicId) { this._publicId = publicId;},
    set systemId(systemId) { this._systemId = systemId;},
    set notationName(notationName) { this._notationName = notationName;},
    
    get notationName() { return this._notationName;},
    get attributes() { return null;},
    
};
core.Entity.prototype.__proto__ = core.Node.prototype;


core.EntityReference = function EntityReference(document, entity) {
    core.Node.call(this, document);
    this._entity = entity;
    this._nodeName = (entity) ? entity.name : null;
    this._readonly = true;
};
core.EntityReference.prototype = {
    nodeType : ENTITY_REFERENCE_NODE,
    get nodeValue() { return (this._entity) ? this._entity.nodeValue : null;},
    set nodeValue() {
        // readonly
        if (this._readonly === true) {
            // TODO: is this needed?
            //throw new DOMException(NO_MODIFICATION_ALLOWED_ERR);
        }
        
        /* do nothing */
    },
    get attributes() { return null;},
    
    // Proxy to the entity
    get nodeName() { return this._entityName;},
    get firstChild() { return this._entity.firstChild || null;},
    get childNodes() { return this._entity.childNodes;},
    get lastChild() { return this._entity.lastChild || null;},
    
};
core.EntityReference.prototype.__proto__ = core.Node.prototype;





// level 2
core.exceptionMessages['NAMESPACE_ERR'] = "Invalid namespace";

core.DOMImplementation.prototype.createDocumentType = function(/* String */ qualifiedName,
                                                               /* String */ publicId,
                                                               /* String */ systemId)
{
    ns.validate(qualifiedName);
    var doctype = new core.DocumentType(null, qualifiedName);
    doctype._publicId = publicId ? publicId : '';
    doctype._systemId = systemId ? systemId : '';
    return doctype;
};

/**
 Creates an XML Document object of the specified type with its document element.
 HTML-only DOM implementations do not need to implement this method.
 */
core.DOMImplementation.prototype.createDocument = function(/* String */       namespaceURI,
                                                           /* String */       qualifiedName,
                                                           /* DocumentType */ doctype)
{
    if (qualifiedName || namespaceURI) {
        ns.validate(qualifiedName, namespaceURI);
    }
    
    if (doctype && doctype._ownerDocument !== null) {
        throw new core.DOMException(core.WRONG_DOCUMENT_ERR);
    }
    
    if (qualifiedName && qualifiedName.indexOf(':') > -1 && !namespaceURI) {
        throw new core.DOMException(NAMESPACE_ERR);
    }
    
    var document = new core.Document();
    
    if (doctype) {
        document.doctype = doctype;
        doctype._ownerDocument = document;
        document.appendChild(doctype);
    } else {
        document.doctype = null;
    }
    
    if (doctype && !doctype.entities) {
        doctype.entities = new dom.EntityNodeMap();
    }
    
    document._ownerDocument = document;
    
    if (qualifiedName) {
        var docElement = document.createElementNS(namespaceURI, qualifiedName);
        document.appendChild(docElement);
    }
    
    return document;
};

core.Node.prototype.__defineGetter__("ownerDocument", function() {
                                     return this._ownerDocument || null;
                                     });

core.Node.prototype.isSupported = function(/* string */ feature,
                                           /* string */ version)
{
    return this._ownerDocument.implementation.hasFeature(feature, version);
};

core.Node.prototype._namespaceURI = null;
core.Node.prototype.__defineGetter__("namespaceURI", function() {
                                     return this._namespaceURI || null;
                                     });

core.Node.prototype.__defineSetter__("namespaceURI", function(value) {
                                     this._namespaceURI = value;
                                     });

core.Node.prototype.__defineGetter__("prefix", function() {
                                     return this._prefix || null;
                                     });

core.Node.prototype.__defineSetter__("prefix", function(value) {
                                     
                                     if (this.readonly) {
                                     throw new core.DOMException(core.NO_MODIFICATION_ALLOWED_ERR);
                                     }
                                     
                                     ns.validate(value, this._namespaceURI);
                                     
                                     if ((this._created && !this._namespaceURI)  ||
                                         this._prefix === "xmlns"                ||
                                         (!this._prefix && this._created))
                                     {
                                     throw new core.DOMException(core.NAMESPACE_ERR);
                                     }
                                     
                                     if (this._localName) {
                                     this._nodeName = value + ':' + this._localName;
                                     }
                                     
                                     this._prefix = value;
                                     });

core.Node.prototype.__defineGetter__("localName", function() {
                                     return this._localName || null;
                                     });

/* return boolean */
core.Node.prototype.hasAttributes = function() {
    return (this.nodeType === this.ELEMENT_NODE &&
            this._attributes                    &&
            this._attributes.length > 0);
};

core.NamedNodeMap.prototype.getNamedItemNS = function(/* string */ namespaceURI,
                                                      /* string */ localName)
{
    if (this._nsStore[namespaceURI] && this._nsStore[namespaceURI][localName]) {
        return this._nsStore[namespaceURI][localName];
    }
    return null;
};

core.AttrNodeMap.prototype.setNamedItemNS = function(/* Node */ arg) {
    if (arg.nodeType !== this._ownerDocument.ATTRIBUTE_NODE) {
        throw new core.DOMException(core.HIERARCHY_REQUEST_ERR);
    }
    
    return core.NamedNodeMap.prototype.setNamedItemNS.call(this, arg);
};

var prevSetNamedItem = core.AttrNodeMap.prototype.setNamedItem;

core.AttrNodeMap.prototype.setNamedItem = function(/* Node */ arg) {
    if (arg.nodeType !== this._ownerDocument.ATTRIBUTE_NODE) {
        throw new core.DOMException(core.HIERARCHY_REQUEST_ERR);
    }
    
    return prevSetNamedItem.call(this, arg);
};


core.NamedNodeMap.prototype.setNamedItemNS = function(/* Node */ arg)
{
    if (this._readonly) {
        throw new core.DOMException(core.NO_MODIFICATION_ALLOWED_ERR);
    }
    
    var owner = this._ownerDocument;
    if (this._parentNode &&
        this._parentNode._parentNode &&
        this._parentNode._parentNode.nodeType === owner.ENTITY_NODE)
    {
        throw new core.DOMException(core.NO_MODIFICATION_ALLOWED_ERR);
    }
    
    if (this._ownerDocument !== arg.ownerDocument) {
        throw new core.DOMException(core.WRONG_DOCUMENT_ERR);
    }
    
    if (arg._parentNode) {
        throw new core.DOMException(core.INUSE_ATTRIBUTE_ERR);
    }
    
    // readonly
    if (this._readonly === true) {
        throw new core.DOMException(NO_MODIFICATION_ALLOWED_ERR);
    }
    
    
    if (!this._nsStore[arg.namespaceURI]) {
        this._nsStore[arg.namespaceURI] = {};
    }
    var existing = null;
    if (this._nsStore[arg.namespaceURI][arg.localName]) {
        var existing = this._nsStore[arg.namespaceURI][arg.localName];
    }
    
    this._nsStore[arg.namespaceURI][arg.localName] = arg;
    
    arg._specified = true;
    arg._ownerDocument = this._ownerDocument;
    
    return this.setNamedItem(arg);
};

core.NamedNodeMap.prototype.removeNamedItemNS = function(/*string */ namespaceURI,
                                                         /* string */ localName)
{
    
    if (this.readonly) {
        throw new core.DOMException(core.NO_MODIFICATION_ALLOWED_ERR);
    }
    
    
    var parent = this._parentNode,
    found = null,
    defaults,
    clone,
    defaultEl,
    defaultAttr;
    
    if (this._parentNode &&
        this._parentNode._parentNode &&
        this._parentNode._parentNode.nodeType === this._ownerDocument.ENTITY_NODE)
    {
        throw new core.DOMException(core.NO_MODIFICATION_ALLOWED_ERR);
    }
    
    if (this._nsStore[namespaceURI] &&
        this._nsStore[namespaceURI][localName])
    {
        found = this._nsStore[namespaceURI][localName];
        this.removeNamedItem(found.qualifiedName);
        delete this._nsStore[namespaceURI][localName];
    }
    
    if (!found) {
        throw new core.DOMException(core.NOT_FOUND_ERR);
    }
    
    if (parent.ownerDocument.doctype && parent.ownerDocument.doctype._attributes) {
        defaults = parent.ownerDocument.doctype._attributes;
        defaultEl = defaults.getNamedItemNS(parent._namespaceURI, parent._localName);
    }
    
    if (defaultEl) {
        defaultAttr = defaultEl._attributes.getNamedItemNS(namespaceURI, localName);
        
        if (defaultAttr) {
            clone = defaultAttr.cloneNode(true);
            clone._created               = false;
            clone._namespaceURI          = found._namespaceURI;
            clone._nodeName              = found.name;
            clone._localName             = found._localName;
            clone._prefix                = found._prefix
            this.setNamedItemNS(clone);
            clone._created               = true;
            clone._specified             = false;
        }
    }
    
    return found;
};

core.Attr.prototype.__defineGetter__("ownerElement", function() {
                                     return this._ownerElement || null;
                                     });


core.Node.prototype._prefix = false;

core.Node.prototype.__defineSetter__("qualifiedName", function(qualifiedName) {
                                     ns.validate(qualifiedName, this._namespaceURI);
                                     qualifiedName       = qualifiedName || "";
                                     this._localName     = qualifiedName.split(":")[1] || null;
                                     this.prefix         = qualifiedName.split(":")[0] || null;
                                     this._nodeName = qualifiedName;
                                     });

core.Node.prototype.__defineGetter__("qualifiedName", function() {
                                     return this._nodeName;
                                     });

core.NamedNodeMap.prototype._map = function(fn) {
    var ret = [], l = this.length, i = 0, node;
    for(i; i<l; i++) {
        node = this.item(i);
        if (fn && fn(node)) {
            ret.push(node);
        }
    }
    return ret;
};

core.Element.prototype.getAttributeNS = function(/* string */ namespaceURI,
                                                 /* string */ localName)
{
    var attr =  this._attributes.getNamedItemNS(namespaceURI, localName);
    return (attr) ? attr.nodeValue : '';
};

core.Element.prototype.setAttributeNS = function(/* string */ namespaceURI,
                                                 /* string */ qualifiedName,
                                                 /* string */ value)
{
    var s       = qualifiedName.split(':'),
    local   = s.pop(),
    prefix  = s.pop() || null,
    attr;
    
    ns.validate(qualifiedName, namespaceURI);
    
    if (qualifiedName.split(':').shift() === "xml" &&
        namespaceURI !== "http://www.w3.org/XML/1998/namespace")
    {
        throw new core.DOMException(core.NAMESPACE_ERR);
    }
    
    if (prefix === "xmlns" && namespaceURI !== "http://www.w3.org/2000/xmlns/") {
        throw new core.DOMException(core.NAMESPACE_ERR);
    }
    
    if (qualifiedName.split(':').length > 1 && !namespaceURI) {
        throw new core.DOMException(core.NAMESPACE_ERR);
    }
    
    attr = this._attributes.getNamedItemNS(namespaceURI, local);
    
    if (!attr) {
        attr = this.ownerDocument.createAttributeNS(namespaceURI,
                                                    qualifiedName,
                                                    value);
        this._attributes.setNamedItemNS(attr);
        attr._ownerElement = this;
    }
    
    attr._namespaceURI = namespaceURI;
    attr._prefix    = prefix;
    attr._created = true;
    attr.value = value;
    attr._localName = local;
};

core.Element.prototype.removeAttributeNS = function(/* string */ namespaceURI,
                                                    /* string */ localName)
{
    
    if (this.readonly) {
        throw new core.DOMException(core.NO_MODIFICATION_ALLOWED_ERR);
    }
    
    var ownerDoc = this.ownerDocument,
    defaults,
    clone,
    found,
    defaultEl,
    defaultAttr,
    clone,
    localName;
    
    if (ownerDoc.doctype && ownerDoc.doctype._attributes) {
        defaults = ownerDoc.doctype._attributes;
        defaultEl = defaults.getNamedItemNS(namespaceURI, this.localName);
    }
    
    if (defaultEl) {
        defaultAttr = defaultEl.getAttributeNodeNS(namespaceURI, localName);
    }
    
    found = this._attributes.removeNamedItemNS(namespaceURI, localName);
    
    if (defaultAttr) {
        this.setAttributeNS(defaultAttr.namespaceURI,
                            defaultAttr.name,
                            defaultAttr.value);
        localName = defaultAttr.name.split(':').pop();
        clone = this.getAttributeNS(defaultAttr.namespaceURI, localName);
        clone._specified = false;
    }
    
    return found;
};

core.Element.prototype.getAttributeNodeNS = function(/* string */ namespaceURI,
                                                     /* string */ localName)
{
    return this._attributes.getNamedItemNS(namespaceURI, localName);
};
core.Element.prototype._created = false;

core.Element.prototype.setAttributeNodeNS = function(/* Attr */ newAttr)
{
    if (newAttr.ownerElement) {
        throw new core.DOMException(core.INUSE_ATTRIBUTE_ERR);
    }
    
    var existing = null;
    try {
        existing = this._attributes.removeNamedItemNS(newAttr.namespaceURI,
                                                      newAttr.localName);
    } catch (e) { /* noop */}
    
    newAttr._ownerElement = this;
    return this._attributes.setNamedItemNS(newAttr) || existing;
};

core.Element.prototype.getElementsByTagNameNS = function(/* String */ namespaceURI,
                                                         /* String */ localName)
{
    var nsPrefixCache = {};
    
    function filterByTagName(child) {
        if (child.nodeType && child.nodeType === this.ENTITY_REFERENCE_NODE) {
            child = child._entity;
        }
        
        var localMatch = child.localName === localName,
        nsMatch    = child.namespaceURI === namespaceURI;
        
        if ((localMatch || localName === "*") &&
            (nsMatch || namespaceURI === "*"))
        {
            if (child.nodeType === child.ELEMENT_NODE) {
                return true;
            }
        }
        return false;
    }
    
    return new core.NodeList(this.ownerDocument || this,
                             core.mapper(this, filterByTagName));
};

core.Element.prototype.hasAttribute = function(/* string */name)
{
    if (!this._attributes) {
        return false;
    }
    return this._attributes.exists(name);
};

core.Element.prototype.hasAttributeNS = function(/* string */namespaceURI,
                                                 /* string */localName)
{
    if (this._attributes.getNamedItemNS(namespaceURI, localName)) {
        return true;
    } else if (this.hasAttribute(localName)) {
        return true;
    }
    return false;
};

core.DocumentType.prototype.__defineGetter__("publicId", function() {
                                             return this._publicId || "";
                                             });

core.DocumentType.prototype.__defineGetter__("systemId", function() {
                                             return this._systemId || "";
                                             });

core.DocumentType.prototype.__defineGetter__("internalSubset", function() {
                                             return this._internalSubset || null;
                                             });

core.Document.prototype.importNode = function(/* Node */ importedNode,
                                              /* bool */ deep)
{
    if (importedNode && importedNode.nodeType) {
        if (importedNode.nodeType === this.DOCUMENT_NODE ||
            importedNode.nodeType === this.DOCUMENT_TYPE_NODE) {
            throw new core.DOMException(core.NOT_SUPPORTED_ERR);
        }
    }
    
    var self = this,
    newNode = importedNode.cloneNode(deep, function(a, b) {
                                     b._namespaceURI  = a._namespaceURI;
                                     b._nodeName      = a._nodeName;
                                     b._localName     = a._localName;
                                     }),
    defaults = false,
    defaultEl;
    
    if (this.doctype && this.doctype._attributes) {
        defaults = this.doctype._attributes;
    }
    
    function lastChance(el) {
        var attr, defaultEl;
        
        el._ownerDocument = self;
        if (el.id) {
            self._ids[el.id] = el;
        }
        if (el._attributes) {
            el._attributes._ownerDocument = self;
            for (var i=0,len=el._attributes.length; i < len; i++) {
                attr = el._attributes.item(i);
                attr._ownerDocument = self;
                attr._specified = true;
            }
        }
        if (defaults) {
            
            defaultEl = defaults.getNamedItemNS(el._namespaceURI,
                                                el._localName);
            
            // TODO: This could use some love
            if (defaultEl) {
                defaultEl._attributes._map(function(defaultAttr) {
                                           if (!el.hasAttributeNS(defaultAttr.namespaceURL,
                                                                  defaultAttr.localName))
                                           {
                                           var clone = defaultAttr.cloneNode(true);
                                           clone._namespaceURI = defaultAttr._namespaceURI;
                                           clone._prefix       = defaultAttr._prefix;
                                           clone._localName    = defaultAttr._localName;
                                           el.setAttributeNodeNS(clone);
                                           clone._specified = false;
                                           }
                                           });
            }
        }
        
    }
    
    if (deep) {
        core.visitTree(newNode, lastChance);
    }
    else {
        lastChance(newNode);
    }
    
    if (newNode.nodeType == newNode.ATTRIBUTE_NODE) {
        newNode._specified = true;
    }
    
    return newNode;
};

core.Document.prototype.createElementNS = function(/* string */ namespaceURI,
                                                   /* string */ qualifiedName)
{
    var parts   = qualifiedName.split(':'),
    element, prefix;
    
    if (parts.length > 1 && !namespaceURI) {
        throw new core.DOMException(core.NAMESPACE_ERR);
    }
    
    ns.validate(qualifiedName, namespaceURI);
    element = this.createElement(qualifiedName),
    
    element._created = false;
    
    element._namespaceURI = namespaceURI;
    element._nodeName = qualifiedName;
    element._localName = parts.pop();
    
    if (parts.length > 0) {
        prefix = parts.pop();
        element.prefix = prefix;
    }
    
    element._created = true;
    return element;
};

core.Document.prototype.createAttributeNS = function(/* string */ namespaceURI,
                                                     /* string */ qualifiedName)
{
    var attribute, parts = qualifiedName.split(':');
    
    if (parts.length > 1 && !namespaceURI) {
        throw new core.DOMException(core.NAMESPACE_ERR,
                                    "Prefix specified without namespaceURI (" + qualifiedName + ")");
    }
    
    
    ns.validate(qualifiedName, namespaceURI);
    
    attribute = this.createAttribute(qualifiedName);
    attribute.namespaceURI = namespaceURI;
    attribute.qualifiedName = qualifiedName;
    
    attribute._localName = parts.pop();
    attribute._prefix = (parts.length > 0) ? parts.pop() : null;
    return attribute;
};

core.Document.prototype.getElementsByTagNameNS = function(/* String */ namespaceURI,
                                                          /* String */ localName)
{
    return core.Element.prototype.getElementsByTagNameNS.call(this,
                                                              namespaceURI,
                                                              localName);
};

core.Element.prototype.__defineSetter__("id", function(id) {
                                        this.setAttribute("id", id);
                                        id = this.getAttribute("id"); //Passed validation
                                        if (!this._ownerDocument._ids) {
                                        this._ownerDocument._ids = {};
                                        }
                                        if (id === '') {
                                        delete this._ownerDocument._ids[id];
                                        } else {
                                        this._ownerDocument._ids[id] = this;
                                        }
                                        });

core.Element.prototype.__defineGetter__("id",function() {
                                        return this.getAttribute("id");
                                        });

core.Document.prototype.getElementById = function(id) {
    return this._ids[id] || null;
};



// events

var events = {};

events.EventException = function() {
    if (arguments.length > 0) {
        this._code = arguments[0];
    } else {
        this._code = 0;
    }
    if (arguments.length > 1) {
        this._message = arguments[1];
    } else {
        this._message = "Unspecified event type";
    }
    Error.call(this, this._message);
    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, events.EventException);
    }
};
events.EventException.prototype = {
    UNSPECIFIED_EVENT_TYPE_ERR : 0,
    get code() { return this._code;}
};
events.EventException.prototype.__proto__ = Error.prototype;

events.Event = function(eventType) {
    this._eventType = eventType;
    this._type = null;
    this._bubbles = null;
    this._cancelable = null;
    this._target = null;
    this._currentTarget = null;
    this._eventPhase = null;
    this._timeStamp = null;
    this._preventDefault = false;
    this._stopPropagation = false;
};
events.Event.prototype = {
initEvent: function(type, bubbles, cancelable) {
    this._type = type;
    this._bubbles = bubbles;
    this._cancelable = cancelable;
},
preventDefault: function() {
    if (this._cancelable) {
        this._preventDefault = true;
    }
},
stopPropagation: function() {
    this._stopPropagation = true;
},
    CAPTURING_PHASE : 1,
    AT_TARGET       : 2,
    BUBBLING_PHASE  : 3,
    get eventType() { return this._eventType; },
    get type() { return this._type; },
    get bubbles() { return this._bubbles; },
    get cancelable() { return this._cancelable; },
    get target() { return this._target; },
    get currentTarget() { return this._currentTarget; },
    get eventPhase() { return this._eventPhase; },
    get timeStamp() { return this._timeStamp; }
};

events.HTMLEvent = function(eventType) {
    events.Event.call(this, eventType);
};
events.HTMLEvent.prototype.__proto__ = events.Event.prototype;


events.UIEvent = function(eventType) {
    events.Event.call(this, eventType);
    this.view = null;
    this.detail = null;
};
events.UIEvent.prototype = {
initUIEvent: function(type, bubbles, cancelable, view, detail) {
    this.initEvent(type, bubbles, cancelable);
    this.view = view;
    this.detail = detail;
},
};
events.UIEvent.prototype.__proto__ = events.Event.prototype;


events.MouseEvent = function(eventType) {
    events.UIEvent.call(this, eventType);
    this.screenX = null;
    this.screenY = null;
    this.clientX = null;
    this.clientY = null;
    this.ctrlKey = null;
    this.shiftKey = null;
    this.altKey = null;
    this.metaKey = null;
    this.button = null;
    this.relatedTarget = null;
};
events.MouseEvent.prototype = {
initMouseEvent:   function(type,
                           bubbles,
                           cancelable,
                           view,
                           detail,
                           screenX,
                           screenY,
                           clientX,
                           clientY,
                           ctrlKey,
                           altKey,
                           shiftKey,
                           metaKey,
                           button,
                           relatedTarget) {
    this.initUIEvent(type, bubbles, cancelable, view, detail);
    this.screenX  = screenX
    this.screenY  = screenY
    this.clientX  = clientX
    this.clientY  = clientY
    this.ctrlKey  = ctrlKey
    this.shiftKey  = shiftKey
    this.altKey  = altKey
    this.metaKey  = metaKey
    this.button  = button
    this.relatedTarget  = relatedTarget
}
};
events.MouseEvent.prototype.__proto__ = events.UIEvent.prototype;


events.MutationEvent = function(eventType) {
    events.Event.call(this, eventType);
    this.relatedNode = null;
    this.prevValue = null;
    this.newValue = null;
    this.attrName = null;
    this.attrChange = null;
};
events.MutationEvent.prototype = {
initMutationEvent:   function(type,
                              bubbles,
                              cancelable,
                              relatedNode,
                              prevValue,
                              newValue,
                              attrName,
                              attrChange) {
    this.initEvent(type, bubbles, cancelable);
    this.relatedNode = relatedNode;
    this.prevValue = prevValue;
    this.newValue = newValue;
    this.attrName = attrName;
    this.attrChange = attrChange;
},
    MODIFICATION : 1,
    ADDITION     : 2,
    REMOVAL      : 3
};
events.MutationEvent.prototype.__proto__ = events.Event.prototype;

events.EventTarget = function() {};

events.EventTarget.getListeners = function getListeners(target, type, capturing) {
    var listeners = target._listeners
    && target._listeners[type]
    && target._listeners[type][capturing];
    if (listeners && listeners.length) {
        return listeners;
    }
    return [];
};

events.EventTarget.dispatch = function dispatch(event, iterator, capturing) {
    var listeners,
    currentListener,
    target = iterator();
    
    while (target && !event._stopPropagation) {
        listeners = events.EventTarget.getListeners(target, event._type, capturing);
        currentListener = listeners.length;
        while (currentListener--) {
            event._currentTarget = target;
            try {
                listeners[currentListener].call(target, event);
            } catch (e) {
                target.trigger(
                               'error', "Dispatching event '" + event._type + "' failed", 
                               {error: e, event: event}
                               );
            }
        }
        target = iterator();
    }
    return !event._stopPropagation;
};

events.EventTarget.forwardIterator = function forwardIterator(list) {
    var i = 0, len = list.length;
    return function iterator() { return i < len ? list[i++] : null };
};

events.EventTarget.backwardIterator = function backwardIterator(list) {
    var i = list.length;
    return function iterator() { return i >=0 ? list[--i] : null };
};

events.EventTarget.singleIterator = function singleIterator(obj) {
    var i = 1;
    return function iterator() { return i-- ? obj : null };
};

events.EventTarget.prototype = {
addEventListener: function(type, listener, capturing) {
    this._listeners = this._listeners || {};
    var listeners = this._listeners[type] || {};
    capturing = (capturing === true);
    var capturingListeners = listeners[capturing] || [];
    for (var i=0; i < capturingListeners.length; i++) {
        if (capturingListeners[i] === listener) {
            return;
        }
    }
    capturingListeners.push(listener);
    listeners[capturing] = capturingListeners;
    this._listeners[type] = listeners;
},
    
removeEventListener: function(type, listener, capturing) {
    var listeners  = this._listeners && this._listeners[type];
    if (!listeners) return;
    var capturingListeners = listeners[(capturing === true)];
    if (!capturingListeners) return;
    for (var i=0; i < capturingListeners.length; i++) {
        if (capturingListeners[i] === listener) {
            capturingListeners.splice(i, 1);
            return;
        }
    }
},
    
dispatchEvent: function(event) {
    if (event == null) {
        throw new events.EventException(0, "Null event");
    }
    if (event._type == null || event._type == "") {
        throw new events.EventException(0, "Uninitialized event");
    }
    
    var nextTarget = null;
    var targetList = [];
    
    event._target = this;
    
    //per the spec we gather the list of targets first to ensure
    //against dom modifications during actual event dispatch
    nextTarget = this._parentNode;
    while (nextTarget) {
        targetList.push(nextTarget);
        nextTarget = nextTarget._parentNode;
    }
    
    var iterator = events.EventTarget.backwardIterator(targetList);
    
    event._eventPhase = event.CAPTURING_PHASE;
    if (!events.EventTarget.dispatch(event, iterator, true)) return event._preventDefault;
    
    iterator = events.EventTarget.singleIterator(event._target);
    event._eventPhase = event.AT_TARGET;
    if (!events.EventTarget.dispatch(event, iterator, false)) return event._preventDefault;
    
    var traditionalHandler = this["on" + event._type];
    if (traditionalHandler) {
        try {
            if (traditionalHandler(event) === false) {
                return true;
            }
        }
        catch (e) {
            event._target.trigger(
                                  'error', "Dispatching event '" + event._type + "' failed.",
                                  {error: e, event: event}
                                  );
        }
    }
    
    if (event._bubbles && !event._stopPropagation) {
        var i = 0;
        iterator = events.EventTarget.forwardIterator(targetList);
        event._eventPhase = event.BUBBLING_PHASE;
        events.EventTarget.dispatch(event, iterator, false);
    }
    
    return event._preventDefault;
}
    
};


core.Node.prototype.__proto__ = events.EventTarget.prototype;

function getDocument(el) {
    return el.nodeType == core.Node.DOCUMENT_NODE ? el : el._ownerDocument;
}

function mutationEventsEnabled(el) {
    return (el.nodeType == core.Node.ELEMENT_NODE ||
            el.nodeType == core.Node.CDATA_SECTION_NODE ||
            el.nodeType == core.Node.DOCUMENT_NODE) &&
    getDocument(el).implementation.hasFeature('MutationEvents');
}

function advise(clazz, method, advice) {
    var proto = clazz.prototype,
    impl = proto[method];
    
    proto[method] = function() {
        var args = Array.prototype.slice.call(arguments);
        var ret = impl.apply(this, arguments);
        args.unshift(ret);
        return advice.apply(this, args) || ret;
    };
}

function adviseBefore(clazz, method, advice) {
    var proto = clazz.prototype,
    impl = proto[method];
    
    proto[method] = function() {
        advice.apply(this, arguments);
        return impl.apply(this, arguments);
    };
}

function dispatchInsertionEvent(ret, newChild, refChild) {
    if (mutationEventsEnabled(this)) {
        var doc = getDocument(this),
        ev = doc.createEvent("MutationEvents");
        
        ev.initMutationEvent("DOMNodeInserted", true, false, this, null, null, null, null);
        newChild.dispatchEvent(ev);
        if (this.nodeType == core.Node.DOCUMENT_NODE || this._attachedToDocument) {
            ev = doc.createEvent("MutationEvents");
            ev.initMutationEvent("DOMNodeInsertedIntoDocument", false, false, null, null, null, null, null);
            core.visitTree(newChild, function(el) { 
                           if (el.nodeType == core.Node.ELEMENT_NODE) {
                           el.dispatchEvent(ev);
                           el._attachedToDocument = true;
                           }
                           });
        }
    }
}

function dispatchRemovalEvent(oldChild) {
    if (mutationEventsEnabled(this)) {
        var doc = getDocument(this),
        ev = doc.createEvent("MutationEvents");
        
        ev.initMutationEvent("DOMNodeRemoved", true, false, this, null, null, null, null);
        oldChild.dispatchEvent(ev);
        
        ev = doc.createEvent("MutationEvents");
        ev.initMutationEvent("DOMNodeRemovedFromDocument", false, false, null, null, null, null, null);
        core.visitTree(oldChild, function(el) { 
                       if (el.nodeType == core.Node.ELEMENT_NODE) {
                       el.dispatchEvent(ev);
                       el._attachedToDocument = false;
                       }
                       });
    }
}

function dispatchAttrEvent(change, arg) {
    return function(ret) {
        var target = this._parentNode,
        node = arguments[arg];
        
        if (mutationEventsEnabled(target)) {
            var doc = target._ownerDocument,
            attrChange = events.MutationEvent.prototype[change],
            prevVal = arg == 0 ? node.value : null,
            newVal = arg == 1 ? node.value : null,
            ev = doc.createEvent("MutationEvents");
            
            ev.initMutationEvent("DOMAttrModified", true, false, target, prevVal, newVal, node.name, attrChange);
            target.dispatchEvent(ev);
        }
    }
}

advise(core.Node, 'insertBefore', dispatchInsertionEvent);
adviseBefore(core.Node, 'removeChild', dispatchRemovalEvent);

advise(core.AttrNodeMap, 'removeNamedItem', dispatchAttrEvent('REMOVAL', 0));
advise(core.AttrNodeMap, 'setNamedItem', dispatchAttrEvent('ADDITION', 1));

core.CharacterData.prototype.__defineSetter__("_nodeValue", function(value) {
                                              var oldValue = this._nodeValue;
                                              this._text = value;
                                              if (this._ownerDocument && this._parentNode && mutationEventsEnabled(this)) {
                                              var ev = this._ownerDocument.createEvent("MutationEvents")
                                              ev.initMutationEvent("DOMCharacterDataModified", true, false, this, oldValue, value, null, null);
                                              this.dispatchEvent(ev);
                                              }
                                              });

core.Document.prototype.createEvent = function(eventType) {
    switch (eventType) {
        case "MutationEvents": return new events.MutationEvent(eventType);
        case "UIEvents": return new events.UIEvent(eventType);
        case "MouseEvents": return new events.MouseEvent(eventType);
        case "HTMLEvents": return new events.HTMLEvent(eventType);
    }
    return new events.Event(eventType);
};

core.Node.prototype.trigger = function(type, message, data) {
    if (this.createEvent) {
        var doc = this._ownerDocument || this,
        evt = doc.createEvent('Event');
        
        // Event does bubble and is not cancelable.
        evt.initEvent(type, true, false);
        
        evt.message = message;
        evt.data    = data || (new Error(message)).stack;
        
        this.dispatchEvent(evt);
    }
}


// html
core.resourceLoader = {
load: function(element, href, callback) {
    var ownerImplementation = element._ownerDocument.implementation;
    
    if (ownerImplementation.hasFeature('FetchExternalResources', element.tagName.toLowerCase())) {
        var full = this.resolve(element._ownerDocument, href);
        url = URL.parse(full);
        if (url.hostname) {
            this.download(url, this.baseUrl(element._ownerDocument), this.enqueue(element, callback, full));
        }
        else {
            this.readFile(full, this.enqueue(element, callback, full));
        }
    }
},
enqueue: function(element, callback, filename) {
    var loader = this,
    doc    = element.nodeType === core.Node.DOCUMENT_NODE ?
    element                :
    element._ownerDocument;
    
    if (!doc._queue) {
        return function() {};
    }
    
    return doc._queue.push(function(err, data) {
                           var ev = doc.createEvent('HTMLEvents');
                           
                           if (!err) {
                           try {
                           callback.call(element, data, filename || doc.URL);
                           ev.initEvent('load', false, false);
                           }
                           catch(e) {
                           err = e;
                           }
                           }
                           
                           if (err) {
                           ev.initEvent('error', false, false);
                           ev.error = err;
                           }
                           
                           element.dispatchEvent(ev);
                           });
},
baseUrl: function(document) {
    var baseElements = document.getElementsByTagName('base'),
    baseUrl      = document.URL;
    
    if (baseElements.length > 0) {
        baseUrl = baseElements.item(0).href;
    }
    
    return baseUrl;
},
resolve: function(document, href) {
    if (href.match(/^\w+:\/\//)) {
                   return href;
                   }
                   
                   var baseUrl = this.baseUrl(document);
                   
                   // See RFC 2396 section 3 for this weirdness. URLs without protocol
                   // have their protocol default to the current one.
                   // http://www.ietf.org/rfc/rfc2396.txt
                   if (href.match(/^\/\//)) {
                                  return baseUrl ? baseUrl.match(/^(\w+:)\/\//)[1] + href : null;
                                                                 } else if (!href.match(/^\/[^\/]/)) {
                                                                 href = href.replace(/^\//, "");
                                                                                     }
                                                                                     
                                                                                     //return URL.resolve(baseUrl, href);
                                                                                     return null;
                                                                                     },
                                                                                     download: function(url, referrer, callback) {
                                                                                     var path    = url.pathname + (url.search || ''),
                                                                                     options = {'method': 'GET', 'host': url.hostname, 'path': url.pathname},
                                                                                     request;
                                                                                     if (url.protocol === 'https:') {
                                                                                     options.port = url.port || 443;
                                                                                     request = https.request(options);
                                                                                     } else {
                                                                                     options.port = url.port || 80;
                                                                                     request = http.request(options);
                                                                                     }
                                                                                     
                                                                                     // set header.
                                                                                     if(referrer) {
                                                                                     request.setHeader('Referer', referrer);
                                                                                     }
                                                                                     
                                                                                     request.on('response', function (response) {
                                                                                                response.setEncoding('utf8');
                                                                                                var data = '';
                                                                                                response.on('data', function (chunk) {
                                                                                                            data += chunk.toString();
                                                                                                            });
                                                                                                response.on('end', function() {
                                                                                                            if ([301, 302, 303, 307].indexOf(response.statusCode) > -1) {
                                                                                                            var redirect = URL.resolve(url, response.headers.location);
                                                                                                            core.resourceLoader.download(URL.parse(redirect), callback);
                                                                                                            } else {
                                                                                                            callback(null, data);
                                                                                                            }
                                                                                                            });
                                                                                                });
                                                                                     
                                                                                     request.on('error', callback);
                                                                                     request.end();
                                                                                     },
                                                                                     readFile: function(url, callback) {
                                                                                     fs.readFile(url.replace(/^file:\/\//, ""), 'utf8', callback);
                                                                                                             }
                                                                                                             };
core.CharacterData.prototype.__defineSetter__("_nodeValue", function(value) {
                                              this._text = value;
                                              });

core.CharacterData.prototype.__defineGetter__("_nodeValue",function() {
                                              return this._text || "";
                                              });

function define(elementClass, def) {
    var tagName = def.tagName,
    tagNames = def.tagNames || (tagName? [tagName] : []),
    parentClass = def.parentClass || core.HTMLElement,
    attrs = def.attributes || [],
    proto = def.proto || {};
    
    var elem = core[elementClass] = function(document, name) {
        parentClass.call(this, document, name || tagName.toUpperCase());
        if (elem._init) {
            elem._init.call(this);
        }
    };
    elem._init = def.init;
    
    elem.prototype = proto;
    elem.prototype.__proto__ = parentClass.prototype;
    
    attrs.forEach(function(n) {
                  var prop = n.prop || n,
                  attr = n.attr || prop.toLowerCase();
                  
                  if (!n.prop || n.read !== false) {
                  elem.prototype.__defineGetter__(prop, function() {
                                                  var s = this.getAttribute(attr);
                                                  if (n.type && n.type === 'boolean') {
                                                  return !!s;
                                                  }
                                                  if (n.type && n.type === 'long') {
                                                  return +s;
                                                  }
                                                  if (n.normalize) {
                                                  return n.normalize(s);
                                                  }
                                                  return s;
                                                  });
                  }
                  
                  if (!n.prop || n.write !== false) {
                  elem.prototype.__defineSetter__(prop, function(val) {
                                                  if (!val) {
                                                  this.removeAttribute(attr);
                                                  }
                                                  else {
                                                  var s = val.toString();
                                                  if (n.normalize) {
                                                  s = n.normalize(s);
                                                  }
                                                  this.setAttribute(attr, s);
                                                  }
                                                  });
                  }
                  });
    
    tagNames.forEach(function(tag) {
                     core.Document.prototype._elementBuilders[tag.toLowerCase()] = function(doc, s) {
                     var el = new elem(doc, s);
                     return el;
                     };
                     });
}



core.HTMLCollection = function HTMLCollection(element, query) {
    core.NodeList.call(this, element, query);
};
core.HTMLCollection.prototype = {
    namedItem : function(name) {
        var results = this.toArray(),
        l       = results.length,
        node,
        matchingName = null;
        
        for (var i=0; i<l; i++) {
            node = results[i];
            if (node.getAttribute('id') === name) {
                return node;
            } else if (node.getAttribute('name') === name) {
                matchingName = node;
            }
        }
        return matchingName;
    },
toString: function() {
    return '[ jsdom HTMLCollection ]: contains ' + this.length + ' items';
}
};
core.HTMLCollection.prototype.__proto__ = core.NodeList.prototype;

core.HTMLOptionsCollection = core.HTMLCollection;

function closest(e, tagName) {
    tagName = tagName.toUpperCase();
    while (e) {
        if (e.nodeName.toUpperCase() === tagName ||
            (e.tagName && e.tagName.toUpperCase() === tagName))
        {
            return e;
        }
        e = e._parentNode;
    }
    return null;
}

function descendants(e, tagName, recursive) {
    var owner = recursive ? e._ownerDocument || e : e;
    return new core.HTMLCollection(owner, core.mapper(e, function(n) {
                                                      return n.nodeName === tagName;
                                                      }, recursive));
}

function firstChild(e, tagName) {
    if (!e) {
        return null;
    }
    var c = descendants(e, tagName, false);
    return c.length > 0 ? c[0] : null;
}

function ResourceQueue(paused) {
    this.paused = !!paused;
}
ResourceQueue.prototype = {
push: function(callback) {
    var q = this;
    var item = {
    prev: q.tail,
    check: function() {
        if (!q.paused && !this.prev &&
            ((this.data !== null && this.data !== undefined) ||
             (this.err !== null && this.err !== undefined))) {
                callback(this.err, this.data);
                q.tail = this.next;
                if (this.next) {
                    this.next.prev = null;
                    this.next.check();
                }
            }
    }
    };
    if (q.tail) {
        q.tail.next = item;
    }
    q.tail = item;
    return function(err, data) {
        item.err = err;
        item.data = data;
        item.check();
    };
},
resume: function() {
    this.paused = false;
    if (this.tail) {
        this.tail.check();
    }
}
};

core.HTMLDocument = function HTMLDocument(options) {
    options = options || {};
    if (!options.contentType) {
        options.contentType = 'text/html';
    }
    core.Document.call(this, options);
    this._URL = options.url || '/';
    this._documentRoot = options.documentRoot || Path.dirname(this._URL);
    this._queue = new ResourceQueue(options.deferClose);
    this.readyState = 'loading';
    
    // Add level2 features
    this.implementation.addFeature('core'  , '2.0');
    this.implementation.addFeature('html'  , '2.0');
    this.implementation.addFeature('xhtml' , '2.0');
    this.implementation.addFeature('xml'   , '2.0');
};

core.HTMLDocument.prototype = {
    get referrer() {
        return "";
    },
    get domain() {
        return "";
    },
    _URL : "",
    get URL() {
        return this._URL;
    },
    get images() {
        return this.getElementsByTagName('IMG');
    },
    get applets() {
        return new core.HTMLCollection(this, core.mapper(this, function(el) {
                                                         if (el && el.tagName) {
                                                         var upper = el.tagName.toUpperCase();
                                                         if (upper === "APPLET") {
                                                         return true;
                                                         } else if (upper === "OBJECT" &&
                                                                    el.getElementsByTagName('APPLET').length > 0)
                                                         {
                                                         return true;
                                                         }
                                                         }
                                                         }));
    },
    get links() {
        return new core.HTMLCollection(this, core.mapper(this, function(el) {
                                                         if (el && el.tagName) {
                                                         var upper = el.tagName.toUpperCase();
                                                         if (upper === "AREA" || (upper === "A" && el.href)) {
                                                         return true;
                                                         }
                                                         }
                                                         }));
    },
    get forms() {
        return this.getElementsByTagName('FORM');
    },
    get anchors() {
        return this.getElementsByTagName('A');
    },
    open  : function() {
        this._childNodes = [];
        this._documentElement = null;
        this._modified();
    },
    close : function() {
        this._queue.resume();
        // Set the readyState to 'complete' once all resources are loaded.
        // As a side-effect the document's load-event will be dispatched.
        core.resourceLoader.enqueue(this, function() {
                                    this.readyState = 'complete';
                                    var ev = this.createEvent('HTMLEvents');
                                    ev.initEvent('DOMContentLoaded', false, false);
                                    this.dispatchEvent(ev);
                                    })(null, true);
    },
    
    write : function(text) {
        if (this.readyState === "loading") {
            // During page loading, document.write appends to the current element
            // Find the last child that has been added to the document.
            var node = this;
            while (node.lastChild && node.lastChild.nodeType === this.ELEMENT_NODE) {
                node = node.lastChild;
            }
            node.innerHTML = text;
        } else {
            this.innerHTML = text;
        }
    },
    
    writeln : function(text) {
        this.write(text + '\n');
    },
    
    getElementsByName : function(elementName) {
        return new core.HTMLCollection(this, core.mapper(this, function(el) {
                                                         return (el.getAttribute && el.getAttribute("name") === elementName);
                                                         }));
    },
    
    get title() {
        var head = this.head,
        title = head ? firstChild(head, 'TITLE') : null;
        return title ? title.textContent : '';
    },
    
    set title(val) {
        var title = firstChild(this.head, 'TITLE');
        if (!title) {
            title = this.createElement('TITLE');
            var head = this.head;
            if (!head) {
                head = this.createElement('HEAD');
                this.documentElement.insertBefore(head, this.documentElement.firstChild);
            }
            head.appendChild(title);
        }
        title.innerHTML = val;
    },
    
    get head() {
        return firstChild(this.documentElement, 'HEAD');
    },
    
    set head() { /* noop */ },
    
    get body() {
        var body = firstChild(this.documentElement, 'BODY');
        if (!body) {
            body = firstChild(this.documentElement, 'FRAMESET');
        }
        return body;
    },
    
    get documentElement() {
        if (!this._documentElement) {
            this._documentElement = firstChild(this, 'HTML');
        }
        return this._documentElement;
    },
    
    _cookie : "",
    get cookie() { return this._cookie; },
    set cookie(val) { this._cookie = val; }
};
core.HTMLDocument.prototype.__proto__ = core.Document.prototype;

define('HTMLElement', {
       parentClass: core.Element,
       proto : {
       // Add default event behavior (click link to navigate, click button to submit
       // form, etc). We start by wrapping dispatchEvent so we can forward events to
       // the element's _eventDefault function (only events that did not incur
       // preventDefault).
       dispatchEvent : function (event) {
       var outcome = core.Node.prototype.dispatchEvent.call(this, event)
       
       if (!event._preventDefault     &&
           event.target._eventDefaults[event.type] &&
           typeof event.target._eventDefaults[event.type] === 'function')
       {
       event.target._eventDefaults[event.type](event)
       }
       return outcome;
       },
       _eventDefaults : {}
       },
       attributes: [
                    'id',
                    'title',
                    'lang',
                    'dir',
                    {prop: 'className', attr: 'class', normalize: function(s) { return s || ''; }}
                    ]
       });

core.Document.prototype._defaultElementBuilder = function(document, tagName) {
    return new core.HTMLElement(document, tagName);
};

//http://www.w3.org/TR/html5/forms.html#category-listed
var listedElements = /button|fieldset|input|keygen|object|select|textarea/i;

define('HTMLFormElement', {
       tagName: 'FORM',
       proto: {
       get elements() {
       return new core.HTMLCollection(this._ownerDocument, core.mapper(this, function(e) {
                                                                       return listedElements.test(e.nodeName) ; // TODO exclude <input type="image">
                                                                       }));
       },
       get length() {
       return this.elements.length;
       },
       _dispatchSubmitEvent: function() {
       var ev = this._ownerDocument.createEvent('HTMLEvents');
       ev.initEvent('submit', true, true);
       if (!this.dispatchEvent(ev)) {
       this.submit();
       };
       },
       submit: function() {
       },
       reset: function() {
       this.elements.toArray().forEach(function(el) {
                                       el.value = el.defaultValue;
                                       });
       }
       },
       attributes: [
                    'name',
                    {prop: 'acceptCharset', attr: 'accept-charset'},
                    'action',
                    'enctype',
                    'method',
                    'target'
                    ]
       });

define('HTMLLinkElement', {
       tagName: 'LINK',
       proto: {
       get href() {
       return core.resourceLoader.resolve(this._ownerDocument, this.getAttribute('href'));
       }
       },
       attributes: [
                    {prop: 'disabled', type: 'boolean'},
                    'charset',
                    'href',
                    'hreflang',
                    'media',
                    'rel',
                    'rev',
                    'target',
                    'type'
                    ]
       });

define('HTMLMetaElement', {
       tagName: 'META',
       attributes: [
                    'content',
                    {prop: 'httpEquiv', attr: 'http-equiv'},
                    'name',
                    'scheme'
                    ]
       });

define('HTMLHtmlElement', {
       tagName: 'HTML',
       attributes: [
                    'version'
                    ]
       });

define('HTMLHeadElement', {
       tagName: 'HEAD',
       attributes: [
                    'profile'
                    ]
       });

define('HTMLTitleElement', {
       tagName: 'TITLE',
       proto: {
       get text() {
       return this.innerHTML;
       },
       set text(s) {
       this.innerHTML = s;
       }
       }
       });

define('HTMLBaseElement', {
       tagName: 'BASE',
       attributes: [
                    'href',
                    'target'
                    ]
       });


//**Deprecated**
define('HTMLIsIndexElement', {
       tagName : 'ISINDEX',
       parentClass : core.Element,
       proto : {
       get form() {
       return closest(this, 'FORM');
       }
       },
       attributes : [
                     'prompt'
                     ]
       });


define('HTMLStyleElement', {
       tagName: 'STYLE',
       attributes: [
                    {prop: 'disabled', type: 'boolean'},
                    'media',
                    'type',
                    ]
       });

define('HTMLBodyElement', {
       tagName: 'BODY',
       attributes: [
                    'aLink',
                    'background',
                    'bgColor',
                    'link',
                    'text',
                    'vLink'
                    ]
       });

define('HTMLSelectElement', {
       tagName: 'SELECT',
       proto: {
       get options() {
       return new core.HTMLOptionsCollection(this, core.mapper(this, function(n) {
                                                               return n.nodeName === 'OPTION';
                                                               }));
       },
       
       get length() {
       return this.options.length;
       },
       
       get selectedIndex() {
       return this.options.toArray().reduceRight(function(prev, option, i) {
                                                 return option.selected ? i : prev;
                                                 }, -1);
       },
       
       set selectedIndex(index) {
       this.options.toArray().forEach(function(option, i) {
                                      option.selected = i === index;
                                      });
       },
       
       get value() {
       var i = this.selectedIndex;
       if (this.options.length && (i === -1)) {
       i = 0;
       }
       if (i === -1) {
       return '';
       }
       return this.options[i].value;
       },
       
       set value(val) {
       var self = this;
       this.options.toArray().forEach(function(option) {
                                      if (option.value === val) {
                                      option.selected = true;
                                      } else {
                                      if (!self.hasAttribute('multiple')) {
                                      // Remove the selected bit from all other options in this group
                                      // if the multiple attr is not present on the select
                                      option.selected = false;
                                      }
                                      }
                                      });
       },
       
       get form() {
       return closest(this, 'FORM');
       },
       
       get type() {
       return this.multiple ? 'select-multiple' : 'select';
       },
       
       add: function(opt, before) {
       if (before) {
       this.insertBefore(opt, before);
       }
       else {
       this.appendChild(opt);
       }
       },
       
       remove: function(index) {
       var opts = this.options.toArray();
       if (index >= 0 && index < opts.length) {
       var el = opts[index];
       el._parentNode.removeChild(el);
       }
       },
       
       blur: function() {
       //TODO
       },
       
       focus: function() {
       //TODO
       }
       },
       attributes: [
                    {prop: 'disabled', type: 'boolean'},
                    {prop: 'multiple', type: 'boolean'},
                    'name',
                    {prop: 'size', type: 'long'},
                    {prop: 'tabIndex', type: 'long'},
                    ]
       });

define('HTMLOptGroupElement', {
       tagName: 'OPTGROUP',
       attributes: [
                    {prop: 'disabled', type: 'boolean'},
                    'label'
                    ]
       });

define('HTMLOptionElement', {
       tagName: 'OPTION',
       init: function() {
       this.addEventListener('DOMAttrModified', function(e) {
                             if (e.attrName === 'selected')
                             this.selected = this.defaultSelected;
                             });
       },
       proto: {
       get form() {
       return closest(this, 'FORM');
       },
       get defaultSelected() {
       return !!this.getAttribute('selected');
       },
       set defaultSelected(s) {
       if (s) this.setAttribute('selected', 'selected');
       else this.removeAttribute('selected');
       },
       get text() {
       return (this.hasAttribute('value')) ? this.getAttribute('value') : this.innerHTML;
       },
       get value() {
       return (this.hasAttribute('value')) ? this.getAttribute('value') : this.innerHTML;
       },
       set value(val) {
       this.setAttribute('value', val);
       },
       get index() {
       return closest(this, 'SELECT').options.toArray().indexOf(this);
       },
       get selected() {
       if (this._selected === undefined) {
       this._selected = this.defaultSelected;
       }
       return this._selected;
       },
       set selected(s) {
       // TODO: The 'selected' content attribute is the initial value of the
       // IDL attribute, but the IDL attribute should not relfect the content
       this._selected = !!s;
       if (s) {
       //Remove the selected bit from all other options in this select
       var select = this._parentNode;
       if (!select) return;
       if (select.nodeName !== 'SELECT') {
       select = select._parentNode;
       if (!select) return;
       if (select.nodeName !== 'SELECT') return;
       }
       if (!select.multiple) {
       var o = select.options;
       for (var i = 0; i < o.length; i++) {
       if (o[i] !== this) {
       o[i].selected = false;
       }
       }
       }
       }
       }
       },
       attributes: [
                    {prop: 'disabled', type: 'boolean'},
                    'label'
                    ]
       });

define('HTMLInputElement', {
       tagName: 'INPUT',
       proto: {
       _initDefaultValue: function() {
       if (this._defaultValue === undefined) {
       var attr = this.getAttributeNode('value');
       this._defaultValue = attr ? attr.value : null;
       }
       return this._defaultValue;
       },
       _initDefaultChecked: function() {
       if (this._defaultChecked === undefined) {
       this._defaultChecked = !!this.getAttribute('checked');
       }
       return this._defaultChecked;
       },
       get form() {
       return closest(this, 'FORM');
       },
       get defaultValue() {
       return this._initDefaultValue();
       },
       get defaultChecked() {
       return this._initDefaultChecked();
       },
       get checked() {
       return !!this.getAttribute('checked');
       },
       set checked(checked) {
       this._initDefaultChecked();
       this.setAttribute('checked', checked);
       },
       get value() {
       return this.getAttribute('value');
       },
       set value(val) {
       this._initDefaultValue();
       if (val === null) {
       this.removeAttribute('value');
       }
       else {
       this.setAttribute('value', val);
       }
       },
       blur: function() {
       },
       focus: function() {
       },
       select: function() {
       },
       click: function() {
       if (this.type === 'checkbox' || this.type === 'radio') {
       this.checked = !this.checked;
       }
       else if (this.type === 'submit') {
       var form = this.form;
       if (form) {
       form._dispatchSubmitEvent();
       }
       }
       }
       },
       attributes: [
                    'accept',
                    'accessKey',
                    'align',
                    'alt',
                    {prop: 'disabled', type: 'boolean'},
                    {prop: 'maxLength', type: 'long'},
                    'name',
                    {prop: 'readOnly', type: 'boolean'},
                    {prop: 'size', type: 'long'},
                    'src',
                    {prop: 'tabIndex', type: 'long'},
                    {prop: 'type', normalize: function(val) {
                    return val ? val.toLowerCase() : 'text';
                    }},
                    'useMap'
                    ]
       });

define('HTMLTextAreaElement', {
       tagName: 'TEXTAREA',
       proto: {
       _initDefaultValue: function() {
       if (this._defaultValue === undefined) {
       this._defaultValue = this.innerHTML;
       }
       return this._defaultValue;
       },
       get form() {
       return closest(this, 'FORM');
       },
       get defaultValue() {
       return this._initDefaultValue();
       },
       get value() {
       return this.innerHTML;
       },
       set value(val) {
       this._initDefaultValue();
       this.innerHTML = val;
       },
       get type() {
       return 'textarea';
       },
       blur: function() {
       },
       focus: function() {
       },
       select: function() {
       }
       },
       attributes: [
                    'accessKey',
                    {prop: 'cols', type: 'long'},
                    {prop: 'disabled', type: 'boolean'},
                    {prop: 'maxLength', type: 'long'},
                    'name',
                    {prop: 'readOnly', type: 'boolean'},
                    {prop: 'rows', type: 'long'},
                    {prop: 'tabIndex', type: 'long'}
                    ]
       });

define('HTMLButtonElement', {
       tagName: 'BUTTON',
       proto: {
       get form() {
       return closest(this, 'FORM');
       }
       },
       attributes: [
                    'accessKey',
                    {prop: 'disabled', type: 'boolean'},
                    'name',
                    {prop: 'tabIndex', type: 'long'},
                    'type',
                    'value'
                    ]
       });

define('HTMLLabelElement', {
       tagName: 'LABEL',
       proto: {
       get form() {
       return closest(this, 'FORM');
       }
       },
       attributes: [
                    'accessKey',
                    {prop: 'htmlFor', attr: 'for'}
                    ]
       });

define('HTMLFieldSetElement', {
       tagName: 'FIELDSET',
       proto: {
       get form() {
       return closest(this, 'FORM');
       }
       }
       });

define('HTMLLegendElement', {
       tagName: 'LEGEND',
       proto: {
       get form() {
       return closest(this, 'FORM');
       }
       },
       attributes: [
                    'accessKey',
                    'align'
                    ]
       });

define('HTMLUListElement', {
       tagName: 'UL',
       attributes: [
                    {prop: 'compact', type: 'boolean'},
                    'type'
                    ]
       });

define('HTMLOListElement', {
       tagName: 'OL',
       attributes: [
                    {prop: 'compact', type: 'boolean'},
                    {prop: 'start', type: 'long'},
                    'type'
                    ]
       });

define('HTMLDListElement', {
       tagName: 'DL',
       attributes: [
                    {prop: 'compact', type: 'boolean'}
                    ]
       });

define('HTMLDirectoryElement', {
       tagName: 'DIR',
       attributes: [
                    {prop: 'compact', type: 'boolean'}
                    ]
       });

define('HTMLMenuElement', {
       tagName: 'MENU',
       attributes: [
                    {prop: 'compact', type: 'boolean'}
                    ]
       });

define('HTMLLIElement', {
       tagName: 'LI',
       attributes: [
                    'type',
                    {prop: 'value', type: 'long'}
                    ]
       });

define('HTMLDivElement', {
       tagName: 'DIV',
       attributes: [
                    'align'
                    ]
       });

define('HTMLParagraphElement', {
       tagName: 'P',
       attributes: [
                    'align'
                    ]
       });

define('HTMLHeadingElement', {
       tagNames: ['H1','H2','H3','H4','H5','H6'],
       attributes: [
                    'align'
                    ]
       });

define('HTMLQuoteElement', {
       tagNames: ['Q','BLOCKQUOTE'],
       attributes: [
                    'cite'
                    ]
       });

define('HTMLPreElement', {
       tagName: 'PRE',
       attributes: [
                    {prop: 'width', type: 'long'}
                    ]
       });

define('HTMLBRElement', {
       tagName: 'BR',
       attributes: [
                    'clear'
                    ]
       });

define('HTMLBaseFontElement', {
       tagName: 'BASEFONT',
       attributes: [
                    'color',
                    'face',
                    {prop: 'size', type: 'long'}
                    ]
       });

define('HTMLFontElement', {
       tagName: 'FONT',
       attributes: [
                    'color',
                    'face',
                    'size'
                    ]
       });

define('HTMLHRElement', {
       tagName: 'HR',
       attributes: [
                    'align',
                    {prop: 'noShade', type: 'boolean'},
                    'size',
                    'width'
                    ]
       });

define('HTMLModElement', {
       tagNames: ['INS', 'DEL'],
       attributes: [
                    'cite',
                    'dateTime'
                    ]
       });

define('HTMLAnchorElement', {
       tagName: 'A',
       
       proto: {
       blur: function() {
       },
       focus: function() {
       },
       get href() {
       return core.resourceLoader.resolve(this._ownerDocument, this.getAttribute('href'));
       }
       },
       attributes: [
                    'accessKey',
                    'charset',
                    'coords',
                    {prop: 'href', type: 'string', read: false},
                    'hreflang',
                    'name',
                    'rel',
                    'rev',
                    'shape',
                    {prop: 'tabIndex', type: 'long'},
                    'target',
                    'type'
                    ]
       });

define('HTMLImageElement', {
       tagName: 'IMG',
       attributes: [
                    'name',
                    'align',
                    'alt',
                    'border',
                    {prop: 'height', type: 'long'},
                    {prop: 'hspace', type: 'long'},
                    {prop: 'isMap', type: 'boolean'},
                    'longDesc',
                    'src',
                    'useMap',
                    {prop: 'vspace', type: 'long'},
                    {prop: 'width', type: 'long'}
                    ]
       });

define('HTMLObjectElement', {
       tagName: 'OBJECT',
       proto: {
       get form() {
       return closest(this, 'FORM');
       },
       get contentDocument() {
       return null;
       }
       },
       attributes: [
                    'code',
                    'align',
                    'archive',
                    'border',
                    'codeBase',
                    'codeType',
                    'data',
                    {prop: 'declare', type: 'boolean'},
                    {prop: 'height',  type: 'long'},
                    {prop: 'hspace',  type: 'long'},
                    'name',
                    'standby',
                    {prop: 'tabIndex', type: 'long'},
                    'type',
                    'useMap',
                    {prop: 'vspace', type: 'long'},
                    {prop: 'width', type: 'long'}
                    ]
       });

define('HTMLParamElement', {
       tagName: 'PARAM',
       attributes: [
                    'name',
                    'type',
                    'value',
                    'valueType'
                    ]
       });

define('HTMLAppletElement', {
       tagName: 'APPLET',
       attributes: [
                    'align',
                    'alt',
                    'archive',
                    'code',
                    'codeBase',
                    'height',
                    {prop: 'hspace', type: 'long'},
                    'name',
                    'object',
                    {prop: 'vspace', type: 'long'},
                    'width'
                    ]
       });

define('HTMLMapElement', {
       tagName: 'MAP',
       proto: {
       get areas() {
       return this.getElementsByTagName("AREA");
       }
       },
       attributes: [
                    'name'
                    ]
       });

define('HTMLAreaElement', {
       tagName: 'AREA',
       attributes: [
                    'accessKey',
                    'alt',
                    'coords',
                    'href',
                    {prop: 'noHref', type: 'boolean'},
                    'shape',
                    {prop: 'tabIndex', type: 'long'},
                    'target'
                    ]
       });

define('HTMLScriptElement', {
       tagName: 'SCRIPT',
       init: function() {
       this.addEventListener('DOMNodeInsertedIntoDocument', function() {
                             if (this.src) {
                             core.resourceLoader.load(this, this.src, this._eval);
                             }
                             else {
                             var src = this.sourceLocation || {},
                             filename = src.file || this._ownerDocument.URL;
                             
                             if (src) {
                             filename += ':' + src.line + ':' + src.col;
                             }
                             filename += '<script>';
                             
                             core.resourceLoader.enqueue(this, this._eval, filename)(null, this.text);
                             }
                             });
       },
       proto: {
       _eval: function(text, filename) {
       if (this._ownerDocument.implementation.hasFeature("ProcessExternalResources", "script") &&
           this.language                                                                      &&
           core.languageProcessors[this.language])
       {
       core.languageProcessors[this.language](this, text, filename);
       }
       },
       get language() {
       var type = this.type || "text/javascript";
       return type.split("/").pop().toLowerCase();
       },
       get text() {
       var i=0, children = this.childNodes, l = children.length, ret = [];
       
       for (i; i<l; i++) {
       ret.push(children.item(i).value);
       }
       
       return ret.join("");
       },
       set text(text) {
       if (this.childNodes.length > 0) {
       var l = this.childNodes.length, i;
       for (i; i<l; i++) {
       this.removeChild(this.childNodes[i]);
       }
       }
       this.appendChild(this._ownerDocument.createTextNode(text));
       }
       },
       attributes : [
                     {prop: 'defer', 'type': 'boolean'},
                     'htmlFor',
                     'event',
                     'charset',
                     'type',
                     'src'
                     ]
       })

define('HTMLTableElement', {
       tagName: 'TABLE',
       proto: {
       get caption() {
       return firstChild(this, 'CAPTION');
       },
       get tHead() {
       return firstChild(this, 'THEAD');
       },
       get tFoot() {
       return firstChild(this, 'TFOOT');
       },
       get rows() {
       if (!this._rows) {
       var table = this;
       this._rows = new core.HTMLCollection(this._ownerDocument, function() {
                                            var sections = [table.tHead].concat(table.tBodies.toArray(), table.tFoot).filter(function(s) { return !!s });
                                            
                                            if (sections.length === 0) {
                                            return core.mapDOMNodes(table, false, function(el) {
                                                                    return el.tagName === 'TR';
                                                                    });
                                            }
                                            
                                            return sections.reduce(function(prev, s) {
                                                                   return prev.concat(s.rows.toArray());
                                                                   }, []);
                                            
                                            });
       }
       return this._rows;
       },
       get tBodies() {
       if (!this._tBodies) {
       this._tBodies = descendants(this, 'TBODY', false);
       }
       return this._tBodies;
       },
       createTHead: function() {
       var el = this.tHead;
       if (!el) {
       el = this._ownerDocument.createElement('THEAD');
       this.appendChild(el);
       }
       return el;
       },
       deleteTHead: function() {
       var el = this.tHead;
       if (el) {
       el._parentNode.removeChild(el);
       }
       },
       createTFoot: function() {
       var el = this.tFoot;
       if (!el) {
       el = this._ownerDocument.createElement('TFOOT');
       this.appendChild(el);
       }
       return el;
       },
       deleteTFoot: function() {
       var el = this.tFoot;
       if (el) {
       el._parentNode.removeChild(el);
       }
       },
       createCaption: function() {
       var el = this.caption;
       if (!el) {
       el = this._ownerDocument.createElement('CAPTION');
       this.appendChild(el);
       }
       return el;
       },
       deleteCaption: function() {
       var c = this.caption;
       if (c) {
       c._parentNode.removeChild(c);
       }
       },
       insertRow: function(index) {
       var tr = this._ownerDocument.createElement('TR');
       if (this.childNodes.length === 0) {
       this.appendChild(this._ownerDocument.createElement('TBODY'));
       }
       var rows = this.rows.toArray();
       if (index < -1 || index > rows.length) {
       throw new core.DOMException(core.INDEX_SIZE_ERR);
       }
       if (index === -1 || (index === 0 && rows.length === 0)) {
       this.tBodies.item(0).appendChild(tr);
       }
       else if (index === rows.length) {
       var ref = rows[index-1];
       ref._parentNode.appendChild(tr);
       }
       else {
       var ref = rows[index];
       ref._parentNode.insertBefore(tr, ref);
       }
       return tr;
       },
       deleteRow: function(index) {
       var rows = this.rows.toArray(), l = rows.length;
       if (index === -1) {
       index = l-1;
       }
       if (index < 0 || index >= l) {
       throw new core.DOMException(core.INDEX_SIZE_ERR);
       }
       var tr = rows[index];
       tr._parentNode.removeChild(tr);
       }
       },
       attributes: [
                    'align',
                    'bgColor',
                    'border',
                    'cellPadding',
                    'cellSpacing',
                    'frame',
                    'rules',
                    'summary',
                    'width'
                    ]
       });

define('HTMLTableCaptionElement', {
       tagName: 'CAPTION',
       attributes: [
                    'align'
                    ]
       });

define('HTMLTableColElement', {
       tagNames: ['COL','COLGROUP'],
       attributes: [
                    'align',
                    {prop: 'ch', attr: 'char'},
                    {prop: 'chOff', attr: 'charoff'},
                    {prop: 'span', type: 'long'},
                    'vAlign',
                    'width',
                    ]
       });

define('HTMLTableSectionElement', {
       tagNames: ['THEAD','TBODY','TFOOT'],
       proto: {
       get rows() {
       if (!this._rows) {
       this._rows = descendants(this, 'TR', false);
       }
       return this._rows;
       },
       insertRow: function(index) {
       var tr = this._ownerDocument.createElement('TR');
       var rows = this.rows.toArray();
       if (index < -1 || index > rows.length) {
       throw new core.DOMException(core.INDEX_SIZE_ERR);
       }
       if (index === -1 || index === rows.length) {
       this.appendChild(tr);
       }
       else {
       var ref = rows[index];
       this.insertBefore(tr, ref);
       }
       return tr;
       },
       deleteRow: function(index) {
       var rows = this.rows.toArray();
       if (index === -1) {
       index = rows.length-1;
       }
       if (index < 0 || index >= rows.length) {
       throw new core.DOMException(core.INDEX_SIZE_ERR);
       }
       var tr = this.rows[index];
       this.removeChild(tr);
       }
       },
       attributes: [
                    'align',
                    {prop: 'ch', attr: 'char'},
                    {prop: 'chOff', attr: 'charoff'},
                    {prop: 'span', type: 'long'},
                    'vAlign',
                    'width',
                    ]
       });

define('HTMLTableRowElement', {
       tagName: 'TR',
       proto: {
       get cells() {
       if (!this._cells) {
       this._cells = new core.HTMLCollection(this, core.mapper(this, function(n) {
                                                               return n.nodeName === 'TD' || n.nodeName === 'TH';
                                                               }, false));
       }
       return this._cells;
       },
       get rowIndex() {
       return closest(this, 'TABLE').rows.toArray().indexOf(this);
       },
       
       get sectionRowIndex() {
       return this._parentNode.rows.toArray().indexOf(this);
       },
       insertCell: function(index) {
       var td = this._ownerDocument.createElement('TD');
       var cells = this.cells.toArray();
       if (index < -1 || index > cells.length) {
       throw new core.DOMException(core.INDEX_SIZE_ERR);
       }
       if (index === -1 || index === cells.length) {
       this.appendChild(td);
       }
       else {
       var ref = cells[index];
       this.insertBefore(td, ref);
       }
       return td;
       },
       deleteCell: function(index) {
       var cells = this.cells.toArray();
       if (index === -1) {
       index = cells.length-1;
       }
       if (index < 0 || index >= cells.length) {
       throw new core.DOMException(core.INDEX_SIZE_ERR);
       }
       var td = this.cells[index];
       this.removeChild(td);
       }
       },
       attributes: [
                    'align',
                    'bgColor',
                    {prop: 'ch', attr: 'char'},
                    {prop: 'chOff', attr: 'charoff'},
                    'vAlign'
                    ]
       });

define('HTMLTableCellElement', {
       tagNames: ['TH','TD'],
       proto: {
       _headers: null,
       set headers(h) {
       if (h === '') {
       //Handle resetting headers so the dynamic getter returns a query
       this._headers = null;
       return;
       }
       if (!(h instanceof Array)) {
       h = [h];
       }
       this._headers = h;
       },
       get headers() {
       if (this._headers) {
       return this._headers.join(' ');
       }
       var cellIndex = this.cellIndex,
       headings  = [],
       siblings  = this._parentNode.getElementsByTagName(this.tagName);
       
       for (var i=0; i<siblings.length; i++) {
       if (siblings.item(i).cellIndex >= cellIndex) {
       break;
       }
       headings.push(siblings.item(i).id);
       }
       this._headers = headings;
       return headings.join(' ');
       },
       get cellIndex() {
       return closest(this, 'TR').cells.toArray().indexOf(this);
       }
       },
       attributes: [
                    'abbr',
                    'align',
                    'axis',
                    'bgColor',
                    {prop: 'ch', attr: 'char'},
                    {prop: 'chOff', attr: 'charoff'},
                    {prop: 'colSpan', type: 'long'},
                    'height',
                    {prop: 'noWrap', type: 'boolean'},
                    {prop: 'rowSpan', type: 'long'},
                    'scope',
                    'vAlign',
                    'width'
                    ]
       });

define('HTMLFrameSetElement', {
       tagName: 'FRAMESET',
       attributes: [
                    'cols',
                    'rows'
                    ]
       });

define('HTMLFrameElement', {
       tagName: 'FRAME',
       proto: {
       setAttribute: function(name, value) {
       core.HTMLElement.prototype.setAttribute.call(this, name, value);
       if (name === "src") {
       if (this._contentDocument) {
       delete this._contentDocument; // TODO: better cleanup
       }
       this._contentDocument = new core.HTMLDocument({
                                                     url: value,
                                                     documentRoot: this._ownerDocument._documentRoot
                                                     });
       
       core.resourceLoader.load(this, value, function(html, filename) {
                                this._contentDocument.write(html);
                                this._contentDocument.close();
                                });
       }
       },
       _contentDocument : null,
       get contentDocument() {
       return this._contentDocument;
       }
       },
       attributes: [
                    'frameBorder',
                    'longDesc',
                    'marginHeight',
                    'marginWidth',
                    'name',
                    {prop: 'noResize', type: 'boolean'},
                    'scrolling',
                    {prop: 'src', type: 'string', write: false}
                    ]
       });

define('HTMLIFrameElement', {
       tagName: 'IFRAME',
       parentClass: core.HTMLFrameElement,
       proto: {
       _contentDocument : null,
       get contentDocument() {
       if (this._contentDocument === null) {
       this._contentDocument = new core.HTMLDocument();
       }
       return this._contentDocument;
       }
       },
       attributes: [
                    'align',
                    'frameBorder',
                    'height',
                    'longDesc',
                    'marginHeight',
                    'marginWidth',
                    'name',
                    'scrolling',
                    'src',
                    'width'
                    ]
       });


