var Model = require('../src/Model.js');

// Method getInjured, attack
// Variable damage, defence, health

var Soldier = Model.createClass({
    LOWHEALTH: 100,
    EXTREMELOWHEALTH: 20,
    getInjured: function (value) {
        var overDamage = value - this.getState('defence');

        this.setState({
            'health': (overDamage < 0 ? this.getState('health') : this.getState('health') - overDamage)
        });
        if (this.getState('health') < 0) 
            this.destroy();
    },
    attack: function (opposite) {
        var health = this.getState('health');
        var damage = this.getState('damage');

        if (health < this.EXTREMELOWHEALTH) damage *= 2;
        else if (health < this.LOWHEALTH) damage *= 1.5;

        opposite.getInjured(damage);
    }
});

Soldier.addClassStatic({
    onCreated: function () {
        this.SOLDIERNUM =  2;
        this.MAXDAMAGE = 200;
        this.MAXDEFENCE = 50;
        this.MAXHEALTH = 500;
        this.soldierNum = 0;
    },
    generateSoldiers: function () {
        for (var i = 0; i < this.SOLDIERNUM; i++) {
            this.createInstance({
                damage: this.reasonableRandomValue(this.MAXDAMAGE),
                defence: this.reasonableRandomValue(this.MAXDEFENCE),
                health: this.reasonableRandomValue(this.MAXHEALTH),
                pronoun: (Math.random() < 0.8 ? 'his' : 'her'),
                No: i + 1
            });
        };
    },
    chooseOne: function () {
        var keys = Object.keys(this._records);
        return this.getRecord(keys[ keys.length * Math.random() << 0]);
    },
    reasonableRandomValue: function (origin) {
        return Math.floor(0.5 * (1 + Math.random()) * origin);
    }
});


var Allies = Soldier.createClass({});
var Enemy = Soldier.createClass({});

Allies.addClassStatic({
    onRecordCreated: function (allies) {
        this.soldierNum++;
        console.log('A soldier has been created, and now we have %d soldier(s)', this.soldierNum);
        console.log('- Soldier: 来不及解释了快上车!');
    },
    onRecordChanged: function (allies) {
        console.log('Soldier No.%f gets injured, now %s health is %f', allies.getState('No'), allies.getState('pronoun'), allies.getState('health'));
        console.log('- Soldier: 破机车发不动... ');
    },
    onRecordDestroyed: function (allies) {
        this.soldierNum--;
        console.log('Soldier No.%f has been dead, now we have %d soldier(s)', allies.getState('No'), this.soldierNum);
        console.log('- Soldier: 车...开走了吗');
    }
});

Enemy.addClassStatic({
    onRecordCreated: function () {
        this.soldierNum++;
        console.log('- Enemy : Ao!!!!!!!');
    },
    onRecordChanged: function () {
        console.log('- Enemy : Ao!!!!!!!!!!!!!!!!!')
    },
    onRecordDestroyed: function () {
        this.soldierNum--;
        console.log('- Enemy : Ao!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    }
});

Allies.generateSoldiers();
Enemy.generateSoldiers();

while (Allies.soldierNum && Enemy.soldierNum) {
    var allies = Allies.chooseOne();
    var enemy = Enemy.chooseOne();
    allies.attack(enemy);
    if (Enemy.soldierNum)
        enemy.attack(allies);
}

var sign = (Allies.soldierNum > 0 ? 'You win!' : 'You lose.');

console.log("=====result=====\n\n\t%s\n\n================", sign);