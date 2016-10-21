// global vars

var usingimages = true; // whether user has provided image urls
var timing = true; // whether user has turned timing on/off
var images = []; // user-provided image urls
var labels = []; // user-provided labels
var objects = []; // combined urls and labels for template
var combs = []; // the pairs of elements
var combno = -1; // which pair we are up to (-1 means form stage; -2 means check stage; -3 means instructions stage)

var compStartTime; // set at the start of each comparison
var timeDifferences = []; // list of all comparison times
var timeDifferencesPairs = []; // for calculating results


$(document).ready(function() {
    $('.confirmdiv').hide();
    $('.flashdiv').hide();
    
    $('html').keydown(function(ev) {
        if(combno == -2) { // at check stage, accept any key
            confirmCheck();
        } else if (combno == -3) { // at instructions stage
            kickOff();
        } else if(combno >= 0) {
            if(ev.which==83) { //S
                $("#S").effect("highlight", {color:"white"},300);
                imageClick(objects[combs[combno][0]].id,"S");
            } else if (ev.which==70) { //F
                $("#F").effect("highlight", {color:"white"},300);
                imageClick(objects[combs[combno][1]].id,"F");
            } else if (ev.which==74) { //J
                $("#J").effect("highlight", {color:"white"},300);
                imageClick(objects[combs[combno][1]].id,"J");                           
            } else if (ev.which==76) { //L
                $("#L").effect("highlight", {color:"white"},300);
                imageClick(objects[combs[combno][1]].id,"L");                          
            }
        }
    });//end keydown
}); //end ready

function submitForm1() {
    if ($('#images').val() == "") { // no urls
        usingimages = false;
        parseme = $('#labels').val();
        loopme = parseme.split(",");
        labels = [];
        for(i=0;i<loopme.length;i++) {
            labels.push(loopme[i]);
        }
    } else {
        usingimages = true;
        var parseme = $('#images').val();
        var loopme = parseme.split(",");
        images = [];
        for(i=0;i<loopme.length;i++) {
            images.push(loopme[i]);
        }                    
    }

    timing = $('#timing').is(':checked');
    
    $('.form1').hide();
    $('.formdiv').hide();
    makeObjects();
    combno = -2; // progress to check stage
    showCheck();
}

function makeObjects() { // take urls and/or labels to populate objects array
    if (usingimages) { //pair each image url and label in an object for template
        objects = [];
        for(i=0;i<images.length;i++) {
            var obj = new Object();
            obj.id = i;
            obj.image = images[i];
            //obj.label = labels[i];
            obj.score = 0;
            objects.push(obj);
        }
    } else {
        objects = [];
        for(i=0;i<labels.length;i++) {
            var obj = new Object();
            obj.id = i;
            obj.text = labels[i];
            obj.score = 0;
            objects.push(obj);
        }
    }
}

function showCheck() {
    if (usingimages) {
        $('#checkTemplate').tmpl(objects).appendTo(".comparediv");                   
    } else {
        $('#checkTextTemplate').tmpl(objects).appendTo(".comparediv");
    }

    $('.confirmdiv').show();
}

function confirmCheck() {
    $('.confirmdiv').html("Get ready and position your fingers over the <b>S, F, J</b> and <b>L</b> keys.<p>Press any key to start!");
    combno = -3;
}

function kickOff() {
    $('.comparediv').html("");
    $('.confirmdiv').hide();
    setUpComps();
    combno = 0; // into comparison stage
    $(".flashdiv").show();
    goCompare(combno);   
}

function setUpComps() {
    var integers = [];
    for(i=0;i<objects.length;i++) {
        // build a list of incrementing integers
        integers.push(i);
    }

    // set combs to a list of all ways to choose 2 from integers
    combs = getcombs(integers,2);

    // reorder combs
    shuffle(combs);

    // swap the order of every other pair
    for(i=0;i<combs.length;i+=2) {
        swap(combs[i]);
    }
}

function goCompare(combno) { // display the pair to be compared
    $('.comparediv').html(""); // clear div

    var pair = [objects[combs[combno][0]],objects[combs[combno][1]]];
    if(usingimages) {
        $('#compareTemplate').tmpl(pair).appendTo(".comparediv");
    } else {
        $('#compareTextTemplate').tmpl(pair).appendTo(".comparediv");
    }
    
    compStartTime = new Date(); // get current time
}

