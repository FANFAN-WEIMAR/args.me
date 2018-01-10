(function() {
  var RADIUS, edges, g, radius, svg, update, vertices;
  RADIUS = 400;
  svg = d3.select('section').append('svg:svg');
  svg.attr('width', RADIUS * 2).attr('height', RADIUS * 2);
  g = svg.append('g').attr('transform', "translate(" + RADIUS + " " + RADIUS + ")");
  edges = document.querySelector('input[type=number]');
  radius = document.querySelector('input[type=range]');
  vertices = document.querySelector('input[type=checkbox]');
  d3.selectAll('input').on('change', function() {
    return update();
  });
  update = function() {
    var alpha, data, de, i, lpos, n, points, px, py, r, x, y;
    n = edges.value;
    r = radius.value;
    x = r;
    y = 0;
    data = (function() {
      var _results;
      _results = [];
      for (i = 1; 1 <= n ? i <= n : i >= n; 1 <= n ? i++ : i--) {
        alpha = i * 2 * Math.PI / n;
        px = x;
        py = y;
        x = r * Math.cos(alpha);
        y = r * Math.sin(alpha);
        _results.push({
          x: x,
          y: y,
          px: px,
          py: py
        });
      }
      return _results;
    })();
    points = g.selectAll('circle').data(data);
    points.enter().append('svg:circle').attr('r', 3).attr('cx', function(d) {
      return d.x;
    }).attr('cy', function(d) {
      return d.y;
    }).attr('opacity', function() {
      if (vertices.checked) {
        return 1;
      } else {
        return 0;
      }
    });
    points.transition().attr('cx', function(d) {
      return d.x;
    }).attr('cy', function(d) {
      return d.y;
    }).attr('opacity', function() {
      if (vertices.checked) {
        return 1;
      } else {
        return 0;
      }
    });
    points.exit().remove();
    lpos = function(sel) {
      return sel.attr('x1', function(d) {
        return d.px;
      }).attr('y1', function(d) {
        return d.py;
      }).attr('x2', function(d) {
        return d.x;
      }).attr('y2', function(d) {
        return d.y;
      });
    };
    de = g.selectAll('line').data(data);
    de.enter().append('svg:line').attr('stroke', 'black').attr('stroke-width', 2).call(lpos);
    de.transition().call(lpos);
    return de.exit().remove();
  };
  update();
}).call(this);
