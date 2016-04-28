//d3.svg.label
import * as utils from 'base/utils';
import {
  close as iconClose
} from 'base/iconset';


export default function label(context) {

  return function d3_label() {
  
    var _this = context;

    var _cssPrefix;
    label.setCssPrefix = function(cssPrefix) {
      _cssPrefix = cssPrefix;
      return label;
    }    

    var _sizeTextScale = null;
    label.setSizeTextScale = function(sizeTextScale) {
      _sizeTextScale = sizeTextScale;
      return label;
    }
    
    var _leashCoeff = 0;
    label.setLeashCoeff = function(leashCoeff) {
      _leashCoeff = leashCoeff;
      return label;
    }
    
    var _closeCrossHeight = null;
    label.setCloseCrossHeight = function(closeCrossHeight) {
      _closeCrossHeight = closeCrossHeight;
      return label;
    }
    
    var __xScale = null;
    label.setXScale = function(xScale) {
      __xScale = xScale;
      return label;
    }
    var _xScale = function(x) {
      return __xScale ? __xScale(x) : (x * context.width);
    };
    label.xScale = _xScale;
    
    var __yScale = null;
    label.setYScale = function(yScale) {
      __yScale = yScale;
      return label;
    }
    var _yScale = function(y) {
      return __yScale ? __yScale(y) : (y * context.height);
    };
    label.yScale = _yScale;

    var labelDragger = d3.behavior.drag()
      .on("dragstart", function(d, i) {
        d3.event.sourceEvent.stopPropagation();
        var KEY = _this.KEY;
      })
      .on("drag", function(d, i) {
        var KEY = _this.KEY;
        if(!_this.model.ui.chart.labels.dragging) return;
        if(!this.druging) _this.druging = d[KEY];
        var cache = _this.cached[d[KEY]];
        cache.labelFixed = true;
        
        var viewWidth = _this.toolContext.width;       
        var viewHeight = _this.toolContext.height;       

        cache.labelX_ += d3.event.dx / viewWidth;
        cache.labelY_ += d3.event.dy / viewHeight;

        var resolvedX = _xScale(cache.labelX0) + cache.labelX_ * viewWidth;
        var resolvedY = _yScale(cache.labelY0) + cache.labelY_ * viewHeight;

        var resolvedX0 = _xScale(cache.labelX0);
        var resolvedY0 = _yScale(cache.labelY0);

        var lineGroup = _this.entityLines.filter(function(f) {
          return f[KEY] == d[KEY];
        });

        label._repositionLabels(d, i, this, resolvedX, resolvedY, resolvedX0, resolvedY0, 0, null, lineGroup);
      })
      .on("dragend", function(d, i) {
        var KEY = _this.KEY;
        if(_this.druging) {
          _this.druging = null;
          _this.model.entities.setLabelOffset(d, [
            _this.cached[d[KEY]].labelX_,
            _this.cached[d[KEY]].labelY_
          ]);
        }
      });
    
    function label(container) {
      container
        .call(labelDragger)
        .each(function(d, index) {
          var view = d3.select(this);

  // Ola: Clicking bubble label should not zoom to countries boundary #811
  // It's too easy to accidentally zoom
  // This feature will be activated later, by making the label into a "context menu" where users can click Split, or zoom,.. hide others etc....

          view.append("rect");
  //          .on("click", function(d, i) {
  //            //default prevented is needed to distinguish click from drag
  //            if(d3.event.defaultPrevented) return;
  //
  //            var maxmin = _this.cached[d[KEY]].maxMinValues;
  //            var radius = utils.areaToRadius(_this.sScale(maxmin.valueSmax));
  //            _this._panZoom._zoomOnRectangle(_this.element,
  //              _this.xScale(maxmin.valueXmin) - radius,
  //              _this.yScale(maxmin.valueYmin) + radius,
  //              _this.xScale(maxmin.valueXmax) + radius,
  //              _this.yScale(maxmin.valueYmax) - radius,
  //              false, 500);
  //          });

          view.append("text").attr("class", _cssPrefix + "-label-content vzb-label-shadow");

          view.append("text").attr("class", _cssPrefix + "-label-content");

          var cross = view.append("g").attr("class", _cssPrefix + "-label-x vzb-transparent");
          utils.setIcon(cross, iconClose);

          cross.insert("circle", "svg");

          cross.select("svg")
            .attr("class", _cssPrefix + "-label-x-icon")
            .attr("width", "0px")
            .attr("height", "0px");

          cross.on("click", function() {
            _this.model.entities.clearHighlighted();
            //default prevented is needed to distinguish click from drag
            if(d3.event.defaultPrevented) return;
            _this.model.entities.selectEntity(d);
          });

        })
        .on("mouseover", function(d) {
          if(utils.isTouchDevice()) return;
          _this.model.entities.highlightEntity(d);
          _this.entityLabels.sort(function (a, b) { // select the labels and sort the path's
            if (a.geo != d.geo) return -1;          // a is not the hovered element, send "a" to the back
            else return 1;
          });
          d3.select(this).selectAll("." + _cssPrefix + "-label-x")
            .classed("vzb-transparent", false);
        })
        .on("mouseout", function(d) {
          if(utils.isTouchDevice()) return;
          _this.model.entities.clearHighlighted();
          d3.select(this).selectAll("." + _cssPrefix + "-label-x")
            .classed("vzb-transparent", true);
        })
        .on("click", function(d) {
          if (!utils.isTouchDevice()) return;
          var cross = d3.select(this).selectAll("." + _cssPrefix + "-label-x");
          cross.classed("vzb-transparent", !cross.classed("vzb-transparent"));
        });
    
      return label;  
    };

    label.line = function(container) {
      container.append("line").attr("class", _cssPrefix + "-label-line");
    };
      
    label.updateLabel = updateLabel.bind(context); 
    function updateLabel(d, index, valueX, valueY, scaledS, valueL, valueLST, duration, showhide, labelOffset, labelText) {
      // reposition label and leash
      var KEY = this.KEY;
      var cached = _this.cached[d[KEY]];
      
      var brokenInputs = !valueX && valueX !==0 || !valueY && valueY !==0 || !scaledS && scaledS !==0;

      var lineGroup = _this.entityLines.filter(function(f) {
        return f[KEY] == d[KEY];
      });
      // reposition label
      _this.entityLabels.filter(function(f) {
          return f[KEY] == d[KEY]
        })
        .each(function(groupData) {

          var labelGroup = d3.select(this);

          if (brokenInputs) {
            labelGroup.classed("vzb-invisible", brokenInputs);
            lineGroup.classed("vzb-invisible", brokenInputs);
            return;
          }
          
          cached.valueX = valueX;
          cached.valueY = valueY;

          if(cached.scaledS0 == null || cached.labelX0 == null || cached.labelX0 == null) { //initialize label once
            cached.scaledS0 = scaledS;
            cached.labelX0 = valueX;
            cached.labelY0 = valueY;
          }

          var text = labelGroup.selectAll("." + _cssPrefix + "-label-content")
            .text(labelText);
          var labels = _this.model.ui.chart.labels || {};
          labelGroup.classed('vzb-label-boxremoved', labels.removeLabelBox);
          if(_sizeTextScale) {
            var range = _sizeTextScale.range();
            var fontSize = range[0] + Math.sqrt((_sizeTextScale(valueLST) - range[0]) * (range[1] - range[0]));
            text.attr('font-size', fontSize + 'px');
          }

          var rect = labelGroup.select("rect");

          var contentBBox = text[0][0].getBBox();
          if(!cached.contentBBox || cached.contentBBox.width != contentBBox.width) {
            cached.contentBBox = contentBBox;

            var labelCloseHeight = _closeCrossHeight || contentBBox.height;//_this.activeProfile.infoElHeight * 1.2;//contentBBox.height;

            var labelCloseGroup = labelGroup.select("." + _cssPrefix + "-label-x")
              .attr('transform', 'translate(' + 4 + ',' + (-contentBBox.height * .85) + ')');
              //.attr("x", /*contentBBox.height * .0 + */ 4)
              //.attr("y", contentBBox.height * -1);

            labelCloseGroup.select("circle")
              .attr("cx", /*contentBBox.height * .0 + */ 0)
              .attr("cy", 0)
              .attr("r", labelCloseHeight * .5);

            labelCloseGroup.select("svg")
              .attr("x", -labelCloseHeight * .5 )
              .attr("y", labelCloseHeight * -.5)
              .attr("width", labelCloseHeight)
              .attr("height", labelCloseHeight)

            rect.attr("width", contentBBox.width + 8)
              .attr("height", contentBBox.height * 1.2)
              .attr("x", -contentBBox.width - 4)
              .attr("y", -contentBBox.height * .85)
              .attr("rx", contentBBox.height * .2)
              .attr("ry", contentBBox.height * .2);
          }
          
          var viewWidth = _this.toolContext.width;       
          var viewHeight = _this.toolContext.height;       

          var _labelOffset = labelOffset || [0,0];

          cached.labelX_ = _labelOffset[0] || (-cached.scaledS0 * .75 - 5) / viewWidth;
          cached.labelY_ = _labelOffset[1] || (-cached.scaledS0 * .75 - 11) / viewHeight;

          var resolvedX0 = _xScale(cached.labelX0);
          var resolvedY0 = _yScale(cached.labelY0);
          var resolvedX = resolvedX0 + cached.labelX_ * viewWidth;
          if(_labelOffset[0] == 0) {
            if(resolvedX - cached.contentBBox.width <= 0) { //check left
              cached.labelX_ = (cached.scaledS0 * .75 + cached.contentBBox.width + 10) / viewWidth;
              resolvedX = resolvedX0 + cached.labelX_ * viewWidth;
            } else if(resolvedX + 15 > viewWidth) { //check right
              cached.labelX_ = (viewWidth - 15 - resolvedX0) / viewWidth;
              resolvedX = resolvedX0 + cached.labelX_ * viewWidth;
            }
          }
          var resolvedY = resolvedY0 + cached.labelY_ * viewHeight;
          if(_labelOffset[1] == 0) {
            if(resolvedY - cached.contentBBox.height <= 0) { // check top 
              cached.labelY_ = (cached.scaledS0 * .75 + cached.contentBBox.height) / viewHeight;
              resolvedY = resolvedY0 + cached.labelY_ * viewHeight;
            } else if(resolvedY + 10 > viewHeight) { //check bottom
              cached.labelY_ = (viewHeight - 10 - resolvedY0) / viewHeight;
              resolvedY = resolvedY0 + cached.labelY_ * viewHeight;
            }
          }
          label._repositionLabels(d, index, this, resolvedX, resolvedY, resolvedX0, resolvedY0, duration, showhide, lineGroup);

        });
      
    };
      
    label._repositionLabels = _repositionLabels.bind(context);
    function _repositionLabels(d, i, context, _X, _Y, _X0, _Y0, duration, showhide, lineGroup) {

      var cache = this.cached[d[this.KEY]];

      var labelGroup = d3.select(context);

      //protect label and line from the broken data
      var brokenInputs = !_X && _X !==0 || !_Y && _Y !==0 || !_X0 && _X0 !==0 || !_Y0 && _Y0 !==0;
      if(brokenInputs) {
          labelGroup.classed("vzb-invisible", brokenInputs);
          lineGroup.classed("vzb-invisible", brokenInputs);
          return;
      }

      var rectBBox = labelGroup.select("rect").node().getBBox();
      var width = rectBBox.width;
      var height = rectBBox.height;
      var viewWidth = _this.toolContext.width;       
      var viewHeight = _this.toolContext.height;       
      var heightDelta = labelGroup.node().getBBox().height - height;
      //apply limits so that the label doesn't stick out of the visible field
      if(_X - width <= 0) { //check left
        _X = width;
        cache.labelX_ = (_X - _xScale(cache.labelX0)) / viewWidth;
      } else if(_X + 23 > viewWidth) { //check right
        _X = viewWidth - 23; 
        cache.labelX_ = (_X - _xScale(cache.labelX0)) / viewWidth;
      }
      if(_Y - height * .75 - heightDelta <= 0) { // check top
        _Y = height * .75 + heightDelta;
        cache.labelY_ = (_Y - _yScale(cache.labelY0)) / viewHeight;
      } else if(_Y + height * .35 > viewHeight) { //check bottom
        _Y = viewHeight - height * .35;
        cache.labelY_ = (_Y - _yScale(cache.labelY0)) / viewHeight;
      }

      if(duration == null) duration = _this.duration;
      if(duration) {
        if(showhide && !d.hidden){
            //if need to show label
          
            labelGroup.classed("vzb-invisible", d.hidden);
            labelGroup
                .attr("transform", "translate(" + _X + "," + _Y + ")")
                .style("opacity", 0)
                .transition().duration(duration).ease("exp")
                .style("opacity", 1);
                //i would like to set opactiy to null in the end of transition. 
                //but then fade in animation is not working for some reason
            lineGroup.classed("vzb-invisible", d.hidden);
            lineGroup
                .attr("transform", "translate(" + _X + "," + _Y + ")")
                .style("opacity", 0)
                .transition().duration(duration).ease("exp")
                .style("opacity", 1);
                //i would like to set opactiy to null in the end of transition. 
                //but then fade in animation is not working for some reason
            
        } else if(showhide && d.hidden) {
            //if need to hide label
            
            labelGroup
                .style("opacity", 1)
                .transition().duration(duration).ease("exp")
                .style("opacity", 0)
                .each("end", function(){
                    labelGroup
                        .style("opacity", 1) //i would like to set it to null. but then fade in animation is not working for some reason
                        .classed("vzb-invisible", d.hidden);
                })
            lineGroup
                .style("opacity", 1)
                .transition().duration(duration).ease("exp")
                .style("opacity", 0)
                .each("end", function(){
                    lineGroup
                        .style("opacity", 1) //i would like to set it to null. but then fade in animation is not working for some reason
                        .classed("vzb-invisible", d.hidden);
                })      
            
        } else {
            // just update the position
            
            labelGroup
                .transition().duration(duration).ease("linear")
                .attr("transform", "translate(" + _X + "," + _Y + ")");
            lineGroup
                .transition().duration(duration).ease("linear")
                .attr("transform", "translate(" + _X + "," + _Y + ")");
        }
          
      } else {
        labelGroup
            .interrupt()
            .attr("transform", "translate(" + _X + "," + _Y + ")");
        lineGroup
            .interrupt()
            .attr("transform", "translate(" + _X + "," + _Y + ")");
        if(showhide) labelGroup.classed("vzb-invisible", d.hidden);
        if(showhide) lineGroup.classed("vzb-invisible", d.hidden);
      }

      var diffX1 = _X0 - _X;
      var diffY1 = _Y0 - _Y;
      var textBBox = labelGroup.select('text').node().getBBox();
      var diffX2 = -textBBox.width * .5;
      var diffY2 = -height * .2;
      var labels = this.model.ui.chart.labels;

      var bBox = labels.removeLabelBox ? textBBox : rectBBox;
      
      var FAR_COEFF = _leashCoeff||0;

      var lineHidden = circleRectIntersects({x: diffX1, y: diffY1, r: cache.scaledS0},
        {x: diffX2, y: diffY2, width: (bBox.height * 2 * FAR_COEFF + bBox.width), height: (bBox.height * (2 * FAR_COEFF + 1))});
      lineGroup.select('line').classed("vzb-invisible", lineHidden);
      if(lineHidden) return;

      if(labels.removeLabelBox) {
        var angle = Math.atan2(diffX1 - diffX2, diffY1 - diffY2) * 180 / Math.PI;
        var deltaDiffX2 = (angle >= 0 && angle <= 180) ? (bBox.width * .5) : (-bBox.width * .5);
        var deltaDiffY2 = (Math.abs(angle) <= 90) ? (bBox.height * .55) : (-bBox.height * .45);
        diffX2 += Math.abs(diffX1 - diffX2) > textBBox.width * .5 ? deltaDiffX2 : 0;
        diffY2 += Math.abs(diffY1 - diffY2) > textBBox.height * .5 ? deltaDiffY2 : (textBBox.height * .05);
      }

      var longerSideCoeff = Math.abs(diffX1) > Math.abs(diffY1) ? Math.abs(diffX1) / viewWidth : Math.abs(diffY1) / viewHeight;
      lineGroup.select("line").style("stroke-dasharray", "0 " + (cache.scaledS0 + 2) + " " + ~~(longerSideCoeff + 2) + "00%");

      lineGroup.selectAll("line")
        .attr("x1", diffX1)
        .attr("y1", diffY1)
        .attr("x2", diffX2)
        .attr("y2", diffY2);

    }
  
    /*
    * Adapted from 
    * http://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
    * 
    * circle { 
    *  x: center X 
    *  y: center Y
    *  r: radius
    * }
    * 
    * rect {
    *  x: center X
    *  y: center Y
    *  width: width
    *  height: height
    * }
    */
    function circleRectIntersects(circle, rect) {
      var circleDistanceX = Math.abs(circle.x - rect.x);
      var circleDistanceY = Math.abs(circle.y - rect.y);    
      var halfRectWidth = rect.width * .5;
      var halfRectHeight = rect.height * .5;

      if (circleDistanceX > (halfRectWidth + circle.r)) { return false; }
      if (circleDistanceY > (halfRectHeight + circle.r)) { return false; }

      if (circleDistanceX <= halfRectWidth) { return true; } 
      if (circleDistanceY <= halfRectHeight) { return true; }

      var cornerDistance_sq = Math.pow(circleDistanceX - halfRectWidth, 2) +
                          Math.pow(circleDistanceY - halfRectHeight, 2);

      return (cornerDistance_sq <= Math.pow(circle.r,2));
    }

    return label;
  }();
};  