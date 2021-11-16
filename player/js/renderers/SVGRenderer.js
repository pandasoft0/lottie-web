function SVGRenderer(animationItem, config){
    this.animationItem = animationItem;
    this.layers = null;
    this.renderedFrame = -1;
    this.globalData = {
        frameNum: -1
    };
    this.renderConfig = {
        preserveAspectRatio: (config && config.preserveAspectRatio) || 'xMidYMid meet'
    };
    this.elements = [];
    this.destroyed = false;
}

SVGRenderer.prototype.createItem = function(layer,parentContainer,comp, placeholder){
    switch(layer.ty){
        case 2:
            return this.createImage(layer,parentContainer,comp, placeholder);
        case 0:
            return this.createComp(layer,parentContainer,comp, placeholder);
        case 1:
            return this.createSolid(layer,parentContainer,comp, placeholder);
        case 4:
            return this.createShape(layer,parentContainer,comp, placeholder);
        case 5:
            return this.createText(layer,parentContainer,comp, placeholder);
        case 99:
            return this.createPlaceHolder(layer,parentContainer);
    }
    return this.createBase(layer,parentContainer,comp);
};

SVGRenderer.prototype.buildItems = function(layers,parentContainer,elements,comp, placeholder){
    var  i, len = layers.length;
    if(!elements){
        elements = this.elements;
    }
    if(!parentContainer){
        parentContainer = this.animationItem.container;
    }
    if(!comp){
        comp = this;
    }
    var elems;
    for (i = len - 1; i >= 0; i--) {
        elements[i] = this.createItem(layers[i],parentContainer,comp, placeholder);
        if (layers[i].ty === 0) {
            elems = [];
            this.buildItems(layers[i].layers,elements[i].getDomElement(),elems,elements[i], elements[i].placeholder);
            elements[i].setElements(elems);
        }
        if(layers[i].td){
            elements[i+1].setMatte(elements[i].layerId);
        }
        //NullLayer
    }
};

SVGRenderer.prototype.includeLayers = function(layers,parentContainer,elements){
    var i, len = layers.length;
    if(!elements){
        elements = this.elements;
    }
    if(!parentContainer){
        parentContainer = this.animationItem.container;
    }
    var j, jLen = elements.length, elems, placeholder;
    for(i=0;i<len;i+=1){
        j = 0;
        while(j<jLen){
            if(elements[j].data.id == layers[i].id){
                placeholder = elements[j];
                elements[j] = this.createItem(layers[i],parentContainer,this, placeholder);
                if (layers[i].ty === 0) {
                    elems = [];
                    this.buildItems(layers[i].layers,elements[j].getDomElement(),elems,elements[j], elements[i].placeholder);
                    elements[j].setElements(elems);
                }
                break;
            }
            j += 1;
        }
    }
    for(i=0;i<len;i+=1){
        if(layers[i].td){
            elements[i+1].setMatte(elements[i].layerId);
        }
    }
};

SVGRenderer.prototype.createBase = function (data,parentContainer,comp, placeholder) {
    return new SVGBaseElement(data, parentContainer,this.globalData,comp, placeholder);
};

SVGRenderer.prototype.createPlaceHolder = function (data,parentContainer) {
    return new PlaceHolderElement(data, parentContainer,this.globalData);
};

SVGRenderer.prototype.createShape = function (data,parentContainer,comp, placeholder) {
    return new IShapeElement(data, parentContainer,this.globalData,comp, placeholder);
};

SVGRenderer.prototype.createText = function (data,parentContainer,comp, placeholder) {
    return new SVGTextElement(data, parentContainer,this.globalData,comp, placeholder);

};

SVGRenderer.prototype.createImage = function (data,parentContainer,comp, placeholder) {
    return new IImageElement(data, parentContainer,this.globalData,comp, placeholder);
};

SVGRenderer.prototype.createComp = function (data,parentContainer,comp, placeholder) {
    return new ICompElement(data, parentContainer,this.globalData,comp, placeholder);

};

SVGRenderer.prototype.createSolid = function (data,parentContainer,comp, placeholder) {
    return new ISolidElement(data, parentContainer,this.globalData,comp, placeholder);
};

