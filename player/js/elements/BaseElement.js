var BaseElement = function (data, animationItem){
    this.animationItem = animationItem;
    this.data = data;
    this.init();
};

BaseElement.prototype.init = function(){
    this.createElements();
    if(this.data.hasMask){
        this.addMasks(this.data);
    }
    if(this.data.eff){
        this.createEffectsManager(this.data);
    }
};

BaseElement.prototype.createElements = function(){
    this.layerElement = document.createElementNS(svgNS,'g');

    this.anchorElement = document.createElementNS(svgNS,'g');
    this.anchorElement.setAttribute('id',this.data.layerName);
    this.layerElement.appendChild(this.anchorElement);


    this.maskingGroup = this.anchorElement;

    this.maskedElement = this.svgElem;

};

BaseElement.prototype.renderFrame = function(num){
    if(this.data.inPoint - this.data.startTime <= num && this.data.outPoint - this.data.startTime > num)
    {
        if(this.isVisible !== true){
            this.isVisible = true;
            this.mainElement.setAttribute('opacity',1);
        }
    }else{
        if(this.isVisible !== false){
            this.isVisible = false;
            this.mainElement.setAttribute('opacity',0);
        }
        return false;
    }
    this.currentAnimData = this.data.renderedData[num].an;

    if(this.data.eff){
        this.effectsManager.renderFrame(num,this.currentAnimData.mk);
    }

    if(num === this.data.renderedFrame.num){
        return true;
    }

    if(this.data.hasMask){
        this.maskManager.renderFrame(num);
    }

    if(this.data.renderedFrame.o !== this.currentAnimData.tr.o){
        this.data.renderedFrame.o = this.currentAnimData.tr.o;
        this.anchorElement.setAttribute('opacity',this.currentAnimData.tr.o);
    }
    var anchorChanged = false;
    if(!this.data.renderedFrame.a || (this.data.renderedFrame.a[0] !== this.currentAnimData.tr.a[0] && this.data.renderedFrame.a[1] !== this.currentAnimData.tr.a[1])){
        this.data.renderedFrame.a = [this.currentAnimData.tr.a[0],this.currentAnimData.tr.a[1]];
        this.anchorElement.setAttribute('transform','translate('+ -this.currentAnimData.tr.a[0]+" "+ -this.currentAnimData.tr.a[1]+")");
        anchorChanged = true;
    }
    var transformChanged = false;
    if(this.data.renderedFrame.tr !== this.currentAnimData.matrixValue){
        this.layerElement.setAttribute('transform',this.currentAnimData.matrixValue);
        this.data.renderedFrame.tr = this.currentAnimData.matrixValue;
        transformChanged = true;
    }

    if(this.data.relateds && (transformChanged || anchorChanged)){
        var relateds = this.data.relateds, i, len = relateds.length, item, itemCont;
        for(i=0;i<len;i++){
            item = relateds[i].item;
            itemCont = relateds[i].itemCont;
            if(anchorChanged){
                item.setAttribute('transform','translate('+ -this.currentAnimData.tr.a[0]+" "+ -this.currentAnimData.tr.a[1]+")");
            }
            if(transformChanged){
                itemCont.setAttribute('transform',this.currentAnimData.matrixValue);
            }
        }
    }
    return true;
};

BaseElement.prototype.getDomElement = function(){
    return this.layerElement;
};
BaseElement.prototype.setMainElement = function(value){
    this.mainElement = value;
};
BaseElement.prototype.getMaskManager = function(){
    return this.maskManager;
};
BaseElement.prototype.addMasks = function(data){
    var params = {
        'data':{value:data},
        'element':{value:this}
    };
    this.maskManager = createElement(MaskElement,null,params);
};
BaseElement.prototype.createEffectsManager = function(data){
    var params = {
        'effects':{value:data.eff},
        'element':{value:this}
    };
    this.effectsManager = createElement(EffectsManager,null,params);
};
BaseElement.prototype.getType = function(){
    return this.type;
};

BaseElement.prototype.getLayerSize = function(){
    if(this.data.type == 'TextLayer'){
        return {w:this.data.textData.width,h:this.data.textData.height};
    }else{
        return {w:this.data.width,h:this.data.height};
    }
};
