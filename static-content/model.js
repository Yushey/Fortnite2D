function randint(n){ return Math.round(Math.random()*n); }
function rand(n){ return Math.random()*n; }

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

//checks for circle and rectangle collisions
//referenced: https://stackoverflow.com/questions/21089959/detecting-collision-of-rectangle-with-circle
function circleCheck(circle, rect){
    var distX = Math.abs(circle.x - rect.x-rect.w/2);
    var distY = Math.abs(circle.y - rect.y-rect.h/2);

    if (distX > (rect.w/2 + circle.r)) { return false; }
    if (distY > (rect.h/2 + circle.r)) { return false; }

    if (distX <= (rect.w/2)) { return true; }
    if (distY <= (rect.h/2)) { return true; }

    var dx=distX-rect.w/2;
    var dy=distY-rect.h/2;
    return (dx*dx+dy*dy<=(circle.r*circle.r));
}

 randomPositons = [[100,100],[200,200],[300,300],[400,400],[500,500],[600,600],[700,700],[800,800],[900,900],[1000,1000],
    [1100,1100],[1300,1300],[1400,1400],[1500,1500],[1600,1600],[1700,1700], [100,200],[100,300],[100,400],[100,500],
    [100,600],[100,700],[100,800],[100,900],[100,1000],[100,1100],[100,1200],[100,1300],[100,1400],[100,1500],[100,1600],
    [100,1700],[100,1800],[100,1900]]

// Most functions are self explanatory

class Stage {
	constructor(canvas){
		this.canvas = canvas;
        this.obscors = [];
		this.actors=[];
        this.ground_items = [];
		this.map = [];
		this.player=null; // a special actor, the player
		// the logical width and height of the stage
		this.width=2000;
		this.height=2000;
		this.canvasW = canvas.width;
		this.canvasH = canvas.height;
		this.watercors = [];
		this.icecors = [];
        this.portalcors = [];
        this.houses = [];

        this.totalPlayers = 0;
        this.totalPlayers += 1;
        this.curPlayerKills = 0;

		// Add the player to the center of the stage
		var playerRadius = 10;
		// var actualPosition = new Pair(Math.floor(canvas.width/2)+playerRadius/2, Math.floor(canvas.height/2)+playerRadius/2);

		this.addPlayer(new Player(this, Math.floor(this.canvasW/2), Math.floor(this.canvasH/2), playerRadius));

        // Makes the outer boundaries, so that they player stays inside the play zone
        this.addActor(new Obstacle (this, 0, 0, 10, this.height-10));
        var location = "0,0,10,"+this.height;
        this.obscors.push(location);
        this.addActor(new Obstacle (this, this.width-20, 0, 10, this.height-10));
        var location = "0,"+ this.width-20+",10,"+this.height;
        this.obscors.push(location);
        this.addActor(new Obstacle (this, 0, 0, this.width-20, 10));
        var location = "0,0," +this.width+",10";
        this.obscors.push(location);
        this.addActor(new Obstacle (this, 0, this.height-20, this.width-20, 10));
        var location = "0,"+this.height-10+","+this.width+",10";
        this.obscors.push(location);

		this.generateDrops();
        this.generatePlayers(playerRadius);

		//making the map
		this.makeMap();

		this.addActor(new Storm(this));
	}

  // Generates the players, and places them randomly on the map
	generatePlayers(playerRadius){
        var total = 9;
        this.totalPlayers += total;
		while (total > 0){
            var x=Math.floor((Math.random()*(this.width-50) +10));
            var y=Math.floor((Math.random()*(this.height-50)+10));
            if(this.getActor(x,y)===null){
                this.addActor(new Player(this, x, y, playerRadius));
                total--;
            }
        }
    }

