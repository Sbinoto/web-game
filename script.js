const canvas=document.querySelector(".canvas");
const screenSize=800;
 
const deathScreen=document.querySelector(".deathScreen");
const startScreen=document.querySelector(".startScreen");
const currentScore=document.querySelector(".current.score");
const currentKillCount=document.querySelector(".current.kills");
const recordScore=document.querySelector(".best.score");
const recordKillCount=document.querySelector(".best.kills");
const hearts=Array.from(document.querySelectorAll(".heartIMG"));
const playerAmmo=document.querySelector(".playerAmmo");
const songTitle=document.querySelector(".title");
const songCredit=document.querySelector(".names");
const songExtras=document.querySelector(".extras");

function animationToggle(onOff){
    const sprites=Array.from(document.querySelectorAll(".sprite"));
    switch (onOff){
        case "on":
            for (const node of sprites){
                node.style.animationPlayState="running"
            };
            break
        case "off":
            for (const node of sprites){
                node.style.animationPlayState="paused"
            };
    };
};

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
        };
    node.style.left=`${x}px`;
    node.style.top=`${y}px`;
};

function detectCollision(node1, node2){
    const node1Position=getPosition(node1);
    const node1Size=getSize(node1);
    const node2Position=getPosition(node2);
    const node2Size=getSize(node2);
    const verticalCollision=(node1Position[0]>node2Position[0] && node1Position[0]<node2Position[0]+node2Size) ||
                            (node1Position[0]<node2Position[0] && node1Position[0]+node1Size>node2Position[0]) ||
                            (node1Position[0]>node2Position[0] && node1Position[0]+node1Size<node2Position[0]+node2Size) ||
                            (node1Position[0]<node2Position[0] && node1Position[0]+node1Size>node2Position[0]+node2Size);
    const horizontalCollision=(node1Position[1]>node2Position[1] && node1Position[1]<node2Position[1]+node2Size) ||
                            (node1Position[1]<node2Position[1] && node1Position[1]+node1Size>node2Position[1]) ||
                            (node1Position[1]>node2Position[1] && node1Position[1]+node1Size<node2Position[1]+node2Size) ||
                            (node1Position[1]<node2Position[1] && node1Position[1]+node1Size>node2Position[1]+node2Size);
    return verticalCollision && horizontalCollision;
};

function isInbound(node){
    const position=getPosition(node);
    const nodeSize=getSize(node);
    if (position[0]<0-nodeSize || position[1]<0-nodeSize ||
         position[0]>screenSize+nodeSize || position[1]>screenSize+nodeSize){
        node.style.visibility="hidden";
        return false
    } else{
        node.style.visibility="visible";
        return true
    };
};

class music{

    constructor(title, url, names, extra){
        this.title=title;
        this.url=url;
        this.names=names;
        this.extra=extra
    };
};

const carmen= new music("Carmen", "./assets/music/carmen.mp3", ["Georges Bizet", "Classical 8 Bit"]
    , "This work is licensed under a Creative Commons Attribution-NonCommercial 4.0 International License.")
const canCan= new music("Can-Can", "./assets/music/cancan.mp3", ["Jacques Offenbach", "Bulby"]
    , "https://www.youtube.com/@Bulby")
const mountainKing= new music("In the Hall of the Mountain King", "./assets/music/mountainking.mp3", ["Edvard Grieg", "Classical 8 Bit"], "This work is licensed under a Creative Commons Attribution-NonCommercial 4.0 International License.")
const rideOfTheValkyries= new music("Ride of the Valkyries", "./assets/music/rideofthevalkyries.mp3", ["Richard Wagner", "Classical 8 Bit"]
    , "This work is licensed under a Creative Commons Attribution-NonCommercial 4.0 International License.")
const williamTell= new music("William Tell Overture", "./assets/music/williamtell.mp3", ["Gioachino Rossini", "Classical 8 Bit"]
    , "This work is licensed under a Creative Commons Attribution-NonCommercial 4.0 International License.")

let track=[carmen,canCan,mountainKing,rideOfTheValkyries,williamTell];

class player{

