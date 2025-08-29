const canvas=document.querySelector(".canvas");

const screenSize=800;

function getPosition(node){
    let x=node.style.left;
    let y=node.style.top;
    return [parseInt(x.slice(0,-2)), parseInt(y.slice(0, -2))];
}

function spawn(insetOutset, node){
    const nodeSize=parseInt(node.getComputedStyle.getPropertyValue("height").slice(0,-2));
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

class player{

    constructor(){
        this.node=document.createElement("div");
        this.node.setAttribute("class", "player sprite");
        canvas.appendChild(this.node);

        this.move=(event)=>{
            const position=getPosition(this.node);
            switch (event.key){
                case "w":
                    this.node.style.top=`${Math.max(screenSize, position[1]-14)}px`;
                    break
                case "s":
                    this.node.style.top=`${Math.min(screenSize, position[1]+14)}px`;
                    break
                case "a":
                    this.node.style.left=`${Math.max(screenSize, position[0]-14)}px`;
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
        canvas.appendChild(this.node);
    };
};

class ammo{

    constructor(){
        this.node=document.createElement("div");
        this.node.setAttribute("class", "ammo sprite");
        canvas.appendChild(this.node);
    };
};

class bullet{

    constructor(){
        this.node=document.createElement("div");
        this.node.setAttribute("class", "bullet sprite");
        canvas.appendChild(this.node);

        this.move=(originNode, endPoint)=>{
            const position
        }
    }
}

class game{

    constructor(){

        this.init=()=>{
            this.player= new player();
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
        };

        this.checkInputs=()=>{
            document.addEventListener("keydown", this.player.move);
            document.addEventListener("click", )
        }

    };
};