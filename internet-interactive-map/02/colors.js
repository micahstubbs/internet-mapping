define([], () => {
  function valueOpacity(value, value_max) {
    if (value == null) {
      value = 1
    }
    return Math.log(value) / Math.log(value_max) * 0.6 + 0.3
  }

  function valueRgb(value, value_max) {
    if (value == null) {
      value = 1
    } else if (value <= 0.000001) {
      value = 0.000001
    }
    const temp = Math.log(value) / Math.log(value_max);
    //var hue = (360*(4+5+temp/8))%360;
    const hue = temp * 0.7 + 0.5; //value;
    const sat = 1;
    const bri = 1;
    //    return "hsl("+hue+",100%,100%)";
    //    bri = .80*temp+.20;
    //var color = "hsl("+hue+","+(100*sat)+"%,"+(100*bri)+"%)";
    const rgb = hsvRgb(hue, sat, bri);
    for (let i = 0; i < 3; i++) {
      rgb[i] = rgb[i].toString(16)
      while (rgb[i].length < 2) {
        rgb[i] = `0${rgb[i]}`
      }
    }
    const color = `#${rgb[0]}${rgb[1]}${rgb[2]}`;
    return color
  }

  function hsvRgb(hue, sat, bri) {
    let h = hue;
    let s = sat;
    let v = bri;
    let r;
    let g;
    let b;
    let i;
    let f;
    let p;
    let q;
    let t;
    if (arguments.length === 1) {
      ;(s = h.s), (v = h.v), (h = h.h)
    }
    i = Math.floor(h * 6)
    f = h * 6 - i
    p = v * (1 - s)
    q = v * (1 - f * s)
    t = v * (1 - (1 - f) * s)
    switch (i % 6) {
      case 0:
        ;(r = v), (g = t), (b = p)
        break
      case 1:
        ;(r = q), (g = v), (b = p)
        break
      case 2:
        ;(r = p), (g = v), (b = t)
        break
      case 3:
        ;(r = p), (g = q), (b = v)
        break
      case 4:
        ;(r = t), (g = p), (b = v)
        break
      case 5:
        ;(r = v), (g = p), (b = q)
        break
    }
    const rgb = [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    return rgb
  }

  return {
    valueRgb,
    valueOpacity
  }
})
