import * as utils from 'base/utils';
import Component from 'base/component';

var DraggableList = Component.extend({

  init: function(config, context) {
    this.template = '<span class="vzb-dl-holder"><ul class="vzb-draggable list vzb-dialog-scrollable"></ul></span>';
    var _this = this;

    this.dataArrFn = config.dataArrFn;
    this.lang = config.lang;

    this.model_expects = [{
      name: "language",
      type: "language"
    }];

    this.model_binds = {
      "change:axis": function(evt) {
        _this.updateView();
      },
      "change:language:strings": function(evt) {
        _this.updateView();
      }
    };

    this._super(config, context);

    this.updateData = utils.debounce(this.updateData, 1000);
    
    this.itemDragger = d3.behavior.drag()
//      .origin(function (d) { return d;})
      .on('dragstart', function(draggedData, i) {
        //console.log('dragstart');
        _this.itemCoord = [];
        _this.element
          .selectAll('div').each(function(d, i) {
            var boundRect = this.getBoundingClientRect();
            //d['x'] = boundRect.left;
            this._y = boundRect.top;
            this._top = 0; 
            if(draggedData.data === d.data) {
              _this.selectedNode = this;
              //this._dy = 0;
            }
          })
        //_this.draggedData = 
        d3.select(_this.selectedNode).classed('dragged', true);//.datum();
      })
      .on('drag', function(d, i) {
        console.log("drag item "+ i + ' ' + d3.event.dy);
        this._top += d3.event.dy;
        this._y += d3.event.dy;
        _this.itemsEl
          .style('top', function(d, i) {
            if (this === _this.selectedNode) {
              //return this._top + "px";
            }
            else{
              if(Math.abs(_this.selectedNode._y - this._y) < 24 * .5 - 1) {
                //if(_this.draggedData.y + _this.draggedData.dy <= d.y + d.top) {
                 var dy = Math.sign(_this.selectedNode._y - this._y) * 24;
                 this._y += dy;
                 this._top = this._top === 0 ? dy : 0; 
                //}
              }
            }
            return this._top + "px";
          })
//          .each(function(d, i) {
//            d3.select(this).text("item " + i + "_y:" + this._y);
//          })

//        d3.select(_this.selectedNode).style('top', d['dy'] + "px");
//         var draggedNode = d;
//         var nodes = _this.element
//           .selectAll('div')//d3.selectAll("g.node")
//           .filter(function (d, i) {
//  //             if ((d != draggedNode) && (!isChildOf(draggedNode, d))) {
//               if (d != draggedNode) {
//                   return d;
//               }
//               return 0;
//           });
//         
//         var distances = [];
//         
//         nodes.each(function (d, i) {
//           var distanceX = draggedNode.x0 - d.x;
//           var distanceY = draggedNode.y0 - d.y;                       
//           var distance = Math.sqrt( Math.pow(distanceX, 2) + Math.pow(distanceY, 2) );
//           distances.push({
//             distance: distance,
//             distanceV: distanceX,   // vertical, <0 when draggedNode is above
//             distanceH: distanceY,   // horizontal, <0 when draggedNode is on the left
//             d: d
//           });
//         });
//         
//         // sort by shorter distances
//         distances.sort(function (a, b) {
//           return a.distance - b.distance;
//         });
//         
        //selectedNode = distances[0].d;
      })
      .on('dragend', function(d, i) {
        _this.element
          .selectAll('div')
          .style('top', '')
          .classed('dragged', false);
      })
  },

  ready: function() {
    var _this = this;

    this.updateView();

    this.itemsEl = this.element
      .selectAll('div')
    
    this.itemsEl
      .on('touchmove', function(d, i) {
        console.log("touchmove item "+ i + ' ' + d3.event.dy);        
      })
      .call(_this.itemDragger);
      
      
      
//       
//       .on('dragstart', function() {
//         d3.select(this).style('opacity', .4);
// 
//         _this.dragElem = this;
//         d3.event.dataTransfer.setData('text/html', this.innerHTML);
//         d3.event.dataTransfer.effectAllowed = 'move';
//       })
//       .on('dragover', function() {
//         if(d3.event.preventDefault)
//           d3.event.preventDefault();
// 
//         d3.event.dataTransfer.dropEffect = 'move';
// 
//         return false;
//       })
//       .on('dragenter', function() {
//         d3.select(this).select('li').classed('over', true);
// 
//         return false;
//       })
//       .on('dragleave', function() {
//         d3.select(this).select('li').classed('over', false);
//       })
//       .on('drop', function() {
//         if(d3.event.stopPropagation)
//           d3.event.stopPropagation();
// 
//         if(_this.dragElem) {
//           _this.dragElem.innerHTML = this.innerHTML;
//           this.innerHTML = d3.event.dataTransfer.getData('text/html');
//         }
// 
//         return false;
//       })
//       .on('dragend', function() {
//         d3.select(this).style('opacity', '');
//         _this.element
//           .selectAll('li')
//           .classed('over', false);
//         _this.updateData();
//       })
  },

  updateView: function() {
    var _this = this;
    this.translator = this.model.language.getTFunction();
    this.element.selectAll('li').remove();

    this.data = this.element.selectAll('li').data(function() {
      return _this.dataArrFn().map( function(d) { return {data:d};})});
    this.data.enter()
      .insert('div')
      .attr('draggable', true)
      .insert('li')
      .each(function(val, index) {
        d3.select(this).attr('data', val['data']).text(_this.translator(_this.lang + val['data']));
      });
  },

  updateData: function() {
    var dataArr = [];
    this.element
      .selectAll('li')
      .each(function() {
        dataArr.push(d3.select(this).attr('data'));
      });
    this.dataArrFn(dataArr);
  },

  readyOnce: function() {
    var _this = this;

    this.element = d3.select(this.element).select('.list');
  }

});

export default DraggableList;
