(function(barycentric) {

    polygon = function(processedData,element,radius,verticesNumber,labels,score){

      var rowData=getWeight(processedData);
      var score=getScore(processedData);
      var stance=getStance(processedData);
      var conTitle=getConTitle(processedData);
      var proTitle=getProTitle(processedData);
      //console.log(conTitle);
      //console.log(proTitle);
      document.getElementById('proBox').appendChild(listArgument(proTitle));
      document.getElementById('conBox').appendChild(listArgument(conTitle));

      var col=rowData[0].length;
      var row=rowData.length;

      var data=polygonGraph(radius,verticesNumber);
      //console.log(data);
      var topicsLabel=wordCloud(215,labels);
      var rowData=mean(rowData);
      var argument=processedArgument(rowData,data,score,stance);
      console.log(argument);

      function polygonGraph(radius,verticesNumber){
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
            overlap:1
          })
        }
         return vertices;
      }

      function wordDisplay(width,height,id){

        var fill = d3.scale.category20();

        var layout = d3.layout.cloud()
            .size([width, height])
            .words([
              "Hello", "world", "normally", "you", "want", "more", "words",
              "than", "this"].map(function(d) {
              return {text: d, size: 5+Math.random() *5};
            }))
            .padding(0)
            .rotate(function() { return 0;})
            .font("Impact")
            .fontSize(function(d) { return d.size; })
            .on("end", draw);

        layout.start();

        function draw(words) {
          var drawWords=svg.append("svg")
              .attr("transform", "translate(" + id*layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
              .attr("width", layout.size()[0])
              .attr("height", layout.size()[1])
            .append("g")
              .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 +")")
            .selectAll("text")
              .data(words)
            .enter().append("text")
              .attr("class","class"+id)
              .style("font-size", function(d) { return d.size + "px"; })
              .style("font-family", "Impact")
              .style("fill", function(d, i) { return fill(i); })
              .attr("text-anchor", "middle")
              .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
              })
              .text(function(d) { return d.text; });
        }
      }

      function mean(rowData){
        var sum=[];
        var meanData=[];
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
        return rowData;
      }

      function processedArgument(rowData,data,score,stance){
        var argumentWeight=[];
        for(var a=0;a<row;a++){
          var xValue=0,yValue=0;
          var overlap=0;
          var maxIndex=0;
          var maxValue=0;
          var px=0;
          var py=0;
          var polygon=[];

          for(var b=0;b<col;b++){
            xValue=xValue+rowData[a][b]*data[b].x;
            yValue=yValue+rowData[a][b]*data[b].y;

            if(maxValue<rowData[a][b]){
              maxValue = rowData[a][b];
              maxIndex = b;
            }


            if(rowData[a][b]>0){
              polygon.push(data[b].x, data[b].y)
            }

          }
          argumentWeight.push({
            x:xValue,
            y:yValue,
            px:topicsLabel[maxIndex].x,
            py:topicsLabel[maxIndex].y,
            //px:data[maxIndex].x,
            //py:data[maxIndex].y,
            overlap:overlap,
            index:maxIndex,
            score:score[a],
            stance:stance[a],
            polygon:polygon,
            id:a
          })
        }
        //console.log(argumentWeight);

        for(var a=0;a<row;a++){
          for(var b=0;b<row;b++){
            if(a!=b){
              var equalCheck=_.isEqual(rowData[a],rowData[b])
              if(equalCheck){
                argumentWeight[a].overlap=argumentWeight[a].overlap+1;
                argumentWeight[b].overlap=argumentWeight[b].overlap+1;
              }
            }
          }
        }

        for(var a=0;a<row;a++){
          argumentWeight[a].overlap=argumentWeight[a].overlap/2 +1;
        }
        return argumentWeight;
      }

      function wordCloud(r,labels){
        var vertices=[];
        var x=0;
        var y=0;
        for(i=0;i<verticesNumber;i++){
          var alpha=(i+1)*2*Math.PI/verticesNumber;
          x=r*Math.cos(alpha);
          y=r*Math.sin(alpha);
          vertices.push({
            x:x,y:y,
            label:labels[i],
          })
        }
         return vertices;
      }

      function getWeight(processedData){
        var rowData=[];
        for(var i=0;i<processedData.length;i++){
          rowData.push(processedData[i].weight)
        }
        return rowData;
      }

      function getScore(processedData){
        var score=[];
        for(var i=0;i<processedData.length;i++){
          score.push(processedData[i].score)
        }
        return score;
      }

      function getStance(processedData){
        var stance=[];
        for(var i=0;i<processedData.length;i++){
          stance.push(processedData[i].stance)
        }
        return stance;
      }

      function getConTitle(processedData){
        var title=[];
        for(var i=0;i<processedData.length;i++){
          if(processedData[i].stance==false){
              title.push({index:i,title:processedData[i].title,url:processedData[i].url});
          }
        }
        title=_.sortBy(title,'score');
        title=title.reverse();
        return title;
      }

      function getProTitle(processedData){
        var title=[];
        for(var i=0;i<processedData.length;i++){
          if(processedData[i].stance==true){
              title.push({
                index:i,
                title:processedData[i].title,
                url:processedData[i].url,
                score:processedData[i].score
              });
          }
        }
        title=_.sortBy(title,'score');
        title=title.reverse();
        return title;
      }

      function listArgument(arr){

        var list=document.createElement('ul');
        list.setAttribute('class',"argumentText");
        for(var i=0;i<arr.length;i++){
          var item=document.createElement('li');
          var a=document.createElement("a");
          //item.appendChild(document.createTextNode(arr[i].title));
          item.appendChild(a);
          a.setAttribute('id',"args"+arr[i].index);
          a.setAttribute('class',"args");
          a.setAttribute('href',arr[i].url);

          a.textContent=arr[i].title;
          list.appendChild(item);
        }
        return list;
      }

      // draw the polygon
      var svg = element.append("svg")
          .attr("width", radius*3)
          .attr("height",radius*3);

      var g = svg.append('g')
          .attr('transform', "translate(" + radius*1.5 + " " + radius*1.5 + ")");


      var circles=data.concat(argument);
      console.log(circles);

      var defs = g.append("defs");

      var arrowMarker = defs.append("marker")
            .attr("id","arrow")
            .attr("markerUnits","strokeWidth")
            .attr("markerWidth","8")
            .attr("markerHeight","8")
            .attr("viewBox","0 0 13 13")
            .attr("refX","5")
            .attr("refY","5")
            .attr("orient","auto");

      var arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";

      arrowMarker.append("path")
            .attr("d",arrow_path)
            .attr("fill","black");

      var nodes=g.selectAll('circle')
            .data(circles)
            .enter()
            .append('svg:circle')
            .attr("class","points")
            .attr('r',function(d){ return d.overlap*5; })
            .attr('cx',function(d){return parseFloat(d.x);})
            .attr('cy',function(d){return parseFloat(d.y);})
            .attr('id',function(d,i){
              if(i>=data.length){
                return 'circle'+(i-data.length);
              }else{
                return 'vertices'
              }
            })
            .attr('fill',function(d,i){
              if(i>=data.length){
                if(d.stance==true){
                  return '#0C9';
                }else{
                  return '#C90';
                }

              }else{
                return 'black'
              }
            })
            .attr('opacity',function(d){
              if(i>=data.length){
                return d.score/25;
              }else{
                return 1.0;
              }
            })
            .on('mouseover',function(d,i){
							d3.select(this)
                .attr("fill","#C90")
                .attr("opacity",1)
                .attr('r',function(d,i){
                  return d.overlap*5;
                });
              var check=d.polygon.length;
              var points=d.polygon;
              var stance=d.stance;
              var id=d.id;
              //console.log(stance);
              if(stance==true){
                document.getElementById("args"+id).style.color = "#0c9";
              }else if(stance==false){
                document.getElementById("args"+id).style.color = '#c90';
              }

              if(check>=6){
                var  drawPolygon=g.append("polygon")
                  .style("stroke", "#0c9")  // colour the line
                  .style("fill", "black")
                  .style("opacity",0.2)    // remove any fill colour
                  .attr("points", function(d){return points;})
                  .attr('stroke-width',5)
                  .attr("class","highlight");  // x,y points

              }else if(check>2){
                var drawLine=g.append("line")
                  .attr('x1',function(d){return points[0];})
                  .attr('y1',function(d){return points[1];})
                  .attr('x2',function(d){return points[2];})
                  .attr('y2',function(d){return points[3];})
                  .attr("class","highlight")
                  .attr('stroke-width',5)
                  .style("stroke", "#0c9")
                  .style("opacity",0.2);
              }
              var previous = d3.select(".points").node();
              var current=d3.select(".highlight").node();
              current.parentNode.insertBefore(current, previous);
						})
            .on('mouseout',function(d,i){
              var stance=d.stance;
              var id=d.id;
							d3.select(this)
                .attr('fill',function(d,i){
                  if(stance==true){
                    return '#0C9';
                  }else{
                    return '#C90';
                  }
                })
                .attr('r',function(d,i){
                  return d.overlap*5;
                })
                .attr('opacity',function(d){
                  return d.score/25;
                });

              d3.select(".highlight").remove();
              d3.selectAll(".args").style('color','gray');
							})
            .on('click',function(d){
              var text=d.overlap;
              var x=d.x;
              var y=d.y;

              var rectangle=g.append("rect")
                 .attr("x", function(d) { return x-10; })
                 .attr("y", function(d) { return y-10;  })
                 .attr("width", function(d) { return 20; })
                 .attr("height", function(d) { return 20; })
                 .attr("fill","black")
                 .style("opacity",0.5)
                 .on("click", function(){
                     d3.select(this).remove();
                     d3.select("#NOAid").remove();
                 });

              var argument=g.append("text")
                .text(function(d){return text})
                .attr("x",function(d){return x;})
                .attr("y",function(d){return y+5;})
                .attr("fill","#FFF")
                .attr("text-anchor","middle")
                .attr("id","NOAid");

            });

      var rect=svg.selectAll('rect')
            .data(topicsLabel)
            .enter()
            .append('rect')
            .attr("x", function(d) { return d.x+240; })
            .attr("y", function(d) { return d.y+270;  })
            .attr("width", function(d) { return 130; })
            .attr("height", function(d) { return 50; })
            .attr("fill","black")
            .attr("id",function(d,i){return "topic"+i;})
            .style("opacity",0.5);

      var lable=svg.selectAll('text')
            .data(topicsLabel)
            .enter()
            .append('text')
            .attr("text-anchor", "middle")
            .attr('x',function(d){return d.x+305;})
            .attr('y',function(d){return d.y+300;})
            .attr("fill","#FFF")
            .text(function(d){return d.label;});

      for(var i=0;i<topicsLabel.length;i++){
          wordDisplay(130,50,i);
      }

      var line=g.selectAll('line')
            .data(circles)
            .enter()
            .append('svg:line')
            .attr('x1',function(d){return d.x;})
            .attr('y1',function(d){return d.y;})
            .attr('x2',function(d,i){
              if(i>=data.length){
                var distanceX=d.px-d.x;
                if(distanceX!=0){
                  var directionX=(d.px-d.x)/Math.abs(d.px-d.x);
                  return d.x+0.1*directionX;
                }else{
                  return d.px;
                }
              }else {
                return d.px;
              }})
            .attr('y2',function(d,i){
              if(i>=data.length){
                var distanceX=d.px-d.x;
                var distanceY=d.py-d.y;
                if(distanceX<0.001){
                  distanceX=0;
                }
                if(distanceX!=0 && distanceY!=0){
                  var directionY=(d.py-d.y)/Math.abs(d.py-d.y);
                  return d.y+Math.abs(distanceY/distanceX)*directionY*0.1;
                }else if(distanceX!=0 && distanceY==0){
                  return d.py;
                }else if(distanceX==0 && distanceY!=0){
                  var directionY=(d.py-d.y)/Math.abs(d.py-d.y);
                  return d.y+directionY*0.1;
                }else{
                  return d.py;
                }
              }else {
                return d.py;
            }})
            .attr('stroke','gray')
            .attr('stroke-width',2)
            .attr("marker-start",function(d,i){
              if(i>=data.length){
                return "url(#arrow)"
              }else {
                return null;
              }
            })
            .style("opacity",1);



   }

}(window.barycentric = window.barycentric || {}));