    //generates the guns and ammo on floor
	generateDrops(){
        var total = 100;
        while (total > 0){
            var x=Math.floor((Math.random()*(this.width-20) +10));
            var y=Math.floor((Math.random()*(this.height-20)+10));
            if(this.getGroundItem(x,y)===null){
                this.addGroundItem(new LightAmmo(this, x, y));
                total--;
            }
        }
        total = 100;
        while (total > 0){
            var x=Math.floor((Math.random()*(this.width-20) +10));
            var y=Math.floor((Math.random()*(this.height-20)+10));
            if(this.getGroundItem(x,y)===null){
                this.addGroundItem(new MediumAmmo(this, x, y));
                total--;
            }
        }
        total = 50;
        while (total > 0){
            var x=Math.floor((Math.random()*(this.width-20) +10));
            var y=Math.floor((Math.random()*(this.height-20)+10));
            if(this.getGroundItem(x,y)===null){
                this.addGroundItem(new Pistol(this, x, y));
                total--;
            }
        }
        total = 50;
        while (total > 0){
            var x=Math.floor((Math.random()*(this.width-20) +10));
            var y=Math.floor((Math.random()*(this.height-20)+10));
            if(this.getGroundItem(x,y)===null){
                this.addGroundItem(new AssaultRifle(this, x, y));
                total--;
            }
        }
    }

    //adds the item to the ground
    addGroundItem(item){
        this.ground_items.push(item);
    }


    getGroundItem(x, y){
        for(var i=0;i<this.ground_items.length;i++){
            if(this.ground_items[i].x==x && this.ground_items[i].y==y){
                return this.ground_items[i];
            }
        }
        return null;
    }

    removeGroundItem(item){
        var index=this.ground_items.indexOf(item);
        if(index!=-1){
            this.ground_items.splice(index,1);
        }
    }

    //spawn the map obstacles, floors, bushes and portals
	makeMap(){
		//add water areas
		for (var x = 1; x < 5; x++){
			for (var i = 20; i<this.width; i+=20){
				this.addMap(new Water(this, i, 20*x));
				this.addMap(new Water(this, i, (this.width)-(x*20)));
				this.watercors.push(i+","+((this.width)-(x*20)));
				this.watercors.push(i+","+(20*x));
			}
		}
		for (var x = 1; x < 5; x++){
			for (var i = 20; i<this.height; i+=20){
				this.addMap(new Water(this, 20*x, i));
				this.addMap(new Water(this, (this.height)-(20*x), i));
				this.watercors.push(((this.height)-(20*x))+","+i);
				this.watercors.push((20*x)+","+i);
			}
		}

		for (var x = 400; x < 660; x+=20){
			for (var y = 600; y< 960; y+=20){
				this.addMap(new Water (this, x, y));
				this.watercors.push(x+","+y);
			}
		}

		for (var x = 1500; x < 1820; x+=20){
			for (var y = 1200; y< 1440; y+=20){
				this.addMap(new Water (this, x, y));
				this.watercors.push(x+","+y);
			}
		}

		for (var x = 560; x < 770; x+=20){
			for (var y = 1100; y< 1240; y+=20){
				this.addMap(new Water (this, x, y));
				this.watercors.push(x+","+y);
			}
		}

		for (var x = 1200; x < 1650; x+=20){
			for (var y = 220; y< 340; y+=20){
				this.addMap(new Water (this, x, y));
				this.watercors.push(x+","+y);
			}
		}

		//add ice areas
		for (var x = 140; x < 250; x+=20){
			for (var y = 860; y< 1100; y+=20){
				this.addMap(new Ice (this, x, y));
				this.icecors.push(x+","+y);
			}
		}
		for (var x = 240; x < 600; x+=20){
			for (var y = 1400; y< 1800; y+=20){
				this.addMap(new Ice (this, x, y));
				this.icecors.push(x+","+y);
			}
		}
		for (var x = 1000; x < 1350; x+=20){
			for (var y = 800; y< 1100; y+=20){
				this.addMap(new Ice (this, x, y));
				this.icecors.push(x+","+y);
			}
		}

		//add obstacles
		this.addActor(new Obstacle (this, 160, 150, 580, 20));
        this.obscors.push("160,150,580,20");
		this.addActor(new Obstacle (this, 740, 150, 20, 250));
        this.obscors.push("740,150,20,250");
		this.addActor(new Obstacle (this, 800, 1200, 650, 20));
        this.obscors.push("800,1200,650,20");
		this.addActor(new Obstacle (this, 200, 450, 620, 20));
        this.obscors.push("200,450,620,20");
		this.addActor(new Obstacle (this, 1250, 200, 390,20));
        this.obscors.push("1250,200,390,20");
		this.addActor(new Obstacle (this, 180, 350, 20, 350));
        this.obscors.push("180,350,20,350");
		this.addActor(new Obstacle (this, 900, 1000, 20, 500));
        this.obscors.push("900,1000,20,500");
		this.addActor(new Obstacle (this, 1700, 700, 150, 250));
        this.obscors.push("1700,700,150,250");
		this.addActor(new Obstacle (this, 620, 1500, 110, 200));
        this.obscors.push("620,1500,110,200");
		this.addActor(new Obstacle (this, 1000, 1400, 20, 500));
        this.obscors.push("1000,1400,20,500");


        this.addHouses([new Frame1(this, 900, 200), new Frame2(this, 900, 200)]);
        this.obscors.push("850,150,300,500");
        this.addHouses([new Frame1(this, 1400, 600), new Frame2(this, 1400, 600)]);
        this.obscors.push("1350,550,300,500");
        this.addHouses([new Frame1(this, 300, 1000), new Frame2(this, 300, 1000)]);
        this.obscors.push("250,950,300,500");
        this.addHouses([new Frame1(this, 1600, 1600), new Frame2(this, 1600, 1600)]);
        this.obscors.push("1550,1550,300,500");
        this.addHouses([new Frame1(this, 1300, 1600), new Frame2(this, 1300, 1600)]);
        this.obscors.push("1250,1550,300,500");


        this.spawnPortals(8);


        //add bushes - also checks if water or ice is that position
        var numbushes = 25;
        for (var i = 0; i < numbushes; i++){
            var x = (Math.round(Math.random()*40)+5)*40;
            var y = (Math.round(Math.random()*40)+5)*40;

            if (!(this.watercors.includes(x+","+y) || this.icecors.includes(x+","+y))){
                var b = new Bush(this, x, y);
                if (this.obsCollision(b) == false){
                    this.addActor(b);
                }
            }
        }
	}

