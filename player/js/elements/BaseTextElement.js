var BaseTextElement = function (){
};

BaseTextElement.prototype.getMeasures = function(num, svgFlag) {
    var matrixHelper = this.mHelper;
    var xPos,yPos;
    var lettersValue = [], letterValue;
    if('m' in this.data.t.p) {
        var mask = this.data.masksProperties[this.data.t.p.m];
        var paths = mask.paths[num].pathNodes;
        var pathInfo = {
            tLength: 0,
            segments: []
        };
        len = paths.v.length - 1;
        var pathData;

        for (i = 0; i < len; i += 1) {
            pathData = {
                s: paths.v[i],
                e: paths.v[i + 1],
                to: [paths.o[i][0] - paths.v[i][0], paths.o[i][1] - paths.v[i][1]],
                ti: [paths.i[i + 1][0] - paths.v[i + 1][0], paths.i[i + 1][1] - paths.v[i + 1][1]]
            };
            bez.buildBezierData(pathData);
            pathInfo.tLength += pathData.bezierData.segmentLength;
            pathInfo.segments.push(pathData);
        }
        i = len;
        if (mask.cl) {
            pathData = {
                s: paths.v[i],
                e: paths.v[0],
                to: [paths.o[i][0] - paths.v[i][0], paths.o[i][1] - paths.v[i][1]],
                ti: [paths.i[0][0] - paths.v[0][0], paths.i[0][1] - paths.v[0][1]]
            };
            bez.buildBezierData(pathData);
            pathInfo.tLength += pathData.bezierData.segmentLength;
            pathInfo.segments.push(pathData);
        }

        len = this.textSpans.length;
        var currentLength = this.data.renderedData[num].t.p[0], segmentInd = 0, pointInd = 1, currentSegment, currentPoint, prevPoint, points;
        var segmentLength = 0, flag = true, contador = 0;
        var segments = pathInfo.segments;
        if (currentLength < 0 && mask.cl) {
            if (pathInfo.tLength < Math.abs(currentLength)) {
                currentLength = -Math.abs(currentLength) % pathInfo.tLength;
            }
            segmentInd = segments.length - 1;
            points = segments[segmentInd].bezierData.points;
            pointInd = points.length - 1;
            while (currentLength < 0) {
                currentLength += points[pointInd].partialLength;
                pointInd -= 1;
                if (pointInd < 0) {
                    segmentInd -= 1;
                    points = segments[segmentInd].bezierData.points;
                    pointInd = points.length - 1;
                }
            }

        }
        points = segments[segmentInd].bezierData.points;
        prevPoint = points[pointInd - 1];
        currentPoint = points[pointInd];
        var partialLength = currentPoint.partialLength;
        var perc, tanAngle;
    }

    len = this.textSpans.length;
    xPos = 0;
    yPos = 0;
    var yOff = this.yOffset*.714;
    var firstLine = true;
    var renderedData = this.data.renderedData[num].t, animatorProps;
    var j, jLen;

    jLen = renderedData.a.length;
    var ranges = [], totalChars, divisor;
    for(j=0;j<jLen;j+=1){
        totalChars = this.data.t.a[j].totalChars;
        divisor = this.data.t.a[j].s.r === 2 ? 1 : 100/totalChars;
        if(!('e' in renderedData.a[j].s)){
            renderedData.a[j].s.e = this.data.t.a[j].s.r === 2 ? totalChars : 100;
        }
        var o = renderedData.a[j].s.o/divisor;
        if(o === 0 && renderedData.a[j].s.s === 0 && renderedData.a[j].s.e === divisor){

        }
        var s = renderedData.a[j].s.s/divisor + o;
        var e = (renderedData.a[j].s.e/divisor) + o;
        if(s>e){
            var _s = s;
            s = e;
            e = _s;
        }
        ranges.push({s:s,e:e,ne:renderedData.a[j].s.ne,xe:renderedData.a[j].s.xe});
    }

    var mult, ind = -1, offf, xPathPos, yPathPos;
    var initPathPos = currentLength,initSegmentInd = segmentInd, initPointInd = pointInd;
    var elemOpacity;
    var sc,sw,fc,k;
    var lineLength = 0;

    for( i = 0; i < len; i += 1) {
        matrixHelper.reset();
        matrixHelper.translate(this.justifyOffset,0);
        elemOpacity = 1;
        letterValue = {};
        if(this.textSpans[i].n) {
            xPos = 0;
            yPos += this.yOffset;
            yPos += firstLine ? 1 : 0;
            currentLength = initPathPos ;
            firstLine = false;
            lineLength = 0;
            if('m' in this.data.t.p) {
                segmentInd = initSegmentInd;
                pointInd = initPointInd;
                points = segments[segmentInd].bezierData.points;
                prevPoint = points[pointInd - 1];
                currentPoint = points[pointInd];
                partialLength = currentPoint.partialLength;
                segmentLength = 0;
            }
            lettersValue.push(letterValue);
        }else{
            if('m' in this.data.t.p) {
                if(ind !== this.textSpans[i].ind){
                    if(this.textSpans[ind]){
                        currentLength += this.textSpans[ind].extra;
                    }
                    currentLength += this.textSpans[i].an/2;
                    ind = this.textSpans[i].ind;
                }
                currentLength += renderedData.m.a[0]*this.textSpans[i].an/200;
                var animatorOffset = 0;
                for(j=0;j<jLen;j+=1){
                    animatorProps = renderedData.a[j].a;
                    if ('p' in animatorProps && 's' in ranges[j]) {
                        mult = this.getMult(this.textSpans[i].anIndexes[j],ranges[j].s,ranges[j].e,ranges[j].ne,ranges[j].xe,this.data.t.a[j].s.sh);

                        animatorOffset += animatorProps.p[0] * mult;
                    }
                }

                flag = true;
                while (flag) {
                    if (segmentLength + partialLength >= currentLength + animatorOffset || !points) {
                        perc = (currentLength + animatorOffset - segmentLength) / currentPoint.partialLength;
                        xPathPos = prevPoint.point[0] + (currentPoint.point[0] - prevPoint.point[0]) * perc;
                        yPathPos = prevPoint.point[1] + (currentPoint.point[1] - prevPoint.point[1]) * perc;
                        matrixHelper.translate(xPathPos,yPathPos);
                        if (this.data.t.p.p) {
                            tanAngle = (currentPoint.point[1] - prevPoint.point[1]) / (currentPoint.point[0] - prevPoint.point[0]);
                            var rot = Math.atan(tanAngle) * 180 / Math.PI;
                            if (currentPoint.point[0] < prevPoint.point[0]) {
                                rot += 180;
                            }
                            matrixHelper.rotate(rot*Math.PI/180);
                        }
                        matrixHelper.translate(0,(renderedData.m.a[1]*yOff/100 + yPos));
                        flag = false;
                    } else if (points) {
                        segmentLength += currentPoint.partialLength;
                        pointInd += 1;
                        if (pointInd >= points.length) {
                            pointInd = 0;
                            segmentInd += 1;
                            if (!segments[segmentInd]) {
                                if (mask.cl) {
                                    pointInd = 0;
                                    segmentInd = 0;
                                    points = segments[segmentInd].bezierData.points;
                                } else {
                                    points = null;
                                }
                            } else {
                                points = segments[segmentInd].bezierData.points;
                            }
                        }
                        if (points) {
                            prevPoint = currentPoint;
                            currentPoint = points[pointInd];
                            partialLength = currentPoint.partialLength;
                        }
                    }
                }
                offf = this.textSpans[i].an/2 - this.textSpans[i].add;
            }else{
                matrixHelper.translate(xPos,yPos);
                offf = this.textSpans[i].an/2 - this.textSpans[i].add;
                matrixHelper.translate(offf,0);

                matrixHelper.translate(renderedData.m.a[0]*this.textSpans[i].an/200, renderedData.m.a[1]*yOff/100);
            }

            lineLength += this.textSpans[i].l/2;
            for(j=0;j<jLen;j+=1){
                animatorProps = renderedData.a[j].a;
                if ('t' in animatorProps && 's' in ranges[j]) {
                    mult = this.getMult(this.textSpans[i].anIndexes[j],ranges[j].s,ranges[j].e,ranges[j].ne,ranges[j].xe,this.data.t.a[j].s.sh);
                    if('m' in this.data.t.p) {
                        currentLength += animatorProps.t*mult;
                    }else{
                        xPos += animatorProps.t*mult;
                    }
                }
            }
            lineLength += this.textSpans[i].l/2;

            for(j=0;j<jLen;j+=1){
                animatorProps = renderedData.a[j].a;
                if ('p' in animatorProps && 's' in ranges[j]) {
                    mult = this.getMult(this.textSpans[i].anIndexes[j],ranges[j].s,ranges[j].e,ranges[j].ne,ranges[j].xe,this.data.t.a[j].s.sh);
                    if('m' in this.data.t.p) {
                        matrixHelper.translate(0, animatorProps.p[1] * mult);
                    }else{
                        matrixHelper.translate(animatorProps.p[0] * mult, animatorProps.p[1] * mult);
                    }
                }
            }
            if(this.strokeWidthAnim) {
                sw = this.data.t.d.sw;
            }
            if(this.strokeColorAnim) {
                sc = [this.data.t.d.sc[0], this.data.t.d.sc[1], this.data.t.d.sc[2]];
            }
            if(this.fillColorAnim) {
                fc = [this.data.t.d.fc[0], this.data.t.d.fc[1], this.data.t.d.fc[2]];
            }
            for(j=0;j<jLen;j+=1) {
                animatorProps = renderedData.a[j].a;
                mult = this.getMult(this.textSpans[i].anIndexes[j],ranges[j].s,ranges[j].e,ranges[j].ne,ranges[j].xe,this.data.t.a[j].s.sh);
                if ('r' in animatorProps && 's' in ranges[j]) {
                    matrixHelper.rotate(animatorProps.r*mult*Math.PI/180);
                }
                if ('o' in animatorProps && 's' in ranges[j]) {
                    elemOpacity += ((animatorProps.o/100)*mult - elemOpacity)*mult;
                }
                if (this.strokeWidthAnim && 'sw' in animatorProps && 's' in ranges[j]) {
                    sw += animatorProps.sw*mult;
                }
                if (this.strokeColorAnim && 'sc' in animatorProps && 's' in ranges[j]) {
                    for(k=0;k<3;k+=1){
                        sc[k] = Math.round(sc[k] + (animatorProps.sc[k] - sc[k])*mult);
                    }
                }
                if (this.fillColorAnim && 'fc' in animatorProps && 's' in ranges[j]) {
                    for(k=0;k<3;k+=1){
                        fc[k] = Math.round(fc[k] + (animatorProps.fc[k] - fc[k])*mult);
                    }
                }
            }
            if(this.strokeWidthAnim){
                letterValue.sw = sw < 0 ? 0 : sw;
            }
            if(this.strokeColorAnim){
                letterValue.sc = 'rgb('+sc[0]+','+sc[1]+','+sc[2]+')';
            }
            if(this.fillColorAnim){
                letterValue.fc = 'rgb('+fc[0]+','+fc[1]+','+fc[2]+')';
            }
            for(j=0;j<jLen;j+=1){
                animatorProps = renderedData.a[j].a;
                if ('s' in animatorProps && 's' in ranges[j]) {
                    mult = this.getMult(this.textSpans[i].anIndexes[j],ranges[j].s,ranges[j].e,ranges[j].ne,ranges[j].xe,this.data.t.a[j].s.sh);
                    matrixHelper.scale(1+((animatorProps.s[0]/100-1)*mult),1+((animatorProps.s[1]/100-1)*mult));
                }
            }
            for(j=0;j<jLen;j+=1){
                animatorProps = renderedData.a[j].a;
                if ('a' in animatorProps && 's' in ranges[j]) {
                    mult = this.getMult(this.textSpans[i].anIndexes[j],ranges[j].s,ranges[j].e,ranges[j].ne,ranges[j].xe,this.data.t.a[j].s.sh);
                    matrixHelper.translate(-animatorProps.a[0]*mult, -animatorProps.a[1]*mult);
                }
            }

            if('m' in this.data.t.p) {
                matrixHelper.translate(-renderedData.m.a[0]*this.textSpans[i].an/200, -renderedData.m.a[1]*yOff/100);
                currentLength -= renderedData.m.a[0]*this.textSpans[i].an/200;
                if(this.textSpans[i+1] && ind !== this.textSpans[i+1].ind){
                    currentLength += this.textSpans[i].an / 2;
                }
                matrixHelper.translate(-offf,0);
            }else{
                matrixHelper.translate(-offf,0);
                matrixHelper.translate(-renderedData.m.a[0]*this.textSpans[i].an/200,-renderedData.m.a[1]*yOff/100);
                xPos += this.textSpans[i].l;
            }
            if(svgFlag){
                letterValue.m = matrixHelper.toCSS();
            }else{
                letterValue.props = [matrixHelper.props[0],matrixHelper.props[1],matrixHelper.props[2],matrixHelper.props[3],matrixHelper.props[4],matrixHelper.props[5]];
            }
            letterValue.o = elemOpacity;
            lettersValue.push(letterValue);
        }
    }
    this.renderedLetters[num] = lettersValue;
};

