class View {
	// Render a view of the stage
	constructor(stage, stageElementID, viewW, viewH){
		this.stage = stage;
		this.stageElementID=stageElementID;
		this.canvas = document.getElementById(this.stageElementID);
		this.canvasWidth=this.canvas.width;
		this.canvasHeight=this.canvas.height;
		this.width=this.stage.width;
		this.height=this.stage.height;

		this.viewW=viewW;
		this.viewH=viewH;
		this.bulletShot = false;

        this.userImg = new Image();
        this.userImg.src = "./icons/user.png";
        this.killsIcon = new Image();
        this.killsIcon.src = "./icons/killsIcon.png";
	}
	view(){
		var context = this.canvas.getContext('2d');
		context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		// context.imageSmoothingEnabled = false;
		var gridW = Math.floor(this.canvasWidth/this.viewW);
		var gridH = Math.floor(this.canvasHeight/this.viewH);

		var halfW = Math.floor(this.viewW/2);
		var halfH = Math.floor(this.viewH/2);


		var playerX=this.stage.player.x;
        var playerY=this.stage.player.y;
        context.save();
        context.setTransform(1,0,0,1,0, 0);
        context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        context.translate( -(playerX-this.canvasWidth/2), -(playerY-this.canvasWidth/2 )); 



		context.drawImage(document.getElementById("grassTile"), 0, 0);
		
		for (var i=0; i<this.stage.map.length; i++){
			var map = this.stage.map[i];
			var x=map.x, y=map.y;
			context.drawImage(map.getImage(), x, y, 20, 20);
		}

        for (var i=0; i<this.stage.houses.length; i++){
            var frame1 = this.stage.houses[i][0];
            var frame2 = this.stage.houses[i][1];
            var x = frame1.x;
            var y = frame1.y;
            context.drawImage(frame1.getImage(), x, y+20, frame1.wid, frame1.len-40);
            context.drawImage(frame2.getImage(), x+115, y+20, frame2.wid, frame2.len-40);

            context.drawImage(document.getElementById("home"), x, y, 165.83, 250);
        }

		context.save();
        this.drawGroundItems(context);
        context.restore();
        var playerArray = [];
        var bushArray = [];
        var userWalls = [];
        if (this.stage.totalPlayers ==1 || this.stage.player.health <= 0){
            this.gameOver(context);
            context.restore();
            return;
        }
		for(var i = 0; i < this.stage.actors.length; i ++){
			var actor = this.stage.actors[i];
			var x=actor.x, y=actor.y;
			context.save();
            if (actor.draw() == false){
                userWalls.push(actor);
            }

            else if (actor.draw() == "map"){
                context.drawImage(actor.getImage(), x+this.stage.player.radius/2, y+stage.player.radius/2, actor.wid, actor.len);
            }

            else if (actor.draw() == "bush"){
                bushArray.push(actor);
                context.drawImage(actor.getImage(), x, y, 40, 48);
            }

            else if (actor.draw() == "portal"){
                context.drawImage(actor.getImage(), x, y, actor.wid, actor.len);
            }

            else if (actor.draw() == "storm"){
                context.beginPath();
                context.strokeStyle = "purple";
                context.globalAlpha = 0.2;

                context.arc(1000, 1000, actor.radius, 0, Math.PI*2);
                context.lineWidth = actor.thickness;
                if (context.lineWidth == actor.radius*2 ) {
                    // Do nothing
                }else{
                    actor.thickness = actor.thickness + 1;
                }
                
                context.stroke();
            }
			
			else if(actor.draw()=="bullet"){
                // Shooting a bullet
                // context.beginPath();
                // context.arc(actor.x, actor.y, actor.radius, 0, 2 * Math.PI, false); 
                // context.fill();
                var rad = actor.radius;
                context.drawImage(actor.getImage(), x-rad/2,y-rad/2,rad,rad);


            } else{
                // Draw the Player
                // Push to new array and draw after
                playerArray.push(actor);
            }
			context.restore();
		}




        var imageData = context.getImageData(this.stage.player.position.x -400, this.stage.player.position.y-400, 800, 800);

        if (document.getElementById("fps").checked){
            var fps = Math.round(requestAnimFrame() * 100) / 100;
            context.save();
            context.setTransform(1,0,0,1,0, 0);
            context.font = "15px Arial";
            context.fillText(fps + "fps", 10, 20);
            context.restore();
        }

        context.save();
        this.drawGroundItems(context);
        context.restore();
        
        for (var i =0 ; i < playerArray.length; i ++){
            var actor = playerArray[i];
            var x=actor.x, y=actor.y;
            context.save();
            this.draw_player(context, actor, actor.shot);
            actor.shot = false;
            context.restore();
        }
        for (var i = 0; i < bushArray.length; i++){
            var actor = bushArray[i];
            var x=actor.x, y=actor.y;
            context.save();
            context.drawImage(actor.getImage(), x, y, 40, 48);
            context.restore();
        }
        for (var i = 0; i < userWalls.length; i ++){
            var actor = userWalls[i];
            var x=actor.x, y=actor.y;
            context.save();
            context.fillStyle = "black";
            context.beginPath();
            context.arc(actor.x+actor.radius, actor.y+actor.radius, actor.radius, 0, 2 * Math.PI, false); 
            context.fill();

            context.restore();
        }
        this.draw_player_stats(context, this.stage.player);
        context.restore();
        context.save();
        this.draw_minimap(context,stage, imageData);
        context.restore();

	}

