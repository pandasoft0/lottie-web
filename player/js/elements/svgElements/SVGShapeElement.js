function SVGShapeElement(data,globalData,comp){
    //List of drawable elements
    this.shapes = [];
    // Full shape data
    this.shapesData = data.shapes;
    //List of styles that will be applied to shapes
    this.stylesList = [];
    //List of modifiers that will be applied to shapes
    this.shapeModifiers = [];
    //List of items in shape tree
    this.itemsData = [];
    //List of items in previous shape tree
    this.processedElements = [];
    this.initElement(data,globalData,comp);
    //Moving any property that doesn't get too much access after initialization because of v8 way of handling more than 10 properties.
    // List of elements that have been created
    this.prevViewData = [];
}

extendPrototype([BaseElement,TransformElement,SVGBaseElement,IShapeElement,HierarchyElement,FrameElement,RenderableDOMElement], SVGShapeElement);

SVGShapeElement.prototype.initSecondaryElement = function() {
}

SVGShapeElement.prototype.identityMatrix = new Matrix();

SVGShapeElement.prototype.buildExpressionInterface = function(){};

SVGShapeElement.prototype.createContent = function(){
    this.searchShapes(this.shapesData,this.itemsData,this.prevViewData,this.layerElement,this.dynamicProperties, 0, [], true);
};

SVGShapeElement.prototype.createStyleElement = function(data, level, dynamicProperties){
    //TODO: prevent drawing of hidden styles
    var elementData;
    var styleOb = new SVGStyleData(data, level);

    var pathElement = styleOb.pElem;
    if(data.ty === 'st') {
        elementData = new SVGStrokeStyleData(this, data, dynamicProperties, styleOb);
    } else if(data.ty === 'fl') {
        elementData = new SVGFillStyleData(this, data, dynamicProperties, styleOb);
    } else if(data.ty === 'gf' || data.ty === 'gs') {
        var gradientConstructor = data.ty === 'gf' ? SVGGradientFillStyleData : SVGGradientStrokeStyleData;
        elementData = new gradientConstructor(this, data, dynamicProperties, styleOb);
        this.globalData.defs.appendChild(elementData.gf);
        if (elementData.maskId) {
            this.globalData.defs.appendChild(elementData.ms);
            this.globalData.defs.appendChild(elementData.of);
            pathElement.setAttribute('mask','url(#' + elementData.maskId + ')');
        }
    }
    
    if(data.ty === 'st' || data.ty === 'gs') {
        pathElement.setAttribute('stroke-linecap', this.lcEnum[data.lc] || 'round');
        pathElement.setAttribute('stroke-linejoin',this.ljEnum[data.lj] || 'round');
        pathElement.setAttribute('fill-opacity','0');
        if(data.lj === 1) {
            pathElement.setAttribute('stroke-miterlimit',data.ml);
        }
    }

    if(data.r === 2) {
        pathElement.setAttribute('fill-rule', 'evenodd');
    }

    if(data.ln){
        pathElement.setAttribute('id',data.ln);
    }
    if(data.cl){
        pathElement.setAttribute('class',data.cl);
    }
    this.stylesList.push(styleOb);
    return elementData;
}

SVGShapeElement.prototype.createGroupElement = function(data) {
    var elementData = new ShapeGroupData();
    if(data.ln){
        elementData.gr.setAttribute('id',data.ln);
    }
    return elementData;
}

SVGShapeElement.prototype.createTransformElement = function(data, dynamicProperties) {
    return new SVGTransformData(TransformPropertyFactory.getTransformProperty(this,data,dynamicProperties), PropertyFactory.getProp(this,data.o,0,0.01,dynamicProperties))
}

SVGShapeElement.prototype.createShapeElement = function(data, ownTransformers, level, dynamicProperties) {
    var ty = 4;
    if(data.ty === 'rc'){
        ty = 5;
    }else if(data.ty === 'el'){
        ty = 6;
    }else if(data.ty === 'sr'){
        ty = 7;
    }
    var shapeProperty = ShapePropertyFactory.getShapeProp(this,data,ty,dynamicProperties);
    var elementData = new SVGShapeData(ownTransformers, level, shapeProperty)
    this.shapes.push(elementData.sh);
    this.addShapeToModifiers(elementData);
    return elementData;
}

SVGShapeElement.prototype.setElementStyles = function(elementData){
    var arr = elementData.styles;
    var j, jLen = this.stylesList.length;
    for (j = 0; j < jLen; j += 1) {
        if (!this.stylesList[j].closed) {
            arr.push(this.stylesList[j]);
        }
    }
}

