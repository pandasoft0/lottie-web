var ShapeModifiers = (function(){
    var ob = {};
    var modifiers = {};
    ob.registerModifier = registerModifier;
    ob.getModifier = getModifier;

    function registerModifier(nm,factory){
        if(!modifiers[nm]){
            modifiers[nm] = factory;
        }
    }

    function getModifier(nm,elem, data, dynamicProperties){
        return new modifiers[nm](elem, data, dynamicProperties);
    }

    return ob;
}());

function ShapeModifier(){}
ShapeModifier.prototype.initModifierProperties = function(){};
ShapeModifier.prototype.addShape = function(shape){
    if(!this.closed){
        this.shapes.push({shape:shape,last:[]});
    }
}
ShapeModifier.prototype.init = function(elem,data,dynamicProperties){
    this.elem = elem;
    this.frameId = -1;
    this.shapes = [];
    this.dynamicProperties = [];
    this.mdf = false;
    this.closed = false;
    this.k = false;
    this.isTrimming = false;
    this.comp = elem.comp;
    this.initModifierProperties(elem,data);
    if(this.dynamicProperties.length){
        this.k = true;
        dynamicProperties.push(this);
    }else{
        this.getValue(true);
    }
}