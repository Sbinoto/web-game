const canvas=document.querySelector(".canvas");
const screenSize=300;
function spawn(inOrOut, node){
    let x;
    let y;
    switch (inOrOut){
        case "in":
            x=Math.floor(Math.random()*screenSize-node.style.height);
            y=Math.floor(Math.random()*screenSize-node.style.height);
            break
        case "out":
            x=Math.floor(Math.random()*screenSize);
            y=Math.floor(MMath.random()*screenSize);
            const leftRightTopBottom=Math.floor(Math.random()*4);
            switch (leftRightTopBottom){
                case 3:
                    x*=-1;
                    y*=-1;
                    break
                case 2:
                    x*=-1;
                    y+=screenSize-node.width;
                    break
                case 1:
                    y*=-1;
                    x+=screenSize-node.width;
                    break
                case 0:
                    x+=screenSize-node.width;
                    y+=screenSize-node.width;
                    break
            }
            node.style.left=`${x}px`;
            node.style.top=`${y}px`;
    }
}

class player{

    constructor(){
        this.node=document.createElement("div");
        this.node.setAttribute("class", "player");
        this.node.style.position="absolute";
        this.node.style.height="60px";
        this.node.style.width="60px";
        this.node.style.backgroundColor="white";
        canvas.appendChild(this.node);

        this.move=(event)=>{
            const x=parseInt(this.node.style.left);
            const y=parseInt(this.node.style.top);
            switch (event.key){
                case "w":
                    this.node.style.top=`${Math.max(screenSize, y-14)}px`;
                    break
                case "s":
                    this.node.style.top=`${Math.min(screenSize, y+14)}px`;
                    break
                case "a":
                    this.node.style.left=`${Math.max(screenSize, x-14)}px`;
                    break
                case "d":
                    this.node.style.left=`${Math.min(screenSize, x+14)}px`;
                    break

            }
        }
        
    }
}

class enemy{

    constructor(){
        this.node=document.createElement("div");
        this.node.setAttribute("class", "enemy");
        this.node.style.position="absolute";
        this.node.style.height="60px";
        this.node.style.width="60px";
        this.node.style.backgroundColor="black";
        canvas.appendChild(this.node)
    }
}

class ammo{

    constructor(){
        this.node=document.createElement("div");
        this.node.setAttribute("class", "ammo");
        this.node.style.position="absolute";
        this.node.style.height="25px";
        this.node.style.width="25x";
        this.node.style.backgroundColor="orange";
        canvas.appendChild(this.node)
    }
}

class game{

    constructor(){
        this.player=new player();
        this.enemies=[];
        this.ammo=[];

        this.initialize=()=>{
            for (let i=6;i>=0;i--){
                const enemy= new enemy();
                spawn("out", enemy.node);
                this.enemies.push(enemy);
            };
            for (let i=5;i>=0;i--){
                const ammo= new ammo();
                spawn("in", ammo.node);
                this.ammo.push(ammo)
            }
        };

        this.checkInputs=()=>{
            document.addEventListener("keydown", )
        }

    }
}