	drawGroundItems(context){
        for(var i = 0; i < this.stage.ground_items.length; i ++){
            var groundItem = this.stage.ground_items[i];
            var x =groundItem.x; var y =groundItem.y;
            var rad =15;
            if (groundItem instanceof Ammo){
                // context.beginPath();
                // context.arc(groundItem.x, groundItem.y, groundItem.radius/2, 0, 2 * Math.PI, false); 
                // context.fill();
                context.drawImage(groundItem.getImage(), x-rad/2,y-rad/2,rad,rad);
            }else if (groundItem instanceof Gun){
                context.drawImage(groundItem.getImage(), x-rad/2,y-rad/2,rad,rad);
            }
        }
    }
	
    draw_player(context, actor, shot){
        // Draws player based on if the player shot
        var x=actor.x, y=actor.y;
        // Rotate based on mouse
        var transX = x + actor.radius;
        var transY = y + actor.radius;
        context.translate(transX, transY);
        var lookx = actor.mouse.x;
        var looky = actor.mouse.y;
        context.rotate(Math.atan2(looky - this.canvasHeight/2-actor.radius, lookx - this.canvasWidth/2-actor.radius));
        var currentGun = actor.inventory[actor.invSelection];
        if (currentGun == null){
            this.draw_empty_hands(context, actor, false);
        }else{
            this.draw_shooting_hands(context, actor);
            currentGun.draw(actor, context,shot);
        }

        // Player Drawing
        context.beginPath();
        context.fillStyle = "#FCC777";
        context.arc(0, 0, actor.radius, 0, 2 * Math.PI, false); 
        context.fill();
        context.fillStyle = "#ffffff";
        context.arc(0, 0, actor.radius, 0, 2 * Math.PI, false); 
        context.stroke();
    }

    draw_empty_hands(context, actor, shoot){
        // left hand drawing
        var leftX = actor.radius*Math.sin(0.3*Math.PI) ;
        var leftY = actor.radius*Math.cos(0.3*Math.PI) ;
        context.beginPath();
        context.arc(leftX, leftY, actor.radius/2, 0 , 2*Math.PI, false);
        context.fillStyle = "#FCC777";
        context.fill();
        context.fillStyle = "#ffffff";
        context.stroke();
        // Right hand drawing
        var rightX = rightX = actor.radius*Math.sin(0.7*Math.PI);
        var rightY = actor.radius*Math.cos(0.7*Math.PI);
        context.beginPath();
        if (shoot){
            rightX = actor.radius*Math.sin(0.7*Math.PI) +7;
            context.arc(rightX-7, rightY, actor.radius/3, 0 , 2*Math.PI, false);
            context.fillStyle = "#FCC777";
            context.fill();
        }
        context.beginPath();
        context.arc(rightX, rightY, actor.radius/2, 0 , 2*Math.PI, false);
        context.fillStyle = "#FCC777";
        context.fill();
        context.fillStyle = "#ffffff";
        context.stroke();
    }

    draw_shooting_hands(context, actor){
        this.draw_empty_hands(context, actor, true);
    }

    draw_player_stats(context, actor){
        context.save();
        context.setTransform(1,0,0,1,0, 0);
        this.draw_inventory(context, actor);
        // Displaying health
        context.fillStyle = "rgba(0,0,0,0.2)";
        context.fillRect(300, 750, 200, 20);
        context.fillStyle = "rgba(143,235,102)";
        var healthWidth = actor.health*2;
        context.fillRect(300, 750, healthWidth, 20);
        context.fillStyle = "rgba(255,255,255,1)";
        context.font = "20px Arial";
        context.textAlign = "center";
        context.fillText(" "+ Math.round(actor.health) + " | 100", 400, 766);
        context.restore();
    }