    spawnPortals(n){
        if (n == 0){
            return;
        }
        var x = (Math.round(Math.random()*40)+5)*40;
        var y = (Math.round(Math.random()*40)+5)*40;

        if (!(this.watercors.includes(x+","+y) || this.icecors.includes(x+","+y))){
            var p = new Portal(this, x, y);
            if (this.obsCollision(p) == false){
                this.addActor(p);
                this.portalcors.push(x+","+y);
                this.spawnPortals(n-1);
            }
            else{
                this.spawnPortals(n);
            }
        } else{
            this.spawnPortals(n);
        }
    }

	addMap(map){
		this.map.push(map);
	}

    addHouses(house){
        this.houses.push(house);
    }

	addPlayer(player){
		this.addActor(player);
		this.player=player;
	}

    obsCollision(p){
        var check = false;
        var obslist = this.obscors;
        for (var i = 0; i<obslist.length; i++){
            var obstacle = obslist[i].split(",");
            var ox = parseInt(obstacle[0])-40;
            var oy = parseInt(obstacle[1])-40;
            var ow = parseInt(obstacle[2])+80;
            var ol = parseInt(obstacle[3])+80;

            var px = p.x;
            var py = p.y;
            var pw = p.wid;
            var pl = p.len;

            check = this.rectToRectColl(ox, oy, ow, ol, px, py, pw, pl);
            if (check == true){
                break;
            }
        }
        return check;
    }

    rectToRectColl(r1x, r1y, r1w, r1l, r2x, r2y, r2w, r2l){
        if (r1x < r2x + r2w && r2x < r1x + r1w && r1y < r2y + r2l)
            return r2y < r1y + r1l;
        else
            return false;
    }

	removePlayer(){
		this.removeActor(this.player);
		this.player=null;
	}

	addActor(actor){
		this.actors.push(actor);
	}

	removeActor(actor){
		var index=this.actors.indexOf(actor);
		if(index!=-1){
			this.actors.splice(index,1);
		}
	}


	step(){
		for(var i=0;i<this.actors.length;i++){
			this.actors[i].step();
		}
	}
	getActor(x, y){
		for(var i=0;i<this.actors.length;i++){
			if(this.actors[i].x==x && this.actors[i].y==y){
				return this.actors[i];
			}
		}
		return null;
	}
}

class Pair {
	constructor(x,y){
		this.x=x; this.y=y;
	}

	toString(){
		return "("+this.x+","+this.y+")";
	}

