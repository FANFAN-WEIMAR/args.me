(function(barycentric) {

    polygon = function(processedData,element,radius,labels){

      let verticesNumber = labels.length;
      var rowData=getWeight(processedData);
      var rowData=mean(rowData);
      var score=getScore(processedData);
      var stance=getStance(processedData);
      var argumentList=getTitle(processedData);

      rowData = processedData.map(function (arg) {
        return arg.topics.map(o => o.weight);
      });
      // console.log(rowData);

      var col=rowData[0].length;
      var row=rowData.length;

      var data=polygonGraph(radius,verticesNumber);
      //console.log(data);
      var topicsLabel=wordCloud(215,labels);
      var rowData=mean(rowData);
      var argument=processedArgument(rowData,data,score,stance,processedData);
      // console.log(argument);

      var topicsLabel=wordCloud(201,labels);
      var circles=data.concat(argument);

      document.getElementById('overall').appendChild(listArgument(argumentList,data,circles));
      //brush();

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

      function wordDisplay(width,height,x,y){

        var fill = d3.scaleOrdinal(d3.schemeCategory20);

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
              .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
              .attr("width", layout.size()[0])
              .attr("height", layout.size()[1])
              .attr("x",function(){return x+230})
              .attr("y",function(){return y+270})
            .append("g")
              .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 +")")
            .selectAll("text")
              .data(words)
            .enter().append("text")
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

      function processedArgument(rowData,data,score,stance,processedData){
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

            //polygon.push(data[b].x*rowData[a][b], data[b].y*rowData[a][b])
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
            id:processedData[a].id,
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

      function getTitle(processedData){
        var title=[];
        for(var i=0;i<processedData.length;i++){
          title.push({
            id:processedData[i].id,
            title:processedData[i].title,
            url:processedData[i].url,
            score:processedData[i].score,
            stance:processedData[i].stance,
            premise:processedData[i].premise,
          });
        }
        title=_.sortBy(title,'score');
        title=title.reverse();
        return title;
      }

      function listArgument(arr,data,circles){
        var list=document.createElement('ul');
        list.setAttribute('class',"argumentText");
        for(var i=0;i<arr.length;i++){
          var item=document.createElement('li');

          var divArticle=document.createElement("div");
          var article=document.createElement("article");
          var a=document.createElement("a");
          var snippet=document.createElement("p");

          item.appendChild(divArticle);
          divArticle.appendChild(article);
          article.appendChild(a);
          article.appendChild(snippet);

          divArticle.style.width="600px";
          divArticle.setAttribute("class","article");

          a.setAttribute('id',"args"+arr[i].id);
          a.setAttribute('class',"args");
          a.setAttribute('href',arr[i].url);
          a.textContent=arr[i].title;
          snippet.innerHTML=arr[i].premise;
          snippet.setAttribute('class','snippet');

          a.addEventListener("mouseover",function(event){
            event.target.focus();
            var id=parseInt(event.target.id.replace(/\D/g,''));
            var check=circles[data.length+id].polygon.length;

            var points=circles[data.length+id].polygon;
            var stance=circles[data.length+id].stance;
            var overlap=circles[data.length+id].overlap;
            var x=circles[data.length+id].x;
            var y=circles[data.length+id].y;
            var px=circles[data.length+id].px;
            var py=circles[data.length+id].py;
            console.log(circles);
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
            var repPoint=g.append("circle")
                .attr('cx',function(d){return parseFloat(x);})
                .attr('cy',function(d){return parseFloat(y);})
                .attr("class","highlight")
                .attr("fill",function(d){
                  if(stance==true){
                    return  "#0c9";
                  }else if(stance==false){
                    return  '#c90';
                  }
                })
                .attr("opacity",1)
                .attr('r',function(d){
                  return overlap*10;
                })
                .style("stroke","white")
                .style("stroke-width",2);
            var arrow=g.append('line')
                .attr('x1',function(d){return x;})
                .attr('y1',function(d){return y;})
                .attr("class","highlight")
                .attr('x2',function(d){
                    var distanceX=px-x;
                    if(distanceX!=0){
                      var directionX=(px-x)/Math.abs(px-x);
                      return x+0.01*directionX;
                    }else{
                      return px;
                    }
                  })
                .attr('y2',function(d){
                    var distanceX=px-x;
                    var distanceY=py-y;
                    if(distanceX<0.001){
                      distanceX=0;
                    }
                    if(distanceX!=0 && distanceY!=0){
                      var directionY=(py-y)/Math.abs(py-y);
                      return y+Math.abs(distanceY/distanceX)*directionY*0.01;
                    }else if(distanceX!=0 && distanceY==0){
                      return py;
                    }else if(distanceX==0 && distanceY!=0){
                      var directionY=(py-y)/Math.abs(py-y);
                      return y+directionY*0.01;
                    }else{
                      return py;
                    }
                  })
                .attr('stroke','gray')
                .attr('stroke-width',2)
                .attr("marker-start",function(d){return "url(#arrow)";})
                .style("opacity",1);
            var previous = d3.select(".points").node();
            var current=d3.select(".highlight").node();
            current.parentNode.insertBefore(current, previous);
          });

          a.addEventListener("mouseout",function(event){
            d3.selectAll(".highlight").remove();
          })

          var stance=arr[i].stance;
          if(stance==true){
            a.style.color="#0c9";
          }else if(stance==false){
            a.style.color="#c90";
          }
          list.appendChild(item);
        }
        return list;
      }


      function brush(argument,argumentList){

        var down = false;
        var selDiv;
        var startX;
        var startY;

        var x1;
        var x2;
        var y1;
        var y2;
        var selList = [];

        document.onmousedown=function(){
          down = true;
          var isSelect = true;
          var evt = window.event || arguments[0];
           startX = (evt.x || evt.clientX);
           startY = (evt.y || evt.clientY);
          selDiv = document.createElement("div");
          document.body.appendChild(selDiv);

          selDiv.style.cssText = "position:absolute;width:0px;height:0px;border:1px;background-color:#C3D5ED;z-index:1000;opacity:0.6";
          selDiv.id = "selectDiv";

          selDiv.style.left = startX + "px";
          selDiv.style.top = startY + "px";

          var _x = null;
          var _y = null;

           x1= Math.min(_x, startX);
           x2=x1+ Math.abs(_x - startX);
           y1= Math.min(_y, startY);
           y2=y1+Math.abs(_y - startY)
      }

      document.onmousemove = function() {
        if (down){
        evt = window.event || arguments[0];
          if (selDiv.style.display == "none") {
            selDiv.style.display = "";
          }
          _x = (evt.x || evt.clientX);
          _y = (evt.y || evt.clientY);
          selDiv.style.left = Math.min(_x, startX) + "px";
          selDiv.style.top = Math.min(_y, startY) + "px";
          selDiv.style.width = Math.abs(_x - startX) + "px";
          selDiv.style.height = Math.abs(_y - startY) + "px";

           x1= Math.min(_x, startX);
           x2=x1+ Math.abs(_x - startX);
           y1= Math.min(_y, startY);
           y2=y1+Math.abs(_y - startY);
          //console.log(x1,x2,y1,y2);
        }}
      document.onmouseup = function() {
        down = false;

        for(var i=0;i<argument.length;i++){
          var pointX=argument[i].x+1000;
          var pointY=argument[i].y+400;
          var id=argument[i].id;
          var title;

          if(pointX<=x2 && pointX>=x1 && pointY<=y2 && pointY>=y1){

            for(j=0;j<argumentList.length;j++){
              if(argumentList[j].id==id){
                title=argumentList[j];
                selList.push(title);
              }
            }
          }
        }
        selList=_.uniq(selList);
        isSelect = false;
        d3.selectAll("#selectDiv").remove();
        if(selList.length>0){
          d3.select(".argumentText").remove();
          document.getElementById('overall').appendChild(listArgument(selList,data,circles));
        }
        selList = [], _x = null, _y = null, selDiv = null, startX = null, startY = null, evt = null;
      }
      }
      // draw the polygon
      var svg = element.append("svg")
          .attr("width", radius*3)
          .attr("height",radius*3);

      var g = svg.append('g')
          .attr('transform', "translate(" + radius*1.5 + " " + radius*1.5 + ")");


      var circles=data.concat(argument);
      // console.log(circles);

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

      console.log(argument);
      var nodes=g.selectAll('circle')
            .data(circles)
            .enter()
            .append('svg:circle')
            .attr("class","points")
            .attr('r',function(d){ return d.overlap*5; })
            .attr('cx',function(d){return d.x;})
            .attr('cy',function(d){return d.y;})
            .attr('id',function(d,i){
              if(i>=data.length){
                return 'circle'+d.id;
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
              if(d.overlap==1){
                var check=d.polygon.length;
                var points=d.polygon;
                console.log(points);
                var stance=d.stance;
                var id=d.id;
  							d3.select(this)
                  .attr("fill",function(d){
                    if(stance==true){
                      return  "#0c9";
                    }else if(stance==false){
                      return  '#c90';
                    }
                  })
                  .attr("opacity",1)
                  .attr('r',function(d,i){
                    return d.overlap*10;
                  })
                  .style("stroke","white")
                  .style("stroke-width",2);
                var item = document.getElementById("args"+id);
                if(item!=null){item.focus();}
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

              // }else if(d.overlap>=3){
              //   var overlapPolygon=polygonGraph(80,d.overlap);
              //   var points=[];
              //
              //   for(var i=0;i<overlapPolygon.length;i++){
              //     points.push(overlapPolygon[i].x+d.x, overlapPolygon[i].y+d.y)
              //   }
              //
              //   var x=d.x;
              //   var y=d.y;
              //   var selectedItem=[];
              //   for (var i=0; i<argument.length; i++){
              //     if(x==argument[i].x && y==argument[i].y){
              //       selectedItem.push(argument[i]);
              //     }
              //   }
              //   for(var i=0;i<selectedItem.length;i++){
              //     selectedItem[i].x=points[2*i];
              //     selectedItem[i].y=points[2*i+1];
              //   }
              //
              //   for(var i=0;i<selectedItem.length;i++){
              //     var circle=g.append('circle')
              //       .attr("class","subPolygon")
              //       .attr('r',function(d){ return 5; })
              //       .attr('cx',function(d){return selectedItem[i].x;})
              //       .attr('cy',function(d){return selectedItem[i].y;})
              //       .attr('fill',function(d,i){
              //         if(selectedItem[i].stance==true){
              //             return '#0C9';
              //           }else{
              //             return '#C90';
              //           }
              //       })
              //       .attr('opacity',function(d){return selectedItem[i].score/25;});
              //   }
              //
              //   var  drawPolygon=g.append("polygon")
              //     .style("stroke", "#0c9")  // colour the line
              //     .style("fill", "black")
              //     .style("opacity",0.2)    // remove any fill colour
              //     .attr("points", function(d){return points;})
              //     .attr('stroke-width',2)
              //     .attr("id","subPolygon")
              //     .on("mouseout", function(d){
              //        d3.select("#subPolygon").remove();
              //     });  // x,y points
              //   var previous = d3.select(".points").node();
              //   var current=d3.select("#subPolygon").node();
              //   current.parentNode.insertBefore(current, previous);
              // var previous = d3.select(".points").node();
              // var current=d3.select(".subPolygon").node();
              // current.parentNode.insertBefore(current, previous);

              }
						})
            .on('mouseout',function(d,i){
              var stance=d.stance;
              var id=d.id;
              // document.getElementById('args'+id).blur();
							d3.select(this)
                .attr('fill',function(d){
                  if(stance==true){
                    return '#0C9';
                  }else{
                    return '#C90';
                  }
                })
                .attr('r',function(d){
                  return d.overlap*5;
                })
                .attr('opacity',function(d){
                  return d.score/25;
                })
              d3.select(".highlight").remove();
							})
            .on('click',function(d){
              d3.select(".argumentText").remove();
              var x=d.x;
              var y=d.y;
              var selectedItem=[];
              for (var i=0; i<argument.length; i++){
                if(x==argument[i].x && y==argument[i].y){
                  var id=argument[i].id;
                  for(j=0;j<argumentList.length;j++){
                    if(id==argumentList[j].id){
                      var title=argumentList[j];
                      selectedItem.push(title);
                    }
                  }
                }
              }

              document.getElementById('overall').appendChild(listArgument(selectedItem,data,circles));
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
          wordDisplay(140,50,topicsLabel[i].x,topicsLabel[i].y);
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
                  return d.x+0.01*directionX;
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
                  return d.y+Math.abs(distanceY/distanceX)*directionY*0.01;
                }else if(distanceX!=0 && distanceY==0){
                  return d.py;
                }else if(distanceX==0 && distanceY!=0){
                  var directionY=(d.py-d.y)/Math.abs(d.py-d.y);
                  return d.y+directionY*0.01;
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

      brush(argument,argumentList);
   }

}(window.barycentric = window.barycentric || {}));