SVGShapeElement.prototype.reloadShapes = function(){
    this.firstFrame = true;
    var i, len = this.itemsData.length;
    for( i = 0; i < len; i += 1) {
        this.prevViewData[i] = this.itemsData[i];
    }
    this.searchShapes(this.shapesData,this.itemsData,this.prevViewData,this.layerElement,this.dynamicProperties, 0, [], true);
    var i, len = this.dynamicProperties.length;
    for(i = 0; i < len; i += 1) {
        this.dynamicProperties[i].getValue();
    }
    this.renderModifiers();
}

SVGShapeElement.prototype.searchShapes = function(arr,itemsData,prevViewData,container,dynamicProperties, level, transformers, render){
    var ownTransformers = [].concat(transformers);
    var i, len = arr.length - 1;
    var j, jLen;
    var ownStyles = [], ownModifiers = [], styleOb, currentTransform, modifier, processedPos;
    for(i=len;i>=0;i-=1){
        processedPos = this.searchProcessedElement(arr[i]);
        if(!processedPos){
            arr[i]._render = render;
        } else {
            itemsData[i] = prevViewData[processedPos - 1];
        }
        if(arr[i].ty == 'fl' || arr[i].ty == 'st' || arr[i].ty == 'gf' || arr[i].ty == 'gs'){
            if(!processedPos){
                itemsData[i] = this.createStyleElement(arr[i], level, dynamicProperties);
            } else {
                itemsData[i].style.closed = false;
            }
            if(arr[i]._render){
                container.appendChild(itemsData[i].style.pElem);
            }
            ownStyles.push(itemsData[i].style);
        }else if(arr[i].ty == 'gr'){
            if(!processedPos){
                itemsData[i] = this.createGroupElement(arr[i]);
            } else {
                jLen = itemsData[i].it.length;
                for(j=0;j<jLen;j+=1){
                    itemsData[i].prevViewData[j] = itemsData[i].it[j];
                }
            }
            this.searchShapes(arr[i].it,itemsData[i].it,itemsData[i].prevViewData,itemsData[i].gr,dynamicProperties, level + 1, ownTransformers, render);
            if(arr[i]._render){
                container.appendChild(itemsData[i].gr);
            }
        }else if(arr[i].ty == 'tr'){
            if(!processedPos){
                itemsData[i] = this.createTransformElement(arr[i], dynamicProperties);
            }
            currentTransform = itemsData[i].transform;
            ownTransformers.push(currentTransform);
        }else if(arr[i].ty == 'sh' || arr[i].ty == 'rc' || arr[i].ty == 'el' || arr[i].ty == 'sr'){
            if(!processedPos){
                itemsData[i] = this.createShapeElement(arr[i], ownTransformers, level, dynamicProperties);
            }
            this.setElementStyles(itemsData[i]);

        }else if(arr[i].ty == 'tm' || arr[i].ty == 'rd' || arr[i].ty == 'ms'){
            if(!processedPos){
                modifier = ShapeModifiers.getModifier(arr[i].ty);
                modifier.init(this,arr[i],dynamicProperties);
                itemsData[i] = modifier;
                this.shapeModifiers.push(modifier);
            } else {
                modifier = itemsData[i];
                modifier.closed = false;
            }
            ownModifiers.push(modifier);
        }else if(arr[i].ty == 'rp'){
            if(!processedPos){
                modifier = ShapeModifiers.getModifier(arr[i].ty);
                itemsData[i] = modifier;
                modifier.init(this,arr,i,itemsData,dynamicProperties);
                this.shapeModifiers.push(modifier);
                render = false;
            }else{
                modifier = itemsData[i];
                modifier.closed = true;
            }
            ownModifiers.push(modifier);
        }
        this.addProcessedElement(arr[i], i + 1);
    }
    len = ownStyles.length;
    for(i=0;i<len;i+=1){
        ownStyles[i].closed = true;
    }
    len = ownModifiers.length;
    for(i=0;i<len;i+=1){
        ownModifiers[i].closed = true;
    }
};

SVGShapeElement.prototype.renderInnerContent = function() {
    this.renderModifiers();
    var i, len = this.stylesList.length;
    for(i=0;i<len;i+=1){
        this.stylesList[i].reset();
    }
    this.renderShape(this.shapesData,this.itemsData, null);

    for (i = 0; i < len; i += 1) {
        if (this.stylesList[i].mdf || this.firstFrame) {
            if(this.stylesList[i].msElem){
                this.stylesList[i].msElem.setAttribute('d', this.stylesList[i].d);
                //Adding M0 0 fixes same mask bug on all browsers
                this.stylesList[i].d = 'M0 0' + this.stylesList[i].d;
            }
            this.stylesList[i].pElem.setAttribute('d', this.stylesList[i].d || 'M0 0');
        }
    }
};


