function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  d3.json("/metadata/"+sample).then(function(data) {
    console.log(data);
    // Use d3 to select the panel with id of `#sample-metadata`
    let metaPanel = d3.select("#sample-metadata");
    // Use `.html("") to clear any existing metadata
    metaPanel.html("");
    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    for (const [key,value] of Object.entries(data)){
      //the key value pair for location and ethnicity 
      //are too long to fit in a single line.
        if (key === "WFRTO"){
          continue;
        }
        else if (key === "LOCATION" || key === "ETHNICITY"){
            metaPanel.append("p").text(`${key}:\n${value}`);
        }else{
            metaPanel.append("p").text(`${key}:${value}`)
        }
    }
    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
    console.log(data.WFRTO);
    // Enter a washfrequency between 0 and 9
    var washFrequency = data.WFRTO;

    // Trig to calc meter point
    var degrees = 180 - 180*washFrequency,
        radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);
    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);
    //generate colors
    var colors = [];
    var texts = [];
    for (let i=0; i<9; i++ ) {
        let color = 255/10*i
        colors.push(`rgba(${color}, 124, 0, .5)`);
        texts.push(`${8-i}-${9-i} times`)
    }
    colors.push("rgba(255, 255, 255, 0)");     

    var gaugeData = [
      { type: 'scatter',
        x: [0], 
        y:[0],
        marker: {size: 28, color:'850000'},
        showlegend: false,
        name: 'washFrequency',
        text: washFrequency,
        hoverinfo: 'text+name'},

      { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
        rotation: 90,
        text: texts,
        textinfo: 'text',
        textposition:'inside',
        marker: {colors: colors},
        labels: texts,
        hoverinfo: 'label',
        hole: .5,
        type: 'pie',
        showlegend: false
      }];

        var gaugeLayout = {
            shapes:[{
              type: 'path',
              path: path,
              fillcolor: '850000',
              line: {
                color: '850000'
              }
            }],
            title: 'Bellybutton washfrequencies',
            height: 700,
            width: 700,
            xaxis: {zeroline:false, showticklabels:false,
                      showgrid: false, range: [-1, 1]},
            yaxis: {zeroline:false, showticklabels:false,
                      showgrid: false, range: [-1, 1]}
          };

          Plotly.newPlot('gauge', gaugeData, gaugeLayout);
  },

  function(reason){
    console.log("did not receive data!");
    console.log(reason);
  });

  
}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  d3.json("/samples/"+sample).then(function(data){
    //console.log(data)
    sampleOtuIds = data.otu_ids;
    sampleOtuLables = data.otu_labels;
    sampleValues = data.sample_values;

    //console.log(sampleOtuIds);
    // @TODO: Build a Bubble Chart using the sample data
    var bubleTrace = {
      x: sampleOtuIds,
      y: sampleValues,
      text: sampleOtuLables,
      mode: 'markers',
      marker: {
        color: sampleOtuIds,
        size: sampleValues
      }
    };
    
    var bubleData = [bubleTrace];
    
    var bubbleLayout = {
      title: 'bubble chart',
      xaxis: {
        title: 'otu IDs',
      },
      yaxis: {
        title: 'sample size',
      },
      showlegend: false,
      height: 600,
      width: 1200
    };
    
    Plotly.newPlot('bubble', bubleData, bubbleLayout);
    // @TODO: Build a Pie Chart
    
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    
    //The data is already sorted in the backend by pandas
    pieOtuIds = data.otu_ids.slice(0,10);
    pieOtuLables = data.otu_labels.slice(0,10);
    pieValues = data.sample_values.slice(0,10);
    
    var pieTrace = {
      values: pieValues,
      labels: pieOtuIds,
      hovertext: pieOtuLables,
      type: 'pie',
    };
    
    var pieData = [pieTrace];
    
    var pieLayout = {
      title: 'pie chart',
      showlegend: true,
      height: 500,
      width: 500
    };
    
    Plotly.newPlot('pie', pieData, pieLayout);
  },
  //callback function to handle error in case we did not receive the json data.
  function(reason){
    console.log("did not receive data!");
    console.log(reason);
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];  
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