	normalize(){
		var magnitude=Math.sqrt(this.x*this.x+this.y*this.y);
		this.x=this.x/magnitude;
		this.y=this.y/magnitude;
	}
}



class Bullet{
	constructor(player, stage, position, velocity, colour, radius, duration, gun){
        this.stage = stage;
        this.position=position;
        this.image = document.getElementById("bullet");
        this.intPosition(); // this.x, this.y are int version of this.position
        this.duration = duration;
        this.velocity=velocity;
        this.colour = colour;
        this.radius = radius;
        this.player = player;
        this.counter = 100;
        this.gun = gun;
        for (var i = 0 ; i < this.gun.shootingPoint.x/4; i ++){
            this.step();
        }
    }

    headTo(position){
        this.velocity.x=(position.x-this.position.x);
        this.velocity.y=(position.y-this.position.y);
        this.velocity.normalize();
    }

    toString(){
        return this.position.toString() + " " + this.velocity.toString();
    }

    step(){
        this.duration=this.duration-1;
        var movex = this.position.x+this.velocity.x;
        var movey = this.position.y+this.velocity.y;

        for (var i = 0; i < this.stage.actors.length; i++){
            var actor = this.stage.actors[i];
            if(actor instanceof Obstacle){
                var circle = {x: movex, y: movey, r:this.radius};
                var rect = {x: actor.x, y: actor.y, w: actor.wid, h: actor.len};
                if (circleCheck(circle, rect) == true){
                    this.stage.removeActor(this);
                    return false;
                }
            }
            if ((actor instanceof Player && actor != this.player) || actor instanceof Wall){
                var disX = actor.x+actor.radius -movex;
                var disY = actor.y+actor.radius - movey;
                var dis = disX*disX + disY *disY;
                var inCircle = Math.sqrt(dis);
                if (inCircle < actor.radius + this.radius){
                    this.stage.removeActor(this);
                    if (actor instanceof Wall){
                        // If bullet hits a the boundry wall, do nothing
                        actor.doDmg(this.gun.damage);
                    }else{
                        actor.removeHealth(this.gun.damage, this.player);
                    }
                    return false;
                }
            }
        }

        this.position.x=movex;
        this.position.y=movey;

        if (this.duration < 0){
            this.stage.removeActor(this);
        }

        this.intPosition();
    }

    intPosition(){
        this.x =this.position.x;
        this.y = this.position.y;
    }

    draw(){
        return "bullet";
    }

    getImage(){
        var img = new Image();
        img.src = './icons/bullet.png';
        return img;
    }
}

class Actor {
	constructor(stage,x,y,imageID){
		this.x=x;
		this.y=y;
		this.stage=stage;
		this.image=document.getElementById(imageID);
		this.position = new Pair(x,y);
	}
	step(){
		return;
	}

	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}

	move(other, dx, dy){
		return false;
	}
	getImage(){ return this.image; }
}

class Player extends Actor {
	constructor(stage, x, y, radius){
        super(stage,x,y,'playerImage');
        this.radius = radius;
        var red=0, green=0, blue=0;
        this.health = 100;
        this.mouse = new Pair(x,y);
        var alpha = 10;
        var colour= 'rgba('+red+','+green+','+blue+','+alpha+')';
        this.colour = colour;
        this.speed = new Pair(0,0);
        this.shot = false;
        this.numKills = getKillCount();
        this.inventory = [null, null, null, null, null];
        this.invSelection = 0;
        this.gun = this.inventory[this.invSelection];
        this.lightammo = 0;
        this.medammo =0; // can add more after this
        this.aiMove = new Pair(0,0);
        this.aiMoveUnits = 0;
        this.buildMode = false;
        super.intPosition();
        var randomPos = randomPositons[Math.floor(Math.random()*randomPositons.length)];
        this.x = randomPos[0];
        this.y = randomPos[1];

        this.smart =false;
        if (randint(10) %2 == 0){
            this.smart = true;
        }
    }

    removeHealth(dmg, player){
        this.health -= dmg;
        if (this.health < 0){
            if (player == this.stage.player){
                var total = this.stage.player.numKills +1;
                updateKillCounter(total);
                this.stage.curPlayerKills += 1;
                this.stage.player.numKills = total;
            }
            this.stage.totalPlayers -= 1;

            this.stage.removeActor(this);

        }
    }

