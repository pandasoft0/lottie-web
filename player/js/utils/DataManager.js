function dataFunctionManager(){

    //var tCanvasHelper = document.createElement('canvas').getContext('2d');

    function completeLayers(layers, comps, fontManager){
        var layerData;
        var animArray, lastFrame;
        var i, len = layers.length;
        var j, jLen, k, kLen;
        for(i=0;i<len;i+=1){
            layerData = layers[i];
            if(!('ks' in layerData) || layerData.completed){
                continue;
            }
            layerData.completed = true;
            if(layerData.tt){
                layers[i-1].td = layerData.tt;
            }
            animArray = [];
            lastFrame = -1;
            if(layerData.hasMask){
                var maskProps = layerData.masksProperties;
                jLen = maskProps.length;
                for(j=0;j<jLen;j+=1){
                    if(maskProps[j].pt.k.i){
                        convertPathsToAbsoluteValues(maskProps[j].pt.k);
                    }else{
                        kLen = maskProps[j].pt.k.length;
                        for(k=0;k<kLen;k+=1){
                            if(maskProps[j].pt.k[k].s){
                                convertPathsToAbsoluteValues(maskProps[j].pt.k[k].s[0]);
                            }
                            if(maskProps[j].pt.k[k].e){
                                convertPathsToAbsoluteValues(maskProps[j].pt.k[k].e[0]);
                            }
                        }
                    }
                }
            }
            if(layerData.ty===0){
                layerData.layers = findCompLayers(layerData.refId, comps);
                completeLayers(layerData.layers,comps, fontManager);
            }else if(layerData.ty === 4){
                completeShapes(layerData.shapes);
            }else if(layerData.ty == 5){
                completeText(layerData, fontManager);
            }
        }
    }

    function findCompLayers(id,comps){
        var i = 0, len = comps.length;
        while(i<len){
            if(comps[i].id === id){
                return JSON.parse(JSON.stringify(comps[i].layers));
            }
            i += 1;
        }
    }

    function completeShapes(arr){
        var i, len = arr.length;
        var j, jLen;
        for(i=len-1;i>=0;i-=1){
            if(arr[i].ty == 'sh'){
                if(arr[i].ks.k.i){
                    convertPathsToAbsoluteValues(arr[i].ks.k);
                }else{
                    jLen = arr[i].ks.k.length;
                    for(j=0;j<jLen;j+=1){
                        if(arr[i].ks.k[j].s){
                            convertPathsToAbsoluteValues(arr[i].ks.k[j].s[0]);
                        }
                        if(arr[i].ks.k[j].e){
                            convertPathsToAbsoluteValues(arr[i].ks.k[j].e[0]);
                        }
                    }
                }
            }else if(arr[i].ty == 'gr'){
                completeShapes(arr[i].it);
            }
        }
    }

    function convertPathsToAbsoluteValues(path){
        var i, len = path.i.length;
        for(i=0;i<len;i+=1){
            path.i[i][0] += path.v[i][0];
            path.i[i][1] += path.v[i][1];
            path.o[i][0] += path.v[i][0];
            path.o[i][1] += path.v[i][1];
        }
    }

    function checkVersion(minimum,animVersionString){
        var animVersion = animVersionString ? animVersionString.split('.') : [100,100,100];
        if(minimum[0]>animVersion[0]){
            return true;
        } else if(animVersion[0] > minimum[0]){
            return false;
        }
        if(minimum[1]>animVersion[1]){
            return true;
        } else if(animVersion[1] > minimum[1]){
            return false;
        }
        if(minimum[2]>animVersion[2]){
            return true;
        } else if(animVersion[2] > minimum[2]){
            return false;
        }
    }

    var checkColors = (function(){
        var minimumVersion = [4,1,9];

        function iterateShapes(shapes){
            var i, len = shapes.length;
            var j, jLen;
            for(i=0;i<len;i+=1){
                if(shapes[i].ty === 'gr'){
                    iterateShapes(shapes[i].it);
                }else if(shapes[i].ty === 'fl' || shapes[i].ty === 'st'){
                    if(shapes[i].c.k && shapes[i].c.k[0].i){
                        jLen = shapes[i].c.k.length;
                        for(j=0;j<jLen;j+=1){
                            if(shapes[i].c.k[j].s){
                                shapes[i].c.k[j].s[0] /= 255;
                                shapes[i].c.k[j].s[1] /= 255;
                                shapes[i].c.k[j].s[2] /= 255;
                                shapes[i].c.k[j].s[3] /= 255;
                            }
                            if(shapes[i].c.k[j].e){
                                shapes[i].c.k[j].e[0] /= 255;
                                shapes[i].c.k[j].e[1] /= 255;
                                shapes[i].c.k[j].e[2] /= 255;
                                shapes[i].c.k[j].e[3] /= 255;
                            }
                        }
                    } else {
                        shapes[i].c.k[0] /= 255;
                        shapes[i].c.k[1] /= 255;
                        shapes[i].c.k[2] /= 255;
                        shapes[i].c.k[3] /= 255;
                    }
                }
            }
        }

        function iterateLayers(layers){
            var i, len = layers.length;
            for(i=0;i<len;i+=1){
                if(layers[i].ty === 4){
                    iterateShapes(layers[i].shapes);
                }
            }
        }

        return function (animationData){
            if(checkVersion(minimumVersion,animationData.v)){
                iterateLayers(animationData.layers);
                if(animationData.assets){
                    var i, len = animationData.assets.length;
                    for(i=0;i<len;i+=1){
                        if(animationData.assets[i].layers){
                            iterateLayers(animationData.assets[i].layers);

                        }
                    }
                }
            }
        }
    }());

    function completeData(animationData, fontManager){
        checkColors(animationData);
        completeLayers(animationData.layers, animationData.assets, fontManager);
    }

    function completeText(data, fontManager){
        var letters = [];
        var documentData = data.t.d;
        var i, len;
        var newLineFlag, index = 0, val;
        var anchorGrouping = data.t.m.g;
        var currentSize = 0, currentPos = 0, currentLine = 0, lineWidths = [];
        var lineWidth = 0;
        var maxLineWidth = 0;
        var j, jLen;
        var fontData = fontManager.getFontByName(documentData.f);
        var charData, cLength = 0;
        var styles = fontData.fStyle.split(' ');

        var fWeight = 'normal', fStyle = 'normal';
        len = styles.length;
        for(i=0;i<len;i+=1){
            if (styles[i].toLowerCase() === 'italic') {
                fStyle = 'italic';
            }else if (styles[i].toLowerCase() === 'bold') {
                fWeight = '700';
            } else if (styles[i].toLowerCase() === 'black') {
                fWeight = '900';
            } else if (styles[i].toLowerCase() === 'medium') {
                fWeight = '500';
            } else if (styles[i].toLowerCase() === 'regular' || styles[i].toLowerCase() === 'normal') {
                fWeight = '400';
            } else if (styles[i].toLowerCase() === 'light' || styles[i].toLowerCase() === 'thin') {
                fWeight = '200';
            }
        }
        documentData.fWeight = fWeight;
        documentData.fStyle = fStyle;
        len = documentData.t.length;
        if(documentData.sz){
            var boxWidth = documentData.sz[0];
            var lastSpaceIndex = -1;
            for(i=0;i<len;i+=1){
                newLineFlag = false;
                if(documentData.t.charAt(i) === ' '){
                    lastSpaceIndex = i;
                }else if(documentData.t.charCodeAt(i) === 13){
                    lineWidth = 0;
                    newLineFlag = true;
                }
                if(fontManager.chars){
                    charData = fontManager.getCharData(documentData.t.charAt(i), fontData.fStyle, fontData.fFamily);
                    cLength = newLineFlag ? 0 : charData.w*documentData.s/100;
                }else{
                    //tCanvasHelper.font = documentData.s + 'px '+ fontData.fFamily;
                    cLength = fontManager.measureText(documentData.t.charAt(i), documentData.f, documentData.s);
                }
                if(lineWidth + cLength > boxWidth){
                    if(lastSpaceIndex === -1){
                       //i -= 1;
                        documentData.t = documentData.t.substr(0,i) + "\r" + documentData.t.substr(i);
                        len += 1;
                    } else {
                        i = lastSpaceIndex;
                        documentData.t = documentData.t.substr(0,i) + "\r" + documentData.t.substr(i+1);
                    }
                    lastSpaceIndex = -1;
                    lineWidth = 0;
                }else {
                    lineWidth += cLength;
                }
            }
            len = documentData.t.length;
        }
        lineWidth = 0;
        cLength = 0;
        for (i = 0;i < len ;i += 1) {
            newLineFlag = false;
            if(documentData.t.charAt(i) === ' '){
                val = '\u00A0';
            }else if(documentData.t.charCodeAt(i) === 13){
                lineWidths.push(lineWidth);
                maxLineWidth = lineWidth > maxLineWidth ? lineWidth : maxLineWidth;
                lineWidth = 0;
                val = '';
                newLineFlag = true;
                currentLine += 1;
            }else{
                val = documentData.t.charAt(i);
            }
            if(fontManager.chars){
                charData = fontManager.getCharData(documentData.t.charAt(i), fontData.fStyle, fontManager.getFontByName(documentData.f).fFamily);
                cLength = newLineFlag ? 0 : charData.w*documentData.s/100;
            }else{
                //var charWidth = fontManager.measureText(val, documentData.f, documentData.s);
                //tCanvasHelper.font = documentData.s + 'px '+ fontManager.getFontByName(documentData.f).fFamily;
                cLength = fontManager.measureText(val, documentData.f, documentData.s);
            }

            //
            lineWidth += cLength;
            letters.push({l:cLength,an:cLength,add:currentSize,n:newLineFlag, anIndexes:[], val: val, line: currentLine});
            if(anchorGrouping == 2){
                currentSize += cLength;
                if(val == '' || val == '\u00A0' || i == len - 1){
                    if(val == '' || val == '\u00A0'){
                        currentSize -= cLength;
                    }
                    while(currentPos<=i){
                        letters[currentPos].an = currentSize;
                        letters[currentPos].ind = index;
                        letters[currentPos].extra = cLength;
                        currentPos += 1;
                    }
                    index += 1;
                    currentSize = 0;
                }
            }else if(anchorGrouping == 3){
                currentSize += cLength;
                if(val == '' || i == len - 1){
                    if(val == ''){
                        currentSize -= cLength;
                    }
                    while(currentPos<=i){
                        letters[currentPos].an = currentSize;
                        letters[currentPos].ind = index;
                        letters[currentPos].extra = cLength;
                        currentPos += 1;
                    }
                    currentSize = 0;
                    index += 1;
                }
            }else{
                letters[index].ind = index;
                letters[index].extra = 0;
                index += 1;
            }
        }
        documentData.l = letters;
        maxLineWidth = lineWidth > maxLineWidth ? lineWidth : maxLineWidth;
        lineWidths.push(lineWidth);
        if(documentData.sz){
            documentData.boxWidth = documentData.sz[0];
            data.t.d.justifyOffset = 0;
        }else{
            documentData.boxWidth = maxLineWidth;
            switch(documentData.j){
                case 1:
                    data.t.d.justifyOffset = - documentData.boxWidth;
                    break;
                case 2:
                    data.t.d.justifyOffset = - documentData.boxWidth/2;
                    break;
                default:
                    data.t.d.justifyOffset = 0;
            }
        }
        documentData.lineWidths = lineWidths;

        var animators = data.t.a;
        jLen = animators.length;
        var based, ind, indexes = [];
        for(j=0;j<jLen;j+=1){
            if(animators[j].a.sc){
                documentData.strokeColorAnim = true;
            }
            if(animators[j].a.sw){
                documentData.strokeWidthAnim = true;
            }
            if(animators[j].a.fc || animators[j].a.fh || animators[j].a.fs || animators[j].a.fb){
                documentData.fillColorAnim = true;
            }
            ind = 0;
            based = animators[j].s.b;
            for(i=0;i<len;i+=1){
                letters[i].anIndexes[j] = ind;
                if((based == 1 && letters[i].val != '') || (based == 2 && letters[i].val != '' && letters[i].val != '\u00A0') || (based == 3 && (letters[i].n || letters[i].val == '\u00A0' || i == len - 1)) || (based == 4 && (letters[i].n || i == len - 1))){
                    if(animators[j].s.rn === 1){
                        indexes.push(ind);
                    }
                    ind += 1;
                }
            }
            data.t.a[j].s.totalChars = ind;
            var currentInd = -1, newInd;
            if(animators[j].s.rn === 1){
                for(i = 0; i < len; i += 1){
                    if(currentInd != letters[i].anIndexes[j]){
                        currentInd = letters[i].anIndexes[j];
                        newInd = indexes.splice(Math.floor(Math.random()*indexes.length),1)[0];
                    }
                    letters[i].anIndexes[j] = newInd;
                }
            }
        }
        if(jLen === 0 && !('m' in data.t.p)){
            data.singleShape = true;
        }
        console.log('documentData.lh:',documentData.lh);
        documentData.yOffset = documentData.lh || documentData.s*1.2;
        documentData.ascent = fontData.ascent*documentData.s/100;
    }

    var moduleOb = {};
    moduleOb.completeData = completeData;

    return moduleOb;
}

var dataManager = dataFunctionManager();