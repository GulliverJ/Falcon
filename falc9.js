// DON'T LOOK AT ANY OF THIS

var rocket = {
    transZ: 0,
    transX: 0,
    direction: 0,
    velocity: 0,
    com: 50,
    inertia: 1,
    mainFuel: 1000,
    coldGasFuel: 100,
    maxThrust: 100,
    mass: 4,
    lowestY: 0,
    altitude: 0,
  };

  var reset = false;

  var environment =
  {
    windSpeed: 0,
    windDir: 0,
    gravity: -9.81,
  };

  var rectangle, circle, stage, launcher;
  var prevVel = 0;
  var thrust = 0;
  var velocity = 0;
  var maxDv = 50;
  var grav = -50;   
  var inertia = 50;
  var groundHeight;
  var rotation = 0;
  var xVel = 0;
  var yVel = 0;
  var deltaX = 0;
  var deltaY = 0;
  var deltaT = 0;

  var dead = false;
  var landed = false;

  var dev = true;

  var coldGasLeft = false;
  var coldGasRight = false;
  var coldGasThrust = 15;
  var rotMomentum = 0;
  var airResistance = 0.998;
  var angle = 0;
  var legAngle = 0;

  var inContact = true;
  var maxImpact = 200;

  var left, right;
  left = 0;
  right = 2;

 $(document).ready(function($){

    var canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    document.addEventListener('keydown', keyboardIn, false);
    canvas.addEventListener("mousewheel", mouseWheel, false);
    canvas.addEventListener('mousedown', gasOn, false);
    canvas.addEventListener('mouseup', gasOff, false);


    stage = new createjs.Stage("canvas");

    groundHeight = canvas.height - 80
    rectangle = new createjs.Shape();
    rectangle.graphics.beginFill("#CCCCCC").drawRect(0,groundHeight,canvas.width,80);

    reset = false;

/*
    launcher.regX = 15;
    launcher.regY = 150;

    launcher.x = canvas.width/2;
    launcher.y = groundHeight - 50;*/

    resetRocket();

    stage.regX = canvas.width/2;
    stage.regY = canvas.height;

    stage.x = canvas.width/2;
    stage.y = canvas.height;

    rocket.lowestY = groundHeight;

    circle = new createjs.Shape();
    circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 00, 50);
    circle.x = 1000;
    circle.y = 100;
    //stage.addChild(rectangle);
    stage.addChild(rectangle, launcher);

  createjs.Ticker.setFPS(60);
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", tick);

  });

  function resetRocket() {
    
    stage.removeChild(launcher);
    launcher = new createjs.Shape();
    launcher.graphics.beginFill("#222").drawRect(0, 0, 30, 200);

    if(dev) {

        dead = false;
        landed = false;
        
        inContact = true;
        launcher.regX = 15;
        launcher.regY = 150;

        launcher.x = canvas.width/2;
        launcher.y = groundHeight - 50;

        xVel = 0;
        yVel = 0;

        rocket.lowestY = groundHeight;
        launcher.rotation = 0;
        thrust = 0;
        thrustX = 0;
        thrustY = 0;
        rotMomentum = 0;

    } else {
        inContact = false;

        launcher = new createjs.Shape();
        launcher.graphics.beginFill("#222").drawRect(0, 0, 30, 200);
        launcher.regX = 15;
        launcher.regY = 150;

        var midScreen = canvas.width/2;
        launcher.x = canvas.width/2 + Math.floor((Math.random() * midScreen) - (midScreen / 2));
        launcher.y = 150;

        dead = false;
        landed = false;
    
        yVel = Math.floor((Math.random() * 50) + 100) * -1;
        xVel = Math.floor((Math.random() * 200) - 100);

        rocket.lowestY = 200;
        launcher.rotation = Math.floor((Math.random() * 12) - 6);
        thrust = 0;
        thrustX = 0;
        thrustY = 0;
        rotMomentum = Math.floor((Math.random() * 20) - 10);
    }
    
    stage.addChild(launcher);
    stage.update();
  }

  function keyboardIn(event) {
    switch(event.keyCode){ 
      case 82:
        resetRocket();
        break;
      case 68:
        if(dev) {
            dev = false;
        } else {
            dev = true;
        }
        resetRocket();
        break;
    }
  }

  function ded() {
    while(true) {
        
    }
  }

  function gasOn(event) {
    if(event.button == 0) {
        coldGasLeft = true;
    }
    else if(event.button == 2) {
        coldGasRight = true;
    }
  }

  function gasOff(event) {
    if(event.button == 0) {
        coldGasLeft = false;
    }
    else if(event.button == 2) {
        coldGasRight = false;
    }
  }

  function mouseWheel(event) {

    console.log(event.wheelDelta);

    thrust += (event.wheelDelta / 10);
    
    if(thrust < 0) {
        thrust = 0;
    } else if (thrust > rocket.maxThrust) {
        thrust = rocket.maxThrust;
    }
  }

  function tick(event) {

    if(dead || landed) {
        return;
    }

    deltaT = event.delta / 1000;

    var thrustX = thrust * Math.sin(angle);
    var thrustY = (thrust * Math.cos(angle)) + (environment.gravity * rocket.mass);

    xVel += thrustX * deltaT;

    if(inContact) {
      xVel *= 0.9; // Simulated friction D: todo
      yVel = thrustY * deltaT;
      if(yVel < 0) {
        yVel = 0;
      }
    } else {
      
      yVel += thrustY * deltaT;
    }

    deltaX = xVel * deltaT;
    deltaY = yVel * deltaT;

    // Deals with rocking on the base
    // Yes, it's a variable called blah
    // I can only apologise ;_;
    var blah = 1;
    if(inContact) {
      if(angle < 0) {
        angle = angle + Math.atan( 15 / rocket.com );
      } else if(angle > 0) {
        angle = angle - Math.atan( 15 / rocket.com );
      }
    } else {
      if(thrustY > 0) {
        blah = (50 - thrustY) / 50; // Seems to work, for now
      } else {
        blah = 0;
      }
    }

    // This is dumb, ain't it.
    if(blah < 0) {
      blah = 0;
    }

    // What does this even mean?
    legAngle = angle;

    var spin = (Math.abs(environment.gravity * rocket.mass) * Math.sin(angle)) * blah;  

    rotMomentum += spin * deltaT;

    if(coldGasRight) {
      rotMomentum -= coldGasThrust * deltaT;
    }
    if(coldGasLeft) {
      rotMomentum += coldGasThrust * deltaT;
    }

    var tempRot = launcher.rotation + (rotMomentum * deltaT);

    angle = (tempRot * Math.PI) / 180;

    var tAngle = angle;

    if(!inContact) {

        if(Math.abs(tAngle) > Math.PI) {
          if(tAngle > 0) {
            tAngle = ((2 * Math.PI) - angle);
          } else {
            tAngle = ((2 * Math.PI) + angle);
          }
        }         

        if(Math.abs(tAngle) < Math.PI/2) {
            rocket.lowestY = launcher.y + ((15 * Math.sin(Math.abs(tAngle))) + (50 * Math.cos(Math.abs(tAngle))));       
        } else {

            tAngle = Math.abs(tAngle) - (Math.PI/2);
            rocket.lowestY = launcher.y + ((150 * Math.sin(Math.abs(tAngle))) + (15 * Math.cos(Math.abs(tAngle))));
        }
    }

    if(deltaY < 0) {
      if(inContact) {
        deltaY = 0;
      } else if (rocket.lowestY - deltaY >= groundHeight) {
        inContact = true;
        
        deltaY = rocket.lowestY - groundHeight;

        if (Math.abs(angle) < Math.PI/2) {
          if(angle < 0) {
            legAngle = angle + Math.atan( 15 / rocket.com );
          } else if(angle > 0) {
            legAngle = angle - Math.atan( 15 / rocket.com );
          }
          console.log(": " + deltaY + ", " + tAngle);
        }


        

      } 
    }

    if(inContact) {
      if(!dev && (Math.abs(angle) >= Math.PI/2 || yVel < -50)) {
        launcher.graphics.beginFill("#f00").drawRect(0, 0, 30, 200);
        stage.update(event);
        dead = true;
        return;
      }

      if(deltaY > 0) {
        
        inContact = false;
        setOrigin("COM");
      } else {

        if(Math.abs(tempRot) >= 90) {
          console.log("You're dead!");
          
        } else if(tempRot < 0) {
          setOrigin("LEFT");
        } else {
          setOrigin("RIGHT");
        }
      }

      if(!dev && Math.abs(angle) < 0.001 && Math.abs(rotMomentum) < 1 && Math.abs(yVel) < 10 && Math.abs(xVel) < 10) {
        launcher.graphics.beginFill("#0f0").drawRect(0, 0, 30, 200);
        stage.update(event);
        landed = true;
      }
    }

    // Applies rotation
    launcher.rotation = tempRot;
    rotMomentum *= airResistance;
    xVel *= airResistance;
    yVel *= airResistance;

    // Applies translation
    launcher.y -= deltaY;
    launcher.x += deltaX;

    stage.update(event);
}

