/*!
 * VIZABI GAPMINDER PREFERENCES (included only in Gapminder build)
 */

import globals from 'base/globals';
import * as utils from 'base/utils';
import Promise from 'base/promise';
import Tool from 'base/tool';
import Vzb from 'vizabi';

//import tools
import BubbleChart from 'tools/bubblechart';
import BarRankChart from 'tools/barrankchart';
import MountainChart from 'tools/mountainchart';
import MCComponent from 'tools/mountainchart-component';
import BarChart from 'tools/barchart';
import BubbleMap from 'tools/bubblemap';
import BMComponent from 'tools/bubblemap-component';
import LineChart from 'tools/linechart';
import PopByAge from 'tools/popbyage';
import DonutChart from 'tools/donutchart';

//waffle reader
import {waffle as WaffleReader} from 'readers/_index';

var language = {
  id: "en",
  strings: {}
};

// Fallback in case if WS is not available - requesting data from local files
var locationArray = window.location.href.split("/");
var localUrl = locationArray.splice(0, locationArray.indexOf("preview")).join("/") + "/preview/";

globals.ext_resources = utils.deepExtend({
  host: localUrl,
  preloadPath: 'data/',
  dataPath: 'data/waffles/'
}, globals.ext_resources);

//OVERWRITE OPTIONS

BarChart.define('default_model', {
  state: {
    time: {
      start: "1800",
      end: "2012",
      value: "2000",
      step: 1
    },
    entities: {
      dim: "geo",
      show: {
        _defs_: {
          "geo": ["usa", "swe", "nor"],
          "geo.cat": ["country", "unstate"]
        }
      }
    },
    marker: {
      space: ["entities", "time"],
      label: {
        use: "property",
        which: "geo.name"
      },
      axis_y: {
        use: "indicator",
        which: "sg_population", // systema globalis
        //which: "population_total",
        scaleType: "log",
        allow: {
          scales: ["linear", "log"]
        }
      },
      axis_x: {
        use: "property",
        which: "geo.name",
        allow: {
          scales: ["ordinal"],
          names: ["!geo", "!_default"]
        }
      },
      color: {
        use: "property",
        which: "geo.world_4region",
        scaleType: "ordinal"
      }
    }
  },
  data: {
    reader: "csv",
    path: globals.ext_resources.host + globals.ext_resources.dataPath + "dont-panic-poverty.csv"
  },
  language: language,
  ui: {
    presentation: false
  }
});

BarRankChart.define('default_model', {
  state: {
    time: {
      start: "1950",
      end: "2015",
      value: "2000",
      step: 1
    },
    entities: {
      dim: "geo",
      show: {
        _defs_: {
          "geo.cat": ["country", "unstate"]
        }
      },
      opacitySelectDim: .3,
      opacityRegular: 1
    },
    entities_allpossible: {
      dim: "geo",
      show: {
        _defs_: {
          "geo": ["*"],
          "geo.cat": ["country", "unstate"]
        }
      }
    },
    marker_allpossible: {
      space: ["entities_allpossible"],
      label: {
        use: "property",
        which: "geo.name"
      }
    },
    marker: {
      space: ["entities", "time"],
      label: {
        use: "property",
        which: "geo.name"
      },
      axis_x: {
        use: "indicator",
        which: "sg_population", //systema globalis
        //which: "population_total",
        scaleType: "log",
        allow: {
          scales: [
            "linear",
            "log"
          ]
        }
      },
      // should not be here because axis-y is not geo.name but order of population
      axis_y: {
        use: "property",
        which: "geo.name",
        scaleType: "log",
        allow: {
          scales: [
            "ordinal"
          ]
        }
      },
      color: {
        use: "property",
        which: "geo.world_4region"
      }
    }
  },
  language: language,
  data: {
    reader: "csv",
    path: globals.ext_resources.host + globals.ext_resources.dataPath + "dont-panic-poverty.csv",
    splash: true
  },
  ui: {
    presentation: false
  }
});

