var Gtlym = {};
(function(){
/****** INIT JSON PARSER ******/
if (typeof JSON !== 'object') {
    JSON = {};
}
(function () {
    'use strict';

    function f(n) {
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate())      + 'T' +
                f(this.getUTCHours())     + ':' +
                f(this.getUTCMinutes())   + ':' +
                f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
                Boolean.prototype.toJSON = function () {
                    return this.valueOf();
                };
    }

    var cx,
        escapable,
        gap,
        indent,
        meta,
        rep;

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {
        var i,

            k,
            v,
            length,
            mind = gap,
            partial,
            value = holder[key];
        if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }
        switch (typeof value) {
            case 'string':
                return quote(value);
            case 'number':
                return isFinite(value) ? String(value) : 'null';
            case 'boolean':
            case 'null':
                return String(value);
            case 'object':
                if (!value) {
                    return 'null';
                }
                gap += indent;
                partial = [];
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }
                    v = partial.length === 0
                        ? '[]'
                        : gap
                        ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                        : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }
                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }
                v = partial.length === 0
                    ? '{}'
                    : gap
                    ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                    : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }
    if (typeof JSON.stringify !== 'function') {
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        meta = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = '';
            indent = '';
            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
            } else if (typeof space === 'string') {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }
            return str('', {'': value});
        };
    }
    if (typeof JSON.parse !== 'function') {
        cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        JSON.parse = function (text, reviver) {
            var j;
            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }
            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }
            if (/^[\],:{}\s]*$/
                .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                    .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                j = eval('(' + text + ')');
                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }
            throw new SyntaxError('JSON.parse');
        };
    }
}());
/****** END JSON PARSER ******/
/****** INIT ARRAY POLYFILLS ******/
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback, thisArg) {
        var T, k;
        if (this == null) {
            throw new TypeError(' this is null or not defined');
        }
        var O = Object(this);
        var len = O.length >>> 0;
        if (typeof callback !== "function") {
            throw new TypeError(callback + ' is not a function');
        }
        if (arguments.length > 1) {
            T = thisArg;
        }
        k = 0;
        while (k < len) {
            var kValue;
            if (k in O) {
                kValue = O[k];
                callback.call(T, kValue, k, O);
            }
            k++;
        }
    };
}
if (!Array.prototype.map) {
    Array.prototype.map = function(callback, thisArg) {

        var T, A, k;

        if (this == null) {
            throw new TypeError(' this is null or not defined');
        }
        var O = Object(this);
        var len = O.length >>> 0;
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }
        if (arguments.length > 1) {
            T = thisArg;
        }
        A = new Array(len);
        k = 0;
        while (k < len) {
            var kValue, mappedValue;
            if (k in O) {
                kValue = O[k];
                mappedValue = callback.call(T, kValue, k, O);
                A[k] = mappedValue;
            }
            k++;
        }

        return A;
    };
}
/****** END ARRAY POLYFILLS ******/

var console = {
    log : function(){
        $.writeln.call($,arguments);
    }
};
/****** INIT Var Declarations ******/
var helperFootage;
//Destination export folder
var exportFolder;
//Interval objects container
//var Gtlym = {};
Gtlym.CALL = {};
//Render cancelled flag
var renderCancelled = false;

