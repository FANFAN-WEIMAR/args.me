(function(mds) {
    /// given a matrix of distances between some points, returns the
    /// point coordinates that best approximate the distances using
    /// classic multidimensional scaling
    mds.classic = function(data, dimensions) {
        dimensions = dimensions || 2;

        // square distances

        var col=data[0].length;
        var row=data.length;

        var distances= [];
        for (var i=0;i<row;i++){
          distances[i]=new Array(row);
        }
        for(var a=0;a<row;a++){
          for(var b=0;b<row;b++){
            var distanceValue=0;
            for(var k=0;k<col;k++){
                distanceValue =distanceValue+ (data[a][k]-data[b][k])*(data[a][k]-data[b][k])
            }
                distances[a][b]=distanceValue;
                distances[b][a]=distanceValue;
          }
        }

        //console.log(distances);

        var M = numeric.mul(-0.5, distances);

        // double centre the rows/columns
        function mean(A) {
          return numeric.div(numeric.add.apply(null, A), A.length);
        }

        var rowMeans = mean(M),
            colMeans = mean(numeric.transpose(M)),
            totalMean = mean(rowMeans);

        for (var i = 0; i < M.length; ++i) {
            for (var j =0; j < M[0].length; ++j) {
                M[i][j] += totalMean - rowMeans[i] - colMeans[j];
            }
        }
        //console.log(M);

        // take the SVD of the double centred matrix, and return the
        // points from it
        var ret = numeric.svd(M),
            eigenValues = numeric.sqrt(ret.S);
        return ret.U.map(function(row) {
            return numeric.mul(row, eigenValues).splice(0, dimensions);
        });

    };

    mds.KL = function(data, dimensions) {
        dimensions = dimensions || 2;

        // square distances

        var col=data[0].length;
        var row=data.length;

        var distances= [];
        for (var i=0;i<row;i++){
          distances[i]=new Array(row);
        }

        for(var a=0;a<row;a++){
          for(var b=0;b<row;b++){
            var distanceValue=0;
            for(var k=0;k<col;k++){
                //distanceValue =distanceValue+ (data[a][k]-data[b][k])*(data[a][k]-data[b][k])
                distanceValue=distanceValue+data[a][k]*Math.log(data[a][k]/data[b][k])+data[b][k]*Math.log(data[b][k]/data[a][k]);
            }
                distances[a][b]=distanceValue;
                distances[b][a]=distanceValue;
          }
        }

        var M = numeric.mul(-0.5, distances);

        // double centre the rows/columns
        function mean(A) {
          return numeric.div(numeric.add.apply(null, A), A.length);
        }

        var rowMeans = mean(M),
            colMeans = mean(numeric.transpose(M)),
            totalMean = mean(rowMeans);

        for (var i = 0; i < M.length; ++i) {
            for (var j =0; j < M[0].length; ++j) {
                M[i][j] += totalMean - rowMeans[i] - colMeans[j];
            }
        }

        // take the SVD of the double centred matrix, and return the
        // points from it
        var ret = numeric.svd(M),
            eigenValues = numeric.sqrt(ret.S);
        return ret.U.map(function(row) {
            return numeric.mul(row, eigenValues).splice(0, dimensions);
        });
    };

    mds.Cosin = function(data, dimensions) {
        dimensions = dimensions || 2;

        // square distances

        var col=data[0].length;
        var row=data.length;

        var distances= [];

        for (var i=0;i<row;i++){
          distances[i]=new Array(row);
        }



        for(var a=0;a<row;a++){
          for(var b=0;b<row;b++){
            var distanceValue=0;
            var valueA=0;
            var valueB=0;
            for(var k=0;k<col;k++){
                //distanceValue =distanceValue+ (data[a][k]-data[b][k])*(data[a][k]-data[b][k])
                //distanceValue=distanceValue+data[a][k]*Math.log(data[a][k]/data[b][k])+data[b][k]*Math.log(data[b][k]/data[a][k]);
                valueA=valueA+data[a][k]*data[a][k];
                valueB=valueB+data[b][k]*data[b][k];
                distanceValue=distanceValue-data[a][k]*data[b][k];
            }
                valueA=Math.sqrt(valueA);
                valueB=Math.sqrt(valueB);
                distanceValue=distanceValue/(valueA*valueB);
                distances[a][b]=distanceValue;
                distances[b][a]=distanceValue;
          }
        }

        var M = numeric.mul(-0.5, distances);

        // double centre the rows/columns
        function mean(A) {
          return numeric.div(numeric.add.apply(null, A), A.length);
        }

        var rowMeans = mean(M),
            colMeans = mean(numeric.transpose(M)),
            totalMean = mean(rowMeans);

        for (var i = 0; i < M.length; ++i) {
            for (var j =0; j < M[0].length; ++j) {
                M[i][j] += totalMean - rowMeans[i] - colMeans[j];
            }
        }

        // take the SVD of the double centred matrix, and return the
        // points from it
        var ret = numeric.svd(M),
            eigenValues = numeric.sqrt(ret.S);
        return ret.U.map(function(row) {
            return numeric.mul(row, eigenValues).splice(0, dimensions);
        });
    };

    /// draws a scatter plot of points, useful for displaying the output
    /// from mds.classic etc
    mds.drawD3ScatterPlot = function(element, xPos, yPos, labels, params) {
        params = params || {};
        var padding = params.padding || 32,
            w = params.w || Math.min(720, document.documentElement.clientWidth - padding),
            h = params.h || w,
            xDomain = [Math.min.apply(null, xPos),
                       Math.max.apply(null, xPos)],
            yDomain = [Math.max.apply(null, yPos),
                       Math.min.apply(null, yPos)],
            pointRadius = params.pointRadius || 3;

        if (params.reverseX) {
            xDomain.reverse();
        }
        if (params.reverseY) {
            yDomain.reverse();
        }

        var xScale = d3.scale.linear().
                domain(xDomain)
                .range([padding, w - padding]),

            yScale = d3.scale.linear().
                domain(yDomain)
                .range([padding, h-padding]),

            xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom")
                .ticks(params.xTicks || 7),

            yAxis = d3.svg.axis()
                .scale(yScale)
                .orient("left")
                .ticks(params.yTicks || 7);

        var svg = element.append("svg")
                .attr("width", w)
                .attr("height", h);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (h - padding + 2*pointRadius) + ")")
            .style("fill","#ddd")
            .call(xAxis);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + (padding - 2*pointRadius) + ",0)")
            .style("fill","#ddd")
            .call(yAxis);

        var nodes = svg.selectAll("circle")
            .data(labels)
            .enter()
            .append("g");

        nodes.append("circle")
            .attr("r", pointRadius)
            .style("fill","green")
            .attr("cx", function(d, i) { return xScale(xPos[i]); })
            .attr("cy", function(d, i) { return yScale(yPos[i]); });

        nodes.append("text")
            .attr("text-anchor", "middle")
            .text(function(d) { return d; })
            .attr("x", function(d, i) { return xScale(xPos[i]); })
            .attr("y", function(d, i) { return yScale(yPos[i]) - 2 *pointRadius; });
        };




}(window.mds = window.mds || {}));
