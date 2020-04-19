let cases = [],
        totalDaysSinceFirstCase = 0,
        maxYValue,
        lines,
        finished;

class Line {
  constructor(_type, _color) {
    this.yOffset = random(0, height);
    this.alpha = random(2, 4);
    this.type = _type;
    this.dayCounter = 0;
    this.pointWidth = 2;
    this.lerpA = 0;
    this.lerpB = 0;
    this.lerp1Value = 1;
    this.lerpC = 0;
    this.lerpD = 0;
    this.xStartValue = (2 * this.pointWidth);
    this.yStartValue = (height - this.pointWidth + this.yOffset);
    this.drawIterations = 0;

    this.setColor(_color);
  }

  setColor(_color) {
    this.color = color(_color);
    this.color.setAlpha(this.alpha);
  }

  start() {

  }

  restart() {
    ++this.drawIterations;
    this.dayCounter = 0;

    this.yOffset = random(0, height);

    this.xStartValue = (2 * this.pointWidth);
    this.yStartValue = (height - this.pointWidth - this.yOffset);

    this.lerpA = 0;
    this.lerpB = 0;
    this.lerp1Value = 1;
    this.lerpC = 0;
    this.lerpD = 0;

    if (this.drawIterations > 6) {
      lines.splice(lines.indexOf(this), 1);
    }
  }

  draw() {
    fill(this.color);

    let casesToday = cases[this.dayCounter];

    if (!casesToday) {
      this.restart();
      return;
    }

    let newXValue,
          newYValue;

    if (this.lerp1Value >= 1) {
      this.lerpA = this.xStartValue;
      newXValue = map(this.dayCounter, 1, totalDaysSinceFirstCase, (2 * this.pointWidth), width + 100);
      this.lerpB = newXValue;
      this.xStartValue = newXValue;
      this.lerp1Value = 0.0001;

      this.lerpC = this.yStartValue;
      newYValue = map(casesToday[this.type], 0, maxYValue[this.type], height - this.pointWidth - this.yOffset, 0);
      this.lerpD = newYValue;
      this.yStartValue = newYValue;

      this.dayCounter++;
    }

    let currentX = lerp(this.lerpA, this.lerpB, this.lerp1Value);
    let currentY = lerp(this.lerpC, this.lerpD, this.lerp1Value);

    ellipse(currentX, currentY, this.pointWidth, this.pointWidth);
    this.lerp1Value += 0.01;
  }
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.mousePressed(playOscillator);

  background('#000000');
  noStroke();

  maxYValue = [];
  lines = [];

  $.getJSON("https://pomber.github.io/covid19/timeseries.json", function (data) {
    cases = data['Germany'];
    cases = cases.splice(45); // TODO: remove skip for first 40 days?

    totalDaysSinceFirstCase = cases.length;

    maxYValue['confirmed'] = cases[totalDaysSinceFirstCase - 1]['confirmed'];
    maxYValue['deaths'] = cases[totalDaysSinceFirstCase - 1]['deaths'];
    maxYValue['recovered'] = cases[totalDaysSinceFirstCase - 1]['recovered'];

    for (let i = 0; i < 400; i++) {
      // https://pages.mtu.edu/~suits/notefreqs.html -- em chord
      let color = '#F20505';
      if (Math.random() > 0.7) {
        color = '#FFFFFF';
      }

      lines.push(new Line('deaths', '#025159'));
      lines.push(new Line('recovered', '#05DBF2'));
      lines.push(new Line('confirmed', color));
    }
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