//modules
var LayerConverter;
var rqManager;
var extrasInstance;
var AsyncManager;
var DOMAnimationManager;
var CompConverter;
var ShapesParser;
var EffectsParser;
var UI;
/****** INIT Assets Manager ******/
(function(){
    var ob = {};
    var sourceAssets = [];
    var sourceExportData = [];

    function reset(){
        sourceAssets = [];
        sourceExportData = [];
    }

    function associateLayerToSource(layer, source){
        var i=0, len = sourceAssets.length;
        while(i<len){
            if(sourceAssets[i].s === source){
                sourceAssets[i].l.push(layer);
                break;
            }
            i+=1;
        }
    }

    function exportFileFromLayer(layer, filesDirectory){
        var i = 0, len = sourceAssets.length;
        var j, jLen, found = false;
        while(i<len){
            j = 0;
            jLen = sourceAssets[i].l.length;
            while(j<jLen){
                if(sourceAssets[i].l[j] === layer){
                    found = true;
                    if(sourceAssets[i].exported === false){
                        var imageName = 'imagen_'+i;
                        var imageExtension = 'png';
                        var destinationFile = new File(filesDirectory.fullName+'/'+imageName+'.'+imageExtension);
                        sourceAssets[i].f.copy(destinationFile);
                        sourceAssets[i].exported = true;
                        sourceAssets[i].path = 'files/'+imageName+'.'+imageExtension;
                    }
                }
                j+=1;
            }
            if(found === true){
                return i;
            }
            i+=1;
        }
    }

    function createAssetsDataForExport(){
        sourceAssets.forEach(function(item){
            if(item.exported === true){
                sourceExportData.push({path:item.path});
            }
        })
    }

    function createLayerSource(file, layer, source){
        sourceAssets.push({s:source,f:file,l:[layer], exported:false});
    }

    function getAssetsData(){
        return sourceExportData;
    }
    ob.getAssetsData = getAssetsData;
    ob.reset = reset;
    ob.associateLayerToSource = associateLayerToSource;
    ob.createLayerSource = createLayerSource;
    ob.createAssetsDataForExport = createAssetsDataForExport;
    ob.exportFileFromLayer = exportFileFromLayer;
    AssetsManager = ob;

}());
/****** END Assets Manager ******/
/**** Async Manager ****/
(function(){
    var ob = {};
    var asyncCount = 0;
    var callback;
    var asyncElements = [];
    function executeCall(item){
        item.call();
    }
    function executeAsyncCalls(){
        var executingElements = asyncElements.splice(0,asyncElements.length);
        asyncElements.length = 0;
        executingElements.forEach(executeCall);
        asyncCount -= 1;
        if(asyncCount == 0){
            callback.apply();
        }
    }
    function addAsyncCall(fn){
        asyncElements.push(fn);
        if(asyncElements.length == 1){
            asyncCount += 1;
            //Todo Create async call
            extrasInstance.setTimeout(executeAsyncCalls,1);
        }
    }
    function addAsyncCounter(){
        asyncCount += 1;
    }
    function removeAsyncCounter(){
        asyncCount -= 1;
        if(asyncCount == 0){
            callback.apply();
        }
    }
    function getAsyncCounter(){
        return asyncCount;
    }
    function setCallBack(cb){
        callback = cb;
    }
    ob.addAsyncCall = addAsyncCall;
    ob.addAsyncCount = addAsyncCounter;
    ob.removeAsyncCounter = removeAsyncCounter;
    ob.getAsyncCounter = getAsyncCounter;
    ob.setCallBack = setCallBack;
    AsyncManager = ob;
}());
/**** END Async Manager ****/
/****** INIT DOMAnimationMAnager ******/
(function(){
    var frameRate = 0;
    var totalFrames = 0;
    var firstFrame = 0;
    var currentRenderFrame = 0;
    var currentTime = 0;
    var imageCount = 0;
    var zCount = 0;
    var isRenderReady = false;
    var mainComp;
    var mainLayers = [];
    var filesDirectory;
    var callback;

    function getCompositionAnimationData(compo, compositionData,fDirectory){
        mainComp = compo;
        frameRate = mainComp.frameRate;
        currentRenderFrame = 0;
        imageCount = 0;
        zCount = 0;
        mainLayers = [];
        totalFrames = mainComp.workAreaDuration*mainComp.frameRate;
        firstFrame = mainComp.workAreaStart*mainComp.frameRate;
        //totalFrames = 1;
        var animationOb = {};
        compositionData.animation = animationOb;
        compositionData.assets = AssetsManager.getAssetsData();
        animationOb.layers = mainLayers;
        animationOb.totalFrames = totalFrames;
        animationOb.frameRate = frameRate;
        animationOb.ff = mainComp.workAreaStart;
        animationOb.compWidth = mainComp.width;
        animationOb.compHeight = mainComp.height;
        filesDirectory = fDirectory;
        iterateComposition();
    }

    function getMaskMode (num){
        switch(num){
            case MaskMode.NONE:
                return 'n';
            case MaskMode.ADD:
                return 'a';
            case MaskMode.SUBTRACT:
                return 's';
            case MaskMode.INTERSECT:
                return 'i';
            case MaskMode.LIGHTEN:
                return 'l';
            case MaskMode.DARKEN:
                return 'd';
            case MaskMode.DIFFERENCE:
                return 'f';
        }
    }

    function addMasksToLayer(layerInfo,layerOb,time){
        layerOb.mk = [];
        var i, len = layerInfo.mask.numProperties, maskShape, maskElement;
        for(i=0;i<len;i++){
            maskElement = layerInfo.mask(i+1);
            maskShape = layerInfo.mask(i+1).property('maskShape').valueAtTime(time,false);
            layerOb.mk.push({v:extrasInstance.roundNumber(maskShape.vertices,3), i:extrasInstance.roundNumber(maskShape.inTangents,3), o:extrasInstance.roundNumber(maskShape.outTangents,3), t:extrasInstance.roundNumber(maskElement.property('Mask Opacity').valueAtTime(time,false)/100,3)});
        }
    }

    function setMasks(masks,layerOb){
        layerOb.masksProperties = [];
        var i, len = masks.numProperties, maskShape, maskElement;
        for(i=0;i<len;i++){
            maskElement = masks(i+1);
            maskShape = maskElement.property('maskShape').value;
            var shapeData = {
                cl:maskShape.closed,
                inv:maskElement.inverted,
                mode:getMaskMode(maskElement.maskMode)
            };
            extrasInstance.convertToBezierValues(maskElement.property('maskShape'), frameRate, shapeData,'pt');
            extrasInstance.convertToBezierValues(maskElement.property('Mask Opacity'), frameRate, shapeData,'o');
            layerOb.masksProperties.push(shapeData);
        }
    }

    function addStillAsset(layerOb,layerInfo){
        layerOb.assetId = AssetsManager.exportFileFromLayer(layerInfo,filesDirectory);
    }

    function removeExtraData(layersData){
        var i, len = layersData.length,j, jLen, shapes;
        for(i = 0;i<len;i++){
            var layerOb = layersData[i];
            if(layerOb.enabled == false){
                layersData.splice(i,1);
                i -= 1;
                len -= 1;
                continue;
            }
            layerOb.lastData = null ;
            delete layerOb.lastData;
            if(layerOb.type == 'ShapeLayer'){
                shapes = layerOb.shapes;
                jLen = shapes.length;
                for(j=0;j<jLen;j++){
                    shapes[j].lastData = null;
                    delete shapes[j].lastData;
                }
            }
            if(layerOb.type == 'PreCompLayer'){
                removeExtraData(layerOb.layers);
            }
            EffectsParser.saveEffectData(layerOb);
        }
    }

    function processFinalData(layersData){
        var i, len = layersData.length;
        for(i = 0;i<len;i++){
            var layerOb = layersData[i];
            if(layerOb.type == 'ShapeLayer'){
                layerOb.rectData.w = extrasInstance.roundNumber(layerOb.rectData.r - layerOb.rectData.l,3);
                layerOb.rectData.h = extrasInstance.roundNumber(layerOb.rectData.b - layerOb.rectData.t,3);
            }
            if(layerOb.type == 'PreCompLayer'){
                processFinalData(layerOb.layers);
            }
        }
    }

    function buildTextData(textDocument){
        var textDataOb = {};
        textDataOb.font = textDocument.font;
        textDataOb.fontSize = textDocument.fontSize;
        textDataOb.fillColor = extrasInstance.arrayRgbToHex(textDocument.fillColor);
        textDataOb.text = textDocument.text;
        var justification = '';
        switch(textDocument.justification){
            case ParagraphJustification.LEFT_JUSTIFY:
                justification = 'left';
                break;
            case ParagraphJustification.RIGHT_JUSTIFY:
                justification = 'right';
                break;
            case ParagraphJustification.CENTER_JUSTIFY:
                justification = 'center';
                break;
            case ParagraphJustification.FULL_JUSTIFY_LASTLINE_LEFT:
            case ParagraphJustification.FULL_JUSTIFY_LASTLINE_RIGHT:
            case ParagraphJustification.FULL_JUSTIFY_LASTLINE_CENTER:
            case ParagraphJustification.FULL_JUSTIFY_LASTLINE_FULL:
                justification = 'justify';
                break;
            default:
                justification = 'left';
                break;
        }
        textDataOb.justification = justification;
        return textDataOb;
    }

    function createLayers(compo, layersData, frameRate){
        var i, len = compo.layers.length;
        for(i = 0;i<len;i++){
            var layerOb = {};
            var layerInfo = compo.layers[i+1];
            var lType = extrasInstance.layerType(layerInfo);

            if(lType == 'AudioLayer' || lType == 'CameraLayer' || layerInfo.enabled == false){
                //TODO add audios
                layersData.push(layerOb);
                layerOb.enabled = false;
                continue;
            }else if(lType == 'TextLayer'){
                var textProp = layerInfo.property("Source Text");
                var textDocument = textProp.value;
                layerOb.textData = buildTextData(textDocument);
                var r = layerInfo.sourceRectAtTime(0, false);
                layerOb.textData.xOffset = r.left;
                layerOb.textData.yOffset = r.top;
                layerOb.textData.width = r.width;
                layerOb.textData.height = r.height;
                //iterateProperty(layerInfo,0);
            }

            EffectsParser.createEffects(layerInfo,layerOb);

            if(layerInfo.mask.numProperties>0){
                setMasks(layerInfo.mask,layerOb);
                layerOb.hasMask = true;
            }
            layerOb.type = lType;
            if(lType == 'ShapeLayer'){
                ShapesParser.createShapes(layerInfo,layerOb, frameRate);
                layerOb.rectData = {l:0,t:0,b:0,r:0,w:0,h:0};
            }
            if(layerInfo.parent != null){
                layerOb.parent = layerInfo.parent.name;
            }
            layerOb.layerName = layerInfo.name;
            layerOb.threeD = layerInfo.threeDLayer;
            layerOb.an = {};

            if(lType=='PreCompLayer'){
                layerOb.layers = [];
                layerOb.width = layerInfo.source.width;
                layerOb.height = layerInfo.source.height;
                createLayers(layerInfo.source,layerOb.layers,layerInfo.source.frameRate);
            }else if(lType == 'StillLayer'){
                addStillAsset(layerOb,layerInfo);
                layerOb.width = layerInfo.source.width;
                layerOb.height = layerInfo.source.height;
            }else if(lType == 'SolidLayer'){
                layerOb.width = layerInfo.source.width;
                layerOb.height = layerInfo.source.height;
                layerOb.color = extrasInstance.arrayRgbToHex(layerInfo.source.mainSource.color);
            }else if(lType == 'ShapeLayer'){
                layerOb.width = layerInfo.width;
                layerOb.height = layerInfo.height;
            }
            layerOb.inPoint = layerInfo.inPoint*frameRate;
            layerOb.outPoint = layerInfo.outPoint*frameRate;
            layerOb.startTime = layerInfo.startTime*frameRate;
            layerOb.lastData = {};
            layersData.push(layerOb);

            layerOb.ks = {};
            if(layerInfo.transform.opacity.numKeys>1){
                extrasInstance.convertToBezierValues(layerInfo.transform.opacity, frameRate, layerOb.ks,'o');
            }else{
                layerOb.ks.o = extrasInstance.roundNumber(layerInfo.transform.opacity.valueAtTime(0,false),3);
            }
            if(layerInfo.transform.rotation.numKeys>1){
                extrasInstance.convertToBezierValues(layerInfo.transform.rotation, frameRate, layerOb.ks,'r');
            }else{
                layerOb.ks.r = extrasInstance.roundNumber(layerInfo.transform.rotation.valueAtTime(0,false),3);
            }
            if(layerInfo.transform.position.numKeys>1){
                extrasInstance.convertToBezierValues(layerInfo.transform.position, frameRate, layerOb.ks,'p');
            }else{
                layerOb.ks.p = extrasInstance.roundNumber(layerInfo.transform.position.valueAtTime(0,false),3);
            }
            if(layerInfo.transform['Anchor Point'].numKeys>1){
                extrasInstance.convertToBezierValues(layerInfo.transform['Anchor Point'], frameRate, layerOb.ks,'a');
            }else{
                layerOb.ks.a = extrasInstance.roundNumber(layerInfo.transform['Anchor Point'].valueAtTime(0,false),3);
            }
            if(layerInfo.transform['Scale'].numKeys>1){
                extrasInstance.convertToBezierValues(layerInfo.transform['Scale'], frameRate, layerOb.ks,'s');
            }else{
                layerOb.ks.s = extrasInstance.roundNumber(layerInfo.transform['Scale'].valueAtTime(0,false),3);
            }

            if(layerInfo.canSetTimeRemapEnabled && layerInfo.timeRemapEnabled){
                extrasInstance.convertToBezierValues(layerInfo['Time Remap'], frameRate, layerOb,'tm');
            }

        }
    }

    function getParentSize (name,layers){
        var i=0, len = layers.length;
        while(i<len){
            if(layers[i].layerName == name){
                return {width:layers[i].width,height:layers[i].height};
            }
            i++;
        }
        return {width:0,height:0};
    }

    function traverseAnimation(compo,layersData, frameNum, time){
        var i, len = compo.layers.length;
        for(i = 0;i<len;i++){
            var layerInfo = compo.layers[i+1];
            var lType = extrasInstance.layerType(layerInfo);
            if(lType == 'AudioLayer' || lType == 'CameraLayer' || layerInfo.enabled == false){
                //TODO add audios
                continue;
            }
            var layerOb = layersData[i];
            var animData = {};
            if(layerOb.hasMask){
                addMasksToLayer(layerInfo,animData,time);
            }
            animData.tr = {};
            animData.tr.p = [];
            animData.tr.a = [];
            animData.tr.r = [];
            animData.tr.s = [];
            animData.tr.o = {};

            if(layerOb.parent != null){
                var parentSize = getParentSize(layerOb.parent,layersData);
                animData.tr.p[0] = extrasInstance.roundNumber(layerInfo.transform.position.valueAtTime(time,false)[0],3);
                animData.tr.p[1] = extrasInstance.roundNumber(layerInfo.transform.position.valueAtTime(time,false)[1],3);
            }else{
                animData.tr.p[0] = extrasInstance.roundNumber(layerInfo.transform.position.valueAtTime(time,false)[0],3);
                animData.tr.p[1] = extrasInstance.roundNumber(layerInfo.transform.position.valueAtTime(time,false)[1],3);
            }
            if(layerOb.threeD){
                animData.tr.p[2] = extrasInstance.roundNumber(-layerInfo.transform.position.valueAtTime(time,false)[2],3);
            }else{
                animData.tr.p[2] = -zCount;
                zCount++;
            }
            if(lType=='ShapeLayer'){
                var r = layerInfo.sourceRectAtTime(frameNum, false);
                layerOb.rectData.l = extrasInstance.roundNumber(Math.min(r.left,layerOb.rectData.l),3);
                layerOb.rectData.t = extrasInstance.roundNumber(Math.min(r.top,layerOb.rectData.t),3);
                layerOb.rectData.r = extrasInstance.roundNumber(Math.max(r.left+r.width,layerOb.rectData.r),3);
                layerOb.rectData.b = extrasInstance.roundNumber(Math.max(r.top+r.height,layerOb.rectData.b),3);
            }
            animData.tr.a[0] = extrasInstance.roundNumber(layerInfo.transform['Anchor Point'].valueAtTime(time,false)[0],3);
            animData.tr.a[1] = extrasInstance.roundNumber(layerInfo.transform['Anchor Point'].valueAtTime(time,false)[1],3);
            animData.tr.a[2] = extrasInstance.roundNumber(-layerInfo.transform['Anchor Point'].valueAtTime(time,false)[2],3);
            animData.tr.s = extrasInstance.roundNumber([(layerInfo.transform['Scale'].valueAtTime(time,false)[0]/100),(layerInfo.transform['Scale'].valueAtTime(time,false)[1]/100),(layerInfo.transform['Scale'].valueAtTime(time,false)[2]/100)],3);
            if(layerOb.threeD){
                animData.tr.r[0] = extrasInstance.roundNumber((layerInfo.transform['X Rotation'].valueAtTime(time,false)+layerInfo.transform['Orientation'].valueAtTime(time,false)[0])*Math.PI/180,3);
                animData.tr.r[1] = extrasInstance.roundNumber(-(layerInfo.transform['Y Rotation'].valueAtTime(time,false)+layerInfo.transform['Orientation'].valueAtTime(time,false)[1])*Math.PI/180,3);
                animData.tr.r[2] = extrasInstance.roundNumber((layerInfo.transform['Rotation'].valueAtTime(time,false)+layerInfo.transform['Orientation'].valueAtTime(time,false)[2])*Math.PI/180,3);
            }else{
                animData.tr.r[0] = 0;
                animData.tr.r[1] = 0;
                animData.tr.r[2] = extrasInstance.roundNumber(layerInfo.transform['Rotation'].valueAtTime(time,false)*Math.PI/180,3);
            }
            animData.tr.o = extrasInstance.roundNumber(layerInfo.transform['Opacity'].valueAtTime(time,false)/100,3);
            if(lType == 'ShapeLayer'){
                ShapesParser.addFrameData(layerInfo,layerOb, frameNum, time);
            }
            if(lType == 'PreCompLayer'){
                var compoInTime = -layerInfo.startTime;
                traverseAnimation(layerInfo.source,layerOb.layers, frameNum, time+compoInTime);
            }
            //THIS IS REPLACED WITH THE KEYFRAMES. LEAVE THIS FOR NOW.
            /*if(layerOb.lastData.an == null || extrasInstance.compareObjects(animData,layerOb.lastData.an)==false){
             layerOb.an[frameNum] = animData;
             layerOb.lastData.an = animData;
             }*/
            EffectsParser.renderFrame(layerOb,frameNum);
        }
    }

    function iterateComposition(){
        createLayers(mainComp, mainLayers, mainComp.frameRate);
        // TO TRAVERSE LAYER BY LAYER. NEEDED FOR TIME REMAP?
        /*renderCompo(mainComp, mainLayers);
         AssetsManager.createAssetsDataForExport();
         removeExtraData(mainLayers);
         processFinalData(mainLayers);
         callback.apply();*/
        // END TO TRAVERSE LAYER BY LAYER. NEEDED FOR TIME REMAP?
        renderNextFrame();
    }

    function iterateLayer(layerInfo, layerOb,frameRate){
        var duration =layerInfo.duration;
        layerOb.st = layerInfo.startTime;
        var frameNum = 0;
        var time = layerInfo.startTime;

        var lType = extrasInstance.layerType(layerInfo);
        if(lType == 'AudioLayer' || lType == 'CameraLayer' || layerInfo.enabled == false){
            //TODO add audios
            return;
        }
        while(frameNum < duration*frameRate){
            var layerOb = layersData[i];
            var animData = {};
            if(layerOb.hasMask){
                addMasksToLayer(layerInfo,animData,time);
            }
            animData.tr = {};
            animData.tr.p = [];
            animData.tr.a = [];
            animData.tr.r = [];
            animData.tr.s = [];
            animData.tr.o = {};

            if(layerOb.parent != null){
                var parentSize = getParentSize(layerOb.parent,layersData);
                animData.tr.p[0] = extrasInstance.roundNumber(layerInfo.transform.position.valueAtTime(time,false)[0],3);
                animData.tr.p[1] = extrasInstance.roundNumber(layerInfo.transform.position.valueAtTime(time,false)[1],3);
            }else{
                animData.tr.p[0] = extrasInstance.roundNumber(layerInfo.transform.position.valueAtTime(time,false)[0],3);
                animData.tr.p[1] = extrasInstance.roundNumber(layerInfo.transform.position.valueAtTime(time,false)[1],3);
            }
            if(layerOb.threeD){
                animData.tr.p[2] = extrasInstance.roundNumber(-layerInfo.transform.position.valueAtTime(time,false)[2],3);
            }else{
                animData.tr.p[2] = -zCount;
                zCount++;
            }
            if(lType=='ShapeLayer'){
                var r = layerInfo.sourceRectAtTime(frameNum, false);
                layerOb.rectData.l = extrasInstance.roundNumber(Math.min(r.left,layerOb.rectData.l),3);
                layerOb.rectData.t = extrasInstance.roundNumber(Math.min(r.top,layerOb.rectData.t),3);
                layerOb.rectData.r = extrasInstance.roundNumber(Math.max(r.left+r.width,layerOb.rectData.r),3);
                layerOb.rectData.b = extrasInstance.roundNumber(Math.max(r.top+r.height,layerOb.rectData.b),3);
            }
            animData.tr.a[0] = extrasInstance.roundNumber(layerInfo.transform['Anchor Point'].valueAtTime(time,false)[0],3);
            animData.tr.a[1] = extrasInstance.roundNumber(layerInfo.transform['Anchor Point'].valueAtTime(time,false)[1],3);
            animData.tr.a[2] = extrasInstance.roundNumber(-layerInfo.transform['Anchor Point'].valueAtTime(time,false)[2],3);
            animData.tr.s = extrasInstance.roundNumber([(layerInfo.transform['Scale'].valueAtTime(time,false)[0]/100),(layerInfo.transform['Scale'].valueAtTime(time,false)[1]/100),(layerInfo.transform['Scale'].valueAtTime(time,false)[2]/100)],3);
            if(layerOb.threeD){
                animData.tr.r[0] = extrasInstance.roundNumber((layerInfo.transform['X Rotation'].valueAtTime(time,false)+layerInfo.transform['Orientation'].valueAtTime(time,false)[0])*Math.PI/180,3);
                animData.tr.r[1] = extrasInstance.roundNumber(-(layerInfo.transform['Y Rotation'].valueAtTime(time,false)+layerInfo.transform['Orientation'].valueAtTime(time,false)[1])*Math.PI/180,3);
                animData.tr.r[2] = extrasInstance.roundNumber((layerInfo.transform['Rotation'].valueAtTime(time,false)+layerInfo.transform['Orientation'].valueAtTime(time,false)[2])*Math.PI/180,3);
            }else{
                animData.tr.r[0] = 0;
                animData.tr.r[1] = 0;
                animData.tr.r[2] = extrasInstance.roundNumber(layerInfo.transform['Rotation'].valueAtTime(time,false)*Math.PI/180,3);
            }
            animData.tr.o = extrasInstance.roundNumber(layerInfo.transform['Opacity'].valueAtTime(time,false)/100,3);
            if(lType == 'ShapeLayer'){
                ShapesParser.addFrameData(layerInfo,layerOb, frameNum, time);
            }
            //THIS IS REPLACED WITH THE KEYFRAMES. BUT SHOULD BE USED FOR EXPRESSION LAYERS.
            if(layerOb.lastData.an == null || extrasInstance.compareObjects(animData,layerOb.lastData.an)==false){
                layerOb.an[frameNum] = animData;
                layerOb.lastData.an = animData;
            }
            //END FOR EXPRESSION LAYERS

            EffectsParser.renderFrame(layerOb,frameNum);
            frameNum += 1;
            time += 1/frameRate;
        }



        //traverseAnimation(layerInfo.source,layerOb.layers, frameNum, time+compoInTime);
        if(lType == 'PreCompLayer'){
            var i, len = layerInfo.source.layers.length;
            for(i = 0;i<len;i++){
                iterateLayer(layerInfo.source.layers[i+1],layerOb.layers[i],layerInfo.source.frameRate);
            }
        }
    }

    function renderCompo(compo, mainLayers){
        //var duration = compo.duration;
        var i, len = compo.layers.length;
        for(i = 0;i<len;i++){
            iterateLayer(compo.layers[i+1],mainLayers[i],compo.frameRate);
        }
    }

    function renderNextFrame(){
        /*if(currentRenderFrame < totalFrames && renderCancelled === false){
            renderFrame();
            currentRenderFrame +=1;
            renderNextFrame();
            //extrasInstance.setTimeout(renderNextFrame,50);
        }else{
            isRenderReady = true;
            checkRenderReady();
        }*/
        isRenderReady = true;
        checkRenderReady();
    }

    function checkRenderReady(){
        if(AsyncManager.getAsyncCounter() == 0 && isRenderReady == true){
            AssetsManager.createAssetsDataForExport();
            removeExtraData(mainLayers);
            processFinalData(mainLayers);
            callback.apply();
        }
    }

    function renderFrame(){
        currentTime = (currentRenderFrame+firstFrame)/frameRate;
        zCount = 0;
        traverseAnimation(mainComp,mainLayers, currentRenderFrame,currentTime);
    }

    function setCallback(cb){
        callback = cb;
    }

    AsyncManager.setCallBack(checkRenderReady);

    var ob = {};
        ob.getCompositionAnimationData = getCompositionAnimationData;
        ob.setCallback = setCallback;

    DOMAnimationManager = ob;
}());
/****** END DOMAnimationMAnager ******/
/****** INIT Effects Parser ******/
(function(){
    var ob = {};
    var registeredEffects = {};

    function createEffects(layerInfo,layerOb){
        if(layerInfo.effect.numProperties>0){
            layerOb.eff = [];
            var i, len = layerInfo.effect.numProperties, name;
            for(i=0;i<len;i++){
                name = layerInfo.effect(i+1).name;
                if(registeredEffects[name] != null){
                    layerOb.eff.push({parser: registeredEffects[name], id:registeredEffects[name].registerElement(layerInfo.effect(i+1))});
                }
            }
        }
    }

    function renderFrame(layerOb,frameNum){
        if(layerOb.eff){
            layerOb.eff.forEach(function(item){
                item.parser.renderFrame(frameNum);
            });
        }
    }

    function saveEffectData(layerOb){
        if(layerOb.eff){
            layerOb.eff = layerOb.eff.map(function(item){
                return item.parser.getData(item.id);
            });
        }
    }

    function registerEffect(name,object){
        registeredEffects[name] = object;
    }

    ob.registerEffect = registerEffect;
    ob.createEffects = createEffects;
    ob.renderFrame = renderFrame;
    ob.saveEffectData = saveEffectData;

    EffectsParser = ob;

}());
/****** END Effects Parser ******/
/****** INIT Effects Stroke Parser ******/
(function(){
    var ob = {};
    var registeredElements = [];
    var lastValues = {};

    function renderFrame(frameNum, id){
        var effectData = registeredElements[id];
        var effectInfo = effectData.elem;
        for(var s in effectData.animated){
            var propertyValue = getPropertyValue(effectInfo[s].value,getPropertyType(s));
            if(lastValues[s] == null || !extrasInstance.compareObjects(propertyValue,lastValues[s])){
                effectData.animated[s][frameNum] = propertyValue;
                lastValues[s] = propertyValue;
            }
        }
    }

    function getPropertyValue(value,type){
        switch(type)
        {
            case 'color':
                return extrasInstance.arrayRgbToHex(value);
                break;
            default:
                return value;
                break;
        }
    }

    function getPropertyType(propertyName){
        var i = 0;len = animatableProperties.length;
        while(i<len){
            if(animatableProperties[i].name == propertyName){
                return animatableProperties[i].type;
            }
            i++;
        }
        return '';
    }

    function getData(id){
        return registeredElements[id];
    }

    function registerElement(elem){
        var effectData = {
            type: 'Stroke',
            effectInfo : elem,
            effectDataPath : elem['Path'].value,
            allMasks : elem['All Masks'].value,
            strokeSequentially : elem['Stroke Sequentially'].value,
            animated: {},
            singleValue: {}
        };
        registeredElements.push(effectData);
        animatableProperties.forEach(function(item){
            if(elem[item.name].numKeys == 0){
                effectData.singleValue[item.name] = getPropertyValue(effectInfo[item.name].value, item.type);
            }else{
                effectData.animated[item.name] = {};
            }
        });
        return registeredElements.length;
    }
    var animatableProperties = [{name:'Color',type:'color'},{name:'Brush Size',type:'simple'},{name:'Brush Hardness',type:'simple'},{name:'Opacity',type:'simple'},{name:'Start',type:'simple'},{name:'End',type:'simple'},{name:'Spacing',type:'simple'},{name:'Paint Style',type:'simple'}];
    var i, len = animatableProperties.length;

    ob.renderFrame = renderFrame;
    ob.getData = getData;
    ob.registerElement = registerElement;
    EffectsParser.registerEffect('Stroke',ob);
}());
/****** END Effects Stroke Parser ******/
/****** INIT extras******/
(function (){
    function getItemByName(name,collection){
        for(var i=0;i<collection.length;i++){
            if(collection[i+1].name==name){
                return collection[i+1];
            }
        }
        return null;
    }

    function compareObjects(object1,object2){
        return JSON.stringify(object1) === JSON.stringify(object2);
    }

    function roundNumber(num, decimals){
        if( typeof num == 'number'){
            return parseFloat(num.toFixed(decimals));
        }else{
            return roundArray(num,decimals);
        }
    }

    function roundArray(arr, decimals){
        var i, len = arr.length;
        var retArray = [];
        for( i = 0; i < len ; i += 1){
            if( typeof arr[i] == 'number'){
                retArray.push(roundNumber(arr[i],decimals));
            }else{
                retArray.push(roundArray(arr[i],decimals));
            }
        }
        return retArray;
    }

    function setInterval(func,millis){
        var guid = getRandomName(10);
        Gtlym.CALL["interval_"+guid] = func;
        return app.scheduleTask('Gtlym.CALL["interval_'+guid+'"]();',millis,true);
    }

    function setTimeout(func,millis){
        var guid = getRandomName(10);
        Gtlym.CALL["interval_"+guid] = func;
        return app.scheduleTask('Gtlym.CALL["interval_'+guid+'"]();',millis,false);
    }

    function cancelTimeout(id){
        app.cancelTask(id);
    }

    function cancelInterval(id){
        app.cancelTask(id);
    }

    function removeDirectoryContent(f, callback){
        var removeNextItem = function(){
            currentFileIndex++;
            if(currentFileIndex == len){
                callback.apply();
            }else{
                removeFileFromDisk(files[currentFileIndex],removeNextItem);
            }
        };
        var files = f.getFiles();
        var len = files.length;
        var currentFileIndex = 0;
        if(len==0){
            callback.apply();
        }else{
            removeFileFromDisk(files[currentFileIndex],removeNextItem);
        }
    }

    function removeFileFromDisk(f, cb){
        //$.writeln('f',f.fullName);
        var callback = cb;
        var currentFileIndex =0;
        var removeNextItem = function(){
            currentFileIndex++;
            if(currentFileIndex >= len){
                if(f.remove()){
                    //$.writeln('folder success',fName);
                    callback.apply();
                }else{
                    //$.writeln('folder failed',fName);
                }
            }else{
                removeFileFromDisk(files[currentFileIndex],removeNextItem);
            }
        };
        if (f instanceof File){
            if(f.remove()){
                //$.writeln('file success',fName);
                callback.apply();
            }else{
                //$.writeln('file failed',fName);
            }
        }else{
            var files = f.getFiles();
            var len = files.length;
            if(len==0){
                removeNextItem();
            }else{
                removeFileFromDisk(files[currentFileIndex],removeNextItem);
            }
        }
    }

    function getRandomName(length){
        var sequence = 'abcdefghijklmnoqrstuvwxyz1234567890';
        var returnString ='';
        for(var	i=0;i<length;i++){
            returnString += sequence.charAt(Math.floor(Math.random()*sequence.length));
        }
        return returnString;
    }

    function iterateProperty(property, space){
        if(space === null || space === undefined){
            space = 0;
        }
        var spaceString ='';
        for(var a=0;a<space;a++){
            spaceString+='     ';
        }
        if(property.numProperties){
            $.writeln(spaceString+'--- new iteration '+property.name+' ---');
            var i=0, len = property.numProperties;
            while(i<len){
                $.writeln(spaceString+'-> '+property(i+1).name +" | "+property(i+1).matchName );
                iterateProperty(property(i+1), space+1);
                i++;
            }
        }else{
            if(property.propertyValueType != PropertyValueType.NO_VALUE && property.value != undefined){
                $.writeln(spaceString+'--- Value:'+property.value.toString()+' ---');
            }else{
                $.writeln(spaceString+'--- No Value:'+' ---');
            }
        }
    }

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function arrayRgbToHex(values) {
        return rgbToHex(Math.round(values[0]*255),Math.round(values[1]*255),Math.round(values[2]*255));
    }

    function layerType(layerOb){
        function avLayerType(lObj){
            var lSource = lObj.source;
            if(lSource instanceof CompItem){
                return "PreCompLayer";
            }
            var lMainSource = lSource.mainSource;
            var lFile = lMainSource.file;
            if(!lObj.hasVideo){
                return "AudioLayer";
            }else if(lSource instanceof CompItem){
                return "PreCompLayer";
            }else if(lSource.frameDuration < 1){
                if(lMainSource instanceof PlaceholderSource){
                    return "PlaceholderVideoLayer";
                }else if(lSource.name.toString().indexOf("].") != -1){
                    return "ImageSequenceLayer";
                }else{
                    return "VideoLayer";
                }
            }else if(lSource.frameDuration == 1){
                if(lMainSource instanceof PlaceholderSource){
                    return "PlaceholderStillLayer";
                }else if(lMainSource.color){
                    return "SolidLayer";
                }else{
                    return "StillLayer";
                }
            }
        }
        try{
            var curLayer,instanceOfArray,instanceOfArrayLength,result;
            curLayer = layerOb;
            instanceOfArray = [AVLayer, CameraLayer, LightLayer, ShapeLayer, TextLayer];
            instanceOfArrayLength = instanceOfArray.length;
            if(curLayer.guideLayer){
                return "GuideLayer";
            }else if(curLayer.isTrackMatte){
                return "TrackMatteLayer";
            }else if(curLayer.adjustmentLayer){
                return "AdjustmentLayer";
            }
            for(var i = 0;i<instanceOfArrayLength;i++){
                if(curLayer instanceof instanceOfArray[i]){
                    result = instanceOfArray[i].name;
                    break;
                }
            }
            if(result == "AVLayer"){
                result = avLayerType(curLayer);
            };
            return result;
        }catch(err){alert(err.line.toString+" "+err.toString())}
    }

    function getprojectItemType(item){
        var getType = {};
        var type = getType.toString.call(item);
        var itemType = '';
        switch(type){
            case "[object FolderItem]":
                itemType = 'Folder';
                break;
            case "[object FootageItem]":
                itemType = 'Footage';
                break;
            case "[object CompItem]":
                itemType = 'Comp';
                break;
            default:
                itemType = type;
                break;

        }
        return itemType;
    }

    function convertToBezierValues(property, frameRate, ob,propertyName){
        function getPropertyValue(value, roundFlag){
            switch(property.propertyValueType){
                case PropertyValueType.SHAPE:
                    var elem = {
                        i : roundFlag ? extrasInstance.roundNumber(value.inTangents,3) :  value.inTangents,
                        o : roundFlag ? extrasInstance.roundNumber(value.outTangents,3) : value.outTangents,
                        v : roundFlag ? extrasInstance.roundNumber(value.vertices,3) : value.vertices
                    };
                    return elem;
                case PropertyValueType.COLOR:
                    var i, len = value.length;
                    for(i = 0; i < len; i+=1){
                        value[i] = Math.round(value[i]*255);
                    }
                    return value;
                default:
                    return roundFlag ? extrasInstance.roundNumber(value,3) :  value;
            }
        }

        var j = 1, jLen = property.numKeys;
        var beziersArray = [];
        var averageSpeed, duration;
        var bezierIn, bezierOut;
        function buildSegment(segmentOb, indexTime){
            function getRealInfluence(property,handle,time,diff,keyNum, keyOb){
                function iterateNextInfluence(){
                    referenceValue = getPropertyValue(property.valueAtTime(time+diff, false), false);
                    //$.writeln('COMPARE: ',originalValue,referenceValue,' -- count: ',count);
                    //$.writeln('property.keyInTemporalEase(keyNum): ',property.keyInTemporalEase(keyNum)[0].influence);
                    //$.writeln('currentInfluence: ',currentInfluence);
                    if(extrasInstance.compareObjects(originalValue,referenceValue) ==  true){
                        //$.writeln('IGUALES: ',originalValue,referenceValue);
                        if(currentInfluence == 0.1){
                            loop = false;
                        }
                        topInfluence = currentInfluence;
                        currentInfluence -= (currentInfluence - lastInfluence)/2;
                        if(currentInfluence < 0.1){
                            currentInfluence = 0.1;
                        }
                        if(topInfluence - currentInfluence < 0.0001){
                            loop = false;
                        }
                    }else{
                        //$.writeln('DIFERENTES: ',currentInfluence);
                        lastInfluence = currentInfluence;
                        currentInfluence += (topInfluence-currentInfluence)/2;
                        if(currentInfluence - lastInfluence< 0.0001){
                            loop = false;
                        }
                    }
                    //$.writeln('-- --- --');
                    if(originalInfluence - currentInfluence < 0.0001){
                        loop = false;
                    }
                    count +=1;
                    if(count >= 20){
                        //$.writeln('count exceeded');
                        loop = false;
                    }
                    if( loop == true){
                        if(handle == 'out'){
                            //keyOut[0]= new KeyframeEase(keyOut[0].speed,currentInfluence);
                            keyNew = new KeyframeEase(keyOut[0].speed,currentInfluence);
                            property.setTemporalEaseAtKey(keyNum, [keyIn[0]], [keyNew]);
                        }else{
                            //keyIn[0] = new KeyframeEase(keyIn[0].speed,currentInfluence);
                            keyNew = new KeyframeEase(keyIn[0].speed,currentInfluence);
                            property.setTemporalEaseAtKey(keyNum, [keyNew], [keyOut[0]]);
                        }
                        iterateNextInfluence();
                        //AsyncManager.addAsyncCall(iterateNextInfluence);
                        //extrasInstance.setTimeout(iterateNextInfluence,1);
                    }else{
                        if(handle == 'out'){
                            keyNew = new KeyframeEase(keyOut[0].speed,originalInfluence);
                            property.setTemporalEaseAtKey(keyNum, [keyIn[0]], [keyNew]);
                        }else{
                            keyNew = new KeyframeEase(keyIn[0].speed,originalInfluence);
                            property.setTemporalEaseAtKey(keyNum, [keyNew], [keyOut[0]]);
                        }
                        //$.writeln('ccccccccurrentInfluence: ',currentInfluence);
                        //$.writeln('keyOb: ',keyOb);
                        keyOb.influence = currentInfluence;
                        influenceReadyCount -= 1;
                        realInfluenceReady();
                        //AsyncManager.removeAsyncCounter();
                    }
                }
                var count = 0;
                var referenceValue;
                var lastInfluence = 0;
                var originalValue = getPropertyValue(property.valueAtTime(time+diff, false), false);
                //$.writeln('originalValue UNO: ',originalValue);
                var keyIn = property.keyInTemporalEase(keyNum);
                var keyOut = property.keyOutTemporalEase(keyNum);
                var keyNew, originalInfluence;
                if(handle == 'out'){
                    originalInfluence = keyOut[0].influence;
                }else{
                    originalInfluence = keyIn[0].influence;
                }
                if(originalInfluence<0.1){
                    keyOb.influence = originalInfluence;
                    influenceReadyCount -= 1;
                    realInfluenceReady();
                    return;
                }
                if(handle == 'out'){
                    //keyOut[0]= new KeyframeEase(keyOut[0].speed,originalInfluence);
                    keyNew = new KeyframeEase(keyOut[0].speed,originalInfluence);
                    property.setTemporalEaseAtKey(keyNum, [keyIn[0]], [keyNew]);
                }else{
                    //keyIn[0] = new KeyframeEase(keyIn[0].speed,originalInfluence);
                    keyNew = new KeyframeEase(keyIn[0].speed,originalInfluence);
                    property.setTemporalEaseAtKey(keyNum, [keyNew], [keyOut[0]]);
                }
                var topInfluence = originalInfluence;
                var currentInfluence = originalInfluence/2;
                //AsyncManager.addAsyncCounter();
                originalValue = getPropertyValue(property.valueAtTime(time+diff, false), false);
                if(handle == 'out'){
                    keyNew= new KeyframeEase(keyOut[0].speed,currentInfluence);
                    property.setTemporalEaseAtKey(keyNum, [keyIn[0]], [keyNew]);
                }else{
                    keyNew = new KeyframeEase(keyIn[0].speed,currentInfluence);
                    property.setTemporalEaseAtKey(keyNum, [keyNew], [keyOut[0]]);
                }
                var loop = true;
                while(loop){
                    referenceValue = getPropertyValue(property.valueAtTime(time+diff, false), false);
                    if(extrasInstance.compareObjects(originalValue,referenceValue) ==  true){
                        //$.writeln('IGUALES: ',originalValue,referenceValue);
                        if(currentInfluence == 0.1){
                            loop = false;
                        }
                        topInfluence = currentInfluence;
                        currentInfluence -= (currentInfluence - lastInfluence)/2;
                        if(currentInfluence < 0.1){
                            currentInfluence = 0.1;
                        }
                        if(topInfluence - currentInfluence < 0.0001){
                            loop = false;
                        }
                    }else{
                        //$.writeln('DIFERENTES: ',currentInfluence);
                        lastInfluence = currentInfluence;
                        currentInfluence += (topInfluence-currentInfluence)/2;
                        if(currentInfluence - lastInfluence< 0.0001){
                            loop = false;
                        }
                    }
                    //$.writeln('-- --- --');
                    if(originalInfluence - currentInfluence < 0.0001){
                        loop = false;
                    }
                    count +=1;
                    if(count >= 20){
                        //$.writeln('count exceeded');
                        loop = false;
                    }
                    if(handle == 'out'){
                        keyNew = new KeyframeEase(keyOut[0].speed,currentInfluence);
                        property.setTemporalEaseAtKey(keyNum, [keyIn[0]], [keyNew]);
                    }else{
                        keyNew = new KeyframeEase(keyIn[0].speed,currentInfluence);
                        property.setTemporalEaseAtKey(keyNum, [keyNew], [keyOut[0]]);
                    }
                }
                if(handle == 'out'){
                    keyNew = new KeyframeEase(keyOut[0].speed,originalInfluence);
                    property.setTemporalEaseAtKey(keyNum, [keyIn[0]], [keyNew]);
                }else{
                    keyNew = new KeyframeEase(keyIn[0].speed,originalInfluence);
                    property.setTemporalEaseAtKey(keyNum, [keyNew], [keyOut[0]]);
                }
                keyOb.influence = currentInfluence;
                influenceReadyCount -= 1;
                realInfluenceReady();

                /*AsyncManager.addAsyncCall(function(){
                    originalValue = getPropertyValue(property.valueAtTime(time+diff, false), false);
                    if(handle == 'out'){
                        keyNew= new KeyframeEase(keyOut[0].speed,currentInfluence);
                        property.setTemporalEaseAtKey(keyNum, [keyIn[0]], [keyNew]);
                    }else{
                        keyNew = new KeyframeEase(keyIn[0].speed,currentInfluence);
                        property.setTemporalEaseAtKey(keyNum, [keyNew], [keyOut[0]]);
                    }
                    AsyncManager.addAsyncCall(iterateNextInfluence,1);
                },1);*/
            }

            function getCurveLength(initPos,endPos, outBezier, inBezier){
                var k, curveSegments = 5000;
                var point,lastPoint = null;
                var ptDistance;
                var absToCoord,absTiCoord;
                var triCoord1,triCoord2,triCoord3,liCoord1,liCoord2,ptCoord,perc,addedLength = 0;
                for(k=0;k<curveSegments;k+=1){
                    point = [];
                    perc = k/(curveSegments-1);
                    ptDistance = 0;
                    absToCoord = [];
                    absTiCoord = [];
                    outBezier.forEach(function(item,index){
                        if(absToCoord[index] == null){
                            absToCoord[index] = initPos[index] + outBezier[index];
                            absTiCoord[index] = endPos[index] + inBezier[index];
                        }
                        triCoord1 = initPos[index] + (absToCoord[index] - initPos[index])*perc;
                        triCoord2 = absToCoord[index] + (absTiCoord[index] - absToCoord[index])*perc;
                        triCoord3 = absTiCoord[index] + (endPos[index] - absTiCoord[index])*perc;
                        liCoord1 = triCoord1 + (triCoord2 - triCoord1)*perc;
                        liCoord2 = triCoord2 + (triCoord3 - triCoord2)*perc;
                        ptCoord = liCoord1 + (liCoord2 - liCoord1)*perc;
                        point.push(ptCoord);
                        if(lastPoint !== null){
                            ptDistance += Math.pow(point[index] - lastPoint[index],2);
                        }
                    });
                    ptDistance = Math.sqrt(ptDistance);
                    addedLength += ptDistance;
                    lastPoint = point;
                }
                return addedLength;
            }

            function realInfluenceReady(){
                if(influenceReadyCount != 0){
                    getRealInfluence(property,'out',lastKey.time,0.01/frameRate,indexTime,lastKey.easeOut);
                    return;
                }
                if(interpolationType == 'hold'){
                    segmentOb.t = extrasInstance.roundNumber(lastKey.time*frameRate,3);
                    segmentOb.s = getPropertyValue(property.keyValue(j), true);
                    if(!(segmentOb.s instanceof Array)){
                        segmentOb.s = [segmentOb.s];
                    }
                    segmentOb.h = 1;
                    j += 1;
                    buildNextSegment();
                    return;
                }
                duration = key.time - lastKey.time;
                len = key.value.length;
                bezierIn = {};
                bezierOut = {};
                averageSpeed = 0;
                switch(property.propertyValueType){
                    case PropertyValueType.ThreeD_SPATIAL:
                    case PropertyValueType.TwoD_SPATIAL:
                        bezierIn.x = 1 - key.easeIn.influence / 100;
                        bezierOut.x = lastKey.easeOut.influence / 100;
                        averageSpeed = getCurveLength(lastKey.value,key.value, lastKey.to, key.ti)/duration;
                        break;
                    case PropertyValueType.SHAPE:
                        bezierIn.x = 1 - key.easeIn.influence / 100;
                        bezierOut.x = lastKey.easeOut.influence / 100;
                        averageSpeed = 1;
                        break;
                    case PropertyValueType.ThreeD:
                    case PropertyValueType.TwoD:
                    case PropertyValueType.OneD:
                    case PropertyValueType.COLOR:
                        bezierIn.x = [];
                        bezierOut.x = [];
                        key.easeIn.forEach(function(item, index){
                            bezierIn.x[index] = item.influence / 100;
                            bezierOut.x[index] = lastKey.easeOut[index].influence / 100;

                        });
                        averageSpeed = [];
                        for(i=0;i<len;i+=1){
                            averageSpeed[i] =  (key.value[i] - lastKey.value[i])/duration;
                        }
                        break;
                }
                if(averageSpeed == 0){
                    bezierIn.y = bezierIn.x;
                    bezierOut.y = bezierOut.x;
                }else{
                    switch(property.propertyValueType){
                        case PropertyValueType.ThreeD_SPATIAL:
                        case PropertyValueType.TwoD_SPATIAL:
                        case PropertyValueType.SHAPE:
                            bezierIn.y =  1 - ((key.easeIn.speed) / averageSpeed) * (key.easeIn.influence / 100);
                            bezierOut.y = ((lastKey.easeOut.speed) / averageSpeed) * bezierOut.x;
                            break;
                        case PropertyValueType.ThreeD:
                        case PropertyValueType.TwoD:
                        case PropertyValueType.OneD:
                        case PropertyValueType.COLOR:
                            bezierIn.y = [];
                            bezierOut.y = [];
                            key.easeIn.forEach(function(item,index){
                                if(averageSpeed[index] == 0 || averageSpeed[index] == item.speed){
                                    bezierIn.y[index] = bezierIn.x[index];
                                    bezierOut.y[index] = bezierOut.x[index];
                                }else{
                                    bezierIn.y[index] = 1 - ((item.speed) / averageSpeed[index]) * (item.influence / 100);
                                    bezierOut.y[index] = ((lastKey.easeOut[index].speed) / averageSpeed[index]) * bezierOut.x[index];
                                }
                            });
                            break;
                    }
                    //bezierIn.y =  1 - ((key.easeIn.speed) / averageSpeed) * (key.easeIn.influence / 100);
                   // bezierOut.y = ((lastKey.easeOut.speed) / averageSpeed) * bezierOut.x;
                }
                if(property.propertyValueType == PropertyValueType.ThreeD_SPATIAL || property.propertyValueType == PropertyValueType.TwoD_SPATIAL || property.propertyValueType == PropertyValueType.SHAPE ){
                    property.expression = propertyExpression;
                }
                bezierIn.x = extrasInstance.roundNumber(bezierIn.x,3);
                bezierIn.y = extrasInstance.roundNumber(bezierIn.y,3);
                bezierOut.x = extrasInstance.roundNumber(bezierOut.x,3);
                bezierOut.y = extrasInstance.roundNumber(bezierOut.y,3);
                segmentOb.i = bezierIn;
                segmentOb.o = bezierOut;
                segmentOb.t = extrasInstance.roundNumber(lastKey.time*frameRate,3);
                segmentOb.s = getPropertyValue(property.keyValue(j), true);
                segmentOb.e = getPropertyValue(property.keyValue(j+1), true);
                if(!(segmentOb.s instanceof Array)){
                    segmentOb.s = [segmentOb.s];
                    segmentOb.e = [segmentOb.e];
                }
                if(property.propertyValueType == PropertyValueType.ThreeD_SPATIAL || property.propertyValueType == PropertyValueType.TwoD_SPATIAL ){
                    segmentOb.to = lastKey.to;
                    segmentOb.ti = key.ti;
                }
                j += 1;
                buildNextSegment();
            }

            var i, len;
            var influenceReadyCount = 0;
            var key = {};
            var lastKey = {};
            var interpolationType = '';
            key.time = property.keyTime(indexTime+1);
            lastKey.time = property.keyTime(indexTime);
            key.value = getPropertyValue(property.keyValue(indexTime+1), false);
            lastKey.value = getPropertyValue(property.keyValue(indexTime), false);
            if(!(key.value instanceof Array)){
                key.value = [key.value];
                lastKey.value = [lastKey.value];
            }
            if(property.keyOutInterpolationType(indexTime) == KeyframeInterpolationType.HOLD){
                interpolationType = 'hold';
                realInfluenceReady();
            }else{
                buildKeyInfluence(key, lastKey, indexTime);
                switch(property.propertyValueType){
                    case PropertyValueType.ThreeD_SPATIAL:
                    case PropertyValueType.TwoD_SPATIAL:
                        lastKey.to = property.keyOutSpatialTangent(indexTime);
                        key.ti = property.keyInSpatialTangent(indexTime+1);
                    case PropertyValueType.SHAPE:
                        influenceReadyCount = 2;
                        var propertyExpression = property.expression;
                        property.expression = "velocityAtTime(time)";
                        getRealInfluence(property,'in',key.time,-0.01/frameRate,indexTime+1,key.easeIn);
                        break;
                    default:
                        realInfluenceReady();
                }
            }
        }

        if(property.numKeys <= 1){
            //beziersArray.push(getPropertyValue(property.valueAtTime(0,true), true));
            ob[propertyName] = getPropertyValue(property.valueAtTime(0,true), true);
            return;
        }

        function buildKeyInfluence(key,lastKey, indexTime){
            switch(property.propertyValueType){
                case PropertyValueType.ThreeD_SPATIAL:
                case PropertyValueType.TwoD_SPATIAL:
                case PropertyValueType.SHAPE:
                    key.easeIn = {
                        influence : property.keyInTemporalEase(indexTime+1)[0].influence,
                        speed : property.keyInTemporalEase(indexTime+1)[0].speed
                    };
                    lastKey.easeOut = {
                        influence : property.keyOutTemporalEase(indexTime)[0].influence,
                        speed : property.keyOutTemporalEase(indexTime)[0].speed
                    };
                    break;
                default:
                    key.easeIn = [];
                    lastKey.easeOut = [];
                    var inEase = property.keyInTemporalEase(indexTime+1);
                    var outEase = property.keyOutTemporalEase(indexTime);
                    inEase.forEach(function(item,index){
                        key.easeIn.push({influence : item.influence, speed:item.speed});
                        lastKey.easeOut.push({influence : outEase[index].influence, speed:outEase[index].speed});
                    });
            }
        }

        function buildNextSegment(){
            if(j<jLen){
                var segmentOb = {};
                beziersArray.push(segmentOb);
                buildSegment(segmentOb,j);
            }
        }
        buildNextSegment();
        beziersArray.push({t:property.keyTime(j)*frameRate});
        ob[propertyName] = beziersArray;
    }

    var ob = {};
    ob.getItemByName = getItemByName;
    ob.compareObjects = compareObjects;
    ob.roundNumber = roundNumber;
    ob.roundArray = roundArray;
    ob.setInterval = setInterval;
    ob.setTimeout = setTimeout;
    ob.cancelTimeout = cancelTimeout;
    ob.cancelInterval = cancelInterval;
    ob.removeDirectoryContent = removeDirectoryContent;
    ob.removeFileFromDisk = removeFileFromDisk;
    ob.getRandomName = getRandomName;
    ob.iterateProperty = iterateProperty;
    ob.rgbToHex = rgbToHex;
    ob.arrayRgbToHex = arrayRgbToHex;
    ob.layerType = layerType;
    ob.getprojectItemType = getprojectItemType;
    ob.convertToBezierValues = convertToBezierValues;

    extrasInstance = ob;

}());
(function(){
    var rqCollection;
    var proj = null;

    var queueItem;
    var moduleItem;
    var destinationFile;
    var counter = 0;
    var templateName = 'HTML_bodyMoving_template';
    var filesDirectory;
    function addComposition(comp){
        filesDirectory = new Folder(exportFolder.fullName+'/temp');
        if(!filesDirectory.exists){
            filesDirectory.create();
        }
        unqueueAllItems();
        queueItem = rqCollection.add(comp);
        queueItem.render = true;
        moduleItem = queueItem.outputModule(1);
        moduleItem.applyTemplate(templateName);
        destinationFile = new File(filesDirectory.fullName+'/'+'tempFile_'+counter+'.png');
        moduleItem.file = destinationFile;
        proj.renderQueue.render();
        counter++;
    }

    function importHelperProject(){
        var helperComp = helperFootage.item(1);
        var renderer = searchHelperRenderer(helperComp);
        var helperModule = renderer.outputModule(1);
        var templates = helperModule.templates;
        var i = 0, len = templates.length, found = false;
        while(i<len){
            if(templates[i] === templateName){
                found = true;
                break;
            }
            i+=1;
        }
        if(found === false){
            helperModule.saveAsTemplate(templateName);
        }
        renderer.remove();
    }

    function searchHelperRenderer(helperComp){
        var i=0,len = proj.renderQueue.items.length;
        var item;
        while(i<len){
            item =  proj.renderQueue.items[i+1];
            if(item.comp == helperComp){
                return item;
            }
            i++;
        }
    }

    function unqueueAllItems(){
        var item;
        var i,len = proj.renderQueue.items.length;
        for(i=0;i<len;i++){
            item =  proj.renderQueue.items[i+1];
            if(verifyIfRenderable(item.status)){
                proj.renderQueue.items[i+1].render = false;
            }
        }
    }

    function verifyIfRenderable(status){
        switch(status){
            case RQItemStatus.USER_STOPPED:
            case RQItemStatus.ERR_STOPPED:
            case RQItemStatus.DONE:
            case RQItemStatus.RENDERING:
                return false;
        }
        return true;
    }

    function getStatus(){
        var status = queueItem.status;
        if(status==RQItemStatus.DONE){
            queueItem.remove();
            renameFile();
        }
        return status;
    }

    function renameFile(){
        if(destinationFile.exists){
            if(destinationFile.remove()){
                var renamingFile = new File(destinationFile.fullName+'00000');
                renamingFile.rename(destinationFile.name);
            }else{
                //TODO handle error when removing file
            }
        }else{
            var renamingFile = new File(destinationFile.fullName+'00000');
            renamingFile.rename(destinationFile.name);
        }
    }

    function getFile(){
        return destinationFile;
    }

    function setProject(project){
        if(proj == null){
             proj = project;
            rqCollection = project.renderQueue.items;
            importHelperProject();
        }
    }

    var ob = {};
    ob.addComposition = addComposition;
    ob.getStatus = getStatus;
    ob.getFile = getFile;
    ob.setProject = setProject;

    rqManager = ob;
}());
/****** END rqManager ******/
/****** INIT LayerConverter ******/
(function(){
    var pendingComps = [];
    var convertedSources = [];
    var duplicatedSources = [];
    var helperFolder;
    var currentLayerNum = 0;
    var currentCompositionNum = 0;
    var totalLayers;
    var tempConverterComp;
    var currentComposition;
    var currentSource;
    var currentLayerInfo;
    var duplicateMainComp;
    var callback;
    function convertComposition(comp){
        helperFolder = helperFootage.item(2);
        AssetsManager.reset();
        duplicateMainComp = comp.duplicate();
        //duplicateMainComp.openInViewer() ;
        duplicateMainComp.parentFolder = helperFolder;
        currentLayerNum = 0;
        currentCompositionNum = 0;
        pendingComps = [];
        convertedSources = [];
        duplicatedSources = [];
        pendingComps.push(duplicateMainComp);
        if(pendingComps.length == 1){
            iterateNextComposition();
        }
    };

    function iterateNextComposition(){
        if(currentCompositionNum == pendingComps.length){
            //TODO dar acceso externo a main comp
            //TODO despachar evento de fin
            callback.apply(null,[duplicateMainComp]);
            return;
        }
        currentComposition = pendingComps[currentCompositionNum];
        currentLayerNum = 0;
        totalLayers = currentComposition.layers.length;
        verifyNextItem();
    }

    function verifyNextItem(){
        if(currentLayerNum<totalLayers){
            var layerInfo = currentComposition.layers[currentLayerNum+1];
            var lType = extrasInstance.layerType(layerInfo);
            if(lType == 'StillLayer'){
                currentSource = layerInfo.source;
                var convertedSource = searchConvertedSource(currentSource);
                if(convertedSource==null){
                    currentLayerInfo = layerInfo;
                    tempConverterComp = app.project.items.addComp('tempConverterComp',Math.max(4,currentSource.width),Math.max(4,currentSource.height),1,1,1);
                    tempConverterComp.layers.add(currentSource);
                    rqManager.addComposition(tempConverterComp);
                    waitForRenderDone();
                }else{
                    AssetsManager.associateLayerToSource(layerInfo,currentSource);
                    //replaceCurrentLayerSource(convertedSource); //NOT REPLACING FOOTAGE. NOT SURE IF NEEDED.
                    currentLayerNum++;
                    verifyNextItem();
                }
            }else{
                if(lType=='PreCompLayer'){
                    var copy = searchCompositionDuplicate(layerInfo);
                    layerInfo.replaceSource(copy, false);
                    pendingComps.push(copy);
                    copy.parentFolder = helperFolder;
                }
                currentLayerNum++;
                verifyNextItem();
            }
        }else{
            currentCompositionNum++;
            iterateNextComposition();
        }
    }

    function searchCompositionDuplicate(layerInfo){
        var i=0,len = duplicatedSources.length;
        while(i<len){
            if(duplicatedSources[i].s == layerInfo.source){
                return duplicatedSources[i].c;
            }
            i++;
        }
        var copy = layerInfo.source.duplicate();
        //copy.openInViewer() ;
        duplicatedSources.push({s:layerInfo.source,c:copy});
        return copy;
    }

    function searchConvertedSource(source){
        var i = 0, len = convertedSources.length;
        while(i<len){
            if(source == convertedSources[i].c){
                return convertedSources[i].r;
            }
            i++;
        }
        return null;
    }

    function waitForRenderDone(){
        $.sleep(100);
        if(checkRender()){
            replaceCurrentLayer();
            currentLayerNum++;
            verifyNextItem();
        }else{
            waitForRenderDone();
        }
    }

    function checkRender(){
        if(rqManager.getStatus() == RQItemStatus.DONE){
            return true;
        }
        return false;
    }

    function replaceCurrentLayerSource(source){
        var layerInfo = currentComposition.layers[currentLayerNum+1];
        layerInfo.replaceSource(source, false);
    }

    function replaceCurrentLayer(){
        var myFile = rqManager.getFile();
        var myImportOptions = new ImportOptions();
        myImportOptions.file = myFile;
        var myFootage =app.project.importFile(myImportOptions);
        myFootage.parentFolder = helperFolder;
        convertedSources.push({c:currentSource,r:myFootage});
        AssetsManager.createLayerSource(myFile,currentLayerInfo,currentSource);
        //currentLayerInfo.replaceSource(myFootage, false); //NOT REPLACING FOOTAGE. NOT SURE IF NEEDED.
        if(tempConverterComp!=null){
            tempConverterComp.remove();
        }
    }

    function setCallback(cb){
        callback = cb;
    }

    var ob = {};
    ob.convertComposition = convertComposition;
    ob.setCallback = setCallback;

    LayerConverter = ob;
}());
/****** END LayerConverter ******/
/****** INIT shapesParser ******/
(function (){
    var currentShape;
    var currentOb;
    var currentFrame;

    function parsePaths(paths,array,lastData,time){
        var i, len = paths.length;
        var frames =[];
        var framesI =[];
        var framesO =[];
        var framesV =[];
        for(i=0;i<len;i+=1){
            var path = paths[i].property('Path').valueAtTime(time,false);
            var frame = {};
            var frameI = {};
            var frameO = {};
            var frameV = {};
            frame.v = extrasInstance.roundNumber(path.vertices,3);
            frame.i = extrasInstance.roundNumber(path.inTangents,3);
            frame.o = extrasInstance.roundNumber(path.outTangents,3);
            frameI = extrasInstance.roundNumber(path.inTangents,3);
            frameO = extrasInstance.roundNumber(path.outTangents,3);
            frameV = extrasInstance.roundNumber(path.vertices,3);
            frames .push(frame);
            framesI .push(frameI);
            framesO .push(frameO);
            framesV .push(frameV);
        }
        /*if(lastData.path == null || extrasInstance.compareObjects(lastData.path,frames) == false){
         array[currentFrame]=frames;
         lastData.path = frames;
         }*/
        if(lastData.pathI == null || extrasInstance.compareObjects(lastData.pathI,framesI) == false){
            array.i[currentFrame]=framesI;
            lastData.pathI = framesI;
        }
        if(lastData.pathO == null || extrasInstance.compareObjects(lastData.pathO,framesO) == false){
            array.o[currentFrame]=framesO;
            lastData.pathO = framesO;
        }
        if(lastData.pathV== null || extrasInstance.compareObjects(lastData.pathV,framesV) == false){
            array.v[currentFrame]=framesV;
            lastData.pathV = framesV;
        }
    }
    function parseStar(){

    }
    function parseRect(info,array, lastData, time){
        //Todo Use this when property has expressions
        return;
        var frame = {};
        frame.size = info.property('Size').valueAtTime(time,false);
        frame.p = extrasInstance.roundNumber(info.property('Position').valueAtTime(time,false),3);
        frame.roundness = extrasInstance.roundNumber(info.property('Roundness').valueAtTime(time,false),3);
        if(lastData.rect == null || extrasInstance.compareObjects(lastData.rect,frame) == false){
            array[currentFrame]=frame;
            lastData.rect = frame;
        }else{
            //array.push(new Object());
        }
    }
    function parseEllipse(info,array, lastData, time){
        //Todo Use this when property has expressions
        return;
        var frame = {};
        frame.size = info.property('Size').valueAtTime(time,false);
        frame.p = extrasInstance.roundNumber(info.property('Position').valueAtTime(time,false),3);
        if(lastData.rect == null || extrasInstance.compareObjects(lastData.rect,frame) == false){
            array[currentFrame]=frame;
            lastData.rect = frame;
        }else{
            //array.push(new Object());
        }
        return frame.size;
    }
    function parseStroke(info,array, lastData, time){
        //Todo Use this when property has expressions
        return;
        var frame = {};
        var color = info.property('Color').valueAtTime(time,false);
        frame.color =extrasInstance.rgbToHex(Math.round(color[0]*255),Math.round(color[1]*255),Math.round(color[2]*255));
        frame.opacity = extrasInstance.roundNumber(info.property('Opacity').valueAtTime(time,false),3);
        frame.width = info.property('Stroke Width').valueAtTime(time,false);
        if(lastData.stroke == null || extrasInstance.compareObjects(lastData.stroke,frame) == false){
            array[currentFrame]=frame;
            lastData.stroke = frame;
        }else{
            //array.push(new Object());
        }
    }
    function parseFill(info,array, lastData, time){
        //Todo Use this when property has expressions
        return;

        var frame = {};
        var color = info.property('Color').valueAtTime(time,false);
        frame.color =extrasInstance.rgbToHex(Math.round(color[0]*255),Math.round(color[1]*255),Math.round(color[2]*255));
        frame.opacity = extrasInstance.roundNumber(info.property('Opacity').valueAtTime(time,false),3);
        if(lastData.fill == null || extrasInstance.compareObjects(lastData.fill,frame) == false){
            array[currentFrame]=frame;
            lastData.fill = frame;
        }else{
            //array.push(new Object());
        }
    }
    function parseTransform(info,array, lastData, time){
        //Todo Use this when property has expressions
        return;
        var frame = {};
        frame.p = extrasInstance.roundNumber(info.property('Position').valueAtTime(time,false),3);
        frame.a = extrasInstance.roundNumber(info.property('Anchor Point').valueAtTime(time,false),3);
        frame.s = [];
        frame.s[0] = extrasInstance.roundNumber(info.property('Scale').valueAtTime(time,false)[0]/100,3);
        frame.s[1] = extrasInstance.roundNumber(info.property('Scale').valueAtTime(time,false)[1]/100,3);
        frame.r = extrasInstance.roundNumber(info.property('Rotation').valueAtTime(time,false)*Math.PI/180,3);
        frame.o = extrasInstance.roundNumber(info.property('Opacity').valueAtTime(time,false),3);
        if(lastData.transform == null || extrasInstance.compareObjects(lastData.transform,frame) == false){
            array[currentFrame]=frame;
            lastData.transform = frame;
        }else{
            //array.push(new Object());
        }
    }

    function parseTrim(info,trim,lastData,time){
        //Todo Use this when property has expressions
        return;
        var frame = {};
        var trimS = extrasInstance.roundNumber(info.property('Start').valueAtTime(time,false),3);
        var trimE = extrasInstance.roundNumber(info.property('End').valueAtTime(time,false),3);
        var trimO = extrasInstance.roundNumber(info.property('Offset').valueAtTime(time,false),3);
        if(lastData.trimS == null || extrasInstance.compareObjects(trimS,lastData.trimS)==false){
            trim.s[currentFrame] = trimS;
            lastData.trimS = trimS;
        }
        if(lastData.trimE == null || extrasInstance.compareObjects(trimE,lastData.trimE)==false){
            trim.e[currentFrame] = trimE;
            lastData.trimE = trimE;
        }
        if(lastData.trimO  == null || extrasInstance.compareObjects(trimO ,lastData.trimO )==false){
            trim.o[currentFrame] = trimO ;
            lastData.trimO = trimO ;
        }
    }

    function parseShape(shapeInfo, shapeOb, time){
        //iterateProperty(shapeInfo,0);
        //Offsets for anchor point;
        var xOffset = 0;
        var yOffset = 0;
        var shapeContents = shapeInfo.property('Contents');

        var paths = [];
        var numProperties = shapeContents.numProperties;
        for(var i = 0;i<numProperties;i+=1){
            if(shapeContents(i+1).matchName == 'ADBE Vector Shape - Group'){
                paths.push(shapeContents(i+1));
            }
        }

        if(shapeContents.property('ADBE Vector Graphic - Stroke')){
            parseStroke(shapeContents.property('ADBE Vector Graphic - Stroke'),shapeOb.an.stroke, shapeOb.lastData, time);
        }
        if(shapeContents.property('ADBE Vector Graphic - Fill')){
            parseFill(shapeContents.property('ADBE Vector Graphic - Fill'),shapeOb.an.fill, shapeOb.lastData, time);
        }
        if(paths.length>0){
            if(shapeOb.an.path){
                parsePaths(paths,shapeOb.an.path, shapeOb.lastData, time);
            }
        }
        if(shapeContents.property('ADBE Vector Shape - Rect')){
            parseRect(shapeContents.property('ADBE Vector Shape - Rect'),shapeOb.an.rect, shapeOb.lastData, time);
        }
        if(shapeContents.property('ADBE Vector Shape - Ellipse')){
            parseEllipse(shapeContents.property('ADBE Vector Shape - Ellipse'),shapeOb.an.ell, shapeOb.lastData, time);
        }
        if(shapeContents.property('ADBE Vector Filter - Trim')){
            parseTrim(shapeContents.property('ADBE Vector Filter - Trim'),shapeOb.trim, shapeOb.lastData, time);
        }
        parseTransform(shapeInfo.property('Transform'),shapeOb.an.tr, shapeOb.lastData, time);
    }

    function addFrameData(layerInfo,layerOb, frameNum, time){
        currentFrame = frameNum;
        var contents = layerInfo.property('Contents');
        /** Todo Use for expressions
        if(contents.property('ADBE Vector Filter - Trim')){
            var trim = layerOb.trim;
            var trimS = extrasInstance.roundNumber(contents.property('ADBE Vector Filter - Trim').property('Start').valueAtTime(time,false),3);
            var trimE = extrasInstance.roundNumber(contents.property('ADBE Vector Filter - Trim').property('End').valueAtTime(time,false),3);
            var trimO = extrasInstance.roundNumber(contents.property('ADBE Vector Filter - Trim').property('Offset').valueAtTime(time,false),3);
            if(layerOb.lastData.trimS == null || extrasInstance.compareObjects(trimS,layerOb.lastData.trimS)==false){
                trim.s[currentFrame] = trimS;
                layerOb.lastData.trimS = trimS;
            }
            if(layerOb.lastData.trimE == null || extrasInstance.compareObjects(trimE,layerOb.lastData.trimE)==false){
                trim.e[currentFrame] = trimE;
                layerOb.lastData.trimE = trimE;
            }
            if(layerOb.lastData.trimO  == null || extrasInstance.compareObjects(trimO ,layerOb.lastData.trimO )==false){
                trim.o[currentFrame] = trimO ;
                layerOb.lastData.trimO = trimO ;
            }
        }
        **/
        var shapes = layerOb.shapes;
        var i,len = shapes.length;
        for(i=0;i<len;i++){
            parseShape(contents.property(shapes[i].name), shapes[i], time);
        }
    }
    function createShapes(layerInfo,layerOb, frameRate){
        var shapes = [];
        layerOb.shapes = shapes;
        var contents = layerInfo.property('Contents');
        if(contents.property('ADBE Vector Filter - Trim')){
            layerOb.trim = {
                's':{},
                'e':{},
                'o':{}
            };
            extrasInstance.convertToBezierValues(contents.property('ADBE Vector Filter - Trim').property('Start'), frameRate, layerOb.trim,'s');
            extrasInstance.convertToBezierValues(contents.property('ADBE Vector Filter - Trim').property('End'), frameRate, layerOb.trim,'e');
            extrasInstance.convertToBezierValues(contents.property('ADBE Vector Filter - Trim').property('Offset'), frameRate, layerOb.trim,'o');
        }
        var i, len = contents.numProperties;
        var shapeInfo, shapeObData;
        for(i=0;i<len;i++){
            shapeInfo = contents.property(i+1);
            var propContents = shapeInfo.property('Contents');
            if(propContents === null){
                continue;
            }
            var type = shapeType(propContents);
            shapeObData = {};
            shapeObData.type = type;
            shapeObData.name = shapeInfo.name;
            shapeObData.an = {};
            if(type === 'pathShape'){
                var pathInfo = propContents.property('ADBE Vector Shape - Group').property('Path').value;
                shapeObData.closed = pathInfo.closed;
                extrasInstance.convertToBezierValues(propContents.property('ADBE Vector Shape - Group').property('Path'), frameRate, shapeObData,'ks');

            }else if(type === 'rectShape'){
                shapeObData.rc = {};
                extrasInstance.convertToBezierValues(propContents.property('ADBE Vector Shape - Rect').property('Size'), frameRate, shapeObData.rc,'s');
                extrasInstance.convertToBezierValues(propContents.property('ADBE Vector Shape - Rect').property('Position'), frameRate, shapeObData.rc,'p');
                extrasInstance.convertToBezierValues(propContents.property('ADBE Vector Shape - Rect').property('Roundness'), frameRate, shapeObData.rc,'r');
            }else if(type === 'ellipseShape'){
                shapeObData.el = {};
                extrasInstance.convertToBezierValues(propContents.property('ADBE Vector Shape - Ellipse').property('Size'), frameRate, shapeObData.el,'s');
                extrasInstance.convertToBezierValues(propContents.property('ADBE Vector Shape - Ellipse').property('Position'), frameRate, shapeObData.el,'p');
            }
            if(propContents.property('ADBE Vector Graphic - Stroke')){
                shapeObData.strokeEnabled = propContents.property('ADBE Vector Graphic - Stroke').enabled;
                shapeObData.st = {};
                extrasInstance.convertToBezierValues(propContents.property('ADBE Vector Graphic - Stroke').property('Color'), frameRate, shapeObData.st,'c');
                extrasInstance.convertToBezierValues(propContents.property('ADBE Vector Graphic - Stroke').property('Opacity'), frameRate, shapeObData.st,'o');
                extrasInstance.convertToBezierValues(propContents.property('ADBE Vector Graphic - Stroke').property('Stroke Width'), frameRate, shapeObData.st,'w');
            }
            if(propContents.property('ADBE Vector Graphic - Fill')){
                shapeObData.fl = {};
                shapeObData.fillEnabled = propContents.property('ADBE Vector Graphic - Fill').enabled;
                var colorProp = propContents.property('ADBE Vector Graphic - Fill').property('Color');
                extrasInstance.convertToBezierValues(propContents.property('ADBE Vector Graphic - Fill').property('Color'), frameRate, shapeObData.fl,'c');
                extrasInstance.convertToBezierValues(propContents.property('ADBE Vector Graphic - Fill').property('Opacity'), frameRate, shapeObData.fl,'o');
            }
            if(propContents.property('ADBE Vector Filter - Merge')){
                var prop = propContents.property('ADBE Vector Filter - Merge');
                shapeObData.mm = propContents.property('ADBE Vector Filter - Merge').property('ADBE Vector Merge Type').value;
            }
            if(propContents.property('ADBE Vector Filter - Trim')){
                var prop = propContents.property('ADBE Vector Filter - Trim');
                shapeObData.trim = {
                    's':{},
                    'e':{},
                    'o':{}
                };
                extrasInstance.convertToBezierValues(prop.property('Start'), frameRate, shapeObData.trim,'s');
                extrasInstance.convertToBezierValues(prop.property('End'), frameRate, shapeObData.trim,'e');
                extrasInstance.convertToBezierValues(prop.property('Offset'), frameRate, shapeObData.trim,'o');
            }
            shapeObData.an.tr = {};
            shapeObData.tr = {};
            var transformProperty = shapeInfo.property('Transform');
            extrasInstance.convertToBezierValues(transformProperty.property('Position'), frameRate, shapeObData.tr,'p');
            extrasInstance.convertToBezierValues(transformProperty.property('Anchor Point'), frameRate, shapeObData.tr,'a');
            extrasInstance.convertToBezierValues(transformProperty.property('Scale'), frameRate, shapeObData.tr,'s');
            extrasInstance.convertToBezierValues(transformProperty.property('Rotation'), frameRate, shapeObData.tr,'r');
            extrasInstance.convertToBezierValues(transformProperty.property('Opacity'), frameRate, shapeObData.tr,'o');
            shapeObData.lastData = {};
            shapes.push(shapeObData);
        }
    }

    function shapeType(contents){
        if(contents.property('ADBE Vector Shape - Group')){
            return 'pathShape';
        }else if(contents.property('ADBE Vector Shape - Star')){
            return 'starShape';
        }else if(contents.property('ADBE Vector Shape - Rect')){
            return 'rectShape';
        }else if(contents.property('ADBE Vector Shape - Ellipse')){
            return 'ellipseShape';
        }
        //$.writeln(contents.matchName);
        return '';
    }

    var ob = {};
    ob.createShapes = createShapes;
    ob.addFrameData = addFrameData;

    ShapesParser = ob;
}());

