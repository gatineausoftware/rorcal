import { Component } from '@angular/core';
import { Transfer } from './transfer'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {


    title = 'Show Me The Return';
    start_date = this.get_startdate()
    end_date = new Date()
    start_balance = 0;
    end_balance = 0;
    ror = 0;
    transfers = [];

    calculate_end_balance(balances, ror) {
      var total = 0
      var i=0
      var n=balances.length

      while (i < n) {
       total += balances[i]['balance']
        total *= Math.pow(1 + ror, balances[i]['num_days'])
        i++
     }
     return total
    }


calc_ror(balances, end_balance) {


  var upperBound = false
  var lowerBound = false

  var upper = 0
  var lower = 0
  var mid = 0
  var increment = .01 / 365
  var i = 0

  while (i < 1000) {
    i++
    var t = this.calculate_end_balance(balances, mid)
    if(Math.abs(t - end_balance) < .1) {
      return Math.pow(1 + mid, 365) - 1
    }

    if (t <= end_balance) {
      lowerBound = true
      lower = mid
      if (upperBound)
        mid = (lower + upper) / 2
      else
        mid = lower + increment

    }
    else {
      upperBound = true
      upper = mid
      if (lowerBound)
        mid = (lower + upper) / 2
      else
        mid = upper - increment

    }
  }
  return 0
}



  get_days(end_date, start_date) {
    return Math.floor((end_date.getTime() -  start_date.getTime()) / (1000 * 60 * 60 * 24))
  }

  transform_data(start) {
    return function(d) {
      var a;
      if (d.deposit == "true") {
        a = d.amount;
      }
      else {
        a = (-1) * d.amount;
      }
      return {
        t: Math.floor((d.date.getTime() -  start.getTime()) / (1000 * 60 * 60 * 24)),
        date: d.date,
        amount: a
      }

    }
  }


  get_startdate() {
    var today = new Date();
    today.setFullYear(today.getFullYear() -1 )
    return today
  }




  add_transfer() {
    var tr: Transfer = new Transfer(this.start_date, null, null);
    this.transfers.push(tr);
  }

  valid_transfer(t) {
    return t.date != null && t.amount != null && t.deposit != null
  }



  calc() {

    var x = this.transfers.filter(this.valid_transfer).sort((x,y): number => (x.date.getTime() < y.date.getTime()) ? -1 : 1);
    var data = x.map(this.transform_data(this.start_date))


    //var s = y.map(c => c.amount).reduce((sum, current) => sum + current, 0);


    var balances = []
    var n = data.length
    var i = 0
    var a = this.start_balance
    var d = this.start_date

    while (i < n) {
      balances.push({'balance': a, 'num_days': data[i].t})
      a = data[i].amount
      d = data[i].date
      i += 1
    }

    balances.push({'balance' : a, 'num_days' : this.get_days(this.end_date, d)})


    this.ror = this.calc_ror(balances, this.end_balance)


    //this.growth = this.end_balance - s - this.start_balance






  }
}