function imageClick(id,letter) { // called by keypresses too
    var compEndTime = new Date();
    var timeDifference = compEndTime.getTime() - compStartTime.getTime();

    timeDifferences.push(timeDifference); // build up list of all comparison times

    var pair = new Object();
    pair.time = timeDifference;
    pair.id = id;
    pair.letter = letter;
    timeDifferencesPairs.push(pair);
    
    combs[combno].push(id);
    combno++;
    if(combno<combs.length) { // compare next pair
        goCompare(combno); 
    } else { // reached the end
        combno = -1;
        calcResults();
    }
}

function calcResults() {
    console.log(timeDifferences.toString()); // for debugging
    
    // calculate mean and stdev of all comparison times
    var mean = ss.mean(timeDifferences);
    var std = ss.standardDeviation(timeDifferences);
    
    // score constants
    var bonusscore = 20; // given to quick times
    var score = 10; // normal times
    var slowscore = 5;  // slow times
    
    if(timing == false ) { // all times are given same score
        bonusscore = 10;
        slowscore = 10;
    }
    
    for(i=0;i<timeDifferences.length;i++) {
        if (timeDifferences[i] <= mean - std) { // a quick time
            objects[timeDifferencesPairs[i].id].score += bonusscore * letterToScore(timeDifferencesPairs[i].letter);
            console.log(timeDifferencesPairs[i].id.toString() + " bonus " + letterToScore(timeDifferencesPairs[i].letter));
        } else if (timeDifferences[i] >= mean + std) { // a slow time
            objects[timeDifferencesPairs[i].id].score += slowscore * letterToScore(timeDifferencesPairs[i].letter);
            console.log(timeDifferencesPairs[i].id.toString() + " slow " + letterToScore(timeDifferencesPairs[i].letter));
        } else { // an average time
            objects[timeDifferencesPairs[i].id].score += score * letterToScore(timeDifferencesPairs[i].letter);
            console.log(timeDifferencesPairs[i].id.toString() + " usual " + letterToScore(timeDifferencesPairs[i].letter));
        }
    }
                
    showResults();
}

function letterToScore(letter) {
    switch (letter) {
        case "S":
            return 2;
            break;
        case "F":
            return 1;
            break;
        case "J":
            return 1;
            break;
        case "L":
            return 2;
            break;
    }
}

function showResults() {
    $('.comparediv').html("").hide();
    $('.flashdiv').hide();
    
    var maxindex = timeDifferences.indexOf(ss.max(timeDifferences));
    max = new Object();
    
    if(usingimages) {
        max.image1 = images[combs[maxindex][0]];
        max.image2 = images[combs[maxindex][1]];
        max.image3 = images[combs[maxindex][2]];                   
    } else {
        max.text1 = labels[combs[maxindex][0]];
        max.text2 = labels[combs[maxindex][1]];
        max.text3 = labels[combs[maxindex][2]];
    }
    max.superl = "slowest";
    
    var minindex = timeDifferences.indexOf(ss.min(timeDifferences));
    min = new Object();
    if(usingimages) {
        min.image1 = images[combs[minindex][0]];
        min.image2 = images[combs[minindex][1]];
        min.image3 = images[combs[minindex][2]];                    
    } else {
        min.text1 = labels[combs[minindex][0]];
        min.text2 = labels[combs[minindex][1]];
        min.text3 = labels[combs[minindex][2]];                    
    }
    min.superl = "fastest";
    
    objects.sort(function(a,b) {
        return b.score - a.score;
    });
    
    var winner = [objects[0]];
    
    if(usingimages) {
        $('#resultTemplate').tmpl(winner).appendTo(".resultdiv");
        $('#result2Template').tmpl(min).appendTo(".resultdiv");
        $('#result2Template').tmpl(max).appendTo(".resultdiv");                      
    } else {
        $('#resultTextTemplate').tmpl(winner).appendTo(".resultdiv");
        $('#result2TextTemplate').tmpl(min).appendTo(".resultdiv");
        $('#result2TextTemplate').tmpl(max).appendTo(".resultdiv");
    }
    window.scrollTo(0,0);  

}