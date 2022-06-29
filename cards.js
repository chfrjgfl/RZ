/*
Потрібно написати функцію generateSequence(winItem, finishRound) , що поверне 
послідовність(масив з 12 елементів, в якій має бути рівно по 3 елементи кожного типу 
    на правильних місцях) елементів, по якій власне гравцю будуть видаватись елементи
    (тобто переший вибір - перший елемент послідовності, другий вибір - другий елемент і т.д.). 
winItem це власне виграшний елемент - те, чого людина знайде 3 штуки. 
finishRound - раунд на якому гра завершиться(людина знайде 3 winItem). 
Після завершення гри всі неперевернуті картки перевертаються і показують, що було під ними, 
щоб показати, що все було чесно і всіх елементів було по 3. 
Елементи для невідкритих карток також беруться з  нашої згенерованної послідовності.



const availableElements = [“apple”, ”pear”, ”plum”, ”cherry”];

*/

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

for (let i=2; i<12; i++) {
generateSequence ('plum', i);
}