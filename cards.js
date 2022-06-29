

const availableElements = ['apple', 'pear', 'plum', 'cherry'];

function generateSequence(winItem, finishRound) {
    
    if (finishRound<2 || finishRound>8) {
        console.log ('wrong finishRound');
        return;
    }

    const dummies = availableElements.filter((e) => e !== winItem );
    const avail = [3, 3, 3];
    const sequence = [];

    sequence[finishRound] = winItem;        //позиции для winItem
    for (let i=0; i<2; i++) {
        let pos = Math.floor(finishRound*Math.random());
        while (sequence[pos]) {
        pos = (pos+1) % finishRound;
        }
        sequence[pos] = winItem;
    }

    for (let i = 0; i < 12; i++) {
        if (!sequence[i]) {
            let pos = Math.floor(3*Math.random());
            if (i < finishRound) {                  // чтобы не выиграл другой эл.
                while (avail[pos] == 1) {
                    pos = (pos+1) % 3;
                }
            }
            while (avail[pos] == 0) {
                pos = (pos+1) % 3;
            }
            sequence[i] = dummies[pos];
            avail[pos] --;
        }
    }

    console.log(sequence);
    return sequence;
}

