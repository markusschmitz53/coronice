let cases = [],
        totalDaysSinceFirstCase = 0,
        maxYValue,
        lines;

class Line {
  constructor(_type, _color, _minFrequency) {
    this.type = _type;
    this.color = _color;
    this.playing = false;
    this.dayCounter = 0;
    this.pointWidth = 5;
    this.lerpA = 0;
    this.lerpB = 0;
    this.lerp1Value = 1;
    this.lerpC = 0;
    this.lerpD = 0;
    this.amplification = 0.4;
    this.xStartValue = (2 * this.pointWidth);
    this.yStartValue = (height - this.pointWidth);
    this.minFrequencyForOsci = _minFrequency;

    this.osci = new p5.Oscillator('sine');
    this.osci.amp(this.amplification);
  }

  start() {
    if (this.playing) {
      return;
    }
    this.osci.start();
    this.playing = true;
  }

  draw() {
    if (!this.playing) {
      return;
    }

    fill(this.color);

    let casesToday = cases[this.dayCounter];

    if (!casesToday) {
      this.playing = false;
      this.osci.amp(0.01, 0.5);
      this.osci.stop();
    }

    let newXValue,
          newYValue;

    if (this.lerp1Value >= 1) {
      this.lerpA = this.xStartValue;
      newXValue = map(this.dayCounter, 0, totalDaysSinceFirstCase, (2 * this.pointWidth), width);
      this.lerpB = newXValue;
      this.xStartValue = newXValue;
      this.lerp1Value = 0.01;

      this.lerpC = this.yStartValue;
      newYValue = map(casesToday[this.type], 0, maxYValue[this.type], height - this.pointWidth, 0);
      this.lerpD = newYValue;
      this.yStartValue = newYValue;

      this.dayCounter++;
    }

    let currentX = lerp(this.lerpA, this.lerpB, this.lerp1Value);
    let currentY = lerp(this.lerpC, this.lerpD, this.lerp1Value);

    ellipse(currentX, currentY, this.pointWidth, this.pointWidth);
    this.lerp1Value += 0.06;

    let frequency = map(currentY, height - this.pointWidth, 0, this.minFrequencyForOsci, 8000);

    if (frequency > 2000 && this.amplification > 0.2) {
      this.amplification -= 0.005;
    }
    this.osci.freq(frequency, 0.1);
    this.osci.amp(this.amplification);
  }
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.mousePressed(playOscillator);

  background('#0D0C0C');
  noStroke();

  maxYValue = [];

  lines = [];
  lines[0] = new Line('confirmed', '#FFDB7D', 290);
  lines[1] = new Line('recovered', '#43B5AE', 300);
  lines[2] = new Line('deaths', '#FF7333', 270);

  $.getJSON("https://pomber.github.io/covid19/timeseries.json", function (data) {
    cases = data['Germany'];
    totalDaysSinceFirstCase = cases.length;
    maxYValue['confirmed'] = cases[totalDaysSinceFirstCase - 1]['confirmed'];
    maxYValue['deaths'] = cases[totalDaysSinceFirstCase - 1]['deaths'];
    maxYValue['recovered'] = cases[totalDaysSinceFirstCase - 1]['recovered'];
  });
}

function draw() {
  if (totalDaysSinceFirstCase > 0) {
    for (let i = 0; i < lines.length; i++) {
      lines[i].draw();
    }
  }
}

function playOscillator() {
  for (let i = 0; i < lines.length; i++) {
    lines[i].start();
  }
}
