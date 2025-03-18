class Marble {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.colour = Marble.getRandomColour();

        let options = {
            friction: 0,
            restitution: 1
        }

        this.body = Bodies.circle(this.x, this.y, this.r / 2, options);

        Composite.add(world, this.body);
    }

    static getRandomColour() {
        const colours = ['#d2f1e4', '#fbcaef', '#acf39d', '#f2dc5d', '#f2a359'];

        return colours[Math.floor(Math.random() * colours.length)];
    }

    show() {
        let pos = this.body.position;
        let angle = this.body.angle;
        push();
        translate(pos.x, pos.y);
        rotate(angle);
        rectMode(CENTER);
        strokeWeight(1);
        stroke(255)
        fill(this.colour);
        ellipse(0, 0, this.r);
        pop();
    }

    remove() {
        Composite.remove(world, this.body);
    }
}