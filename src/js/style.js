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

const location = new Style({
  image: new Circle({
    radius: 8,
    fill: new Fill({color: 'rgba(128,61,141,.7)'}),
    stroke: new Stroke({width: 1, color: '#803D8D'})
  })
})

export default {geocode, location}