SVGShapeElement.prototype.renderShape = function(items, data, container) {
    //TODO: find out why a container could be missing
    var i, len = items.length - 1;
    var ty;
    for(i=0;i<=len;i+=1){
        ty = items[i].ty;
        if(ty == 'tr'){
            if(this.firstFrame || data[i].transform.op.mdf && container){
                container.setAttribute('opacity',data[i].transform.op.v);
            }
            if(this.firstFrame || data[i].transform.mProps.mdf && container){
                container.setAttribute('transform',data[i].transform.mProps.v.to2dCSS());
            }
        }else if(items[i]._render && (ty == 'sh' || ty == 'el' || ty == 'rc' || ty == 'sr')){
            this.renderPath(data[i]);
        }else if(ty == 'fl'){
            this.renderFill(items[i],data[i]);
        }else if(ty == 'gf'){
            this.renderGradient(items[i],data[i]);
        }else if(ty == 'gs'){
            this.renderGradient(items[i],data[i]);
            this.renderStroke(items[i],data[i]);
        }else if(ty == 'st'){
            this.renderStroke(items[i],data[i]);
        }else if(ty == 'gr'){
            this.renderShape(items[i].it,data[i].it, data[i].gr);
        }else if(ty == 'tm'){
            //
        }
    }

};

SVGShapeElement.prototype.renderPath = function(itemData){
    var j, jLen,pathStringTransformed,redraw,pathNodes,l, lLen = itemData.styles.length;
    var lvl = itemData.lvl;
    var paths, mat, props, iterations, k;
    for(l=0;l<lLen;l+=1){
        redraw = itemData.sh.mdf || this.firstFrame;
        if(itemData.styles[l].lvl < lvl){
            mat = this.mHelper.reset();
            iterations = lvl - itemData.styles[l].lvl;
            k = itemData.transformers.length-1;
            while(iterations > 0) {
                redraw = itemData.transformers[k].mProps.mdf || redraw;
                props = itemData.transformers[k].mProps.v.props;
                mat.transform(props[0],props[1],props[2],props[3],props[4],props[5],props[6],props[7],props[8],props[9],props[10],props[11],props[12],props[13],props[14],props[15]);
                iterations --;
                k --;
            }
        } else {
            mat = this.identityMatrix;
        }
        paths = itemData.sh.paths;
        jLen = paths._length;
        if(redraw){
            pathStringTransformed = '';
            for(j=0;j<jLen;j+=1){
                pathNodes = paths.shapes[j];
                if(pathNodes && pathNodes._length){
                    pathStringTransformed += this.buildShapeString(pathNodes, pathNodes._length, pathNodes.c, mat);
                }
            }
            itemData.caches[l] = pathStringTransformed;
        } else {
            pathStringTransformed = itemData.caches[l];
        }
        itemData.styles[l].d += pathStringTransformed;
        itemData.styles[l].mdf = redraw || itemData.styles[l].mdf;
    }
};

SVGShapeElement.prototype.renderFill = function(styleData,itemData){
    var styleElem = itemData.style;

    if(itemData.c.mdf || this.firstFrame){
        styleElem.pElem.setAttribute('fill','rgb('+bm_floor(itemData.c.v[0])+','+bm_floor(itemData.c.v[1])+','+bm_floor(itemData.c.v[2])+')');
    }
    if(itemData.o.mdf || this.firstFrame){
        styleElem.pElem.setAttribute('fill-opacity',itemData.o.v);
    }
};

