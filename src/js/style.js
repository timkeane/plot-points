import Style from 'ol/style/Style'
import RegularShape from 'ol/style/RegularShape'
import Stroke from 'ol/style/Stroke'
import Circle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'

const geocode = new Style({
  image: new RegularShape({
    stroke: new Stroke({width: 2}),
    points: 4,
    radius: 10,
    radius2: 0,
    angle: 0
  })
})

const boro = new Style({
  fill: new Fill({color: `rgba(0,0,0,0)`})
})

const location = feature => {
  const date1 = feature.get('date1') || '0000'
  const date2 = feature.get('date2') || '0000'
  const now = new Date().toISOString().split('T')[0]
  const fresh = date1 >= now || date2 >= now
  let fill = feature._added ? 'rgba(0,0,255,.5)' : 'rgba(0,255,0,.5)'
  let stroke = feature._added ? '#0000ff' : '#00ff00'
  if (!fresh) {
    console.warn('Stale Location:', feature.getProperties())
    fill = 'rgba(255,0,0,.5)'
    stroke = '#ff0000'
  }
  return new Style({
    image: new Circle({
      stroke: new Stroke({width: 1, color: stroke}),
      fill: new Fill({color: fill}),
      radius: 8
    })
  })
}

export default {geocode, boro, location}