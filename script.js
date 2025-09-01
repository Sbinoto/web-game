const canvas=document.querySelector(".canvas");
const screenSize=800;
 
const deathScreen=document.querySelector(".deathScreen");
const startScreen=document.querySelector(".startScreen");

function getPosition(node){
    let x=parseInt(getComputedStyle(node).getPropertyValue("left").slice(0,-2)) || 0;
    let y=parseInt(getComputedStyle(node).getPropertyValue("top").slice(0,-2)) || 0;
    return [x, y];
}

function getSize(node){
    return parseInt(window.getComputedStyle(node).getPropertyValue("height").slice(0,-2));
};

function spawn(insetOutset, node){
    const nodeSize=getSize(node);
    let x;
    let y;
    switch (insetOutset){
        case "in":
            x=Math.floor(Math.random()*(screenSize-nodeSize));
            y=Math.floor(Math.random()*(screenSize-nodeSize));
            break
        case "out":
            x=Math.floor(Math.random()*screenSize);
            y=Math.floor(Math.random()*screenSize);
            const leftRightTopBottom=Math.floor(Math.random()*4);
            switch (leftRightTopBottom){
                case 3:
                    x*=-1;
                    y*=-1;
                    break
                case 2:
                    x*=-1;
                    y+=screenSize-nodeSize;
                    break
                case 1:
                    x+=screenSize-nodeSize;
                    y*=-1;
                    break
                case 0:
                    x+=screenSize-nodeSize;
                    y+=screenSize-nodeSize;
                    break
            };
            node.style.left=`${x}px`;
            node.style.top=`${y}px`;

    };
};

function detectCollision(node1, node2){
    const node1Position=getPosition(node1);
    const node1Size=getSize(node1);
    const node2Position=getPosition(node2);
    const node2Size=getSize(node2);
    if ((node1Position[0]>node2Position[0] && node1Position[0]<node2Position[0]+node2Size) ||
         (node1Position[0]+node2Size>node2Position[0] && node1Position[0]+node1Size<node2Position[0]+node2Size) ||
         (node1Position[1]>node2Position[1] && node1Position[1]<node2Position[1]+node2Size) ||
         (node1Position[1]+node2Size>node2Position[1] && node1Position[1]+node1Size<node2Position[1]+node2Size)){
        return true
    }
    else{
        return false
    };
};

class player{

    constructor(){
        this.node=document.createElement("div");
        this.node.setAttribute("class", "player sprite");
        canvas.appendChild(this.node);
        const nodeSize=getSize(this.node);

        this.move=(wasdArray)=>{
            const position=getPosition(this.node);
            if (wasdArray[0]){
                this.node.style.top=`${Math.max(0, position[1]-14)}px`;
            };
            if (wasdArray[1]){
                this.node.style.left=`${Math.max(0, position[0]-14)}px`;
            };
            if (wasdArray[2]){
                this.node.style.top=`${Math.min(screenSize-nodeSize, position[1]+14)}px`;
            };
            if (wasdArray[3]){
                this.node.style.left=`${Math.min(screenSize-nodeSize, position[0]+14)}px`;
            };
        };
    };
};

class enemy{

    constructor(){
        this.node=document.createElement("div");
        this.node.setAttribute("class", "enemy sprite");
        this.shootCooldown=5500;
        this.lastShot=0;
        canvas.appendChild(this.node);

        this.move=(target)=>{
            const currentPosition=getPosition(this.node);
            const targetPosition=getPosition(target.node);
            let x=0;
            let y=0;
            if (currentPosition[0]>targetPosition[0]){
                x-=7;
            }
            else{
                x+=7
            };
            if (currentPosition[1]>targetPosition[1]){
                y-=7
            }
            else{
                y+=7
            }
            this.node.style.left=`${currentPosition[0]+x}px`;
            this.node.style.top=`${currentPosition[1]+y}px`;
        };

        this.shoot=(target)=>{
            if (Date.now()-this.lastShot>=this.shootCooldown){
                new bullet(getPosition(target.node),this);
                this.lastShot=Date.now()
            };
        };
    };