    draw_inventory(context, actor){
        var initialX = 540;
        var initialY = 725;
        // Container for the guns
        context.fillStyle = "rgba(0,0,0)";
        context.font = "20px Arial";
        context.fillStyle = "rgba(0,0,0,0.1)";
        context.fillRect(initialX, initialY, 250, 50);
        context.strokeRect(initialX, initialY, 250, 50);
        // Drawing the lines between the inventory slots
        context.moveTo(initialX, initialY);
        context.lineTo(initialX, initialY+50);
        context.stroke();
        for (var i = 0 ; i < actor.inventory.length; i ++){
            context.save();
            context.moveTo(initialX + 50*(i+1), initialY);
            context.lineTo(initialX + 50*(i+1), initialY+50);
            context.stroke();
            var slotX = initialX + 50*i;
            var slotY = initialY;
            // Draw the item information here
            // Draw the inventory slot selected
            if (actor.invSelection == i){
                context.save();
                context.strokeStyle = "#FF0000";
                context.strokeRect(slotX-2, slotY-2, 54,54)
                context.restore();
                var slot = actor.inventory[actor.invSelection];
                if (slot instanceof Gun){
                    context.fillStyle = "rgba(0,0,0)";
                    context.textAlign = "right"; 
                    context.font = "25px Arial";
                    if (slot instanceof Pistol){
                        context.fillText(slot.currentAmmo + "/" + actor.lightammo, 420, 740); 
                        var lightAmmo = new LightAmmo(actor.stage, actor.x,actor.y);
                        context.drawImage(lightAmmo.getImage(),430,720, 20, 20);
                    }else if (slot instanceof AssaultRifle){
                        context.fillText(slot.currentAmmo + "/" + actor.medammo, 420, 740); 
                        var medammo = new MediumAmmo(actor.stage, actor.x,actor.y);
                        context.drawImage(medammo.getImage(),430,720, 20, 20);
                    }

                }
            } 
            context.fillStyle = "black";
            context.font = "20px Arial";
            context.strokeRect(slotX+15,slotY+55,20 ,20);
            context.textAlign = "center";
            context.fillText(i+1, slotX+25, slotY+72);
            context.restore();
            // Check if nothing in inventory slot
            if (actor.inventory[i] == null){continue;}
            actor.inventory[i].draw_inventory(context,slotX, slotY, 50,50, actor );
        }

        if (actor.buildMode){
            context.fillStyle = "rgba(0,0,0,0.7)";
            context.textAlign = "center";
            context.fillRect(initialX, initialY, 250, 50);
            context.fillStyle = "rgba(255,255,255, 1)";
            context.fillText("BUILD MODE",initialX+125, initialY + 35);
        }
    }

    //game over function
    gameOver(context){
        pauseGame();
        context.setTransform(1,0,0,1,0, 0);
        context.fillStyle = "rgba(0,0,0,0.6)";
        context.fillRect(0,0, 800,800);
        context.font = "60px Arial";
        context.fillStyle = "red";
        context.textAlign = "center";
        context.fillText("GAME OVER", 400,400);
        context.fillStyle = "black";
        context.font = "30px Arial";
        context.fillText("Click anywhere to restart!", 400,450);
        context.font = "20px Arial";
        if (this.stage.player == null){
            context.fillText("Players Left: " + (this.stage.totalPlayers) , 400,480);
        }else{
            context.fillText("Players Left: " + (this.stage.totalPlayers-1) , 400,480);
        }
        
        context.fillText("Kills this game : " + this.stage.curPlayerKills , 400,510);
    }

    //draws the minimap on the canvas
    draw_minimap(context,stage, imageData){
        context.save();
        context.setTransform(1,0,0,1,0, 0);
        // var img = new Image();
        // img.src = './icons/bullet.png';
        // context.fillStyle = "rgba(0,0,0,0.4)";
        // context.fillRect(1600,0, -400, 400);
        // context.putImageData(imageData, 600, 10, 0, 0, 200, 200);
        var newCanvas = $("<canvas>")
            .attr("width", 800)
            .attr("height", 800)[0];

        newCanvas.getContext("2d").putImageData(imageData, 0, 0);

        context.scale(0.5, 0.5);
        context.globalAlpha = 0.8;
        context.drawImage(newCanvas, 1150, 50, 400,400);
        // Draw the white dot
        context.fillStyle = "white";
        context.beginPath();
        context.arc(1150+200+4, 50+200, 8, 0, 2 * Math.PI, false); 
        context.fill();
        // Draw the boundary
        context.strokeRect(1150,50,400,400);
        context.save();
        context.setTransform(1,0,0,1,0, 0);
        
        context.drawImage(this.userImg, 600,230, 20,20);
        context.font = "20px Arial";
        context.fillText(this.stage.totalPlayers, 622, 249);
        context.drawImage(this.killsIcon, 650,231, 21,21);
        context.fillText(this.stage.curPlayerKills, 672, 249);
        context.restore();

        context.restore();
    }

}