BubbleMap.define('datawarning_content', {
  title: "",
  body: "Comparing the size of economy across countries and time is not trivial. The methods vary and the prices change. Gapminder has adjusted the picture for many such differences, but still we recommend you take these numbers with a large grain of salt.<br/><br/> Countries on a lower income levels have lower data quality in general, as less resources are available for compiling statistics. Historic estimates of GDP before 1950 are generally also more rough. <br/><br/> Data for child mortality is more reliable than GDP per capita, as the unit of comparison, dead children, is universally comparable across time and place. This is one of the reasons this indicator has become so useful to measure social progress. But the historic estimates of child mortality are still suffering from large uncertainties.<br/><br/> Learn more about the datasets and methods in this <a href='http://www.gapminder.org/news/data-sources-dont-panic-end-poverty' target='_blank'>blog post</a>",
  doubtDomain: [1800, 1950, 2015],
  doubtRange: [1.0, .3, .2]
});

BubbleMap.define('default_model', {
  state: {
    time: {
      start: "1800",
      end: "2015",
      value: "2015",
      step: 1,
      speed: 300
    },
    entities: {
      dim: "geo",
      opacitySelectDim: .3,
      opacityRegular: 1,
      show: {
        _defs_: {
          "geo.cat": ["country", "unstate"]
        }
      },
    },
    marker: {
      space: ["entities", "time"],
      label: {
        use: "property",
        which: "geo.name"
      },
      size: {
        use: "indicator",
        //which: "sg_population",//systema globalis
        which: "population_total",
        scaleType: "linear",
        allow: {
          scales: ["linear"]
        },
        extent: [0.04, 0.90]
      },
      lat: {
        use: "property",
        which: "geo.latitude"
      },
      lng: {
        use: "property",
        which: "geo.longitude"
      },
      color: {
        use: "property",
        which: "geo.world_4region",
        scaleType: "ordinal",
        allow: {
          names: ["!geo.name"]
        }
      }
    }
  },
  data: {
    reader: "csv",
    path: globals.ext_resources.host + globals.ext_resources.dataPath + "dont-panic-poverty.csv",
    splash: true
  },
  language: language,
  ui: {
    chart: {
      labels: {
        dragging: true
      }
    },
    presentation: false
  }
});

MountainChart.define('datawarning_content', {
  title: "Income data has large uncertainty!",
  body: "There are many different ways to estimate and compare income. Different methods are used in different countries and years. Unfortunately no data source exists that would enable comparisons across all countries, not even for one single year. Gapminder has managed to adjust the picture for some differences in the data, but there are still large issues in comparing individual countries. The precise shape of a country should be taken with a large grain of salt.<br/><br/> Gapminder strongly agrees with <a href='https://twitter.com/brankomilan' target='_blank'>Branko Milanovic</a> about the urgent need for a comparable global income survey, especially for the purpose of monitoring the UN poverty-goal.<br/><br/> We are constantly improving our datasets and methods. Please expect revision of this graph within the coming months. <br/><br/> Learn more about the datasets and methods in this <a href='http://www.gapminder.org/news/data-sources-dont-panic-end-poverty' target='_blank'>blog post</a>",
  doubtDomain: [1800, 1950, 2015],
  doubtRange: [1.0, .8, .6]
});

