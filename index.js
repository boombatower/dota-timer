var running = false;
var tid;
var time = -1;
var timeDiv = $('#time');
var timers = [
  {
    name: 'rune',
    interval: 2 * 60,
    seconds: 0
  },
  {
    name: 'small',
    seconds: 52
  },
  {
    name: 'medium',
    seconds: 53
  },
  {
    name: 'large',
    seconds: 53
  },
  {
    name: 'ancient',
    seconds: 54
  }
];
var timersList = $('#timers');

$.each(timers, function(key, value) {  
  if (!('interval' in value)) {
    value.interval = 60;
  }
  value.delta = value.interval - value.seconds;

  var li = $('<li>')
    .appendTo(timersList);
  $('<label>')
    .text(value.name)
    .appendTo(li);

  var text = '*';
  if (value.interval != 60) {
    // expects intervals evenly divisible by 60 for now
    text += '/' + (value.interval / 60);
  }
  text += ':' + zeroPadd(value.seconds);
  $('<span>')
    .text(text)
    .appendTo(li);
  var progress = $('<progress>')
    .attr('max', value.interval)
    .attr('value', '0')
    .appendTo(li);
  value.progress = progress;
});

updateTime();
$('#settings').toggle(); // hide initially

$('form').submit(function(event) {
  var parts = $('#in').val().split(':');
  var multiplier = 1;
  time = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    time += parseInt(parts[i]) * multiplier;
    multiplier *= 60;
  }
  console.log(time);
  time--; // updateTime() will incrament
  updateTime();
  event.preventDefault();
});

$('#start').click(function() {
  if (!running) {
    tid = window.setInterval(updateTime, 1000);
    running = true;
  }
});

$('#stop').click(function() {
  if (running) {
    clearInterval(tid);
    running = false;
  }
});

// could use hashchange
$('a').click(function() {
  $('#settings').toggle();
});

function updateTime() {
  timeDiv.html(secondsTimeSpanToHMS(++time));

  $.each(timers, function(key, value) {
    var progress = (time + value.delta) % value.interval;
    value.progress.attr('value', progress);

    // to simplify only notify for rune and small
    var sound;
    if ((value.name == 'rune' || value.name == 'small') &&
        value.progress.attr('max') - progress == $('#notification-warning-' + value.name).val() &&
        (sound = $('#notification-' + value.name).val())) {
      new Audio(sound).play();
    }
  });
}

function secondsTimeSpanToHMS(s) {
  var h = Math.floor(s / 3600); // whole hours
  s -= h * 3600;
  var m = Math.floor(s / 60); // remaining minutes
  s -= m * 60;

    // zero pad
  return zeroPadd(h) + ':' + zeroPadd(m) + ':' + zeroPadd(s);
}

function zeroPadd(num) {
  return num < 10 ? '0' + num : num;
}