    reload(){
        var gun = this.inventory[this.invSelection];
        if (gun instanceof Gun){
            gun.reload();
        }
    }

    pickup(){
        for (var i = 0; i < this.stage.ground_items.length; i ++){
            var item = this.stage.ground_items[i];
            var disX = item.x -this.x;
            var disY = item.y - this.y;
            var dis = disX*disX + disY *disY;
            var inCircle = Math.sqrt(dis);
            if (inCircle < this.radius + item.radius){
                this.addToInv(item);
                this.stage.removeGroundItem(item);
            }
        }
    }
    // Adds item to inventory
 	addToInv(item){
        if (item instanceof Ammo){
            if (item instanceof LightAmmo){
                this.lightammo +=10;
            }else{
                this.medammo += 20;
            }

            return;
        }else if (item instanceof Gun){
            for (var i = 0; i < this.inventory.length; i++){
                if (this.inventory[i] == null){
                    this.inventory[i] = item;
                    return;
                }
            }
            this.inventory[this.invSelection] = item;
        }
    }

    toggleBuild(){
        if (this.buildMode){
            this.buildMode = false;
        }else{
            this.buildMode = true;
        }
    }
    setPosition(num){
        if (this.buildMode){
            this.buildMode = false;
        }
        this.invSelection = num;
    }

	getShootingImage(){
		return document.getElementById("gunShoot");
	}
    // AI moves a random units
    randomMove(){
        if (this.aiMoveUnits < 0){
            this.aiMoveUnits = getRandomArbitrary(0, 90);
            var newx = getRandomArbitrary(-1,1);
            var newy = getRandomArbitrary(-1,1);
            this.aiMove = new Pair(newx, newy);
        }
        this.move(this, this.aiMove.x, this.aiMove.y);
        this.aiMoveUnits -=1;
        if (this.smart){
            var difX = this.stage.player.x - this.x;
            var difY = this.stage.player.y - this.y;
            this.position = new Pair(difX, difY);
            this.mouse = new Pair(difX + 400, difY + 400);
        }
    }

    step(){

        if (this.buildMode){
            this.gun = null;
        }else{
            this.gun = this.inventory[this.invSelection];
        }
        // AI for moving the player
        if (this.stage.player != this){
            this.randomMove();
            this.inventory = [new Pistol(stage, this.x,this.y), null, null, null, null];
            this.lightammo = 50;
            this.medammo =50;
            var randNumber = randint(1000);
            if (randNumber%90 == 0){
                this.aiShoot();
            }
        }

        var newx=this.x+this.speed.x;
        var newy=this.y+this.speed.y;

        //check is the player is against a house wall.
        for (var i = 0; i< this.stage.houses.length; i++){
            var frame1 = this.stage.houses[i][0];
            var frame2 = this.stage.houses[i][1];

            var circle = {x: newx, y: newy, r:this.radius};
            var rect = {x: frame1.x-5, y: frame1.y+15, w: frame1.wid-45, h: frame1.len-50};
            if (circleCheck(circle, rect) == true){
                return false;
            }

            var rect = {x: frame1.x, y: frame1.y+15, w:frame1.wid-12, h: 8};
            if (circleCheck(circle, rect) == true){
                return false;
            }

            var rect = {x: frame1.x, y: frame1.y+210, w:frame1.wid-12, h: 8};
            if (circleCheck(circle, rect) == true){
                return false;
            }

            var rect = {x: frame2.x+145, y: frame2.y+15, w: frame2.wid-45, h: frame2.len-50};
            if (circleCheck(circle, rect) == true){
                return false;
            }

            var rect = {x: frame2.x+103, y: frame1.y+15, w:frame2.wid-3, h: 8};
            if (circleCheck(circle, rect) == true){
                return false;
            }

            var rect = {x: frame2.x+103, y: frame1.y+210, w:frame2.wid-12, h: 8};
            if (circleCheck(circle, rect) == true){
                return false;
            }
        }

        for (var i = 0; i < this.stage.actors.length; i ++){
            var actor = this.stage.actors[i];

            //check if player is in the storm
            if (actor instanceof Storm){
            	if (! this.playerStormCollision(newx, newy, actor) == true){
            		this.removeHealth(0.1, false);
            	}
            }

            //check if player is walking through a transporter pod
            if (actor instanceof Portal){
                    var circle = {x: newx, y: newy, r:this.radius};
                    var rect = {x: actor.x, y: actor.y, w: actor.wid, h: actor.len};
                    if (circleCheck(circle, rect) == true){
                        var newxy = this.takePortal(actor, newx, newy);
                        newx = newxy[0];
                        newy = newxy[1];
                    }
            }

            // Cannot pass through Wall
            // Add other obstancles here
            if (actor instanceof Wall){
                var disX = actor.x -newx;
                var disY = actor.y - newy;
                var dis = disX*disX + disY *disY;
                var inCircle = Math.sqrt(dis);
                if (inCircle < actor.radius + this.stage.player.radius){
                    return false;
                }
            }

            if (actor instanceof Obstacle){
                var circle = {x: newx, y: newy, r:this.radius};
                var rect = {x: actor.x, y: actor.y, w: actor.wid-this.radius, h: actor.len-this.radius};
                if (circleCheck(circle, rect) == true){
                    return false;
                }
            }
        }
        this.x=newx;
        this.y=newy;
        return true;
    }