MountainChart.define('default_model', {
  state: {
    time: {
      start: 1800,
      end: 2015,
      value: 2015,
      step: 1,
      delay: 100,
      delayThresholdX2: 50,
      delayThresholdX4: 25
    },
    entities: {
      dim: "geo",
      opacitySelectDim: .3,
      opacityRegular: .7,
      show: {
        _defs_: {
          "geo": ["*"],
          "geo.cat": ["country", "unstate"]
        }
      }
    },
    entities_allpossible: {
      dim: "geo",
      show: {
        _defs_: {
          "geo": ["*"],
          "geo.cat": ["country", "unstate"]
        }
      }
    },
    marker_allpossible: {
      space: ["entities_allpossible"],
      label: {
        use: "property",
        which: "geo.name"
      }
    },
    marker: {
      space: ["entities", "time"],
      label: {
        use: "property",
        which: "geo.name"
      },
      axis_y: {
        use: "indicator",
        which: "sg_population",//systema globalis
        //which: "population_total",
        scaleType: 'linear'
      },
      axis_x: {
        use: "indicator",
        which: "sg_gdp_p_cap_const_ppp2011_dollar",//systema globalis
        //which: "income_per_person_gdppercapita_ppp_inflation_adjusted",
        scaleType: 'log',
        domainMin: .11, //0
        domainMax: 500, //100
        tailFatX: 1.85,
        tailCutX: .2,
        tailFade: .7,
        xScaleFactor: 1.039781626,
        xScaleShift: -1.127066411
      },
      axis_s: {
        use: "indicator",
        which: "sg_gini", //systema globalis
        //which: "inequality_index_gini",
        scaleType: 'linear'
      },
      color: {
        use: "property",
        which: "geo.world_4region",
        scaleType: "ordinal",
        allow: {
          names: ["!geo.name"]
        }
      },
      stack: {
        use: "constant",
        which: "all" // set a property of data or values "all" or "none"
      },
      group: {
        use: "property",
        which: "geo.world_4region", // set a property of data
        manualSorting: ["asia", "africa", "americas", "europe"],
        merge: false
      }
    }
  },
  language: language,
  data: {
    reader: "csv",
    path: globals.ext_resources.host + globals.ext_resources.dataPath + "dont-panic-poverty.csv",
    splash: true
  },
  ui: {
    chart: {
      manualSortingEnabled: true,
      yMaxMethod: "latest",
      probeX: 1.85,
      xLogStops: [1, 2, 5],
      xPoints: 50
    },
    presentation: false
  }
});


LineChart.define('default_model', {
  state: {
    time: {
      start: 1800,
      end: 2012,
      value: 2012,
      step: 1,
    },
    //entities we want to show
    entities: {
      dim: "geo",
      show: {
        _defs_: {
          "geo": ["usa", "swe", "chn"],
          "geo.cat": ["country", "unstate"]
        }
      }
    },
    //how we show it
    marker: {
      space: ["entities", "time"],
      label: {
        use: "property",
        which: "geo.name"
      },
      axis_y: {
        use: "indicator",
        which: "sg_gdp_p_cap_const_ppp2011_dollar",//systema globalis
        //which: "income_per_person_gdppercapita_ppp_inflation_adjusted",
        scaleType: "log"
      },
      axis_x: {
        use: "indicator",
        which: "time",
        scaleType: "time"
      },
      color: {
        use: "property",
        which: "geo.world_4region",
        allow: {
          scales: ["ordinal"],
          names: ["!geo.name"]
        }
      }
    }
  },

  data: {
    reader: "csv",
    path: globals.ext_resources.host + globals.ext_resources.dataPath + "dont-panic-poverty.csv",
    splash: false
  },
  language: language,
  ui: {
    chart: {
      labels: {
        min_number_of_entities_when_values_hide: 2 //values hide when showing 2 entities or more
      },
      whenHovering: {
        hideVerticalNow: false,
        showProjectionLineX: true,
        showProjectionLineY: true,
        higlightValueX: true,
        higlightValueY: true,
        showTooltip: false
      }
    },
    presentation: false
  }
});

BubbleChart.define('datawarning_content', {
  title: "",
  body: "Comparing the size of economy across countries and time is not trivial. The methods vary and the prices change. Gapminder has adjusted the picture for many such differences, but still we recommend you take these numbers with a large grain of salt.<br/><br/> Countries on a lower income levels have lower data quality in general, as less resources are available for compiling statistics. Historic estimates of GDP before 1950 are generally also more rough. <br/><br/> Data for child mortality is more reliable than GDP per capita, as the unit of comparison, dead children, is universally comparable across time and place. This is one of the reasons this indicator has become so useful to measure social progress. But the historic estimates of child mortality are still suffering from large uncertainties.<br/><br/> Learn more about the datasets and methods in this <a href='http://www.gapminder.org/news/data-sources-dont-panic-end-poverty' target='_blank'>blog post</a>",
  doubtDomain: [1800, 1950, 2015],
  doubtRange: [1.0, .3, .2]
});

