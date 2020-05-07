import Style from 'ol/style/Style'
import RegularShape from 'ol/style/RegularShape'
import Stroke from 'ol/style/Stroke'
import Circle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'

const today = new Date().toISOString().split('T')[0]

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

const getColor = (feature) => {
  const date1 = feature.get('date1')
  const date2 = feature.get('date2')
  if (feature._modified) {
    return 'rgba(0,0,255,.7)' //blue
  }
  if (date1 && date2) {
    if (date1 >= today && date2 >= today) {
    return 'rgba(0,255,0,.7)' //green
    }
    if ((date1 < today && date2 < today)) {
    return 'rgba(255,0,0,.7)' //red
    }
    return 'rgba(255,255,0,.7)' //yellow
  }
  if (date1 >= today || date2 >= today) {
    return 'rgba(0,255,0,.7)' //green
  }
  return 'rgba(255,0,0,.7)' //red
}

const location = feature => {
  const color = getColor(feature)
  return new Style({
    image: new Circle({
      stroke: new Stroke({width: 1, color: '#000'}),
      fill: new Fill({color}),
      radius: 8
    })
  })
}

export default {geocode, boro, location}
