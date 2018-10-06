define(['cities'], locs => locs
  .map(loc => ({
  text: `${loc.city} (${loc.country})`,
  angle: loc.lon,
  weight: +loc.population
}))
  .sort((a, b) => b.weight - a.weight))