/****** END shapesParser ******/
/****** INIT CompConverter ******/
(function(){
    var isExportDirectoryCreated = false;
    var directoryCreationFailed = false;
    var currentExportingComposition = 0;
    var compositionsList;
    var currentCompositionData;
    var filesDirectory;
    var mainProject = app.project;
    var scriptPath = ((File($.fileName)).path);
    var mainComp;
    var endCallback;

    var compositionData = {};

    function saveData(){
        if(!renderCancelled){
            var dataFile = new File(exportFolder.fullName+'/data.json');
            dataFile.open('w','TEXT','????');
            dataFile.write(JSON.stringify(compositionData)); //NO BORRAR, JSON SIN FORMATEAR
            //dataFile.write(JSON.stringify(compositionData, null, '  ')); //NO BORRAR ES PARA VER EL JSON FORMATEADO
            dataFile.close();
        }
        currentExportingComposition+=1;
        searchNextComposition();
    }

    function layersConverted(duplicateMainComp){
        DOMAnimationManager.setCallback(saveData);
        //FOR DOM
        DOMAnimationManager.getCompositionAnimationData(duplicateMainComp,compositionData,filesDirectory);
    }

    function animationSaved(){
        saveData();
    }

    function directoryRemoved(){
        filesDirectory = new Folder(exportFolder.fullName+'/files');
        if(filesDirectory.create()){
            isExportDirectoryCreated = true;
        }
    }

    function createExportDirectory(){
        exportFolder = new Folder(currentCompositionData.destination+'/'+currentCompositionData.comp.name+'/');
        filesDirectory = new Folder(exportFolder.fullName+'/files');
        if(filesDirectory.exists){
            isExportDirectoryCreated = true;
        }else{
            if(filesDirectory.create()){
                isExportDirectoryCreated = true;
            }else{
                directoryCreationFailed = true;
            }
        }
    }

    function waitForDirectoryCreated(){
        if(isExportDirectoryCreated){
            start();
        }else if(directoryCreationFailed){
            alert(UITextsData.alertMessages.directoryCreationFailed);
        }else{
            $.sleep(100);
            waitForDirectoryCreated();
        }
    }

    function searchHelperRenderer(helperComp){
        var i=0,len = app.project.renderQueue.items.length;
        var item;
        while(i<len){
            item =  app.project.renderQueue.items[i+1];
            if(item.comp == helperComp){
                return item;
            }
            i++;
        }
    }

    function start(){
        UI.setExportText('Starting export');
        LayerConverter.convertComposition(mainComp);
    }

    function exportNextComposition(){
        isExportDirectoryCreated = false;
        directoryCreationFailed = false;
        mainComp = compositionsList[currentExportingComposition].comp;
        createExportDirectory();
        waitForDirectoryCreated();
    }

    function searchNextComposition(){
        var len = compositionsList.length;
        while(currentExportingComposition < len){
            if(compositionsList[currentExportingComposition].queued === true){
                currentCompositionData = compositionsList[currentExportingComposition];
                exportNextComposition();
                return;
            }
            currentExportingComposition+=1;
        }
        //If we get here there are no more compositions to render and callback is executed
        helperFootage.remove();
        endCallback.apply();
    }

    function renderCompositions(list){
        var helperFile = new File(scriptPath+'/helperProject.aep');
        var helperImportOptions = new ImportOptions();
        helperImportOptions.file = helperFile;
        helperFootage = mainProject.importFile(helperImportOptions);
        rqManager.setProject(app.project);
        LayerConverter.setCallback(layersConverted);
        currentExportingComposition = 0;
        compositionsList = list;
        searchNextComposition();
    }

    function setFinishCallback(cb){
        endCallback = cb;
    }

    var ob = {};
    ob.renderCompositions = renderCompositions;
    ob.setFinishCallback = setFinishCallback;

    CompConverter = ob;
}());
/****** END CompConverter ******/
(function(){
    var UITextsData = {
        generalButtons : {render:'Render'},
        alertMessages : {
            noComps:'You don\'t have compositions to render',
            directoryCreationFailed:'Error trying to create directory'
        },
        tabs : {comps:'Compositions',images:'Images'},
        compsButtons : {add:'Add to render queue',remove:'Remove from render queue',destination:'Destination Folder',refresh:'Refresh'},
        compsColumns : {name:'Name',queue:'In Queue',destination:'Destination Path'},
        imagesButtons : {refresh:'Refresh', exportTxt:'Export', notExportTxt:'Do not export'},
        imagesColumns : {name:'Name',exportTxt:'Export'},
        renderTexts : {cancel:'Cancel Render'}
    }
    var availableCompositions = [];
    var bodyMovinPanel;
    var settingsGroup;
    var renderGroup;
    var compsList;
    var imagesList;
    var compTab;
    var imagesTab;
    var compsSelectionButton;
    var compsDestinationButton;
    var imagesCompsDropDown;
    var toggleImagesExportButton;
    var isPanelFocused = false;
    var ignoreEvent = true;



    function myScript_buildUI(thisObj){
        bodyMovinPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Body Movin Exporter", undefined, {resizeable:true});
        bodyMovinPanel.addEventListener('focus', panelFocusHandler);
        bodyMovinPanel.addEventListener('blur', panelBlurHandler);
        bodyMovinPanel.addEventListener('close',closePanel);

        /****  WINDOW VIEW *****/

        var mainGroupRes = "group{orientation:'stack',alignment:['fill','fill'],alignChildren:['fill',fill']}";
        bodyMovinPanel.mainGroup = bodyMovinPanel.add(mainGroupRes);

        /**** SETTINGS GROUP ****/
        var settingsGroupRes = "group{orientation:'column',alignment:['fill','fill'],alignChildren:['fill',fill'],\
            myTabbedPanel: Panel{type:'tabbedpanel', text:'',alignment:['fill','fill'],alignChildren:['fill',fill'],\
               compTab: Panel{type:'tab', text:'"+UITextsData.tabs.comps+"',orientation:'columns',\
               },\
               imagesTab: Panel{type:'tab', text: '"+UITextsData.tabs.images+"',\
               },\
            },\
            generalButtonsGroup: Group{orientation:'row',alignment:['fill','bottom'],alignChildren:['fill',fill'],\
                renderButton: Button{text:'"+UITextsData.generalButtons.render+"',alignment:['right','bottom']},\
            }\
         }";
        settingsGroup = bodyMovinPanel.mainGroup.add(settingsGroupRes);
        settingsGroup.myTabbedPanel.addEventListener('change',tabChangedHandler);
        settingsGroup.generalButtonsGroup.renderButton.addEventListener('click', startRender);
        /**** COMPOSITION TAB  VIEW *****/
        var compGroup = "Group{orientation:'column',alignment:['fill','fill'],alignChildren:['fill',fill'],\
            buttonGroup: Group{orientation:'row',alignment:['fill','top'],alignChildren:['left',top'],\
                compsSelectionButton: Button{text:'"+UITextsData.compsButtons.remove+"'},\
                compsDestinationButton: Button{text:'"+UITextsData.compsButtons.destination+"'},\
                compsRefreshButton: Button{text:'"+UITextsData.compsButtons.refresh+"',alignment:['right','top']},\
            }\
            list: ListBox{text:'Components List',alignment:['fill','fill'],alignChildren:['fill',fill'],\
            properties:{numberOfColumns: 3,multiselect:true, showHeaders: true,columnTitles: ['"+UITextsData.compsColumns.name+"', '"+UITextsData.compsColumns.queue+"','"+UITextsData.compsColumns.destination+"']}\
            }\
        }";
        settingsGroup.myTabbedPanel.compTab.compGroup = settingsGroup.myTabbedPanel.compTab.add(compGroup);
        compsList = settingsGroup.myTabbedPanel.compTab.compGroup.list;
        compsSelectionButton = settingsGroup.myTabbedPanel.compTab.compGroup.buttonGroup.compsSelectionButton;
        compsDestinationButton = settingsGroup.myTabbedPanel.compTab.compGroup.buttonGroup.compsDestinationButton;
        compsSelectionButton.addEventListener('click',compRenderButtonClickHandler);
        compsDestinationButton.addEventListener('click',compDestinationButtonClickHandler);
        settingsGroup.myTabbedPanel.compTab.compGroup.buttonGroup.compsRefreshButton.addEventListener('click',compRefreshButtonClickHandler);
        compsSelectionButton.hide();
        compsDestinationButton.hide();
        compsList.addEventListener('change',listChangeHandler);
        /**** IMAGES TAB  VIEW *****/
        var imagesGroup = "Group{orientation:'column',alignment:['fill','fill'],alignChildren:['fill',fill'],\
            optionsGroup: Group{orientation:'row',alignment:['fill','top'],alignChildren:['left',top'],\
                whichCompo : DropDownList { alignment:'left',properties: {items: ['Dummy text']} }, \
                toggleExportButton: Button{text:'"+UITextsData.imagesButtons.notExportTxt+"',alignment:['right','top']},\
                refreshButton: Button{text:'"+UITextsData.imagesButtons.refresh+"',alignment:['right','top']},\
            }\
            list: ListBox{text:'Images List',alignment:['fill','fill'],alignChildren:['fill',fill'],\
            properties:{numberOfColumns: 2,multiselect:true, showHeaders: true,columnTitles: ['"+UITextsData.imagesColumns.name+"', '"+UITextsData.imagesColumns.exportTxt+"']}\
            }\
        }";
        settingsGroup.myTabbedPanel.imagesTab.imagesGroup = settingsGroup.myTabbedPanel.imagesTab.add(imagesGroup);
        imagesCompsDropDown = settingsGroup.myTabbedPanel.imagesTab.imagesGroup.optionsGroup.whichCompo;
        toggleImagesExportButton = settingsGroup.myTabbedPanel.imagesTab.imagesGroup.optionsGroup.toggleExportButton;
        toggleImagesExportButton.hide();
        //toggleImagesExportButton.addEventListener('click',toggleExportImagesHandler);
        imagesList = settingsGroup.myTabbedPanel.imagesTab.imagesGroup.list;
        //imagesList.addEventListener('change',imagesListChangeHandler);
        //imagesCompsDropDown.addEventListener('change',imagesCompsDDChangeHandler);
        //settingsGroup.myTabbedPanel.imagesTab.imagesGroup.optionsGroup.refreshButton.addEventListener('click',imagesRefreshButtonClickHandler);

        /**** RENDER GROUP ****/
        var renderGroupRes = "group{orientation:'column',alignment:['fill','fill'],alignChildren:['fill',fill'],\
            componentText:StaticText{text:'Rendering Composition ',alignment:['left','top']},\
            infoText:StaticText{text:'Exporting images ',alignment:['left','top']},\
            progress:Progressbar{value:50,alignment:['fill','top']},\
            cancelButton: Button{text:'"+UITextsData.renderTexts.cancel+"',alignment:['center','top']},\
         }";
        bodyMovinPanel.mainGroup.renderGroup = bodyMovinPanel.mainGroup.add(renderGroupRes);
        renderGroup = bodyMovinPanel.mainGroup.renderGroup;
        renderGroup.cancelButton.addEventListener('click',cancelRender);
        renderGroup.hide();

        bodyMovinPanel.layout.layout(true);
        settingsGroup.minimumSize = settingsGroup.size;

        bodyMovinPanel.onResizing = bodyMovinPanel.onResize = function () { this.layout.resize(); }
        //panelManager.setPanel(bodyMovinPanel);

        settingsGroup.myTabbedPanel.imagesTab.enabled = false;

        settingsGroup.myTabbedPanel.imagesTab.hide();

        return bodyMovinPanel;
    }

    function closePanel(){
        bodyMovinPanel.removeEventListener('focus', panelFocusHandler);
        bodyMovinPanel.removeEventListener('blur', panelBlurHandler);
        bodyMovinPanel.removeEventListener('close',closePanel);
        settingsGroup.myTabbedPanel.removeEventListener('change',tabChangedHandler);
        settingsGroup.generalButtonsGroup.renderButton.removeEventListener('click', startRender);
        compsSelectionButton.removeEventListener('click',compRenderButtonClickHandler);
        compsDestinationButton.removeEventListener('click',compDestinationButtonClickHandler);
        compsList.removeEventListener('change',listChangeHandler);
        //toggleImagesExportButton.removeEventListener('click',toggleExportImagesHandler);
        //imagesList.removeEventListener('change',imagesListChangeHandler);
        //imagesCompsDropDown.removeEventListener('change',imagesCompsDDChangeHandler);
        //settingsGroup.myTabbedPanel.imagesTab.imagesGroup.optionsGroup.refreshButton.removeEventListener('click',imagesRefreshButtonClickHandler);
        renderGroup.cancelButton.removeEventListener('click',cancelRender);
        settingsGroup.myTabbedPanel.compTab.compGroup.buttonGroup.compsRefreshButton.removeEventListener('click',compRefreshButtonClickHandler);
        bodyMovinPanel.onResizing = bodyMovinPanel.onResize = null;
    }

    function panelFocusHandler(ev){
        if(app.project === null || app.project === undefined){
            return;
        }
        if(isPanelFocused === true){
            return;
        }
        isPanelFocused = true;
        tabChangedHandler(null); //Uncomment this por production
    }

    function panelBlurHandler(ev){
        if(isPanelFocused === false){
            return;
        }
        isPanelFocused = false;
    }

    function cancelRender(){
        renderCancelled = true;
        renderFinished();
    }

    function renderFinished(){
        renderGroup.hide();
        settingsGroup.show();
        //app.endUndoGroup();
    }

    function startRender(){
        renderCancelled = false;
        var foundComps = false,i=0, len = availableCompositions.length;
        while(i<len){
            if(availableCompositions[i].queued){
                foundComps = true;
                getCompositionImages(availableCompositions[i]);
            }
            i+=1;
        }
        if(foundComps === false){
            alert(UITextsData.alertMessages.noComps);
            return;
        }
        //TODO handle full undo
        //app.beginUndoGroup("Undo Render");
        renderGroup.show();
        settingsGroup.hide();
        CompConverter.setFinishCallback(renderFinished);
        CompConverter.renderCompositions(availableCompositions);
    }

    function getCompositionImages(compositionData){
        if(compositionData.exportableImages === null || compositionData.exportableImages === undefined){
            compositionData.exportableImages = [];
        }
        addImagesFromComposition(compositionData.comp,compositionData.exportableImages);
    }

    function addImagesFromComposition(compo,imagesList){
        var i, len = compo.layers.length;
        for(i = 0;i<len;i+=1){
            var layerInfo = compo.layers[i+1];
            var lType = extrasInstance.layerType(layerInfo);
            if(lType == 'StillLayer'){
                addLayerToImagesList(layerInfo,imagesList);
            }else if(lType == 'PreCompLayer'){
                addImagesFromComposition(layerInfo.source,imagesList);
            }
        }
    }

    function addLayerToImagesList(layer,list){
        var i = 0, len = list.length, existingItem= null;
        while(i<len){
            if(list[i].item === layer){
                existingItem = list.splice(i,1)[0];
                break;
            }
            i+=1;
        }
        var listItem;
        if(existingItem === null){
            listItem = {item: layer, exportable: true, uiItem: null};
        }else{
            listItem = {item:layer, exportable:existingItem.exportable,uiItem:null}
        }
        list.push(listItem);
    }

    function tabChangedHandler(ev){
        if(ev !== null && ev.target !== settingsGroup.myTabbedPanel){
            return;
        }
        switch(settingsGroup.myTabbedPanel.selection.text){
            case UITextsData.tabs.comps:
                updateCompositionsTab();
                break;
            case UITextsData.tabs.images:
                //updateImagesTab();
                break;
        }
    }

    function compRefreshButtonClickHandler(ev){
        updateCompositionsTab();
    }

    function compDestinationButtonClickHandler(ev){
        var f = new Folder();
        var outputFolder = f.selectDlg();
        if(outputFolder !== null){
            var selection = compsList.selection;
            var i, len = selection.length;
            var j, jLen = availableCompositions.length;
            for(i=0;i<len;i++){
                selection[i].subItems[1].text = outputFolder.absoluteURI;
                j = 0;
                while(j<jLen){
                    if(availableCompositions[j].item === selection[i]){
                        availableCompositions[j].destination = outputFolder.absoluteURI;
                        break;
                    }
                    j++;
                }
            }
            updateCompView();
        }
    }

    function compRenderButtonClickHandler(ev){
        var sendToQueue;
        if(compsSelectionButton.text === UITextsData.compsButtons.add){
            sendToQueue = true;
        }else{
            sendToQueue = false;
        }
        var selection = compsList.selection;
        var i, len = selection.length;
        var j, jLen = availableCompositions.length;
        for(i=0;i<len;i++){
            j = 0;
            while(j<jLen){
                if(availableCompositions[j].item === selection[i]){
                    availableCompositions[j].queued = sendToQueue;
                    break;
                }
                j++;
            }
        }
        listChangeHandler();
    }

    function searchRemovedElements(){
        compsList.selection = null;
        compsList.removeAll();
        var i=0, len = availableCompositions.length;
        while(i<len){
            if(!isValid(availableCompositions[i].comp)){
                availableCompositions.splice(i,1);
                i-=1;
                len-=1;
            }else{
                if(!isValid(availableCompositions[i].imageDdItem)){
                    delete availableCompositions[i].imageDdItem;
                }
            }
            i+=1;
        }
        i = 0;
        var j, jLen, images;
        while(i<len){
            if(availableCompositions[i].exportableImages){
                images = availableCompositions[i].exportableImages;
                jLen = images.length;
                j = 0;
                while(j<jLen){
                    if(!isValid(images[j].item)){
                        images.splice(j,1);
                        j-=1;
                        jLen-=1;
                    }
                    j+=1;
                }
            }
            i+=1;
        }
    }

    function updateCompositionsTab(){
        ignoreEvent = true;
        searchRemovedElements();
        var project = app.project;

        var i,numItems = project.numItems;
        var types = '';
        var count = 0;
        for(i=0;i<numItems;i+=1){
            if(extrasInstance.getprojectItemType(project.item(i+1))=='Comp'){
                addCompositionToList(project.item(i+1), count);
                count+=1;
            };
        }
        var numComps = availableCompositions.length;
        var itemsList = [];
        for(i=0;i<numComps;i++){
            availableCompositions[i].item = compsList.add('item',availableCompositions[i].comp.name);
            if(availableCompositions[i].selected){
                availableCompositions[i].item.selected = true;
            }
        }
        updateCompView();
        ignoreEvent = false;
    }

    function addCompositionToList(item,pos){
        var i=0, len = availableCompositions.length, compItem = null;
        while(i<len){
            if(availableCompositions[i].comp === item){
                compItem = availableCompositions[i];
                availableCompositions.splice(i,1);
                break;
            }
            i++;
        }
        if(compItem === null){
            //app.project.file.path
            compItem = {comp:item, queued:false, selected:false, destination: Folder.myDocuments.absoluteURI};
        }
        availableCompositions.splice(pos,0,compItem);
    }

    function listChangeHandler(ev){
        if(ignoreEvent){
            return;
        }
        var selection = compsList.selection;
        if(selection===null){
            compsSelectionButton.hide();
            compsDestinationButton.hide();
            return;
        }
        availableCompositions.forEach(function(compData){
            compData.selected = false;
        });
        compsSelectionButton.show();
        var i, len = selection.length;
        var j, jLen = availableCompositions.length;
        var areQueued = true;
        selection.forEach(function(selectionItem){
            j = 0;
            while(j<jLen){
                if(availableCompositions[j].item === selectionItem){
                    availableCompositions[j].selected = true;
                    if(availableCompositions[j].queued == false){
                        areQueued = false;
                    }
                    break;
                }
                j++;
            }
        });
        for(i=0;i<len;i++){
            j = 0;
            while(j<jLen){
                if(availableCompositions[j].item === selection[i]){
                    if(availableCompositions[j].queued == false){
                        areQueued = false;
                    }
                    break;
                }
                j++;
            }
        }
        if(areQueued === false){
            compsDestinationButton.hide();
            compsSelectionButton.text = UITextsData.compsButtons.add;
        }else{
            compsDestinationButton.show();
            compsSelectionButton.text = UITextsData.compsButtons.remove;
        }
        updateCompView();
    }

    function updateCompView(){
        var i, len = availableCompositions.length;
        for(i=0;i<len;i++){
            compsList.items[i].subItems[0].text = availableCompositions[i].queued;
            if(availableCompositions[i].queued == false){
                compsList.items[i].subItems[1].text = '';
            }else{
                compsList.items[i].subItems[1].text = availableCompositions[i].destination;
            }
        }
    }

    function setExportText(text){
        bodyMovinPanel.mainGroup.renderGroup.infoText.text = text;
    }

    myScript_buildUI(this);
    if (bodyMovinPanel != null && bodyMovinPanel instanceof Window){
        bodyMovinPanel.center();
        bodyMovinPanel.show();
    }

    var ob ={};
    ob.setExportText = setExportText;

    UI = ob;

}());
}());