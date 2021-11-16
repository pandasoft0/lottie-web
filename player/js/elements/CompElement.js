function ICompElement(data,parentContainer,globalData,comp, placeholder){
    this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
    this.layers = data.layers;
    this.isSvg = true;
    this.elements = Array.apply(null,{length:this.layers.length});
    if(this.data.tm){
        this.tm = PropertyFactory.getProp(this,this.data.tm,0,globalData.frameRate,this.dynamicProperties);
    }
}
createElement(SVGBaseElement, ICompElement);

ICompElement.prototype.getComposingElement = function(){
    return this.layerElement;
};

ICompElement.prototype.hide = function(){
    if(!this.hidden){
        var i,len = this.elements.length;
        for( i = 0; i < len; i+=1 ){
            if(this.elements[i]){
                this.elements[i].hide();
            }
        }
        this.hidden = true;
    }
};

ICompElement.prototype.prepareFrame = function(num){
    this._parent.prepareFrame.call(this,num);
    if(this.isVisible===false){
        return;
    }
    var timeRemapped = num;
    if(this.tm){
        timeRemapped = this.tm.v;
        if(timeRemapped === this.data.op){
            timeRemapped = this.data.op - 1;
        }
    }
    this.renderedFrame = timeRemapped/this.data.sr;
    var i,len = this.elements.length;
    for( i = 0; i < len; i+=1 ){
        if(!this.elements[i]){
            this.checkLayer(i, this.renderedFrame - this.layers[i].st, this.layerElement);
        }
        if(this.elements[i]){
            this.elements[i].prepareFrame(timeRemapped/this.data.sr - this.layers[i].st);
        }
    }
};

ICompElement.prototype.renderFrame = function(parentMatrix){
    var renderParent = this._parent.renderFrame.call(this,parentMatrix);
    var i,len = this.layers.length;
    if(renderParent===false){
        this.hide();
        return;
    }

    this.hidden = false;
    for( i = 0; i < len; i+=1 ){
        if(this.elements[i]){
            this.elements[i].renderFrame();
        }
    }
    if(this.firstFrame){
        this.firstFrame = false;
    }
};

ICompElement.prototype.setElements = function(elems){
    this.elements = elems;
};

ICompElement.prototype.getElements = function(){
    return this.elements;
};

ICompElement.prototype.destroy = function(){
    this._parent.destroy.call();
    var i,len = this.layers.length;
    for( i = 0; i < len; i+=1 ){
        this.elements[i].destroy();
    }
};

ICompElement.prototype.checkLayer = BaseRenderer.prototype.checkLayer;
ICompElement.prototype.buildItem = BaseRenderer.prototype.buildItem;
ICompElement.prototype.createItem = SVGRenderer.prototype.createItem;
ICompElement.prototype.buildElementParenting = SVGRenderer.prototype.buildElementParenting;
ICompElement.prototype.createItem = SVGRenderer.prototype.createItem;
ICompElement.prototype.createImage = SVGRenderer.prototype.createImage;
ICompElement.prototype.createComp = SVGRenderer.prototype.createComp;
ICompElement.prototype.createSolid = SVGRenderer.prototype.createSolid;
ICompElement.prototype.createShape = SVGRenderer.prototype.createShape;
ICompElement.prototype.createText = SVGRenderer.prototype.createText;
ICompElement.prototype.createPlaceHolder = SVGRenderer.prototype.createPlaceHolder;
ICompElement.prototype.createBase = SVGRenderer.prototype.createBase;
ICompElement.prototype.buildItemParenting = SVGRenderer.prototype.buildItemParenting;
ICompElement.prototype.appendElementInPos = SVGRenderer.prototype.appendElementInPos;