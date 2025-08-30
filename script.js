const canvas=document.querySelector(".canvas");

const screenSize=800;

function getPosition(node){
    let x=node.style.left;
    let y=node.style.top;
    return [parseInt(x.slice(0,-2)), parseInt(y.slice(0, -2))];
}

function spawn(insetOutset, node){
    const nodeSize=parseInt(window.getComputedStyle(node).getPropertyValue("height").slice(0,-2));
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
    const node1Size=parseInt(window.getComputedStyle(node1).getPropertyValue("width").slice(0,-2));
    const node2Position=getPosition(node2);
    const node2Size=parseInt(window.getComputedStyle(node2).getPropertyValue("width").slice(0,-2));
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

        this.move=(event)=>{
            const position=getPosition(this.node);
            switch (event.key){
                case "w":
                    this.node.style.top=`${Math.max(0, position[1]-14)}px`;
                    break
                case "s":
                    this.node.style.top=`${Math.min(screenSize, position[1]+14)}px`;
                    break
                case "a":
                    this.node.style.left=`${Math.max(0, position[0]-14)}px`;
                    break
                case "d":
                    this.node.style.left=`${Math.min(screenSize, position[0]+14)}px`;
                    break
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
                new bullet(getPosition(target.node),this.node,game);
                this.lastShot=Date.now()
            };
        };
    };

    static enemyHandler(game){
        for (let i=0;i<game.enemies.length;i++){
            game.enemies[i].move(game.player);
            game.enemies[i].shoot(game.player);
            for (let j=0;j<=game.enemies.length;j++){
                if (j==i) continue;
                if (detectCollision(game.enemies[i].node, game.enemies[j].node)){
                    const enemyPosition=getPosition(game.enemies[i]);
                    const otherEnemyPosition=getPosition(game.enemies[j]);
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
                    game.enemies[i].style.left=`${enemyPosition[0]+x}px`;
                    game.enemies[i].style.top=`${enemyPosition[1]+y}px`;
                };
            };
            if (detectCollision(game.enemies[i].node, game.player.node)){
                game.alive=false;
            };
            if (detectCollision(game.enemies[i].node, game.laser.node1) || detectCollision(game.enemies[i].node, game.laser.node2)){
                spawn("out", game.enemies[i])
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

    static ammoHandler=(game)=>{
        for (let i=0;i<game.ammo.length;i++){
            if (detectCollision(game.ammo[i].node, game.player.node)){
                game.playerAmmo++;
                spawn("in",game.ammo[i]);
            };
        };
    };
};

class bullet{

    constructor(endPosition, originObject, game){
        this.node=document.createElement("div");
        this.node.setAttribute("class", "bullet sprite");
        canvas.appendChild(this.node);
        game.activeBullet.push(this);
        this.shooter=originObject;

        this.position=getPosition(originObject.node);
        this.distance=Math.hypot(this.position[0], this.position[1]);
        this.xRate=Math.floor((endPosition[0]-this.position[0])/this.distance*10);
        this.yrate=Math.floor((endPosition[1]-this.position[1])/this.distance*10);

        this.move=()=>{
            const currentPosition=getPosition(this.node);
            this.node.style.left=`${currentPosition[0]+this.xRate}px`;
            this.node.style.top=`${currentPosition[1]+this.xRate}px`;
        };
    };

    static bulletHandler=(game)=>{
        for (let i=0;i<game.activeBullet.length;i++){
            for (let j=0;j<game.enemies.length;j++){
                if (detectCollision(game.activeBullet[i], game.enemies[j])){
                    if (game.activeBullet[i].originObject===game.player){
                        game.killCount++;
                        spawn("out", game.enemies[j]);
                    };
                };
            };
            if (detectCollision(game.player, game.activeBullet[i])){
                game.alive=false;
            };
            for (let j=0;j<game.activeBullet.length;j++){
                if (game.activeBullet[i]===game.activeBullet[j]) continue;
                if (detectCollision(game.activeBullet[i], game.activeBullet[j])){
                    game.activeBullet[i].remove();
                    game.activeBullet[j].remove();
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

    static laserHandler=(game)=>{
        if (!game.laser && Date.now()-game.Lastlaser>=game.laserCooldown){
            game.laser=new laser()
        }
        else if (this.laser){
            game.laser.move()
        };
        if (game.laser && (detectCollision(game.player.node, game.laser.node1) || detectCollision(game.player.node, game.laser.node2))){
            game.alive=false;
        };
    };
};

class game{

    constructor(){
        this.alive=true;
        this.killCount=0;
    };

    initialize(){
        this.player= new player();
        this.playerAmmo=7;
        this.playerCooldown=250;
        this.lastShot=Date.now();
        document.addEventListener("keydown", this.player.move);
        canvas.addEventListener("click", (event)=>{
            if (this.playerAmmo && Date.now()-this.lastShot>=250){ new
                bullet([event.clientX, event.clientY], this.node, game)};
                this.playerAmmo--
        });
        this.enemies=[];
        this.ammo=[];
        for (let i=6;i>=0;i--){
            const enemy=new enemy();
            spawn("out", enemy.node);
            this.enemies.push(enemy);
        };
        for (let i=5;i>=0;i--){
            const ammo=new ammo();
            spawn("in", ammo.node);
            this.ammo.push(ammo);
        };
        this.activeBullet=[];
        this.laser=false;
        this.laserCooldown=10000;
        this.Lastlaser=Date.now()
    }

    update(){
        laser.laserHandler;
        enemy.enemyHandler;
        ammo.ammoHandler;
        bullet.bulletHandler;
    };

    run(){
        
    }
};

const game=new game();