    static enemyHandler(){
        for (let i=0;i<play.enemies.length;i++){
            play.enemies[i].move(play.player);
            play.enemies[i].shoot(play.player);
            for (let j=0;j<play.enemies.length;j++){
                if (j==i) continue;
                if (detectCollision(play.enemies[i].node, play.enemies[j].node)){
                    const enemyPosition=getPosition(play.enemies[i].node);
                    const otherEnemyPosition=getPosition(play.enemies[j].node);
                    let x=0;
                    let y=0;
                    if (enemyPosition[0]>otherEnemyPosition[0]){
                        x=1;
                    }
                    else if (enemyPosition[0]<otherEnemyPosition[0]){
                        x=-1;
                    };
                    if (enemyPosition[1]>otherEnemyPosition[1]){
                        y=1;
                    }
                    else if (enemyPosition[1]<otherEnemyPosition[1]){
                        y=-1;
                    };
                    play.enemies[i].node.style.left=`${enemyPosition[0]+x}px`;
                    play.enemies[i].node.style.top=`${enemyPosition[1]+y}px`;
                };
            };
            if (detectCollision(play.enemies[i].node, play.player.node)){
                play.alive=false;
            };
            if (play.laserbeam && (detectCollision(play.enemies[i].node, play.laserbeam.node1) || detectCollision(play.enemies[i].node, play.laserbeam.node2))){
                spawn("out", play.enemies[i].node)
            };
        };
    };
};

class ammo{

    constructor(){
        this.node=document.createElement("div");
        this.node.setAttribute("class", "ammo sprite");
        canvas.appendChild(this.node);


    };

    static ammoHandler=()=>{
        for (let i=0;i<play.munition.length;i++){
            if (detectCollision(play.munition[i].node, play.player.node)){
                play.playerAmmo++;
                spawn("in",play.munition[i].node);
            };
        };
    };
};

class bullet{

    constructor(endPosition, originObject){
        this.node=document.createElement("div");
        this.node.setAttribute("class", "bullet sprite");
        canvas.appendChild(this.node);
        play.activeBullet.push(this);
        this.shooter=originObject;
        this.shooterCenter=getSize(originObject)/2
        this.position=getPosition(originObject.node);
        this.node.style.left=`${this.position[0]+this.shooterCenter}px`;
        this.node.style.top=`${this.position[1]+this.shooterCenter}px`;
        this.distance=Math.hypot(endPosition[0]-this.position[0], endPosition[1]-this.position[1]);
        this.xRate=Math.floor((endPosition[0]-this.position[0])/this.distance*10);
        this.yRate=Math.floor((endPosition[1]-this.position[1])/this.distance*10);

        this.move=()=>{
            const currentPosition=getPosition(this.node);
            this.node.style.left=`${currentPosition[0]+this.xRate}px`;
            this.node.style.top=`${currentPosition[1]+this.yRate}px`;
        };
    };

    static bulletHandler=()=>{
        for (let i=0;i<play.activeBullet.length;i++){
            for (let j=0;j<play.enemies.length;j++){
                if (detectCollision(play.activeBullet[i].node, play.enemies[j].node) && play.activeBullet[i].shooter===play.player){
                    play.killCount++;
                    spawn("out", play.enemies[j].node);
                };
            };
            if (detectCollision(play.player.node, play.activeBullet[i].node) && play.activeBullet[i].shooter!==play.player){
                play.alive=false;
            };
            for (let j=0;j<play.activeBullet.length;j++){
                if (play.activeBullet[i]===play.activeBullet[j]) continue;
                if (detectCollision(play.activeBullet[i].node, play.activeBullet[j].node)){
                    play.activeBullet.splice(i,1);
                    play.activeBullet.splice(j,1);
                    play.activeBullet[i].remove();
                    play.activeBullet[j].remove();
                };
            };
        };
    };
};

class laser{

