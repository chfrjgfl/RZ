"use strict"

class Worker {

    static isBusy = false;
    static taskLine = [];

    static async do(task) {

        if (!this.isBusy) {

            this.isBusy = true;
            await task();
            this.isBusy = false;

            if (this.taskLine.length > 0) {
                this.do(this.taskLine.shift()); 

            } else return;

        } else this.taskLine.push(task);
    }
}



async function timer (text, time) {
    await new Promise(resolve => setTimeout(resolve, time));
    console.log(text, time);
}

Worker.do(() => timer(1, 1));
Worker.do(() => timer(3, 310));
Worker.do(() => timer(4, 300));
Worker.do(() => timer(5, 250));
Worker.do(() => timer(2, 200));
Worker.do(() => timer(6, 50));