
// math consts
const pi    = 3.14159;
const twopi = 6.28318;

// function short names
const cos = Math.cos;
const sin = Math.sin;
const exp = Math.exp;
const abs = Math.abs;
const min = Math.min;
const max = Math.max;

// lerp between 2 floats
const lerp = (a,b,x) => (b-a) * x + a;

// clamp between 2 floats
const clamp = (x,min,max) => x < min ? min : x > max ? max : x;

// step at d
const step = (x,d) => x < d ? 0 : 1;

// ramp starting at d
const ramp = (x,d) => (x-d) * step(x, d);


// polar to cartesian
const polar2xy = (r, theta) => [ r * Math.cos(theta), r * Math.sin(theta) ];

// line motion functions - taking as parameter the animation time t going from 0 to 1 and returning the startAngle and endAngle that the drawn line will be between. the 2 returned values are multiplied by maxTheta to control the range of angles in the animation
const noMotionFunc  = t => [ 0, 1 ];

const pingPongFunc  = t => [ 0, 
                             2*ramp(t,0) - 4*ramp(t,0.5) ];

const stepoverFunc  = t => [ clamp( 2 * t,       0, 1 ), 
                             clamp( 2 * (t-0.5), 0, 1 ) ];

const crossoverFunc = t => [ (t + step(t,0.5) - ramp(1-t,0.5)) * 2,
                             (t + step(t,0.5) + ramp(t,0.5)  ) * 2 ]

const motionFunctions = [noMotionFunc, pingPongFunc, stepoverFunc, crossoverFunc];

// data for all the presets
const presetData = [ { funcString: "sin( 3*( theta - twopi*t ) )", maxTheta: 3.14,  nPoints: 60,  duration: 2.5, framerate: 30, motionFunction: stepoverFunc  },
                     { funcString: "sin( 3*theta - 2*t*twopi )",   maxTheta: 3.14,  nPoints: 60,  duration: 2.5, framerate: 30, motionFunction: stepoverFunc  },
                     { funcString: "sin( theta/2 )",               maxTheta: 12.56, nPoints: 60,  duration: 7,   framerate: 30, motionFunction: crossoverFunc },
                     { funcString: "cos( 2*theta )",               maxTheta: 6.28,  nPoints: 80,  duration: 4,   framerate: 30, motionFunction: stepoverFunc  },
                     { funcString: "sin( (theta-pi)/5 )",          maxTheta: 15.71, nPoints: 80,  duration: 11,  framerate: 30, motionFunction: crossoverFunc },
                     { funcString: "sin(theta/7 - twopi * t)",     maxTheta: 22,    nPoints: 150, duration: 10,  framerate: 30, motionFunction: pingPongFunc  },
                     { funcString: "1",                            maxTheta: 6.28,  nPoints: 60,  duration: 4,   framerate: 30, motionFunction: crossoverFunc },
                     { funcString: "1.7 * cos( 5*theta + twopi*t ) * sin( 3*theta )", maxTheta: 6.28,  nPoints: 300,  duration: 4,   framerate: 30, motionFunction: noMotionFunc },
                     { funcString: "lerp( cos( clamp(t*1.06,0,1)*theta ), 1, 20*ramp(t*1.05,1) )", maxTheta: 31.4, nPoints: 300, duration: 10, framerate: 30, motionFunction: noMotionFunc },
                     { funcString: "0.5 + ( 5.6*cos( 2*theta ) + 20/exp( abs(theta - twopi*step(theta, 3*pi/2) - pi/2) ) ) * (t-step(t,0.278)/4)/exp(30*(t-step(t,0.278)/4)**2)", maxTheta: 6.28, nPoints: 80, duration: 1.6, framerate: 30, motionFunction: noMotionFunc } ];

// variables that control the animation
var dList          = [];
var maxTheta       = null;
var nPoints        = null;
var duration       = null;
var motionFunction = stepoverFunc;

var framerate = 30;
var sliderVars = [maxTheta, nPoints, duration, framerate];

// getting some of the elements
const presetSelect         = document.getElementById("preset-select");
const spinnerPath          = document.getElementById("spinner-path");
const spinnerAnimate       = document.getElementById("spinner-animate");
const spinnerPath2         = document.getElementById("spinner-path-2");
const spinnerAnimate2      = document.getElementById("spinner-animate-2");
const funcTextarea         = document.getElementById("func-textarea");
const compileButton        = document.getElementById("compile-button");
const showCompiledButton   = document.getElementById("show-compiled-button");
const compiledOutput       = document.getElementById("compiled-output");

// attaching functions to buttons and textarea resize
presetSelect.onchange      = handlePresetSelection;
compileButton.onclick      = compileAnimation;
showCompiledButton.onclick = showCompiledOutput;
funcTextarea.oninput       = () => { presetSelect.value = -1 };
new ResizeObserver(clearCompiledOutput).observe(funcTextarea);
window.addEventListener( "keydown", handleCtrlA );

