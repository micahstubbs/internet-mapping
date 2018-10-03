define(['cities'], function(locs) {
  return locs
    .map(function(loc) {
      return {
        text: loc.city + ' (' + loc.country + ')',
        angle: loc.lon,
        weight: +loc.population
      }
    })
    .sort(function(a, b) {
      return b.weight - a.weight
    })
})