SVGRenderer.prototype.configAnimation = function(animData){
    this.animationItem.container = document.createElementNS(svgNS,'svg');
    this.animationItem.container.setAttribute('xmlns','http://www.w3.org/2000/svg');
    this.animationItem.container.setAttribute('width',animData.w);
    this.animationItem.container.setAttribute('height',animData.h);
    this.animationItem.container.setAttribute('viewBox','0 0 '+animData.w+' '+animData.h);
    this.animationItem.container.setAttribute('preserveAspectRatio',this.renderConfig.preserveAspectRatio);
    this.animationItem.container.style.width = '100%';
    this.animationItem.container.style.height = '100%';
    this.animationItem.container.style.transform = 'translate3d(0,0,0)';
    this.animationItem.container.style.transformOrigin = this.animationItem.container.style.mozTransformOrigin = this.animationItem.container.style.webkitTransformOrigin = this.animationItem.container.style['-webkit-transform'] = "0px 0px 0px";
    this.animationItem.wrapper.appendChild(this.animationItem.container);
    //Mask animation
    var defs = document.createElementNS(svgNS, 'defs');
    this.globalData.defs = defs;
    this.animationItem.container.appendChild(defs);
    this.globalData.getAssetData = this.animationItem.getAssetData.bind(this.animationItem);
    this.globalData.getAssetsPath = this.animationItem.getAssetsPath.bind(this.animationItem);
    this.globalData.elementLoaded = this.animationItem.elementLoaded.bind(this.animationItem);
    this.globalData.frameId = 0;
    this.globalData.compSize = {
        w: animData.w,
        h: animData.h
    };
    this.globalData.frameRate = animData.fr;
    var maskElement = document.createElementNS(svgNS, 'clipPath');
    var rect = document.createElementNS(svgNS,'rect');
    rect.setAttribute('width',animData.w);
    rect.setAttribute('height',animData.h);
    rect.setAttribute('x',0);
    rect.setAttribute('y',0);
    var maskId = 'animationMask_'+randomString(10);
    maskElement.setAttribute('id', maskId);
    maskElement.appendChild(rect);
    var maskedElement = document.createElementNS(svgNS,'g');
    maskedElement.setAttribute("clip-path", "url(#"+maskId+")");
    this.animationItem.container.appendChild(maskedElement);
    defs.appendChild(maskElement);
    this.animationItem.container = maskedElement;
    this.layers = animData.layers;
    this.globalData.fontManager = new FontManager();
    this.globalData.fontManager.addChars(animData.chars);
    this.globalData.fontManager.addFonts(animData.fonts,defs);
};

SVGRenderer.prototype.buildStage = function (container, layers,elements) {
    var i, len = layers.length, layerData;
    if(!elements){
        elements = this.elements;
    }
    for (i = len - 1; i >= 0; i--) {
        layerData = layers[i];
        if (layerData.parent !== undefined) {
            this.buildItemParenting(layerData,elements[i],layers,layerData.parent,elements, true);
        }

        if (layerData.ty === 0) {
            this.buildStage(elements[i].getComposingElement(), layerData.layers, elements[i].getElements());
        }
    }
};
SVGRenderer.prototype.buildItemParenting = function (layerData,element,layers,parentName,elements, resetHierarchyFlag) {
    if(!layerData.parents){
        layerData.parents = [];
    }
    if(resetHierarchyFlag){
        element.resetHierarchy();
    }
    var i=0, len = layers.length;
    while(i<len){
        if(layers[i].ind == parentName){
            element.getHierarchy().push(elements[i]);
            if(layers[i].parent !== undefined){
                this.buildItemParenting(layerData,element,layers,layers[i].parent,elements, false);
            }
        }
        i += 1;
    }
};

SVGRenderer.prototype.destroy = function () {
    this.animationItem.wrapper.innerHTML = '';
    this.animationItem.container = null;
    this.globalData.defs = null;
    var i, len = this.layers ? this.layers.length : 0;
    for (i = 0; i < len; i++) {
        this.elements[i].destroy();
    }
    this.elements.length = 0;
    this.destroyed = true;
};

SVGRenderer.prototype.updateContainerSize = function () {
};

SVGRenderer.prototype.renderFrame = function(num){
    if(this.renderedFrame == num || this.destroyed){
        return;
    }
    if(num === null){
        num = this.renderedFrame;
    }else{
        this.renderedFrame = num;
    }
    /*console.log('-------');
    console.log('FRAME ',num);*/
    this.globalData.frameNum = num;
    this.globalData.frameId += 1;
    var i, len = this.layers.length;
    for (i = len - 1; i >= 0; i--) {
        this.elements[i].prepareFrame(num - this.layers[i].st);
    }
    for (i = len - 1; i >= 0; i--) {
        this.elements[i].renderFrame();
    }
};

SVGRenderer.prototype.hide = function(){
    this.animationItem.container.style.display = 'none';
};

SVGRenderer.prototype.show = function(){
    this.animationItem.container.style.display = 'block';
};

SVGRenderer.prototype.setProjectInterface = function(pInterface){
    this.globalData.projectInterface = pInterface;
};

SVGRenderer.prototype.searchExtraCompositions = function(assets){
    var i, len = assets.length;
    var floatingContainer = document.createElementNS(svgNS,'g');
    for(i=0;i<len;i+=1){
        if(assets[i].xt){
            var comp = this.createComp(assets[i],floatingContainer,this.globalData.comp,null);
            var elems = [];
            this.buildItems(assets[i].layers,comp.getDomElement(),elems,comp, comp.placeholder);
            comp.setElements(elems);
            comp.compInterface = CompExpressionInterface(comp);
            Expressions.addLayersInterface(comp.elements, this.globalData.projectInterface);
            this.globalData.projectInterface.registerComposition(comp);
        }
    }
};