// getting all the slider elements and linking them to handler function
const thetaSlider      = document.getElementById("theta-slider");
const pointsSlider     = document.getElementById("points-slider");
const durationSlider   = document.getElementById("duration-slider");
const framerateSlider  = document.getElementById("framerate-slider");
const sliders          = [thetaSlider, pointsSlider, durationSlider, framerateSlider];
sliders.forEach( slider => { slider.oninput = slidersUpdateNumbers; } );

// getting all the number inputs and connecting them to handler function
const thetaNumber      = document.getElementById("theta-number");
const pointsNumber     = document.getElementById("points-number");
const durationNumber   = document.getElementById("duration-number");
const framerateNumber  = document.getElementById("framerate-number");
const numbers          = [thetaNumber, pointsNumber, durationNumber, framerateNumber];
numbers.forEach( number => { number.oninput = numbersUpdateSliders; } );

// getting the line motion select
const lineMotionSelect = document.getElementById("line-motion-select");
lineMotionSelect.onchange = 
    () => { motionFunction = motionFunctions[ lineMotionSelect.value ]; };

function handlePresetSelection() {
    
    // get the preset data
    const preset = presetData[ presetSelect.value ];
    
    // set all our vars based on the preset
    sliderVars     = [preset.maxTheta, preset.nPoints, preset.duration, preset.framerate];
    motionFunction = preset.motionFunction;
    funcTextarea.value = `(theta, t) => ${preset.funcString}`;
    
    // update the sliders and numbers based on new vars
    sliderVarsUpdateNumbersAndSliders();
    compileAnimation();
}

function slidersUpdateNumbers() {
    
    // set all the number inputs and variables to the slider values
    sliders.forEach( (slider, i) => { numbers[i].value = slider.value; } );
    sliders.forEach( (slider, i) => { sliderVars[i]    = slider.value; } );
}

function numbersUpdateSliders() {
    
    // set all the sliders and variables to the values of the number inputs
    numbers.forEach( (number, i) => { sliders[i].value = number.value; } );
    numbers.forEach( (number, i) => { sliderVars[i]    = number.value; } );
}

function sliderVarsUpdateNumbersAndSliders() {
    
    // set sliders and numbers to match the sliderVars
    sliderVars.forEach( (sliderVar, i) => { sliders[i].value = sliderVar; } );
    sliderVars.forEach( (sliderVar, i) => { numbers[i].value = sliderVar; } );
    lineMotionSelect.value = motionFunctions.indexOf( motionFunction ); 
}

function handleCtrlA( event ) {
    
    // only proceed if ctrl/cmd is pressed
    if( !(event.ctrlKey || event.metaKey) ) return;
    
    // if a key is also pressed then click the compile button
    if( event.key == 'a' || event.key == 'A' ) {
        event.preventDefault();
        compileButton.click();
    }
}

function compileAnimation() {
    
    // clear dList from previous content and update vars to match the slider values
    dList = [];
    [maxTheta, nPoints, duration, framerate] = sliderVars;
    const nFrames = duration * framerate;
   
    // get the user's function from the textarea
    try {
        var func = eval( funcTextarea.value );
    } catch(err) {
        return;
    }
    
    // loop which calls the user's function for each point at each timestep
    for( var frame = 0; frame <= nFrames; ++frame ) {

        const points = [];
        const t = frame/nFrames;
        const [startAngle, endAngle] = motionFunction(t);

        for(var point = 0; point <= nPoints; ++point ) {
            
            const s     = point/nPoints;
            const theta = lerp(startAngle, endAngle, s) * maxTheta;

            const [x, y] = polar2xy( func(theta, t), theta );
            points.push( `${point==0 ? "M" : "L"}${x.toPrecision(3)},${y.toPrecision(3)}` );
        }

        dList.push( points.join(" ") );
    }
    
    // update the 2 spinners on the page with the animation
    spinnerPath.setAttribute( "d", dList[0] );
    spinnerAnimate.setAttribute( "values", dList.join("; ") );
    spinnerAnimate.setAttribute( "dur",    `${duration}s` );
    
    spinnerPath2.setAttribute( "d", dList[0] );
    spinnerAnimate2.setAttribute( "values", dList.join("; ") );
    spinnerAnimate2.setAttribute( "dur",    `${duration}s` );
}

function showCompiledOutput() {
    compiledOutput.innerHTML = dList.join("; ");
}

function clearCompiledOutput() {
    if(compiledOutput.innerHTML) compiledOutput.innerHTML = "";
}

// call these to initialise the sliders and spinners
slidersUpdateNumbers();
compileAnimation();