    takePortal(actor, newx, newy){
        var randomportal = Math.round(Math.random() * (this.stage.portalcors.length-1));
        var portal = this.stage.portalcors[randomportal].split(",");
        if (parseInt(portal[0]) == actor.x && parseInt(portal[1]) == actor.y){
            return this.takePortal(actor, newx, newy);
        }
        else{
            newx = parseInt(portal[0])+40;
            newy = parseInt(portal[1])+40;
            return [newx, newy];
        }
    }

	move(other, dx, dy){
		var speedFactor = this.checkFloor();
		other.speed.x = dx*speedFactor;
		other.speed.y = dy*speedFactor;
	}

	playerStormCollision(x, y, storm){
		var prad = this.radius;
		var px = x;
		var py = y;

		var srad = storm.radius-storm.thickness/2;
		var sx = 1000;
		var sy = 1000;

		var a;
		var x;
		var y;

		a = prad + srad;
		x = px - sx;
		y = py - sy;

		if (a > Math.sqrt((x * x) + (y * y))) {
			return true;
		} else {
			return false;
		}
	}

    checkFloor(){
        for (var i = 0; i<this.stage.watercors.length;i++){
            var temp = this.stage.watercors[i].split(",");
            var circle = {x:this.x, y:this.y, r: this.radius};
            var rect = {x:parseInt(temp[0]), y: parseInt(temp[1]), w:20-this.radius, h:20-this.radius};
            var output = circleCheck(circle, rect);
            if (output == true){
                return 2;
            }
        }

        for (var i = 0; i<this.stage.icecors.length;i++){
            var temp = this.stage.icecors[i].split(",");
            var circle = {x:this.x, y:this.y, r: this.radius};
            var rect = {x:parseInt(temp[0]), y: parseInt(temp[1]), w:20-this.radius, h:20-this.radius};
            var output = circleCheck(circle, rect);
            if (output == true){
                return 8;
            }
        }
        return 5;
    }
    // Logic for the AI shooting
    aiShoot(){
        if (this.gun != null){
            if (this.gun.shoot()){
                // gun was shot
                var x = this.mouse.x-400+this.position.x-this.radius;
                var y = this.mouse.y-400+this.position.y - this.radius;
                var length = Math.sqrt(x*x+y*y);
                var goX = x/length;
                var goY= y/length;
                var multiFact = this.gun.shootingSpeed;
                var velocity = new Pair(goX*multiFact, goY*multiFact);
                var radius = this.gun.bulletRadius;
                var colour= 'rgba(255,0,0,0)';
                var actual = new Pair(this.x+this.radius, this.y+this.radius);
                this.shot = true;
                var b = new Bullet(this, this.stage, actual, velocity, colour, radius, this.gun.maxDistance, this.gun);
                this.stage.addActor(b);
            }
        }
    }

	draw(){
		return true;
	}
  // Update the mouse variable everytime the the user moves the mouse
	mouseMoved(newX, newY){
		this.mouse = new Pair(newX, newY);
	}