SVGShapeElement.prototype.renderGradient = function(styleData, itemData) {
    var gfill = itemData.gf;
    var hasOpacity = itemData.g._hasOpacity;
    var pt1 = itemData.s.v, pt2 = itemData.e.v;

    if (itemData.o.mdf || this.firstFrame) {
        var attr = styleData.ty === 'gf' ? 'fill-opacity' : 'stroke-opacity';
        itemData.style.pElem.setAttribute(attr, itemData.o.v);
    }
    if (itemData.s.mdf || this.firstFrame) {
        var attr1 = styleData.t === 1 ? 'x1' : 'cx';
        var attr2 = attr1 === 'x1' ? 'y1' : 'cy';
        gfill.setAttribute(attr1, pt1[0]);
        gfill.setAttribute(attr2, pt1[1]);
        if (hasOpacity && !itemData.g._collapsable) {
            itemData.of.setAttribute(attr1, pt1[0]);
            itemData.of.setAttribute(attr2, pt1[1]);
        }
    }
    var stops, i, len, stop;
    if (itemData.g.cmdf || this.firstFrame) {
        stops = itemData.cst;
        var cValues = itemData.g.c;
        len = stops.length;
        for (i = 0; i < len; i += 1){
            stop = stops[i];
            stop.setAttribute('offset', cValues[i * 4] + '%');
            stop.setAttribute('stop-color','rgb('+ cValues[i * 4 + 1] + ',' + cValues[i * 4 + 2] + ','+cValues[i * 4 + 3] + ')');
        }
    }
    if (hasOpacity && (itemData.g.omdf || this.firstFrame)) {
        var oValues = itemData.g.o;
        if(itemData.g._collapsable) {
            stops = itemData.cst;
        } else {
            stops = itemData.ost;
        }
        len = stops.length;
        for (i = 0; i < len; i += 1) {
            stop = stops[i];
            if(!itemData.g._collapsable) {
                stop.setAttribute('offset', oValues[i * 2] + '%');
            }
            stop.setAttribute('stop-opacity', oValues[i * 2 + 1]);
        }
    }
    if (styleData.t === 1) {
        if (itemData.e.mdf  || this.firstFrame) {
            gfill.setAttribute('x2', pt2[0]);
            gfill.setAttribute('y2', pt2[1]);
            if (hasOpacity && !itemData.g._collapsable) {
                itemData.of.setAttribute('x2', pt2[0]);
                itemData.of.setAttribute('y2', pt2[1]);
            }
        }
    } else {
        var rad;
        if (itemData.s.mdf || itemData.e.mdf || this.firstFrame) {
            rad = Math.sqrt(Math.pow(pt1[0] - pt2[0], 2) + Math.pow(pt1[1] - pt2[1], 2));
            gfill.setAttribute('r', rad);
            if(hasOpacity && !itemData.g._collapsable){
                itemData.of.setAttribute('r', rad);
            }
        }
        if (itemData.e.mdf || itemData.h.mdf || itemData.a.mdf || this.firstFrame) {
            if (!rad) {
                rad = Math.sqrt(Math.pow(pt1[0] - pt2[0], 2) + Math.pow(pt1[1] - pt2[1], 2));
            }
            var ang = Math.atan2(pt2[1] - pt1[1], pt2[0] - pt1[0]);

            var percent = itemData.h.v >= 1 ? 0.99 : itemData.h.v <= -1 ? -0.99: itemData.h.v;
            var dist = rad * percent;
            var x = Math.cos(ang + itemData.a.v) * dist + pt1[0];
            var y = Math.sin(ang + itemData.a.v) * dist + pt1[1];
            gfill.setAttribute('fx', x);
            gfill.setAttribute('fy', y);
            if (hasOpacity && !itemData.g._collapsable) {
                itemData.of.setAttribute('fx', x);
                itemData.of.setAttribute('fy', y);
            }
        }
        //gfill.setAttribute('fy','200');
    }
};

SVGShapeElement.prototype.renderStroke = function(styleData, itemData) {
    var styleElem = itemData.style;
    var d = itemData.d;
    if (d && (d.mdf || this.firstFrame)) {
        styleElem.pElem.setAttribute('stroke-dasharray', d.dashStr);
        styleElem.pElem.setAttribute('stroke-dashoffset', d.dashoffset[0]);
    }
    if(itemData.c && (itemData.c.mdf || this.firstFrame)){
        styleElem.pElem.setAttribute('stroke','rgb(' + bm_floor(itemData.c.v[0]) + ',' + bm_floor(itemData.c.v[1]) + ',' + bm_floor(itemData.c.v[2]) + ')');
    }
    if(itemData.o.mdf || this.firstFrame){
        styleElem.pElem.setAttribute('stroke-opacity', itemData.o.v);
    }
    if(itemData.w.mdf || this.firstFrame){
        styleElem.pElem.setAttribute('stroke-width', itemData.w.v);
        if(styleElem.msElem){
            styleElem.msElem.setAttribute('stroke-width', itemData.w.v);
        }
    }
};

SVGShapeElement.prototype.destroy = function(){
    this.destroyBaseElement();
    this.shapeData = null;
    this.itemsData = null;
};