    constructor(){
        this.node=document.createElement("div");
        this.node.setAttribute("class", "player sprite");
        this.health=3;
        this.invincibilityPeriod=2000;
        canvas.appendChild(this.node);
        const nodeSize=getSize(this.node);

        this.damage=()=>{
            if (this.invincibilityPeriod<=0){
                hearts[--this.health].style.visibility="hidden";
                this.invincibilityPeriod=2000;
            };
        };

        this.move=(wasdArray)=>{
            const position=getPosition(this.node);
            if (wasdArray[0]){
                this.node.style.top=`${Math.max(0, position[1]-10)}px`;
            };
            if (wasdArray[1]){
                this.node.style.left=`${Math.max(0, position[0]-10)}px`;
            };
            if (wasdArray[2]){
                this.node.style.top=`${Math.min(screenSize-nodeSize, position[1]+10)}px`;
            };
            if (wasdArray[3]){
                this.node.style.left=`${Math.min(screenSize-nodeSize, position[0]+10)}px`;
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
                x-=4;
            }
            else{
                x+=4;
            };
            if (currentPosition[1]>targetPosition[1]){
                y-=4;
            }
            else{
                y+=4;
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
            isInbound(play.enemies[i].node);
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
                play.player.damage();
            };
            if (play.laserbeam && (detectCollision(play.enemies[i].node, play.laserbeam.node1) ||
             detectCollision(play.enemies[i].node, play.laserbeam.node2))){
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
            isInbound(play.munition[i].node)
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
        this.shooterCenter=getSize(originObject.node)/2
        this.position=getPosition(originObject.node);
        this.position[0]+=this.shooterCenter;
        this.position[1]+=this.shooterCenter;
        this.node.style.left=`${this.position[0]}px`;
        this.node.style.top=`${this.position[1]}px`;
        this.distance=Math.hypot(endPosition[0]-this.position[0], endPosition[1]-this.position[1]);
        this.xRate=(endPosition[0]-this.position[0])/this.distance*14;
        this.yRate=(endPosition[1]-this.position[1])/this.distance*14;

        this.move=()=>{
            const currentPosition=getPosition(this.node);
            this.node.style.left=`${currentPosition[0]+this.xRate}px`;
            this.node.style.top=`${currentPosition[1]+this.yRate}px`;
        };
    };

    static bulletHandler=()=>{
        let toRemove=new Set()
        for (let i=0;i<play.activeBullet.length;i++){
            if (!isInbound(play.activeBullet[i].node)){
                toRemove.add(i);
            };
            play.activeBullet[i].move();
            for (let j=0;j<play.enemies.length;j++){
                if (detectCollision(play.activeBullet[i].node, play.enemies[j].node) &&
                 play.activeBullet[i].shooter===play.player){
                    play.killCount++;
                    spawn("out", play.enemies[j].node);
                    toRemove.add(i);
;
                };
            };
            if (detectCollision(play.player.node, play.activeBullet[i].node) &&
             play.activeBullet[i].shooter!==play.player){
                play.player.damage()
                toRemove.add(i);;
            };
            for (let j=0;j<play.activeBullet.length;j++){
                if (play.activeBullet[i]===play.activeBullet[j]) continue;
                if (detectCollision(play.activeBullet[i].node, play.activeBullet[j].node)){
                    toRemove.add(i);
                    toRemove.add(j);
                };
            };
        };
        if (toRemove.size>0){
            toRemove=Array.from(toRemove).sort((a,b)=>a-b);
            for (let i=toRemove.length-1;i>=0;i--){
                play.activeBullet[toRemove[i]].node.remove();
                play.activeBullet.splice(toRemove[i], 1);
            };
        };  
    };
};

class laser{

    constructor(){
        this.type=Math.floor(Math.random()*3);
        this.node1=document.createElement("div");
        this.node2=document.createElement("div");
        canvas.appendChild(this.node1);
        canvas.appendChild(this.node2);
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
                this.node1.style.top="0px"
                this.node2.style.top="0px"
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
                    if (position1[1]+7>-500){
                        return false
                    };
                    y=9;
                    break
                case 1:
                    if (position1[0]+7>-500){
                        return false
                    };
                    x=9;
                    break
                case 2:
                    if (position1[1]+7>-200){
                        return false
                    };
                    x=9;
                    y=9;
            };
            this.node1.style.left=`${position1[0]+x}px`;
            this.node1.style.top=`${position1[1]+y}px`;
            this.node2.style.left=`${position2[0]-x}px`;
            this.node2.style.top=`${position2[1]-y}px`;
        };
    };

    static laserHandler=()=>{
        if (!play.laserbeam  && Date.now()-play.Lastlaser>=play.laserCooldown){
            play.laserbeam=new laser();
            play.Lastlaser=Date.now();
        }
        else if (play.laserbeam){
            if (play.laserbeam.move()==false){
                play.laserbeam.node1.remove();
                play.laserbeam.node2.remove();
                play.laserbeam=false
            }
        };
        if (play.laserbeam && (detectCollision(play.player.node, play.laserbeam.node1) ||
         detectCollision(play.player.node, play.laserbeam.node2))){
            play.player.damage();
        };
    };
};

