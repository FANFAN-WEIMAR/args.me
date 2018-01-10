(function(barycentric) {

    polygon = function(rowData,element,radius,verticesNumber,labels){

      var col=rowData[0].length;
      var row=rowData.length;

      var data=(function(){
        var vertices=[];
        var x=radius;
        var y=0;
        var px,py,label;
        for(i=0;i<verticesNumber;i++){
          var alpha=(i+1)*2*Math.PI/verticesNumber;
          px=x;
          py=y;
          x=radius*Math.cos(alpha);
          y=radius*Math.sin(alpha);
          vertices.push({
            x:x,y:y,
            px:px,py:py,
            label:labels[i]
          })
        }
         return vertices;
      })();
      //console.log(data);

      //normalize the topic distribution

      var sum=[];
      for (var i=0;i<row;i++){
        sum[i]=0;
      }

      for(var a=0;a<row;a++){
        for(var k=0;k<col;k++){
          sum[a]=sum[a]+rowData[a][k];
        }
      }

      for(var a=0;a<row;a++){
        for(var k=0;k<col;k++){
          rowData[a][k]=rowData[a][k]/sum[a];
        }
      }
      //console.log(rowData);

      // set value for lables
      var topics=[];
      for (var i=0;i<row;i++){
        topics[i]=new Array(col);
      }

      for(var a=0;a<row;a++){
        for(var k=0;k<col;k++){
          if(a==k){
            topics[a][k]=1
          }else {
            topics[a][k]=0;
          }
        }
      }
      //console.log(topics);

      //compare vectors function
      function checkArrays(arrA,arrB){
        for(var i=0;i<arrA.length;i++){
          if(arrA[i]!==arrB[i])
          return false;
        }
        return true;
      }
      //calculate the weights of each argument
      var weights=[];
      for(var i=0;i<row;i++){
        weights[i]=new Array(col);
      }

      var a,b,c;
      for (var i=0;i<row;i++){
        var weightSum=0;
        for (var j=0;j<verticesNumber;j++){

          if(checkArrays(rowData[i],topics[j])){
            weights[i]=rowData[i];
            weightSum=1.0;
          }else {
            a=j-1;
            b=j;
            c=j+1;

            if(a<0){
              a=verticesNumber-1;
            }
            if(c==verticesNumber){
              c=0;
            }


            var prev=numeric.sub(topics[a],topics[b]);
            var next=numeric.sub(topics[c],topics[b]);;
            var current=numeric.sub(rowData[i],topics[b]);
            var angle1=1/math.tan(math.acos(numeric.dot(prev,current)/(numeric.norm2(prev)*numeric.norm2(current))));
            var angle2=1/math.tan(math.acos(numeric.dot(next,current)/(numeric.norm2(next)*numeric.norm2(current))));
            var bottom=(numeric.norm2(current)*numeric.norm2(current));

            weights[i][j]=(angle1+angle2)/bottom;
            weightSum=weightSum+weights[i][j];
          }
        }
        weights[i]=numeric.div(weights[i],weightSum);
      }
      //console.log(weights);

      // calculate the x and y value in cartesian coordinates
      var argumentWeight=[];
      for(var a=0;a<row;a++){
        var xValue=0,yValue=0;
        for(var b=0;b<col;b++){
          xValue=xValue+weights[a][b]*data[b].x;
          yValue=yValue+weights[a][b]*data[b].y;
        }
        argumentWeight.push({
          x:xValue,
          y:yValue,
        })
      }
      //console.log(argumentWeight);


      // draw the polygon
      var svg = element.append("svg")
          .attr("width", radius*3)
          .attr("height",radius*3);
      var g = svg.append('g')
          .attr('transform', "translate(" + radius + " " + radius + ")");

      var circles=data.concat(argumentWeight);
      //console.log(circles);

      var nodes=g.selectAll('circle')
            .data(circles)
            .enter()
            .append('svg:circle')
            .attr('r',3)
            .attr('cx',function(d){return d.x;})
            .attr('cy',function(d){return d.y;})
            .attr('opacity',1);

      var lable=g.selectAll('text')
            .data(data)
            .enter()
            .append('text')
            .attr("text-anchor", "right")
            .attr('x',function(d){return d.x;})
            .attr('y',function(d){return d.y;})
            .text(function(d){return d.label;});

      var line=g.selectAll('line')
            .data(data)
            .enter()
            .append('svg:line')
            .attr('x1',function(d){return d.px;})
            .attr('y1',function(d){return d.py;})
            .attr('x2',function(d){return d.x;})
            .attr('y2',function(d){return d.y;})
            .attr('stroke','black')
            .attr('stroke-width',2);


  }

}(window.barycentric = window.barycentric || {}));
