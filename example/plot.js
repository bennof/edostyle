/* JS Plot helper
** Copyright (c) 2018-2021 Benjamin 'Benno' Falkner
**
** Permission is hereby granted, free of charge, to any person obtaining a copy
** of this software and associated documentation files (the "Software"), to deal
** in the Software without restriction, including without limitation the rights
** to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
** copies of the Software, and to permit persons to whom the Software is
** furnished to do so, subject to the following conditions:
**
** The above copyright notice and this permission notice shall be included in all
** copies or substantial portions of the Software.
**
** THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
** IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
** FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
** AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
** LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
** OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
** SOFTWARE.
*/


// Register Plugins
if(Chart){
    const xMarkerPlugin = {
        get_x_pos: function (chart, idx) {
            const meta = chart.getDatasetMeta(0); 
            const data = meta.data;
            return data[idx]._model.x;
        },
        draw_line: function (chart, marker) {
            const xoffset = this.get_x_pos(chart, marker.idx);
            const scale = chart.scales['y-axis-0'];
            const context = chart.chart.ctx;
      
            // render vertical line
            context.beginPath();
            context.strokeStyle = marker.color;
            context.lineWidth = 2.0;
            context.moveTo(xoffset, scale.top+20);
            context.lineTo(xoffset, scale.bottom);
            context.stroke();
      
            // write label
            context.fillStyle = marker.color;
            context.textAlign = 'center';
            context.fillText(marker.title, xoffset, scale.top+10);
        },
      
        afterDatasetsDraw: function (chart, easing) {
            if (chart.config.xMarker) {
                chart.config.xMarker.forEach( marker => this.draw_line(chart, marker));
            }
        }
    };
    
    const yMarkerPlugin = {
        draw_line: function (chart, marker) {
            const xscale = chart.scales['x-axis-0'];
            const yscale = chart.scales["y-axis-0"];
            const context = chart.chart.ctx;
      
            var y_value = yscale.getPixelForValue(marker.value);

            // render vertical line
            context.beginPath();
            context.strokeStyle = marker.color;
            context.moveTo(xscale.left,y_value);
            context.lineTo(xscale.right,y_value);
            context.stroke();
      
            // write label
            context.fillStyle = marker.color;
            context.textAlign = 'left';
            context.fillText(marker.title, xscale.left+5, y_value + 10);
        },
      
        afterDatasetsDraw: function (chart, easing) {
            if (chart.config.yMarker) {
                chart.config.yMarker.forEach( marker => this.draw_line(chart, marker));
            }
        }
    };

    Chart.plugins.register(xMarkerPlugin);
    Chart.plugins.register(yMarkerPlugin);
} else {
    console.error("Chart.js is missing, please load i.e.: https://cdn.jsdelivr.net/npm/chart.js");
}


class Plot {
    constructor (name, args){
        this.name = name;
        this.data = {
            labels: [],
            datasets: [],
        };
    
        this.xmarker = [];
        this.ymarker = [];
    
        this.args = args;
    }

    clear(){
        if(this.chart){
            this.chart.destroy();
        }
        this.data.datasets = [];
        this.xmarker = [];
        this.ymarker = [];
    }

    x(data){
        this.data.labels = data;
    }

    points(data, label, color = "#425672") {
        if(label == undefined) label = "Plot "+this.data.datasets.length;
        this.data.datasets.push({
            type: 'line',
            showLine: false,
            label: label,
            data: data,
            borderColor: color,
            fill: false,
        });
    }
    
    line(data, label, color = "#425672") {
        if(label == undefined) label = "Plot "+this.data.datasets.length;
        this.data.datasets.push({
            type: 'line',
            label: label,
            data: data,
            borderColor: color,
            fill: false,
        });
    };   
    
    fline(data, label, color="#425672", fcolor = "#c45850") {
        if(label == undefined) label = "Plot "+this.data.datasets.length;
        this.data.datasets.push({
            type: 'line',
            label: label,
            data: data,
            color: fcolor,
            borderColor: color,
            fill: true,
        });
    };
    
    bar(data, label, color="#425672", fcolor = "#c45850") {
        if(label == undefined) label = "Plot "+this.data.datasets.length;
        this.data.datasets.push({
            type: 'bar',
            label: label,
            data: data,
            color: fcolor,
            borderColor: color,
            fill: true,
        });
    };

    draw(target=null) {
        if (target==null){
            //console.log('Create Canvas');
            var elem = document.createElement("canvas");
            var cur = document.currentScript;
            cur.parentElement.insertBefore(elem,cur);
            target = elem;
        } else if (typeof target === 'string' || target instanceof String) {
            //console.log('Get Canvas');
            target = document.querySelector(target);
        }
        if(!(target instanceof HTMLCanvasElement)){
           console.error("ERROR: No Canvaselement");
           return null; 
        }
        this.target = target;
    
        var ctx = target.getContext('2d');
        this.chart = new Chart(ctx,{
            type: 'line',
            data: this.data,
            options: { 
                responsive: true,
                maintainAspectRatio: true
            },
            xMarker: this.xmarker,
            yMarker: this.ymarker
        });
        return this.chart;
    };
    
    x_marker(idx, title, color = "#c45850") {
        this.xmarker.push({ idx: idx, title: title, color: color });
    }
    
    y_marker(value, title, color = "#c45850") {
        this.ymarker.push({ value: value, title: title, color: color });
    }
}