    shoot(){
        if (this.gun != null){
            if (this.gun.shoot()){
                // gun was shot
                var x = this.mouse.x-this.position.x-this.radius;
                var y = this.mouse.y-this.position.y - this.radius;
                var length = Math.sqrt(x*x+y*y);
                var goX = x/length;
                var goY= y/length;
                var multiFact = this.gun.shootingSpeed;
                var velocity = new Pair(goX*multiFact, goY*multiFact);
                var radius = this.gun.bulletRadius;
                var colour= 'rgba(255,0,0,0)';
                var actual = new Pair(this.x+this.radius, this.y+this.radius);
                this.shot = true;
                var b = new Bullet(this, this.stage, actual, velocity, colour, radius, this.gun.maxDistance, this.gun);
                this.stage.addActor(b);
            }
        }else if(this.buildMode){
            // The player wants to build
            var x = this.mouse.x-this.position.x-this.radius;
            var y = this.mouse.y-this.position.y - this.radius;
            var length = Math.sqrt(x*x+y*y);
            var goX = x/length;
            var goY= y/length;
            var multiFact = 40;
            var velocity = new Pair(goX*multiFact, goY*multiFact);
            var wall = new Wall(stage, this.x + velocity.x, this.y +velocity.y);
            this.stage.addActor(wall);
        }
    }
}

// Class for the walls built by players
class Wall extends Actor {
    constructor(stage, x, y){
        super(stage,x,y,'wallImage');
        this.radius = 6;
        this.health = 30;
    }
    draw(){
        return false;
    }
    doDmg(dmg){
        this.health -= dmg;
        if (this.health < 0){
            this.stage.removeActor(this);
        }
    }
}

class Obstacle extends Actor {
	constructor(stage, x, y, w, l){
		super(stage,x,y,'stoneTile');
		this.wid = w;
		this.len = l;
	}
	draw(){
		return "map";
	}
}

class Water extends Actor {
	constructor(stage, x, y){
		super(stage,x,y,'Water');
	}
}

class Ice extends Actor {
	constructor(stage, x, y){
		super(stage,x,y,'Ice');
	}
}

class Bush extends Actor {
	constructor(stage, x, y){
		super(stage,x,y,'Bush');
        this.wid = 40;
        this.len = 48;
	}
	draw(){
		return "bush";
	}
}

class Ammo {
    constructor(stage,x,y, type, radius){
        this.stage = stage;
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = radius;
        this.img = document.getElementById(type);
    }
    getImage(){
        return this.img;
    }
}
class LightAmmo extends Ammo{
    constructor(stage, x,y){
        super(stage,x,y,"lightammo", 20);
    }
}

class MediumAmmo extends Ammo{
    constructor(stage, x,y){
        super (stage,x,y,"medammo", 20);
    }
}
class Gun{
    constructor(stage, name, damage, maxAmmo, currentAmmo, maxDistance, shootingSpeed, spray,
        bulletRadius, x,y, radius){
        this.stage = stage;
        this.damage = damage;
        this.maxAmmo = maxAmmo;
        this.currentAmmo = currentAmmo;
        this.maxDistance = maxDistance;
        this.shootingSpeed = shootingSpeed;
        this.spray = spray;
        this.bulletRadius = bulletRadius;
        this.shootingPoint = null;
        this.x = x;
        this.y =y;
        this.radius = radius;
        this.img = document.getElementById(name);
    }

    getImage(){
        return this.img;
    }

    shoot(){
        if (this.currentAmmo <= 0){
            this.reload();
            return false;
        }else{
            this.currentAmmo -= 1;
            if (this.currentAmmo <= 0){
                this.reload();
            }
        }
        return true;
    }
}