BaseTextElement.prototype.getMult = function(ind,s,e,ne,xe,type){
    var easer = bez.getEasingCurve(ne/100,0,1-xe/100,1);
    //console.log(easer('',0.5,0,1,1));
    var mult = 0;
    if(type == 2){
        if(e === s){
            mult = ind >= e ? 1 : 0;
        }else{
            mult = Math.max(0,Math.min(0.5/(e-s) + (ind-s)/(e-s),1));
        }
        mult = easer('',mult,0,1,1);
    }else if(type == 3){
        if(e === s){
            mult = ind >= e ? 0 : 1;
        }else{
            mult = 1 - Math.max(0,Math.min(0.5/(e-s) + (ind-s)/(e-s),1));
        }

        mult = easer('',mult,0,1,1);
    }else if(type == 4){
        if(e === s){
            mult = ind >= e ? 0 : 1;
        }else{
            mult = Math.max(0,Math.min(0.5/(e-s) + (ind-s)/(e-s),1));
            if(mult<.5){
                mult *= 2;
            }else{
                mult = 1 - mult;
            }
        }
    }else {
        if(ind >= Math.floor(s)){
            if(ind-s < 0){
                mult = 1 - (s - ind);
            }else{
                mult = Math.max(0,Math.min(e-ind,1));
            }
        }
    }
    return mult;
};

