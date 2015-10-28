function ISolidElement(data,parentContainer,globalData, placeholder){
    this.parent.constructor.call(this,data,parentContainer,globalData, placeholder);
}
createElement(BaseElement, ISolidElement);

ISolidElement.prototype.createElements = function(){
    this.parent.createElements.call(this);

    var rect = document.createElementNS(svgNS,'rect');
    rect.setAttribute('width',this.data.sw);
    rect.setAttribute('height',this.data.sh);
    /*rect.setAttribute('width',1);
    rect.setAttribute('height',1);*/
    rect.setAttribute('fill',this.data.sc);
    if(this.layerElement === this.parentContainer){
        this.appendNodeToParent(rect);
    }else{
        this.layerElement.appendChild(rect);
    }
    this.innerElem = rect;
};

ISolidElement.prototype.hide = IImageElement.prototype.hide;
ISolidElement.prototype.renderFrame = IImageElement.prototype.renderFrame;
ISolidElement.prototype.destroy = IImageElement.prototype.destroy;