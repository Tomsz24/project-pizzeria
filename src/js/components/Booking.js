import { select, templates, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    this.render(element);
    this.initWidgets();
    this.getData();
    this.selectTable();

  }

  render(element) {
    const generateHTML = templates.bookingWidget();
    this.dom = {};
    this.dom.wrapper = element;
    this.dom.wrapper.innerHTML = generateHTML;
    this.dom.peopleAmount = this.dom.wrapper.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = this.dom.wrapper.querySelector(select.booking.hoursAmount);
    this.dom.datePicker = this.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    this.dom.hourPicker = this.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    this.dom.tables = this.dom.wrapper.querySelectorAll(select.booking.tables);
    this.dom.phoneNumber = this.dom.wrapper.querySelector(select.booking.phoneNumber);
    this.dom.address = this.dom.wrapper.querySelector(select.booking.address);
    this.dom.starters = this.dom.wrapper.querySelectorAll(select.booking.starters);
    this.dom.submitForm = this.dom.wrapper.querySelector(select.booking.submitForm);
  }

  initWidgets() {
    this.peopleAmount = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmount = new AmountWidget(this.dom.hoursAmount);
    this.datePicker = new DatePicker(this.dom.datePicker);
    this.hourPicker = new HourPicker(this.dom.hourPicker);

    this.dom.peopleAmount.addEventListener('updated', () => {
      console.log('so far so good');
    });

    this.dom.hoursAmount.addEventListener('updated', () => {
      console.log('so far so good');
    });

    this.dom.wrapper.addEventListener('updated', () => {
      this.updateDOM();
      this.removeSelectTable();
    });

    this.dom.submitForm.addEventListener('submit', event => {
      event.preventDefault();
      this.sendReservation();
    });
  }

  getData() {
    const startDateParam = `${settings.db.dateStartParamKey}=${utils.dateToStr(this.datePicker.minDate)}`;

    const endDateParam = `${settings.db.dateEndParamKey}=${utils.dateToStr(this.datePicker.maxDate)}`;

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const urls = {
      booking: `${settings.db.url}/${settings.db.booking}?${params.booking.join('&')}`,
      eventsCurrent: `${settings.db.url}/${settings.db.event}?${params.eventsCurrent.join('&')}`,
      eventsRepeat: `${settings.db.url}/${settings.db.event}?${params.eventsRepeat.join('&')}`,
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),

    ]).then(allResponses => {
      const bookingResponse = allResponses[0];
      const eventsCurrentResponse = allResponses[1];
      const eventsRepeatResponse = allResponses[2];
      return Promise.all([
        bookingResponse.json(),
        eventsCurrentResponse.json(),
        eventsRepeatResponse.json(),
      ]);
    }).then(([bookings, eventsCurrent, eventsRepeat]) => {
      this.parseData(bookings, eventsCurrent, eventsRepeat);
    });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    this.booked = {};

    for (let item of bookings) {
      this.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      this.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = this.datePicker.minDate;
    const maxDate = this.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          this.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

  }

  makeBooked(date, hour, duration, table) {
    if (typeof this.booked[date] == 'undefined') {
      this.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      if (typeof this.booked[date][hourBlock] == 'undefined') {
        this.booked[date][hourBlock] = [];
      }

      this.booked[date][hourBlock].push(table);

    }

    this.updateDOM();
  }

  updateDOM() {
    this.date = this.datePicker.value;
    this.hour = utils.hourToNumber(this.hourPicker.value);

    let allAvailable = false;

    if (typeof this.booked[this.date] == 'undefined' || typeof this.booked[this.date][this.hour] == 'undefined') {
      allAvailable = true;
    }

    for (let table of this.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (!allAvailable && this.booked[this.date][this.hour].includes(tableId)) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  selectTable() {
    for (let table of this.dom.tables) {
      this.removeSelectTable();
      table.addEventListener('click', (e) => {
        if (e.target.classList.contains(classNames.booking.tableBooked)) {
          return;
        } else {
          for (table of this.dom.tables) {
            if (table.classList.contains('selected')) {
              this.removeSelectTable();
            }
          }
          e.target.classList.add('selected');
        }
      });
    }
  }

  removeSelectTable() {
    for (let table of this.dom.tables) {
      table.classList.remove('selected');
    }
  }

  sendReservation() {
    let selectedTables;
    for (let table of this.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (table.classList.contains('selected')) {
        selectedTables = parseInt(tableId);
      }
    }

    const payload = {
      date: this.datePicker.value,
      hour: this.hourPicker.value,
      table: selectedTables,
      duration: this.hoursAmount.value,
      ppl: this.peopleAmount.value,
      starters: [],
      phone: this.dom.phoneNumber.value,
      address: this.dom.address.value,
    };

    for (let starter of this.dom.starters) {
      const input = starter.querySelector('input');

      if (input.checked) {
        payload.starters.push(input.value);
      }
    }

    const url = '//localhost:3131/booking';
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options).then(response => {
      return response.json();
    }).then(parsedResponse => {
      this.makeBooked(parsedResponse.date, parsedResponse.hour, parsedResponse.duration, parsedResponse.table);
      this.updateDOM();
      console.log('parsedRes', parsedResponse);
    });


    this.hoursAmount.value = settings.amountWidget.defaultValue;
    this.peopleAmount.value = settings.amountWidget.defaultValue;
    for (let starter of this.dom.starters) {
      const input = starter.querySelector('input');
      input.checked = false;
    }
    this.dom.phoneNumber.value = '';
    this.dom.address.value = '';
    for (let table of this.dom.tables) {
      if (table.classList.contains('selected')) {
        table.classList.remove('selected');
      }
    }
  }

}

export default Booking;