class game{

    constructor(){
        this.record={
            kill:0,
            time:0
        };
        this.running=false;
        this.initialize();
        document.addEventListener("keydown", (event)=>{this.inputHandler(event)});
        document.addEventListener("keyup", (event)=>this.inputHandler(event))
        canvas.addEventListener("click", (event)=>{
            if (this.playerAmmo && Date.now()-this.lastShot>=250){
                const canvasInfo=canvas.getBoundingClientRect();
                new bullet([event.clientX-canvasInfo.x, event.clientY-canvasInfo.y], this.player);
                this.playerAmmo--;
            };
        });
        requestAnimationFrame((time)=>this.mainLoop(time));
    };

    initialize(){
        this.song=false;
        this.startTime=undefined;
        deathScreen.style.visibility="hidden"
        while (canvas.lastChild!=startScreen){
            canvas.removeChild(canvas.lastChild)
        };
        this.wasd=[false,false,false,false]
        this.timer=0;
        this.killCount=0;
        this.player= new player();
        this.playerAmmo=7;
        this.playerCooldown=250;
        this.activeBullet=[];
        this.enemies=[];
        this.munition=[];
        this.laserbeam=false;
        this.laserCooldown=5000;
        this.Lastlaser=Date.now()
        this.lastShot=Date.now();
        for (let i=4;i>=0;i--){
            const enem=new enemy();
            spawn("out", enem.node);
            this.enemies.push(enem);
        };
        for (let i=5;i>=0;i--){
            const amm=new ammo();
            spawn("in", amm.node);
            this.munition.push(amm);
        };
        for (const heart of hearts){
            heart.style.visibility="visible";
        };
    };

    inputHandler(event){
        switch (event.type){
            case "keydown":
                switch (event.key){
                    case "w":
                        this.wasd[0]=true;
                        break
                    case "a":
                        this.wasd[1]=true;
                        break
                    case "s":
                        this.wasd[2]=true;
                        break
                    case "d":
                        this.wasd[3]=true;
                        break
                    case " ":
                        if (!this.running){
                            startScreen.style.visibility="hidden";
                            if (this.song){
                            this.song.play();
                            };
                            animationToggle("on");
                        } else{
                            startScreen.style.visibility="visible";
                            if (this.song){
                            this.song.pause();
                            };
                            animationToggle("off")
                        };
                        this.running=!this.running;
                        if (this.player.health<=0){
                            this.initialize();
                            break
                        };
                };
                break
            case "keyup":
                switch (event.key){
                case "w":
                    this.wasd[0]=false;
                    break
                case "a":
                    this.wasd[1]=false;
                    break
                case "s":
                    this.wasd[2]=false;
                    break
                case "d":
                    this.wasd[3]=false;
                    break
                };
        };
    };

    UIHandler(){
        playerAmmo.textContent=play.playerAmmo;
        currentScore.textContent=Math.floor(play.timer);
        currentKillCount.textContent=play.killCount;
    };

    musicHandler(){
        if (!this.song){
            const song=track[Math.floor(Math.random()*5)];
            songTitle.textContent=song.title;
            songCredit.textContent=song.names;
            songExtras.textContent=song.extra;
            this.song=new Audio(song.url);
            this.song.play();
        };
    };

    update(){
        this.player.move(this.wasd)
        if (this.player.invincibilityPeriod){
            this.player.invincibilityPeriod-=66;
        };
        laser.laserHandler();
        enemy.enemyHandler();
        ammo.ammoHandler();
        bullet.bulletHandler();
        this.timer+=1/30;
        this.musicHandler();
        this.UIHandler();
    };

    playerDead(){
        if (this.record.kill<this.killCount){
            this.record.kill=this.killCount
        };
        if (this.record.time<this.timer){
            this.record.time=this.timer;
        };
        deathScreen.style.visibility="visible";
        recordScore.textContent=Math.floor(play.record.time);
        recordKillCount.textContent=Math.floor(play.record.kill);
        if (this.song){
            this.song.pause();
            this.song=false;
        };
        animationToggle("off");
    };

    mainLoop(currentTime){
        if (this.startTime===undefined){
            this.startTime=currentTime;
        };
        if (currentTime-this.startTime>1000/30){
            this.startTime=currentTime
            if (this.player.health>0){
                if (this.running){
                    this.update();
                };
            } else {
                this.playerDead();
            };
        };
        requestAnimationFrame((time)=>this.mainLoop(time));
    }
};

const play=new game();