class AssaultRifle extends Gun{
    // stage, name, damage, maxAmmo, currentAmmo, maxDistance, shootingSpeed, spray,
    // bulletRadius, x,y, radius
    constructor(stage,x,y, totalAmmo){
        super(stage, "ar", 30, 30, 30, 80, 12, true, 5, x,y, 20);
        this.shootingPoint = new Pair(20,5);
    }
    draw(player, context, shot){
        var width = this.shootingPoint.x;
        var height =this.shootingPoint.y;
        context.fillStyle = "black";
        context.fillRect(0+width/2, 0-height/2, width, height);
        // context.stroke();
        // shot = true;
        if (shot && player == this.stage.player){
            var audio = new Audio('/audio/ar.mp3');
            audio.play();
            var img = document.getElementById("shot");
            context.drawImage(img, 0+width/2+width+2, 0-height, 10,10);
            // context.stroke();
        }
    }
    draw_inventory(context, x,y, sizeX, sizeY, player){
        context.save();
        var img = document.getElementById("ar");
        context.fillStyle = "rgba(211,211,211,0.5)";
        context.fillRect(x,y, sizeX,sizeY);
        context.drawImage(img, x,y, sizeX, sizeY);
        context.textAlign = "right";
        context.fillStyle = "white";
        context.font = "20px Arial";
        context.fillText(player.medammo + this.currentAmmo, x+sizeX-2,y+sizeY-2);
        context.restore();
    }
    reload(){
        this.stage.player.medammo += this.currentAmmo;
        if (this.stage.player.medammo <=0){
            return false;
        }else if (this.stage.player.medammo < this.maxAmmo){
            this.currentAmmo = this.stage.player.medammo;
            this.stage.player.medammo =0;
            return true;
        }else{
            this.currentAmmo = this.maxAmmo;
            this.stage.player.medammo -= this.maxAmmo;
        }
    }
}

class Pistol extends Gun{
    constructor(stage,x,y){
        super(stage, "pistol", 40, 6, 6, 50, 10, false, 5, x,y, 20);
        this.shootingPoint = new Pair(20,5);
    }

    draw(player, context, shot){
        var width = this.shootingPoint.x;
        var height =this.shootingPoint.y;
        // Drawing of how the pistol looks in hand
        context.beginPath();
        context.rect(0+width/2, 0-height/2, width, height);
        context.fillStyle = "#BEBDC2";
        context.fill();
        context.beginPath();
        context.fillStyle = "black";
        context.rect(0+width/2 + 5, 0-height/2+1.5, 4, 2);
        context.rect(0+width/2 + 17, 0-height/2.5+1.5, 4, 2);
        context.fill();
        // shot = true;
        if (shot && player == this.stage.player){
            var img = document.getElementById("shot");

            var audio = new Audio('/audio/pistol.mp3');
            audio.volume = 0.2;
            audio.play();
            context.drawImage(img, 0+width/2+width+2, 0-height, 10,10);
            // context.stroke();
        }
    }

    draw_inventory(context, x,y, sizeX, sizeY, player){
        context.save();
        var img = document.getElementById("pistol");
        context.fillStyle = "rgba(211,211,211,0.5)";
        context.fillRect(x,y, sizeX,sizeY);
        context.drawImage(img, x,y, sizeX, sizeY);
        context.textAlign = "right";
        context.fillStyle = "white";
        context.font = "20px Arial";
        context.fillText(player.lightammo + this.currentAmmo, x+sizeX-2,y+sizeY-2);
        context.restore();
    }

    reload(){

        this.stage.player.lightammo += this.currentAmmo;
        if (this.stage.player.lightammo <=0){
            return false;
        }else if (this.stage.player.lightammo < this.maxAmmo){
            this.currentAmmo = this.stage.player.lightammo;
            this.stage.player.lightammo =0;
            return true;
        }else{
            this.currentAmmo = this.maxAmmo;
            this.stage.player.lightammo -= this.maxAmmo;
        }
    }
}

//storm class
class Storm {
	constructor(stage) {
		this.stage = stage;
		this.thickness = 0;
		this.radius = 2000;
	}

	getThickness(){
		return this.thickness;
	}

	draw(){
		return "storm";
	}

	step(){
		return;
	}
}

//transporter pods class
class Portal extends Actor {
    constructor(stage, x, y){
        super(stage,x,y,'Portal');
        this.wid = 24;
        this.len = 30;
    }
    draw(){
        return "portal";
    }
}

//left framework of the house
class Frame1 extends Actor {
    constructor(stage, x, y){
        super(stage,x,y,'frame1');
        this.wid = 50.59;
        this.len = 250;
    }
    draw(){
        return "house";
    }
}

//right framework of the house
class Frame2 extends Actor {
    constructor(stage, x, y){
        super(stage,x,y,'frame2');
        this.wid = 50.59;
        this.len = 250;
    }
    draw(){
        return "house";
    }
}