BubbleChart.define('default_model', {

  state: {
    time: {
      start: "1800",
      end: "2015",
      value: "2015",
      step: 1
    },
    entities: {
      dim: "geo",
      show: {
        _defs_: {
          "geo.cat": ["country", "unstate"]
        }
      }
    },
    marker: {
      space: ["entities", "time"],
      type: "geometry",
      shape: "circle",
      label: {
        use: "property",
        which: "geo.name"
      },
      size_label: {
        use: "constant",
        which: "_default",
        scaleType: "ordinal",
        extent: [0, 0.33]
      },

      axis_y: {
        use: "indicator",
        //which: "sg_child_mortality_rate_per1000", //systema globalis
        which: "life_expectancy_years",
        scaleType: "linear",
        allow: {
          scales: ["linear", "log"]
        }
      },
      axis_x: {
        use: "indicator",
        //which: "sg_gdp_p_cap_const_ppp2011_dollar",//systema globalis
        which: "income_per_person_gdppercapita_ppp_inflation_adjusted", 
        scaleType: "log",
        allow: {
          scales: ["linear", "log"]
        }
      },
      color: {
        use: "property",
        which: "geo.world_4region",
        scaleType: "ordinal",
        allow: {
          names: ["!geo.name"]
        }
      },
      size: {
        use: "indicator",
        //which: "sg_population",//systema globalis
        which: "population_total", 
        scaleType: "linear",
        allow: {
          scales: ["linear"]
        },
        extent: [0.04, 0.90]
      }
    }
  },
  data: {
    reader: "csv",
    path: globals.ext_resources.host + globals.ext_resources.dataPath + "dont-panic-poverty.csv",
    splash: true
  },
  language: language,
  ui: {
    chart: {
      whenHovering: {
        showProjectionLineX: true,
        showProjectionLineY: true,
        higlightValueX: true,
        higlightValueY: true
      },
      labels: {
        dragging: true,
        removeLabelBox: false
      },
      trails: true,
      lockNonSelected: 0,
      adaptMinMaxZoom: false
    },
    presentation: false,
    cursorMode: 'arrow',
    noZoomOnScrolling: true
  }
});

PopByAge.define('default_model', {
  state: {
    time: {
      value: '2013',
      start: '1950',
      end: '2100'
    },
    entities: {
      dim: "geo",
      show: {
        _defs_: {
          "geo": ["usa"]
        }
      }
    },
    entities_age: {
      dim: "age",
      show: {
        _defs_: {
          "age": [
            [0, 95]
          ] //show 0 through 100
        }
      },
      grouping: 5
    },
    marker: {
      space: ["entities", "entities_age", "time"],
      label: {
        use: "indicator",
        which: "age"
      },
      label_name: {
        use: "property",
        which: "geo"
      },
      axis_y: {
        use: "indicator",
        which: "age",
        // domain Max should be set manually as age max from entites_age plus one grouping value (95 + 5 = 100)
        // that way the last age group fits in on the scale
        domainMax: 100,
        domainMin: 0
      },
      axis_x: {
        use: "indicator",
        which: "sg_population"
      },
      color: {
        use: "constant",
        which: "#ffb600",
        allow: {
          names: ["!geo.name"]
        }
      }
    }
  },
  data: {
    reader: "csv",
    path: globals.ext_resources.host + globals.ext_resources.dataPath + "{{geo}}.csv",
    splash: false
  },
  language: language,
  ui: {
    presentation: false
  }
});


DonutChart.define('default_model', {
  state: {
    // available time would have the range of 1990-2012 years (%Y), with the deafult position at 2000
    time: {
      start: "1990",
      end: "2012",
      value: "2000"
    },
    //Entities include all ("*") geo's of category "regions" -- equivalent to 'geo: ["asi", "ame", "eur", "afr"]'
    entities: {
      dim: "geo",
      show: {
        _defs_: {
          "geo": ["usa", "bra", "chn", "ind", "idn"],
          "geo.cat": ["country"]
        }
      }
    },
    //Markers correspond to visuals that we want to show. We have label, axis and color
    marker: {
      space: ["entities", "time"],
      label: {
        use: "property",
        which: "geo.name"
      },
      axis: {
        use: "indicator",
        which: "sg_population"
      },
      color: {
        use: "property",
        which: "geo.world_4region"
      }
    }
  },
  data: {
    reader: "csv",
    path: globals.ext_resources.host + globals.ext_resources.dataPath + "basic-indicators.csv",
    splash: false
  },
  language: language,
  ui: {
    presentation: false
  }

});