function setOrigin(point) {
  var xdif;
  var ydif;
  var rebound = false;
  if(point == "RIGHT") {

      xdif = 30 - launcher.regX;
      ydif = 200 - launcher.regY;

      if(xdif == 30) {
        launcher.y += (xdif * Math.sin(angle));
        launcher.x += (xdif * Math.cos(angle));
        rotMomentum *= 0.6;
        if(Math.abs(rotMomentum) < 2) {
          rotMomentum = 0;
        }
      } else {
        launcher.y += (ydif*Math.cos(angle) + xdif * Math.sin(angle));
        launcher.x += (xdif*Math.cos(angle) - ydif * Math.sin(angle));
        if(xdif == 15) {
          rotMomentum += rocket.mass * xVel * 0.1;


          var spin = (Math.abs(environment.gravity * rocket.mass) * Math.sin(legAngle)) * -yVel;
          console.log(spin + ", " + legAngle + ", " + yVel);
          yVel = Math.abs(yVel) * (0.2 / rocket.mass); // TODO: rigidity value
          if(yVel > 5) {
            rebound = true;
            console.log("boing");
          }
          
      
          rotMomentum += spin * deltaT;

        }
      }

      launcher.regX = 30;
      launcher.regY = 200;

      if(rebound) {
        rebound = false;
        inContact = false; 
        setOrigin("COM"); 
      }

  } else if (point == "COM") {
      xdif = 15 - launcher.regX;
      ydif = launcher.regY - 150;

      if(xdif > 0) { //going from LEFT to COM
        launcher.y -= (ydif*Math.cos(angle) + xdif * Math.sin(-angle));
        launcher.x -= (ydif * Math.sin(-angle) - xdif*Math.cos(angle));
      } else {        // Going from RIGHT to COM
        launcher.y -= (ydif*Math.cos(angle) + xdif * Math.sin(-angle));
        launcher.x += (xdif*Math.cos(angle) - ydif * Math.sin(-angle));
      }


      launcher.regX = 15;  //Change in 15
      launcher.regY = 150; // Change in 50

  } else if (point == "LEFT") {
      xdif = launcher.regX;
      ydif = 200 - launcher.regY;

      if(xdif == 30) {
        launcher.y -= (xdif * Math.sin(angle));
        launcher.x -= (xdif * Math.cos(angle));
        rotMomentum *= 0.6;
        if(Math.abs(rotMomentum) < 2) {
          rotMomentum = 0;
        }
      } else {
        launcher.y += (ydif*Math.cos(-angle) + xdif * Math.sin(-angle));
        launcher.x -= (ydif * Math.sin(angle) + xdif*Math.cos(angle));
        if(xdif == 15) {
          rotMomentum += rocket.mass * xVel * 0.1;

          var spin = (Math.abs(environment.gravity * rocket.mass) * Math.sin(legAngle)) * -yVel;

          yVel = Math.abs(yVel) * (0.2 / rocket.mass); // TODO: rigidity value
          if(yVel > 5) {
            rebound = true;
            console.log("boing");
          }

          rotMomentum += spin * deltaT;


        }
      }

      launcher.regX = 0;  //Change in 15
      launcher.regY = 200; // Change in 50?

      // TODO
      if(rebound) {
        rebound = false;
        inContact = false; 
        setOrigin("COM"); 
      }
  }
}