stage=null;
view = null;
interval=null;
timer=null;
var lastCalledTime;
var fps;

function setupGame(){
	stage=new Stage(document.getElementById('stage'));
	view = new View(stage,"stage",40,40);

    codeset = {
        87: false, // w
        65: false, // a
        83: false, // s
        68: false, // d
        69: false, // e
        82: false, // r
        66: false, // b
    };
    codesetNumbers = {
        49: false, // 1
        50: false, // 2
        51: false, // 3
        52: false, // 4
        53: false, // 5
    }

	// https://javascript.info/keyboard-events
	document.addEventListener("mousemove", mouseMove);
	document.addEventListener('keydown', keyDown);
	document.addEventListener('keyup', keyUp);

	var event = new Event('mousemove');
	mouseMove(event);
}
function startGame(){
	interval=setInterval(function(){ stage.step(); view.view(); },20);
}
function pauseGame(){
	clearInterval(interval);
	interval=null;
}

function mouseClick(event){
    if (interval==null){
        view = null;
        stage=new Stage(document.getElementById('stage'));
        view = new View(stage,"stage",40,40);
        startGame();
    }else{
        stage.player.shoot();
    }
}

 function move_cords(){
    if (codeset[66]){
				// b key was pressed, toggle BuildMode
        stage.player.toggleBuild();
    }
    if (codeset[69]){
        // Pick up item
        stage.player.pickup();
    }
    if (codeset[82]){
        stage.player.reload();
    }
    if (codeset[87]){stage.player.move(stage.player, 0, -1);}
    if (codeset[65]){stage.player.move(stage.player, -1, 0);}
    if (codeset[83]){stage.player.move(stage.player, 0, 1);}
    if (codeset[68]){stage.player.move(stage.player, 1, 0);}
    if (codeset[87] && codeset[65]){
        stage.player.move(stage.player, -1, -1);
    }
    if (codeset[87] && codeset[68]){
        stage.player.move(stage.player, 1, -1);
    }
    if (codeset[83] && codeset[65]){
        stage.player.move(stage.player, -1, 1);
    }
    if (codeset[83] && codeset[68]){
        stage.player.move(stage.player, 1, 1);
    }
    if (!(codeset[87] || codeset[65] || codeset[68] || codeset[83])){stage.player.move(stage.player, 0, 0);}
}

function select_number(){
    if (codesetNumbers[49]){stage.player.setPosition(0)}
    else if (codesetNumbers[50]){stage.player.setPosition(1)}
    else if (codesetNumbers[51]){stage.player.setPosition(2)}
    else if (codesetNumbers[52]){stage.player.setPosition(3)}
    else if (codesetNumbers[53]){stage.player.setPosition(4)}
}

// Handler for when key is released
function keyUp(event){
    if (event.keyCode in codeset) {
        codeset[event.keyCode] = false;
        move_cords();
    }
    if (event.keyCode in codesetNumbers) {
        codesetNumbers[event.keyCode] = false;
    }
}

// Handler for when key is pressed
function keyDown(event){
    if (sessionStorage.getItem("state") == "game"){
        if (event.keyCode in codeset){
            codeset[event.keyCode] = true;
            move_cords();
        }
        if (event.keyCode in codesetNumbers){
            codesetNumbers[event.keyCode] = true;
            select_number();
        }
    }
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}
function mouseMove(event){
	canvas = document.getElementById('stage');
	var pos = getMousePos(canvas, event);
	mx = pos.x;
	my = pos.y;
	stage.player.mouseMoved(mx, my);
}

// Handlers for when mouse is pressed down
$(document).mousedown(function(){
    if (sessionStorage.getItem("state") == "game"){
    timer=setInterval(function(){
        var item = stage.player.inventory[stage.player.invSelection]
        if ((item instanceof Gun && item.spray) || stage.player.buildMode){
            stage.player.shoot();
        }
   }, 100);

    return false;
}
});

// Handlers for when mouse is released
$(document).mouseup(function(){
    clearInterval(timer);
    return false;
});


$(function(){
	// Setup all events here and display the appropriate UI
	$("#stage").on('click',function(){
		mouseClick();
	});

});


//gets fps
function requestAnimFrame() {
  if(!lastCalledTime) {
     lastCalledTime = Date.now();
     fps = 0;
     return;
  }
  delta = (Date.now() - lastCalledTime)/1000;
  lastCalledTime = Date.now();
  fps = 1/delta;
  return fps;
}