//Waffle Server Reader custom path
WaffleReader.define('basepath', globals.ext_resources.host + globals.ext_resources.dataPath);

//preloading mountain chart precomputed shapes
MCComponent.define("preload", function(done) {
  var shape_path = globals.ext_resources.shapePath ? globals.ext_resources.shapePath :
      globals.ext_resources.host + globals.ext_resources.preloadPath + "mc_precomputed_shapes.json";     

  d3.json(shape_path, function(error, json) {
    if(error) return console.warn("Failed loading json " + shape_path + ". " + error);
    MCComponent.define('precomputedShapes', json);
    done.resolve();
  });
});

//preloading bubble map country shapes
BMComponent.define("preload", function(done) {
  var shape_path = globals.ext_resources.shapePath ? globals.ext_resources.shapePath :
      globals.ext_resources.host + globals.ext_resources.preloadPath + "world-50m.json"; 
    
  d3.json(shape_path, function(error, json) {
    if(error) return console.warn("Failed loading json " + shape_path + ". " + error);
    BMComponent.define('world', json);
    done.resolve();
  });
});


//preloading metadata for all charts
Tool.define("preload", function(promise) {

  var _this = this;
  var metadata_path = globals.ext_resources.metadataPath ? globals.ext_resources.metadataPath :
      globals.ext_resources.host + globals.ext_resources.preloadPath + "metadata.json";    

  //TODO: concurrent
  //load language first
  this.preloadLanguage().then(function() {
    //then metadata
    d3.json(metadata_path, function(metadata) {

      globals.metadata = metadata;
        
      if(!globals.metadata.indicatorsDB["_default"]) globals.metadata.indicatorsDB["_default"] = {
          "use": "constant",
          "scales": ["ordinal"]
      }
      if(globals.metadata.indicatorsTree.children.map(function(m){return m.id}).indexOf("_default")===-1) {
          globals.metadata.indicatorsTree.children.push({"id": "_default"});
      }

      // TODO: REMOVE THIS HACK
      // We are currently saving metadata info to default state manually in order
      // to produce small URLs considering some of the info in metadata to be default
      // we need a consistent way to add metadata to Vizabi
      addMinMax("axis_x");
      addMinMax("axis_y");
      addMinMax("size");
      addMinMax("size_label");
      addPalettes("color");

      promise.resolve();

    });
  });

  // TODO: REMOVE THIS HACK (read above)
  function addPalettes(hook) {
    if(!_this.default_model.state || !_this.default_model.state.marker[hook]) {
      return;
    }
    var color = _this.default_model.state.marker[hook];
    var palette = ((globals.metadata.indicatorsDB[color.which]||{}).color||{}).palette||{};
    color.palette = utils.extend({}, color.palette, palette);
  }

  function addMinMax(hook) {
    if(!_this.default_model.state || !_this.default_model.state.marker[hook]) {
      return;
    }
    var axis = _this.default_model.state.marker[hook];
    if(axis.use === "indicator" && globals.metadata.indicatorsDB[axis.which] && globals.metadata.indicatorsDB[axis.which].domain) {
      var domain = globals.metadata.indicatorsDB[axis.which].domain;
      axis.domainMin = axis.domainMin || domain[0];
      axis.domainMax = axis.domainMax || domain[1];
      axis.zoomedMin = axis.zoomedMin || axis.domainMin || domain[0];
      axis.zoomedMax = axis.zoomedMax || axis.domainMax || domain[1];
    }
  }

});

Tool.define("preloadLanguage", function() {
  var _this = this;
  var promise = new Promise();

  var langModel = this.model.language;
  var translation_path = globals.ext_resources.translationPath ? globals.ext_resources.translationPath :
      globals.ext_resources.host + globals.ext_resources.preloadPath + "translation/" + langModel.id + ".json";

  if(langModel && !langModel.strings[langModel.id]) {
    d3.json(translation_path, function(langdata) {
      langModel.strings[langModel.id] = langdata;
      _this.model.language.strings.trigger("change");
      promise.resolve();
    });
  } else {
    this.model.language.strings.trigger("change");
    promise = promise.resolve();
  }

  return promise;

});

export default Vzb;
