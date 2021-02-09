# equation-spinner

A web app to make little animations/loading spinners from polar curves. You just need to write your equation as a function of theta and time, set some settings like duration and framerate and then the animation is generated on a HTML svg element.

[link to the web app](https://codepen.io/oscarsaharoy/pen/MWbwqod?editors=1010)

Here's an animation that I made with this tool, the polar function is `r = (theta, t) => lerp( cos( clamp(t*1.06,0,1)*theta ), 1, 20*ramp(t*1.05,1) )`

![](https://github.com/OscarSaharoy/equation-spinner/blob/master/gif.gif)
