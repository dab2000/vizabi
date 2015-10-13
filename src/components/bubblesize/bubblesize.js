import * as utils from 'base/utils';
import Component from 'base/component';
import globals from 'base/globals';


/*!
 * VIZABI BUBBLE SIZE slider
 * Reusable bubble size slider
 */

var OPTIONS = {
  DOMAIN_MIN: 0,
  DOMAIN_MAX: 1,
  TEXT_PARAMS: { TOP: 18, LEFT: 12, MAX_WIDTH: 15, MAX_HEIGHT: 10 },
  BAR_WIDTH: 6,
  THUMB_RADIUS: 10,
  THUMB_STROKE_WIDTH: 4,
  INTRO_DURATION: 250
}

var profiles = {
    "small": {
      minRadius: 0.5,
      maxRadius: 40
    },
    "medium": {
      minRadius: 1,
      maxRadius: 55
    },
    "large": {
      minRadius: 1,
      maxRadius: 70
    }
};


var min = .1,
  max = 100;

var BubbleSize = Component.extend({

  /**
   * Initializes the timeslider.
   * Executed once before any template is rendered.
   * @param config The options passed to the component
   * @param context The component's parent
   */
  init: function (config, context) {
    
    this.name = 'bubblesize';
    
    this.template = this.template || "bubblesize.html";

    this.model_expects = [{
      name: "size",
      type: "size"
    }];

    this.fields = { min: 'min', max: 'max' };

    var _this = this;
    this.model_binds = {
      'change:size': function (evt) {
        var size = _this.brush.extent();
        if (evt.indexOf(_this.fields.min) > -1) {
          size[0] = _this.model.size[_this.fields.min];
        }
        if (evt.indexOf(_this.fields.max) > -1) {
          size[1] = _this.model.size[_this.fields.max];
        }
        _this.sliderEl.call(_this.brush.extent(size));
        _this.sliderEl.call(_this.brush.event);
      }
    };

    //contructor is the same as any component
    this._super(config, context);
  },

  /**
   * Executes after the template is loaded and rendered.
   * Ideally, it contains HTML instantiations related to template
   * At this point, this.element and this.placeholder are available as a d3 object
   */
  readyOnce: function () {
    var values = [this.model.size.min, this.model.size.max],
      _this = this;
    this.element = d3.select(this.element);
    this.sliderSvg = this.element.select(".vzb-bs-slider-svg");
    this.sliderWrap = this.sliderSvg.select(".vzb-bs-slider-wrap");
    this.sliderEl = this.sliderWrap.select(".vzb-bs-slider");
             
    var boundRect = this.element.node().getBoundingClientRect();
    var
      boundBoxWidth = boundRect.width,
      boundBoxHeight = boundRect.height,
      textMargin = { top: OPTIONS.TEXT_PARAMS.TOP, left: OPTIONS.TEXT_PARAMS.LEFT },
      textMaxWidth = OPTIONS.TEXT_PARAMS.MAX_WIDTH,
      textMaxHeight = OPTIONS.TEXT_PARAMS.MAX_HEIGHT,
      barWidth = OPTIONS.BAR_WIDTH,
      thumbRadius = OPTIONS.THUMB_RADIUS,
      thumbStrokeWidth = OPTIONS.THUMB_STROKE_WIDTH,
      introDuration = OPTIONS.INTRO_DURATION,
      padding = {
        top: 0,
        left: thumbRadius + thumbStrokeWidth + textMargin.left + textMaxWidth,
        right: thumbRadius + thumbStrokeWidth + textMargin.left + textMaxWidth,
        bottom: textMargin.top + textMaxHeight
      }

    var minMaxBubbleRadius = this.getMinMaxBubbleRadius(); 
    var sliderWidth = boundBoxWidth - padding.left - padding.right,
        sliderHeight = boundBoxHeight - padding.top - padding.bottom;

    this.xScale = d3.scale.linear()
      .domain([OPTIONS.DOMAIN_MIN, OPTIONS.DOMAIN_MAX])
      .range([minMaxBubbleRadius.min * 2, minMaxBubbleRadius.max * 2])
      .clamp(true)

    _this.brush = d3.svg.brush()
      .x(this.xScale)
      .extent([OPTIONS.DOMAIN_MIN, OPTIONS.DOMAIN_MIN])
      .on("brush", function () {
        var s = _this.brush.extent();

        updateArcs(s);
        updateLabels(s);

        _this._setValue(s);
      })
      .on("brushend", function () {
         _this.sliderEl.selectAll(".resize")
          .style("display", null)
      });
    
    this.sliderSvg
      .attr("width", sliderWidth + padding.left + padding.right)
      .attr("height", sliderHeight + padding.top + padding.bottom)
    this.sliderWrap.attr("transform", "translate(" + padding.left + "," + padding.top + ")")
    this.sliderEl
      .call(_this.brush);

    var thumbArc = d3.svg.arc()
      .outerRadius(thumbRadius)
      .startAngle(0)
      .endAngle(2 * Math.PI)

    this.sliderThumbs = this.sliderEl.selectAll(".resize").sort(d3.descending)
      .classed("vzb-bs-slider-thumb", true)
    
    this.sliderThumbs.append("path")
      .attr("class", "vzb-bs-slider-thumb-badge")
      .attr("d", thumbArc)
    this.sliderThumbs.append("path")
      .attr("class", "vzb-bs-slider-thumb-arc")
    this.sliderEl.selectAll("text").data([0,0]).enter()
      .append("text")
      .attr("class", "vzb-bs-slider-thumb-label")
      .attr("dy", "0.35em")
      .attr("text-anchor", function(d, i) {
        return i ? "start" : "end"})
    this.sliderEl.selectAll("rect")
      .attr("height", barWidth)
      .attr("rx", barWidth * 0.25)
      .attr("ry", barWidth * 0.25)
      .attr("transform", "translate(0," + (-barWidth * 0.5) + ")")
    this.sliderEl.select(".extent")
      .classed("vzb-bs-slider-extent", true)
    
    var valueArc = d3.svg.arc()
      .outerRadius(function (d) { return _this.xScale(d) * 0.5 })
      .innerRadius(function (d) { return _this.xScale(d) * 0.5 })
      .startAngle(-Math.PI * 0.5)
      .endAngle(Math.PI * 1.5)

    function updateArcs(s) {
      _this.sliderThumbs.select('.vzb-bs-slider-thumb-arc').data(s)
        .attr("d", valueArc)
        .attr("transform", function (d) { return "translate(" + (-_this.xScale(d) * 0.5) + ",0)"; })
    }

    function updateLabels(s) {
      _this.sliderEl.selectAll("text.vzb-bs-slider-thumb-label").data(s)
      .attr("transform", circleLabelTransform)
      .text(function (d) { return d.toFixed(2); });
    }
    
    var arcLabelTransform = function(d, i) {
       var dX = textMargin.left + _this.xScale(d),
           dY = textMargin.top * (i ? -1.0 : 1.0);
       return "translate(" + (dX) + "," + (dY) + ")";
    }

    var circleLabelTransform = function(d, i) {
       var dX = i ? textMargin.left + _this.xScale(d) : -textMargin.left,
           dY = -textMargin.top;
       return "translate(" + (dX) + "," + (dY) + ")";      
    }
    
    //this.indicatorEl = this.element.selectAll('.vzb-bs-slider .vzb-bs-slider-thumb-label');
    this.on("resize", function() {
      //console.log("EVENT: resize");
      _this.xScale.range([_this.getMinMaxBubbleRadius().min * 2, _this.getMinMaxBubbleRadius().max * 2]);
      this.sliderEl
        .attr("transform", "translate(" + (sliderWidth - this.getMinMaxBubbleRadius().max * 2) * 0.5 + "," + sliderHeight + ")")
        .call(_this.brush.extent(_this.brush.extent()))
        .call(_this.brush.event);
    });
    
    this.sliderEl
      .attr("transform", "translate(" + (sliderWidth - this.getMinMaxBubbleRadius().max * 2) * 0.5 + "," + sliderHeight + ")")
      .call(this.brush.extent(values))
      .call(this.brush.event);
  },

  modelReady: function () {
//    this.indicatorEl.data([this.model.size.min, this.model.size.max])
//      .text(function (d) { return d; });
  },

  getSizeDomainValues: function() {
    this.model.size.scale.domain()
    this.model.size.tickFormatter(1376048943)  
    
  },
  
  getMinMaxBubbleRadius: function() {
    return { min: profiles[this.getLayoutProfile()].minRadius, max: profiles[this.getLayoutProfile()].maxRadius};    
  },
  
  /*
   * RESIZE:
   * Executed whenever the container is resized
   */
  updateSize: function() {
    var _this = this;

//    this.activeProfile = profiles[this.getLayoutProfile()];
  },
  //slideHandler: function () {
  //  this._setValue(+d3.event.target.value);
  //},

  /**
   * Sets the current value in model. avoid updating more than once in framerate
   * @param {number} value
   */
  _setValue: function (value) {
    var frameRate = 50;

    //implement throttle
    //TODO: use utils.throttle
    var now = new Date();
    if (this._updTime != null && now - this._updTime < frameRate) return;
    this._updTime = now;

    this.model.size.min = value[0];
    this.model.size.max = value[1];
  }

});

export default BubbleSize;
