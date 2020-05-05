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

const location = feature => {
  const date1 = feature.get('date1') || '0000'
  const date2 = feature.get('date2') || '0000'
  const now = new Date().toISOString().split('T')[0]
  const fresh = date1 > now || date2 > now
  return new Style({
    image: new Circle({
      radius: 8,
      fill: new Fill({
        color: fresh ? 'rgba(0,255,0,.5)' : 'rgba(255,0,0,.5)'
      }),
      stroke: new Stroke({
        width: 1, 
        color: fresh ? '#00ff00' : '#ff0000'
      })
    })
  })
}

export default {geocode, location}