    constructor(){
        this.type=Math.floor(Math.random()*3);
        this.node1=document.createElement("div");
        this.node2=document.createElement("div");
        this.node1.setAttribute("class", "laser");
        this.node2.setAttribute("class", "laser");
        this.node1.style.width="800px";
        this.node1.style.height="800px";
        this.node2.style.width="800px";
        this.node2.style.height="800px";

        switch (this.type){
            case 0:
                this.node1.style.top="-800px";
                this.node2.style.top="800px";
                break
            case 1:
                this.node1.style.left="-800px";
                this.node2.style.left="800px";
                break
            case 2:
                this.node1.style.top="-800px";
                this.node2.style.top="800px";
                this.node1.style.left="-800px";
                this.node2.style.left="800px";
        };

        this.move=()=>{
            let x=0;
            let y=0;
            let position1=getPosition(this.node1);
            let position2=getPosition(this.node2);
            switch (this.type){
                case 0:
                    if (position1[1]+7>screenSize/3){
                        return false
                    };
                    y=7
                    break
                case 1:
                    if (position1[0]+7>screenSize/3){
                        return false
                    };
                    x=7
                    break
                case 2:
                    if (position1[1]+7>screenSize/2){
                        return false
                    };
                    x=7
                    y=7
            };
            this.node1.style.left=`${position1[0]+x}px`;
            this.node1.style.top=`${position1[1]+y}px`;
            this.node2.style.left=`${position2[0]-x}px`;
            this.node2.style.top=`${position2[1]-y}px`;
        };
    };

    static laserHandler=()=>{
        if (!play.laserbeam && Date.now()-play.Lastlaser>=play.laserCooldown){
            play.laserbeam=new laser()
        }
        else if (play.laserbeam){
            play.laserbeam.move()
        };
        if (play.laserbeam && (detectCollision(play.player.node, play.laserbeam.node1) || detectCollision(play.player.node, play.laserbeam.node2))){
            play.alive=false;
        };
    };
};

class game{

    constructor(){
        this.running=false;
        this.initialize();
        document.addEventListener("keydown", (event)=>{this.inputHandler(event)});
        document.addEventListener("keyup", (event)=>this.inputHandler(event))
        canvas.addEventListener("click", (event)=>{
            if (this.playerAmmo && Date.now()-this.lastShot>=250){ new
                bullet([event.clientX, event.clientY], this.player)};
                this.playerAmmo--
        });
        this.mainLoop()
    };

    initialize(){
        this.wasd=[false,false,false,false]
        this.alive=true;
        this.score=0;
        this.killCount=0;
        this.timer-Date.now();
        this.player= new player();
        this.playerAmmo=7;
        this.playerCooldown=250;
        this.activeBullet=[];
        this.enemies=[];
        this.munition=[];
        this.laserbeam=false;
        this.laserCooldown=10000;
        this.Lastlaser=Date.now()
        this.lastShot=Date.now();
        for (let i=6;i>=0;i--){
            const enem=new enemy();
            spawn("out", enem.node);
            console.log(enem.node.style.left, enem.node.style.top);

            this.enemies.push(enem);
        };
        for (let i=5;i>=0;i--){
            const amm=new ammo();
            spawn("in", amm.node);
            this.munition.push(amm);
        };
    };

    inputHandler(event){
        switch (event.key){
            case "w":
                this.wasd[0]=!this.wasd[0];
                break
            case "a":
                this.wasd[1]=!this.wasd[1];
                break
            case "s":
                this.wasd[2]=!this.wasd[2];
                break
            case "d":
                this.wasd[3]=!this.wasd[3];
                break
            case " ":
                if (event.type=="keydown"){
                    this.running=!this.running;
                    if (!this.alive){
                        this.initialize();
                        break
                    };
                };
        };
    };

    update(){
        this.player.move(this.wasd)
        laser.laserHandler();
        enemy.enemyHandler();
        ammo.ammoHandler();
        bullet.bulletHandler();
        this.score+=Date.now()-this.timer;
        this.timer=Date.now();
    };

    mainLoop(){
        while (this.alive){
            if (this.running){
            startScreen.style.setAttribute("visibility", "hidden")
            this.update;
            continue
            };
            startScreen.style.setAttribute("visibility", "visible");
        };
        this.running=false;
        deathScreen.style.setAttribute("visibility", "visible")
    }
};

const play=new game();
